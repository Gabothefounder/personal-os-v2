// TEMP EXECUTION GUARD — REMOVE AFTER VALIDATION
const SURFACEB_DAILY_GUARD = false;

// Surface B — Daily Read Model

/************************************************************
 * Surface B — Daily Brief Projection
 *
 * Purpose:
 * - Generate readable daily brief from multiple sources
 * - Read-only projection layer
 * - No decisions, no invitations, no pressure language
 *
 * Rules:
 * - READ ONLY
 * - NO writes to any sheet
 * - NO Gemini
 * - NO decisions
 * - NO invitations
 * - NO pressure language
 * - NO "should" language
 * - Silence is valid output
 ************************************************************/

// ================== TAB NAMES ==================
const SURFACEB_DAILY_TAB_SURFACE_A = 'DAILY_BRIEF';
const SURFACEB_DAILY_TAB_DERIVED = 'DERIVED_SIGNALS';

// ================== ENTRY POINT ==================
function runSurfaceBDailyOnce() {
  if (SURFACEB_DAILY_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  Logger.log('--- SURFACE B DAILY BRIEF START ---');

  const surfaceA = readTodaySurfaceA();
  const derivedSignals = readActiveDerivedSignals();
  const decidedItems = readConfirmedSpeakable();

  const brief = composeDailyBrief(surfaceA, derivedSignals, decidedItems);

  Logger.log('=== DAILY BRIEF ===');
  Logger.log(brief);
  Logger.log('=== END DAILY BRIEF ===');

  Logger.log('--- SURFACE B DAILY BRIEF END ---');
}

// ================== READ SOURCES ==================
function readTodaySurfaceA() {
  const sheet = getSheet(SURFACEB_DAILY_TAB_SURFACE_A);
  if (!sheet) {
    return null;
  }
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return null;
  }

  // Find header indices
  const headerRow = data[0];
  const generatedAtIdx = headerRow.indexOf('generated_at');
  const orientationIdx = headerRow.indexOf('orientation');
  const attentionIdx = headerRow.indexOf('attention');
  const contextIdx = headerRow.indexOf('context');
  const framingIdx = headerRow.indexOf('framing');
  const reflectionIdx = headerRow.indexOf('reflection');
  const statusIdx = headerRow.indexOf('last_run_status');

  if (generatedAtIdx === -1) {
    return null;
  }

  // Find most recent successful entry
  let latestEntry = null;
  let latestDate = null;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const generatedAt = row[generatedAtIdx];
    const status = statusIdx >= 0 ? String(row[statusIdx] || '').trim() : '';

    if (!generatedAt || !(generatedAt instanceof Date)) {
      continue;
    }

    // Only consider successful runs
    if (status !== 'SUCCESS') {
      continue;
    }

    if (!latestDate || generatedAt > latestDate) {
      latestDate = generatedAt;
      latestEntry = {
        generated_at: generatedAt,
        orientation: orientationIdx >= 0 ? String(row[orientationIdx] || '').trim() : '',
        attention: attentionIdx >= 0 ? String(row[attentionIdx] || '').trim() : '',
        context: contextIdx >= 0 ? String(row[contextIdx] || '').trim() : '',
        framing: framingIdx >= 0 ? String(row[framingIdx] || '').trim() : '',
        reflection: reflectionIdx >= 0 ? String(row[reflectionIdx] || '').trim() : ''
      };
    }
  }

  return latestEntry;
}

function readActiveDerivedSignals() {
  const sheet = getSheet(SURFACEB_DAILY_TAB_DERIVED);
  if (!sheet) {
    return [];
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
  const windowIdx = headerRow.indexOf('window');

  if (fieldIdx === -1 || patternKeyIdx === -1) {
    return [];
  }

  const signals = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const field = row[fieldIdx];
    const patternKey = row[patternKeyIdx];
    const count = row[countIdx];
    const window = row[windowIdx];

    if (field && patternKey) {
      signals.push({
        field: String(field).trim(),
        pattern_key: String(patternKey).trim(),
        count: count ? Number(count) : 0,
        window: window ? String(window).trim() : ''
      });
    }
  }

  return signals;
}

function readConfirmedSpeakable() {
  try {
    // Call listConfirmedSpeakable from decided_ledger.js
    if (typeof listConfirmedSpeakable === 'function') {
      return listConfirmedSpeakable();
    }
  } catch (e) {
    Logger.log('Could not read DECIDED items: ' + e.message);
  }
  return [];
}

// ================== COMPOSE BRIEF ==================
function composeDailyBrief(surfaceA, derivedSignals, decidedItems) {
  const lines = [];

  // Today section (from Surface A)
  lines.push('Today');
  if (surfaceA) {
    if (surfaceA.orientation && surfaceA.orientation.trim()) {
      lines.push(surfaceA.orientation);
    }
    if (surfaceA.attention && surfaceA.attention.trim()) {
      lines.push(surfaceA.attention);
    }
    if (surfaceA.context && surfaceA.context.trim()) {
      lines.push(surfaceA.context);
    }
    if (surfaceA.framing && surfaceA.framing.trim()) {
      lines.push(surfaceA.framing);
    }
    if (surfaceA.reflection && surfaceA.reflection.trim()) {
      lines.push(surfaceA.reflection);
    }
  } else {
    lines.push('No data available for this section today.');
  }
  lines.push('');

  // Patterns section (from DERIVED)
  lines.push('Patterns');
  if (derivedSignals.length > 0) {
    for (const signal of derivedSignals) {
      lines.push(signal.pattern_key + ' (' + signal.count + 'x in ' + signal.window + ')');
    }
  } else {
    lines.push('No data available for this section today.');
  }
  lines.push('');

  // Commitments section (from DECIDED)
  lines.push('Commitments');
  if (decidedItems.length > 0) {
    for (const item of decidedItems) {
      if (item.title) {
        lines.push(item.title);
      }
      if (item.description) {
        lines.push(item.description);
      }
    }
  } else {
    lines.push('No data available for this section today.');
  }

  return lines.join('\n');
}

// ================== HELPERS ==================
function getSheet(name) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(name);
  return sheet;
}
