/**
 * @module services/SandboxFusionService
 * @description Service for executing code locally using Docker containers.
 * Replaces Judge0Service with a lightweight implementation called SandboxFusion.
 * Currently supports Python and Java.
 * @class SandboxFusionService
 */
import { injectable } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ProgrammingLanguage } from '../enums/ProgrammingLanguage';
import { JudgeVerdict } from '../enums/JudgeVerdict';
import { logger } from '../utils';
import {
    Judge0StatusResponse,
    ProcessedSubmissionResult
} from './JudgeInterfaces';


const execAsync = promisify(exec);

interface ExecutionResult {
    token: string;
    statusId: number;
    statusDescription: string;
    stdout?: string;
    stderr?: string;
    compileOutput?: string;
    message?: string;
    time?: string;
    memory?: number;
    createdAt: number;
}

@injectable()
export class SandboxFusionService {
    private results: Map<string, ExecutionResult> = new Map();
    private readonly TEMP_DIR = '/tmp/ataljudge-executions';

    constructor() {
        this.ensureTempDir();
    }

    private async ensureTempDir() {
        try {
            await fs.mkdir(this.TEMP_DIR, { recursive: true });
        } catch (error) {
            logger.error('Failed to create temp directory for executions', error);
        }
    }

    // --- Public Interface (matching Judge0Service) ---

    async createSubmission(
        sourceCode: string,
        language: ProgrammingLanguage,
        stdin?: string,
        _expectedOutput?: string,
        limits?: {
            cpuTimeLimit?: number;
            memoryLimit?: number;
            wallTimeLimit?: number;
        }
    ): Promise<string> {
        const token = uuidv4();
        this.initializeSubmission(token);

        // Run in background (fire and forget)
        this.executeSubmission(token, sourceCode, language, stdin, limits).catch(err => {
            logger.error(`Error executing submission ${token}`, err);
            this.updateStatus(token, 13, 'Internal Error', { message: err.message });
        });

        return token;
    }

    async createBatchSubmissions(
        submissions: Array<{
            sourceCode: string;
            language: ProgrammingLanguage;
            stdin?: string;
            expectedOutput?: string;
        }>,
        limits?: {
            cpuTimeLimit?: number;
            memoryLimit?: number;
            wallTimeLimit?: number;
        }
    ): Promise<string[]> {
        const tokens: string[] = [];

        for (const sub of submissions) {
            const token = await this.createSubmission(
                sub.sourceCode,
                sub.language,
                sub.stdin,
                sub.expectedOutput,
                limits
            );
            tokens.push(token);
        }

        return tokens;
    }

    async getSubmissionStatus(token: string): Promise<Judge0StatusResponse> {
        const result = this.results.get(token);
        if (!result) {
            throw new Error('Submission not found');
        }

        return {
            token: result.token,
            status: {
                id: result.statusId,
                description: result.statusDescription
            },
            stdout: result.stdout ? Buffer.from(result.stdout).toString('base64') : null,
            stderr: result.stderr ? Buffer.from(result.stderr).toString('base64') : null,
            compile_output: result.compileOutput ? Buffer.from(result.compileOutput).toString('base64') : null,
            message: result.message ? Buffer.from(result.message).toString('base64') : null,
            time: result.time,
            memory: result.memory
        } as any; // Cast because Judge0 interface might have strict null checks we are fudging slightly
    }

    async getBatchSubmissionStatus(tokens: string[]): Promise<Judge0StatusResponse[]> {
        return Promise.all(tokens.map(token => this.getSubmissionStatus(token)));
    }

    async waitForBatchSubmissionsWithCallback(
        tokens: string[],
        onProgress: (progress: {
            completed: number;
            pending: number;
            total: number;
            percentage: number;
            statuses: Judge0StatusResponse[];
        }) => Promise<void>,
        maxAttempts: number = 30, // Kept for interface compatibility, but we might not need to poll as hard locally 
        intervalMs: number = 500
    ): Promise<Judge0StatusResponse[]> {
        const startTime = Date.now();
        const timeout = maxAttempts * intervalMs;

        while (Date.now() - startTime < timeout) {
            const statuses = await this.getBatchSubmissionStatus(tokens);
            const completed = statuses.filter(s => s.status.id > 2).length; // > 2 means finished (Accepted, WA, Error, etc.)
            const pending = statuses.filter(s => s.status.id <= 2).length;
            const percentage = Math.round((completed / tokens.length) * 100);

            if (onProgress) {
                await onProgress({
                    completed,
                    pending,
                    total: tokens.length,
                    percentage,
                    statuses
                });
            }

            if (completed === tokens.length) {
                return statuses;
            }

            await new Promise(resolve => setTimeout(resolve, intervalMs));
        }

        throw new Error('Timeout waiting for submissions');
    }

