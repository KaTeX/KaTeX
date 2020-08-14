module.exports = function({types: t}) {
    return {
        name: "remove-glyph-table",
        visitor: {
            ExportNamedDeclaration(path) {
                // export const GlyphTable
                const declaration = path.get("declaration");
                if (!declaration.isVariableDeclaration()) {
                    return;
                }

                const declarations = declaration.get("declarations");
                if (declarations.length !== 1) {
                    return;
                }

                const id = declarations[0].get('id');
                if (id.isIdentifier({name: "GlyphTable"})) {
                    path.remove();
                }
            },
            FunctionDeclaration(path) {
                // function g(...) {...}
                const id = path.get('id');
                if (id.isIdentifier({name: "g"})) {
                    path.remove();
                }
            },
            CallExpression(path, state) {
                // g(...)
                const callee = path.get("callee");
                if (!callee.isIdentifier({name: "g"})) {
                    return;
                }

                const args = path.get("arguments");
                if (path.parentPath.isExpressionStatement()) {
                    path.remove();
                } else {
                    path.replaceWith(args[0]);
                }
            },
        },
    };
};
