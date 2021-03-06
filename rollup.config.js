import { resolve } from 'path'
import tsPlugin from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import globals from 'rollup-plugin-node-globals'

const isPlayground = process.env.TARGET === 'playground'
const isRuntime = process.env.TARGET === 'runtime'

const commonConfig = {
  plugins: [
    nodeResolve(),
    commonjs(),
    tsPlugin({
      tsconfig: resolve(__dirname, 'tsconfig.json')
    })
  ],
  onwarn(warning, rollupWarn) {
    if (warning.code !== 'CIRCULAR_DEPENDENCY') {
      rollupWarn(warning)
    }
  }
}

if (isPlayground) {
  commonConfig.plugins.push(globals())
}

const mainConfig = {
  input: 'src/main.ts',
  output: {
    file: 'dist/main.js',
    format: 'cjs'
  },
  ...commonConfig,
  external: ['@babel/plugin-syntax-jsx']
}

const finallyConfigs = [mainConfig]

if (isPlayground) {
  finallyConfigs.push({
    input: 'playground/index.ts',
    output: {
      file: resolve(__dirname, './playground/dist/global.js'),
      format: 'iife',
      globals: {
        vue: 'Vue',
        '@babel/core': 'Babel'
      }
    },
    ...commonConfig,
    external: ['vue', '@babel/core']
  })
}

if (isRuntime || isPlayground) {
  finallyConfigs.push({
    input: 'src/runtime/index.ts',
    output: {
      file: 'dist/runtime.js',
      format: 'es'
    },
    ...commonConfig
  })
}

export default finallyConfigs
