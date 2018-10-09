module.exports = {
    build: [
        'clean:build',
        'webpack',
        'replace:worklet',
        'sh:build-es2015',
        'sh:build-es5',
        'sh:build-esm'
    ],
    continuous: [
        'build',
        'karma:continuous'
    ],
    lint: [
        'eslint',
        // @todo Use grunt-lint again when it support the type-check option.
        'sh:lint'
    ],
    test: [
        'build',
        'karma:test'
    ]
};
