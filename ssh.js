
var activeX = [];
function callActiveX(AXName, add) {
  if (typeof activeX[AXName] === 'undefined') activeX[AXName] = new ActiveXObject(AXName);
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

if (arg.count() == 3) {
  user1=arg(0);
  host1=arg(1);
  pass1=arg(2);
  cmd="ssh "+user1+"@"+host1;
  wsh().Run(cmd, 9);
  WScript.Sleep(900);    // Give time to load
  wsh().SendKeys(pass1+"{ENTER}"); // Send password
} else if (arg.count() == 6) {
  user1=arg(0);
  host1=arg(1);
  pass1=arg(2);

  user2=arg(3);
  host2=arg(4);
  pass2=arg(5);

  cmd="ssh -J "+user1+"@"+host1+" "+user2+"@"+host2;
  wsh().Run(cmd, 9);

  WScript.Sleep(400);
  wsh().SendKeys(pass1+"{ENTER}");
  WScript.Sleep(800);
  wsh().SendKeys(pass2+"{ENTER}");
} else WScript.echo("Need 3 arguments to make a simple ssh:\n  user host and password.\nOr 6 arguments to make a ssh jump:\n  user host and password for proxy host.\n  and user host and password for target host.");

