const core = require('@actions/core');

const defaultServices = [
    'grafeas',
    'elasticsearch',
    'opa'
]

const getServices = () => {
    const services = [...defaultServices];
    if (!isLocalRode()) {
        services.push('rode');
    }

    return services;
};

const isLocalRode = () => {
    return core.getInput('rodeVersion') === 'local'
}

module.exports = {
    getServices,
    isLocalRode,
}
