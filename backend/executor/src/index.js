const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Temp directory for executions
const TEMP_DIR = '/tmp/executions';
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

app.post('/run', async (req, res) => {
    try {
        const { code, language, stdin, cmd, args } = req.body;

        if (!code || !language) {
            return res.status(400).json({ error: 'Missing code or language' });
        }

        const runId = Date.now().toString() + Math.random().toString(36).substring(7);
        const workDir = path.join(TEMP_DIR, runId);
        fs.mkdirSync(workDir, { recursive: true });

        const fileName = language === 'java' ? 'Main.java' : 'main.py';
        const filePath = path.join(workDir, fileName);

        fs.writeFileSync(filePath, code);

        if (stdin) {
            fs.writeFileSync(path.join(workDir, 'stdin.txt'), stdin);
        }

        // Determine command
        let spawnCmd = cmd;
        let spawnArgs = args || [];

        // Default constraints
        // Java needs more time for JVM startup
        const defaultTimeLimit = language === 'java' ? 3.0 : 2.0;
        const timeLimit = req.body.cpuTimeLimit || defaultTimeLimit;
        const timeoutMs = Math.ceil(timeLimit * 1000);

        // Compilation for Java
        if (language === 'java') {
            try {
                await new Promise((resolve, reject) => {
                    const compile = spawn('javac', ['Main.java'], { cwd: workDir });
                    let compileStderr = '';
                    compile.stderr.on('data', (data) => compileStderr += data.toString());
                    compile.on('close', (code) => {
                        if (code !== 0) reject(compileStderr);
                        else resolve();
                    });
                });
            } catch (err) {
                return res.json({
                    stdout: '',
                    stderr: err || 'Compilation failed',
                    exitCode: 1,
                    time: 0,
                    memory: 0
                }); // Return as result, not 500
            }
            spawnCmd = 'java';
            spawnArgs = ['Main'];
        }

        const startTime = process.hrtime();

        const child = spawn(spawnCmd, spawnArgs, {
            cwd: workDir,
            env: { ...process.env, PYTHONUNBUFFERED: "1" } // Ensure unbuffered output
        });

        let stdout = '';
        let stderr = '';

        // Handle stdin
        if (stdin) {
            child.stdin.write(stdin);
            child.stdin.end();
        } else {
            // Important: Close stdin if no input to avoid hangs on input()
            child.stdin.end();
        }

        child.stdout.on('data', (data) => stdout += data.toString());
        child.stderr.on('data', (data) => stderr += data.toString());

        // Timeout handling
        const timer = setTimeout(() => {
            child.kill('SIGKILL');
            stderr += '\nTime Limit Exceeded';
        }, timeoutMs);

        child.on('close', (code) => {
            clearTimeout(timer);
            const [seconds, nanoseconds] = process.hrtime(startTime);
            const timeInSeconds = seconds + nanoseconds / 1e9;

            // Cleanup
            try {
                fs.rmSync(workDir, { recursive: true, force: true });
            } catch (e) {
                console.error('Cleanup failed', e);
            }

            res.json({
                stdout,
                stderr,
                exitCode: code,
                time: timeInSeconds,
                memory: 0 // Placeholder
            });
        });

        child.on('error', (err) => {
            clearTimeout(timer);
            res.status(500).json({ error: err.message });
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`Executor listening on port ${PORT}`);
});
