.PHONY: build setup copy serve clean
build: setup build/katex.js

setup:
	@npm install
	@mkdir -p build

compress: build/katex.min.js
	@printf "Minified, gzipped size: "
	@gzip -c $^ | wc -c

build/katex.js: katex.js $(wildcard *.js)
	./node_modules/.bin/browserify $< --standalone katex > $@

build/katex.min.js: build/katex.js
	uglifyjs --mangle < $< > $@

copy: copy-webapp copy-perseus copy-khan-exercises

copy-webapp: build
	cp build/katex.js ../webapp/javascript/katex-package/
	cp static/katex.css static/fonts/fonts.css \
		../webapp/stylesheets/katex-package
	cp static/fonts/*.ttf static/fonts/*.eot static/fonts/*.woff \
		../webapp/fonts/

copy-perseus: build
	cp -R build/katex.js static/katex.css static/fonts ../perseus/lib/katex/

copy-khan-exercises: build
	cp build/katex.js ../exercises/utils/katex.js
	cp -R static/katex.css static/fonts ../exercises/css/

serve:
	node server.js

clean:
	rm -rf build/*
