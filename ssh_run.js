
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

// Arguments du script
var args=WScript.Arguments;

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
SSH_CMD='ssh.exe'
//SSH_CMD='C:\\Software\\OpenSSH\\ssh.exe'

cmd=SSH_CMD+' -o StrictHostKeyChecking=no ';
var pass=[];

// Option -J in ssh V7 does NOT work correctly.
function ssh_prepV7 () {
  if (args.count()===3) {
    cmd+=args(1)+'@'+args(0);
    pass[0]=args(2);
  } else {
    for(i=0; i < args.count(); i+=3) {
      if (i===args.count()-3) cmd+=' ';
      else cmd+='-o ProxyCommand="ssh.exe -W %h:%p ';

      cmd+=args(i+1)+'@'+args(i);
      if (i !== args.count()-3) cmd+='"';
      pass[i/3]=args(i+2);
    }
  }
}

// Option -J in ssh V8 does WORK correctly.
function ssh_prepV8 () {
  if (args.count()===3) {
    cmd+=args(1)+'@'+args(0);
    pass[0]=args(2);
  } else {
    for(i=0; i < args.count(); i+=3) {
      if (i===0) cmd+='-J '
      else {
        if (i===args.count()-3) cmd+=' ';
        else cmd+=',';
      }

      cmd+=args(i+1)+'@'+args(i);
      pass[i/3]=args(i+2);
    }
  }
}

// pterm is the putty terminal emulator ery lightweight
// See https://www.chiark.greenend.org.uk/~sgtatham/putty
PTERM_CMD='C:\\Users\\lalannd2\\MyApps\\Putty\\pterm.exe';
// mintty is the cygwin/mingw/msys terminal emulator, its big advantage is to embed graphics in terminal output (sixel, tektronix ..)
// try : GNUTERM=sixel /mingw64/bin/gnuplot -e "splot [x=-3:3] [y=-3:3] sin(x) * cos(y)"
// See https://mintty.github.io/mintty.1.html
MINTTY_CMD='C:\\Software\\mintty\\bin\\mintty.exe';

function ssh_call() {
  // Paramètres par paquets de trois
  if (args.count() >= 3 && args.count()%3 == 0) {
    sshMajorVersion=SCmd(SSH_CMD+' -V').trim().replace(/OpenSSH.*_(.*), .*/, "$1").replace(/\..*/, "");
    if (sshMajorVersion > 7) ssh_prepV8();
    else ssh_prepV7();

    // Act differently if basename is ssh_pterm or ssh_mintty
    bname=WScript.ScriptName.replace(/\.js/, "");

    // Display command just for debug
    if (true) {
      msg=bname+'\n'+cmd+'\n';
      //for (i=0; i < pass.length; i++) msg+='['+pass[i]+']';
      WScript.echo('ssh '+sshMajorVersion+': '+msg);
    }

    // Run ssh command under different terminal emulators pterm/putty or mintty or raw cmd console
    if (true) {
      if (bname==='ssh_pterm') {
        cmd=PTERM_CMD+' -e '+cmd;
      } else if (bname==='ssh_mintty') {
        cmd=MINTTY_CMD+' '+cmd;
      }

      wsh().Run(cmd);
      // mintty is slower to start because cygwin.dll load time)
      if (bname==='ssh_mintty') WScript.Sleep(2000);

      for (i=0; i < pass.length; i++) {
        WScript.Sleep(1000);
        wsh().SendKeys(pass[i]+"{ENTER}");
      }
    }
  } else {
      WScript.echo("Missing parameters.They must be provided by groups of three:\n==> host, user and password.\nIf there is only one group then we run a direct ssh.\nOtherwise we run ssh with as many jumps as necessary to reach the last host, examples:\nsshj host1 user1 pass1\n    ==> will run a direct ssh.\nsshj host1 user1 pass1 host2 user2 pass2\n    ==> will run a ssh jump through host1 to reach host2.\nsshj host1 user1 pass1 host2 user2 pass2 host3 user3 pass3\n    ==> will run a ssh jump through host1, host2 to reach host3.\nAnd so on ...\n\nThen the passwords input is simulated.");
      WScript.quit();
  }
}

ssh_call();

