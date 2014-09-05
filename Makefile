.PHONY: build setup copy serve clean metrics
build: setup build/katex.min.js build/katex.min.css compress

setup:
	npm install

build/katex.js: katex.js $(wildcard *.js)
	./node_modules/.bin/browserify $< --standalone katex > $@

build/katex.min.js: build/katex.js
	./node_modules/.bin/uglifyjs --mangle < $< > $@

build/katex.less.css: static/katex.less
	./node_modules/.bin/lessc $< > $@

build/katex.min.css: build/katex.less.css
	./node_modules/.bin/cleancss -o $@ $<

compress: build/katex.min.js build/katex.min.css
	@$(eval JSSIZE!=gzip -c build/katex.min.js | wc -c)
	@$(eval CSSSIZE!=gzip -c build/katex.min.css | wc -c)
	@$(eval TOTAL!=echo ${JSSIZE}+${CSSSIZE} | bc)
	@printf "Minified, gzipped js:  %6d\n" "${JSSIZE}"
	@printf "Minified, gzipped css: %6d\n" "${CSSSIZE}"
	@printf "Total:                 %6d\n" "${TOTAL}"

serve:
	node server.js

metrics:
	cd metrics && ./mapping.pl | ./extract_tfms.py | ./replace_line.py

clean:
	rm -rf build/*
