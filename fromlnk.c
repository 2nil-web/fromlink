
#include <windows.h>
#include <windowsx.h>
#include <shlwapi.h>
#include <strsafe.h>
#include <stringapiset.h>

#include "resource.h"
#include "version.h"

#define MAX_STR 30000

size_t StringLength(const TCHAR *s) {
  size_t l;
  StringCchLength(s, STRSAFE_MAX_CCH, &l);
  return l;
}

int StringEmpty(const TCHAR *s) {
  return (StringLength(s) == 0);
}

const TCHAR *GetAppName() {
  static TCHAR an[MAX_STR];
  static size_t l=0;

  if (l == 0) {
    if ((l=StringLength(an)) == 0) StringCchPrintf(an, MAX_STR, TEXT("%s %s"), name, version);
    if (StrChr(version, L'-') != NULL && StringEmpty(commit)) StringCchPrintf(an, MAX_STR, TEXT("%s+%s"), an, commit);
    if (!StringEmpty(decoration)) StringCchPrintf(an, MAX_STR, TEXT("%s - %s"), an, decoration);
  }

  return an;
}

int MessageBoxApp(UINT uType, const TCHAR *fmt, ...) {
  TCHAR msg[MAX_STR]=TEXT("");
  va_list ap;

  va_start(ap, fmt);
  StringCchVPrintf(msg, MAX_STR, fmt, ap);
  va_end(ap);
  return MessageBox(NULL, msg, GetAppName(), uType);
}

// Affiche l'erreur windows
void WinError(const TCHAR *fmt, ...) {
  TCHAR *lpMsgBuf;
  TCHAR msg[MAX_STR]=TEXT("");
  va_list ap;

  va_start(ap, fmt);
  StringCchVPrintf(msg, MAX_STR, fmt, ap);
  va_end(ap);

  FormatMessage(FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM, NULL, GetLastError(),
      MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT), (LPTSTR)&lpMsgBuf, 0, NULL);
  StringCchCat(msg, MAX_STR, lpMsgBuf);
  LocalFree(lpMsgBuf);
  MessageBoxApp(MB_OK|MB_ICONERROR, msg);
}

#ifdef UNICODE
#define CommandLineToArgv CommandLineToArgvW
#else
PCHAR* CommandLineToArgv(PCHAR CmdLine, int* _argc) {
  PCHAR* argv;
  PCHAR _argv;
  ULONG  len;
  ULONG  argc;
  CHAR  a;
  ULONG  i, j;

  BOOLEAN in_QM;
  BOOLEAN in_TEXT;
  BOOLEAN in_SPACE;

  len=(ULONG)StringLength(CmdLine);
  i=((len+2)/2)*sizeof(PVOID) + sizeof(PVOID);
  argv=(PCHAR*)GlobalAlloc(GMEM_FIXED, i + (len+2)*sizeof(CHAR));
  _argv=(PCHAR)(((PUCHAR)argv)+i);
  argc=0;
  argv[argc]=_argv;
  in_QM=FALSE;
  in_TEXT=FALSE;
  in_SPACE=TRUE;
  i=0;
  j=0;

  while((a=CmdLine[i])) {
    if (in_QM) {
      if (a == '\"') in_QM=FALSE;
      else {
        _argv[j]=a;
        j++;
      }
    } else {
      switch(a) {
      case '\"':
        in_QM=TRUE;
        in_TEXT=TRUE;
        if (in_SPACE) {
          argv[argc]=_argv+j;
          argc++;
        }
        in_SPACE=FALSE;
        break;
      case ' ':
      case '\t':
      case '\n':
      case '\r':
        if (in_TEXT) {
          _argv[j]='\0';
          j++;
        }
        in_TEXT=FALSE;
        in_SPACE=TRUE;
        break;
      default:
        in_TEXT=TRUE;
        if (in_SPACE) {
          argv[argc]=_argv+j;
          argc++;
        }
        _argv[j]=a;
        j++;
        in_SPACE=FALSE;
        break;
      }
    }
    i++;
  }
  _argv[j]='\0';
  argv[argc]=NULL;

  (*_argc)=argc;
  return argv;
}
#endif

