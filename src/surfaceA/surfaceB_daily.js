// TEMP EXECUTION GUARD — REMOVE AFTER VALIDATION
throw new Error("TEMP GUARD: Do not run yet");

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
 * - NO writes to RAW, SURFACE_A, DERIVED, or DECIDED
 * - NO decisions
 * - NO invitations
 * - NO pressure language
 * - Silence is valid output
 ************************************************************/

// ================== TAB NAMES ==================
const TAB_SURFACE_A = 'SURFACE_A';
const TAB_DERIVED = 'DERIVED_SIGNALS';
const TAB_DECIDED = 'DECIDED';
const TAB_DAILY_VIEW = 'DAILY_VIEW';

// ================== ENTRY POINT ==================
function generateDailyBrief() {
  Logger.log('--- SURFACE B DAILY BRIEF START ---');

  const surfaceA = readTodaySurfaceA();
  const derivedSignals = readActiveDerivedSignals();
  const decidedItems = readSpokenDecidedItems();

  const brief = formatDailyBrief(surfaceA, derivedSignals, decidedItems);

  if (brief.length === 0) {
    Logger.log('No content to display. Silence is valid output.');
    writeDailyView([]);
    return;
  }

  writeDailyView(brief);
  Logger.log('--- SURFACE B DAILY BRIEF END ---');
}

// ================== READ SOURCES ==================
function readTodaySurfaceA() {
  const sheet = getSheet(TAB_SURFACE_A);
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
  const sheet = getSheet(TAB_DERIVED);
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
  const phraseIdx = headerRow.indexOf('phrase');
  const countIdx = headerRow.indexOf('count');
  const windowIdx = headerRow.indexOf('window');

  if (fieldIdx === -1) {
    return [];
  }

  const signals = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const field = row[fieldIdx];
    const phrase = row[phraseIdx];
    const count = row[countIdx];
    const window = row[windowIdx];

    if (field && phrase) {
      signals.push({
        field: String(field).trim(),
        phrase: String(phrase).trim(),
        count: count ? Number(count) : 0,
        window: window ? String(window).trim() : ''
      });
    }
  }

  return signals;
}

function readSpokenDecidedItems() {
  const sheet = getSheet(TAB_DECIDED);
  if (!sheet) {
    return [];
  }
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return [];
  }

  // Find header indices
  const headerRow = data[0];
  const idIdx = headerRow.indexOf('decided_id');
  const typeIdx = headerRow.indexOf('type');
  const statusIdx = headerRow.indexOf('status');
  const titleIdx = headerRow.indexOf('title');
  const bodyIdx = headerRow.indexOf('body');
  const usageIdx = headerRow.indexOf('allowed_surface_usage');

  if (statusIdx === -1 || usageIdx === -1) {
    return [];
  }

  const items = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const status = String(row[statusIdx] || '').trim();
    const usage = String(row[usageIdx] || '').trim();

    // Only confirmed items marked can_be_spoken
    if (status === 'confirmed' && usage === 'can_be_spoken') {
      items.push({
        decided_id: idIdx >= 0 ? String(row[idIdx] || '').trim() : '',
        type: typeIdx >= 0 ? String(row[typeIdx] || '').trim() : '',
        title: titleIdx >= 0 ? String(row[titleIdx] || '').trim() : '',
        body: bodyIdx >= 0 ? String(row[bodyIdx] || '').trim() : ''
      });
    }
  }

  return items;
}

// ================== FORMAT BRIEF ==================
function formatDailyBrief(surfaceA, derivedSignals, decidedItems) {
  const lines = [];

  // Surface A content
  if (surfaceA) {
    if (surfaceA.orientation && surfaceA.orientation.trim()) {
      lines.push('ORIENTATION');
      lines.push(surfaceA.orientation);
      lines.push('');
    }

    if (surfaceA.attention && surfaceA.attention.trim()) {
      lines.push('ATTENTION');
      lines.push(surfaceA.attention);
      lines.push('');
    }

    if (surfaceA.context && surfaceA.context.trim()) {
      lines.push('CONTEXT');
      lines.push(surfaceA.context);
      lines.push('');
    }

    if (surfaceA.framing && surfaceA.framing.trim()) {
      lines.push('FRAMING');
      lines.push(surfaceA.framing);
      lines.push('');
    }

    if (surfaceA.reflection && surfaceA.reflection.trim()) {
      lines.push('REFLECTION');
      lines.push(surfaceA.reflection);
      lines.push('');
    }
  }

  // Derived signals
  if (derivedSignals.length > 0) {
    lines.push('RECURRING PATTERNS');
    for (const signal of derivedSignals) {
      lines.push(signal.phrase + ' (' + signal.count + 'x in ' + signal.window + ')');
    }
    lines.push('');
  }

  // Decided items
  if (decidedItems.length > 0) {
    lines.push('ACTIVE COMMITMENTS');
    for (const item of decidedItems) {
      if (item.title) {
        lines.push(item.title);
      }
      if (item.body) {
        lines.push(item.body);
      }
      lines.push('');
    }
  }

  // Remove trailing empty lines
  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }

  return lines;
}

// ================== WRITE OUTPUT ==================
function writeDailyView(briefLines) {
  const sheet = getOrCreateSheet(TAB_DAILY_VIEW);
  sheet.clearContents();

  if (briefLines.length === 0) {
    return;
  }

  // Write as single column
  const rows = briefLines.map(line => [line]);
  sheet.getRange(1, 1, rows.length, 1).setValues(rows);
}

// ================== HELPERS ==================
function getSheet(name) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(name);
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
