module.exports = {
    worklet: {
        files: {
            'src/worklet/worklet.ts': ['src/worklet/worklet.ts']
        },
        options: {
            patterns: [
                {
                    match: /.*/s,
                    replacement: (match) => {
                        const workletString = match.replace(/\\/g, '\\\\').replace(/\${/g, '\\${');

                        return `// This is the minified and stringified code of the recorder-audio-worklet-processor package.\nexport const worklet = \`${workletString}\`; // tslint:disable-line:max-line-length\n`;
                    }
                }
            ]
        }
    }
};
