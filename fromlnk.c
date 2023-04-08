
// Rebaptiser GetStartupPath

#include <windows.h>
#include <windowsx.h>
#include <shlwapi.h>
#include <strsafe.h>
#include <stringapiset.h>

#include "resource.h"

#define MESSAGE
#ifdef MESSAGE
#include "version.h"
#endif

wchar_t **str_split(const wchar_t *in, wchar_t delm, size_t *num_elm, size_t max)
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
  StringCchCopyW(path, MAX_PATH, dir);
  StringCchCatW(path, MAX_PATH, L"\\");
  StringCchCatW(path, MAX_PATH, cmd);

  if (PathFileExistsW(path) == TRUE) return 1;
//  if (ext == NULL) return 0;

  // If not found try to find with any extension
  StringCchCatW(path, MAX_PATH, L".*");
  WIN32_FIND_DATA pdat;
  if (FindFirstFileW(path, &pdat) != INVALID_HANDLE_VALUE) {
    *ext=PathFindExtensionW(pdat.cFileName);
    MessageBox(NULL, path, *ext, MB_OK);

    if (CompareStringW(LOCALE_USER_DEFAULT, 0, *ext, 4, L".lnk", 4) == CSTR_EQUAL) return 0;
    else {
      return 1;
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
  tpv=str_split(pv, ';', &n, 10000);

  for(int i=0; i < n; i++) {
    if (PathExists(tpv[i], cmd, ext)) {
      MessageBox(NULL, tpv[i], cmd, MB_OK);
      ret=1;
      break;
    }
  }

  free(tpv);
  free(pv);

  return ret;
}


// Affiche l'erreur windows
void WinError(const wchar_t *fmt, ...) {
  wchar_t *lpMsgBuf;
  wchar_t title[MAX_PATH];
  va_list ap;

  va_start(ap, fmt);
  _vsnwprintf_s(title, MAX_PATH, MAX_PATH, fmt, ap);
  va_end(ap);

  FormatMessage(FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM, NULL, GetLastError(),
      MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT), (LPTSTR)&lpMsgBuf, 0, NULL);

  MessageBox(NULL, lpMsgBuf, title, MB_OK|MB_ICONERROR);
  LocalFree(lpMsgBuf);
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

  for (int i=1; i < ac; i++) {
    StringCchCatW(cmd, MAX_PATH, av[i]);
    if(i < ac-1) StringCchCatW(cmd, MAX_PATH, L" ");
  }

  size_t l;
  StringCchLengthW(cmd, MAX_PATH, &l);
  if (l > 0) StringCchCatW(cmd, MAX_PATH, L" ");
  StringCchCatW(cmd, MAX_PATH, ftitle);

  GetCurrentDirectory(MAX_PATH, cdir);

  wchar_t *ext=NULL;
  if (CheckPath(cdir, cmd, &ext) == 0) {
    wchar_t msg[MAX_PATH]=L"Could not open ";
    StringCchCatW(msg, MAX_PATH, cmd);

    MessageBox(NULL, msg, L"-", MB_OK|MB_ICONERROR);
    return 0;
  }

  if (ext != NULL) StringCchCatW(cmd, MAX_PATH, ext);

#ifdef MESSAGE
  if (MessageBox(NULL, cdir, cmd, MB_OKCANCEL) == IDOK)
#endif
  {
    if (ShellExecuteW(NULL, NULL, cmd, NULL, cdir, si.wShowWindow) <= (HINSTANCE)32) {
      WinError(L"%s\\%s", cdir, cmd);
    }
  }
  return 0;
}

