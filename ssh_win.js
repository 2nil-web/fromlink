
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
  if (args.count() === 3) {
    cmd+=args(1)+'@'+args(0);
    pass[0]=args(2);
  } else {
    for(i=0; i < args.count(); i+=3) {
      if (i === args.count()-3) cmd+=' ';
      else cmd+='-o ProxyCommand="ssh.exe -W %h:%p ';

      cmd+=args(i+1)+'@'+args(i);
      if (i !== args.count()-3) cmd+='"';
      pass[i/3]=args(i+2);
    }
  }
}

// Option -J in ssh V8 does WORK correctly.
function ssh_prepV8 () {
  if (args.count() === 3) {
    cmd+=args(1)+'@'+args(0);
    pass[0]=args(2);
  } else {
    for(i=0; i < args.count(); i+=3) {
      if (i === 0) cmd+='-J '
      else {
        if (i === args.count()-3) cmd+=' ';
        else cmd+=',';
      }

      cmd+=args(i+1)+'@'+args(i);
      pass[i/3]=args(i+2);
    }
  }
}

function ssh_call() {
  // Paramètres par paquets de trois
  if (args.count() >= 3 && args.count()%3 == 0) {
    sshMajorVersion=SCmd(SSH_CMD+' -V').trim().replace(/OpenSSH.*_(.*), .*/, "$1").replace(/\..*/, "");
    if (sshMajorVersion > 7) ssh_prepV8();
    else ssh_prepV7();

    if (false) {
      msg=cmd+'\n';
      for (i=0; i < pass.length; i++) {
        msg+='['+pass[i]+']';
      }

      WScript.echo('ssh '+sshMajorVersion+': '+msg);
    }

    if (true) {
      wsh().Run(cmd);
      WScript.Sleep(400);

      for (i=0; i < pass.length; i++) {
        WScript.Sleep(800);
        wsh().SendKeys(pass[i]+"{ENTER}");
      }
    }
  } else {
      WScript.echo("Missing parameters.They must be provided by groups of three:\n==> host, user and password.\nIf there is only one group then we run a direct ssh.\nOtherwise we run ssh with as many jumps as necessary to reach the last host, examples:\nsshj host1 user1 pass1\n    ==> will run a direct ssh.\nsshj host1 user1 pass1 host2 user2 pass2\n    ==> will run a ssh jump through host1 to reach host2.\nsshj host1 user1 pass1 host2 user2 pass2 host3 user3 pass3\n    ==> will run a ssh jump through host1, host2 to reach host3.\nAnd so on ...\n\nThen the passwords input is simulated.");
      WScript.quit();
  }
}

ssh_call();

