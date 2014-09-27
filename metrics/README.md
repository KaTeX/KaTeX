### How to generate new metrics
-------------------------------

There are several requirements for generating the metrics used by KaTeX.

- You need to have an installation of TeX which supports kpathsea. You can check
  this by running `tex --version`, and seeing if it has a line that looks like
  > kpathsea version 6.2.0

- You need the JSON module for perl. You can install this either from CPAN or with
  your package manager.

- You need the python fontforge module. This is probably either installed with
  fontforge or can be installed from your package manager.

Once you have these things, run

    make metrics

which should generate new metrics and place them into `fontMetrics.js`. You're
done!

### OS X Notes

Install the JSON perl module:
    
    sudo cpan JSON

Install fontforge with python extensions (this may install python as well):

    brew install fontforge --enable-pyextension
    
If you get a "Segmentation fault: 11" when running `make metrics` you'll have
to change the shebang in extract_ttfs.py to point to the version of python
installed by brew.  This is path worked for me YMMV:

    #!/usr/local/Cellar/python/2.7.9/bin/python

Then run `make metrics`.
