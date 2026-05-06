# Extracted Content Storage

This directory contains JSON files with extracted article content.
Each file is named after the SHA256 hash of the article's `sourceUrl`.

## Format

```json
{
  "url": "https://example.com/article",
  "title": "Article Title",
  "byline": "Author Name",
  "content": "<div>HTML content...</div>",
  "excerpt": "Short summary...",
  "siteName": "Source Name",
  "extractedAt": "2024-05-06T07:46:43Z"
}
```

## Management

- Files are created during the daily build pipeline (`scripts/build-digest.ts`).
- If a file is missing at runtime, the site falls back to `/api/extract`.
- These files are committed to the repository to ensure persistence and faster page loads.
- Files should not be manually deleted to ensure archived articles remain readable.
