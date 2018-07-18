const resolve = require('resolve');
const path = require('path');

module.exports = {
    interfaceVersion: 2,
    resolve(source, file) {
        if (resolve.isCore(source)) {
            return {found: false}; // disallow Node builtin modules
        }
        try {
            const resolved = resolve.sync(source, {
                extensions : ['.mjs', '.js'], // disallow other module types
                basedir: path.dirname(path.resolve(file)),
            });
            return {found: true, path: resolved};
        } catch (_) {
            return {found: false};
        }
    },
};
