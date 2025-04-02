# stylelint-no-top-level-selector ✂️

A Stylelint plugin that prevents the use of restricted selectors at the top level of your CSS.

[![npm version](https://badge.fury.io/js/stylelint-no-top-level-selector.svg)](https://www.npmjs.com/package/stylelint-no-top-level-selector)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Installation

```bash
npm install stylelint-no-top-level-selector --save-dev
```

## 🛠 Configuration

Add to your Stylelint config:

```js
module.exports = {
  plugins: ['stylelint-no-top-level-selector'],
  rules: {
    'plugin/no-top-level-selector': [true, {
      restrictedSelectors: ['body', 'html', /^[a-z]+$/],
      ignoreSelectors: [':root', /^--/],
      customMessage: selector => `"${selector}" should be nested`
    }]
  }
}
```

## 🔧 Options

- `restrictedSelectors`: (string|RegExp)[]  
  Selectors that trigger errors when at top level
- `ignoreSelectors`: (string|RegExp)[]  
  Selectors to exclude from checking
- `customMessage`: string|function  
  Custom error message (default shows selector)

## ✅ Valid CSS

```css
.container {
  & > div { /* OK: Nested element */ }
}

:root { /* OK: In ignore list */ }
```

## ❌ Invalid CSS

```css
body { /* Error: Top-level element */ }
div { /* Error: Matches /^[a-z]+$/ */ }
```
