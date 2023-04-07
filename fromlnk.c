
// Rebaptiser GetStartupPath

#include <windows.h>
#include <strsafe.h>

#include "resource.h"

//#define MESSAGE
#ifdef MESSAGE
#include "version.h"
#endif

void MyWinExec(LPWSTR Cmd, UINT nCmdShow) {
  PROCESS_INFORMATION info;
  STARTUPINFO startup;

  memset(&startup, 0, sizeof(startup));
  startup.cb=sizeof(startup);
  startup.dwFlags=STARTF_USESHOWWINDOW;
  startup.wShowWindow=nCmdShow;

  if (CreateProcess(NULL, Cmd, NULL, NULL, FALSE, 0, NULL, NULL, &startup, &info)) {
    CloseHandle(info.hThread);
    CloseHandle(info.hProcess);
  }
}

int WINAPI WinMain(HINSTANCE h, HINSTANCE hp, LPSTR c, int nCmdShow) {
  STARTUPINFO si;
  GetStartupInfo(&si);
  wchar_t buf[MAX_PATH], cmd[MAX_PATH]=L"";
  GetFileTitle(si.lpTitle, buf, MAX_PATH);
  LPWSTR *av;
  int ac;
  av=CommandLineToArgvW(GetCommandLine(), &ac);
  for (int i=1; i < ac; i++) {
    StringCchCatW(cmd, MAX_PATH, av[i]);
    StringCchCatW(cmd, MAX_PATH, L" ");
  }

  StringCchCatW(cmd, MAX_PATH, L" ");
  StringCchCatW(cmd, MAX_PATH, buf);

#ifdef MESSAGE
  if (MessageBox(NULL, cmd, L"-", MB_OKCANCEL) == IDOK)
#endif
    MyWinExec(cmd, nCmdShow);

  return 0;
}

