const fs = require('fs');
const path = require('path');
const {pathToFileURL} = require('url');

const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.resolve(rootDir, 'package.json');
const {version: packageVersion} = JSON.parse(
    fs.readFileSync(packageJsonPath, 'utf8'),
);

const distEsmPath = path.resolve(rootDir, 'dist', 'katex.mjs');
const distCjsPath = path.resolve(rootDir, 'dist', 'katex.js');

for (const distPath of [distEsmPath, distCjsPath]) {
    const source = fs.readFileSync(distPath, 'utf8');
    if (source.includes('__VERSION__')) {
        throw new Error(
            `dist/${path.basename(distPath)} still contains __VERSION__.`);
    }
}

const assertVersion = (katex, bundlePath) => {
    if (!katex || typeof katex.version !== 'string' || katex.version.length === 0) {
        throw new Error(`dist/${bundlePath} has missing or invalid version.`);
    }

    if (katex.version !== packageVersion) {
        throw new Error(
            `dist/${bundlePath} exports version ${katex.version}, `
            + `expected ${packageVersion}.`,
        );
    }
};

assertVersion(require(distCjsPath), 'katex.js');

(async() => {
    const katexModule = await import(pathToFileURL(distEsmPath).href);
    const katex = katexModule.default;
    assertVersion(katex, 'katex.mjs');
})();
