const fs = require('fs');
const os = require('os');
const path = require('path');

const artifact = require('@actions/artifact');
const core = require('@actions/core');

const dockerCompose = require('./docker-compose');
const {getServices} = require('./services.js');

module.exports = async () => {
    core.info('Running rode-dev-env post');
    const services = getServices();

    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'services-'));
    core.info(`Gather logs, will write them to ${dir}`);
    const logPaths = [];
    for (let i = 0; i < services.length; i++) {
        const service = services[i];
        const serviceLogs = dockerCompose.logs(service);

        core.info(`Writing logs for ${service}`);
        const logPath = path.join(dir, `${service}.log`);
        logPaths.push(logPath);
        fs.writeFileSync(logPath, serviceLogs, 'utf-8');
    }

    core.info('Uploading logs');
    await uploadLogs({dir, logPaths});

    core.info('Stopping services');
    dockerCompose.down();
}

const uploadLogs = async ({dir, logPaths}) => {
    if (!process.env.CI) {
        core.warning("Appear to be running locally, skipping artifact upload");
        return;
    }

    const artifactClient = artifact.create();
    await artifactClient.uploadArtifact('rode-dev-env.service.logs', logPaths, dir, {
        continueOnError: true,
        retentionDays: 7,
    });
}
