
var activeX=[];
function callActiveX(AXName, add) {
  if (typeof activeX[AXName] === 'undefined') activeX[AXName]=new ActiveXObject(AXName);
  return activeX[AXName];
}

function fso() { return callActiveX("Scripting.FileSystemObject"); }
function wsh() { return callActiveX("WScript.Shell"); }
function sha() { return callActiveX("Shell.Application"); }
function wsn() { return callActiveX('Wscript.Network'); }
function wsn() { return callActiveX('ScriptControl'); }

// Example from keepass
// sshjump.js {USER} {PROXY} {PASSWORD} {USER} {URL} {PASSWORD}
// Example from cmd
// sshjump.js denis home.dplalanne.fr xvblf1 denis 217.160.225.152 xvblf1
function arg(n) { return WScript.arguments(n); }
function arg.count() { return WScript.arguments.count(); }

/* styles:
 * 0: HIDE
 * 1: NORMAL
 * 2: MINIMIZED
 * 3: MAXIMIZED
 */
function create_shortcut (name, dir, sty, des, hke, ico) {
  wdir=typeof wdir !== "undefined" ? wdir : "";
  styl=typeof styl !== "undefined" ? styl : 1;
  desc=typeof desc !== "undefined" ? desc : "";
  hkey=typeof hkey !== "undefined" ? hkey : "";
  icon=typeof icon !== "undefined" ? icon : "";

  if (wdir === "") wdir=wsh().CurrentDirectory;
  path=wdir+"\\"+name+".lnk";
  WScript.echo("wdir ["+wdir+"], path "+path);
  lnk=wsh().CreateShortcut(path);
  lnk.TargetPath="C:\\Software\\UnixTools\\bin\\fromlnk.exe";
  lnk.Arguments="sshpass.js";
  lnk.WorkingDirectory=wdir;
  lnk.WindowStyle=styl;
  if (desc === "") lnk.Description=desc;
  //lnk.IconLocation=icon;
  if (hkey === "") lnk.Hotkey=hkey; "CTRL+SHIFT+F";
  lnk.Save();

msg ="targetpath       : "+lnk.targetpath+"\n";
msg+="description      : "+lnk.description+"\n";
msg+="iconlocation     : "+lnk.iconlocation+"\n";
msg+="hotkey           : "+lnk.hotkey+"\n";
msg+="windowstyle      : "+lnk.windowstyle+"\n";
msg+="workingdirectory : "+lnk.workingdirectory+"\n";
WScript.echo(msg);
  
}

create_shortcut("befad0896", "C:\Software\UnixTools\bin\fromlnk.exe sshpass.js");
