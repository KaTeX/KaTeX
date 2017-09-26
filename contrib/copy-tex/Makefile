.PHONY: build

build: $(BUILDDIR)/contrib/copy-tex.min.js $(BUILDDIR)/contrib/copy-tex.css $(BUILDDIR)/contrib/copy-tex.min.css

$(BUILDDIR)/contrib/copy-tex.min.js: $(BUILDDIR)/contrib/copy-tex.js
	$(UGLIFYJS) < $< > $@

$(BUILDDIR)/contrib/copy-tex.js: copy-tex.js
	$(BROWSERIFY) -t [ babelify ] $< --standalone renderMathInElement > $@

$(BUILDDIR)/contrib/copy-tex.css: copy-tex.css
	cp $< $@

$(BUILDDIR)/contrib/copy-tex.min.css: $(BUILDDIR)/contrib/copy-tex.css
	$(CLEANCSS) -o $@ $<
