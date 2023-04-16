@echo off
setlocal enabledelayedexpansion
set addr=%1
:: drop double quotations from input
set addr=%addr:"=%
:: drop trailing slash (if present)
if %addr:~-1%==/ set addr=%addr:~0,-1%
:: extract 'ssh://' schema because it causes problems with usernames in putty
set schema=%addr:~0,6%
if %schema%==ssh:// (
  :: drop ssh:// schema from beggining of connection string
  set schemaless=%addr:~6%
  rem putty does not work well with ssh and port specified in format '<ip_addr>:<port>' so we split it to '<ip_addr> <port>'
  :: split connection_string into credentials and host
  for /f "tokens=1,2 delims=@" %%a in ("!schemaless!") do (
    set credentials=%%a
    set host=%%b
  )

  if not "!credentials!"=="" (
    if not "!host!"=="" (
      set credentials="!credentials!@"
    ) else (
      set host=!credentials!
      set "credentials="
    )
  )

  :: detect whether we deal with ipv4 or ipv6
  echo !host!|findstr /r /c:"\[*.\]" >nul

  :: replace port delimiter':' in address with blank space
  if errorlevel 1 (
    :: ipv4
    set host=!host::= !
  ) else (
    :: ipv6
    set host=!host:]:=] !
  )

  :: concat credentials and host parts back together
  set "conn_string=!credentials!!host!"
) else (
  set conn_string=%addr%
)

echo %conn_string%
"C:\Users\lalannd2\MyApps\Putty\putty.exe" %conn_string%

