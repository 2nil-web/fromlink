
// Programme qui permet de passer le nom d'un raccourcis windows (stem, sans l'extension .lnk) en paramètre d'une commande
// Prévoir un mode debug et le choix de placement du stem, actuellement il est placé à la suite de tous les paramètres ...

#include <vector>
#include <string>
#include <filesystem>

#include <windows.h>
#include "shobjidl.h"
#include "shlguid.h"

#include "resource.h"

#ifdef MESSAGE
#include "version.h"

std::wstring toShowCmd(int sc) {
  switch (sc) {
    case SW_SHOWNORMAL      : return L"NORMAL";
    case SW_SHOWMINIMIZED   : return L"MINIMIZED";
    case SW_SHOWMAXIMIZED   : return L"MAXIMIZED";
    case SW_SHOWNOACTIVATE  : return L"NOACTIVATE";
    case SW_SHOW            : return L"SHOW";
    case SW_SHOWMINNOACTIVE : return L"MINNOACTIVE";
    case SW_SHOWNA          : return L"NA";
    case SW_SHOWDEFAULT     : return L"DEFAULT";
  }

  return L"UNKNOWN";
}
#endif

std::vector<std::wstring> cmdLineToWsVec() {
  LPWSTR *wav;
  int ac;
  wav=CommandLineToArgvW(GetCommandLineW(), &ac);
  return std::vector<std::wstring>(wav, wav+ac);
}

// Retrieve informations from the existing shortcut wohse path is provided by the parameter link
void lnkInfo(std::wstring link, std::wstring& argl, std::wstring& wdir, std::wstring& desc, int& show_mode) {
  HRESULT hres;
  IShellLink* psl;
  WCHAR szBuffer[MAX_PATH];

  // Get a pointer to the IShellLink interface. It is assumed that CoInitialize has already been called.
  hres=CoCreateInstance(CLSID_ShellLink, NULL, CLSCTX_INPROC_SERVER, IID_IShellLink, (LPVOID*)&psl);

  if (SUCCEEDED(hres)) {
    IPersistFile* ppf;

    // Get a pointer to the IPersistFile interface.
    hres=psl->QueryInterface(IID_IPersistFile, (void**)&ppf);

    if (SUCCEEDED(hres)) {
      // Load the shortcut.
      hres=ppf->Load(link.c_str(), STGM_READ);

      if (SUCCEEDED(hres)) {
        // Resolve the link.
        hres=psl->Resolve(NULL, 0);

        if (SUCCEEDED(hres)) {
          // Get the path to the link target.
          if (SUCCEEDED(psl->GetArguments(szBuffer, MAX_PATH))) argl=szBuffer;
          if (SUCCEEDED(psl->GetWorkingDirectory(szBuffer, MAX_PATH))) wdir=szBuffer;
          if (SUCCEEDED(psl->GetDescription(szBuffer, MAX_PATH))) desc=szBuffer;
          int d;
          if (SUCCEEDED(psl->GetShowCmd(&d))) show_mode=d;
        }
      }

      // Release the pointer to the IPersistFile interface.
      ppf->Release();
    }

    // Release the pointer to the IShellLink interface.
    psl->Release();
  }
}

void decompose_path(std::filesystem::path p, std::wstring& parent_path, std::wstring& stem, std::wstring& ext) {
  parent_path=p.parent_path().wstring();
  stem=p.stem().wstring();
  ext=p.extension().wstring();
}

void decompose_path(std::wstring path, std::wstring& parent_path, std::wstring& stem, std::wstring& ext) {
  decompose_path(std::filesystem::path(path), parent_path, stem, ext);
}

UINT WINAPI MyWinExec(std::wstring CmdLine, UINT nCmdShow) {
  PROCESS_INFORMATION info;
  STARTUPINFO startup;
  UINT ret;

  memset(&startup, 0, sizeof(startup));
  startup.cb=sizeof(startup);
  startup.dwFlags=STARTF_USESHOWWINDOW;
  startup.wShowWindow=nCmdShow;

  if (CreateProcess( NULL, &CmdLine[0], NULL, NULL, FALSE, 0, NULL, NULL, &startup, &info )) {
    ret=33;
    /* Close off the handles */
    CloseHandle(info.hThread);
    CloseHandle(info.hProcess);
  } else if ((ret=GetLastError()) >= 32) {
    ret=11;
  }

  return ret;
}

int WINAPI WinMain(HINSTANCE , HINSTANCE, LPSTR , int) {
  STARTUPINFO si;
  GetStartupInfo(&si);

  std::wstring path=si.lpTitle, ppath, stem, ext, argl, workdir, desc;
  int show_mode=0;
  std::filesystem::path p=std::filesystem::path(path);
  decompose_path(p, ppath, stem, ext);
  bool is_shortcut=(si.dwFlags == STARTF_TITLEISLINKNAME || ext == L".lnk");

  if (is_shortcut) {
    if (SUCCEEDED(CoInitialize(NULL))) {
      lnkInfo(path, argl, workdir, desc, show_mode);
    }

    argl+=L' '+stem;
  } else {
    std::vector<std::wstring> args=cmdLineToWsVec();
    path=args[0];
    decompose_path(path, ppath, stem, ext);

    if (args.size() > 1) {
      for (size_t i=1; i < args.size(); i++) argl+=args[i]+L" ";
    }

    workdir=std::filesystem::current_path().wstring();
  }

#ifdef MESSAGE
  // Décors de l'appli
  std::wstring AppTitle=name+L' '+version;
  if (version.find(L'-') != std::wstring::npos && !commit.empty()) AppTitle+=L'+'+commit;
  if (!decoration.empty()) AppTitle+=L"  "+decoration;

  std::wstring msg;
  if (is_shortcut) {
    msg=L"LINK\n";
  } else {
    msg=L"COMMAND\n";
  }

  msg+=L"path: "+path+L"\n";
  msg+=L"parent_path: "+ppath+L"\n";

  msg+=L"stem: "+stem;
  if (is_shortcut) {
    msg+=L" (Passed at the end of parameters)";
  }
  msg+=L'\n';

  msg+=L"extension: "+ext+L"\n";
  msg+=L"args: "+argl+L"\n";
  msg+=L"workdir: "+workdir+L"\n";
  if (!desc.empty()) msg+=L"desc: "+desc+L"\n";
  if (show_mode) msg+=L"show mode: "+toShowCmd(show_mode)+L"\n";

  MessageBox(NULL, msg.c_str() , AppTitle.c_str(), MB_OK);
#endif

  MyWinExec(argl, show_mode);
  return 0;
}

