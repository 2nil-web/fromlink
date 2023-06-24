
// ### Win32 and COM API ###
var activeX=[];
function callActiveX(AXName) {
  if (typeof activeX[AXName]==='undefined') activeX[AXName]=new ActiveXObject(AXName);
  return activeX[AXName];
}

function fso() { return callActiveX("Scripting.FileSystemObject"); }
function wsh() { return callActiveX("WScript.Shell"); }
function sha() { return callActiveX("Shell.Application"); }
function wsn() { return callActiveX('Wscript.Network'); }
function scc() { return callActiveX('ScriptControl'); }

var MB={
  Ok:0, OkCancel:1, AbortRetryIgnore:2, YesNoCancel:3, YesNo:4,
  RetryCancel:5, CancelTryAgainContinue:6,
  Stop:16, Question:32, Exclamation:48, Information:64,
  Default2ndButton:256, Default3rdButton:512,
  Modal:4096, RightAlignText:524288, RightToLeftText:1048576
};

var ID={
  Ok:1, Cancel:2, Abort:3, Retry:4, Ignore:5, Yes:6, No:7,
  TryAgain:10, Continue:11, TimeOut:-1
};
// ### End Win32 and COM API ###

// ### Polyfills ###
// trim
if (!String.prototype.trim) {
  (function() {
    // Make sure we trim BOM and NBSP
    var rtrim=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    String.prototype.trim=function() {
      return this.replace(rtrim, '');
    };
  })();
}

function alert(s) {
  wsh().Popup(s, 0, WScript.ScriptName, MB.Ok + MB.Information);
}

function confirm(s) {
  rep=wsh().Popup(s, 0, WScript.ScriptName, MB.OkCancel + MB.Question);
  return (rep==ID.Ok);
}

// Base64 encoding and decoding
var Base64={
  // private property
  _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  is : function (s) {
    var b64re=/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    return b64re.test(s);
  },
  
  // public method for encoding
  encode : function (input) {
    var output="";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i=0;
    input=this._utf8_encode(input);

    while (i < input.length) {
      chr1=input.charCodeAt(i++);
      chr2=input.charCodeAt(i++);
      chr3=input.charCodeAt(i++);
      enc1=chr1 >> 2;
      enc2=((chr1 & 3) << 4) | (chr2 >> 4);
      enc3=((chr2 & 15) << 2) | (chr3 >> 6);
      enc4=chr3 & 63;

      if (isNaN(chr2)) {
        enc3=enc4=64;
      } else if (isNaN(chr3)) {
        enc4=64;
      }

      output=output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
    }

    return output;
  },

  // public method for decoding
  decode : function (input) {
    var output="";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i=0;
    input=input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {
      enc1=this._keyStr.indexOf(input.charAt(i++));
      enc2=this._keyStr.indexOf(input.charAt(i++));
      enc3=this._keyStr.indexOf(input.charAt(i++));
      enc4=this._keyStr.indexOf(input.charAt(i++));
      chr1=(enc1 << 2) | (enc2 >> 4);
      chr2=((enc2 & 15) << 4) | (enc3 >> 2);
      chr3=((enc3 & 3) << 6) | enc4;
      output=output + String.fromCharCode(chr1);

      if (enc3 !=64) output=output + String.fromCharCode(chr2);
      if (enc4 !=64) output=output + String.fromCharCode(chr3);
    }

    output=this._utf8_decode(output);
    return output;
  },

  // private method for UTF-8 encoding
  _utf8_encode : function (str) {
    str=str.replace(/\r\n/g,"\n");
    var utftext="";

    for (var n=0; n < str.length; n++) {
      var c=str.charCodeAt(n);

      if (c < 128) utftext +=String.fromCharCode(c);
      else if((c > 127) && (c < 2048)) {
        utftext +=String.fromCharCode((c >> 6) | 192);
        utftext +=String.fromCharCode((c & 63) | 128);
      } else {
        utftext +=String.fromCharCode((c >> 12) | 224);
        utftext +=String.fromCharCode(((c >> 6) & 63) | 128);
        utftext +=String.fromCharCode((c & 63) | 128);
      }
    }

    return utftext;
  },

  // private method for UTF-8 decoding
  _utf8_decode : function (utftext) {
    var str="";
    var i=0;
    var c=0, c1=0, c2=0;

    while ( i < utftext.length ) {
      c=utftext.charCodeAt(i);

      if (c < 128) {
        str +=String.fromCharCode(c);
        i++;
      } else if((c > 191) && (c < 224)) {
        c2=utftext.charCodeAt(i+1);
        str +=String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i +=2;
      } else {
        c2=utftext.charCodeAt(i+1);
        c3=utftext.charCodeAt(i+2);
        str +=String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i +=3;
      }
    }

    return str;
  }
};

function btoa(s) {
  return Base64.encode(s);
}

function atob(s) {
  return Base64.decode(s);
}
// ### End polyfills ###

//'Script dirname:'+WScript.FullName.dirname()+'\n'+
//'Script basename:'+WScript.FullName.basename().toLowerCase()+'\n'+
//'ScriptEngineMajorVersion:'+ScriptEngineMajorVersion()+'\n'+
//'ScriptEngineMinorVersion:'+ScriptEngineMinorVersion()+'\n'+

// ### Shortcuts and others ###

// Convert vbscript Argument to javascript array
var argv=[];
for (i=0; i < WScript.Arguments.Unnamed.Count; i++) argv.push(WScript.Arguments.Unnamed(i));
// Return the value of a named arguments (see https://ss64.com/vb/syntax-args.html).
function has_narg(k) {
  return WScript.Arguments.Named.Exists(k);
}

function narg_val(k) {
  if (has_narg(k) && typeof WScript.Arguments.Named.Item(k)!=='undefined') {
    re='/'+k+'/i';
    return WScript.Arguments.Named.Item(k).replace('/'+k+'/i', "$1")
  }

  return null;
}

String.prototype.basename = function() {
  return fso().getbasename(this);
}

String.prototype.dirname = function() {
  return fso().GetParentFolderName(this);
}

// sleep in floating seconds
function sleep(sec) {
  ms=sec*1000;
  WScript.Sleep(ms);
}

// Return empty string if env var does not exists [ or has empty value ]
function getenv (name) {
  varname="%"+name+"%";
  varval=wsh().ExpandEnvironmentStrings(varname);
  if (varval==varname) return "";
  return varval;
}

// Return output of external command
function SCmd(cmd) {
  var out_file=fso().GetSpecialFolder(2)+'\\'+fso().GetTempName();
  precmd='cmd /C ';
  var full_cmd=precmd+cmd+' >'+out_file+' 2>&1';
  var ret=wsh().Run(full_cmd, 0, true);

  if (ret !=0) {
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


function curdir() {
  return fso().GetAbsolutePathName(".");
}

function pardir (fold) {
  return fso().GetParentFolderName(fold);
}

function parcurdir () {
  return pardir(curdir());
}


