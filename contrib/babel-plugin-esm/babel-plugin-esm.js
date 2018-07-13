module.exports = ({types: t}) => ({
    visitor: {
        /**
         * Append extension and normalize path of import statement
         */
        ImportDeclaration(path, state) {
            const source = path.get("source");
            if (!t.isStringLiteral(source)) {
                return;
            }

            // source files and font metrics data are moved to lib/
            let sourceValue = source.node.value
                .replace(/^\.\/src\//, "./lib/")
                .replace(/^\.\.\/submodules\/katex-fonts\//, "./");

            // browsers are not able to resolve paths like Node and need full URLs
            if (!sourceValue.endsWith(".js")) {
                sourceValue += ".js";
            }

            source.replaceWith(t.stringLiteral(sourceValue));
        },
    },
});
