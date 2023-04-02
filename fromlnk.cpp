
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

std::wstring s2ws(const std::string s) {
  return std::wstring(s.begin(), s.end());
}

std::string ws2s(const std::wstring& w) {
  std::string s;
  std::transform(w.begin(), w.end(), std::back_inserter(s), [] (wchar_t c) {
      return (char)c;
  });

  return s;
}

std::wstring toShowCmd(int sc) {
  switch (sc) {
    case SW_SHOWNORMAL    : return L"NORMAL";
    case SW_SHOWMAXIMIZED : return L"MAXIMIZED";
    case SW_SHOWMINIMIZED : return L"MINIMIZED";
  }

  return L"Unknown";
}

std::vector<std::wstring> cmdLineToWsVec(std::wstring cmdl) {
  LPWSTR *wav;
  int ac;
  wav=CommandLineToArgvW(cmdl.c_str(), &ac);
  return std::vector<std::wstring>(wav, wav+ac);
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
  for (auto ws : wsv) sv.push_back(ws2s(ws));
  return sv;
}

#define ADDL(lib) res+=s2ws(lib)+szBuffer+L"\n"

/* ResolveIt - Uses the Shell's IShellLink and IPersistFile interfaces to retrieve the informations from an existing shortcut.
  Returns the result of calling the member functions of the interfaces to a wstring.
  wsz - Address of a buffer that contains the path of the link, including the file name. */
std::wstring lnkInfo(LPWSTR wsz) {
  HRESULT hres;
  IShellLink* psl;
  WCHAR szBuffer[MAX_PATH];
  WIN32_FIND_DATA wfd;
  std::wstring res=L"";

  // Get a pointer to the IShellLink interface. It is assumed that CoInitialize has already been called.
  hres=CoCreateInstance(CLSID_ShellLink, NULL, CLSCTX_INPROC_SERVER, IID_IShellLink, (LPVOID*)&psl);
  if (SUCCEEDED(hres)) {
    IPersistFile* ppf;

    // Get a pointer to the IPersistFile interface.
    hres=psl->QueryInterface(IID_IPersistFile, (void**)&ppf);

    if (SUCCEEDED(hres)) {
      // Load the shortcut.
      hres=ppf->Load(wsz, STGM_READ);

      if (SUCCEEDED(hres)) {
        // Resolve the link.
        hres=psl->Resolve(NULL, 0);

        if (SUCCEEDED(hres)) {
          // Get the path to the link target.
          if (SUCCEEDED(psl->GetArguments(szBuffer, MAX_PATH))) ADDL("args: ");
          if (SUCCEEDED(psl->GetPath(szBuffer, MAX_PATH, (WIN32_FIND_DATA*)&wfd, SLGP_SHORTPATH))) ADDL("path: "); // Plus tard essayer SLGP_RAWPATH
          if (SUCCEEDED(psl->GetWorkingDirectory (szBuffer, MAX_PATH))) ADDL("workdir: ");
          int d;
//          if (SUCCEEDED(psl->GetIconLocation(szBuffer, MAX_PATH, &d))) res+=std::wstring(L"Icon: ")+szBuffer+L", index: "+std::to_wstring(d)+L"\n";
          if (SUCCEEDED(psl->GetDescription(szBuffer, MAX_PATH))) ADDL("desc: ");
          if (SUCCEEDED(psl->GetShowCmd(&d))) res+=std::wstring(L"show mode: ")+toShowCmd(d)+L"\n";

        }
      }

      // Release the pointer to the IPersistFile interface.
      ppf->Release();
    }

    // Release the pointer to the IShellLink interface.
    psl->Release();
  }

  return res;
}

std::wstring decompose_path(std::filesystem::path p) {
  std::string s="";
  /* s+="root_name: "+p.root_name().string()+'\n';
  s+="root_directory: "+p.root_directory().string()+'\n';
  s+="root_path: "+p.root_path().string()+'\n';
  s+="relative_path: "+p.relative_path().string()+'\n';
  s+="filename: "+p.filename().string()+'\n';*/

  s+="parent_path: "+p.parent_path().string()+'\n';
  s+="stem: "+p.stem().string()+'\n';
  s+="extension: "+p.extension().string()+'\n';

  return s2ws(s);
}

std::wstring decompose_path(std::wstring str) {
  return decompose_path(std::filesystem::path(ws2s(str)));
}

int WINAPI WinMain(HINSTANCE , HINSTANCE, LPSTR , int) {
  STARTUPINFO si;
  GetStartupInfo(&si);
  std::wstring s=L"";

  std::wstring FullName=s2ws(name+" "+version);
  if (version.find('-') != std::string::npos && commit != "") FullName+=s2ws("+"+commit);
  if (decoration != "") FullName+=s2ws("  "+decoration);

  std::filesystem::path p=std::filesystem::path(si.lpTitle);

  if (p.extension().string() == ".lnk") {
    s+=s2ws("LINK\n")+decompose_path(p);
    HRESULT hres=CoInitialize(NULL);

    if (SUCCEEDED(hres)) {
      std::wstring li=lnkInfo(si.lpTitle);
      if (li != L"") s+=li+L"\n";
    }
  } else {
    std::vector<std::wstring> args=cmdLineToWsVec();
    s+=L"COMMAND\n"+decompose_path(args[0]);

    if (args.size() > 1) {
      s+=L"args: ";
      for (size_t i=1; i < args.size(); i++) s+=args[i]+L" ";
      s+=L"\n";
    }
    s+=s2ws("path: ")+args[0]+L"\n";
    s+=s2ws("workdir: "+std::filesystem::current_path().string()+"\n");
  }

  MessageBox(NULL, s.c_str() , FullName.c_str(), MB_OK);
  return 0;
}

