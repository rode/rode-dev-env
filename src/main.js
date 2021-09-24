const core = require('@actions/core');
const dockerCompose = require('./docker-compose');
const {getServices} = require('./services.js');

const outputs = {
    'rodeHost': 'localhost:50051',
    'opaUrl': 'http://localhost:8181',
    'elasticsearchUrl': 'http://localhost:9200',
    'grafeasElasticsearchHost': 'localhost:8080',
};

const setOutputs = () => {
    Object
        .entries(outputs)
        .forEach(([key, value]) => {
            core.setOutput(key, value);
        });
};

module.exports = () => {
    core.info('Running rode-dev-env main');

    const services = getServices();

    core.info('Starting services');
    dockerCompose.up(services);
    dockerCompose.ps();
    core.info('Setting outputs');
    setOutputs();
}
