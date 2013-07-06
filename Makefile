FILES=parser.js style.css build.js index.html

.PHONY: build ship copy watch
build: parser.js

ship: build
	scp $(FILES) prgmr:/var/www/www.rampancylabs.com/parser/

copy: build
	cp parser.js ../exercises/utils/mjlite-parser.js
	cp MJLite.js ../exercises/utils/MJLite.js
	cp style.js ../exercises/css/mjlite.css

parser.js: parser.jison
	./node_modules/.bin/jison parser.jison

watch:
	./node_modules/.bin/watchify MJLite.js --standalone MJLite -o build/MJLite.js
