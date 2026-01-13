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
  const openTasks = typeof listOpenTasks === 'function' ? listOpenTasks() : [];

  const dailyText = _composeDailyBrief(surfaceA, derivedSignals, decidedItems, openTasks);

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

// ================== TONE HELPERS ==================
function _makeDry(text) {
  if (!text || !text.trim()) {
    return text;
  }
  
  let dry = String(text).trim();
  
  // Remove forbidden phrases
  dry = dry.replace(/\byou should\b/gi, '');
  dry = dry.replace(/\bit would be good to\b/gi, '');
  dry = dry.replace(/\bthis suggests\b/gi, '');
  dry = dry.replace(/\bencouraging\b/gi, '');
  dry = dry.replace(/\bpositive\b/gi, '');
  dry = dry.replace(/\bgrowth\b/gi, '');
  dry = dry.replace(/\bjourney\b/gi, '');
  dry = dry.replace(/\breflection\b/gi, '');
  dry = dry.replace(/\btake time\b/gi, '');
  dry = dry.replace(/\bremember to\b/gi, '');
  
  // Remove hedging
  dry = dry.replace(/\bappears to be\b/gi, 'is');
  dry = dry.replace(/\bseems to be\b/gi, 'is');
  dry = dry.replace(/\bappears\b/gi, 'is');
  
  // Tighten phrasing
  dry = dry.replace(/\bin order to\b/gi, 'to');
  dry = dry.replace(/\bfor the purpose of\b/gi, 'to');
  dry = dry.replace(/\bwith regard to\b/gi, 'regarding');
  dry = dry.replace(/\bwith respect to\b/gi, 'regarding');
  
  // Clean up spaces
  dry = dry.replace(/\s+/g, ' ').trim();
  
  return dry;
}

function _splitIntoSentences(text) {
  if (!text || !text.trim()) {
    return [];
  }
  
  const sentences = String(text)
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  return sentences;
}

function _limitSentences(sentences, max) {
  return sentences.slice(0, max);
}

// ================== COMPOSE BRIEF ==================
function _composeDailyBrief(surfaceA, derivedSignals, decidedItems, openTasks) {
  const lines = [];

  // Header: Date only
  let dateHeader = 'Today';
  if (surfaceA && surfaceA.generated_at) {
    const date = surfaceA.generated_at instanceof Date 
      ? surfaceA.generated_at 
      : new Date(surfaceA.generated_at);
    if (!isNaN(date.getTime())) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      dateHeader = date.toLocaleDateString('en-US', options);
    }
  }
  lines.push(dateHeader);
  lines.push('');

  // Operational Orientation
  lines.push('Operational Orientation');
  lines.push('');
  if (surfaceA) {
    const orientationText = surfaceA.orientation ? String(surfaceA.orientation).trim() : '';
    const framingText = surfaceA.framing ? String(surfaceA.framing).trim() : '';
    
    if (orientationText || framingText) {
      const combined = [orientationText, framingText].filter(Boolean).join(' ');
      const sentences = _splitIntoSentences(combined);
      const limited = _limitSentences(sentences, 2);
      const dry = limited.map(s => _makeDry(s)).filter(Boolean);
      if (dry.length > 0) {
        lines.push(dry.join(' '));
      } else {
        lines.push('No clear orientation observed.');
      }
    } else {
      lines.push('No clear orientation observed.');
    }
  } else {
    lines.push('No operational data available.');
  }
  lines.push('');

  // Attention & Load
  lines.push('Attention & Load');
  lines.push('');
  if (surfaceA) {
    const attentionText = surfaceA.attention ? String(surfaceA.attention).trim() : '';
    if (attentionText) {
      const sentences = _splitIntoSentences(attentionText);
      const limited = _limitSentences(sentences, 2);
      const dry = limited.map(s => _makeDry(s)).filter(Boolean);
      if (dry.length > 0) {
        lines.push(dry.join(' '));
      } else {
        lines.push('No notable pressure observed.');
      }
    } else {
      lines.push('No notable pressure observed.');
    }
  } else {
    lines.push('No attention data available.');
  }
  lines.push('');

  // Situational Context
  lines.push('Situational Context');
  lines.push('');
  if (surfaceA) {
    const contextText = surfaceA.context ? String(surfaceA.context).trim() : '';
    if (contextText) {
      const sentences = _splitIntoSentences(contextText);
      const limited = _limitSentences(sentences, 2);
      const dry = limited.map(s => _makeDry(s)).filter(Boolean);
      if (dry.length > 0) {
        lines.push(dry.join(' '));
      } else {
        lines.push('No concrete facts recorded.');
      }
    } else {
      lines.push('No concrete facts recorded.');
    }
  } else {
    lines.push('No context data available.');
  }
  lines.push('');

  // Observations
  lines.push('Observations');
  lines.push('');
  if (surfaceA) {
    const reflectionText = surfaceA.reflection ? String(surfaceA.reflection).trim() : '';
    if (reflectionText) {
      const sentences = _splitIntoSentences(reflectionText);
      const limited = _limitSentences(sentences, 1);
      const dry = limited.map(s => _makeDry(s)).filter(Boolean);
      if (dry.length > 0) {
        lines.push(dry[0]);
      } else {
        lines.push('Nothing particularly noteworthy.');
      }
    } else {
      lines.push('Nothing particularly noteworthy.');
    }
  } else {
    lines.push('No observations available.');
  }
  lines.push('');

  // Operational Actions Outstanding
  lines.push('Operational Actions Outstanding');
  lines.push('');
  if (openTasks && openTasks.length > 0) {
    for (const task of openTasks) {
      const content = task.content ? String(task.content).trim() : '';
      if (content) {
        lines.push('• ' + content);
      }
    }
    if (openTasks.length === 0) {
      lines.push('No outstanding actions.');
    }
  } else {
    lines.push('No outstanding actions.');
  }
  lines.push('');

  // Closing Note
  lines.push('Closing Note');
  lines.push('');
  const closingNotes = [
    'The day proceeds as it will.',
    'Nothing particularly alarming.',
    'All rather straightforward.',
    'One imagines the day will unfold accordingly.',
    'The pieces are in place, more or less.'
  ];
  const noteIndex = (openTasks ? openTasks.length : 0) % closingNotes.length;
  lines.push(closingNotes[noteIndex]);

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
