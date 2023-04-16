@echo off

:: Enregistrement de l'agent iycsetup local
:: HKEY_CURRENT_USER\Software\Classes ou HKEY_CLASSES_ROOT

set PROT=ssh
::set PROG="C:\Users\lalannd2\MyApps\Putty\putty.exe -ssh -l %%1 -pw %%2 %%3"
set PROG="C:\Users\lalannd2\MyApps\home\Sources\ssh_protocol\sshprot_debug.js %%1 %%2 %%3"
:: reg delete HKEY_CURRENT_USER\Software\Classes\%PROT% /f
reg add HKEY_CURRENT_USER\Software\Classes\%PROT% /t REG_SZ /d "Run %PROT%" /f
reg add HKEY_CURRENT_USER\Software\Classes\%PROT% /v EditFLags /t REG_DWORD /d 2 /f
reg add HKEY_CURRENT_USER\Software\Classes\%PROT% /v "URL Protocol" /t REG_SZ /f
reg add HKEY_CURRENT_USER\Software\Classes\%PROT%\shell\open\command /t REG_SZ /d %PROG% /f

