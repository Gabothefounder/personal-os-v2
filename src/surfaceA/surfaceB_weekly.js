// Surface B — Weekly Read Model

/************************************************************
 * Surface B — Weekly Brief Projection
 *
 * Purpose:
 * - Generate weekly brief from stable patterns and commitments
 * - Read-only eligibility reporting
 * - No importance framing, no auto-entry into DECIDE MODE
 *
 * Rules:
 * - READ ONLY (no writes to source sheets)
 * - Writes to WEEKLY_VIEW sheet only
 * - NO Gemini
 * - No auto-entry into DECIDE MODE
 * - No importance framing
 * - No invitations or decisions
 * - Allowed language: "A recurrence remained stable…"
 * - Forbidden: "This seems important", "You should"
 ************************************************************/

// ================== TAB NAMES ==================
const SURFACEB_WEEKLY_TAB_DERIVED = 'DERIVED_SIGNALS';

// ================== ELIGIBILITY THRESHOLD ==================
// Minimum ratio of count/possible for a signal to be eligible for weekly review
const WEEKLY_ELIGIBILITY_THRESHOLD = 0.4; // 40% recurrence rate

// ================== ENTRY POINT ==================
function runSurfaceBWeeklyOnce() {
  Logger.log('--- SURFACE B WEEKLY BRIEF START ---');

  const derivedSignals = _readDerivedSignals();
  
  if (!derivedSignals || derivedSignals.length === 0) {
    Logger.log('No DERIVED_SIGNALS data available. Silence is valid output.');
    Logger.log('--- SURFACE B WEEKLY BRIEF END ---');
    return;
  }

  const eligibleSignals = _selectEligibleSignals(derivedSignals);
  const decidedItems = _readConfirmedSpeakable();

  const brief = _composeWeeklyBrief(eligibleSignals, decidedItems);

  Logger.log('=== WEEKLY BRIEF ===');
  Logger.log(brief);
  Logger.log('=== END WEEKLY BRIEF ===');

  _writeWeeklyView(brief);

  Logger.log('--- SURFACE B WEEKLY BRIEF END ---');
}

// ================== READ SOURCES ==================
function _readDerivedSignals() {
  const sheet = _getSheet(SURFACEB_WEEKLY_TAB_DERIVED);
  if (!sheet) {
    return null;
  }
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return [];
  }

  // Find header indices
  const headerRow = data[0];
  const fieldIdx = headerRow.indexOf('field');
  const patternKeyIdx = headerRow.indexOf('pattern_key');
  const countIdx = headerRow.indexOf('count');
  const possibleIdx = headerRow.indexOf('possible');
  const windowIdx = headerRow.indexOf('window');

  if (fieldIdx === -1 || patternKeyIdx === -1 || windowIdx === -1) {
    return [];
  }

  const signals = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const field = row[fieldIdx];
    const patternKey = row[patternKeyIdx];
    const count = row[countIdx] ? Number(row[countIdx]) : 0;
    const possible = row[possibleIdx] ? Number(row[possibleIdx]) : 0;
    const window = String(row[windowIdx] || '').trim();

    if (field && patternKey && window) {
      signals.push({
        field: String(field).trim(),
        pattern_key: String(patternKey).trim(),
        count: count,
        possible: possible,
        window: window
      });
    }
  }

  return signals;
}


// ================== SELECT ELIGIBLE SIGNALS ==================
function _selectEligibleSignals(signals) {
  const eligible = [];

  for (const signal of signals) {
      const windowDays = _extractWindowDays(signal.window);
    
    // Window must be 7-14 days
    if (windowDays < 7 || windowDays > 14) {
      continue;
    }

    // Count/possible must meet threshold
    if (signal.possible === 0) {
      continue;
    }
    
    const ratio = signal.count / signal.possible;
    if (ratio < WEEKLY_ELIGIBILITY_THRESHOLD) {
      continue;
    }

    eligible.push(signal);
  }

  return eligible;
}

function _extractWindowDays(windowStr) {
  if (!windowStr) {
    return 0;
  }
  
  // Extract number from strings like "5 days", "14 days", or just "14"
  const match = windowStr.match(/(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  return 0;
}

// ================== COMPOSE BRIEF ==================
function _composeWeeklyBrief(eligibleSignals, decidedItems) {
  const lines = [];

  // Eligible recurrences section
  if (eligibleSignals.length > 0) {
    for (const signal of eligibleSignals) {
      const windowDays = _extractWindowDays(signal.window);
      lines.push('A recurrence remained stable over the past ' + windowDays + ' days and is eligible for review.');
      if (signal.field && signal.pattern_key) {
        lines.push('Field: ' + signal.field + ', Pattern: ' + signal.pattern_key);
      }
      lines.push('');
    }
  } else {
    lines.push('No recurrences eligible for weekly review.');
    lines.push('');
  }

  // Optional: Confirmed commitments context heading
  if (decidedItems.length > 0) {
    lines.push('Confirmed Commitments');
    for (const item of decidedItems) {
      if (item.title) {
        lines.push(item.title);
      }
      if (item.description) {
        lines.push(item.description);
      }
    }
  }

  return lines.join('\n');
}

// ================== WRITE OUTPUT ==================
function _writeWeeklyView(text) {
  const sheet = _getOrCreateSheet('WEEKLY_VIEW');
  sheet.clearContents();

  const now = new Date();
  const rows = [
    [now], // Row 1: generated_at
    ['weekly'], // Row 2: view_type
    [text] // Row 3+: the composed text (single cell, preserve line breaks)
  ];

  sheet.getRange(1, 1, rows.length, 1).setValues(rows);
}

// ================== HELPERS ==================
// _getSheet and _getOrCreateSheet are defined in personal_os_v2.js
