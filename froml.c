
#include <windows.h>
#include <strsafe.h>


void MyWinExec(LPWSTR Cmd, UINT nCmdShow) {
  PROCESS_INFORMATION info;
  STARTUPINFO startup;
  UINT ret;

  memset(&startup, 0, sizeof(startup));
  startup.cb=sizeof(startup);
  startup.dwFlags=STARTF_USESHOWWINDOW;
  startup.wShowWindow=nCmdShow;

  if (CreateProcess(NULL, Cmd, NULL, NULL, FALSE, 0, NULL, NULL, &startup, &info)) {
    CloseHandle(info.hThread);
    CloseHandle(info.hProcess);
  }
}

int WINAPI WinMain(HINSTANCE , HINSTANCE, LPSTR , int nCmdShow) {
  STARTUPINFO si;
  GetStartupInfo(&si);
  wchar_t buf[PATH_MAX], cmd[PATH_MAX];
  GetFileTitle(si.lpTitle, buf, PATH_MAX);
  LPWSTR *av;
  int ac;
  av=CommandLineToArgvW(GetCommandLine(), &ac);
  StringCchCopyW(cmd, PATH_MAX, av[1]);
  StringCchCatW(cmd, PATH_MAX, L" ");
  StringCchCatW(cmd, PATH_MAX, buf);

//  if (MessageBox(NULL, cmd, L"-", MB_OKCANCEL) == IDOK)
    MyWinExec(cmd, nCmdShow);
}

