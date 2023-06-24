
// ssh command
// V7
//SSH_CMD='ssh.exe'
// V8
SSH_CMD ='C:\\Software\\OpenSSH\\ssh.exe'
SSH_CMD+=' -o StrictHostKeyChecking=no ';

function ssh_trc(cmd, pass) {
  if (false) { // Trace
    msg=cmd+'\n';
    for (i=0; i < pass.length; i++) msg+='['+pass[i]+']';
    WScript.echo(msg);
  }
}

// Option -J in ssh V7 does NOT work correctly so we use -o ProxyCommand.
function do_sshV7(user_host, pass) {
}


sleep_val=narg_val("sleep");
if (sleep_val === null) sleep_val=0.8;

// Option -J in ssh V8 does WORK correctly.
function do_sshV8(user_host, pass) {
  cmd=SSH_CMD+user_host;

  ssh_trc(cmd, pass);

  if (true) {
    wsh().Run(cmd, 1, false);
//    sleep(1);

    for (i=0; i < pass.length; i++) {
      sleep(sleep_val);
      wsh().SendKeys(pass[i]+"{ENTER}");
    }
  }
}

function do_ssh(user_host, pass) {
    sshMajorVersion=SCmd(SSH_CMD+' -V').trim().replace(/OpenSSH.*_(.*), .*/, "$1").replace(/\..*/, "");
    if (sshMajorVersion > 7) do_sshV8(user_host, pass);
    else do_sshV7(user_host, pass);
  
}

function usage_and_die () {
  WScript.echo("Missing parameters.\nThere must be at least one, two or groups of three parameters.\n 1) If only one is provides it defines the host to drectly reach with USERNAME as login and SSHPASS as password (or default).\n 2) If two provided they define the proxy host and the target host to reach with USERNAME as login and SSHPASS as password for both hosts.\n 3) user, password and host.\nIf there is only one group then we run a direct ssh as user@host.\nOtherwise we do as many jumps as necessary to reach the last host.\nExamples:\nsshj.js user pass host\n==> will run a direct ssh as user@host.\nsshj.js user1 pass1 host1 user2 pass2 host2\n==> will run a ssh jump through host1 to reach host2.\nsshj.js host1 user1 pass1 host2 user2 pass2 host3 user3 pass3\n==> will run a ssh jump through host1, host2 to reach host3.\nAnd so on ...\n\nThen the passwords input is simulated as much time as necessary.");
  WScript.quit();
}

def_user=getenv("USERNAME");
def_pass=getenv("SSHPASS");
if (def_pass==="") def_pass=Base64.decode("b2N2ZEJ1bTIh");

switch (argv.length) {
  case 0: // Error no param
    usage_and_die();
    break;
  case 1: // Simple ssh with current USERNAME and default password to host param1
    if (def_user !="") do_ssh(def_user+'@'+argv[0], [ def_pass ]);
    else WScript.echo("Environment variable USERNAME has no value (a).");
    break;
  case 2: // One ssh jump with current USERNAME@param1 as proxy and USERNAME@param2 as target
    if (def_user !="") do_ssh(' -J '+def_user+'@'+argv[0]+' '+def_user+'@'+argv[1], [ def_pass, def_pass ]);
    else WScript.echo("Environment variable USERNAME has no value (b).");
    break;
  default : // Parameters provided by batch of 3 in the form "user password host" to make one simple ssh if exactly 3 parameters or ssh jump if more than 3 parameters.
    if (argv.length%3==0) {
      user_host='';
      var pass=[];

      if (argv.length===3) {
        user_host+=argv[0]+'@'+argv[2];
        pass[0]=argv[1];
      } else {
        for(i=0; i < argv.length; i+=3) {
          if (i===0) {
            user_host+=' -J ';
          } else {
            if (i===argv.length-3) {
              user_host+=' ';
            } else user_host+=',';
          }

          user_host+=argv[i]+'@'+argv[i+2];
          pass[i/3]=argv[i+1];

          //WScript.echo(i+'/'+argv.length+' : '+user_host);
        }
      }

      do_ssh(user_host, pass);
    } else {
      usage_and_die();
    }
    break;
}

