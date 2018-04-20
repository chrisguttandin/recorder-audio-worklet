const readFileSync = require('fs').readFileSync;

module.exports = {
    worklet: {
        files: {
            'src/worklet/worklet.ts': [
                'src/worklet/worklet.ts'
            ]
        },
        options: {
            patterns: [ {
                match: /export\sconst\sworklet\s=\s`(.*)`;/g,
                replacement: () => {
                    const workletPath = require.resolve('recorder-audio-worklet-processor/build/es5/worklet.min');
                    const workletString = readFileSync(workletPath, { encoding: 'utf8' })
                        .replace(/\\/g, '\\\\')
                        .replace(/\${/g, '\\${');

                    return `export const worklet = \`${ workletString }\`;`;
                }
            } ]
        }
    }
};
