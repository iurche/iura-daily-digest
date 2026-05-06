import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ExtractedContent } from './extract';

const EXTRACTED_DIR = path.join(process.cwd(), 'content/extracted');

export function getHash(url: string): string {
  return crypto.createHash('sha256').update(url).digest('hex');
}

export function getExtractedPath(url: string): string {
  const hash = getHash(url);
  return path.join(EXTRACTED_DIR, `${hash}.json`);
}

export function saveExtractedContent(content: ExtractedContent): void {
  if (!fs.existsSync(EXTRACTED_DIR)) {
    fs.mkdirSync(EXTRACTED_DIR, { recursive: true });
  }
  const filePath = getExtractedPath(content.url);
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8');
}

export function getExtractedContent(url: string): ExtractedContent | null {
  const filePath = getExtractedPath(url);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as ExtractedContent;
  } catch {
    return null;
  }
}

export function existsExtractedContent(url: string): boolean {
  return fs.existsSync(getExtractedPath(url));
}
