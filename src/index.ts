import * as stylelint from 'stylelint';
import { Rule } from  'postcss';

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions }
} = stylelint;

// Define the rule name and error messages
const ruleName = 'plugin/disable-top-level-selector';
const defaultMessages: stylelint.RuleMessages = ruleMessages(ruleName, {
  rejected: (selector: string) => `Unexpected top-level selector: ${selector}`,
});

// Type definitions for the rule options
type Pattern = string | RegExp;
type PatternArray = Pattern[];
type CustomMessage = (selector: string) => string;

interface RuleOptions {
  restrictedSelectors?: Pattern | PatternArray;
  ignoreSelectors?: Pattern | PatternArray;
  customMessage?: CustomMessage;
}

/**
 * Checks if a value is a string
 */
const isString = (value: unknown): value is string => typeof value === 'string';

/**
 * Checks if a value is a RegExp
 */
const isRegExp = (value: unknown): value is RegExp => value instanceof RegExp;

/**
 * Checks if a value is an array of strings or RegExps
 */
const isPatternArray = (value: unknown): value is PatternArray => {
  return Array.isArray(value) && value.every(item => isString(item) || isRegExp(item));
};

/**
 * Schema for validating rule options
 */
const optionsSchema = {
  restrictedSelectors: [isString, isRegExp, isPatternArray],
  ignoreSelectors: [isString, isRegExp, isPatternArray],
  customMessage: [
    isString, 
    (value: unknown): value is (selector: string) => string => typeof value === 'function',
    (value: unknown): value is Array<string | ((selector: string) => string)> => {
      return Array.isArray(value) && value.every(item => isString(item) || typeof item === 'function');
    }
  ],
};

/**
 * Converts a value to an array if it isn't already one
 */
const ensureArray = <T>(value: T | T[]): T[] => Array.isArray(value) ? value : [value];

/**
 * Checks if a selector matches any of the given patterns
 */
const matchesPattern = (selector: string, patterns: Pattern[]): boolean => {
  return patterns.some(pattern => 
    pattern instanceof RegExp ? pattern.test(selector) : selector === pattern
  );
};



const ruleFunction = (enable: boolean, primary: RuleOptions = {}, context: stylelint.RuleContext) => {
  return (root: Rule, result: stylelint.PostcssResult) => {
    if (!enable) {
      return;
    }

    // Validate the provided options against our schema
    const isValidOptions = validateOptions(
      result,
      ruleName,
      {
        actual: primary,
        possible: optionsSchema,
        optional: true
      }
    );

    // Skip if options are invalid or no restricted selectors are defined
    if (!isValidOptions || !primary?.restrictedSelectors) {
      return;
    }

    // Prepare patterns and messages
    const restrictedPatterns = ensureArray(primary.restrictedSelectors);
    const ignorePatterns = primary.ignoreSelectors ? ensureArray(primary.ignoreSelectors) : [];
    const messages = primary.customMessage 
      ? stylelint.utils.ruleMessages(ruleName, { rejected: primary.customMessage }).rejected
      : defaultMessages.rejected;

    /**
     * Processes each CSS rule node to check for restricted top-level selectors
     */
    const processRule = (ruleNode: Rule, index: number): void => {
      const isTopLevel = ruleNode?.parent?.type === 'root';
      
      ruleNode.selectors.forEach((selector: string) => {
        const trimmedSelector = selector?.trim();

        // Skip if selector is in ignore list
        if (matchesPattern(trimmedSelector, ignorePatterns)) {
          return;
        }
        

        // Check if selector matches any restricted pattern at top level
        if (isTopLevel && matchesPattern(trimmedSelector, restrictedPatterns)) {
          report({
            result,
            ruleName,
            message: messages,
            messageArgs: [trimmedSelector],
            node: ruleNode,
            word: trimmedSelector,
          });
        }
      });
    };

    // Walk through all rule nodes in the CSS
    root.walkRules((ruleNode: Rule, index: number) => {
      processRule(ruleNode, index);
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = defaultMessages;
ruleFunction.meta = {
  url: "https://github.com/myxvisual/stylelint-disable-top-level-selector",
};

/**
 * Stylelint plugin that prevents the use of restricted selectors at the top level
 */
const plugin = createPlugin(ruleName, ruleFunction as unknown as stylelint.Rule);

export default plugin;