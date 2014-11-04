.PHONY: build lint setup copy serve clean metrics test zip
build: setup lint build/katex.min.js build/katex.min.css zip compress

setup:
	npm install

lint: katex.js $(wildcard src/*.js)
	./node_modules/.bin/jshint $^

build/katex.js: katex.js $(wildcard src/*.js)
	./node_modules/.bin/browserify $< --standalone katex > $@

build/katex.min.js: build/katex.js
	./node_modules/.bin/uglifyjs --mangle --beautify ascii_only=true,beautify=false < $< > $@

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

.PHONY: build/katex
build/katex: build/katex.min.js build/katex.min.css build/fonts README.md
	mkdir -p build/katex
	cp -r $^ build/katex

build/katex.tar.gz: build/katex
	cd build && tar czf katex.tar.gz katex/

build/katex.zip: build/katex
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
	./node_modules/.bin/jasmine-node test/katex-spec.js

metrics:
	cd metrics && ./mapping.pl | ./extract_tfms.py | ./extract_ttfs.py | ./replace_line.py

clean:
	rm -rf build/*
