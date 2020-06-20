import babel from 'rollup-plugin-babel';
import { fs } from 'memfs';
import { join } from 'path';
import { readFileSync } from 'fs';
import replace from '@rollup/plugin-replace';
import webpack from 'webpack';
import webpackConfig from '../webpack/config';

const workletFile = readFileSync('src/worklet/worklet.ts', 'utf-8');
const result = /export\sconst\sworklet\s=\s`(?<workletString>.*)`;/g.exec(workletFile);

if (result === null) {
    throw new Error('The worklet file could not be parsed.');
}

const workletString = result.groups.workletString;

// eslint-disable-next-line import/no-default-export
export default new Promise((resolve, reject) => {
    const compiler = webpack(webpackConfig);

    compiler.outputFileSystem = { ...fs, join };
    compiler.run((err, stats) => {
        if (stats.hasErrors() || stats.hasWarnings()) {
            reject(new Error(stats.toString({ errorDetails: true, warnings: true })));
        } else {
            const transpiledWorkletString = fs // eslint-disable-line node/no-sync
                .readFileSync('/worklet.js', 'utf-8')
                .replace(/\\/g, '\\\\')
                .replace(/\${/g, '\\${');

            resolve({
                input: 'build/es2019/module.js',
                output: {
                    file: 'build/es5/bundle.js',
                    format: 'umd',
                    name: 'recorderAudioWorklet'
                },
                plugins: [
                    replace({
                        delimiters: ['`', '`'],
                        include: 'build/es2019/worklet/worklet.js',
                        values: {
                            // V8 does only accept substrings with a maximum length of 32767 characters. Otherwise it throws a SyntaxError.
                            [workletString.slice(0, 32767)]: `\`${transpiledWorkletString}\``,
                            [workletString.slice(32767)]: ''
                        }
                    }),
                    babel({
                        exclude: 'node_modules/**',
                        plugins: ['@babel/plugin-external-helpers', '@babel/plugin-transform-runtime'],
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
        }
    });
});
