### How to generate MathJax fonts
---------------------------------

The `buildFonts.sh` script should do everything automatically,
as long as docker is installed.

If you want to use a repository different from the official one,
you can supply its URL as a parameter to that script.

If you ran the script and want to clean up the docker image it created,
run `docker rmi mathjaxfonts`.
Everything else should be cleaned up automatically.

If there is a problem, file a bug report.
