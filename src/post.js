const path = require('path');
const fs = require('fs');

const artifact = require('@actions/artifact');
const core = require('@actions/core');

const {getServices, isLocalRode} = require('./services');
const dockerCompose = require('./docker-compose');

const LOGS_ARTIFACT_NAME = 'rode-dev-env.service.logs'

const addLogsArtifact = async ({logsDir, logPaths}) => {
    if (!process.env.GITHUB_ACTIONS) {
        core.warning("Appear to be running locally, skipping artifact upload");
        return;
    }
    core.info(`Uploading logs as ${LOGS_ARTIFACT_NAME}`);
    const artifactClient = artifact.create();
    await artifactClient.uploadArtifact(LOGS_ARTIFACT_NAME, logPaths, logsDir, {
        continueOnError: true,
        retentionDays: 7,
    });
    core.info('Successfully uploaded logs');
}

const persistLogs = () => {
    const logsDir = core.getState('logsDir');
    if (!logsDir) {
        core.warning("Expected to find logs directory in action state. Skipping log upload");
        return;
    }
    core.info('Gathering service logs');
    const services = getServices();
    const logPaths = [];
    for (let i = 0; i < services.length; i++) {
        const service = services[i];
        const serviceLogs = dockerCompose.logs(service);

        core.info(`Writing logs for ${service}`);
        const logPath = path.join(logsDir, `${service}.log`);
        logPaths.push(logPath);
        fs.writeFileSync(logPath, serviceLogs, 'utf-8');
    }

    if (isLocalRode()) {
        logPaths.push(path.join(logsDir, 'rode.log'));
    }

    return addLogsArtifact({logsDir, logPaths});
};

const stopLocalRode = () => {
    if (!isLocalRode()) {
        return;
    }

    const rodePid = parseInt(core.getState('localRodePid'), 10);
    if (!rodePid) {
        core.warning('Expected to find a PID in action state');
        return;
    }
    core.info(`Stopping local Rode instance (pid: ${rodePid})`);

    process.kill(rodePid, 'SIGTERM');
}

module.exports = async () => {
    core.info('Running rode-dev-env post');

    stopLocalRode();
    await persistLogs();

    core.info('Stopping services');
    dockerCompose.down();
}
