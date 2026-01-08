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

// ================== EDITORIAL POLISH HELPER ==================
// Moneypenny-style editorial aside: intelligent, amused, observant.
// LANGUAGE-ONLY transformation: no semantic changes, no new facts, no interpretation.
// Removes analyst hedging, tightens phrasing, improves cadence, replaces weak verbs.
// Adds warmth, wit, and subtle charm while retaining intelligence and restraint.
function _polishSentence(text) {
  if (!text || !text.trim()) {
    return text;
  }

  let polished = String(text).trim();

  // Remove analyst hedging phrases (do these first to avoid interfering with other replacements)
  // Replace with warmer, more direct phrasing where appropriate
  polished = polished.replace(/\bis noted as\b/gi, 'is');
  polished = polished.replace(/\bappears to be\b/gi, 'is');
  polished = polished.replace(/\bis described as\b/gi, 'is');
  polished = polished.replace(/\bseems to be\b/gi, 'is');
  polished = polished.replace(/\bappears\b/gi, 'is');
  
  // Add warmth: soften overly formal constructions
  polished = polished.replace(/\bIt is\b/gi, 'It\'s');
  polished = polished.replace(/\bThere is\b/gi, 'There\'s');
  polished = polished.replace(/\bThat is\b/gi, 'That\'s');
  
  // Add subtle wit: replace dry formalities with slightly more engaging phrasing
  polished = polished.replace(/\bwith regard to\b/gi, 'regarding');
  polished = polished.replace(/\bwith respect to\b/gi, 'regarding');
  polished = polished.replace(/\bin relation to\b/gi, 'regarding');

  // Replace weak verbs with firmer neutral verbs (specific patterns first)
  // Handle "send a report from X" → "deliver the X report"
  polished = polished.replace(/\bsend a report from\s+([A-Za-z]+)\s+to\s+([A-Za-z]+)\b/gi, 'deliver the $1 report to $2');
  polished = polished.replace(/\bsend a report from\s+([A-Za-z]+)\b/gi, 'deliver the $1 report');
  polished = polished.replace(/\bsend the report from\s+([A-Za-z]+)\b/gi, 'deliver the $1 report');
  // General report delivery verbs
  polished = polished.replace(/\bsend a report\b/gi, 'deliver the report');
  polished = polished.replace(/\bsend the report\b/gi, 'deliver the report');
  polished = polished.replace(/\bsend report\b/gi, 'deliver the report');
  polished = polished.replace(/\bprovide a report\b/gi, 'deliver the report');
  polished = polished.replace(/\bprovide the report\b/gi, 'deliver the report');
  polished = polished.replace(/\bgive a report\b/gi, 'deliver the report');
  polished = polished.replace(/\bgive the report\b/gi, 'deliver the report');

  // Tighten "report from X to Y" constructions (handle after verb replacements)
  polished = polished.replace(/\breport from\s+([A-Za-z]+)\s+to\s+([A-Za-z]+)\b/gi, '$1 report to $2');
  polished = polished.replace(/\breport of\b/gi, 'report on');
  polished = polished.replace(/\breport about\b/gi, 'report on');

  // Remove redundancy in common patterns (attention field examples)
  polished = polished.replace(/\bentertainment rather than a serious pursuit\b/gi, 'recreational');
  polished = polished.replace(/\bentertainment rather than serious pursuit\b/gi, 'recreational');
  polished = polished.replace(/\bas entertainment rather than\b/gi, 'as recreational rather than');
  polished = polished.replace(/\bis treated as recreational\b/gi, 'is recreational');

  // Tighten common weak phrasings
  polished = polished.replace(/\bin the next two weeks\b/gi, 'within the next two weeks');
  polished = polished.replace(/\bin the next few weeks\b/gi, 'within the next few weeks');
  polished = polished.replace(/\bin the coming weeks\b/gi, 'in coming weeks');
  polished = polished.replace(/\bin order to\b/gi, 'to');
  polished = polished.replace(/\bfor the purpose of\b/gi, 'to');
  polished = polished.replace(/\bwith regard to\b/gi, 'regarding');
  polished = polished.replace(/\bwith respect to\b/gi, 'regarding');

  // Remove unnecessary filler words (preserve sentence structure)
  polished = polished.replace(/\bthat is\b/gi, '');
  polished = polished.replace(/\bwhich is\b/gi, '');
  polished = polished.replace(/\bthat are\b/gi, '');
  polished = polished.replace(/\bwhich are\b/gi, '');
  
  // Clean up multiple spaces created by removals
  polished = polished.replace(/\s+/g, ' ');
  polished = polished.replace(/\s+\./g, '.');
  polished = polished.replace(/\s+,/g, ',');
  polished = polished.replace(/\s+:/g, ':');
  polished = polished.replace(/\s+;/g, ';');

  return polished.trim();
}

