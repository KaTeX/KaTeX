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

// use KaTeX from CDN on the main page for Netlify production deploy
if (process.env.CONTEXT === 'production') {
    const version = require('../versions.json')[0];
    let indexHtml = fs.readFileSync('pages/index.html', 'utf8');
    indexHtml = indexHtml.replace(/(["'])static\/(katex|fonts)/g,
        `$1https://cdn.jsdelivr.net/npm/katex@${version}/dist/$2`);
    fs.writeFileSync('pages/index.html', indexHtml);
}
