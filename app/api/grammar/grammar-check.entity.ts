export interface GrammarCheckResponse {
    software:               Software;
    warnings:               Warnings;
    language:               Language;
    matches:                Match[];
    sentenceRanges:         Array<number[]>;
    extendedSentenceRanges: ExtendedSentenceRange[];
}

export interface ExtendedSentenceRange {
    from:              number;
    to:                number;
    detectedLanguages: DetectedLanguageElement[];
}

export interface DetectedLanguageElement {
    language: string;
    rate:     number;
}

export interface Language {
    name:             string;
    code:             string;
    detectedLanguage: LanguageDetectedLanguage;
}

export interface LanguageDetectedLanguage {
    name:       string;
    code:       string;
    confidence: number;
    source:     string;
}

export interface Match {
    message:                     string;
    shortMessage:                string;
    replacements:                Replacement[];
    offset:                      number;
    length:                      number;
    context:                     Context;
    sentence:                    string;
    type:                        Type;
    rule:                        Rule;
    ignoreForIncompleteSentence: boolean;
    contextForSureMatch:         number;
}

export interface Context {
    text:   string;
    offset: number;
    length: number;
}

export interface Replacement {
    value: string;
}

export interface Rule {
    id:          string;
    subId?:      string;
    sourceFile?: string;
    description: string;
    issueType:   string;
    urls?:       Replacement[];
    category:    Category;
    isPremium:   boolean;
    confidence:  number;
}

export interface Category {
    id:   string;
    name: string;
}

export interface Type {
    typeName: string;
}

export interface Software {
    name:        string;
    version:     string;
    buildDate:   string;
    apiVersion:  number;
    premium:     boolean;
    premiumHint: string;
    status:      string;
}

export interface Warnings {
    incompleteResults: boolean;
}
