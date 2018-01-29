.PHONY: build dist lint setup webpack serve clean metrics test coverage zip flow
build: test build/katex zip compress

ifeq ($(KATEX_DIST),skip)

dist:

else

dist: build
	rm -rf dist/
	cp -R build/katex/ dist/

endif

NODE := node # pass NODE=nodejs on Debian without package nodejs-legacy
NPM := npm
NODECHK := $(shell $(NODE) ./check-node-version.js)
ifneq ($(NODECHK),OK)
$(error "Node not found or wrong version")
endif

# The prepublish script in package.json will override the following variable,
# setting it to the empty string and thereby avoiding an infinite recursion
NIS = .npm-install.stamp

$(NIS) setup: package.json
	KATEX_DIST=skip npm install # dependencies only, don't build
	@touch $(NIS)

lint: $(NIS)
	$(NPM) run lint

webpack: katex.js $(wildcard src/*.js) $(wildcard static/*.less) submodules/katex-fonts/fonts.less $(NIS)
	$(NPM) run build

.PHONY: build/fonts build/contrib
build/katex.js build/katex.min.js build/katex.css build/katex.min.css build/katex.css build/fonts build/contrib: webpack

test/screenshotter/unicode-fonts:
	git clone https://github.com/Khan/KaTeX-test-fonts test/screenshotter/unicode-fonts
	cd test/screenshotter/unicode-fonts && \
	git checkout 99fa66a2da643218754c8236b9f9151cac71ba7c && \
	cd ../../../

.PHONY: build/katex
build/katex: build/katex.js build/katex.min.js build/katex.css build/katex.min.css build/fonts README.md build/contrib
	mkdir -p build/katex
	rm -rf build/katex/*
	cp -r $^ build/katex

build/katex.tar.gz: build/katex
	cd build && tar czf katex.tar.gz katex/

build/katex.zip: build/katex
	rm -f $@
	cd build && zip -rq katex.zip katex/

zip: build/katex.tar.gz build/katex.zip

compress: build/katex.min.js build/katex.min.css
	@JSSIZE=`gzip -c build/katex.min.js | wc -c`; \
	CSSSIZE=`gzip -c build/katex.min.css | wc -c`; \
	TOTAL=`echo $${JSSIZE}+$${CSSSIZE} | bc`; \
	printf "Minified, gzipped js:  %6d\n" "$${JSSIZE}"; \
	printf "Minified, gzipped css: %6d\n" "$${CSSSIZE}"; \
	printf "Total:                 %6d\n" "$${TOTAL}"

serve: $(NIS)
	$(NPM) start

flow: $(NIS)
	$(NPM) run flow

test: $(NIS)
	$(NPM) test

coverage: $(NIS)
	$(NPM) run coverage

PERL=perl
PYTHON=$(shell python2 --version >/dev/null 2>&1 && echo python2 || echo python)

metrics:
	cd metrics && $(PERL) ./mapping.pl | $(PYTHON) ./extract_tfms.py | $(PYTHON) ./extract_ttfs.py | $(PYTHON) ./format_json.py --width > ../src/fontMetricsData.js

unicode:
	cd src && $(NODE) unicodeMake.js >unicodeSymbols.js
src/unicodeSymbols.js: unicode

clean:
	rm -rf build/* $(NIS)

screenshots: test/screenshotter/unicode-fonts $(NIS)
	dockers/Screenshotter/screenshotter.sh
