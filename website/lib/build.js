const fs = require('fs-extra');

// generate cli.md
const cli = require('../../cli');
const template = fs.readFileSync('../docs/cli.md.template');

fs.writeFileSync('../docs/cli.md', [template,
    ...cli.options.map(option => `### \`${option.flags}\`
${option.description}${((option.bool && option.defaultValue !== undefined)
? ' (default: ' + option.defaultValue + ')' : '')}
`),
    '### `-h, --help`\nOutput usage information', ''].join('\n'));

// copy local built KaTeX
fs.copySync('../dist/katex.min.js', 'static/static/katex.min.js');
fs.copySync('../dist/katex.min.css', 'static/static/katex.min.css');
fs.copySync('../dist/fonts', 'static/static/fonts');

// copy local built KaTeX extensions
fs.copySync('../dist/contrib/copy-tex.min.css', 'static/static/copy-tex.min.css');
fs.copySync('../dist/contrib/copy-tex.min.js', 'static/static/copy-tex.min.js');
fs.copySync('../dist/contrib/mhchem.min.js', 'static/static/mhchem.min.js');


// Netlify production deploy
if (process.env.CONTEXT === 'production') {
    // monkey patch docusaurus/lib/core/nav/HeaderNav.js to always link
    // to the latest version page
    let headerNav = fs.readFileSync(
        'node_modules/docusaurus/lib/core/nav/HeaderNav.js', 'utf8');
    headerNav = headerNav.replace(/const versionsLink =$/m,
        'const versionsLink = this.props.url +');
    fs.writeFileSync('node_modules/docusaurus/lib/core/nav/HeaderNav.js',
        headerNav);

    // use KaTeX from CDN on the main page
    const version = require('../versions.json')[0];
    let indexHtml = fs.readFileSync('pages/index.html', 'utf8');
    indexHtml = indexHtml.replace(/(["'])static\/(katex|fonts)/g,
        `$1https://cdn.jsdelivr.net/npm/katex@${version}/dist/$2`);
    // the CDN pathway is different for `copy-tex` and `mhchem`
    indexHtml = indexHtml.replace(/(["'])static\/(copy-tex|mhchem)/g,
            `$1https://cdn.jsdelivr.net/npm/katex@${version}/dist/contrib/$2`);
    fs.writeFileSync('pages/index.html', indexHtml);
}
