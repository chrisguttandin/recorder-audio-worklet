module.exports = {
    'continuous': {
        configFile: 'config/karma/config.js'
    },
    'test': {
        configFile: 'config/karma/config.js',
        singleRun: true
    },
    'test-expectation-safari': {
        configFile: 'config/karma/config-expectation-safari.js',
        singleRun: true
    }
};
