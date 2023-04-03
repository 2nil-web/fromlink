
var activeX = [];
function callActiveX(AXName, add) {
  if (typeof activeX[AXName] === 'undefined') activeX[AXName] = new ActiveXObject(AXName);
  return activeX[AXName];
}

function fso() { return callActiveX("Scripting.FileSystemObject"); }
function wsh() { return callActiveX("WScript.Shell"); }
function sha() { return callActiveX("Shell.Application"); }
function xml() { return callActiveX("Microsoft.XMLDOM"); }
function xht() { return callActiveX("Msxml2.XmlHttp"); }
function ads() { return callActiveX('ADSystemInfo'); }
function wsn() { return callActiveX('Wscript.Network'); }
function loc() { return callActiveX("WbemScripting.SWbemLocator"); }

args="";
for (i=0; i < WScript.arguments.count(); i++) args+=WScript.arguments(i)+" ";
cmd="bash -c \"export SSHPASS=$(base64 -d <<<b2N2ZEJ1bTEyJCoxCg==);sshpass -d 123 ssh -o StrictHostKeyChecking=no -o ProxyCommand='sshpass -e ssh -W %h:%p lalannd2@tlpalcorr01' lalannd2@"+args+" 123<<<$SSHPASS\"";
//WScript.echo(wsh().CurrentDirectory+"\n"+cmd);
sha().ShellExecute("C:\\Software\\UnixTools\\msys64\\msys2.exe", cmd, "", "", 1);

