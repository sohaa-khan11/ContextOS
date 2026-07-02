export interface RememberResponse {
    remembered: number;
    skipped: number;
    summary: string;
}

export interface RecallResponse {
    answer: string;
    path?: any[];
}
