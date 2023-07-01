# PuTTY and KeePass for ssh proxy access

## Requirements :

For our example we suppose that keepass and putty are installed as follow :

Download a portable keepass version package : https://sourceforge.net/projects/keepass/files/KeePass%202.x/2.54/KeePass-2.54.zip/download

unzip package content to c:\Software\keepass

Download latest portable putty   : https://the.earth.li/~sgtatham/putty/latest/w64/putty.zip
unzip package content to c:\Software\putty

## Using PuTTY for ssh proxy access

*This can be done in the PuTTY Configuration dialog by selecting "Connections>>Proxy" but it is not explained here as this is not our targeted use.*

It also can be done with the command line parameter -proxycmd.

One may find a good explaination of it, here : https://stackoverflow.com/questions/28926612/putty-configuration-equivalent-to-openssh-proxycommand

In short, at the command line you can do something like that :
putty.exe -proxycmd "plink.exe proxy_user@proxy_hostname -pw proxy_password -P 22 -nc target_hostname:22" target_user@target_hostname -pw target_password

Note that if you have an ssh key you can replace the parameter -pw by -i.

But this is not our goal here as we will use KeePass to provide the passwords.

So as an example to access the BitBucket server by using the acceptance palamida server as a proxy, we could run the following command :

```batch
C:\Software\putty\putty.exe -proxycmd "C:\Software\putty\plink.exe palamida@tlpalcorr01 -pw PALAMIDA_PASS -P 22 -nc git:22" bitbuck@git -pw BITBUCK_PASS
```

> *I let you find how to replace PALAMIDA_PASS and BITBUCK_PASS.*

> *If you have putty and plink in your path variable then it is not necessary to put their full path in the command, something like that should be enough :*

```batch
putty.exe -proxycmd "plink.exe palamida@tlpalcorr01 -pw PALAMIDA_PASS -P 22 -nc git:22" bitbuck@git -pw BITBUCK_PASS
```

## Integrating PuTTY to KeePass

By doing this you will be able to connect to a target host via a proxy directly from KeePass. So to do that open your KeePass database, then :

- On a ssh entry modify the URL field to have it prepended by "ssh://"
  *For example if for the BitBucket bridge entry you have something like this "tlbefgitp01" then it should became something like that "ssh://tlbefgitp01"*

- Then add a new ssh protocol handler in KeePass by selecting the "Tools" menu and its choice "Option".

- On the new dialog select tab "Integration" and click the lower roght button "URL Overrides".

- On the new dialog click on upper right button "Add".

- On the new dialog, on field Scheme enter "ssh" and on URL override field enter :

```batch
putty.exe -proxycmd "plink.exe palamida@tlpalcorr01 -pw PALAMIDA_PASS -P 22 -nc {BASE:RMVSCM}:22" {USERNAME}@BASE:RMVSCM -pw {PASSWORD}
```

*In this example I suppose that putty and plink command are in the PATH.*

## Conclusion

Starting from now each time you will select an ssh entry with URL field prepended by "ssh://" and press the "Ctrl+U" keyboard shortcut then a putty windows will open and directly log you to the target host with the corresponding target user through the defined proxy server.

## ToDo

#### Improvement

- Add variales to store the proxy server, user and password

- Integrate mobaxterm to keepass to do the same (is it possible ?).
