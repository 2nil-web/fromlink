
var activeX = [];
function callActiveX(AXName, add) {
  if (typeof activeX[AXName]==='undefined') activeX[AXName] = new ActiveXObject(AXName);
  return activeX[AXName];
}

function fso() { return callActiveX("Scripting.FileSystemObject"); }
function wsh() { return callActiveX("WScript.Shell"); }
function sha() { return callActiveX("Shell.Application"); }
function wsn() { return callActiveX('Wscript.Network'); }
function wsn() { return callActiveX('ScriptControl'); }

// trim polyfill
if (!String.prototype.trim) {
  (function() {
    // Make sure we trim BOM and NBSP
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    String.prototype.trim = function() {
      return this.replace(rtrim, '');
    };
  })();
}

var MB = {
  Ok:0, OkCancel:1, AbortRetryIgnore:2, YesNoCancel:3, YesNo:4,
  RetryCancel:5, CancelTryAgainContinue:6,
  Stop:16, Question:32, Exclamation:48, Information:64,
  Default2ndButton:256, Default3rdButton:512,
  Modal:4096, RightAlignText:524288, RightToLeftText:1048576
};

var ID= {
  Ok:1, Cancel:2, Abort:3, Retry:4, Ignore:5, Yes:6, No:7,
  TryAgain:10, Continue:11, TimeOut:-1
};

function alert(s) {
  wsh().Popup(s, 0, WScript.ScriptName, MB.Ok + MB.Information);
}

function confirm(s) {
  rep=wsh().Popup(s, 0, WScript.ScriptName, MB.OkCancel + MB.Question);
  return (rep == ID.Ok);
}

// Return output of external command
function SCmd(cmd) {
  var out_file=fso().GetSpecialFolder(2)+'\\'+fso().GetTempName();
  precmd='cmd /C ';
  var full_cmd=precmd+cmd+' >'+out_file+' 2>&1';
  var ret=wsh().Run(full_cmd, 0, true);

  if (ret != 0) {
    if (fso().FileExists(out_file)) fso().DeleteFile(out_file, true);
    return [];
  }

  var text="";

  if (fso().FileExists(out_file)) {
    if (fso().GetFile(out_file).Size > 0) {
      out=fso().OpenTextFile(out_file, 1);
      text=out.ReadAll();
      out.close();
    }

    fso().DeleteFile(out_file, true);
  }

  return text;
  //return text.split("\n");
}

// ssh command
// V7
SSH_CMD='ssh.exe'
// V8
//SSH_CMD='C:\\Software\\OpenSSH\\ssh.exe'

cmd=SSH_CMD+' -o StrictHostKeyChecking=no ';
var argv=[];
var pass=[];

// Option -J in ssh V7 does NOT work correctly so we use -o ProxyCommand.
function ssh_prepV7 () {
  if (argv.length===3) {
    cmd+=argv[1]+'@'+argv[0];
    pass[0]=argv[2];
  } else {
    for(i=0; i < argv.length; i+=3) {
      if (i===argv.length-3) cmd+=' ';
      else cmd+=' -o ProxyCommand="'+SSH_CMD+' -W %h:%p ';

      cmd+=argv[i+1]+'@'+argv[i];
      if (i !== argv.length-3) cmd+='"';
      pass[i/3]=argv[i+2];
    }
  }
}

// Option -J in ssh V8 does WORK correctly.
function ssh_prepV8 () {
  if (argv.length===3) {
    cmd+=argv[1]+'@'+argv[0];
    pass[0]=argv[2];
  } else {
    for(i=0; i < argv.length; i+=3) {
      if (i===0) cmd+='-J '
      else {
        if (i===argv.length-3) cmd+=' ';
        else cmd+=',';
      }

      cmd+=argv[i+1]+'@'+argv[i];
      pass[i/3]=argv[i+2];
    }
  }
}

// pterm is the putty terminal emulator ery lightweight
// See https://www.chiark.greenend.org.uk/~sgtatham/putty
PTERM_CMD='C:\\Users\\lalannd2\\MyApps\\Putty\\pterm.exe';
// mintty is the cygwin/mingw/msys terminal emulator, its big advantage is to embed graphics in terminal output (sixel, tektronix ..)
// try : GNUTERM=sixel /mingw64/bin/gnuplot -e "splot [x=-3:3] [y=-3:3] sin(x) * cos(y)"
// See https://mintty.github.io/mintty.1.html
//MINTTY_CMD='C:\\Software\\wsltty\\bin\\mintty.exe bash -c ';
MINTTY_CMD='C:\\Software\\UnixTools\\msys64\\usr\\bin\\mintty.exe';

TERM_CMD='raw';

function usage_die() {
  WScript.echo("Missing parameters. They must be provided by groups of three:\n \
==> host, user and password.\n \
If there is only one group then we run a direct ssh.\n \
Otherwise we run ssh with as many jumps as necessary to reach the last host, examples:\n \
sshj host1 user1 pass1\n \
    ==> will run a direct ssh.\n \
sshj host1 user1 pass1 host2 user2 pass2\n \
    ==> will run a ssh jump through host1 to reach host2.\n \
sshj host1 user1 pass1 host2 user2 pass2 host3 user3 pass3\n \
    ==> will run a ssh jump through host1, host2 to reach host3.\n \
And so on ...\n \
\n \
Then the passwords input is simulated.");
  WScript.quit();
}

function ssh_call() {
  if (WScript.Arguments.count() === 0) usage_die();

  if (WScript.Arguments(0) === 'pterm' || WScript.Arguments(0) === 'mintty') {
    TERM_CMD=WScript.Arguments(0);
    arg_start=1;
  } else arg_start=0;

  for (i=arg_start; i < WScript.Arguments.count(); i++) argv[i-arg_start]=WScript.Arguments(i);

  // Apartir d'ici les paramètres doivent être par paquets de trois
  if (argv.length >= 3 && argv.length%3 == 0) {
    sshMajorVersion=SCmd(SSH_CMD+' -V').trim().replace(/OpenSSH.*_(.*), .*/, "$1").replace(/\..*/, "");
    if (sshMajorVersion > 7) ssh_prepV8();
    else ssh_prepV7();

    // Run ssh command under different terminal emulators pterm/putty or mintty or raw cmd console
    if (true) {
      if (TERM_CMD==='pterm') {
        cmd=PTERM_CMD+' -e '+cmd;
      } else if (TERM_CMD==='mintty') {
        cmd=MINTTY_CMD+' '+cmd;
      }

      // Display command just for debug
      if (true) {
        msg=cmd+'\n';
        for (i=0; i < pass.length; i++) msg+='['+pass[i]+']';
        if (!confirm('ssh '+sshMajorVersion+': '+msg)) WScript.quit();
      }

      wsh().Run(cmd);
      // mintty is slower to start because cygwin.dll load time)
      if (TERM_CMD==='mintty') WScript.Sleep(2000);

      for (i=0; i < pass.length; i++) {
        WScript.Sleep(2000);
        wsh().SendKeys(pass[i]+"{ENTER}");
      }
    }
  } else usage_die();
}

ssh_call();

