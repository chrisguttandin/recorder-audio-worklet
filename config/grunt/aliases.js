const { env } = require('process');

module.exports = {
    build: [
        'clean:build',
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
    // @todo Enable expectation tests for Safari again when SauceLabs supports Safari 11.1.
    test: (env.TRAVIS)
        ? [ 'build', 'karma:test' ]
        : [ 'build', 'karma:test', 'karma:test-expectation-safari' ]
};
