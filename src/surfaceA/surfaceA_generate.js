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
    const orientation = _generateOrientation(rawNotes);
    const attention = _generateAttention(rawNotes);
    const context = _generateContext(rawNotes);
    const framing = _generateFraming(rawNotes);
    const reflection = _generateReflection(rawNotes);
    const constraints = _generateConstraints(rawNotes);

    substrate = {
      orientation,
      attention,
      context,
      framing,
      reflection,
      constraints
    };
    
    _validateAndRegenerateTruncatedFields(substrate, rawNotes);
  } catch (e) {
    Logger.log('FIELD GENERATION/VALIDATION FAILED — Aborting. Previous substrate unchanged.');
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

function _generateConstraints(rawNotes) {
  try {
    const prompt = _buildConstraintsPrompt(rawNotes);
    Logger.log('CONSTRAINTS PROMPT BUILT');

    const aiText = _callGemini(prompt);
    Logger.log('=== CONSTRAINTS OUTPUT START ===');
    Logger.log(aiText);
    Logger.log('=== CONSTRAINTS OUTPUT END ===');

    return _parseStringField(aiText, 'constraints');
  } catch (e) {
    return '';
  }
}

// ================== PROMPTS ==================
// ITERATION: Increased informational density while preserving restraint and non-interpretive tone.
// Maintains CIA/M-style briefing tone, non-coaching language, and trust through omission.
//
// ORIENTATION (max 3, deduplication, scoping):
//   - Prevents: truncated bullets like "Send a report" (incomplete scope)
//   - Prevents: duplicate items with same verb+object (redundancy)
//   - Prevents: vague items missing who/what/when (unclear scope)
//   - Examples show complete vs incomplete bullets
//
// CONTEXT (concrete facts only, empty allowed):
//   - Prevents: internal state language ("pursuing", "deprioritized", "expected")
//   - Prevents: abstraction ("considerations", "themes") instead of concrete facts
//   - Examples show concrete facts vs abstract summaries
//
// ATTENTION (descriptive, not prescriptive):
//   - Allows: light evaluative framing if explicitly in RAW (entertainment vs serious)
//   - Prevents: advice, expectation-setting, psychological diagnosis, moral judgment
//   - Examples show allowed descriptive vs forbidden prescriptive language
//
// FRAMING (grounded in Context/Orientation, concrete):
//   - Prevents: abstract themes ("balancing priorities") replacing concrete description
//   - Requires grounding in Context or Orientation
//   - Examples show concrete framing vs abstract interpretation
//
// REFLECTION (explicit RAW only, silence preferred):
//   - Only includes if RAW contains explicit reflective language ("I noticed...", "I felt...")
//   - Prevents: inferring reflection, resolving emotions, speculation
//   - Silence preferred over abstraction
//
// GENERAL (reinforced across all):
//   - Never: advice, meaning assignment, motivation, reassurance, prediction, obligation
//   - Silence is not failure. Omission preferred to abstraction.

function _buildOrientationPrompt(rawNotes) {
  return `RAW NOTES:
${rawNotes.map(n => '- ' + n).join('\n')}

GLOBAL OUTPUT RULES (CRITICAL):
- Use ONE language only for all fields. Do not mix languages.
- Write in complete sentences only.
- Do NOT use bullet points, lists, dashes, or leading symbols.
- Do NOT truncate sentences.
- Prefer fewer complete sentences over many partial ones.
- If information is insufficient, output an empty string for that field.
- Never output placeholders, ellipses, or unfinished thoughts.
- Surface A is descriptive only. No advice, no judgment, no interpretation.

ORIENTATION:
Write 0 to 3 complete sentences.
Each sentence must be fully formed.
If the RAW entries do not clearly support this field, return an empty string.
Do not summarize across days. Use only the provided RAW window.

Field intent: What the day was broadly oriented around, if observable.

Each sentence must be concrete, action-oriented, and complete.
Sentences must NOT end with conjunctions (and, or), prepositions (to, for, with), or auxiliary verbs.
If an action cannot be completed cleanly, it MUST be omitted rather than truncated.
DO NOT output incomplete sentences like "Send a report" — either include full scope or omit entirely.

Sentences must describe observable actions, reviews, or concrete focus areas grounded in RAW.
Focus on operational orientation, not micro-action fragments.
Do NOT describe internal judgments, interpretations, or abstract goals.
Do NOT add prioritization, advice, or interpretation.
No numbering, bullets, or extra text.`;
}

function _buildAttentionPrompt(rawNotes) {
  return `RAW NOTES:
${rawNotes.map(n => '- ' + n).join('\n')}

GLOBAL OUTPUT RULES (CRITICAL):
- Use ONE language only for all fields. Do not mix languages.
- Write in complete sentences only.
- Do NOT use bullet points, lists, dashes, or leading symbols.
- Do NOT truncate sentences.
- Prefer fewer complete sentences over many partial ones.
- If information is insufficient, output an empty string for that field.
- Never output placeholders, ellipses, or unfinished thoughts.
- Surface A is descriptive only. No advice, no judgment, no interpretation.

ATTENTION:
Write 0 to 3 complete sentences.
Each sentence must be fully formed.
If the RAW entries do not clearly support this field, return an empty string.
Do not summarize across days. Use only the provided RAW window.

Field intent: Where cognitive or emotional attention was primarily directed.

Must be descriptive, not prescriptive.
May reference people if they appear in RAW.
May include light evaluative framing (e.g., entertainment vs serious),
  but must avoid:
  - advice
  - expectation-setting
  - psychological diagnosis
  - moral judgment

Do not end sentences with conjunctions such as 'and', 'or', 'to', 'for', 'with'.
If a complete sentence cannot be produced, return an empty string.
End each sentence with a period if returning text.
Stop after the sentences or empty string.
No extra text.`;
}

function _buildContextPrompt(rawNotes) {
  return `RAW NOTES:
${rawNotes.map(n => '- ' + n).join('\n')}

GLOBAL OUTPUT RULES (CRITICAL):
- Use ONE language only for all fields. Do not mix languages.
- Write in complete sentences only.
- Do NOT use bullet points, lists, dashes, or leading symbols.
- Do NOT truncate sentences.
- Prefer fewer complete sentences over many partial ones.
- If information is insufficient, output an empty string for that field.
- Never output placeholders, ellipses, or unfinished thoughts.
- Surface A is descriptive only. No advice, no judgment, no interpretation.

CONTEXT:
Write 0 to 3 complete sentences.
Each sentence must be fully formed.
If the RAW entries do not clearly support this field, return an empty string.
Do not summarize across days. Use only the provided RAW window.

Field intent: Factual situational backdrop (events, people, circumstances).

Only include observable events, actions, or references.
No internal states, intentions, or abstractions.
No relationship evaluation.

Each sentence must report concrete situational facts only: people, communications, obligations, events.
Each sentence MUST reference at least one concrete noun (person, message, document, payment, event).
Abstract summaries of the day are NOT allowed.
Narrative phrasing (e.g., "a day of", "thoughts unfolded", "reflections") is forbidden.
Reference specific, observable nouns from RAW (people, projects, objects, constraints, institutions).

FORBIDDEN WORDS AND PHRASES (these indicate internal states, not facts):
- "focused on", "pursuing", "prioritizing", "deprioritized", "expected"
- "considerations", "themes", "reflections", "thoughts"
- Any language describing intentions, motivations, or internal states

Do NOT include emotional states, reflections, or narrative phrasing.
Do not summarize emotions, meaning, or internal states.
Do not generalize or interpret.
Do not end sentences with conjunctions such as 'and', 'or', 'to', 'for', 'with'.
If a complete sentence cannot be produced, return an empty string.
If no concrete external facts are available, return an empty string.
End each sentence with a period if returning text.
Stop immediately after the sentences or empty string.
No extra text.`;
}

function _buildFramingPrompt(rawNotes) {
  return `RAW NOTES:
${rawNotes.map(n => '- ' + n).join('\n')}

GLOBAL OUTPUT RULES (CRITICAL):
- Use ONE language only for all fields. Do not mix languages.
- Write in complete sentences only.
- Do NOT use bullet points, lists, dashes, or leading symbols.
- Do NOT truncate sentences.
- Prefer fewer complete sentences over many partial ones.
- If information is insufficient, output an empty string for that field.
- Never output placeholders, ellipses, or unfinished thoughts.
- Surface A is descriptive only. No advice, no judgment, no interpretation.

FRAMING:
Write 0 to 3 complete sentences.
Each sentence must be fully formed.
If the RAW entries do not clearly support this field, return an empty string.
Do not summarize across days. Use only the provided RAW window.

Field intent: How the day was implicitly experienced or structured.

Must be grounded in Context or Orientation.
Must remain concrete.
No abstract themes.
No emotional language.

Each sentence must be concrete and factual. It may summarize the day, but:
- Must reference specific, observable elements (people, activities, events)
- Must avoid abstraction like "considerations", "themes", "reflections", "thoughts"
- Must avoid vague containers like "a day of" or "involved"

The sentences should hold the shape of the day, not explain it.
Do not end sentences with conjunctions such as 'and', 'or', 'to', 'for', 'with'.
If a complete sentence cannot be produced, return an empty string.
Avoid conjunctions ("and", "but", "which", "while").
Avoid abstraction and explanation.
Do not motivate, advise, summarize, or interpret.
Do not use quotes or reference external authors.
Do not introduce insight or conclusions.
The framing should feel like quiet container sentences that could be read aloud without pressure.
End each sentence with terminal punctuation (. ! ?) if returning text.
Stop immediately after the sentences or empty string.
If a complete sentence cannot be produced safely, return an empty string.
No extra text.`;
}

function _buildReflectionPrompt(rawNotes) {
  return `RAW NOTES:
${rawNotes.map(n => '- ' + n).join('\n')}

GLOBAL OUTPUT RULES (CRITICAL):
- Use ONE language only for all fields. Do not mix languages.
- Write in complete sentences only.
- Do NOT use bullet points, lists, dashes, or leading symbols.
- Do NOT truncate sentences.
- Prefer fewer complete sentences over many partial ones.
- If information is insufficient, output an empty string for that field.
- Never output placeholders, ellipses, or unfinished thoughts.
- Surface A is descriptive only. No advice, no judgment, no interpretation.

REFLECTION:
Write 0 to 3 complete sentences.
Each sentence must be fully formed.
If the RAW entries do not clearly support this field, return an empty string.
Do not summarize across days. Use only the provided RAW window.

Field intent: Notable internal observations explicitly present in RAW.

Only include reflection if RAW contains explicit reflective language
  (e.g., "I noticed…", "I felt…", "I realized…").
Never infer reflection.
Never resolve or explain emotions.
Silence is preferred over speculation.

Each reflection sentence must be one complete, self-contained sentence.
Use reflective phrasing (observational, third-person) rather than diary phrasing (first-person, emotional).

Each sentence must be complete and self-contained.
Do not end sentences with conjunctions such as 'and', 'or', 'to', 'for', 'with'.
If a complete sentence cannot be produced, omit the item entirely.
Preserve uncertainty, doubt, or open-endedness if present in RAW.
Ground each reflection strictly in what is explicitly stated in RAW.
Each sentence must end with terminal punctuation (. ! ?).

Forbidden:
- Do NOT add advice, conclusions, or meaning.
- Do NOT resolve emotions or provide closure.
- Do NOT use first-person emotional phrasing ("I feel", "I think", "I'm worried") unless explicitly present in RAW.
- Do NOT use continuation phrases ("it feels like", "I think that", "I haven't").
- Do NOT add interpretation beyond what RAW explicitly states.

If no explicit reflective material exists in RAW, return an empty string.
If a complete, reflective sentence cannot be produced safely, return an empty string.
No extra text.`;
}

function _buildConstraintsPrompt(rawNotes) {
  return `RAW NOTES:
${rawNotes.map(n => '- ' + n).join('\n')}

GLOBAL OUTPUT RULES (CRITICAL):
- Use ONE language only for all fields. Do not mix languages.
- Write in complete sentences only.
- Do NOT use bullet points, lists, dashes, or leading symbols.
- Do NOT truncate sentences.
- Prefer fewer complete sentences over many partial ones.
- If information is insufficient, output an empty string for that field.
- Never output placeholders, ellipses, or unfinished thoughts.
- Surface A is descriptive only. No advice, no judgment, no interpretation.

CONSTRAINTS:
Write 0 to 3 complete sentences.
Each sentence must be fully formed.
If the RAW entries do not clearly support this field, return an empty string.
Do not summarize across days. Use only the provided RAW window.

Field intent: Observed limitations (time, energy, availability, attention).

Descriptive only.
No advice.
No leverage language.
No interpretation.
May be empty if none are observed.

Do not end sentences with conjunctions such as 'and', 'or', 'to', 'for', 'with'.
If a complete sentence cannot be produced, return an empty string.
End each sentence with a period if returning text.
Stop after the sentences or empty string.
No extra text.`;
}

// ================== PARSERS ==================
function _parseOrientation(text) {
  if (!text || !text.trim()) {
    throw new Error('EMPTY ORIENTATION TEXT — Cannot parse orientation');
  }

  const sentences = text.trim().split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (sentences.length === 0) {
    throw new Error('INVALID ORIENTATION — No sentences found');
  }

  if (sentences.length < 1 || sentences.length > 3) {
    throw new Error('INVALID ORIENTATION — Must have 1–3 sentences');
  }

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    
    if (sentence.length < 5) {
      throw new Error('INVALID ORIENTATION — Sentence too short: "' + sentence + '"');
    }
    
    if (sentence.endsWith(',') || sentence.endsWith(';') || sentence.endsWith(':')) {
      throw new Error('INVALID ORIENTATION — Sentence appears incomplete: "' + sentence + '"');
    }
  }

  return sentences;
}

