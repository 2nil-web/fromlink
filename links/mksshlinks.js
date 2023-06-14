var activeX=[];
function callActiveX(AXName, add) {
  if (typeof activeX[AXName] === 'undefined') activeX[AXName]=new ActiveXObject(AXName);
  return activeX[AXName];
}

function fso() { return callActiveX("Scripting.FileSystemObject"); }
function wsh() { return callActiveX("WScript.Shell"); }
function sha() { return callActiveX("Shell.Application"); }
function wsn() { return callActiveX('Wscript.Network'); }
function scc() { return callActiveX('ScriptControl'); }

if (false) {
Shell=new ActiveXObject("WScript.Shell");
DesktopPath=Shell.SpecialFolders("Desktop");
link=Shell.CreateShortcut(DesktopPath + "\\test.lnk");
link.Arguments="1 2 3";
link.Description="test shortcut";
link.HotKey="CTRL+ALT+SHIFT+X";
link.IconLocation="app.exe,1";
link.TargetPath="c:\\blah\\app.exe";
link.WindowStyle=3;
link.WorkingDirectory="c:\\blah";
link.Save();  
}

function curdir() {
  return fso().GetAbsolutePathName(".");
}

function pardir (fold) {
  return fso().GetParentFolderName(fold);
}

function parcurdir () {
  return fso().GetParentFolderName(curdir());
}

WScript.echo("Curr parent dir "+parcurdir());


function mklnk (lpth, tgt, args, desc, hk, wdir, wsty, icn) {
  lnk=wsh().CreateShortcut(lpth);
  lnk.TargetPath=tgt;

  if (typeof args !== 'undefined') lnk.Arguments=args;
  if (typeof desc !== 'undefined') lnk.Description=desc;
  if (typeof hk !== 'undefined')   lnk.HotKey=hk;

  // By default working dir is currentdir
  if (typeof wdir !== 'undefined')   lnk.WorkingDirectory=wdir;

  // 3=Maximized 7=Minimized  4=Normal
  // By default wsty is normal
  if (typeof wsty !== 'undefined')   lnk.WindowStyle=wsty;

  // By default icon is target one.
  if (typeof icn !== 'undefined') lnk.IconLocation=icn;
  lnk.Save();
}

mklnk("tlpalcorr01.lnk", parcurdir()+"\\fromlnk.exe", "sshj.js");
mklnk("git.lnk", parcurdir()+"\\fromlnk.exe", "sshj.js tlpalcorr01");
mklnk("gitasic.lnk", parcurdir()+"\\fromlnk.exe", "sshj.js tlpalcorr01");
mklnk("git-dmz.lnk", parcurdir()+"\\fromlnk.exe", "sshj.js tlpalcorr01");

