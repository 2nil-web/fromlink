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

var final_msg="Creating shortcuts:\n";
var imsg=1;
target=parcurdir()+"\\fromlnk.exe";
// From https://www.vbsedit.com/html/e6ac108b-15f6-4a54-891f-589e8b687ace.asp
function mklnk (lpth, args, desc, hk, wdir, wsty, icn) {
  lnk=wsh().CreateShortcut(lpth+".lnk");
  lnk.TargetPath=target;

  lnk.Arguments="sshj.js";
  if (typeof args !== 'undefined') lnk.Arguments+=" "+args;

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

  final_msg+=imsg+": "+lpth+"\n";
  imsg++;
}


// Sans rebond
function mkl0(nam) {
  mklnk(nam);
}
mkl0("capalcorp01");
mkl0("capalscnp01");
mkl0("tlpalcorr01");
mkl0("tlpalscnr01");

// Avec 1 rebond
function mkl1(nam) {
  mklnk(nam, "tlpalcorr01");
}

//mkl1("cagitxp01");

mkl1("cabefnfsp02");
mkl1("casccd02");
mkl1("git");
mkl1("gitasic");
mkl1("git-dmz"); /* <=> */ mkl1("cagitxp02");
mkl1("jenkins-argos-tls");
mkl1("jenkins-ccsl-tls"); /* <=> */ mkl1("tlbefjenccslp02");
mkl1("tlbefarmp02a");
mkl1("tlbefjenccslp02");
mkl1("tlbefnfsp02");
mkl1("tlbefxrad01");

// EF
mkl1("befad0896");
mkl1("befad0979");
mkl1("befad0987");


WScript.echo(final_msg);
