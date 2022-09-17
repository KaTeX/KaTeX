#!gmake
#
# Version: Apache License 2.0
#
# Copyright (c) 2013 MathJax Project
# Copyright (c) 2013 The MathJax Consortium
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

CUSTOM=custom.cfg

-include $(CUSTOM)

MFTRACE_MODIFIED=lib/mftrace-modified

PFA := \
cmbsy10.pfa \
cmbx10.pfa \
cmbxti10.pfa \
cmex10.pfa \
cmmi10.pfa \
cmmib10.pfa \
cmr10.pfa \
cmss10.pfa \
cmssbx10.pfa \
cmssi10.pfa \
cmsy10.pfa \
cmti10.pfa \
cmtt10.pfa \
msam10.pfa \
msbm10.pfa \
rsfs10.pfa \
eufb10.pfb \
eufm10.pfb

all: config fonts

$(CUSTOM):
	@cp default.cfg $(CUSTOM);

$(CUSTOM).pl: $(CUSTOM)
	@echo "Creating Perl config file..."
	@cp $(CUSTOM) $(CUSTOM).pl
	@echo >> $(CUSTOM).pl # ensure that the config file ends by a new line
	@echo "MFTRACE_PATH=`$(WHICH) $(MFTRACE)`" >> $(CUSTOM).pl
	@$(SED) -i "s|^\([A-Z_0-9]*\)=\(.*\)|$$\1='\2';|" $(CUSTOM).pl
	@echo "1;" >> $(CUSTOM).pl

.PHONY: config
config: $(CUSTOM).pl
	mkdir -p pfa

blacker: $(MFTRACE_MODIFIED)
$(MFTRACE_MODIFIED):
	$(PERL) -I. makeBlacker 15 # values between 10 and 30 seem best

# Create the pfa files
%.pfa: $(MFTRACE_MODIFIED)
	$(PYTHON) $(MFTRACE_MODIFIED) --magnification 1000 --simplify $*
	mv $@ pfa/$@

# Create the pfb files
%.pfb: $(MFTRACE_MODIFIED)
	cp "`$(KPSEWHICH) $@`" pfa/$@

# Create all the FontForge (.ff) scripts to generate the modern .ttf font files
# from the older TeX .pfa and .pfb files. The relation of the .ff and the
# .{pfa, pfb} files is many-to-many, and not one-to-one. Makefile doesn't like
# these types of relations, thus we have a single target that creates all of
# the .ff scripts.
# As a byproduct, the script also creates the initial .ttx files for all the
# different KaTeX fonts.
ff: $(PFA)
	mkdir -p ff otf ttx
	rm -f ff/* otf/* ttx/*
	$(PYTHON) create_ff_scripts.py
	for file in `ls ttx/*.ttx | $(SED) 's|ttx/\(.*\)\.ttx|\1|'`; do \
		$(TTX) -f ttx/$$file.ttx;\
		mv ttx/$$file.otf otf/$$file.otf;\
	done

.PHONY: fonts
fonts: ff
	mkdir -p ttf woff woff2
	rm -f ttf/* woff/* woff2/*

	@for file in `ls ff/*.ff | $(SED) 's|ff/\(.*\)\.ff|\1|'`; do \
		echo ""; \
		echo $$file; \
		$(FONTFORGE) -lang=ff -script ff/$$file.ff; \
		\
		echo "Hinting $$file"; \
		if echo "$$file" | $(GREP) -q -e "Size[1-4]" -e "Typewriter"; then \
			$(TTFAUTOHINT) -f none -S --windows-compatibility --symbol ttf/$$file.ttf ttf/$$file.ttf.hinted; \
		else \
			$(TTFAUTOHINT) -f none -S --windows-compatibility ttf/$$file.ttf ttf/$$file.ttf.hinted; \
		fi; \
		mv ttf/$$file.ttf.hinted ttf/$$file.ttf; \
		\
		echo "Generating $$file..."; \
		$(PYTHON) generate_fonts.py ttf/$$file.ttf; \
		rm ttf/$$file.ttf; \
		done

clean:
	rm -f $(CUSTOM).pl
	rm -f $(MFTRACE_MODIFIED) lib/blacker.mf
	rm -rf pfa ff otf ttf woff woff2
