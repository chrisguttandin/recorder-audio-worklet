module.exports = {
    worklet: {
        files: {
            'src/worklet/worklet.ts': [
                'src/worklet/worklet.ts'
            ]
        },
        options: {
            patterns: [ {
                match: /(.*)/s,
                replacement: (match) => {
                    const workletString = match
                        .replace(/\\/g, '\\\\')
                        .replace(/\${/g, '\\${');

                    return `// tslint:disable-next-line:max-line-length\nexport const worklet = \`${ workletString }\`;\n`;
                }
            } ]
        }
    }
};
