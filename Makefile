.PHONY: build dist lint setup copy serve clean metrics test zip contrib
build: lint build/katex.min.js build/katex.min.css contrib zip compress

dist: build
	rm -rf dist/
	cp -R build/katex/ dist/

# Export these variables for use in contrib Makefiles
export BUILDDIR = $(realpath build)
export BROWSERIFY = $(realpath ./node_modules/.bin/browserify)
export UGLIFYJS = $(realpath ./node_modules/.bin/uglifyjs) \
	--mangle \
	--beautify \
	ascii_only=true,beautify=false

setup:
	npm install

lint: katex.js server.js cli.js $(wildcard src/*.js) $(wildcard test/*.js) $(wildcard contrib/*/*.js) $(wildcard dockers/*/*.js)
	./node_modules/.bin/eslint $^

build/katex.js: katex.js $(wildcard src/*.js)
	$(BROWSERIFY) $< --standalone katex > $@

build/katex.min.js: build/katex.js
	$(UGLIFYJS) < $< > $@

build/katex.less.css: static/katex.less $(wildcard static/*.less)
	./node_modules/.bin/lessc $< $@

build/katex.min.css: build/katex.less.css
	./node_modules/.bin/cleancss -o $@ $<

.PHONY: build/fonts
build/fonts:
	rm -rf $@
	mkdir $@
	for font in $(shell grep "font" static/katex.less | grep -o "KaTeX_\w\+" | cut -d" " -f 2 | sort | uniq); do \
		cp static/fonts/$$font* $@; \
	done

contrib: build/contrib

.PHONY: build/contrib
build/contrib:
	mkdir -p build/contrib
	@# Since everything in build/contrib is put in the built files, make sure
	@# there's nothing in there we don't want.
	rm -rf build/contrib/*
	$(MAKE) -C contrib/auto-render

.PHONY: build/katex
build/katex: build/katex.min.js build/katex.min.css build/fonts README.md build/contrib
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
	@$(eval JSSIZE!=gzip -c build/katex.min.js | wc -c)
	@$(eval CSSSIZE!=gzip -c build/katex.min.css | wc -c)
	@$(eval TOTAL!=echo ${JSSIZE}+${CSSSIZE} | bc)
	@printf "Minified, gzipped js:  %6d\n" "${JSSIZE}"
	@printf "Minified, gzipped css: %6d\n" "${CSSSIZE}"
	@printf "Total:                 %6d\n" "${TOTAL}"

serve:
	node server.js

test:
	JASMINE_CONFIG_PATH=test/jasmine.json node_modules/.bin/jasmine

PERL=perl
PYTHON=$(shell python2 --version >/dev/null 2>&1 && echo python2 || echo python)

metrics:
	cd metrics && $(PERL) ./mapping.pl | $(PYTHON) ./extract_tfms.py | $(PYTHON) ./extract_ttfs.py | $(PYTHON) ./format_json.py > ../src/fontMetricsData.js

extended_metrics:
	cd metrics && $(PERL) ./mapping.pl | $(PYTHON) ./extract_tfms.py | $(PYTHON) ./extract_ttfs.py | $(PYTHON) ./format_json.py --width > ../src/fontMetricsData.js

clean:
	rm -rf build/*

screenshots:
	dockers/Screenshotter/screenshotter.sh
