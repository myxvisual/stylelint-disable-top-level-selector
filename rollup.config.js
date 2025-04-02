import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.ts', // Your entry file
  output: {
    file: 'dist/index.js',
    format: 'cjs', // Will be transpiled to ES5 syntax
    exports: 'default',
    sourcemap: true
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      useTsconfigDeclarationDir: true,
      tsconfigOverride: {
        compilerOptions: {
          target: 'es5', // Target ES5
          module: 'ES2015',
          declaration: true,
          declarationDir: 'dist/types'
        }
      }
    })
  ],
  external: ['stylelint'] // Mark stylelint as external
};