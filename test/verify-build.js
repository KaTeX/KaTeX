const fs = require('fs');
const path = require('path');
const {pathToFileURL} = require('url');

const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.resolve(rootDir, 'package.json');
const {version: packageVersion} = JSON.parse(
    fs.readFileSync(packageJsonPath, 'utf8'),
);

const distDir = path.resolve(rootDir, 'dist');

// Ensure contrib ESM modules import KaTeX relatively (no bundling).
const contribDir = path.resolve(distDir, 'contrib');
for (const filename of [
    'auto-render.mjs',
    'mathtex-script-type.mjs',
    'mhchem.mjs',
    'render-a11y-string.mjs',
]) {
    const source = fs.readFileSync(path.resolve(contribDir, filename), 'utf8');
    const relativeImport = /(^|\n)import katex from '\.\.\/katex\.mjs';\n/;
    if (!relativeImport.test(source)) {
        throw new Error(
            `dist/contrib/${filename} is missing a relative katex import.`);
    }
    if (source.includes("import katex from 'katex';")) {
        throw new Error(
            `dist/contrib/${filename} still imports katex by package name.`);
    }
}

// Ensure __VERSION__ is resolved in katex.*js
const distEsmPath = path.resolve(distDir, 'katex.mjs');
const distCjsPath = path.resolve(distDir, 'katex.js');

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
