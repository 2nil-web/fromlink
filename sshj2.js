
// Les arguments doivent être fournis par paquets de trois: host user password
// Si il n'y a qu'un paquet de 3 trois on fait un ssh direct
// Sinon on fait un ssh jump avec autant de jump que de paquets de trois
// Le dernier paquet de trois indique la cible (le serveur que l'on veux finalement joindre).
// Exemples :
// sshj host1 user1 pass1 
// sshj host1 user1 pass1 host2 user2 pass2 
// sshj host1 user1 pass1 host2 user2 pass2 host3 user3 pass3 ...
// sshj tlpalcorr01 lalannd2 pass1 tlbefgitp01 bitbuck pass2 tlbefgitp02 lalannd2 pass3
// C:\Software\OpenSSH\ssh.exe -o StrictHostKeyChecking=no -J lalannd2@tlpalcorr01,bitbuck@tlbefgitp01 lalannd2@tlbefgitp02
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

//SSH_CMD='ssh'
SSH_CMD='C:\\Software\\OpenSSH\\ssh.exe'
// Paramètres par paquets de trois
if (arg.count() >= 3 && arg.count()%3 == 0) {
  cmd=SSH_CMD+' -o StrictHostKeyChecking=no ';
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
    wsh().Run(cmd, 1, false);
//    WScript.Sleep(1000);

    for (i=0; i < pass.length; i++) {
      WScript.Sleep(800);
      wsh().SendKeys(pass[i]+"{ENTER}");
    }
  }
} else {
  WScript.echo("Missing parameters.They must be provided by groups of three:\n==> host, user and password.\nIf there is only one group then we run a direct ssh.\nOtherwise we run ssh with as many jumps as necessary to reach the last host, examples:\nsshj host1 user1 pass1\n    ==> will run a direct ssh.\nsshj host1 user1 pass1 host2 user2 pass2\n    ==> will run a ssh jump through host1 to reach host2.\nsshj host1 user1 pass1 host2 user2 pass2 host3 user3 pass3\n    ==> will run a ssh jump through host1, host2 to reach host3.\nAnd so on ...\n\nThen the passwords input is simulated.");
  WScript.quit();
}

