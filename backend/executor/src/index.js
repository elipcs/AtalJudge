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

// Periodic cleanup of temp files older than 10 minutes
// Folders should normally be deleted after execution, but this is a safety net.
setInterval(() => {
    try {
        const files = fs.readdirSync(TEMP_DIR);
        const now = Date.now();
        files.forEach(file => {
            const filePath = path.join(TEMP_DIR, file);
            try {
                const stats = fs.statSync(filePath);
                if (now - stats.mtimeMs > 600000) { // 10 minutes
                    fs.rmSync(filePath, { recursive: true, force: true });
                    console.log(`[Executor] Cleaned up escaped directory: ${file}`);
                }
            } catch (err) {
                // File might have been deleted by the process itself
            }
        });
    } catch (e) {
        console.error('[Executor] Periodic cleanup error', e);
    }
}, 300000); // Run every 5 minutes

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

        // Java needs more time for JVM startup
        const defaultTimeLimit = language === 'java' ? 3.0 : 2.0;
        const timeLimit = req.body.cpuTimeLimit || defaultTimeLimit;
        const timeoutMs = Math.ceil(timeLimit * 1000);

        const javaStartupOffset = process.env.JAVA_STARTUP_OFFSET ? parseFloat(process.env.JAVA_STARTUP_OFFSET) : 1.0;
        const absoluteTimeoutMs = language === 'java' ? timeoutMs + Math.ceil(javaStartupOffset * 1000) : timeoutMs;

        // Compilation for Java
        if (language === 'java') {
            try {
                await new Promise((resolve, reject) => {
                    console.log(`[Executor] Starting compilation: javac Main.java (runId: ${runId})`);
                    const compile = spawn('javac', ['Main.java'], { cwd: workDir });
                    let compileStderr = '';

                    const compileTimer = setTimeout(() => {
                        compile.kill('SIGKILL');
                        reject('Compilation timeout (60s)');
                    }, 60000);

                    compile.on('error', (err) => {
                        clearTimeout(compileTimer);
                        reject(`Failed to start javac: ${err.message}`);
                    });

                    compile.stderr.on('data', (data) => compileStderr += data.toString());
                    compile.on('close', (code) => {
                        clearTimeout(compileTimer);
                        console.log(`[Executor] Compilation finished with code ${code} (runId: ${runId})`);
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

        console.log(`[Executor] Started execution: ${spawnCmd} ${spawnArgs.join(' ')} (runId: ${runId})`);

        let stdout = '';
        let stderr = '';
        let peakMemoryKb = 0;

        // Memory polling (Linux peak RSS via /proc)
        const memoryInterval = setInterval(() => {
            if (child.pid) {
                try {
                    const statusContent = fs.readFileSync(`/proc/${child.pid}/status`, 'utf8');
                    const match = statusContent.match(/VmHWM:\s+(\d+)\s+kB/);
                    if (match) {
                        const currentPeak = parseInt(match[1], 10);
                        if (currentPeak > peakMemoryKb) peakMemoryKb = currentPeak;
                    }
                } catch (e) {
                    // Process likely finished
                }
            }
        }, 50);

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
        }, absoluteTimeoutMs);

        child.on('close', (code) => {
            clearTimeout(timer);
            clearInterval(memoryInterval);

            const [seconds, nanoseconds] = process.hrtime(startTime);
            let timeInSeconds = seconds + nanoseconds / 1e9;

            // Subtract startup offset for Java to be fair
            if (language === 'java') {
                timeInSeconds = Math.max(0, timeInSeconds - javaStartupOffset);
            }

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
                memory: peakMemoryKb
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
