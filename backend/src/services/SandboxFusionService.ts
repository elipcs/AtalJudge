/**
 * @module services/SandboxFusionService
 * @description Service for executing code locally using HTTP Executor Microservices.
 * Replaces old "Docker Exec" CLI approach with a robust HTTP architecture.
 * @class SandboxFusionService
 */
import { injectable } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { ProgrammingLanguage } from '../enums/ProgrammingLanguage';
import { JudgeVerdict } from '../enums/JudgeVerdict';
import { logger } from '../utils';
import {
    Judge0StatusResponse,
    ProcessedSubmissionResult
} from './JudgeInterfaces';

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

    constructor() { }

    // --- Public Interface (matching Judge0Service) ---

    async createSubmission(
        sourceCode: string,
        language: ProgrammingLanguage,
        stdin?: string,
        _expectedOutput?: string,
        limits?: {
            cpuTimeLimit?: number;
            memoryLimit?: number;
        }
    ): Promise<string> {
        const token = uuidv4();
        this.initializeSubmission(token);

        // Run in background (fire and forget pattern for async processing)
        this.executeSubmissionHttp(token, sourceCode, language, stdin, limits).catch(err => {
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
        } as any;
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
        maxAttempts: number = 30,
        intervalMs: number = 500
    ): Promise<Judge0StatusResponse[]> {
        const startTime = Date.now();
        const timeout = maxAttempts * intervalMs;

        while (Date.now() - startTime < timeout) {
            const statuses = await this.getBatchSubmissionStatus(tokens);
            const completed = statuses.filter(s => s.status.id > 2).length;
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

    processSubmissionResult(
        status: Judge0StatusResponse,
        expectedOutput?: string
    ): ProcessedSubmissionResult {
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
            executionTimeMs: status.time ? Math.round(parseFloat(status.time) * 1000) : undefined,
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

    private async executeSubmissionHttp(
        token: string,
        sourceCode: string,
        language: ProgrammingLanguage,
        stdin: string | undefined,
        limits: any
    ) {
        logger.info(`[SandboxFusion-HTTP] Preparing execution for ${token}`, { language });

        try {
            this.updateStatus(token, 2, 'Processing');

            const endpoint = this.getExecutorEndpoint(language);
            const payload = this.getExecutorPayload(language, sourceCode, stdin, limits);

            logger.info(`[SandboxFusion-HTTP] Posting to ${endpoint}`);

            const response = await axios.post(endpoint, payload, {
                timeout: 10000 // 10s connection timeout
            });

            const result = response.data;
            logger.info(`[SandboxFusion-HTTP] Result received`, result);

            if (result.error) {
                this.updateStatus(token, 13, 'Internal Error', { message: result.error });
                return;
            }

            // Map exit code to verdict
            if (result.exitCode !== 0) {
                if (result.stderr && result.stderr.includes('Time Limit Exceeded')) {
                    this.updateStatus(token, 5, 'Time Limit Exceeded', { time: '5.0' });
                } else {
                    // 11 is Runtime Error
                    this.updateStatus(token, 11, 'Runtime Error', {
                        stderr: result.stderr,
                        time: result.time?.toFixed(3)
                    });
                }
                return;
            }

            this.updateStatus(token, 3, 'Accepted', {
                stdout: result.stdout,
                stderr: result.stderr,
                time: result.time?.toFixed(3),
                memory: 0
            });

        } catch (error: any) {
            logger.error(`[SandboxFusion-HTTP] Request Failed`, { message: error.message });
            this.updateStatus(token, 13, 'Internal Error', { message: error.message });
        }
    }

    private getExecutorEndpoint(language: ProgrammingLanguage): string {
        switch (language) {
            case ProgrammingLanguage.PYTHON:
                return 'http://ataljudge-executor-python:3000/run';
            case ProgrammingLanguage.JAVA:
                return 'http://ataljudge-executor-java:3000/run';
            default:
                throw new Error(`Language ${language} not supported.`);
        }
    }

    private getExecutorPayload(
        language: ProgrammingLanguage,
        code: string,
        stdin: string | undefined,
        _limits: any
    ): any {
        const base = {
            code,
            stdin: stdin || '', // Empty string if undefined
            language: language === ProgrammingLanguage.JAVA ? 'java' : 'python'
        };

        if (language === ProgrammingLanguage.PYTHON) {
            return {
                ...base,
                cmd: 'python3',
                args: ['-u', 'main.py']
            };
        } else {
            return {
                ...base,
                cmd: 'java', // The executor handles compilation internally
                args: []
            };
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
