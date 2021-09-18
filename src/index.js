const core = require("@actions/core");
const main = require('./main');
const post = require('./post');

(async () => {
    try {
        const action = core.getInput('stage') === 'post' ? post : main;
        await action();
    } catch (error) {
        core.setFailed(`Error running rode-dev-env: ${error.stack}`);
        process.exit(1);
    }
})();
