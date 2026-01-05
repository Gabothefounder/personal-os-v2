// TEMP EXECUTION GUARD — REMOVE AFTER VALIDATION
throw new Error("TEMP GUARD: Do not run yet");

// Surface B — Weekly Read Model

/************************************************************
 * Surface B — Weekly Brief Projection
 *
 * Purpose:
 * - Generate weekly brief from stable patterns and commitments
 * - Read-only projection layer
 * - No importance framing, no auto-entry into DECIDE MODE
 *
 * Rules:
 * - READ ONLY
 * - No auto-entry into DECIDE MODE
 * - No importance framing
 * - Allowed language: "A recurrence has remained stable…", "Confirmed objective…"
 * - Forbidden: "This seems important", "You should"
 ************************************************************/

// ================== TAB NAMES ==================
const TAB_DERIVED = 'DERIVED_SIGNALS';
const TAB_DECIDED = 'DECIDED';
const TAB_WEEKLY_VIEW = 'WEEKLY_VIEW';

// ================== ENTRY POINT ==================
function generateWeeklyBrief() {
  Logger.log('--- SURFACE B WEEKLY BRIEF START ---');

  const stableSignals = readStableDerivedSignals();
  const decidedItems = readSpokenDecidedItems();

  const brief = formatWeeklyBrief(stableSignals, decidedItems);

  if (brief.length === 0) {
    Logger.log('No content to display. Silence is valid output.');
    writeWeeklyView([]);
    return;
  }

  writeWeeklyView(brief);
  Logger.log('--- SURFACE B WEEKLY BRIEF END ---');
}

// ================== READ SOURCES ==================
function readStableDerivedSignals() {
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
  const datesIdx = headerRow.indexOf('dates');

  if (fieldIdx === -1 || windowIdx === -1) {
    return [];
  }

  const stableSignals = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const window = String(row[windowIdx] || '').trim();
    const field = String(row[fieldIdx] || '').trim();
    const phrase = String(row[phraseIdx] || '').trim();
    const count = row[countIdx] ? Number(row[countIdx]) : 0;
    const dates = row[datesIdx] ? String(row[datesIdx] || '').trim() : '';

    // Filter for signals with window ≥7 days
    const windowDays = extractWindowDays(window);
    if (windowDays >= 7 && field && phrase) {
      stableSignals.push({
        field: field,
        phrase: phrase,
        count: count,
        window: window,
        dates: dates
      });
    }
  }

  return stableSignals;
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
function formatWeeklyBrief(stableSignals, decidedItems) {
  const lines = [];

  // Stable recurrences
  if (stableSignals.length > 0) {
    lines.push('STABLE RECURRENCES');
    lines.push('');
    
    for (const signal of stableSignals) {
      lines.push('A recurrence has remained stable:');
      lines.push(signal.phrase);
      lines.push('Appeared ' + signal.count + ' times over ' + signal.window);
      if (signal.dates) {
        lines.push('Dates: ' + signal.dates);
      }
      lines.push('');
    }
  }

  // Confirmed commitments
  if (decidedItems.length > 0) {
    lines.push('CONFIRMED COMMITMENTS');
    lines.push('');
    
    for (const item of decidedItems) {
      if (item.type === 'Objective') {
        lines.push('Confirmed objective:');
      } else if (item.type === 'Principle') {
        lines.push('Confirmed principle:');
      } else if (item.type === 'Project') {
        lines.push('Confirmed project:');
      } else if (item.type === 'Constraint') {
        lines.push('Confirmed constraint:');
      } else if (item.type === 'Decision') {
        lines.push('Confirmed decision:');
      } else {
        lines.push('Confirmed ' + item.type.toLowerCase() + ':');
      }
      
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
function writeWeeklyView(briefLines) {
  const sheet = getOrCreateSheet(TAB_WEEKLY_VIEW);
  sheet.clearContents();

  if (briefLines.length === 0) {
    return;
  }

  // Write as single column
  const rows = briefLines.map(line => [line]);
  sheet.getRange(1, 1, rows.length, 1).setValues(rows);
}

// ================== HELPERS ==================
function extractWindowDays(windowStr) {
  if (!windowStr) {
    return 0;
  }
  
  // Extract number from strings like "5 days", "14 days"
  const match = windowStr.match(/(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  return 0;
}

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
