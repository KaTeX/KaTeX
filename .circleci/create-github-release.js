const octokit = require('@octokit/rest')();
const fs = require('fs-extra');
const path = require('path');

const version = `v${process.argv[2]}`;
const assets = ['katex.tar.gz', 'katex.zip'];

octokit.authenticate({type: 'token', token: process.env.GH_TOKEN});

octokit.repos.createRelease({
    owner: process.env.CIRCLE_PROJECT_USERNAME,
    repo: process.env.CIRCLE_PROJECT_REPONAME,
    tag_name: version,
    name: version,
    target_commitish: 'master',
}).then(result => {
    const {data: {upload_url: uploadUrl}} = result;

    return Promise.all(assets.map(asset => {
        const file = fs.readFileSync(asset);
        return octokit.repos.uploadAsset({
            url: uploadUrl,
            contentType: asset.endsWith('.zip') ? 'application/zip' : 'application/gzip',
            contentLength: file.length,
            name: asset,
            file,
        });
    }));
}).catch(e => {
    console.error(e);
    process.exit(1);
});
