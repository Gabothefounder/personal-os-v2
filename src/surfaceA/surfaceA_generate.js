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

// ================== LANGUAGE LOCK ==================
const SURFACE_A_LANGUAGE = 'fr'; // or 'en'

// ================== ENTRY POINT ==================
// NOTE: For scheduled automation, triggers should call runDailyIntelligenceCycle() instead of runDailySynthesis()
// to ensure DERIVED runs automatically after successful Surface A synthesis.
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
    substrate = _generateSurfaceASubstrate(rawNotes);
  } catch (e) {
    Logger.log('SURFACE A SYNTHESIS FAILED — Aborting. Previous substrate unchanged.');
    Logger.log(e.message);
    return;
  }

  _writeSurfaceASubstrate(substrate, 'SUCCESS');
  
  _appendSurfaceAArchive(substrate);

  // Surface B Daily runs automatically after successful Surface A synthesis
  try {
    runSurfaceBDailyOnce();
  } catch (e) {
    // Surface B failure does not affect Surface A success
    Logger.log('Surface B Daily failed (non-fatal): ' + e.message);
  }

  Logger.log('--- DAILY SYNTHESIS END ---');
}

// ================== SINGLE-PASS SYNTHESIS ==================
function _generateSurfaceASubstrate(rawNotes) {
  const prompt = _buildUnifiedSurfaceAPrompt(rawNotes);
  Logger.log('SURFACE A UNIFIED PROMPT BUILT');

  const aiText = _callGemini(prompt);
  Logger.log('=== SURFACE A OUTPUT START ===');
  Logger.log(aiText);
  Logger.log('=== SURFACE A OUTPUT END ===');

  const substrate = _parseSurfaceAJSON(aiText);
  
  return substrate;
}

function _buildUnifiedSurfaceAPrompt(rawNotes) {
  const langInstruction = SURFACE_A_LANGUAGE === 'fr' 
    ? 'All output must be written in French. Do not switch languages.'
    : 'All output must be written in English. Do not switch languages.';
  
  return `RAW NOTES:
${rawNotes.map(n => '- ' + n).join('\n')}

OUTPUT RULES:
- ${langInstruction}
- Return ONLY valid JSON. No markdown. No code blocks.
- All values must be strings.
- Each field may contain 0–2 complete sentences. Prefer 1 sentence when possible.
- Complete sentences only. No bullets, lists, or leading symbols.
- If information is insufficient, return "" for that field.
- Descriptive only. No advice, no judgment, no interpretation.

FIELD DEFINITIONS:
- orientation: What the day was broadly oriented around, if observable.
- attention: Where cognitive or emotional attention was primarily directed.
- context: Factual situational backdrop (events, people, circumstances).
- framing: How the day was implicitly experienced or structured.
- reflection: Notable internal observations explicitly present in RAW.
- constraints: Observed limitations (time, energy, availability, attention).

REQUIRED JSON SCHEMA:
{
  "orientation": "",
  "attention": "",
  "context": "",
  "framing": "",
  "reflection": "",
  "constraints": ""
}

Return ONLY the JSON object.`;
}

