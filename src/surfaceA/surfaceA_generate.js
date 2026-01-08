// Surface A isolated. No behavioral changes.

/************************************************************
 * Surface A — Daily Canonical Substrate
 *
 * Purpose:
 * - Produce a readable, literal internal substrate
 * - No interpretation, no voice, no coaching
 *
 * Model: gemini-2.5-flash
 * API: Gemini API (v1)
 ************************************************************/

// ================== TAB NAMES ==================
const SURFACEA_GEN_TAB_RAW = 'RAW';
const SURFACEA_GEN_TAB_SURFACE_A = 'SURFACE_A';

// ================== ENTRY POINT ==================
function runDailySynthesis() {
  Logger.log('--- DAILY SYNTHESIS START ---');

  // TODO: Use last_successful_run_at boundary for incremental input
  const rawNotes = _getRecentRawNotes(20);
  Logger.log('RAW NOTES COUNT: ' + rawNotes.length);

  if (rawNotes.length === 0) {
    Logger.log('No RAW notes found. Aborting.');
    return;
  }

  let substrate;
  try {
    const orientation = _generateOrientation(rawNotes);
    const attention = _generateAttention(rawNotes);
    const context = _generateContext(rawNotes);
    const framing = _generateFraming(rawNotes);
    const reflection = _generateReflection(rawNotes);

    substrate = {
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

  _writeSurfaceASubstrate(substrate, 'SUCCESS');

  // Surface B Daily runs automatically after successful Surface A synthesis
  try {
    runSurfaceBDailyOnce();
  } catch (e) {
    // Surface B failure does not affect Surface A success
    Logger.log('Surface B Daily failed (non-fatal): ' + e.message);
  }

  Logger.log('--- DAILY SYNTHESIS END ---');
}

// ================== GEMINI CALL ==================
function _callGemini(promptText) {
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
function _generateOrientation(rawNotes) {
  const prompt = _buildOrientationPrompt(rawNotes);
  Logger.log('ORIENTATION PROMPT BUILT');

  const aiText = _callGemini(prompt);
  Logger.log('=== ORIENTATION OUTPUT START ===');
  Logger.log(aiText);
  Logger.log('=== ORIENTATION OUTPUT END ===');

  return _parseOrientation(aiText);
}

function _generateAttention(rawNotes) {
  try {
    const prompt = _buildAttentionPrompt(rawNotes);
    Logger.log('ATTENTION PROMPT BUILT');

    const aiText = _callGemini(prompt);
    Logger.log('=== ATTENTION OUTPUT START ===');
    Logger.log(aiText);
    Logger.log('=== ATTENTION OUTPUT END ===');

    return _parseStringField(aiText, 'attention');
  } catch (e) {
    return '';
  }
}

function _generateContext(rawNotes) {
  try {
    const prompt = _buildContextPrompt(rawNotes);
    Logger.log('CONTEXT PROMPT BUILT');

    const aiText = _callGemini(prompt);
    Logger.log('=== CONTEXT OUTPUT START ===');
    Logger.log(aiText);
    Logger.log('=== CONTEXT OUTPUT END ===');

    return _parseStringField(aiText, 'context');
  } catch (e) {
    return '';
  }
}

function _generateFraming(rawNotes) {
  try {
    const prompt = _buildFramingPrompt(rawNotes);
    Logger.log('FRAMING PROMPT BUILT');

    const aiText = _callGemini(prompt);
    Logger.log('=== FRAMING OUTPUT START ===');
    Logger.log(aiText);
    Logger.log('=== FRAMING OUTPUT END ===');

    return _parseStringField(aiText, 'framing');
  } catch (e) {
    return '';
  }
}

function _generateReflection(rawNotes) {
  try {
    const prompt = _buildReflectionPrompt(rawNotes);
    Logger.log('REFLECTION PROMPT BUILT');

    const aiText = _callGemini(prompt);
    Logger.log('=== REFLECTION OUTPUT START ===');
    Logger.log(aiText);
    Logger.log('=== REFLECTION OUTPUT END ===');

    return _parseReflection(aiText);
  } catch (e) {
    return [];
  }
}

// ================== PROMPTS ==================
function _buildOrientationPrompt(rawNotes) {
  return `RAW NOTES:
${rawNotes.map(n => '- ' + n).join('\n')}

Return 1–10 brief operational focus statements, one per line.
Each item MUST be a grammatically complete action statement.
Each statement may be a full sentence if needed to be self-contained.
Items must be concrete, action-oriented, and complete clauses.
Items must NOT end with conjunctions (and, or), prepositions (to, for, with), or auxiliary verbs.
If an action cannot be completed cleanly, it MUST be omitted rather than truncated.
Statements must describe observable actions, reviews, or concrete focus areas grounded in RAW.
Focus on operational orientation, not micro-action fragments.
Do NOT describe internal judgments, interpretations, or abstract goals.
Do NOT add prioritization, advice, or interpretation.
No numbering, bullets, or extra text.`;
}

function _buildAttentionPrompt(rawNotes) {
  return `RAW NOTES:
${rawNotes.map(n => '- ' + n).join('\n')}

Return exactly one sentence.
Do not end sentences with conjunctions such as 'and', 'or', 'to', 'for', 'with'.
If a complete sentence cannot be produced, omit the item entirely.
End the sentence with a period.
Stop after the sentence.
If unclear, return "No clear deprioritization today."
No extra text.`;
}

function _buildContextPrompt(rawNotes) {
  return `RAW NOTES:
${rawNotes.map(n => '- ' + n).join('\n')}

Return exactly one sentence.
The sentence must report concrete situational facts only: people, communications, obligations, events.
The sentence MUST reference at least one concrete noun (person, message, document, payment, event).
Abstract summaries of the day are NOT allowed.
Narrative phrasing (e.g., "a day of", "thoughts unfolded", "reflections") is forbidden.
Reference specific, observable nouns from RAW (people, projects, objects, constraints, institutions).
Do NOT include emotional states, reflections, or narrative phrasing.
Do not summarize emotions, meaning, or internal states.
Do not generalize or interpret.
Do not end sentences with conjunctions such as 'and', 'or', 'to', 'for', 'with'.
If a complete sentence cannot be produced, omit the item entirely.
If no concrete situational fact exists, return exactly: "No notable context."
End the sentence with a period.
Stop immediately after the period.
No extra text.`;
}

function _buildFramingPrompt(rawNotes) {
  return `RAW NOTES:
${rawNotes.map(n => '- ' + n).join('\n')}

Framing is optional. You may return no text.
If you return text, it must be one short, complete sentence.
The sentence should hold the shape of the day, not explain it.
Do not end sentences with conjunctions such as 'and', 'or', 'to', 'for', 'with'.
If a complete sentence cannot be produced, omit the item entirely.
Avoid conjunctions ("and", "but", "which", "while").
Avoid abstraction and explanation.
Do not motivate, advise, summarize, or interpret.
Do not use quotes or reference external authors.
Do not introduce insight or conclusions.
The framing should feel like a quiet container sentence that could be read aloud without pressure.
End the sentence with terminal punctuation.
Stop immediately after the sentence.
If a complete sentence cannot be produced safely, return nothing.
No extra text.`;
}

function _buildReflectionPrompt(rawNotes) {
  return `RAW NOTES:
${rawNotes.map(n => '- ' + n).join('\n')}

Reflection is optional. Return 0–3 reflective sentences, one per line.

Each reflection item must be one complete, self-contained sentence.
Use reflective phrasing (observational, third-person) rather than diary phrasing (first-person, emotional).
Example transformation (conceptual): "I feel bad about my work output" → "There is a recurring sense of dissatisfaction with current work output."

Requirements:
- Each sentence must be complete and self-contained.
- Do not end sentences with conjunctions such as 'and', 'or', 'to', 'for', 'with'.
- If a complete sentence cannot be produced, omit the item entirely.
- Preserve uncertainty, doubt, or open-endedness if present in RAW.
- Ground each reflection strictly in what is explicitly stated in RAW.
- Each sentence must end with terminal punctuation (. ! ?).

Forbidden:
- Do NOT add advice, conclusions, or meaning.
- Do NOT resolve emotions or provide closure.
- Do NOT use first-person emotional phrasing ("I feel", "I think", "I'm worried").
- Do NOT use continuation phrases ("it feels like", "I think that", "I haven't").
- Do NOT add interpretation beyond what RAW explicitly states.

If a complete, reflective sentence cannot be produced safely, return nothing.
No extra text.`;
}

// ================== PARSERS ==================
function _parseOrientation(text) {
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

function _parseReflection(text) {
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

function _parseStringField(text, fieldName) {
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
function _writeSurfaceASubstrate(substrate, status) {
  const sheet = _getSheetOrFail(SURFACEA_GEN_TAB_SURFACE_A);
  const now = new Date();

  const orientationText = substrate.orientation.map(x => '• ' + x).join('\n');
  const reflectionText = substrate.reflection.length > 0
    ? substrate.reflection.map(x => '• ' + x).join('\n')
    : '';

  sheet.getRange(1, 1, 9, 2).setValues([
    ['generated_at', now],
    ['timeframe', 'Today'],
    ['orientation', orientationText],
    ['attention', substrate.attention],
    ['context', substrate.context],
    ['framing', substrate.framing],
    ['reflection', reflectionText],
    ['control', 'Continue · Dig deeper · Pause'],
    ['last_run_status', status]
  ]);
}

// ================== HELPERS ==================
function _getRecentRawNotes(limit) {
  const sheet = _getSheetOrFail(SURFACEA_GEN_TAB_RAW);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return [];

  // TODO: Filter by last_successful_run_at boundary (read only entries since last successful run)
  return data
    .slice(1)            // skip header
    .map(row => row[1])  // column B
    .filter(Boolean)
    .slice(-limit);
}

function _getLastSuccessfulRunAt() {
  // TODO: Read last_successful_run_at from SURFACE_A substrate
  // Returns null if no previous successful run exists
  return null;
}

// _getSheetOrFail is defined in personal_os_v2.js
