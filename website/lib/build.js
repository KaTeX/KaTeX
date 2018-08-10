const fs = require('fs');

// generate cli.md
const cli = require('../../cli');
const template = fs.readFileSync('../docs/cli.md.template');

fs.writeFileSync('../docs/cli.md', [template,
    ...cli.options.map(option => `### \`${option.flags}\`
${option.description}${((option.bool && option.defaultValue !== undefined)
? ' (default: ' + option.defaultValue + ')' : '')}
`),
    '### `-h, --help`\nOutput usage information', ''].join('\n'));
