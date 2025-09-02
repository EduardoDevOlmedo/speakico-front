import { NextRequest, NextResponse } from "next/server";
import { GrammarCheckResponse } from "@/app/api/grammar/grammar-check.entity";

export async function POST(req: NextRequest): Promise<NextResponse<GrammarCheckResponse>> {
    const { text, language } = await req.json();

    const apiURL = process.env.NEXT_PUBLIC_GRAMMAR_CHECK_API_URL || '';
    const response = await fetch(apiURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            text,
            language
        })
    });

    const result = await response.json();
    return NextResponse.json(result, { status: 200 });
}