TCHAR **StringSplit(const TCHAR *in, TCHAR delm, size_t *num_elm, size_t max) {
    TCHAR *parsestr, **out;
    size_t  cnt=1, i, in_len;

    if (in == NULL || num_elm == NULL) return NULL;

    in_len=StringLength(in);
    if (in_len == 0) return NULL;

    parsestr=(TCHAR *)malloc(in_len+1);
    memcpy(parsestr, in, in_len+1);
    parsestr[in_len]='\0';

    *num_elm=1;
    for (i=0; i < in_len; i++) {
      if (parsestr[i] == delm) (*num_elm)++;
      if (max > 0 && *num_elm == max) break;
    }

    out=(TCHAR **)malloc(*num_elm * sizeof(*out));
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

TCHAR *GetPathValue() {
  DWORD l=GetEnvironmentVariable(TEXT("PATH"), NULL, 0);
  TCHAR *path=(TCHAR *)malloc(l*sizeof(TCHAR));
  GetEnvironmentVariable(TEXT("PATH"), path, l);
  return path;
}

int PathExists(const TCHAR *dir, const TCHAR *cmd, TCHAR **ext) {
  TCHAR path[MAX_STR]=TEXT("");
  StringCchPrintf(path, MAX_STR, TEXT("%s\\%s"), dir, cmd);
  if (PathFileExists(path) == TRUE) return 1;

  // If not found try to find with any extension
  if (PathFindExtension(path)[0] != '.') {
    StringCchCat(path, MAX_STR, TEXT(".*"));
    WIN32_FIND_DATA pdat;

    if (FindFirstFile(path, &pdat) != INVALID_HANDLE_VALUE) {
      *ext=PathFindExtension(pdat.cFileName);

      if (StrCmpC(*ext, TEXT(".lnk")) != 0) return 1;
    }
  }

  return 0;
}

int CheckPath(const TCHAR *dir, const TCHAR *cmd, TCHAR **ext) {
  if (PathExists(dir, cmd, ext)) return 1;
  int ret=0;
  size_t n;
  TCHAR *pv, **tpv;
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

typedef struct SOpts {
  int help;
  int pathcheck;
  int message;
} SOpts;

int options(TCHAR *s, SOpts *opts) {
//#define ASSERT_RET(OPT) if (StrCmpI(s, TEXT("-" #OPT )) == 0 || StrCmpI(s, TEXT("/" #OPT ))) { opts->OPT=TRUE; return TRUE; }
//#define ASSERT_RET(OPT) if (StrCmpI(s, TEXT("-" #OPT )) == 0) { opts->OPT=TRUE; return TRUE; }
#define ASSERT_RET(OPT) if ((s[0] == '-' || s[0] == '/') && StrCmpI(&s[1], TEXT( #OPT )) == 0) { opts->OPT=TRUE; return TRUE; }
  ASSERT_RET(help);
  ASSERT_RET(pathcheck);
  ASSERT_RET(message);
  return FALSE;
}

void help () {
  MessageBoxApp(MB_OK, TEXT("Do not use this program directly\nOnly put it at the start of the target field of a shortcut.\nIt will then execute what follows while adding the shortcut name as the last parameter.\nThis allows a targeted programs to act according to the name and settings of a shortcut."));
}


#ifdef _MSC_VER
int WINAPI WinMain(HINSTANCE h, HINSTANCE hp, LPSTR c, int w)
#endif
#ifdef __GNUC__
int WINAPI WinMain(HINSTANCE , HINSTANCE , LPSTR , int)
#endif
{
  STARTUPINFO si;
  GetStartupInfo(&si);
  TCHAR ftitle[MAX_STR], cmd[MAX_STR]=TEXT(""),  param[MAX_STR]=TEXT(""), cdir[MAX_STR];
  GetFileTitle(si.lpTitle, ftitle, MAX_STR);
  int ac, i;
  LPTSTR *av=CommandLineToArgv(GetCommandLine(), &ac);
  SOpts opts={ FALSE, FALSE, FALSE };

  // First pass for fromlnk parameters (-checkpath, -message ...)
  int narg=0;
  for (i=1; i < ac; i++)
    if (!options(av[i], &opts)) narg++;

  if (opts.help == TRUE) {
    help();
    return 0;
  }

  // Second pass for the arguments to the eventual command if there is one.
  if (narg == 0) { // If there is no argument put the shortcut name in cmd and nothing under param
      StringCchCopy(cmd, MAX_STR, ftitle);
  } else { // Else put the first parameter in cmd, the other in param plus the shortcut name at the end
    narg=0;

    for (i=1; i < ac; i++) {
      if (!options(av[i], &opts)) {
        if (narg == 0) StringCchCopy(cmd, MAX_STR, av[i]);
        else {
          StringCchCat(param, MAX_STR, av[i]);
          StringCchCat(param, MAX_STR, TEXT(" "));
        }

        narg++;
      }
    }

    StringCchCat(param, MAX_STR, ftitle);
  }

  GetCurrentDirectory(MAX_STR, cdir);

  TCHAR av0[MAX_STR];
  StringCchPrintf(av0, MAX_STR, TEXT("%s\\%s"), cdir, cmd);
  if (StrCmpI(av0, av[0]) == 0) { help(); return 0; }

  if (narg < 1 || opts.pathcheck) {
    TCHAR *ext=NULL;

    if (CheckPath(cdir, cmd, &ext) == 0) {
      MessageBoxApp(MB_OK|MB_ICONERROR, TEXT("Could not open %s"), cmd);
      return 0;
    }

    if (ext != NULL) StringCchCat(cmd, MAX_STR, ext);
  }


  TCHAR msg[MAX_STR]=TEXT("");
  if (opts.message) {
    StringCchPrintf(msg, MAX_STR, TEXT("In folder [%s]\nShellExecute of command [%s]"), cdir, cmd);
    if (!StringEmpty(param)) StringCchPrintf(msg, MAX_STR, TEXT("%s\nWith parameters %s"), msg, param);
  }

  if (!opts.message || MessageBoxApp(MB_OKCANCEL, msg) == IDOK) {
    if (ShellExecute(NULL, L"open", cmd, param, cdir, si.wShowWindow) <= (HINSTANCE)32)
      WinError(TEXT("ShellExecute error with %s\\%s\n"), cdir, cmd);
  }

  return 0;
}

