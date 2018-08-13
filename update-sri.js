const fs = require("fs");
const sriToolbox = require("sri-toolbox");

const version = process.argv[2];

function read(file, encoding) {
    return new Promise((resolve, reject) =>
        fs.readFile(file, encoding, (err, body) =>
            err ? reject(err) : resolve(body)));
}

function write(file, data) {
    return new Promise((resolve, reject) =>
        fs.writeFile(file, data, (err) =>
            err ? reject(err) : resolve()));
}

Promise.all(process.argv.slice(3).map(file =>
    read(file, "utf8")
    .then(body => {
        // Replace size badge url
        // eslint-disable-next-line max-len
        body = body.replace(/(https:\/\/img\.badgesize\.io\/Khan\/KaTeX\/v)(?:.+)(\/dist\/katex\.min\.js\?compression=gzip)/g, `$1${version}$2`);

        // Replace CDN urls
        // 1 - url prefix: "http…/KaTeX/
        // 2 - opening quote: "
        // 3 - preserved suffix: /katex.min.js" integrity="…"
        // 4 - file name: katex.min.js
        // 5 - integrity opening quote: "
        // 6 - old hash: sha384-…
        // 7 - integrity hash algorithm: sha384
        // eslint-disable-next-line max-len
        const cdnRe = /((["'])https?:\/\/cdn\.jsdelivr\.net\/npm\/katex@)[^/"']+(\/([^"']+)\2(?:\s+integrity=(["'])(([^-]+)-[^"']+)\5)?)/g;
        const hashes = {};
        body = body.replace(cdnRe, (m, pre, oq1, post, file, oq2, old, algo) => {
            if (old) {
                hashes[old] = {file, algo};
            }
            return pre + version + post;
        });
        return Promise.all(Object.keys(hashes).map(hash =>
            read(hashes[hash].file, null)
            .then(data => {
                body = body.replace(hash, sriToolbox.generate({
                    algorithms: [hashes[hash].algo],
                }, data));
            })
        )).then(() => write(file, body));
    })
)).then(() => process.exit(0), err => {
    // eslint-disable-next-line no-console
    console.error(err.stack);
    process.exit(1);
});
