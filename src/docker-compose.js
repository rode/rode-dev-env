const core = require("@actions/core");
const path = require('path');
const {execFileSync} = require('child_process');

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

const logs = () => runDockerCmd({
    cmd: 'logs',
    args: ['--no-color', '--no-log-prefix']
});

const composeEnvironment = () => ({
    RODE_VERSION: `v${core.getInput('rodeVersion')}`,
    ELASTICSEARCH_VERSION: core.getInput('elasticsearchVersion'),
    GRAFEAS_VERSION: `v${core.getInput('grafeasVersion')}`,
    OPA_VERSION: core.getInput('opaVersion'),
})

const runDockerCmd = ({cmd, args = [], extraEnv, log = true}) => {
    core.startGroup(`docker-compose ${cmd}`);

    const opts = {
        shell: false,
    };
    const execArgs = []
    const githubActionPath = process.env.GITHUB_ACTION_PATH;
    if (githubActionPath) {
        core.info(`Running from ${githubActionPath}`);
        execArgs.push('-f', path.join(githubActionPath, 'docker-compose.yaml'))
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
        core.info(stdout);
    } finally {
        core.endGroup();
    }
};

module.exports = {
    up,
    down,
    ps,
    logs
}
