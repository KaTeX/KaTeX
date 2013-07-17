.PHONY: build copy serve clean
build: build/katex.js

compress: build/katex.min.js
	@printf "Minified, gzipped size: "
	@gzip -c $^ | wc -c

build/katex.js: katex.js Parser.js Lexer.js
	./node_modules/.bin/browserify $< --standalone katex > $@

build/katex.min.js: build/katex.js
	uglifyjs --mangle < $< > $@


copy: build
	cp build/katex.js ../exercises/utils/katex.js
	cp static/katex.css ../exercises/css/
	cp -R static/fonts ../exercises/css/

serve:
	node server.js

clean:
	rm -rf build/*
