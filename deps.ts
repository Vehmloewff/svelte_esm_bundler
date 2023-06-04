export * as flags from 'https://deno.land/std@0.165.0/flags/mod.ts'
export * as unwindCompiler from 'https://code.jikno.com/unwind@0.1.6/compiler/mod.ts'
export * as pathUtils from 'https://deno.land/std@0.165.0/path/mod.ts'

// @deno-types="https://deno.land/x/esbuild@v0.15.13/mod.d.ts"
import * as esBuildWasm from 'https://deno.land/x/esbuild@v0.15.13/wasm.js'
// @deno-types="https://deno.land/x/esbuild@v0.15.13/mod.d.ts"
import * as esBuildNative from 'https://deno.land/x/esbuild@v0.15.13/mod.js'
export * as esBuildTypes from 'https://deno.land/x/esbuild@v0.15.13/mod.d.ts'
export const esBuild = Deno.run === undefined ? esBuildWasm : esBuildNative

export { createCache, type Loader } from 'https://deno.land/x/deno_cache@0.4.1/mod.ts'
export { compile as compileSvelte, preprocess as preprocessSvelte } from 'https://cdn.jsdelivr.net/npm/svelte@3.49.0/compiler.mjs'

export { denoPlugin } from 'https://deno.land/x/esbuild_deno_loader@0.5.2/mod.ts'
export * as colors from 'https://deno.land/std@0.165.0/fmt/colors.ts'
