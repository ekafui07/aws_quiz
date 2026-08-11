# AI-Powered AWS Quiz

A single-page, browser-based quiz app for AWS Networking & VPC practice. Start with a built-in default question set, or upload a PDF exam dump — the app extracts text client-side and uses the Gemini API to turn it into a structured multiple-choice quiz.

## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Running Locally](#running-locally)
- [Configuration](#configuration)
- [Security Note](#security-note)

## Features

| Feature | Description |
|---|---|
| Default question bank | Built-in AWS VPC/networking questions in `js/questions.js`, ready to use with no setup |
| Custom PDF quizzes | Upload any exam-dump PDF and have questions extracted automatically |
| AI question extraction | Gemini reads messy exam-dump text and returns structured Q&A with explanations |
| Score tracking | Live score display while working through a quiz |
| No backend required | Runs entirely client-side; PDF parsing and quiz logic all happen in the browser |

## How It Works

1. **Start screen** — choose the default quiz or upload a PDF
2. **PDF parsing** (`js/ai.js`) — [PDF.js](https://mozilla.github.io/pdf.js/) extracts raw text from the uploaded file (up to 40 pages / 150,000 characters)
3. **AI extraction** — the extracted text is sent to the Gemini API with a schema-constrained prompt, returning question, options, correct-answer index, and explanation for each item
4. **Quiz engine** (`js/quiz.js`) — renders questions, tracks score and progress, and shows a results screen at the end

## Project Structure

```
aws_quiz/
├── index.html        # App shell and UI markup
├── css/
│   └── styles.css    # App styles
└── js/
    ├── questions.js   # Default AWS VPC question bank
    ├── ai.js          # PDF text extraction + Gemini API integration
    └── quiz.js        # Quiz state, rendering, and interaction logic
```

## Running Locally

No build step required — this is a static site.

```bash
git clone https://github.com/ekafui07/aws_quiz.git
cd aws_quiz
```

Then open `index.html` directly in a browser, or serve it locally:

```bash
python -m http.server 8000
```

and visit `http://localhost:8000`.

## Configuration

The Gemini API key and model are configured in `js/ai.js` under `AI_CONFIG`. To use your own key, replace the `apiKey` value there.

## Security Note

This app calls the Gemini API directly from the browser, which means the API key in `js/ai.js` is visible to anyone who views the page source. **Do not commit a real API key to a public repository.** For anything beyond personal/local use, proxy the Gemini call through a small backend that holds the key server-side instead of shipping it client-side.
