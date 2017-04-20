.PHONY: build integrity

build: $(BUILDDIR)/contrib/mathjax-compat.min.js

integrity: $(BUILDDIR)/contrib/mathjax-compat.min.js
	$(eval TMP := $(shell openssl dgst -sha384 -binary $< | openssl base64 -A))
	sed -i s/integrity=\".*\"/integrity=\"sha384-$(subst /,\\/,$(TMP))\"/  README.md

$(BUILDDIR)/contrib/mathjax-compat.min.js: $(BUILDDIR)/mathjax-compat.js
	$(UGLIFYJS) < $< > $@

$(BUILDDIR)/mathjax-compat.js: mathjax-compat.js
	$(BROWSERIFY) -t [ babelify ] $< > $@