// ================== OPTIONAL CLOSING ASIDE HELPER ==================
// Moneypenny-style closing aside: warmth over authority, charm over command, implication over declaration.
// Never adds advice, meaning, or direction. Only adds subtle, observant warmth.
function _addOptionalClosingAside(surfaceA, derivedSignals, decidedItems) {
  // Only add an aside if there's substantive content
  const hasContent = surfaceA && (
    (surfaceA.orientation && surfaceA.orientation.trim()) ||
    (surfaceA.context && surfaceA.context.trim()) ||
    (surfaceA.framing && surfaceA.framing.trim())
  );
  
  if (!hasContent) {
    return '';
  }
  
  // Light, observant asides that imply without declaring
  const asides = [
    'One imagines the day will unfold accordingly.',
    'The pieces seem to be in place.',
    'All rather straightforward, one hopes.',
    'Nothing particularly alarming, which is always welcome.',
    'A manageable set of priorities, it would seem.'
  ];
  
  // Select based on content density (simple deterministic choice)
  const contentCount = [
    surfaceA.orientation && surfaceA.orientation.trim() ? 1 : 0,
    surfaceA.context && surfaceA.context.trim() ? 1 : 0,
    surfaceA.framing && surfaceA.framing.trim() ? 1 : 0
  ].reduce((a, b) => a + b, 0);
  
  const asideIndex = contentCount % asides.length;
  return '\n' + asides[asideIndex];
}

// ================== COMPOSE BRIEF ==================
// Moneypenny-style editorial rewrite allowed. No semantic transformation.
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
    // Orientation section: operational focus statements (Moneypenny-polished)
    if (surfaceA.orientation && surfaceA.orientation.trim()) {
      lines.push('Operational orientation.');
      lines.push('');
      // Polish each bullet line separately
      const orientationLines = surfaceA.orientation.split('\n');
      const polishedOrientation = orientationLines
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => _polishSentence(line))
        .join('\n');
      lines.push(polishedOrientation);
      lines.push('');
    }

    // Attention field: Moneypenny-polished if present
    if (surfaceA.attention && surfaceA.attention.trim()) {
      lines.push(_polishSentence(surfaceA.attention));
      lines.push('');
    }

    // Context section: situational conditions (Moneypenny-polished)
    if (surfaceA.context && surfaceA.context.trim()) {
      lines.push('Situational context.');
      lines.push('');
      lines.push(_polishSentence(surfaceA.context));
      lines.push('');
    }

    // Framing field: Moneypenny-polished if present
    if (surfaceA.framing && surfaceA.framing.trim()) {
      lines.push(_polishSentence(surfaceA.framing));
      lines.push('');
    }

    // Reflection section: observational reflections (Moneypenny-polished)
    if (surfaceA.reflection && surfaceA.reflection.trim()) {
      lines.push('Observations.');
      lines.push('');
      // Polish each reflection line separately
      const reflectionLines = surfaceA.reflection.split('\n');
      const polishedReflection = reflectionLines
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => _polishSentence(line))
        .join('\n');
      lines.push(polishedReflection);
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

  // Optional closing aside (Moneypenny-style warmth)
  const closingAside = _addOptionalClosingAside(surfaceA, derivedSignals, decidedItems);
  if (closingAside) {
    lines.push(closingAside);
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
