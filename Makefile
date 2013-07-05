FILES=parser.js style.css build.js index.html

.PHONY: ship
ship: parser.js
	scp $(FILES) prgmr:/var/www/www.rampancylabs.com/parser/

parser.js: parser.jison
	./node_modules/.bin/jison parser.jison
