// DERIVED FROZEN — schema stable — 2026-01-06
// TEMP EXECUTION GUARD — REMOVE AFTER VALIDATION
const DERIVED_GUARD = false;

// DRY RUN MODE — Set to false to enable writes
const DRY_RUN = false;

// DERIVED — Pattern Observation Layer (Deterministic, Non-LLM)

/************************************************************
 * DERIVED Signal Computation
 *
 * Purpose:
 * - Observe recurrence patterns in SURFACE_A substrate
 * - No interpretation, no ranking, no advice
 * - Deterministic token-based comparison only
 *
 * Rules:
 * - NO Gemini
 * - NO prompts
 * - NO interpretation
 * - NO ranking
 * - NO advice
 * - Silence is valid output
 ************************************************************/

// ================== TAB NAMES ==================
const DERIVED_TAB_SURFACE_A = 'SURFACE_A';
const DERIVED_TAB_DERIVED = 'DERIVED_SIGNALS';

// ================== ENTRY POINT ==================
function _runDerivedOnce() {
  if (DERIVED_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  Logger.log('--- DERIVED COMPUTE START ---');
  Logger.log('DRY_RUN mode: ' + DRY_RUN);

  const surfaceData = _readSurfaceAData();
  
  if (surfaceData.length === 0) {
    Logger.log('No SURFACE_A data found.');
    if (!DRY_RUN) {
      _writeDerivedSignals([]);
    }
    Logger.log('--- DERIVED COMPUTE END ---');
    return;
  }

  Logger.log('Found ' + surfaceData.length + ' SURFACE_A records');

  const signals = [];

  // Analyze last 5 days
  const signals5 = _detectRecurrences(surfaceData, 5);
  signals.push(...signals5);
  Logger.log('5-day window: ' + signals5.length + ' signals');

  // Analyze last 14 days
  const signals14 = _detectRecurrences(surfaceData, 14);
  signals.push(...signals14);
  Logger.log('14-day window: ' + signals14.length + ' signals');

  if (signals.length === 0) {
    Logger.log('No stable signals detected.');
    if (!DRY_RUN) {
      _writeDerivedSignals([]);
    }
    Logger.log('--- DERIVED COMPUTE END ---');
    return;
  }

  // Log all signals
  Logger.log('=== DETECTED SIGNALS ===');
  for (const signal of signals) {
    Logger.log('Field: ' + signal.field);
    Logger.log('Phrase: ' + signal.phrase);
    Logger.log('Count: ' + signal.count);
    Logger.log('Window: ' + signal.window);
    Logger.log('Dates: ' + signal.dates.join(', '));
    Logger.log('---');
  }

  if (DRY_RUN) {
    Logger.log('DRY_RUN: Skipping write to DERIVED_SIGNALS sheet');
  } else {
    _writeDerivedSignals(signals);
    Logger.log('Wrote ' + signals.length + ' signals to DERIVED_SIGNALS sheet');
  }

  Logger.log('--- DERIVED COMPUTE END ---');
}

function _computeDerivedSignals() {
  if (DERIVED_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  _runDerivedOnce();
}

// ================== READ SURFACE_A ==================
// Surface A writes data as key/value vertical pairs:
// Column A: keys (generated_at, orientation, reflection, last_run_status, etc.)
// Column B: values
// Each run overwrites the previous entry.
// NOTE: For pattern detection across multiple days, historical records would be needed.
// Currently reads only the current run's data.
function _readSurfaceAData() {
  const sheet = _getSheetOrFail(DERIVED_TAB_SURFACE_A);
  const data = sheet.getDataRange().getValues();

  if (data.length === 0) return [];

  // Build a map from keys (column A) to values (column B)
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

  // Quality guard: only process successful Surface A runs
  const status = keyValueMap['last_run_status'];
  if (status !== 'SUCCESS') {
    Logger.log('SURFACE_A last_run_status is not SUCCESS. Skipping DERIVED computation.');
    return [];
  }

  const generatedAt = keyValueMap['generated_at'];
  if (!generatedAt || !(generatedAt instanceof Date)) {
    Logger.log('Missing or invalid generated_at in SURFACE_A');
    return [];
  }

  const orientation = keyValueMap['orientation'] ? String(keyValueMap['orientation']).trim() : '';
  const reflection = keyValueMap['reflection'] ? String(keyValueMap['reflection']).trim() : '';

  // Return single record (Surface A overwrites each run)
  // For proper pattern detection, multiple historical records would be needed
  return [{
    date: generatedAt,
    orientation: orientation,
    reflection: reflection
  }];
}

// ================== RECURRENCE DETECTION ==================
function _detectRecurrences(records, windowDays) {
  const signals = [];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - windowDays);

  // Filter to window
  const windowRecords = records.filter(r => r.date >= cutoffDate);

  if (windowRecords.length < 2) {
    return [];
  }

  // Analyze orientation field
  const orientationSignals = _detectFieldRecurrences(windowRecords, 'orientation', windowDays);
  signals.push(...orientationSignals);

  // Analyze reflection field
  const reflectionSignals = _detectFieldRecurrences(windowRecords, 'reflection', windowDays);
  signals.push(...reflectionSignals);

  return signals;
}

function _detectFieldRecurrences(records, fieldName, windowDays) {
  const signals = [];
  const phraseCounts = new Map();

  // Extract and normalize phrases from each record
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const fieldValue = record[fieldName];

    if (!fieldValue || fieldValue.trim().length === 0) {
      continue;
    }

    // Parse phrases (orientation items or reflection sentences)
    const phrases = _parsePhrases(fieldValue);

    for (const phrase of phrases) {
      const normalized = _normalizePhrase(phrase);
      
      if (normalized.length === 0) {
        continue;
      }

      if (!phraseCounts.has(normalized)) {
        phraseCounts.set(normalized, {
          original: phrase,
          normalized: normalized,
          count: 0,
          dates: []
        });
      }

      const entry = phraseCounts.get(normalized);
      entry.count++;
      entry.dates.push(record.date);
    }
  }

  // Find phrases that recur (appear 2+ times)
  const totalRecords = records.length;
  for (const [normalized, entry] of phraseCounts.entries()) {
    if (entry.count >= 2) {
      signals.push({
        field: fieldName,
        phrase: entry.original,
        pattern_key: normalized,
        count: entry.count,
        possible: totalRecords,
        window: windowDays + ' days',
        dates: entry.dates.map(d => d.toISOString().split('T')[0]).sort()
      });
    }
  }

  return signals;
}

