import { useAuthStore } from "@/store/useAuthStore";
import { GrammarCheckResponse } from "./grammar-check.entity";

export async function checkGrammar(text: string) {
    const language = useAuthStore.getState().language;
    const targetLanguage = language === "en" ? "es-ES" : "en-US";
    const response = await fetch('/api/grammar', {
        method: 'POST',
        body: JSON.stringify({ text, language: targetLanguage }), 
    });
    return response.json() as Promise<GrammarCheckResponse>;
}

