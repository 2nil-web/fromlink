
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

// Fonction raccourcie vers les arguments
function arg(n) { return WScript.arguments(n); }
function arg.count() { return WScript.arguments.count(); }

CMD="C:\\Software\\UnixTools\\msys64\\msys2.exe";
// Paramètres par paquets de trois
if (arg.count() >= 3 && arg.count()%3 == 0) {
  cmd='bash -c \"ssh.exe -o StrictHostKeyChecking=no ';
  var pass=[];

  if (arg.count() === 3) {
    cmd+=arg(1)+'@'+arg(0);
    pass[0]=arg(2);
  } else {
    for(i=0; i < arg.count(); i+=3) {
      if (i === 0) cmd+='-J '
      else {
        if (i === arg.count()-3) cmd+=' ';
        else cmd+=',';
      }

      cmd+=arg(i+1)+'@'+arg(i);
      pass[i/3]=arg(i+2);
    }
  }

  if (false) {
    msg=cmd+'\n';
    for (i=0; i < pass.length; i++) {
      msg+='['+pass[i]+']';
    }

    WScript.echo(msg);
  }

  if (true) {
//    wsh().Run(cmd, 9, false);
    sha().ShellExecute(CMD, cmd+'\" >/dev/null', "", "", 1);
    WScript.Sleep(3000);

    for (i=0; i < pass.length; i++) {
      WScript.Sleep(800);
      wsh().SendKeys(pass[i]+"{ENTER}");
    }
  }
} else {
  WScript.echo("Missing parameters.They must be provided by groups of three:\n==> host, user and password.\nIf there is only one group then we run a direct ssh.\nOtherwise we run ssh with as many jumps as necessary to reach the last host, examples:\nsshj host1 user1 pass1\n    ==> will run a direct ssh.\nsshj host1 user1 pass1 host2 user2 pass2\n    ==> will run a ssh jump through host1 to reach host2.\nsshj host1 user1 pass1 host2 user2 pass2 host3 user3 pass3\n    ==> will run a ssh jump through host1, host2 to reach host3.\nAnd so on ...\n\nThen the passwords input is simulated.");
  WScript.quit();
}
//msys_ssh.js tlpalcorr01 $USERNAME MDP_LINUX tlbefgitp01 $USERNAME MDP_LINUX tlbefgitp02 $USERNAME MDP_LINUX
//msys_ssh.js tlpalcorr01 %USERNAME% MDP_LINUX tlbefgitp01 %USERNAME% MDP_LINUX tlbefgitp02 %USERNAME% MDP_LINUX

