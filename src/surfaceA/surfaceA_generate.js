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

  const substrate = {
    orientation: '',
    attention: '',
    context: '',
    framing: '',
    reflection: '',
    constraints: ''
  };
  
  try {
    substrate.orientation = _generateOrientation(rawNotes);
  } catch (e) {
    Logger.log('ORIENTATION generation failed: ' + e.message);
  }
  
  try {
    substrate.attention = _generateAttention(rawNotes);
  } catch (e) {
    Logger.log('ATTENTION generation failed: ' + e.message);
  }
  
  try {
    substrate.context = _generateContext(rawNotes);
  } catch (e) {
    Logger.log('CONTEXT generation failed: ' + e.message);
  }
  
  try {
    substrate.framing = _generateFraming(rawNotes);
  } catch (e) {
    Logger.log('FRAMING generation failed: ' + e.message);
  }
  
  try {
    substrate.reflection = _generateReflection(rawNotes);
  } catch (e) {
    Logger.log('REFLECTION generation failed: ' + e.message);
  }
  
  try {
    substrate.constraints = _generateConstraints(rawNotes);
  } catch (e) {
    Logger.log('CONSTRAINTS generation failed: ' + e.message);
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

// ================== FIELD GENERATION ==================
function _generateOrientation(rawNotes) {
  const prompt = _buildOrientationPrompt(rawNotes);
  const aiText = _callGemini(prompt);
  return _sanitizeField(aiText);
}

function _generateAttention(rawNotes) {
  const prompt = _buildAttentionPrompt(rawNotes);
  const aiText = _callGemini(prompt);
  return _sanitizeField(aiText);
}

function _generateContext(rawNotes) {
  const prompt = _buildContextPrompt(rawNotes);
  const aiText = _callGemini(prompt);
  return _sanitizeField(aiText);
}

function _generateFraming(rawNotes) {
  const prompt = _buildFramingPrompt(rawNotes);
  const aiText = _callGemini(prompt);
  return _sanitizeField(aiText);
}

function _generateReflection(rawNotes) {
  const prompt = _buildReflectionPrompt(rawNotes);
  const aiText = _callGemini(prompt);
  return _sanitizeField(aiText);
}

function _generateConstraints(rawNotes) {
  const prompt = _buildConstraintsPrompt(rawNotes);
  const aiText = _callGemini(prompt);
  return _sanitizeField(aiText);
}

// ================== PROMPTS ==================
function _buildOrientationPrompt(rawNotes) {
  const lang = SURFACE_A_LANGUAGE === 'fr' ? 'French' : 'English';
  const recentNotes = rawNotes.slice(-20).map(n => '- ' + n).join('\n');
  
  return `RAW NOTES:
${recentNotes}

Write up to 3 sentences describing what the day was broadly oriented around (activities, focus areas).
Be descriptive only.
Truncation is acceptable.
Do not explain. Do not advise.
Write in ${lang}.`;
}

function _buildAttentionPrompt(rawNotes) {
  const lang = SURFACE_A_LANGUAGE === 'fr' ? 'French' : 'English';
  const recentNotes = rawNotes.slice(-20).map(n => '- ' + n).join('\n');
  
  return `RAW NOTES:
${recentNotes}

Write up to 3 sentences describing where cognitive or emotional attention was primarily directed.
Be descriptive only.
Truncation is acceptable.
Do not explain. Do not advise.
Write in ${lang}.`;
}

function _buildContextPrompt(rawNotes) {
  const lang = SURFACE_A_LANGUAGE === 'fr' ? 'French' : 'English';
  const recentNotes = rawNotes.slice(-20).map(n => '- ' + n).join('\n');
  
  return `RAW NOTES:
${recentNotes}

Write up to 3 sentences describing factual situational backdrop (events, people, circumstances).
Be descriptive only.
Truncation is acceptable.
Do not explain. Do not advise.
Write in ${lang}.`;
}

function _buildFramingPrompt(rawNotes) {
  const lang = SURFACE_A_LANGUAGE === 'fr' ? 'French' : 'English';
  const recentNotes = rawNotes.slice(-20).map(n => '- ' + n).join('\n');
  
  return `RAW NOTES:
${recentNotes}

Write up to 3 sentences describing how the day was implicitly experienced or structured.
Be descriptive only.
Truncation is acceptable.
Do not explain. Do not advise.
Write in ${lang}.`;
}

function _buildReflectionPrompt(rawNotes) {
  const lang = SURFACE_A_LANGUAGE === 'fr' ? 'French' : 'English';
  const recentNotes = rawNotes.slice(-20).map(n => '- ' + n).join('\n');
  
  return `RAW NOTES:
${recentNotes}

Write up to 3 sentences describing notable internal observations explicitly present in RAW.
Be descriptive only.
Truncation is acceptable.
Do not explain. Do not advise.
Write in ${lang}.`;
}

function _buildConstraintsPrompt(rawNotes) {
  const lang = SURFACE_A_LANGUAGE === 'fr' ? 'French' : 'English';
  const recentNotes = rawNotes.slice(-20).map(n => '- ' + n).join('\n');
  
  return `RAW NOTES:
${recentNotes}

Write up to 3 sentences describing observed limitations (time, energy, availability, attention).
Be descriptive only.
Truncation is acceptable.
Do not explain. Do not advise.
Write in ${lang}.`;
}

function _sanitizeField(value) {
  if (value === null || value === undefined) {
    return '';
  }
  
  const text = String(value).trim();
  
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
