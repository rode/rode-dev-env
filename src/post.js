const core = require('@actions/core');

const dockerCompose = require('./docker-compose');

module.exports = async () => {
    core.info('Running rode-dev-env post');

    core.info('Dumping logs');
    dockerCompose.logs();

    core.info('Stopping services');
    dockerCompose.down();
}
