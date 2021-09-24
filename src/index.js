const fs = require('fs');
const path = require('path');
const core = require("@actions/core");
const dockerCompose = require('./docker-compose');
const main = require('./main');
const post = require('./post');

const ACTION = 'rode-dev-env';
const ACTION_VERSION = process.env.ACTION_VERSION; // replaced by esbuild with a Git tag
const ACTION_CHECKOUT_PATH = `/home/runner/work/_actions/rode/${ACTION}`;

const setupDockerCompose = () => {
    if (!process.env.GITHUB_ACTIONS) {
        return;
    }

    // running in the GitHub Actions workflow for the rode/rode-dev-env as a local action
    const runningInRepoCi = path.basename(process.cwd()) === ACTION && fs.existsSync('./docker-compose.yaml');
    if (runningInRepoCi) {
        return
    }

    if (!ACTION_VERSION) {
        throw new Error('Unable to determine action version');
    }

    core.info(`Appear to be running GitHub Actions with version ${ACTION_VERSION}`);
    const dockerComposeFile = `${ACTION_CHECKOUT_PATH}/${ACTION_VERSION}/docker-compose.yaml`;
    core.info(`Checking if docker compose config is at this path: ${dockerComposeFile}`);
    if (!fs.existsSync(dockerComposeFile)) {
        throw new Error(`Expected to find action repository at ${ACTION_CHECKOUT_PATH}, but wasn't present`);
    }
    core.info("Found docker compose config");
    dockerCompose.configure(dockerComposeFile);
};

const isPostAction = () => {
    const isPost = core.getState('post');
    if (!isPost) {
        core.saveState('post', true);
    }

    return isPost;
}

(async () => {
    try {
        setupDockerCompose();
        const action = isPostAction() ? post : main;
        await action();
    } catch (error) {
        core.setFailed(`Error running rode-dev-env: ${error.stack}`);
        process.exit(1);
    }
})();
