import * as core from "@actions/core";

const defaultServices = [
    'grafeas',
    'elasticsearch',
    'opa'
]

export const getServices = () => {
    const services = [...defaultServices];
    if (core.getInput('rodeVersion') !== 'local') {
        services.push('rode');
    }

    return services;
}
