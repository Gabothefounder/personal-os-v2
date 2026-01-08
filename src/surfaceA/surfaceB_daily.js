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
 * - READ ONLY (no writes to source sheets)
 * - Writes to DAILY_VIEW sheet only
 * - NO Gemini
 * - NO decisions
 * - NO invitations
 * - NO pressure language
 * - NO "should" language
 * - Silence is valid output
 ************************************************************/

// ================== TAB NAMES ==================
const SURFACEB_DAILY_TAB_SURFACE_A = 'SURFACE_A';
const SURFACEB_DAILY_TAB_DERIVED = 'DERIVED_SIGNALS';

// ================== ENTRY POINT ==================
function runSurfaceBDailyOnce() {
  Logger.log('--- SURFACE B DAILY BRIEF START ---');

  const surfaceA = _readTodaySurfaceA();
  const derivedSignals = _readActiveDerivedSignals();
  const decidedItems = _readConfirmedSpeakable();

  const dailyText = _composeDailyBrief(surfaceA, derivedSignals, decidedItems);

  Logger.log('=== DAILY BRIEF ===');
  Logger.log(dailyText);
  Logger.log('=== END DAILY BRIEF ===');

  _writeDailyView(dailyText);

  _writeDailyVoiceBriefToDoc(dailyText);

  Logger.log('--- SURFACE B DAILY BRIEF END ---');
}

// ================== READ SOURCES ==================
// Surface A writes data as key/value vertical pairs:
// Column A: keys (generated_at, orientation, attention, context, framing, reflection, last_run_status, etc.)
// Column B: values
// Each run overwrites the previous entry, so we read the current key/value pairs.
function _readTodaySurfaceA() {
  const sheet = _getSheet(SURFACEB_DAILY_TAB_SURFACE_A);
  if (!sheet) {
    return null;
  }
  const data = sheet.getDataRange().getValues();

  if (data.length === 0) {
    return null;
  }

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

  // Check if this is a successful run
  const status = keyValueMap['last_run_status'];
  if (status !== 'SUCCESS') {
    return null;
  }

  // Extract fields - missing fields are skipped silently
  const entry = {
    generated_at: keyValueMap['generated_at'] || null,
    orientation: keyValueMap['orientation'] ? String(keyValueMap['orientation']).trim() : '',
    attention: keyValueMap['attention'] ? String(keyValueMap['attention']).trim() : '',
    context: keyValueMap['context'] ? String(keyValueMap['context']).trim() : '',
    framing: keyValueMap['framing'] ? String(keyValueMap['framing']).trim() : '',
    reflection: keyValueMap['reflection'] ? String(keyValueMap['reflection']).trim() : ''
  };

  // Return entry if we have at least generated_at (indicates valid Surface A data)
  if (entry.generated_at) {
    return entry;
  }

  return null;
}

function _readActiveDerivedSignals() {
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


// ================== DATE FORMATTING ==================
function _formatDateHeader(dateValue) {
  if (!dateValue) {
    return 'Today';
  }

  let date;
  if (dateValue instanceof Date) {
    date = dateValue;
  } else {
    date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      return 'Today';
    }
  }

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// ================== COMPOSE BRIEF ==================
function _composeDailyBrief(surfaceA, derivedSignals, decidedItems) {
  const lines = [];

  // Date header (from Surface A generated_at) - always first
  let dateHeader = 'Today';
  if (surfaceA && surfaceA.generated_at) {
    dateHeader = _formatDateHeader(surfaceA.generated_at);
  }
  lines.push(dateHeader);
  lines.push('');

  if (surfaceA) {
    // Orientation section: operational focus statements (verbatim from Surface A)
    if (surfaceA.orientation && surfaceA.orientation.trim()) {
      lines.push('Operational orientation.');
      lines.push('');
      lines.push(surfaceA.orientation);
      lines.push('');
    }

    // Attention field: render verbatim if present
    if (surfaceA.attention && surfaceA.attention.trim()) {
      lines.push(surfaceA.attention);
      lines.push('');
    }

    // Context section: situational conditions (verbatim from Surface A)
    if (surfaceA.context && surfaceA.context.trim()) {
      lines.push('Situational context.');
      lines.push('');
      lines.push(surfaceA.context);
      lines.push('');
    }

    // Framing field: render verbatim if present
    if (surfaceA.framing && surfaceA.framing.trim()) {
      lines.push(surfaceA.framing);
      lines.push('');
    }

    // Reflection section: observational reflections (verbatim from Surface A)
    if (surfaceA.reflection && surfaceA.reflection.trim()) {
      lines.push('Observations.');
      lines.push('');
      lines.push(surfaceA.reflection);
      lines.push('');
    }
  } else {
    lines.push('Operational orientation.');
    lines.push('');
    lines.push('No operational data available.');
    lines.push('');
  }

  // Patterns section (from DERIVED) - optional, silent if empty
  if (derivedSignals.length > 0) {
    lines.push('Recurring patterns.');
    lines.push('');
    for (const signal of derivedSignals) {
      lines.push(signal.pattern_key + '. ' + signal.count + ' occurrences over ' + signal.window + '.');
    }
    lines.push('');
  }

  // Commitments section (from DECIDED) - optional, silent if empty
  if (decidedItems.length > 0) {
    lines.push('Confirmed commitments.');
    lines.push('');
    for (const item of decidedItems) {
      if (item.title) {
        lines.push(item.title);
      }
      if (item.description) {
        lines.push(item.description);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ================== WRITE OUTPUT ==================
function _writeDailyView(text) {
  const sheet = _getOrCreateSheet('DAILY_VIEW');
  sheet.clearContents();

  const now = new Date();
  const rows = [
    [now], // Row 1: generated_at
    ['daily'], // Row 2: view_type
    [text] // Row 3+: the composed text (single cell, preserve line breaks)
  ];

  sheet.getRange(1, 1, rows.length, 1).setValues(rows);
}

// ================== EXPORT TO DAILY VOICE BRIEF DOC ==================
function _writeDailyVoiceBriefToDoc(dailyText) {
  if (!dailyText || !dailyText.trim()) {
    Logger.log('No daily text to write to Daily Voice Brief doc.');
    return;
  }

  const props = PropertiesService.getScriptProperties();
  const docId = props.getProperty('DAILY_VOICE_DOC_ID');

  if (!docId) {
    Logger.log('DAILY_VOICE_DOC_ID not found in Script Properties. Document not updated.');
    return;
  }

  let doc;
  try {
    doc = DocumentApp.openById(docId);
  } catch (e) {
    Logger.log('Could not open Daily Voice Brief document by ID: ' + e.message);
    return;
  }

  const body = doc.getBody();
  body.clear();

  const lines = dailyText.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    body.appendParagraph(line);
  }

  Logger.log('Daily Voice Brief document updated successfully.');
}

// ================== HELPERS ==================
// _getSheet and _getOrCreateSheet are defined in personal_os_v2.js
