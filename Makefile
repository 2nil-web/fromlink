
#ARCH=$(call lc,${MSYSTEM})
ARCH=mingw64

PATH:=/${ARCH}/bin:${PATH}
PATH:=${PATH}:/c/Program Files/Inkscape/bin

# Pour utiliser clang il faut passer par le shell clang64.exe de msys2
ifeq (${ARCH},clang64)
CC=clang
CXX=clang++
endif

VERSION=$(shell git describe --abbrev=0 --tags 2>/dev/null || echo 'Unknown_version')
COMMIT=$(shell git rev-parse --short HEAD 2>/dev/null || echo 'Unknown_commit')
DECORATION=Windows shortcut supercharged.

MAGICK=magick
STRIP=strip
UPX=upx
GDB=gdb
RC=windres

CPPFLAGS += -D UNICODE -D _UNICODE
CFLAGS += -Wall -Wextra -std=c2x -pedantic -Os
CXXFLAGS += -Wall -Wextra -std=c++20 -pedantic -Os
LDFLAGS  += -static -Os -mwindows
LDLIBS   += -lshlwapi -lole32 -luuid

PREFIX=fromlnk
SRCS=${PREFIX}.c
OBJS=$(SRCS:.c=.o)
OBJS += ${PREFIX}Res.o
EXEXT=.exe
TARGETS=${PREFIX}${EXEXT}
ISO8601 := $(shell date +%Y-%m-%dT%H:%M:%SZ)
.PHONY: FORCE

all : version_check.txt version.h ${TARGETS}

# Par défaut en GCC on compile avec g++, cette option permet de revenir à gcc
gcc : all

g++ : all


MSBUILD=''

ifeq ($([[ ${MAKECMDGOALS} =~ g[+|c][+|c] ]] && echo -n notgxx || true),notgxx)
MSBUILD='C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\amd64\MSBuild.exe'
endif

ifneq ($(shell test -f ${MSBUILD} && echo -n yes || true),yes)
${TARGETS} : ${OBJS}
else
${TARGETS} : ${PREFIX}.ico version.h ${SRCS}
	${MSBUILD} ${PREFIX}.sln -p:Configuration=Release
	cp x64/Release/${TARGETS} .
endif


${PREFIX}Res.o : ${PREFIX}.ico

strip : $(TARGETS)
	$(STRIP) $(TARGETS) || true

upx : strip
	$(UPX) --best $(TARGETS) || true

gdb :  $(TARGETS)
	$(GDB) $(TARGETS)

test : upx
	ls -l ${TARGETS} && ./${TARGETS} &
	
cfg :
#	@echo "PATH"
#	@echo "${PATH}" | sed 's/:/\n/g'
#	@echo "END PATH"
	@type ${RC} # iscc
	@type ${STRIP} ${UPX} convert inkscape
	@type ${CC} ${CXX} gcc g++ ${GDB}
	@echo -e "\nCPPFLAGS=${CPPFLAGS}\nCXXFLAGS=${CXXFLAGS}\nLDFLAGS=${LDFLAGS}\nLDLIBS=${LDLIBS}\n"
	@echo -e "SRCS=${SRCS}\nOBJS=${OBJS}\nTARGETS=${TARGETS}\n"
	@echo -e "VERSION=${VERSION}\nCOMMIT=${COMMIT}\nDECORATION=${DECORATION}\n"

help :
	@echo -e "$(shell tput smul)What to do to build and/or deliver a new version?$(shell tput rmul)"
	@echo "To build it, under MSys2, type 'make'"
	@echo -e "It can be compiled with GNU gcc or GNU g++ or Visual Studio."
	@echo =e "If Visual Studio is correctly set in the makefile then it will be the default compiler else gcc."
	@echo -e "To force the use of gcc type 'make gcc'."
	@echo -e "To force the use of g++ type 'make g++'."
	@echo "For delivery"
	@echo -e "1-Check remote tags   : git ls-remote --tags origin"
	@echo -e "2-Check local tags    : git describe --abbrev=0 --tags"
	@echo -e "3-New version tag     : git tag -a X.Y.Z-nom_de_la_prereleasee -m 'commentaire' # De préférence un tag annoté (-a)."
	@echo -e "4-Push a tag          : git push --tags"
	@echo -e "5-Build application   : make ..., make strip, make upx"
	@echo -e "6-Build the setup     : make setup # (ToDo)"
	@echo -e "7-Delivery            : make deliv # (ToDo)"
	@echo -e "For versioning, respect Semantic Versioning (see semver.org, i.e.: MAJOR.MINOR.PATCH-pre_release+metadata ...)"

