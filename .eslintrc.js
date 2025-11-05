// eslint-disable-next-line unicorn/prefer-module
module.exports = {
  env: {
    browser: true,
    es2023: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:unicorn/recommended",
    "prettier",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "prettier", "unicorn", "react"],
  rules: {
    "prettier/prettier": ["error", { endOfLine: "auto" }],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    //JS Rules
    "object-shorthand": ["error", "always"], //Always prefer shorthand {foo: foo} => {foo}
    "no-negated-condition": "error", //Prefer if(a){}else{} to if(!a){}else{}
    eqeqeq: "error", //Always use === not ==
    "func-style": ["warn", "expression"], //Prefer const a = function(){} to avoid hoisting, which produces hard-to-read code
    "no-eval": ["error", { allowIndirect: false }], //Don't use eval. It's slow and potentially insecure
    "no-implied-eval": "error", //See above
    yoda: "error", //Constant conditions come second
    "no-var": "error", //Use let or const. It is safer
    "no-with": "error", //Avoide with keyword. Clearer code
    "no-useless-computed-key": "error", //Prefer {"a": "b"} to {["a"]: "b"}

    //Enforce file naming conventions
    "unicorn/filename-case": [
      "error",
      {
        cases: {
          camelCase: true,
          pascalCase: true,
        },
      },
    ],

    "unicorn/no-useless-undefined": [
      "off",
      { checkArguments: false, checkArrowFunctionBody: false },
    ],

    "unicorn/prefer-top-level-await": "off", //This isn't backwards compatible
    "unicorn/prefer-node-protocol": "off", //This isn't compatible with polyfill

    //JSX Rules
    "react/jsx-sort-props": [
      //Sort props by a set of rules
      "error",
      { callbacksLast: true, shorthandFirst: true },
    ],
    "react/jsx-boolean-value": "error", //Allow props to turn prop={true} to just prop
    "react/jsx-curly-brace-presence": [
      "error",
      { props: "always", propElementValues: "always", children: "ignore" },
    ],
    "react/jsx-no-leaked-render": [
      //Prevents bad render fallthrough values (e.g. <div>{0 && <div/>}</div>)
      "error",
      { validStrategies: ["ternary", "coerce"] },
    ],

    //Allow prop as a term
    "unicorn/prevent-abbreviations": [
      "error",
      {
        replacements: {
          prop: false,
          props: false,
        },
      },
    ],
    "react-hooks/exhaustive-deps": [
      "warn",
      { additionalHooks: "(useFind|useTracker)" },
    ],

    "unicorn/no-array-callback-reference": "off", //This doesn't play nice with meteor collections
    "unicorn/no-array-method-this-argument": "off", //See above
  },
  ignorePatterns: ["node_modules", ".vscode", ".git", ".meteor"],
};
