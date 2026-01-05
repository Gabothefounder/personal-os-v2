// TEMP EXECUTION GUARD — REMOVE AFTER VALIDATION
throw new Error("TEMP GUARD: Do not run yet");

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
const TAB_SURFACE_A = 'SURFACE_A';
const TAB_DERIVED = 'DERIVED_SIGNALS';

// ================== ENTRY POINT ==================
function computeDerivedSignals() {
  Logger.log('--- DERIVED COMPUTE START ---');

  const surfaceData = readSurfaceAData();
  
  if (surfaceData.length === 0) {
    Logger.log('No SURFACE_A data found. Writing nothing.');
    writeDerivedSignals([]);
    return;
  }

  const signals = [];

  // Analyze last 5 days
  const signals5 = detectRecurrences(surfaceData, 5);
  signals.push(...signals5);

  // Analyze last 14 days
  const signals14 = detectRecurrences(surfaceData, 14);
  signals.push(...signals14);

  if (signals.length === 0) {
    Logger.log('No stable signals detected. Writing nothing.');
    writeDerivedSignals([]);
    return;
  }

  writeDerivedSignals(signals);
  Logger.log('--- DERIVED COMPUTE END ---');
}

// ================== READ SURFACE_A ==================
function readSurfaceAData() {
  const sheet = getSheetOrFail(TAB_SURFACE_A);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return [];

  const records = [];
  
  // Parse header row to find column indices
  const headerRow = data[0];
  const generatedAtIdx = headerRow.indexOf('generated_at');
  const orientationIdx = headerRow.indexOf('orientation');
  const reflectionIdx = headerRow.indexOf('reflection');

  if (generatedAtIdx === -1) {
    Logger.log('Missing generated_at column in SURFACE_A');
    return [];
  }

  // Read data rows
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const generatedAt = row[generatedAtIdx];
    
    if (!generatedAt || !(generatedAt instanceof Date)) {
      continue;
    }

    const orientation = orientationIdx >= 0 ? String(row[orientationIdx] || '').trim() : '';
    const reflection = reflectionIdx >= 0 ? String(row[reflectionIdx] || '').trim() : '';

    records.push({
      date: generatedAt,
      orientation: orientation,
      reflection: reflection
    });
  }

  // Sort by date descending (most recent first)
  records.sort((a, b) => b.date.getTime() - a.date.getTime());

  return records;
}

// ================== RECURRENCE DETECTION ==================
function detectRecurrences(records, windowDays) {
  const signals = [];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - windowDays);

  // Filter to window
  const windowRecords = records.filter(r => r.date >= cutoffDate);

  if (windowRecords.length < 2) {
    return [];
  }

  // Analyze orientation field
  const orientationSignals = detectFieldRecurrences(windowRecords, 'orientation', windowDays);
  signals.push(...orientationSignals);

  // Analyze reflection field
  const reflectionSignals = detectFieldRecurrences(windowRecords, 'reflection', windowDays);
  signals.push(...reflectionSignals);

  return signals;
}

function detectFieldRecurrences(records, fieldName, windowDays) {
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
    const phrases = parsePhrases(fieldValue);

    for (const phrase of phrases) {
      const normalized = normalizePhrase(phrase);
      
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
  for (const [normalized, entry] of phraseCounts.entries()) {
    if (entry.count >= 2) {
      signals.push({
        field: fieldName,
        phrase: entry.original,
        count: entry.count,
        window: windowDays + ' days',
        dates: entry.dates.map(d => d.toISOString().split('T')[0]).sort()
      });
    }
  }

  return signals;
}

// ================== TEXT PROCESSING ==================
function parsePhrases(text) {
  // Split by bullet points or newlines
  const lines = text.split(/[•\n]/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  return lines;
}

function normalizePhrase(phrase) {
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
function writeDerivedSignals(signals) {
  const sheet = getOrCreateSheet(TAB_DERIVED);
  sheet.clearContents();

  if (signals.length === 0) {
    return;
  }

  // Write header
  const header = ['field', 'phrase', 'count', 'window', 'dates'];
  const rows = [header];

  // Write signal rows
  for (const signal of signals) {
    rows.push([
      signal.field,
      signal.phrase,
      signal.count,
      signal.window,
      signal.dates.join(', ')
    ]);
  }

  sheet.getRange(1, 1, rows.length, header.length).setValues(rows);
}

// ================== HELPERS ==================
function getSheetOrFail(name) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(name);

  if (!sheet) {
    throw new Error('Missing required tab: ' + name);
  }

  return sheet;
}

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  return sheet;
}
