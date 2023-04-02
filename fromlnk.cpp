
#include <iostream>
#include <functional>
#include <vector>
#include <string>
#include <locale>
#include <codecvt>
#include <filesystem>
#include <windows.h>
#include <windowsx.h>
#include "shobjidl.h"
#include "shlguid.h"
#include "strsafe.h"
                            
#include "version.h"
#include "resource.h"

#ifdef NE_COMPILE_PAS
/* ResolveIt - Uses the Shell's IShellLink and IPersistFile interfaces to retrieve the path and description from an existing shortcut. 

 Returns the result of calling the member functions of the interfaces. 
 Parameters:
 hwnd         - A handle to the parent window. The Shell uses this window to display a dialog box if it needs to prompt the user for more information while resolving the link.
 lpszLinkFile - Address of a buffer that contains the path of the link, including the file name.
 lpszPath     - Address of a buffer that receives the path of the link target, including the file name.
 lpszDesc     - Address of a buffer that receives the description of the Shell link, stored in the Comment field of the link properties.
*/
HRESULT ResolveIt(HWND hwnd, LPCSTR lpszLinkFile, LPWSTR lpszPath, int iPathBufferSize) { 
  HRESULT hres; 
  IShellLink* psl; 
  WCHAR szGotPath[MAX_PATH]; 
  WCHAR szDescription[MAX_PATH]; 
  WIN32_FIND_DATA wfd; 
 
  *lpszPath = 0; // Assume failure 

  // Get a pointer to the IShellLink interface. It is assumed that CoInitialize has already been called. 
  hres = CoCreateInstance(CLSID_ShellLink, NULL, CLSCTX_INPROC_SERVER, IID_IShellLink, (LPVOID*)&psl); 
  if (SUCCEEDED(hres)) { 
    IPersistFile* ppf; 
 
    // Get a pointer to the IPersistFile interface. 
    hres = psl->QueryInterface(IID_IPersistFile, (void**)&ppf); 
    
    if (SUCCEEDED(hres)) { 
      WCHAR wsz[MAX_PATH]; 
 
      // Ensure that the string is Unicode. 
      MultiByteToWideChar(CP_ACP, 0, lpszLinkFile, -1, wsz, MAX_PATH); 
 
      // Add code here to check return value from MultiByteWideChar 
      // for success.
 
      // Load the shortcut. 
      hres = ppf->Load(wsz, STGM_READ); 
      
      if (SUCCEEDED(hres)) { 
        // Resolve the link. 
        hres = psl->Resolve(hwnd, 0); 

        if (SUCCEEDED(hres)) { 
          // Get the path to the link target. 
          hres = psl->GetPath(szGotPath, MAX_PATH, (WIN32_FIND_DATA*)&wfd, SLGP_SHORTPATH); 

          if (SUCCEEDED(hres)) { 
            // Get the description of the target. 
            hres = psl->GetDescription(szDescription, MAX_PATH); 

            if (SUCCEEDED(hres)) {
              hres = StringCbCopy(lpszPath, iPathBufferSize, szGotPath);
              if (SUCCEEDED(hres)) {
                // Handle success
              } else {
                // Handle the error
              }
            }
          }
        } 
      } 

      // Release the pointer to the IPersistFile interface. 
      ppf->Release(); 
    } 

    // Release the pointer to the IShellLink interface. 
    psl->Release(); 
  } 
  return hres; 
}
#endif

std::string decompose_path(std::filesystem::path p) {
  std::string s="";
  /*
  s+="root_name: "+p.root_name().string()+'\n';
  s+="root_directory: "+p.root_directory().string()+'\n';
  s+="root_path: "+p.root_path().string()+'\n';
  s+="relative_path: "+p.relative_path().string()+'\n';
  */
  s+="parent_path: "+p.parent_path().string()+'\n';
  //s+="filename: "+p.filename().string()+'\n';
  s+="stem: "+p.stem().string()+'\n';
  s+="extension : "+p.extension().string()+'\n';

  return s;
}

std::string decompose_path(std::string str) {
  return decompose_path(std::filesystem::path(str));
}


std::vector<std::wstring> cmdLineToWsVec() {
  LPWSTR *wav;
  int ac;
  wav=CommandLineToArgvW(GetCommandLineW(), &ac);

  return std::vector<std::wstring>(wav, wav+ac);
}

std::vector<std::string> cmdLineToSVec() {
    std::vector<std::wstring> wsv=cmdLineToWsVec();
    std::vector<std::string> sv;

    for (auto ws : wsv) {
        std::string str;
        std::transform(ws.begin(), ws.end(), std::back_inserter(str), [](wchar_t c) {
            return (char)c;
            });
        sv.push_back(str);

    }

    return sv;
}

int WINAPI WinMain(HINSTANCE , HINSTANCE, LPSTR , int) {
  STARTUPINFO si;
  GetStartupInfo(&si);
  std::string s="";

  std::string FullName = name+" "+version;
  if (version.find('-') != std::string::npos && commit != "") FullName+='+'+commit;
  if (decoration != "") FullName+="  "+decoration;

  std::filesystem::path p=std::filesystem::path(si.lpTitle);
  if (p.extension().string() == ".lnk") s+="LINK\n"+decompose_path(p)+'\n';

  std::vector<std::string> args=cmdLineToSVec();
  s+="COMMAND\n"+decompose_path(std::string(args[0]));

  if (args.size() > 1) {
    s+="\nARGUMENTS";
    for (size_t i=1; i < args.size(); i++) s+="\narg "+std::to_string(i)+": "+args[i];
  }

  MessageBoxA(NULL, s.c_str() , FullName.c_str(), MB_OK);
  return 0;
}

