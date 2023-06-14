
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
function scc() { return callActiveX('ScriptControl'); }

var Base64 = {
  // private property
  _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  is : function (s) {
    var b64re = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    return b64re.test(s);
  },
  
  // public method for encoding
  encode : function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
    input = this._utf8_encode(input);

    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
    }

    return output;
  },

  // public method for decoding
  decode : function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {
      enc1 = this._keyStr.indexOf(input.charAt(i++));
      enc2 = this._keyStr.indexOf(input.charAt(i++));
      enc3 = this._keyStr.indexOf(input.charAt(i++));
      enc4 = this._keyStr.indexOf(input.charAt(i++));
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
      output = output + String.fromCharCode(chr1);

      if (enc3 != 64) output = output + String.fromCharCode(chr2);
      if (enc4 != 64) output = output + String.fromCharCode(chr3);
    }

    output = this._utf8_decode(output);
    return output;
  },

  // private method for UTF-8 encoding
  _utf8_encode : function (str) {
    str = str.replace(/\r\n/g,"\n");
    var utftext = "";

    for (var n = 0; n < str.length; n++) {
      var c = str.charCodeAt(n);

      if (c < 128) utftext += String.fromCharCode(c);
      else if((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }

    return utftext;
  },

  // private method for UTF-8 decoding
  _utf8_decode : function (utftext) {
    var str = "";
    var i = 0;
    var c = 0, c1 = 0, c2 = 0;

    while ( i < utftext.length ) {
      c = utftext.charCodeAt(i);

      if (c < 128) {
        str += String.fromCharCode(c);
        i++;
      } else if((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i+1);
        str += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i+1);
        c3 = utftext.charCodeAt(i+2);
        str += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }

    return str;
  }
};

// Fonction raccourcie vers les arguments
function arg(n) { return WScript.arguments(n); }
function arg.count() { return WScript.arguments.count(); }

// Return empty string if env var does not exists or has empty value
function getenv (name) {
  varname="%"+name+"%";
  varval=wsh().ExpandEnvironmentStrings(varname);
  if (varval == varname) return "";
  return varval;
}


//SSH_CMD='ssh'
SSH_CMD='C:\\Software\\OpenSSH\\ssh.exe'
function do_ssh (user_host, pass) {
  cmd=SSH_CMD+' -o StrictHostKeyChecking=no '+user_host;

  if (false) { // Trace
    msg=cmd+'\n';
    for (i=0; i < pass.length; i++) msg+='['+pass[i]+']';
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
}

function usage_and_die () {
  WScript.echo("Missing parameters.\nThere must be at least one, two or groups of three parameters.\n 1) If only one is provides it defines the host to drectly reach with USERNAME as login and SSHPASS as password (or default).\n 2) If two provided they define the proxy host and the target host to reach with USERNAME as login and SSHPASS as password for both hosts.\n 3) user, password and host.\nIf there is only one group then we run a direct ssh as user@host.\nOtherwise we do as many jumps as necessary to reach the last host.\nExamples:\nsshj.js user pass host\n    ==> will run a direct ssh as user@host.\nsshj.js user1 pass1 host1 user2 pass2 host2\n    ==> will run a ssh jump through host1 to reach host2.\nsshj.js host1 user1 pass1 host2 user2 pass2 host3 user3 pass3\n    ==> will run a ssh jump through host1, host2 to reach host3.\nAnd so on ...\n\nThen the passwords input is simulated as much time as necessary.");
  WScript.quit();
}

def_user=getenv("USERNAME");
def_pass=getenv("SSHPASS");
if (def_pass === "") def_pass=Base64.decode("b2N2ZEJ1bTIh");

switch (arg.count()) {
  case 0: // Error no param
    usage_and_die();
    break;
  case 1: // Simple ssh with current USERNAME and default password to host param1
    if (def_user != "") do_ssh(def_user+'@'+arg(0), [ def_pass ]);
    else WScript.echo("Environment variable USERNAME has no value (a).");
    break;
  case 2: // One ssh jump with current USERNAME@param1 as proxy and USERNAME@param2 as target
    if (def_user != "") do_ssh(' -J '+def_user+'@'+arg(0)+' '+def_user+'@'+arg(1), [ def_pass, def_pass ]);
    else WScript.echo("Environment variable USERNAME has no value (b).");
    break;
  default : // Parameters provided by batch of 3 in the form "user password host" to make one simple ssh if exactly 3 parameters or ssh jump if more than 3 parameters.
    if (arg.count()%3 == 0) {
      user_host='';
      var pass=[];

      if (arg.count() === 3) {
        user_host+=arg(0)+'@'+arg(2);
        pass[0]=arg(1);
      } else {
        for(i=0; i < arg.count(); i+=3) {
          if (i === 0) {
            user_host+=' -J ';
          } else {
            if (i === arg.count()-3) {
              user_host+=' ';
            } else user_host+=',';
          }

          user_host+=arg(i)+'@'+arg(i+2);
          pass[i/3]=arg(i+1);

          //WScript.echo(i+'/'+arg.count()+' : '+user_host);
        }
      }

      do_ssh(user_host, pass);
    } else {
      usage_and_die();
    }
    break;
}

