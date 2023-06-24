@echo off

:: Example with 1 rebound
::C:\Software\OpenSSH\ssh.exe -o StrictHostKeyChecking=no -J lalannd2@tlpalcorr01 lalannd2@tlbefgitp02
::start /B sshj.wsf lalannd2 pass_lalannd2 tlpalcorr01   lalannd2 pass_lalannd2 tlbefgitp02

:: Example with 2 rebounds
::C:\Software\OpenSSH\ssh.exe -o StrictHostKeyChecking=no -J lalannd2@tlpalcorr01,bitbuck@tlbefgitp01 lalannd2@tlbefgitp02
::start /B sshj.wsf lalannd2 pass_lalannd2 tlpalcorr01   bitbuck pass_bitbuck tlbefgitp01   lalannd2 pass_lalannd2 tlbefgitp02

:: Example with 3 rebounds
::C:\Software\OpenSSH\ssh.exe -o StrictHostKeyChecking=no -J lalannd2@tlpalcorr01,bitbuck@tlbefgitp01 lalannd2@tlbefgitp02
start /B sshj.wsf lalannd2 pass_lalannd2 tlpalcorr01   bitbuck pass_bitbuck tlbefgitp01   lalannd2 pass_lalannd2 tlbefgitp02   bitbuck pass_bitbuck tlbefgitp01 

