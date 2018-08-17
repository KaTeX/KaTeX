const fs = require('fs-extra');

if (process.env.npm_lifecycle_event === 'publish-gh-pages') {
    fs.removeSync('../docs');
    fs.moveSync('../docs.bak', '../docs');
}
