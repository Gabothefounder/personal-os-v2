// Surface B — Weekly Read Model

/************************************************************
 * Surface B — Weekly Intelligence Brief v1.0
 *
 * Purpose:
 * - Integrate persisted signals and confirmed commitments
 * - Describe system state and visible future space
 * - Must NOT decide, advise, instruct, motivate, or plan
 *
 * Input Boundaries (HARD):
 * - May read ONLY: DERIVED_SIGNALS (eligible), DECIDED (confirmed, speakable)
 * - Must NOT read: RAW, EXECUTION, PEOPLE/CONTEXT MEMORY, DECIDE MODE state
 *
 * Language Constraints (NON-NEGOTIABLE):
 * - No advice, planning verbs, psychological framing, motivational tone
 * - No urgency, "should" language, or interpretation of internal state
 *
 * Section Canon (Locked Order):
 * I. Week in Review
 * II. Sustained Signals (DERIVED)
 * III. Signals That Did Not Hold
 * IV. Tensions in View
 * V. System State
 * VI. Visible Paths (Not Decisions)
 * VII. Commitments in Context
 * VIII. Closing Note
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
  const eligibleSignals = derivedSignals && derivedSignals.length > 0 
    ? _selectEligibleSignals(derivedSignals) 
    : [];
  const decidedItems = _readConfirmedSpeakable();

  // Silence is acceptable output - always compose brief even if empty
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

  // I. Week in Review
  lines.push('I. Week in Review');
  lines.push('');
  if (eligibleSignals.length > 0 || decidedItems.length > 0) {
    const signalCount = eligibleSignals.length;
    const commitmentCount = decidedItems.length;
    lines.push('DERIVED identified ' + signalCount + ' sustained signal' + (signalCount !== 1 ? 's' : '') + '. DECIDED contains ' + commitmentCount + ' confirmed commitment' + (commitmentCount !== 1 ? 's' : '') + '.');
  } else {
    lines.push('No sustained signals or confirmed commitments recorded.');
  }
  lines.push('');
  lines.push('');

  // II. Sustained Signals (DERIVED)
  lines.push('II. Sustained Signals (DERIVED)');
  lines.push('');
  if (eligibleSignals.length > 0) {
    for (const signal of eligibleSignals) {
      const windowDays = _extractWindowDays(signal.window);
      const ratio = signal.possible > 0 ? (signal.count / signal.possible * 100).toFixed(0) : 0;
      lines.push('DERIVED detected sustained recurrence: ' + signal.pattern_key + '.');
      lines.push('Occurred ' + signal.count + ' of ' + signal.possible + ' possible times (' + ratio + '%) over ' + windowDays + ' days.');
      if (signal.field) {
        lines.push('Field: ' + signal.field + '.');
      }
      lines.push('');
    }
  } else {
    lines.push('DERIVED detected no sustained signals meeting eligibility threshold.');
    lines.push('');
  }
  lines.push('');

  // III. Signals That Did Not Hold
  lines.push('III. Signals That Did Not Hold');
  lines.push('');
  lines.push('Absence is data. No signals failed to persist this week.');
  lines.push('');
  lines.push('');

  // IV. Tensions in View
  lines.push('IV. Tensions in View');
  lines.push('');
  lines.push('No concurrent forces identified.');
  lines.push('');
  lines.push('');

  // V. System State
  lines.push('V. System State');
  lines.push('');
  const stateParts = [];
  if (eligibleSignals.length > 0) {
    stateParts.push(eligibleSignals.length + ' sustained signal' + (eligibleSignals.length !== 1 ? 's' : '') + ' from DERIVED');
  }
  if (decidedItems.length > 0) {
    stateParts.push(decidedItems.length + ' confirmed commitment' + (decidedItems.length !== 1 ? 's' : '') + ' in DECIDED');
  }
  if (stateParts.length > 0) {
    lines.push('Configuration snapshot: ' + stateParts.join('. ') + '.');
  } else {
    lines.push('Configuration snapshot: no sustained signals or confirmed commitments.');
  }
  lines.push('');
  lines.push('');

  // VI. Visible Paths (Not Decisions)
  lines.push('VI. Visible Paths (Not Decisions)');
  lines.push('');
  if (eligibleSignals.length > 0) {
    const maxPaths = Math.min(3, eligibleSignals.length);
    for (let i = 0; i < maxPaths; i++) {
      const signal = eligibleSignals[i];
      lines.push('If ' + signal.pattern_key + ' continues at current rate, activity in ' + signal.field + ' may remain observable.');
    }
    lines.push('');
    lines.push('These are observations, not recommendations.');
  } else {
    lines.push('No visible paths identified.');
  }
  lines.push('');
  lines.push('');

  // VII. Commitments in Context
  lines.push('VII. Commitments in Context');
  lines.push('');
  if (decidedItems.length > 0) {
    for (const item of decidedItems) {
      if (item.title) {
        lines.push(item.title + '.');
      }
      if (item.description) {
        lines.push(item.description + '.');
      }
    }
  } else {
    lines.push('No confirmed commitments in DECIDED.');
  }
  lines.push('');
  lines.push('');

  // VIII. Closing Note
  lines.push('VIII. Closing Note');
  lines.push('');
  lines.push('The week\'s patterns are documented. System state is observable.');
  lines.push('');

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