function _parseSurfaceAJSON(text) {
  let jsonText = text.trim();
  
  // Remove markdown code blocks if present
  jsonText = jsonText.replace(/^```json\s*/i, '');
  jsonText = jsonText.replace(/^```\s*/i, '');
  jsonText = jsonText.replace(/\s*```$/i, '');
  jsonText = jsonText.trim();
  
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    throw new Error('INVALID JSON — Failed to parse Surface A output: ' + e.message);
  }
  
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('INVALID JSON — Surface A output is not an object');
  }
  
  const substrate = {
    orientation: _sanitizeField(parsed.orientation),
    attention: _sanitizeField(parsed.attention),
    context: _sanitizeField(parsed.context),
    framing: _sanitizeField(parsed.framing),
    reflection: _sanitizeField(parsed.reflection),
    constraints: _sanitizeField(parsed.constraints)
  };
  
  return substrate;
}

function _sanitizeField(value) {
  if (value === null || value === undefined) {
    return '';
  }
  
  let text = String(value).trim();
  
  if (text.length === 0) {
    return '';
  }
  
  // Remove leading bullet symbols
  text = text.replace(/^[\u2022\u2023\u25E6\u2043\u2219\-\*]\s*/g, '');
  text = text.replace(/^[\u2022\u2023\u25E6\u2043\u2219\-\*]\s*/gm, '');
  
  // Remove leading/trailing quotation marks
  text = text.replace(/^["'`«»„‚]/g, '');
  text = text.replace(/["'`«»„‚]$/g, '');
  
  text = text.trim();
  
  // If output ends mid-sentence (no punctuation), discard the fragment
  if (text.length > 0 && !/[.!?]$/.test(text[text.length - 1])) {
    const lastSentenceEnd = Math.max(
      text.lastIndexOf('.'),
      text.lastIndexOf('!'),
      text.lastIndexOf('?')
    );
    if (lastSentenceEnd >= 0) {
      text = text.substring(0, lastSentenceEnd + 1);
    } else {
      return '';
    }
  }
  
  text = text.trim();
  
  if (text.length === 0 || text.length < 3) {
    return '';
  }
  
  return text;
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
      maxOutputTokens: 1200
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

// ================== WRITE OUTPUT ==================
function _writeSurfaceASubstrate(substrate, status) {
  const sheet = _getSheetOrFail(SURFACEA_GEN_TAB_SURFACE_A);
  const now = new Date();

  const orientationText = String(substrate.orientation || '');
  const reflectionText = String(substrate.reflection || '');

  const values = [
    ['generated_at', now],
    ['timeframe', 'Today'],
    ['orientation', orientationText],
    ['attention', substrate.attention || ''],
    ['context', substrate.context || ''],
    ['framing', substrate.framing || ''],
    ['reflection', reflectionText],
    ['constraints', substrate.constraints || ''],
    ['last_run_status', status]
  ];

  sheet.getRange(1, 1, values.length, 2).setValues(values);
}

// ================== ARCHIVE ==================
function _appendSurfaceAArchive(substrate) {
  const sheet = _getOrCreateSheet('SURFACE_A_ARCHIVE');
  const data = sheet.getDataRange().getValues();
  
  if (data.length === 0) {
    const header = ['archived_at', 'run_id', 'orientation', 'attention', 'context', 'framing', 'reflection', 'constraints'];
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
  } else {
    const headerRow = data[0];
    if (headerRow.indexOf('constraints') === -1) {
      const lastCol = sheet.getLastColumn();
      sheet.getRange(1, lastCol + 1).setValue('constraints');
    }
  }
  
  const now = new Date();
  const runId = Utilities.getUuid();
  const orientationText = String(substrate.orientation || '');
  const attentionText = String(substrate.attention || '');
  const contextText = String(substrate.context || '');
  const framingText = String(substrate.framing || '');
  const reflectionText = String(substrate.reflection || '');
  const constraintsText = String(substrate.constraints || '');
  
  const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const constraintsIdx = headerRow.indexOf('constraints');
  
  const row = [now, runId, orientationText, attentionText, contextText, framingText, reflectionText];
  if (constraintsIdx >= 0) {
    while (row.length < constraintsIdx) {
      row.push('');
    }
    row[constraintsIdx] = constraintsText;
  }
  
  sheet.appendRow(row);
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

// ================== DAILY INTELLIGENCE ORCHESTRATION ==================
function runDailyIntelligenceCycle() {
  Logger.log('--- DAILY INTELLIGENCE CYCLE START ---');
  
  runDailySynthesis();
  
  // Check if Surface A succeeded by reading SURFACE_A sheet status
  const sheet = _getSheet(SURFACEA_GEN_TAB_SURFACE_A);
  if (!sheet) {
    Logger.log('DERIVED skipped: SURFACE_A sheet not found');
    Logger.log('--- DAILY INTELLIGENCE CYCLE END ---');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length === 0) {
    Logger.log('DERIVED skipped: SURFACE_A sheet is empty');
    Logger.log('--- DAILY INTELLIGENCE CYCLE END ---');
    return;
  }
  
  // Build key/value map to check last_run_status
  const keyValueMap = {};
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row.length >= 2) {
      const key = String(row[0] || '').trim();
      const value = row[1];
      if (key) {
        keyValueMap[key] = value;
      }
    }
  }
  
  const status = keyValueMap['last_run_status'];
  if (status !== 'SUCCESS') {
    Logger.log('DERIVED skipped: Surface A did not complete successfully');
    Logger.log('--- DAILY INTELLIGENCE CYCLE END ---');
    return;
  }
  
  // Surface A succeeded, run DERIVED
  try {
    _runDerivedOnce();
  } catch (e) {
    Logger.log('DERIVED computation failed: ' + e.message);
  }
  
  Logger.log('--- DAILY INTELLIGENCE CYCLE END ---');
}

// _getSheetOrFail is defined in personal_os_v2.js
