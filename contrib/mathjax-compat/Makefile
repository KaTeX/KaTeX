.PHONY: build integrity

build: $(BUILDDIR)/contrib/mathjax-compat.min.js

$(BUILDDIR)/contrib/mathjax-compat.min.js: $(BUILDDIR)/mathjax-compat.js
	$(UGLIFYJS) < $< > $@

$(BUILDDIR)/mathjax-compat.js: mathjax-compat.js
	$(BROWSERIFY) -t [ babelify ] $< > $@
