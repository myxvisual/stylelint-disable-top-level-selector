module.exports = {
  plugins: [
    './dist/index.js' // Path to your compiled plugin
  ],
  rules: {
    'plugin/disable-top-level-selector': [true, {
      // These selectors will trigger errors when at top level
      restrictedSelectors: [
        'body',
        'html',
        /^\.component-[a-z]+/i, // Matches class names like ".component-foo"
      ],
      // These selectors will be ignored even if they match restricted patterns
      ignoreSelectors: [
        ':root',
        /^\.safe-[a-z]+/i, // Matches class names like ".safe-foo"
      ],
      // Custom error message (optional)
      customMessage: selector => `Top-level selector "${selector}" is not allowed. Wrap it in a class.`
    }]
  }
};