    async waitForSubmission(
        token: string,
        maxAttempts: number = 30,
        intervalMs: number = 1000
    ): Promise<Judge0StatusResponse> {
        const startTime = Date.now();
        const timeout = maxAttempts * intervalMs;

        while (Date.now() - startTime < timeout) {
            const status = await this.getSubmissionStatus(token);
            if (status.status.id > 2) {
                return status;
            }
            await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
        throw new Error(`Timeout waiting for submission ${token}`);
    }

    // Reuse the logic from Judge0Service for result processing
    processSubmissionResult(
        status: Judge0StatusResponse,
        expectedOutput?: string
    ): ProcessedSubmissionResult {
        // This logic is identical to Judge0Service, we can duplicate it or refactor.
        // Duplicating for now to keep it self-contained as requested.

        // Decode base64 if needed (our getSubmissionStatus returns base64 to match Judge0)
        const decode = (str?: string) => str ? Buffer.from(str, 'base64').toString('utf-8') : undefined;

        const stdout = decode(status.stdout);
        const stderr = decode(status.stderr);
        const compileOutput = decode(status.compile_output);
        const message = decode(status.message);

        let verdict = this.mapStatusToVerdict(status.status.id);
        let passed = false;

        if (status.status.id === 3) { // Accepted
            if (expectedOutput) {
                const actualTrimmed = (stdout || '').trim();
                const expectedTrimmed = expectedOutput.trim();
                passed = actualTrimmed === expectedTrimmed;
                if (!passed) {
                    verdict = JudgeVerdict.WRONG_ANSWER;
                }
            } else {
                passed = true;
            }
        }

        return {
            verdict,
            passed,
            executionTimeMs: status.time ? parseFloat(status.time) * 1000 : undefined,
            memoryUsedKb: status.memory,
            output: stdout?.trim(),
            errorMessage: stderr || compileOutput || message
        };
    }

    // --- Internal Implementation ---

    private initializeSubmission(token: string) {
        this.results.set(token, {
            token,
            statusId: 1, // In Queue
            statusDescription: 'In Queue',
            createdAt: Date.now()
        });
    }

    private updateStatus(token: string, statusId: number, description: string, data?: Partial<ExecutionResult>) {
        const current = this.results.get(token);
        if (current) {
            this.results.set(token, {
                ...current,
                statusId,
                statusDescription: description,
                ...data
            });
        }
    }

    private async executeSubmission(
        token: string,
        sourceCode: string,
        language: ProgrammingLanguage,
        stdin: string | undefined,
        limits: any
    ) {
        // Log the environment for debugging
        logger.info(`[SandboxFusion] Preparing execution for ${token}`, { language, limits });

        const workDir = path.join(this.TEMP_DIR, token);

        try {
            this.updateStatus(token, 2, 'Processing');
            await fs.mkdir(workDir, { recursive: true });

            // Generate execution plan (filename, docker image, compile command, run command)
            const plan = this.getExecutionPlan(language);

            // Write source code
            const filePath = path.join(workDir, plan.filename);
            await fs.writeFile(filePath, sourceCode);
            logger.info(`[SandboxFusion] Wrote code to ${filePath}`);

            // Write stdin if present
            if (stdin) {
                await fs.writeFile(path.join(workDir, 'stdin.txt'), stdin);
            }

            // Preparation/Compilation Phase
            if (plan.compileCmd) {
                try {
                    // Run compilation in docker
                    const compileCmdFull = `docker run --rm \
            -v "${workDir}:/code" \
            -w /code \
            ${plan.image} \
            sh -c "${plan.compileCmd}"`;

                    logger.info(`[SandboxFusion] Compiling: ${compileCmdFull}`);
                    await execAsync(compileCmdFull);
                } catch (compileError: any) {
                    const stderr = compileError.stderr || compileError.message;
                    logger.error(`[SandboxFusion] Compilation failed`, { stderr });
                    this.updateStatus(token, 6, 'Compilation Error', { compileOutput: stderr });
                    return;
                }
            }

            // Execution Phase
            const runCmd = plan.runCmd;
            const stdinPart = stdin ? '< /code/stdin.txt' : '';

            // Basic resource limits (Docker flags)
            const timeLimitFn = limits?.cpuTimeLimit ? limits.cpuTimeLimit + 15 : 20; // Massive buffer (15s) for slow VM Docker startup

            const dockerRunCmd = `timeout ${timeLimitFn}s docker run --rm \
        -v "${workDir}:/code" \
        -w /code \
        --network none \
        --pids-limit 64 \
        ${plan.image} \
        sh -c "${runCmd} ${stdinPart}"`;

            logger.info(`[SandboxFusion] Executing: ${dockerRunCmd}`);

            const startTime = process.hrtime();
            const { stdout, stderr } = await execAsync(dockerRunCmd);
            const [seconds, nanoseconds] = process.hrtime(startTime);
            const rawTimeInSeconds = seconds + nanoseconds / 1e9;

            // Deduct Docker startup overhead (High overhead for VM: 4.0s)
            // We floor at 0.01s to ensure positive time
            const CONTAINER_OVERHEAD = 4.0;
            const timeInSeconds = Math.max(0.01, rawTimeInSeconds - CONTAINER_OVERHEAD);

            logger.info(`[SandboxFusion] Execution finished`, { stdout, stderr, rawTime: rawTimeInSeconds, adjustedTime: timeInSeconds });

            // Check against limits
            if (limits?.cpuTimeLimit && timeInSeconds > limits.cpuTimeLimit) {
                this.updateStatus(token, 5, 'Time Limit Exceeded', { time: timeInSeconds.toFixed(3) });
                return;
            }

            this.updateStatus(token, 3, 'Accepted', {
                stdout,
                stderr,
                time: timeInSeconds.toFixed(3),
                memory: 0
            });

        } catch (error: any) {
            logger.error(`[SandboxFusion] Execution Error Catch`, { code: error.code, message: error.message, stderr: error.stderr });

            if (error.code === 124 || error.code === 137 || error.code === 143) {
                this.updateStatus(token, 5, 'Time Limit Exceeded');
            } else if (error.stderr) {
                this.updateStatus(token, 11, 'Runtime Error', { stderr: error.stderr });
            } else {
                // Fallback
                this.updateStatus(token, 11, 'Runtime Error', { message: error.message });
            }
        } finally {
            // Cleanup - commented out for debugging if needed, but keeping for now
            try {
                await fs.rm(workDir, { recursive: true, force: true });
            } catch (e) {
                logger.warn(`Failed to cleanup workdir ${workDir}`, e);
            }
        }
    }

    private getExecutionPlan(language: ProgrammingLanguage): {
        image: string;
        filename: string;
        compileCmd?: string;
        runCmd: string;
    } {
        switch (language) {
            case ProgrammingLanguage.PYTHON:
                return {
                    image: 'python:3.10-alpine',
                    filename: 'main.py',
                    runCmd: 'python3 main.py'
                };
            case ProgrammingLanguage.JAVA:
                return {
                    image: 'eclipse-temurin:17-alpine',
                    filename: 'Main.java',
                    compileCmd: 'javac Main.java',
                    runCmd: 'java Main'
                };
            default:
                throw new Error(`Language ${language} not supported locally yet.`);
        }
    }

    private mapStatusToVerdict(statusId: number): JudgeVerdict {
        switch (statusId) {
            case 3: return JudgeVerdict.ACCEPTED;
            case 4: return JudgeVerdict.WRONG_ANSWER;
            case 5: return JudgeVerdict.TIME_LIMIT_EXCEEDED;
            case 6: return JudgeVerdict.COMPILATION_ERROR;
            case 7:
            case 8:
            case 9:
            case 10:
            case 11:
            case 12: return JudgeVerdict.RUNTIME_ERROR;
            case 13: return JudgeVerdict.INTERNAL_ERROR;
            default: return JudgeVerdict.JUDGE_ERROR;
        }
    }
}
