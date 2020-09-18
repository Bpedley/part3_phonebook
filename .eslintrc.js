module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true
  },
  extends: "eslint:recommended",
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    eqeqeq: "error",
    indent: ["error", 2],
    "no-trailing-spaces": "error",
    "arrow-spacing": ["error", { before: true, after: true }],
    "object-curly-spacing": ["error", "always"],
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "no-console": 0
  }
};
