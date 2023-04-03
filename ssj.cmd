@echo off
start /B msys2.exe bash -c "export SSHPASS=$(base64 -d <<<b2N2ZEJ1bTEyJCoxCg==);sshpass -d 123 ssh -o StrictHostKeyChecking=no -o ProxyCommand='sshpass -e ssh -W %%h:%%p lalannd2@tlpalcorr01' lalannd2@%1 123<<<$SSHPASS"
