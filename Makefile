.PHONY: build copy serve clean
build: build/MJLite.js

build/MJLite.js: MJLite.js parser.jison lexer.js
	./node_modules/.bin/browserify $< --standalone MJLite -t ./jisonify > $@

copy: build
	cp build/MJLite.js ../exercises/utils/MJLite.js
	cp static/mjlite.css ../exercises/css/
	cp -R static/fonts ../exercises/css/

serve:
	node server.js

clean:
	rm -rf build/*
