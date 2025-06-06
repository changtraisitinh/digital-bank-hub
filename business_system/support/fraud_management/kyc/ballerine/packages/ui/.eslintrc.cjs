/**@type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['plugin:tailwindcss/recommended', '@ballerine/eslint-config-react'],
  settings: {
    tailwindcss: {
      callees: ['ctw'],
    },
  },
  rules: {
    'tailwindcss/no-custom-classname': 'off',
    'tailwindcss/classnames-order': 'off',
  },
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: 'tsconfig.eslint.json',
  },
};
