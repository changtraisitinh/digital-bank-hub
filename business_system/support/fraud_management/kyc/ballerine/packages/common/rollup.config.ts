import { RollupOptions } from 'rollup';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
// rollup-plugin-size doesn't have a types package.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import size from 'rollup-plugin-size';
import json from '@rollup/plugin-json';
import visualizer from 'rollup-plugin-visualizer';
import replace from '@rollup/plugin-replace';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';
import dts from 'rollup-plugin-dts';
import { readJsonSync } from 'fs-extra';
import { typescriptPaths } from 'rollup-plugin-typescript-paths';

type Options = {
  input: string;
  packageDir: string;
  umdExternal: RollupOptions['external'];
  external: RollupOptions['external'];
  banner: string;
  jsName: string;
  globals: Record<string, string>;
};

const umdDevPlugin = (type: 'development' | 'production') =>
  replace({
    'process.env.NODE_ENV': `"${type}"`,
    delimiters: ['', ''],
    preventAssignment: true,
  });

const babelPlugin = babel({
  babelHelpers: 'bundled',
  exclude: /node_modules/,
  extensions: ['.ts'],
});

export default function rollup(options: RollupOptions): RollupOptions[] {
  return buildConfigs({
    name: 'workflow-core',
    packageDir: '.',
    jsName: 'WorkflowCore',
    outputFile: '.',
    entryFile: 'src/index.ts',
    esm: true,
    cjs: true,
    umd: true,
    globals: {},
  });
}

function buildConfigs(opts: {
  esm: boolean;
  cjs: boolean;
  umd: boolean;
  packageDir: string;
  name: string;
  jsName: string;
  outputFile: string;
  entryFile: string;
  globals: Record<string, string>;
}): RollupOptions[] {
  const input = path.resolve('./', opts.entryFile);

  const packageJson = readJsonSync(path.resolve(process.cwd(), 'package.json')) ?? {};

  const banner = createBanner(opts.name);

  const options: Options = {
    input,
    jsName: opts.jsName,
    packageDir: opts.packageDir,
    external: [
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.peerDependencies ?? {}),
    ],
    umdExternal: Object.keys(packageJson.peerDependencies ?? {}),
    banner,
    globals: opts.globals,
  };

  return [
    opts.esm ? esm(options) : null,
    opts.cjs ? cjs(options) : null,
    opts.umd ? umdDev(options) : null,
    opts.umd ? umdProd(options) : null,
    types(options),
  ].filter(Boolean) as any;
}

function esm({ input, packageDir, external, banner }: Options): RollupOptions {
  return {
    // ESM
    external,
    input,
    output: {
      format: 'esm',
      sourcemap: true,
      dir: `${packageDir}/dist/esm`,
      banner,
      preserveModules: true,
      preserveModulesRoot: path.resolve(process.cwd(), 'src'),
    },
    plugins: [
      babelPlugin,
      nodeResolve({ extensions: ['.ts'] }),
      typescriptPaths({ preserveExtensions: true }),
      json(),
    ],
  };
}

function cjs({ input, external, packageDir, banner }: Options): RollupOptions {
  return {
    // CJS
    external,
    input,
    output: {
      format: 'cjs',
      sourcemap: true,
      dir: `${packageDir}/dist/cjs`,
      preserveModules: true,
      preserveModulesRoot: path.resolve(process.cwd(), 'src'),
      exports: 'named',
      banner,
    },
    plugins: [
      babelPlugin,
      typescriptPaths({ preserveExtensions: true }),
      commonjs(),
      nodeResolve({ extensions: ['.ts'] }),
      json(),
    ],
  };
}

function umdDev({ input, umdExternal, packageDir, banner, jsName }: Options): RollupOptions {
  return {
    // UMD (Dev)
    external: umdExternal,
    input,
    output: {
      format: 'umd',
      sourcemap: true,
      file: `${packageDir}/dist/umd/index.development.js`,
      name: jsName,
      banner,
    },
    plugins: [
      babelPlugin,
      typescriptPaths({ preserveExtensions: true }),
      commonjs(),
      nodeResolve({ extensions: ['.ts'] }),
      umdDevPlugin('development'),
      json(),
    ],
  };
}

function umdProd({ input, umdExternal, packageDir, banner, jsName }: Options): RollupOptions {
  return {
    // UMD (Prod)
    external: umdExternal,
    input,
    output: {
      format: 'umd',
      sourcemap: true,
      file: `${packageDir}/dist/umd/index.production.js`,
      name: jsName,
      banner,
    },
    plugins: [
      babelPlugin,
      typescriptPaths({ preserveExtensions: true }),
      commonjs(),
      nodeResolve({ extensions: ['.ts'] }),
      umdDevPlugin('production'),
      terser(),
      size({}),
      visualizer({
        filename: `${packageDir}/dist/stats-html.html`,
        gzipSize: true,
      }),
      json(),
    ],
  };
}

function types({ input, packageDir, external, banner }: Options): RollupOptions {
  return {
    // TYPES
    external,
    input,
    output: {
      format: 'es',
      file: `${packageDir}/dist/types/index.d.ts`,
      banner,
    },
    plugins: [dts()],
  };
}

function createBanner(libraryName: string) {
  return `/**
 * ${libraryName}
 *
 * Copyright (c) Ballerine
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */`;
}
