const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('@actions/http-client');
const {spawn} = require('child_process');

const core = require('@actions/core');
const dockerCompose = require('./docker-compose');
const {getServices, isLocalRode} = require('./services');

const READY_ATTEMPTS = 5;
const READY_CHECK_INTERVAL = 5000;
const outputs = {
    'rodeHost': 'localhost:50051',
    'opaUrl': 'http://localhost:8181',
    'elasticsearchUrl': 'http://localhost:9200',
    'grafeasHost': 'localhost:8080',
};

const setOutputs = () => {
    Object
        .entries(outputs)
        .forEach(([key, value]) => {
            core.setOutput(key, value);
        });
};

const startLocalRode = async (logsDir) => {
    if (!isLocalRode()) {
        return Promise.resolve();
    }
    core.info('Starting local Rode');
    const logsPath = path.join(logsDir, 'rode.log')
    const logs = fs.createWriteStream(logsPath, {flags: 'a'});

    return new Promise((resolve) => {
        logs.once('open', () => {
            const rodeDir = process.env.GITHUB_WORKSPACE || '.';
            core.info(`Spawning Rode process, sending logs to ${logsPath}`);
            const rode = spawn(path.join(rodeDir, 'rode'), {
                detached: true,
                cwd: rodeDir,
                env: {
                    ...process.env,
                    GRAFEAS_HOST: outputs.grafeasHost,
                    ELASTICSEARCH_HOST: outputs.elasticsearchUrl,
                    OPA_HOST: outputs.opaUrl,
                },
                stdio: ['ignore', logs, logs]
            });
            core.saveState('localRodePid', rode.pid);
            core.info(`Spawned rode with pid ${rode.pid}`);
            rode.unref();
            resolve();
        });
    });
};

const sleep = (time) => new Promise((resolve => setTimeout(resolve, time)))

const waitForRodeToStart = async () => {
    const client = new http.HttpClient();

    core.info('Waiting for Rode to start');
    for (let i = 0; i < READY_ATTEMPTS; i++) {
        try {
            core.info('Checking if Rode is ready...');
            const response = await client.get(`http://${outputs.rodeHost}/v1alpha1/policy-groups`);

            if (response.message.statusCode === 200) {
                core.info('Rode has started');
                return;
            }
        } catch (e) {
            core.info(`Error waiting for Rode to start (attempt ${i+1}/${READY_ATTEMPTS}): ${e.stack}`);
        }
        await sleep(READY_CHECK_INTERVAL);
    }
    throw new Error('Timed out waiting for Rode to start');
};

const createLogsDir = () => {
    core.info('Creating logs directory');
    const logsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rode-dev-env-services-'));
    core.info(`Logs will be sent to ${logsDir}`);
    core.saveState('logsDir', logsDir);

    return logsDir;
};

module.exports = async () => {
    core.info('Running rode-dev-env main');
    const logsDir = createLogsDir();

    const services = getServices();
    core.info('Starting services');
    dockerCompose.up(services);
    dockerCompose.ps();

    await startLocalRode(logsDir);
    await waitForRodeToStart();

    core.info('Setting outputs');
    setOutputs();
}
