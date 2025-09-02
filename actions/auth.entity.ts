

export enum Level {
    Basic = "basic",
    Intermediate = "intermediate",
    Advanced = "advanced",
}

export interface RegisterData {
    email: string;
    name: string;
    password: string;
    interests?: string;
    level?: Level;
    targetLanguage?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface User {
    token: string;
    id: string;
    email: string;
    name: string;
    interests: string;
    level: Level;
    totalAttempts: number;
    audioSuccessRate: number;
    speechSuccessRate: number;
    textSuccessRate: number;
    prevFeedback: string;
    targetLanguage?: string;
}