import { injectable } from 'tsyringe';
import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import {
    Judge0SubmissionRequest,
    Judge0StatusResponse,
    Judge0BatchSubmissionRequest,
    ProcessedSubmissionResult
} from './JudgeInterfaces';
import { ProgrammingLanguage } from '../enums/ProgrammingLanguage';
import { JudgeVerdict } from '../enums/JudgeVerdict';
import { logger } from '../utils';

@injectable()
export class Judge0Service {
    private client: AxiosInstance;

    constructor() {
        const headers: any = {
            'Content-Type': 'application/json',
        };

        if (config.judge0.apiKey) {
            headers['X-Auth-Token'] = config.judge0.apiKey;
        } else if (config.judge0.rapidApiKey) {
            headers['X-RapidAPI-Key'] = config.judge0.rapidApiKey;
            headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
        }
        // No headers needed for local Judge0 if not configured with auth

        this.client = axios.create({
            baseURL: config.judge0.url,
            headers,
            timeout: 30000 // 30s timeout for API calls
        });
    }

    async createSubmission(
        sourceCode: string,
        language: ProgrammingLanguage,
        stdin?: string,
        expectedOutput?: string,
        limits?: {
            cpuTimeLimit?: number;
            memoryLimit?: number;
            wallTimeLimit?: number;
        }
    ): Promise<string> {
        try {
            const languageId = this.getLanguageId(language);

            const payload: Judge0SubmissionRequest = {
                source_code: sourceCode,
                language_id: languageId,
                stdin,
                expected_output: expectedOutput,
                cpu_time_limit: limits?.cpuTimeLimit,
                memory_limit: limits?.memoryLimit,
                wall_time_limit: limits?.wallTimeLimit
            };

            // base64_encoded is false by default in Judge0 CE, but good to be explicit if needed
            // checks are usually done via query param ?base64_encoded=true if we send base64

            const response = await this.client.post<{ token: string }>('/submissions', payload, {
                params: { base64_encoded: false, wait: false }
            });

            return response.data.token;
        } catch (error: any) {
            logger.error('Failed to create submission on Judge0', {
                error: error.message,
                response: error.response?.data
            });
            throw new Error(`Judge0 API Error: ${error.message}`);
        }
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
        try {
            const payload: Judge0BatchSubmissionRequest = {
                submissions: submissions.map(sub => ({
                    source_code: sub.sourceCode,
                    language_id: this.getLanguageId(sub.language),
                    stdin: sub.stdin,
                    expected_output: sub.expectedOutput,
                    cpu_time_limit: limits?.cpuTimeLimit,
                    memory_limit: limits?.memoryLimit,
                    wall_time_limit: limits?.wallTimeLimit
                }))
            };

            const response = await this.client.post<Array<{ token: string }>>('/submissions/batch', payload, {
                params: { base64_encoded: false }
            });

            return response.data.map(item => item.token);
        } catch (error: any) {
            logger.error('Failed to create batch submission on Judge0', {
                error: error.message,
                response: error.response?.data
            });
            throw new Error(`Judge0 API Error: ${error.message}`);
        }
    }

    async getSubmissionStatus(token: string): Promise<Judge0StatusResponse> {
        try {
            const response = await this.client.get<Judge0StatusResponse>(`/submissions/${token}`, {
                params: {
                    base64_encoded: true, // We want base64 back to handle binary/special chars safely
                    fields: 'token,status,stdout,stderr,compile_output,message,time,memory'
                }
            });
            return response.data;
        } catch (error: any) {
            logger.error(`Failed to get submission status ${token}`, { error: error.message });
            throw error;
        }
    }

    async getBatchSubmissionStatus(tokens: string[]): Promise<Judge0StatusResponse[]> {
        if (tokens.length === 0) return [];

        try {
            const tokenStr = tokens.join(',');
            const response = await this.client.get<{ submissions: Judge0StatusResponse[] }>('/submissions/batch', {
                params: {
                    tokens: tokenStr,
                    base64_encoded: true,
                    fields: 'token,status,stdout,stderr,compile_output,message,time,memory'
                }
            });
            return response.data.submissions;
        } catch (error: any) {
            logger.error('Failed to get batch submission status', { error: error.message });
            throw error;
        }
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
        maxAttempts: number = 60,
        intervalMs: number = 2000
    ): Promise<Judge0StatusResponse[]> {
        const startTime = Date.now();
        const timeout = maxAttempts * intervalMs;

        while (Date.now() - startTime < timeout) {
            const statuses = await this.getBatchSubmissionStatus(tokens);

            // Status ID 1=In Queue, 2=Processing. >2 is finished.
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

        throw new Error('Timeout waiting for Judge0 submissions');
    }

    async waitForSubmission(
        token: string,
        maxAttempts: number = 60,
        intervalMs: number = 2000
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
        judge0Status: Judge0StatusResponse,
        expectedOutput?: string
    ): ProcessedSubmissionResult {
        const decode = (str?: string) => str ? Buffer.from(str, 'base64').toString('utf-8') : undefined;

        const stdout = decode(judge0Status.stdout);
        const stderr = decode(judge0Status.stderr);
        const compileOutput = decode(judge0Status.compile_output);
        const message = decode(judge0Status.message);

        let verdict = this.mapStatusToVerdict(judge0Status.status.id);
        let passed = false;

        if (judge0Status.status.id === 3) { // Accepted
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
            executionTimeMs: judge0Status.time ? parseFloat(judge0Status.time) * 1000 : undefined,
            memoryUsedKb: judge0Status.memory,
            output: stdout?.trim(),
            errorMessage: stderr || compileOutput || message
        };
    }

    private getLanguageId(language: ProgrammingLanguage): number {
        switch (language) {
            case ProgrammingLanguage.JAVASCRIPT: return 63; // Node.js
            case ProgrammingLanguage.PYTHON: return 71;     // Python 3
            case ProgrammingLanguage.JAVA: return 62;       // Java
            case ProgrammingLanguage.C: return 50;          // C
            case ProgrammingLanguage.CPP: return 54;        // C++
            default: throw new Error(`Language ${language} not supported`);
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
