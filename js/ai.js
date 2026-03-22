/**
 * ai.js
 * Handles all AI-powered question extraction from uploaded PDF text.
 * Uses the Google Gemini API to parse raw PDF text into structured quiz questions.
 */

const AI_CONFIG = {
    apiKey: "AIzaSyBVvyjmU9e4nIKBXCU0YHmRTxjn_kBmg0g",
    model: "gemini-2.5-flash",
    maxRetries: 5,
    retryDelays: [1000, 2000, 4000, 8000, 16000],
    maxChars: 150000,
    maxPages: 40,
};

const SYSTEM_PROMPT = `You are a quiz generation engine. Your goal is to extract multiple-choice questions from the provided messy PDF text (like an exam dump).
Rules:
1. Identify questions, options, and the correct answer.
2. Often in exam dumps, the incorrect options have explanations right below them, while the correct answer has an explanation labelled "Correct Answer Explanation" at the bottom. Use these hints to figure out the right answer.
3. Extract ALL multiple-choice questions found in the text (extract up to 50 questions).
4. Provide the correct answer as an integer index (0-based) corresponding to the correct option.
5. Provide a short, clear explanation.`;

const RESPONSE_SCHEMA = {
    type: "ARRAY",
    items: {
        type: "OBJECT",
        properties: {
            q:           { type: "STRING",  description: "The question text" },
            options:     { type: "ARRAY", items: { type: "STRING" }, description: "Array of possible answers" },
            answer:      { type: "INTEGER", description: "Index of the correct option (0-based)" },
            explanation: { type: "STRING",  description: "Explanation of why the answer is correct" }
        },
        required: ["q", "options", "answer", "explanation"]
    }
};

/**
 * Sends extracted PDF text to the Gemini API and returns structured questions.
 * Retries automatically on transient failures with exponential backoff.
 *
 * @param {string} text - Raw text extracted from a PDF
 * @returns {Promise<Array>} Array of question objects
 */
async function extractQuestionsWithAI(text) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.model}:generateContent?key=${AI_CONFIG.apiKey}`;

    const payload = {
        contents: [{ parts: [{ text }] }],
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA
        }
    };

    for (let attempt = 0; attempt < AI_CONFIG.maxRetries; attempt++) {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!jsonText) throw new Error("Empty response from AI.");

            return JSON.parse(jsonText);

        } catch (error) {
            const isLastAttempt = attempt === AI_CONFIG.maxRetries - 1;
            if (isLastAttempt) throw error;
            await new Promise(resolve => setTimeout(resolve, AI_CONFIG.retryDelays[attempt]));
        }
    }
}

/**
 * Reads a PDF File object and extracts all text content using PDF.js.
 *
 * @param {File} file - A PDF file from an <input type="file"> element
 * @returns {Promise<string>} Raw text content from the PDF
 */
async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";
    const pagesToRead = Math.min(pdf.numPages, AI_CONFIG.maxPages);

    for (let i = 1; i <= pagesToRead; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(" ") + "\n";
    }

    return fullText.substring(0, AI_CONFIG.maxChars);
}
