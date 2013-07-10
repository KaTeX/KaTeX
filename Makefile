.PHONY: build copy serve clean
build: build/katex.js

build/katex.js: katex.js parser.jison lexer.js
	./node_modules/.bin/browserify $< --standalone katex -t ./jisonify > $@

copy: build
	cp build/katex.js ../exercises/utils/katex.js
	cp static/katex.css ../exercises/css/
	cp -R static/fonts ../exercises/css/

serve:
	node server.js

clean:
	rm -rf build/*
