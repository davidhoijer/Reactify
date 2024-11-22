const eslintPluginReact = require("eslint-plugin-react");
const eslintPluginTypescript = require("@typescript-eslint/eslint-plugin");
const eslintParserTypescript = require("@typescript-eslint/parser");
const eslintPluginI18next = require("eslint-plugin-i18next");
const eslintPluginReactHooks = require("eslint-plugin-react-hooks");

module.exports = [
    {
        ignores: ["build"],
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: "module",
            parser: eslintParserTypescript,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                project: ["./tsconfig.json"],
                tsconfigRootDir: ".",
            },
        },
        plugins: {
            react: eslintPluginReact,
            "@typescript-eslint": eslintPluginTypescript,
            i18next: eslintPluginI18next,
            "react-hooks": eslintPluginReactHooks,
        },
        rules: {
            "i18next/no-literal-string": [
                "warn",
                {
                    markupOnly: true,
                    onlyAttribute: ["title", "tooltip"],
                },
            ],
            "react-hooks/exhaustive-deps": "warn",
            "react/jsx-uses-react": "off",
            "react/no-unknown-property": "warn",
            "react/prop-types": "off",
            "react/react-in-jsx-scope": "off",
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },
];
