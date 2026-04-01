// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — AI Response Validation
// ═══════════════════════════════════════════════════════════════════════════════

import { log } from './log.js';

export function parseAIResponse(response, schema = null, context = 'AI response') {
  if (!response || typeof response !== 'string') {
    log.warn(`${context}: empty or invalid response`);
    return null;
  }
  let cleaned = response.replace(/```json?\s*\n?/gi, '').replace(/```\s*/g, '').trim();
  const jsonStart = cleaned.indexOf('{');
  const jsonArrayStart = cleaned.indexOf('[');
  if (jsonStart === -1 && jsonArrayStart === -1) {
    log.warn(`${context}: no JSON structure found`);
    return null;
  }
  const start = jsonStart >= 0 && (jsonArrayStart < 0 || jsonStart < jsonArrayStart) ? jsonStart : jsonArrayStart;
  cleaned = cleaned.slice(start);
  let parsed;
  try { parsed = JSON.parse(cleaned); } catch (err) {
    log.warn(`${context}: JSON parse failed — ${err.message}`);
    return null;
  }
  if (schema && typeof parsed === 'object' && parsed !== null) {
    for (const [field, validator] of Object.entries(schema)) {
      const value = parsed[field];
      if (typeof validator === 'function') {
        if (!validator(value)) { log.warn(`${context}: field "${field}" failed validation`); return null; }
      } else if (typeof validator === 'string') {
        if (validator === 'array' && !Array.isArray(value) && value !== null && value !== undefined) {
          log.warn(`${context}: field "${field}" expected array`); return null;
        }
      }
    }
  }
  return parsed;
}

export function sanitizeAIString(value, maxLength = 200) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\\`${}]/g, '').replace(/[\x00-\x1f]/g, '').slice(0, maxLength).trim();
}

export function isValidGameName(name) {
  if (typeof name !== 'string') return false;
  if (name.length < 1 || name.length > 100) return false;
  return /^[a-zA-Z0-9\s\-'.,:()]+$/.test(name);
}

export function isValidUrl(url) {
  if (typeof url !== 'string') return false;
  try { const p = new URL(url); return ['http:', 'https:'].includes(p.protocol); } catch { return false; }
}

export function isValidISODate(dateStr) {
  if (typeof dateStr !== 'string') return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime()) && d.getFullYear() >= 2024 && d.getFullYear() <= 2030;
}
