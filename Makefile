.PHONY: build dist lint setup copy serve clean metrics test coverage zip contrib flow
build: test build/katex.min.js build/katex.min.css contrib zip compress

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

# Export these variables for use in contrib Makefiles
export BUILDDIR = $(realpath build)
export BROWSERIFY = $(realpath ./node_modules/.bin/browserify)
export UGLIFYJS = $(realpath ./node_modules/.bin/uglifyjs) \
	--mangle \
	--beautify \
	ascii_only=true,beautify=false
export CLEANCSS = $(realpath ./node_modules/.bin/cleancss)

# The prepublish script in package.json will override the following variable,
# setting it to the empty string and thereby avoiding an infinite recursion
NIS = .npm-install.stamp

$(NIS) setup: package.json
	KATEX_DIST=skip npm install # dependencies only, don't build
	@touch $(NIS)

lint: $(NIS)
	$(NPM) run lint

build/katex.js: katex.js $(wildcard src/*.js) $(NIS)
	$(BROWSERIFY) -t [ babelify ] $< --standalone katex > $@

build/katex.min.js: build/katex.js
	$(UGLIFYJS) < $< > $@

build/katex.css: static/katex.less $(wildcard static/*.less) $(NIS)
	./node_modules/.bin/lessc $< $@

build/katex.min.css: build/katex.css
	$(CLEANCSS) -o $@ $<

.PHONY: build/fonts
build/fonts:
	rm -rf $@
	mkdir $@
	for font in $(shell grep "font" static/katex.less | grep -o "KaTeX_\w\+" | cut -d" " -f 2 | sort | uniq); do \
		cp static/fonts/$$font* $@; \
	done

test/screenshotter/unicode-fonts:
	git clone https://github.com/Khan/KaTeX-test-fonts test/screenshotter/unicode-fonts
	cd test/screenshotter/unicode-fonts && \
	git checkout 99fa66a2da643218754c8236b9f9151cac71ba7c && \
	cd ../../../

contrib: build/contrib

.PHONY: build/contrib
build/contrib:
	mkdir -p build/contrib
	@# Since everything in build/contrib is put in the built files, make sure
	@# there's nothing in there we don't want.
	rm -rf build/contrib/*
	$(MAKE) -C contrib/auto-render
	$(MAKE) -C contrib/copy-tex
	$(MAKE) -C contrib/mathtex-script-type

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
	cd metrics && $(PERL) ./mapping.pl | $(PYTHON) ./extract_tfms.py | $(PYTHON) ./extract_ttfs.py | $(PYTHON) ./format_json.py > ../src/fontMetricsData.js

extended_metrics:
	cd metrics && $(PERL) ./mapping.pl | $(PYTHON) ./extract_tfms.py | $(PYTHON) ./extract_ttfs.py | $(PYTHON) ./format_json.py --width > ../src/fontMetricsData.js

clean:
	rm -rf build/* $(NIS)

screenshots: test/screenshotter/unicode-fonts $(NIS)
	dockers/Screenshotter/screenshotter.sh
