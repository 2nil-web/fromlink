# PuTTY and KeePass for ssh proxy access

## Requirements :

For our example we suppose that keepass and putty are installed as follow :

### KeePass

Download a recent portable keepass version package, knowing that what has been tested for this documentation rely on the [KeePass version 2.54](https://sourceforge.net/projects/keepass/files/KeePass%202.x/2.54/KeePass-2.54.zip/download). 

Unzip the downloaded package content to "C:\Software\keepass".

### PuTTY

Download the latest version of a [portable putty](https://the.earth.li/~sgtatham/putty/latest/w64/putty.zip) 
Unzip the downloaded package content to "C:\Software\putty".

## Using PuTTY for ssh proxy access

*This can also be done in the PuTTY Configuration dialog by selecting "Connections>>Proxy" but it is not explained here as this is not our targeted use. See the PuTTY help*

It also can be done with the command line parameter -proxycmd. Which is the use we want to have by integrationg the use of PuTTY in the KeePass.

One may find a good explaination of it, [here](https://stackoverflow.com/questions/28926612/putty-configuration-equivalent-to-openssh-proxycommand). 

In short, at the command line you can do something like that :

```batch
putty.exe -proxycmd "plink.exe proxy_user@proxy_hostname -pw proxy_password -P 22 -nc target_hostname:22" target_user@target_hostname -pw target_password
```

Note that if you have an ssh key you can replace the parameter -pw by -i.

But, again, this is not our goal here as we will use KeePass to provide the passwords.

So as an example to access the BitBucket server by using the acceptance palamida server as a proxy, we could run the following command :

```batch
C:\Software\putty\putty.exe -proxycmd "C:\Software\putty\plink.exe palamida@tlpalcorr01 -pw PALAMIDA_PASS -P 22 -nc git:22" bitbuck@git -pw BITBUCK_PASS
```

> *If you have putty and plink in your path variable then it is not necessary to put their full path in the command, something like that should be enough :*

```batch
putty.exe -proxycmd "plink.exe palamida@tlpalcorr01 -pw PALAMIDA_PASS -P 22 -nc git:22" bitbuck@git -pw BITBUCK_PASS
```

> *I let you find how to replace PALAMIDA_PASS and BITBUCK_PASS.*

## Integrating PuTTY for ssh proxy access to KeePass

### Adding a URL scheme

We can consider that we are creating a new URL scheme that is not a straitforward ssh URL scheme but more like a ssh proxy jump one. So lets call it "sshj" as what we aim to do is equivalent to the "-J" option of the open ssh client command.

So to add a new URL scheme in KeePass select the "Tools" menu and its choice "Option".

- On the new dialog select the "Integration" tab and click the lower right button : <button>URL scheme</button>.

- On the new dialog click on upper right button <button>Add</button>.

- On the new dialog, on field Scheme enter "ssh" and on URL override field enter :

<div>
<input size="85" value='putty.exe -proxycmd "plink.exe palamida@tlpalcorr01 -pw PALAMIDA_PASS -P 22 -nc {BASE:RMVSCM}:22" {USERNAME}@BASE:RMVSCM -pw {PASSWORD}'></input>
</div>

```batch
putty.exe -proxycmd "plink.exe palamida@tlpalcorr01 -pw PALAMIDA_PASS -P 22 -nc {BASE:RMVSCM}:22" {USERNAME}@BASE:RMVSCM -pw {PASSWORD}
```

*In this example I suppose that putty and plink command are in the PATH. But you also could consider to add the full path as indicated previously*

#### N.B.

The URL scheme that is now created remain in the user configuration space of the KeePass. It is not saved in any KeePass database. This allow you to implement it in any form you want, as it will be invoked through the "sshj" protocol tag.

### Using the URL scheme

Once the URL scheme is created you must indicate which KeePass entry needs to use it. To do so, open your KeePass database then on each ssh entry that needs this proxy jump, modify the URL field to have it prefixed by "ssh://"

*For example if for the BitBucket bridge entry you have something like this "tlbefgitp01" then it should became something like that "ssh://tlbefgitp01"*

## Conclusion

Starting from now each time you will select an ssh entry with URL field prepended by "ssh://" and press the "Ctrl+U" keyboard shortcut then a putty windows will open and directly log you to the target host with the corresponding target user through the defined proxy server.

## ToDo

#### Improvements

- Add variales to store the proxy server and credential (user and password).

- Integrate mobaxterm to keepass to do the same, if possible ...
