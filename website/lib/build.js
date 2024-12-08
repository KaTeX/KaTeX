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
fs.copySync('../dist/contrib/copy-tex.min.js', 'static/static/copy-tex.min.js');
fs.copySync('../dist/contrib/mhchem.min.js', 'static/static/mhchem.min.js');

// get URLs for previous deployments of release commit
if (process.env.NETLIFY_API_KEY) {
    const NetlifyAPI = require('netlify');
    const client = new NetlifyAPI(process.env.NETLIFY_API_KEY);

    client.listSiteDeploys({site_id: 'f868b1d7-3130-44e8-ae1b-640f4ed3e401'})
        .then(deploys => {
            const versions = deploys.reduce((list, deploy) => {
                if (deploy.context === "production" && deploy.state === "ready") {
                    const m = /^Release v([\d.]+)|^chore\(release\): ([\d.]+)/
                        .exec(deploy.title);
                    if (m) {
                        list.push({name: m[1] || m[2], id: deploy.id});
                    }
                }
                return list;
            }, []).reverse();
            fs.writeFileSync('prev-versions.json', JSON.stringify(versions));
        });
}

// use KaTeX from CDN on the main page for Netlify production deploy
if (process.env.CONTEXT === 'production') {
    const {version} = require('../../package.json');
    let indexHtml = fs.readFileSync('pages/index.html', 'utf8');
    indexHtml = indexHtml.replace(/(["'])static\/(katex|fonts)/g,
        `$1https://cdn.jsdelivr.net/npm/katex@${version}/dist/$2`);
    // the CDN pathway is different for `copy-tex` and `mhchem`
    indexHtml = indexHtml.replace(/(["'])static\/(copy-tex|mhchem)/g,
            `$1https://cdn.jsdelivr.net/npm/katex@${version}/dist/contrib/$2`);
    fs.writeFileSync('pages/index.html', indexHtml);
}
