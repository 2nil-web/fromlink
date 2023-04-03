
var activeX = [];
function callActiveX(AXName, add) {
  if (typeof activeX[AXName] === 'undefined') activeX[AXName] = new ActiveXObject(AXName);
  return activeX[AXName];
}

function fso() { return callActiveX("Scripting.FileSystemObject"); }
function wsh() { return callActiveX("WScript.Shell"); }
function sha() { return callActiveX("Shell.Application"); }

// Actually does not create a shortcut if it already exist, just read it.
var lnk=wsh().CreateShortcut("C:\\Users\\lalannd2\\MyApps\\ssh\\links\\TOTO.lnk");
var msg="";
//msg+="My args: "+WScript.Arguments.Items(1)+"\n";
msg+="My fullname: "+WScript.FullName+"\n";
msg+="My name: "+WScript.Name+"\n";
msg+="My path: "+WScript.Path+"\n";
msg+="My scriptname: "+WScript.ScriptName+"\n";
msg+="My scriptfullname: "+WScript.ScriptFullName+"\n";
msg+="basename: "+fso().GetBaseName (".")+"\n";
msg+="filename: "+fso().GetFileName (".")+"\n";
msg+="dirname: "+fso().GetAbsolutePathName(".");

/*
msg+="basename: "+fso().GetBaseName (lnk.fullname)+"\n";
msg+="filename: "+fso().GetFileName (lnk.fullname)+"\n";
msg+="fullname: "+lnk.fullname+"\n";
msg+="targetpath: "+lnk.targetpath+"\n";
msg+="arguments: "+lnk.arguments+"\n";
msg+="description: "+lnk.description+"\n";
msg+="iconlocation: "+lnk.iconlocation+"\n";
msg+="hotkey: "+lnk.hotkey+"\n";
msg+="windowstyle: "+lnk.windowstyle+"\n";
msg+="workingdirectory: "+lnk.workingdirectory+"\n";
*/
WScript.echo(msg);

cmd="bash -c \"export SSHPASS=$(base64 -d <<<b2N2ZEJ1bTEyJCoxCg==);sshpass -d 123 ssh -o StrictHostKeyChecking=no -o ProxyCommand='sshpass -e ssh -W %h:%p lalannd2@tlpalcorr01' lalannd2@"+fso().GetBaseName (lnk.fullname)+" 123<<<$SSHPASS\"";

//WScript.echo(wsh().CurrentDirectory+"\n"+cmd);
//sha().ShellExecute("C:\\Software\\UnixTools\\msys64\\msys2.exe", cmd, "", "", 1);

