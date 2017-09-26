.PHONY: build

build: $(BUILDDIR)/contrib/auto-render.min.js

$(BUILDDIR)/contrib/auto-render.min.js: $(BUILDDIR)/contrib/auto-render.js
	$(UGLIFYJS) < $< > $@

$(BUILDDIR)/contrib/auto-render.js: auto-render.js
	$(BROWSERIFY) -t [ babelify --presets [ es2015 flow ] --plugins [ transform-runtime transform-class-properties ]] $< --standalone renderMathInElement > $@
