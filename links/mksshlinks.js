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


function curdir() {
  return fso().GetAbsolutePathName(".");
}

function pardir (fold) {
  return fso().GetParentFolderName(fold);
}

function parcurdir () {
  return fso().GetParentFolderName(curdir());
}

// From https://www.vbsedit.com/html/e6ac108b-15f6-4a54-891f-589e8b687ace.asp
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

target=parcurdir()+"\\fromlnk.exe";
// Sans rebond
mklnk("capalcorp01.lnk", target, "sshj.js");
mklnk("capalscnp01.lnk", target, "sshj.js");
mklnk("tlpalcorr01.lnk", target, "sshj.js");
mklnk("tlpalscnr01.lnk", target, "sshj.js");

// Avec 1 rebond
mklnk("git.lnk",         target, "sshj.js tlpalcorr01");
mklnk("gitasic.lnk",     target, "sshj.js tlpalcorr01");
mklnk("git-dmz.lnk",     target, "sshj.js tlpalcorr01");
mklnk("tlbefxrad01.lnk",     target, "sshj.js tlpalcorr01");
mklnk("tlbefjenccslp02.lnk",     target, "sshj.js tlpalcorr01");
/*
cagitxp02 <=> git-dmz
casccd02

jenkins-argos-tls
jenkins-ccsl-tls <=> tlbefjenccslp02
tlbefxrad01
*/
