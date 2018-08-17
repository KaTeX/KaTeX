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

// copy local built CSS and fonts
fs.copySync('../dist/katex.min.css', 'static/static/katex.min.css');
fs.copySync('../dist/fonts', 'static/static/fonts');

if (process.env.CONTEXT === 'production') {
    // do not deploy versioned docs to netlify production deploy
    fs.removeSync('versions.json');
}
