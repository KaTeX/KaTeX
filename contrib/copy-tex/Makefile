.PHONY: build

build: $(BUILDDIR)/contrib/copy-tex.min.js

$(BUILDDIR)/contrib/copy-tex.min.js: $(BUILDDIR)/copy-tex.js
	$(UGLIFYJS) < $< > $@

$(BUILDDIR)/copy-tex.js: copy-tex.js
	$(BROWSERIFY) -t [ babelify ] $< --standalone renderMathInElement > $@
