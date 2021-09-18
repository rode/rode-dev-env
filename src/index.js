import * as core from "@actions/core";

import main from './main.js';
import post from './post.js';

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
