{
    "parser": "@babel/eslint-parser",
    "plugins": [
        "flowtype"
    ],
    "extends": [
        "eslint:recommended",
        "plugin:flowtype/recommended",
        "plugin:actions/recommended",
        "plugin:import/recommended"
    ],
    "rules": {
        "arrow-spacing": 2,
        "brace-style": [2, "1tbs", { "allowSingleLine": true }],
        // We'd possibly like to remove the 'properties': 'never' one day.
        "camelcase": [2, { "properties": "never" }],
        // Require dangling commas for all but function calls
        // (a feature added in ECMAScript 2017).
        "comma-dangle": [2, {
          "arrays": "always-multiline",
          "objects": "always-multiline",
          "imports": "always-multiline",
          "exports": "always-multiline",
          "functions": "only-multiline",
        }],
        "comma-spacing": [2, { "before": false, "after": true }],
        "constructor-super": 2,
        "curly": 2,
        "eol-last": 2,
        "eqeqeq": [2, "allow-null"],
        "guard-for-in": 2,
        "indent": "off",
        "indent-legacy": [2, 4, {"SwitchCase": 1}],
        "keyword-spacing": 2,
        "linebreak-style": [2, "unix"],
        "max-len": [2, 84, 4, { "ignoreUrls": true, "ignorePattern": "\\brequire\\([\"']|eslint-disable" }],
        "new-cap": 2,
        "no-alert": 2,
        "no-array-constructor": 2,
        "no-console": 2,
        "no-const-assign": 2,
        "no-debugger": 2,
        "no-dupe-class-members": 2,
        "no-dupe-keys": 2,
        "no-extra-bind": 2,
        "no-new": 2,
        "no-new-func": 2,
        "no-new-object": 2,
        "no-prototype-builtins": 0,
        "no-spaced-func": 2,
        "no-this-before-super": 2,
        "no-throw-literal": 2,
        "no-trailing-spaces": 2,
        "no-undef": 2,
        "no-unexpected-multiline": 2,
        "no-unreachable": 2,
        "no-unused-vars": [2, {"args": "none", "varsIgnorePattern": "^_*$"}],
        "no-useless-call": 2,
        "no-var": 2,
        "no-with": 2,
        "object-curly-spacing": [2, "never"],
        "one-var": [2, "never"],
        "prefer-const": 2,
        "prefer-spread": 0, // re-enable once we use es6
        "semi": [2, "always"],
        "space-before-blocks": 2,
        "space-before-function-paren": [2, "never"],
        "space-infix-ops": 2,
        "space-unary-ops": 2,
        // ---------------------------------------
        // Stuff we explicitly disable.
        // We turned this off because it complains when you have a
        // multi-line string, which I think is going too far.
        "prefer-template": 0,
        // We've decided explicitly not to care about this.
        "arrow-parens": 0,
        // ---------------------------------------
        // TODO(csilvers): enable these if/when community agrees on it.
        "prefer-arrow-callback": 0,
        // Might be nice to turn this on one day, but since we don't
        // use jsdoc anywhere it seems silly to require it yet.
        "valid-jsdoc": 0,
        "require-jsdoc": 0,
        // We frequently `import` and `import type` from the same module.
        "import/no-duplicates": 0,
        // We use `import mod from "mod"` a lot.
        "import/no-named-as-default": 0,
        "import/no-named-as-default-member": 0,
    },
    "env": {
        "es6": true,
        "node": true,
        "browser": true,
        "jest": true
    },
    "settings": {
        "import/external-module-folders": [".yarn", "node_modules"],
        "import/resolver": {
            "webpack": {
                "config-index": 0
            }
        },
        "react": {
            "version": "16.8"
        }
    },
    "overrides": [{
        "files": ["katex.js", "src/**/*.js", "contrib/**/*.js"],
        "excludedFiles": ["*-spec.js", "unicodeAccents.js", "unicodeSymbols.js"],
        "rules": {
            "no-restricted-syntax": [2, "ForOfStatement", "ClassDeclaration[superClass]", "ClassExpression[superClass]"]
        },
        "env": {
            "node": false,
            "jest": false
        }
    }, {
        "files": ["website/**/*.js"],
        "parserOptions": {
            "babelOptions": {
                "presets": ["@babel/preset-react"]
            }
        },
        "extends": [
            "plugin:react/recommended"
        ],
        "rules": {
            "react/prop-types": 0
        }
    }, {
        "files": [".github/workflows/*.{yaml,yml}/**/*.js"],
        "rules": {
            "indent-legacy": [2, 4, {"SwitchCase": 1, "outerIIFEBody": 0}],
        }
    }],
    "root": true
}
