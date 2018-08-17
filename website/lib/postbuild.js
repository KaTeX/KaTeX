const fs = require('fs-extra');

// revert to use local built KaTeX
if (process.env.npm_lifecycle_event === 'publish-gh-pages') {
    let indexHtml = fs.readFileSync('pages/index.html', 'utf8');
    indexHtml = indexHtml.replace(
        /(["'])https:\/\/cdn\.jsdelivr\.net\/npm\/katex@[^/"']+\/dist\//g,
        `$1static/`);
    fs.writeFileSync('pages/index.html', indexHtml);
}
