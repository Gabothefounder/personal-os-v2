/************************************************************
 * Personal OS v2 — Daily Synthesis (Minimal A — Final)
 *
 * Purpose:
 * - Produce a readable, literal internal substrate
 * - No interpretation, no voice, no coaching
 *
 * Model: gemini-2.5-flash
 * API: Gemini API (v1)
 ************************************************************/

// ================== TAB NAMES ==================
const SURFACEA_TAB_RAW = 'RAW';
const SURFACEA_TAB_SURFACE_A = 'DAILY_BRIEF';

// ================== ENTRY POINT ==================
function runDailySynthesis() {
  Logger.log('--- DAILY SYNTHESIS START ---');

  // TODO: Use last_successful_run_at boundary for incremental input
  const rawNotes = getRecentRawNotes(20);
  Logger.log('RAW NOTES COUNT: ' + rawNotes.length);

  if (rawNotes.length === 0) {
    Logger.log('No RAW notes found. Aborting.');
    return;
  }

  let brief;
  try {
    const orientation = generateOrientation(rawNotes);
    const attention = generateAttention(rawNotes);
    const context = generateContext(rawNotes);
    const framing = generateFraming(rawNotes);
    const reflection = generateReflection(rawNotes);

    brief = {
      orientation,
      attention,
      context,
      framing,
      reflection
    };
  } catch (e) {
    Logger.log('FIELD GENERATION/VALIDATION FAILED — Aborting. Previous substrate unchanged.');
    Logger.log(e.message);
    return;
  }

  writeDailyBrief(brief, 'SUCCESS');

  Logger.log('--- DAILY SYNTHESIS END ---');
}

// ================== GEMINI CALL ==================
function callGemini(promptText) {
  // TEMPORARY DEBUG: Verify request integrity
  Logger.log('DEBUG: promptText defined: ' + (typeof promptText !== 'undefined'));
  Logger.log('DEBUG: typeof promptText: ' + typeof promptText);
  Logger.log('DEBUG: promptText.length: ' + (promptText ? promptText.length : 'N/A'));

  const apiKey = PropertiesService
    .getScriptProperties()
    .getProperty('GEMINI_API_KEY');

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY in Script Properties');
  }

  const url =
    'https://generativelanguage.googleapis.com/v1/models/' +
    'gemini-2.5-flash:generateContent?key=' +
    apiKey;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: promptText }]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 500
    }
  };

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  Logger.log('HTTP STATUS: ' + response.getResponseCode());
  Logger.log('RAW GEMINI RESPONSE JSON (envelope):');
  Logger.log(response.getContentText());

  const json = JSON.parse(response.getContentText());

  if (!json.candidates || json.candidates.length === 0) {
    throw new Error('NO GEMINI CANDIDATES RETURNED');
  }

  const text = json.candidates[0].content.parts[0].text;
  if (!text || typeof text !== 'string') {
    throw new Error('NO TEXT CONTENT IN GEMINI RESPONSE');
  }

  return text.trim();
}

// ================== FIELD GENERATION ==================
function generateOrientation(rawNotes) {
  const prompt = buildOrientationPrompt(rawNotes);
  Logger.log('ORIENTATION PROMPT BUILT');

  const aiText = callGemini(prompt);
  Logger.log('=== ORIENTATION OUTPUT START ===');
  Logger.log(aiText);
  Logger.log('=== ORIENTATION OUTPUT END ===');

  return parseOrientation(aiText);
}

function generateAttention(rawNotes) {
  const prompt = buildAttentionPrompt(rawNotes);
  Logger.log('ATTENTION PROMPT BUILT');

  const aiText = callGemini(prompt);
  Logger.log('=== ATTENTION OUTPUT START ===');
  Logger.log(aiText);
  Logger.log('=== ATTENTION OUTPUT END ===');

  return parseStringField(aiText, 'attention');
}

function generateContext(rawNotes) {
  const prompt = buildContextPrompt(rawNotes);
  Logger.log('CONTEXT PROMPT BUILT');

  const aiText = callGemini(prompt);
  Logger.log('=== CONTEXT OUTPUT START ===');
  Logger.log(aiText);
  Logger.log('=== CONTEXT OUTPUT END ===');

  return parseStringField(aiText, 'context');
}

function generateFraming(rawNotes) {
  const prompt = buildFramingPrompt(rawNotes);
  Logger.log('FRAMING PROMPT BUILT');

  const aiText = callGemini(prompt);
  Logger.log('=== FRAMING OUTPUT START ===');
  Logger.log(aiText);
  Logger.log('=== FRAMING OUTPUT END ===');

  return parseStringField(aiText, 'framing');
}

function generateReflection(rawNotes) {
  const prompt = buildReflectionPrompt(rawNotes);
  Logger.log('REFLECTION PROMPT BUILT');

  const aiText = callGemini(prompt);
  Logger.log('=== REFLECTION OUTPUT START ===');
  Logger.log(aiText);
  Logger.log('=== REFLECTION OUTPUT END ===');

  return parseReflection(aiText);
}

