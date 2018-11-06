import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';
import json from 'rollup-plugin-json';

const input = `src/index.ts`;
const output = format => `dist/ts-async-queue.${format}.js`;
const common = target => ({
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true, tsconfigOverride: { compilerOptions: {
      target
    } } }),

    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve({
      module: true,
      jsnext: true
    }),

    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),

    uglify({}),

    // Resolve source maps to the original source
    sourceMaps()
  ],
});

export default [
  {
    input,
    output: [
      { file: output('es5'), format: 'cjs', sourcemap: true, exports: 'named' },
      { file: output('umd'), format: 'umd', sourcemap: true, name: 'TaskQueue', exports: 'named' },
      { file: output('iife'), format: 'iife', sourcemap: true, name: 'TaskQueue', exports: 'named' },
    ],
    ...common('es5')
  },
  {
    input,
    output: { file: output('es'), format: 'es', sourcemap: true },
    ...common('es6')
  },
  {
    input,
    output: { file: output('esnext'), format: 'es', sourcemap: true },
    ...common(''),
    plugins: [
      // Allow json resolution
      json(),
      // Compile TypeScript files
      typescript({ useTsconfigDeclarationDir: true, tsconfigOverride: { compilerOptions: {
        target: 'esnext'
      } } }),

      // Allow node_modules resolution, so you can use 'external' to control
      // which external modules to include in the bundle
      // https://github.com/rollup/rollup-plugin-node-resolve#usage
      resolve({
        module: true,
        jsnext: true
      }),

      // Resolve source maps to the original source
      sourceMaps()
    ]
  }
];
