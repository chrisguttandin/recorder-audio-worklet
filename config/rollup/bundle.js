import MemoryFileSystem from 'memory-fs';
import babel from 'rollup-plugin-babel';
import { readFileSync } from 'fs';
import replace from 'rollup-plugin-replace';
import webpack from 'webpack';
import webpackConfig from '../webpack/config.js';

const workletFile = readFileSync('src/worklet/worklet.ts', 'utf-8');
const result = /export\sconst\sworklet\s=\s`(.*)`;/g.exec(workletFile);

if (result === null) {
    throw new Error('The worklet file could not be parsed.');
}

const workletString = result[1];
const memoryFileSystem = new MemoryFileSystem();

export default new Promise((resolve, reject) => {
    const compiler = webpack(webpackConfig);

    compiler.outputFileSystem = memoryFileSystem;
    compiler.run((err, stats) => {
        if (stats.hasErrors() || stats.hasWarnings()) {
            reject(new Error(stats.toString({ errorDetails: true, warnings: true })));
        }

        resolve({
            input: 'build/es2018/module.js',
            output: {
                file: 'build/es5/bundle.js',
                format: 'umd',
                name: 'recorderAudioWorklet'
            },
            plugins: [
                replace({
                    delimiters: [ '`', '`' ],
                    include: 'build/es2018/worklet/worklet.js',
                    values: {
                        [ workletString ]: `\`${ memoryFileSystem.readFileSync('/worklet.js', 'utf-8') }\``
                    }
                }),
                babel({
                    exclude: 'node_modules/**',
                    plugins: [
                        '@babel/plugin-external-helpers',
                        '@babel/plugin-transform-runtime'
                    ],
                    presets: [
                        [
                            '@babel/preset-env',
                            {
                                modules: false
                            }
                        ]
                    ],
                    runtimeHelpers: true
                })
            ]
        });
    });
});
