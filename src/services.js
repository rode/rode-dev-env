const core = require('@actions/core');

const defaultServices = [
    'grafeas',
    'elasticsearch',
    'opa'
]

const getServices = () => {
    const services = [...defaultServices];
    if (core.getInput('rodeVersion') !== 'local') {
        services.push('rode');
    }

    return services;
};

module.exports = {
    getServices,
}
