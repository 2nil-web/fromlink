# fromlnk

## How to build

Under msys2 shell, type "make help".
Can be built with GNU gcc or Visual Studio under Windows.
If you want to built it with Visual Studio, have a look at the variable MSBUILD in the Makefile.

## Usage

Do not use this program directly.
Only put it at the start of the target field of a shortcut.
It will then execute what follows while adding the shortcut name as the last parameter.
This allows a targeted programs to act according to the name and settings of a shortcut.

## Authors and acknowledgment

(C) Denis LALANNE

## License

Do what you want with that.
No responsability of any kind..
