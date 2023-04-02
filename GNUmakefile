
ifeq (${HOSTNAME},PC-Denis)
MSBUILD='C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\amd64\MSBuild.exe'
endif

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
DECORATION=Nawak-Bidon

MAGICK=magick
STRIP=strip
UPX=upx
GDB=gdb
RC=windres

#CPPFLAGS += -U VERBOSE_MODE
CXXFLAGS += -Wall -Wextra -std=c++20 -pedantic
LDFLAGS  += -static
LDFLAGS  += -g -Os
LDFLAGS  += -mwindows
LDLIBS   += -lwsock32 -lws2_32 -luxtheme
LDLIBS   += -lurlmon
LDLIBS   += -lole32 -luuid -lcomctl32 -loleaut32 -lgdi32

PREFIX=fromlnk
SRCS=${PREFIX}.cpp
OBJS=$(SRCS:.cpp=.o)
OBJS += ${PREFIX}Res.o
EXEXT=.exe
TARGETS=${PREFIX}${EXEXT}
ISO8601 := $(shell date +%Y-%m-%dT%H:%M:%SZ)
.PHONY: FORCE

all : version_check.txt version.h ${TARGETS}
#	make ${TARGETS}

ifeq ($(MSBUILD),)
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
	$(UPX) $(TARGETS) || true

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
	@echo -e "$(shell tput smul)Que faire pour livrer une nouvelle version ?$(shell tput rmul)"
	@echo -e "1-Vérifier les tags distants : git ls-remote --tags origin"
	@echo -e "2-Vérifier les tags locaux   : git describe --abbrev=0 --tags"
	@echo -e "3-Nouveau tag de version     : git tag -a X.Y.Z-nom_de_la_prereleasee -m 'commentaire' # De préférence un tag annoté (-a)."
	@echo -e "4-Pousser un tag             : git push --tags"
	@echo -e "5-Build applicatif           : make"
	@echo -e "6-Build du setup             : make setup # (ToDo)"
	@echo -e "7-Livraison                  : make deliv # (ToDo)"
	@echo -e "Pour le versionnage, respecter la sémantique de version (cf. semver.org, i.e.: MAJOR.MINOR.PATCH-pre_release+metadata ...)"

clean :
	rm -f $(OBJS) *~ $(TARGETS)

rclean :
	rm -f $(OBJS) *.d *~ $(TARGETS) ${PREFIX}.ico
	rm -rf x64

# Génération du version.h intégré dans l'appli
version.h : version_check.txt
	@echo -e "Building C++ header $@"
	@echo -e "std::string name=\"${PREFIX}\", version=\"${VERSION}\", decoration=\"${DECORATION}\", commit=\"${COMMIT}\", created_at=\"${ISO8601}\";" >$@

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

%.exe: %.o
	$(LINK.cpp) $^ $(LOADLIBES) $(LDLIBS) -o $@

%.exe: %.c
	$(LINK.c) $^ $(LOADLIBES) $(LDLIBS) -o $@

%.exe: %.cpp
	$(LINK.cc) $^ $(LOADLIBES) $(LDLIBS) -o $@

%.ico : %.png
	${MAGICK} convert -background none $< $@

%.ico : %.svg
	${MAGICK} convert -background none $< $@

# Régles pour construire les fichier objet d'après les .rc
%.o : %.rc
	$(RC) $(CPPFLAGS) $< --include-dir . $(OUTPUT_OPTION)

%.d: %.c
	@echo Checking header dependencies from $<
	@$(COMPILE.c) -isystem /usr/include -MM $< >> $@

#	@echo "Building "$@" from "$<
%.d: %.cpp
	@echo Checking header dependencies from $<
	@$(COMPILE.cpp) -isystem /usr/include -MM $< >> $@

# Inclusion des fichiers de dépendance .d
ifdef OBJS
-include $(OBJS:.o=.d)
endif
endif


