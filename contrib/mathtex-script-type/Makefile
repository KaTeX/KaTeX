.PHONY: build integrity

build: $(BUILDDIR)/contrib/mathtex-script-type.min.js

$(BUILDDIR)/contrib/mathtex-script-type.min.js: $(BUILDDIR)/mathtex-script-type.js
	$(UGLIFYJS) < $< > $@

$(BUILDDIR)/mathtex-script-type.js: mathtex-script-type.js
	$(BROWSERIFY) -t [ babelify ] $< > $@
