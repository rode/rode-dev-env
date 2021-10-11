const core = require('@actions/core');

const defaultServices = [
    'grafeas',
    'elasticsearch',
    'opa'
]

const getServices = () => {
    const services = [...defaultServices];

    if (isAuthEnabled()) {
        services.push('oidc-provider');
    }

    if (isLocalRode()) {
        return services;
    }

    services.push(isAuthEnabled() ? 'rode-with-auth': 'rode');

    return services;
};

const isLocalRode = () => core.getInput('rodeVersion') === 'local';

const isAuthEnabled = () => core.getInput('authEnabled') === 'true';

module.exports = {
    getServices,
    isLocalRode,
    isAuthEnabled,
}
