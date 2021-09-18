const core = require("@actions/core");
const main = require('./main');
const post = require('./post');

const isPostAction = () => {
    const isPost = core.getState('post');
    if (!isPost) {
        core.saveState('post', true);
    }

    return isPost;
}

(async () => {
    try {
        const action = isPostAction() ? post : main;
        await action();
    } catch (error) {
        core.setFailed(`Error running rode-dev-env: ${error.stack}`);
        process.exit(1);
    }
})();
