import * as fs from 'fs';
import os from 'os';
import path from 'path';
import * as artifact from '@actions/artifact';
import * as core from "@actions/core";
import * as dockerCompose from './docker-compose.js';
import {getServices} from "./services.js";

export default async () => {
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
