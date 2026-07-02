export interface User {
    id: string;
    email: string;
    createdAt: Date;
}

export interface Project {
    id: string;
    userId: string;
    name: string;
    status: string;
    cogneeDatasetId: string;
    createdAt: Date;
    updatedAt: Date;
    lastActivityAt: Date;
}

export interface ExtensionToken {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
}