function _parseReflection(text) {
  if (!text || !text.trim()) {
    return [];
  }

  const sentences = text.trim().split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (sentences.length > 3) {
    throw new Error('INVALID REFLECTION — Must have 0–3 sentences, found ' + sentences.length);
  }

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    
    if (sentence.length < 5) {
      throw new Error('INVALID REFLECTION — Sentence too short: "' + sentence + '"');
    }
    
    if (sentence.endsWith(',') || sentence.endsWith(';') || sentence.endsWith(':')) {
      throw new Error('INVALID REFLECTION — Sentence appears incomplete: "' + sentence + '"');
    }
  }

  return sentences;
}

function _parseStringField(text, fieldName) {
  if (!text || !text.trim()) {
    if (fieldName === 'constraints') {
      return '';
    }
    throw new Error('EMPTY ' + fieldName.toUpperCase() + ' TEXT — Cannot parse ' + fieldName);
  }

  const trimmed = text.trim();

  if (trimmed.length === 0) {
    if (fieldName === 'constraints') {
      return '';
    }
    throw new Error('INVALID ' + fieldName.toUpperCase() + ' — Must be a non-empty string');
  }

  // Require complete sentence ending for context, framing, and constraints
  if (fieldName === 'context' || fieldName === 'framing' || fieldName === 'constraints') {
    if (trimmed.length > 0 && !trimmed.match(/[.!?]$/)) {
      throw new Error('INVALID ' + fieldName.toUpperCase() + ' — Must end with sentence punctuation: "' + trimmed + '"');
    }
  }

  return trimmed;
}

