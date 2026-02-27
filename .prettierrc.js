module.exports = {
  bracketSpacing: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 80,
  overrides: [
    {
      files: '**.yml',
      options: {
        singleQuote: false,
      },
    },
  ],
};
