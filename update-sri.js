// Update badge and CDN urls and subresource integrity hashes
// Usage: node update-sri.js <VERSION> FILES...
// To check SRI hashes, pass `check` as VERSION
const fs = require("fs-extra");
const sriToolbox = require("sri-toolbox");

const version = process.argv[2];

Promise.all(process.argv.slice(3).map(file =>
    fs.readFile(file, "utf8")
    .then(body => {
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
        const promise = Promise.all(Object.keys(hashes).map(hash =>
            fs.readFile(hashes[hash].file, null)
            .then(data => {
                const newHash = sriToolbox.generate({
                    algorithms: [hashes[hash].algo],
                }, data);
                body = body.replace(
                    new RegExp(hash.replace(/\+/g, '\\+'), 'g'), newHash);

                if (version === "check" && hash !== newHash) {
                    throw new Error("SRI mismatch! " +
                        "Please run the release script again.");
                }
            })
        ));
        return version === "check" ? promise
            : promise.then(() => fs.writeFile(file, body));
    })
)).then(() => process.exit(0), err => {
    // eslint-disable-next-line no-console
    console.error(err.stack);
    process.exit(1);
});
