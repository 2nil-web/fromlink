
OS=$(shell uname -s)

#CPPFLAGS += -U VERBOSE_MODE
CXXFLAGS += -Wall -Wextra -std=c++20 -pedantic
#LDFLAGS += -static-libgcc -static-libstdc++
LDFLAGS  += -static
LDFLAGS  += -g -Os

PREFIX=fromlnk
SRCS=${PREFIX}.cpp
OBJS=$(SRCS:.cpp=.o)

#MSYSTEM=UCRT64
#MSYSTEM=CLANG64
MSYSTEM=MINGW64

ifeq (${MSYSTEM},MINGW64)
ARCH=mingw64
endif

ifeq (${MSYSTEM},UCRT64)
ARCH=ucrt64
endif

# CLANG n'accepte pas les fichiers en ISO-8859
# Pour utiliser clang il faut passer par le shell clang64.exe de msys2
ifeq (${MSYSTEM},CLANG64)
ARCH=clang64
CC=clang
CXX=clang++
endif

PATH:=/${ARCH}/bin:${PATH}
PATH:=/c/Program Files/Inkscape/bin:${PATH}
EXEXT=.exe
CPPFLAGS += -I /${ARCH}/include/ddk
LDFLAGS += -mwindows
LDLIBS  +=  -lwsock32 -lws2_32 -luxtheme
LDLIBS  += -lurlmon
LDLIBS  += -lwsock32 -lole32 -luuid -lcomctl32 -loleaut32 -lgdi32
OBJS    += ${PREFIX}Res.o

MAGICK=magick
STRIP=strip
UPX=upx
GDB=gdb
RC=windres
LD=ld

TARGETS=${PREFIX}${EXEXT}

all : ${TARGETS}

${TARGETS} : ${OBJS}

${PREFIX}Res.o : ${PREFIX}.ico

strip : $(TARGETS)
	$(STRIP) $(TARGETS)

upx : strip
	$(UPX) $(TARGETS)

gdb :  $(TARGETS)
	$(GDB) $(TARGETS)

test : upx
	ls -l ${TARGETS} && ./${TARGETS} &
	
cfg :
	@echo "PATH"
	@echo "${PATH}" | sed 's/:/\n/g'
	@echo "END PATH"
ifneq (${OS},Linux)
	@type windres # iscc
endif
	@type strip upx convert inkscape
ifeq (${MSYSTEM},CLANG64)
	@type clang clang++
endif
	@type cc c++ gcc g++ ld gdb
	@echo -e "CPPFLAGS=${CPPFLAGS}\nCXXFLAGS=${CXXFLAGS}\nLDFLAGS=${LDFLAGS}\nLDLIBS=${LDLIBS}"
	@echo -e "SRCS=${SRCS}\nOBJS=${OBJS}\nTARGETS=${TARGETS}\n"

clean :
	rm -f $(OBJS) *~ $(TARGETS)

rclean :
	rm -f $(OBJS) *.d *~ $(TARGETS) ${PREFIX}.ico


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


