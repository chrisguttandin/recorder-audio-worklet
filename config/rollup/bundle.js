import MemoryFileSystem from 'memory-fs';
import babel from 'rollup-plugin-babel';
import { readFileSync } from 'fs';
import replace from 'rollup-plugin-replace';
import webpack from 'webpack';
import webpackConfig from '../webpack/config';

const workletFile = readFileSync('src/worklet/worklet.ts', 'utf-8');
const result = /export\sconst\sworklet\s=\s`(?<workletString>.*)`;/g.exec(workletFile);

if (result === null) {
    throw new Error('The worklet file could not be parsed.');
}

const workletString = result.groups.workletString;
const memoryFileSystem = new MemoryFileSystem();

export default new Promise((resolve, reject) => { // eslint-disable-line import/no-default-export
    const compiler = webpack(webpackConfig);

    compiler.outputFileSystem = memoryFileSystem;
    compiler.run((err, stats) => {
        if (stats.hasErrors() || stats.hasWarnings()) {
            reject(new Error(stats.toString({ errorDetails: true, warnings: true })));
        } else {
            const transpiledWorkletString = memoryFileSystem
                .readFileSync('/worklet.js', 'utf-8')
                .replace(/\\/g, '\\\\')
                .replace(/\${/g, '\\${');

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
                            // V8 does only accept substrings with a maximum length of 32767 characters. Otherwise it throws a SyntaxError.
                            [ workletString.slice(0, 32767) ]: `\`${ transpiledWorkletString }\``,
                            [ workletString.slice(32767) ]: ''
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
        }
    });
});
