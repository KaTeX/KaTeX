### How to generate new metrics
-------------------------------

There are several requirements for generating the metrics used by KaTeX.

- You need to have an installation of TeX which supports kpathsea. You can check
  this by running `tex --version`, and seeing if it has a line that looks like
  > kpathsea version 6.2.0

- You need the JSON module for perl. You can install this either from CPAN
  (possibly using the `cpan` command line tool) or with your package manager.

- You need the python module fonttools. You can install this either from PyPi
  (using `easy_install` or `pip`) or with your package manager.

Once you have these things, run

    make metrics

which should generate new metrics and place them into `fontMetricsData.json`.
You're done!
