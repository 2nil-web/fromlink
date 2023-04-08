
// Rebaptiser GetStartupPath

#include <windows.h>
#include <windowsx.h>
#include <shlwapi.h>
#include <strsafe.h>
#include <stringapiset.h>

#include "resource.h"

#include "version.h"

wchar_t **StringSplit(const wchar_t *in, wchar_t delm, size_t *num_elm, size_t max)
{
    wchar_t *parsestr, **out;
    size_t  cnt=1, i, in_len;

    if (in == NULL || num_elm == NULL) return NULL;

    StringCchLengthW(in, STRSAFE_MAX_CCH, &in_len);
    parsestr=malloc(in_len+1);
    memcpy(parsestr, in, in_len+1);
    parsestr[in_len]='\0';

    *num_elm=1;
    for (i=0; i < in_len; i++) {
      if (parsestr[i] == delm) (*num_elm)++;
      if (max > 0 && *num_elm == max) break;
    }

    out=malloc(*num_elm * sizeof(*out));
    out[0]=parsestr;

    for (i=0; i < in_len && cnt < *num_elm; i++) {
      if (parsestr[i] != delm) continue;

      /* Add the pointer to the array of elements */
      parsestr[i]='\0';
      out[cnt]=parsestr+i+1;
      cnt++;
    }

    return out;
}

wchar_t *GetPathValue() {
  DWORD l=GetEnvironmentVariable(L"PATH", NULL, 0);
  wchar_t *path=(wchar_t *)malloc(l*sizeof(wchar_t));
  GetEnvironmentVariable(L"PATH", path, l);
  return path;
}

int PathExists(const wchar_t *dir, const wchar_t *cmd, wchar_t **ext) {
  wchar_t path[MAX_PATH]=L"";
  StringCchPrintfW(path, MAX_PATH, L"%s\\%s", dir, cmd);
  if (PathFileExistsW(path) == TRUE) return 1;

  // If not found try to find with any extension
  if (PathFindExtensionW(path)[0] != '.') {
    StringCchCatW(path, MAX_PATH, L".*");
    WIN32_FIND_DATA pdat;

    if (FindFirstFileW(path, &pdat) != INVALID_HANDLE_VALUE) {
      *ext=PathFindExtensionW(pdat.cFileName);

      if (StrCmpCW(*ext, L".lnk") != 0) return 1;
    }
  }

  return 0;
}

int CheckPath(const wchar_t *dir, const wchar_t *cmd, wchar_t **ext) {
  if (PathExists(dir, cmd, ext)) return 1;
  int ret=0;
  size_t n;
  wchar_t *pv, **tpv;
  pv=GetPathValue();
  tpv=StringSplit(pv, ';', &n, 10000);

  for(size_t i=0; i < n; i++) {
    if (PathExists(tpv[i], cmd, ext) != 0) {
      ret=1;
      break;
    }
  }

  free(tpv);
  free(pv);
  return ret;
}

size_t StringLength(const wchar_t s[MAX_PATH]) {
  size_t l;
  StringCchLengthW(s, MAX_PATH, &l);
  return l;
}

const wchar_t *GetAppName() {
  static wchar_t an[MAX_PATH];
  static size_t l=0;

  if (l == 0) {
    if ((l=StringLength(an)) == 0) StringCchPrintfW(an, MAX_PATH, L"%s %s", name, version);
    if (StrChrW(version, L'-') != NULL && StringLength(commit) != 0) StringCchPrintfW(an, MAX_PATH, L"%s+%s", an, commit);
  }

  return an;
}

int MessageBoxApp(UINT uType, const wchar_t *fmt, ...) {
  wchar_t msg[MAX_PATH]=L"";
  va_list ap;

  va_start(ap, fmt);
  StringCchVPrintfW(msg, MAX_PATH, fmt, ap);
  va_end(ap);
  return MessageBox(NULL, msg, GetAppName(), uType);
}

// Affiche l'erreur windows
void WinError(const wchar_t *fmt, ...) {
  wchar_t *lpMsgBuf;
  wchar_t msg[MAX_PATH]=L"";
  va_list ap;

  va_start(ap, fmt);
  StringCchVPrintfW(msg, MAX_PATH, fmt, ap);
  va_end(ap);

  FormatMessage(FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM, NULL, GetLastError(),
      MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT), (LPTSTR)&lpMsgBuf, 0, NULL);
  StringCchCatW(msg, MAX_PATH, lpMsgBuf);
  LocalFree(lpMsgBuf);
  MessageBoxApp(MB_OK|MB_ICONERROR, msg);
}


int WINAPI WinMain(
#ifdef _MSC_VER
HINSTANCE h, HINSTANCE hp, LPSTR c, int w
#endif
#ifdef __GNUC__
HINSTANCE , HINSTANCE , LPSTR , int
#endif
) {
  STARTUPINFO si;
  GetStartupInfo(&si);
  wchar_t ftitle[MAX_PATH], cmd[MAX_PATH]=L"", cdir[MAX_PATH];
  GetFileTitle(si.lpTitle, ftitle, MAX_PATH);
  int ac;
  LPWSTR *av=CommandLineToArgvW(GetCommandLine(), &ac);
  int do_pathcheck=FALSE;
  int do_message=FALSE;

  int narg=0;
  for (int i=1; i < ac; i++) {
    if (StrCmpIW(av[i], L"-pathcheck") == 0) {
      do_pathcheck=TRUE;
    } else if (StrCmpIW(av[i], L"-message") == 0) {
      do_message=TRUE;
    } else {
      narg++;
      StringCchCatW(cmd, MAX_PATH, av[i]);
      if(i < ac-1) StringCchCatW(cmd, MAX_PATH, L" ");
    }
  }

  size_t l=StringLength(cmd);
  if (l > 0) StringCchCatW(cmd, MAX_PATH, L" ");
  StringCchCatW(cmd, MAX_PATH, ftitle);
  GetCurrentDirectory(MAX_PATH, cdir);

  if (narg < 2 || do_pathcheck) {
    wchar_t *ext=NULL;

    if (CheckPath(cdir, cmd, &ext) == 0) {
      MessageBoxApp(MB_OK|MB_ICONERROR, L"Could not open %s", cmd);
      return 0;
    }

    if (ext != NULL) StringCchCatW(cmd, MAX_PATH, ext);
  }

  if (!do_message || MessageBoxApp(MB_OKCANCEL, L"%s %s", cdir, cmd) == IDOK) {
    if (ShellExecuteW(NULL, NULL, cmd, NULL, cdir, si.wShowWindow) <= (HINSTANCE)32)
      WinError(L"ShellExecute error with %s\\%s\n", cdir, cmd);
  }
  return 0;
}

