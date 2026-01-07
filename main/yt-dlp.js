import { spawn } from "child_process";
import { emit } from "./events.js";
import { getAllSettings } from "./config.js";
import nodePath from 'node:path';

export function getYtDlpPath() {
    return 'yt-dlp';
}

export async function startDownload(urls) {
    const settings = await getAllSettings();
    const outputDir = settings['downloadLocation'];

    const args = [
        '--newline',
        '--progress',
        '--dump-json',
        '--paths', `home:${outputDir}`,
        ...urls,
    ];

    const proc = spawn(getYtDlpPath(), args);

    proc.stdout.on('data', (chunk) => {
        const lines = chunk.toString().split('\n');

        for (const line of lines) {
            if (!line.trim()) {
                continue;
            };

            let data;

            // Avoid random crashes when yt-dlp emit non-JSON lines
            try {
                data = JSON.parse(line);
            } catch {
                continue;
            }

            if (data.progress) {
                emit({
                    type: 'progress',
                    id: data.info_dict?.id,
                    percent: data.progress.percent,
                });
            }
        }
    });

    proc.on('close', () => {
        emit({
            type: 'finished',
        });
    });

    return proc;
}

export async function getVideoInfo(urls) {
    const results = [];

    for (const url of urls) {
        await new Promise((resolve, reject) => {
            const proc = spawn(getYtDlpPath(), [
                '--dump-json',
                '--skip-download',
                url,
            ]);

            // Append data as buffer
            let buffer = '';

            proc.stdout.on('data', d => buffer += d.toString());

            proc.on('close', () => {
                try {
                    const info = JSON.parse(buffer);
                    results.push({
                        id: info.id,
                        title: info.title,
                    });
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    return results;
}