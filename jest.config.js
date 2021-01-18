module.exports = {
    collectCoverage: true,
    transform: { '\\.js$': 'babel-jest', },
    moduleNameMapper: {
        "\\.(css|sass)$": "<rootDir>/scripts/tests/mocks/style.sass.js"
    }
};