clean :
	rm -f $(OBJS) *~ $(TARGETS)

rclean :
	rm -f $(OBJS) *.d *~ $(TARGETS) ${PREFIX}.ico
	rm -rf x64

# Génération du version.h intégré dans l'appli
version.h : version_check.txt
	@echo -e "Building C/C++ header $@"
	@echo -e "LPCTSTR name=TEXT(\"${PREFIX}\"), version=TEXT(\"${VERSION}\"), decoration=TEXT(\"${DECORATION}\"), commit=TEXT(\"${COMMIT}\"), created_at=TEXT(\"${ISO8601}\");" >$@
#	@echo -e "std::wstring name=TEXT(\"${PREFIX}\"), version=TEXT(\"${VERSION}\"), decoration=TEXT(\"${DECORATION}\"), commit=TEXT(\"${COMMIT}\"), created_at=TEXT(\"${ISO8601}\");" >$@

# Génération du version.json intégré dans le paquetage
version.json : version_check.txt
	@echo -e "Building json file $@"
	@echo -e '{ "name":"${PREFIX}", "version":"${VERSION}", "decoration":"${DECORATION}", "commit":"${COMMIT}","created_at":"${ISO8601}" }' >$@

# Pour regénérer version.h et version.json dès qu'un des champs version ou decoration ou commit, est modifié.
version_check.txt : FORCE
	@echo -e "Version:${VERSION}, decoration:${DECORATION}, commit:${COMMIT}" >new_$@
	@if diff new_$@ $@ >/dev/null 2>&1; then rm -f new_$@; else mv -f new_$@ $@; rm -f ${PREFIX}.iss ${PREFIX}-standalone.iss; fi

# Les régles qui suivent ne sont pas utiles quand on fait 'make clean'
ifneq ($(MAKECMDGOALS),rclean)
# Implicit rules

ifneq ($(MAKECMDGOALS),gcc)
COMPILE.c=${COMPILE.cpp}
LINK.c=${LINK.cpp}
endif

%.exe: %.o
	$(LINK.c) $^ $(LOADLIBES) $(LDLIBS) -o $@

%.exe: %.c
	$(LINK.c) $^ $(LOADLIBES) $(LDLIBS) -o $@

%.exe: %.cpp
	$(LINK.cc) $^ $(LOADLIBES) $(LDLIBS) -o $@

%.ico : %.png
	${MAGICK} convert -background none $< $@

%.ico : %.svg
	${MAGICK} convert -background none +dither -colors 16 -depth 4 $< $@

%.o: %.c
#  commands to execute (built-in):
	$(COMPILE.c) $(OUTPUT_OPTION) $<

%.o: %.cpp
#  commands to execute (built-in):
	$(COMPILE.cc) $(OUTPUT_OPTION) $<

# Régles pour construire les fichier objet d'après les .rc
%.o : %.rc
	$(RC) $(CPPFLAGS) $< --include-dir . $(OUTPUT_OPTION)

%.d: %.c
	@echo Checking header dependencies from $<
	@$(COMPILE.c) -isystem /usr/include -MM $< >> $@

%.d: %.cpp
	@echo Checking header dependencies from $<
	@$(COMPILE.cpp) -isystem /usr/include -MM $< >> $@

# Inclusion des fichiers de dépendance .d
ifdef OBJS
-include $(OBJS:.o=.d)
endif
endif