function _validateAndRegenerateTruncatedFields(substrate, rawNotes) {
  if (substrate.attention && typeof substrate.attention === 'string' && _isTruncated(substrate.attention)) {
    try {
      substrate.attention = _generateAttention(rawNotes);
    } catch (e) {
      substrate.attention = '';
    }
  }
  
  if (substrate.context && typeof substrate.context === 'string' && _isTruncated(substrate.context)) {
    try {
      substrate.context = _generateContext(rawNotes);
    } catch (e) {
      substrate.context = '';
    }
  }
  
  if (substrate.framing && typeof substrate.framing === 'string' && _isTruncated(substrate.framing)) {
    try {
      substrate.framing = _generateFraming(rawNotes);
    } catch (e) {
      substrate.framing = '';
    }
  }
  
  if (substrate.constraints && typeof substrate.constraints === 'string' && _isTruncated(substrate.constraints)) {
    try {
      substrate.constraints = _generateConstraints(rawNotes);
    } catch (e) {
      substrate.constraints = '';
    }
  }
  
  if (Array.isArray(substrate.orientation)) {
    let needsRegeneration = false;
    for (let i = 0; i < substrate.orientation.length; i++) {
      if (_isTruncated(substrate.orientation[i])) {
        needsRegeneration = true;
        break;
      }
    }
    if (needsRegeneration) {
      try {
        substrate.orientation = _generateOrientation(rawNotes);
      } catch (e) {
        substrate.orientation = [];
      }
    }
  }
  
  if (Array.isArray(substrate.reflection)) {
    let needsRegeneration = false;
    for (let i = 0; i < substrate.reflection.length; i++) {
      if (_isTruncated(substrate.reflection[i])) {
        needsRegeneration = true;
        break;
      }
    }
    if (needsRegeneration) {
      try {
        substrate.reflection = _generateReflection(rawNotes);
      } catch (e) {
        substrate.reflection = [];
      }
    }
  }
}

