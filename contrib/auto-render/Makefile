.PHONY: build

build: $(BUILDDIR)/contrib/auto-render.min.js

$(BUILDDIR)/contrib/auto-render.min.js: $(BUILDDIR)/auto-render.js
	$(UGLIFYJS) < $< > $@

$(BUILDDIR)/auto-render.js: auto-render.js
	$(BROWSERIFY) $< --standalone renderMathInElement > $@
