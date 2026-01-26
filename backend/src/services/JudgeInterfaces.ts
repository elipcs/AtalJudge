
import { JudgeVerdict } from '../enums/JudgeVerdict';

export interface Judge0SubmissionRequest {
    source_code: string;
    language_id: number;
    stdin?: string;
    expected_output?: string;
    cpu_time_limit?: number;
    memory_limit?: number;
    wall_time_limit?: number;
}

export interface Judge0SubmissionResponse {
    token: string;
}

export interface Judge0StatusResponse {
    token: string;
    status: {
        id: number;
        description: string;
    };
    stdout?: string;
    stderr?: string;
    compile_output?: string;
    message?: string;
    time?: string;
    memory?: number;
}

export interface Judge0BatchSubmissionRequest {
    submissions: Judge0SubmissionRequest[];
}

export interface Judge0BatchStatusResponse {
    submissions: Judge0StatusResponse[];
}

export interface ProcessedSubmissionResult {
    verdict: JudgeVerdict;
    passed: boolean;
    executionTimeMs?: number;
    memoryUsedKb?: number;
    output?: string;
    errorMessage?: string;
}