function _isTruncated(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }
  
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return false;
  }
  
  if (trimmed.endsWith('...') || trimmed.endsWith('…')) {
    return true;
  }
  
  if (!trimmed.match(/[.!?]$/)) {
    if (trimmed.length > 10) {
      return true;
    }
  }
  
  if (trimmed.endsWith(',') || trimmed.endsWith(';') || trimmed.endsWith(':')) {
    return true;
  }
  
  return false;
}

// ================== WRITE OUTPUT ==================
function _writeSurfaceASubstrate(substrate, status) {
  const sheet = _getSheetOrFail(SURFACEA_GEN_TAB_SURFACE_A);
  const now = new Date();

  const orientationText = substrate.orientation.map(x => '• ' + x).join('\n');
  const reflectionText = substrate.reflection.length > 0
    ? substrate.reflection.map(x => '• ' + x).join('\n')
    : '';

  const values = [
    ['generated_at', now],
    ['timeframe', 'Today'],
    ['orientation', orientationText],
    ['attention', substrate.attention],
    ['context', substrate.context],
    ['framing', substrate.framing],
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
  const orientationText = Array.isArray(substrate.orientation) ? substrate.orientation.join('\n') : String(substrate.orientation || '');
  const attentionText = String(substrate.attention || '');
  const contextText = String(substrate.context || '');
  const framingText = String(substrate.framing || '');
  const reflectionText = Array.isArray(substrate.reflection) ? substrate.reflection.join('\n') : String(substrate.reflection || '');
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