// ================== TEXT PROCESSING ==================
function _parsePhrases(text) {
  // Split by bullet points or newlines
  const lines = text.split(/[•\n]/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  return lines;
}

function _normalizePhrase(phrase) {
  // Lowercase
  let normalized = phrase.toLowerCase();
  
  // Trim
  normalized = normalized.trim();
  
  // Remove punctuation (keep spaces)
  normalized = normalized.replace(/[.,!?;:()\[\]{}'"]/g, '');
  
  // Normalize whitespace
  normalized = normalized.replace(/\s+/g, ' ');
  
  return normalized.trim();
}

// ================== WRITE OUTPUT ==================
function _writeDerivedSignals(signals) {
  const sheet = _getOrCreateSheet(DERIVED_TAB_DERIVED);
  sheet.clearContents();

  const now = new Date();
  
  // Write header
  const header = ['generated_at', 'window', 'field', 'pattern_key', 'count', 'possible', 'dates_json'];
  const rows = [header];

  // Write signal rows
  for (const signal of signals) {
    rows.push([
      now,
      signal.window,
      signal.field,
      signal.pattern_key,
      signal.count,
      signal.possible,
      JSON.stringify(signal.dates)
    ]);
  }

  sheet.getRange(1, 1, rows.length, header.length).setValues(rows);
}

// ================== HELPERS ==================
// _getSheetOrFail and _getOrCreateSheet are defined in personal_os_v2.js