// ================== PROMPTS ==================
function buildOrientationPrompt(rawNotes) {
  return `RAW NOTES:
${rawNotes.map(n => '- ' + n).join('\n')}

Return 1–5 short items, one per line.
Items must describe observable actions, reviews, or concrete focus areas.
Do NOT describe internal judgments, relationship evaluations, or abstract life goals.
No numbering, bullets, or extra text.`;
}

function buildAttentionPrompt(rawNotes) {
  return `RAW NOTES:
${rawNotes.map(n => '- ' + n).join('\n')}

Return one sentence. If unclear, return "No clear deprioritization today."
No extra text.`;
}

function buildContextPrompt(rawNotes) {
  return `RAW NOTES:
${rawNotes.map(n => '- ' + n).join('\n')}

Return one sentence. If none, return "No notable context."
No extra text.`;
}

function buildFramingPrompt(rawNotes) {
  return `RAW NOTES:
${rawNotes.map(n => '- ' + n).join('\n')}

Return one neutral sentence.
No extra text.`;
}

function buildReflectionPrompt(rawNotes) {
  return `RAW NOTES:
${rawNotes.map(n => '- ' + n).join('\n')}

Return 0–2 short reflective items, one per line.
Items are non-actionable and may be open-ended, but must be syntactically complete sentences.
Do NOT cut off mid-thought.
No extra text.`;
}

// ================== PARSERS ==================
function parseOrientation(text) {
  if (!text || !text.trim()) {
    throw new Error('EMPTY ORIENTATION TEXT — Cannot parse orientation');
  }

  const lines = text.trim().split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    throw new Error('INVALID ORIENTATION — No items found');
  }

  if (lines.length < 1 || lines.length > 5) {
    throw new Error('INVALID ORIENTATION — Must have 1–5 items');
  }

  // Validate each item
  for (let i = 0; i < lines.length; i++) {
    const item = lines[i];
    
    if (item.length < 5) {
      throw new Error('INVALID ORIENTATION — Item too short: "' + item + '"');
    }
    
    if (item.endsWith(',')) {
      throw new Error('INVALID ORIENTATION — Item ends with comma: "' + item + '"');
    }
  }

  return lines;
}

function parseReflection(text) {
  if (!text || !text.trim()) {
    return [];
  }

  const lines = text.trim().split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length > 2) {
    throw new Error('INVALID REFLECTION — Must have 0–2 items, found ' + lines.length);
  }

  // Validate each reflection item is a complete sentence
  for (let i = 0; i < lines.length; i++) {
    const item = lines[i];
    
    if (!item.match(/[.!?]$/)) {
      throw new Error('INVALID REFLECTION — Item must end with sentence punctuation: "' + item + '"');
    }
    
    // Reject items ending with comma (likely truncated)
    if (item.endsWith(',')) {
      throw new Error('INVALID REFLECTION — Item appears truncated: "' + item + '"');
    }
  }

  return lines;
}

function parseStringField(text, fieldName) {
  if (!text || !text.trim()) {
    throw new Error('EMPTY ' + fieldName.toUpperCase() + ' TEXT — Cannot parse ' + fieldName);
  }

  const trimmed = text.trim();

  if (trimmed.length === 0) {
    throw new Error('INVALID ' + fieldName.toUpperCase() + ' — Must be a non-empty string');
  }

  // Require complete sentence ending for context and framing
  if (fieldName === 'context' || fieldName === 'framing') {
    if (!trimmed.match(/[.!?]$/)) {
      throw new Error('INVALID ' + fieldName.toUpperCase() + ' — Must end with sentence punctuation: "' + trimmed + '"');
    }
  }

  return trimmed;
}


// ================== WRITE OUTPUT ==================
function writeDailyBrief(brief, status) {
  const sheet = getSheetOrFail(SURFACEA_TAB_SURFACE_A);
  const now = new Date();

  const orientationText = brief.orientation.map(x => '• ' + x).join('\n');
  const reflectionText = brief.reflection.length > 0
    ? brief.reflection.map(x => '• ' + x).join('\n')
    : '';

  sheet.getRange(1, 1, 9, 2).setValues([
    ['generated_at', now],
    ['timeframe', 'Today'],
    ['orientation', orientationText],
    ['attention', brief.attention],
    ['context', brief.context],
    ['framing', brief.framing],
    ['reflection', reflectionText],
    ['control', 'Continue · Dig deeper · Pause'],
    ['last_run_status', status]
  ]);
}

// ================== HELPERS ==================
function getRecentRawNotes(limit) {
  const sheet = getSheetOrFail(SURFACEA_TAB_RAW);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return [];

  // TODO: Filter by last_successful_run_at boundary (read only entries since last successful run)
  return data
    .slice(1)            // skip header
    .map(row => row[1])  // column B
    .filter(Boolean)
    .slice(-limit);
}

function getLastSuccessfulRunAt() {
  // TODO: Read last_successful_run_at from DAILY_BRIEF substrate
  // Returns null if no previous successful run exists
  return null;
}

function getSheetOrFail(name) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(name);

  if (!sheet) {
    throw new Error('Missing required tab: ' + name);
  }

  return sheet;
}

