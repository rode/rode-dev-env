const core = require("@actions/core");
const {execFileSync} = require('child_process');

let DOCKERFILE_PATH;

const configure = (dockerfile) => {
    DOCKERFILE_PATH = dockerfile;
};

const up = (services) =>
    runDockerCmd({
        cmd: 'up',
        args: ['--detach', ...services],
        extraEnv: composeEnvironment()
    });

const down = () => runDockerCmd({
    cmd: 'down',
    extraEnv: composeEnvironment(),
})

const ps = () => runDockerCmd({
    cmd: 'ps',
});

const logs = (service) => runDockerCmd({
    cmd: 'logs',
    log: false,
    args: ['--no-color', '--no-log-prefix', service]
});

const composeEnvironment = () => ({
    RODE_VERSION: `v${core.getInput('rodeVersion')}`,
    ELASTICSEARCH_VERSION: core.getInput('elasticsearchVersion'),
    GRAFEAS_VERSION: `v${core.getInput('grafeasVersion')}`,
    OPA_VERSION: core.getInput('opaVersion'),
})

const runDockerCmd = ({cmd, args = [], extraEnv, log = true}) => {
    const opts = {
        shell: false,
    };
    const execArgs = [];
    if (DOCKERFILE_PATH) {
        execArgs.push('-f', DOCKERFILE_PATH);
    }

    execArgs.push(cmd, ...args);

    if (extraEnv) {
        opts.env = {
            ...process.env,
            ...extraEnv,
        }
    }

    try {
        const stdout = execFileSync('docker-compose', execArgs, opts);
        if (log) {
            core.startGroup(`docker-compose ${cmd}`);
            core.info(stdout);
        }

        return stdout;
    } finally {
        if (log) {
            core.endGroup();
        }
    }
};

module.exports = {
    configure,
    up,
    down,
    ps,
    logs
}
