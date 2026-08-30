/************************************************************
 * Lucid Router V1 — Batch JSON → Sheet Routing
 *
 * Purpose:
 * - Accept pasted Lucid Batch Triage JSON from LUCID_INPUT!A2
 * - Validate and route items to LUCID_DECISION_LOG or TRIAGE_QUEUE
 * - Append-only, no overwrites, no external APIs
 *
 * Rules:
 * - Only destination_system = "DecisionLog" writes to LUCID_DECISION_LOG
 * - Everything else goes to TRIAGE_QUEUE
 * - Dismiss items log to TRIAGE_QUEUE with status DISMISS (no task created)
 * - No Calendar, no Master Context, no SalesOS, no agents
 *
 * Performance:
 * - SpreadsheetApp.getActive() called once, cached
 * - Sheet handles fetched once, cached
 * - ID sequence counters tracked in memory (no per-item sheet reads)
 * - Target: < 5 seconds for a 1-item batch
 ************************************************************/

// ================== TAB NAMES ==================
const LUCID_TAB_INPUT = 'LUCID_INPUT';
const LUCID_TAB_DECISION_LOG = 'LUCID_DECISION_LOG';
const LUCID_TAB_TRIAGE_QUEUE = 'TRIAGE_QUEUE';

// ================== COLUMN SCHEMAS ==================
const LUCID_DECISION_LOG_HEADERS = [
  'decision_id',
  'created_at',
  'area',
  'decision_question',
  'trigger',
  'classification',
  'hidden_driver',
  'values_at_stake',
  'known_facts',
  'unknowns',
  'options_max_3',
  'recommendation',
  'next_clean_action',
  'urgency',
  'importance',
  'priority_quadrant',
  'energy_required',
  'market_facing',
  'owner',
  'due_date',
  'review_date',
  'status',
  'final_decision',
  'outcome_notes',
  'source_link'
];

const TRIAGE_QUEUE_HEADERS = [
  'triage_id',
  'created_at',
  'batch_id',
  'item_id',
  'raw_item',
  'clean_summary',
  'classification',
  'hidden_driver',
  'destination_system',
  'destination_tab',
  'priority',
  'status',
  'owner',
  'next_action',
  'due_date',
  'review_date',
  'needs_clarification',
  'clarification_question',
  'context'
];

// ================== MAIN ENTRY POINT ==================

function processLucidJson() {
  Logger.log('processLucidJson: start');

  // Single spreadsheet handle for the entire run — no getUi() calls
  const ss = SpreadsheetApp.getActive();

  try {
    // 1. Ensure all required tabs exist (creates only if missing)
    const inputSheet = _ensureLucidInputSheet(ss);
    const decisionSheet = _ensureLucidDecisionLogSheet(ss);
    const triageSheet = _ensureTriageQueueSheet(ss);
    Logger.log('processLucidJson: tabs ensured');

    // 2. Read JSON from LUCID_INPUT!A2
    const rawJson = inputSheet.getRange('A2').getValue();
    Logger.log('processLucidJson: input read');

    if (!rawJson || String(rawJson).trim() === '') {
      ss.toast('Paste Lucid JSON into LUCID_INPUT!A2 first.', 'Lucid OS', 8);
      return;
    }

    // 3. Parse JSON safely
    let payload;
    try {
      payload = JSON.parse(String(rawJson).trim());
    } catch (parseErr) {
      const errMsg = 'Invalid JSON: ' + parseErr.message;
      inputSheet.getRange('A4').setValue(errMsg);
      ss.toast('Invalid JSON. See LUCID_INPUT!A4.', 'Lucid OS', 8);
      Logger.log('processLucidJson: ' + errMsg);
      return;
    }
    Logger.log('processLucidJson: JSON parsed');

    // 4. Validate required top-level fields
    const missing = [];
    if (!payload.mode) missing.push('mode');
    if (!payload.batch_id) missing.push('batch_id');
    if (!payload.created_at) missing.push('created_at');
    if (!Array.isArray(payload.items)) missing.push('items[]');

    if (missing.length > 0) {
      const errMsg = 'Missing required fields: ' + missing.join(', ');
      inputSheet.getRange('A4').setValue(errMsg);
      ss.toast('Invalid payload. See LUCID_INPUT!A4.', 'Lucid OS', 8);
      Logger.log('processLucidJson: ' + errMsg);
      return;
    }

    if (payload.items.length === 0) {
      ss.toast('Items array is empty. Nothing to process.', 'Lucid OS', 8);
      return;
    }

    Logger.log('processLucidJson: items count = ' + payload.items.length);

    // 5. Pre-compute ID sequence counters once (avoids per-item sheet reads)
    const today = _lucidDateString(new Date());
    let decSeq = _countTodayRows(decisionSheet, today, 'DEC-');
    let triSeq = _countTodayRows(triageSheet, today, 'TRI-');

    // 6. Route each item
    const counters = { decisions: 0, triage: 0, dismissed: 0, errors: 0 };
    const errorMessages = [];

    for (let i = 0; i < payload.items.length; i++) {
      try {
        const item = payload.items[i];
        const dest = String(item.destination_system || '').trim();

        switch (dest) {
          case 'DecisionLog':
            decSeq++;
            _appendDecisionRow(decisionSheet, item, today, decSeq);
            counters.decisions++;
            Logger.log('processLucidJson: item ' + i + ' → LUCID_DECISION_LOG (DEC-' + today + '-' + String(decSeq).padStart(3, '0') + ')');
            break;

          case 'Dismiss':
            triSeq++;
            _appendTriageRow(triageSheet, item, payload.batch_id, today, triSeq, 'DISMISS');
            counters.dismissed++;
            Logger.log('processLucidJson: item ' + i + ' → TRIAGE_QUEUE (DISMISS)');
            break;

          case 'NeedsClarification':
            triSeq++;
            _appendTriageRow(triageSheet, item, payload.batch_id, today, triSeq, 'NEEDS_CLARIFICATION');
            counters.triage++;
            Logger.log('processLucidJson: item ' + i + ' → TRIAGE_QUEUE (NEEDS_CLARIFICATION)');
            break;

          default:
            triSeq++;
            _appendTriageRow(triageSheet, item, payload.batch_id, today, triSeq, 'PENDING');
            counters.triage++;
            Logger.log('processLucidJson: item ' + i + ' → TRIAGE_QUEUE (PENDING, dest="' + dest + '")');
            break;
        }
      } catch (routeErr) {
        counters.errors++;
        errorMessages.push('Item ' + i + ': ' + routeErr.message);
        Logger.log('processLucidJson: item ' + i + ' ERROR: ' + routeErr.message);
      }
    }

    Logger.log('processLucidJson: rows appended');

    // 7. Clear input cell and any previous error on success
    inputSheet.getRange('A2').setValue('');
    inputSheet.getRange('A4').setValue('');
    Logger.log('processLucidJson: input cleared');

    // 8. Show summary via toast (non-blocking)
    const summary = 'D:' + counters.decisions + ' T:' + counters.triage + ' X:' + counters.dismissed + ' E:' + counters.errors;
    ss.toast('Batch ' + payload.batch_id + ' done. ' + summary, 'Lucid OS', 8);
    Logger.log('processLucidJson: done — ' + summary);

  } catch (err) {
    Logger.log('processLucidJson error: ' + err.message + '\n' + err.stack);
    try {
      const inputSheet = ss.getSheetByName(LUCID_TAB_INPUT);
      if (inputSheet) inputSheet.getRange('A4').setValue('Error: ' + err.message);
    } catch (_) { /* best-effort */ }
    ss.toast('Processing failed. See LUCID_INPUT!A4.', 'Lucid OS', 8);
    throw err;
  }
}

// ================== DECISION LOG APPEND ==================

function _appendDecisionRow(sheet, item, today, seq) {
  const decisionId = 'DEC-' + today + '-' + String(seq).padStart(3, '0');
  const pri = _str(item.priority);

  sheet.appendRow([
    decisionId,
    item.created_at || new Date(),
    _str(item.area) || 'Lucid',
    _str(item.decision_question) || _str(item.clean_summary) || _str(item.raw_item),
    _str(item.trigger) || _str(item.raw_item),
    _str(item.classification),
    _str(item.hidden_driver) || 'None',
    _str(item.values_at_stake),
    _str(item.known_facts) || _str(item.context),
    _str(item.unknowns),
    _str(item.options_max_3) || _str(item.options),
    _str(item.recommendation),
    _str(item.next_clean_action) || _str(item.next_action),
    _str(item.urgency) || _inferUrgencyFromPriority(pri),
    _str(item.importance) || _inferUrgencyFromPriority(pri),
    _str(item.priority_quadrant) || _inferQuadrantFromPriority(pri),
    _str(item.energy_required) || 'Medium',
    _str(item.market_facing) || 'No',
    _str(item.owner) || 'Gabriel',
    _str(item.due_date),
    _str(item.review_date),
    _normalizeDecisionStatus(_str(item.status)),
    _str(item.final_decision),
    _str(item.outcome_notes),
    _str(item.source_link)
  ]);
}

// ================== DECISION FIELD HELPERS ==================

function _normalizeDecisionStatus(raw) {
  switch ((raw || '').toUpperCase().trim()) {
    case 'OPEN':          return 'Open';
    case 'TESTING':
    case 'RESEARCH':      return 'Testing';
    case 'WAITING':
    case 'REMIND':
    case 'OBSERVE':       return 'Waiting';
    case 'DECIDED':       return 'Decided';
    case 'PARKED':        return 'Parked';
    case 'CLOSED':        return 'Closed';
    case 'DISMISS':
    case 'DISMISSED':     return 'Dismissed';
    default:              return 'Open';
  }
}

function _inferUrgencyFromPriority(pri) {
  switch ((pri || '').toLowerCase().trim()) {
    case 'high':   return 'High';
    case 'medium': return 'Medium';
    case 'low':    return 'Low';
    default:       return 'Medium';
  }
}

function _inferQuadrantFromPriority(pri) {
  switch ((pri || '').toLowerCase().trim()) {
    case 'high':   return 'Do Now';
    case 'medium': return 'Schedule';
    case 'low':    return 'Observe';
    default:       return 'Observe';
  }
}

// ================== TRIAGE QUEUE APPEND ==================

function _appendTriageRow(sheet, item, batchId, today, seq, status) {
  const triageId = 'TRI-' + today + '-' + String(seq).padStart(3, '0');

  let rawItem = '';
  try {
    rawItem = JSON.stringify(item);
  } catch (_) {
    rawItem = String(item);
  }

  sheet.appendRow([
    triageId,
    item.created_at || new Date(),
    batchId,
    _str(item.item_id || item.id),
    rawItem,
    _str(item.clean_summary || item.decision_question || item.title),
    _str(item.classification),
    _str(item.hidden_driver),
    _str(item.destination_system),
    _str(item.destination_tab),
    _str(item.priority || item.urgency),
    status,
    _str(item.owner),
    _str(item.next_clean_action || item.next_action),
    _str(item.due_date),
    _str(item.review_date),
    item.destination_system === 'NeedsClarification' ? 'TRUE' : 'FALSE',
    _str(item.clarification_question),
    _str(item.context)
  ]);
}

// ================== ID SEQUENCE COUNTER ==================
// Called once before the loop, not per item.

function _countTodayRows(sheet, today, prefix) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return 0;

  const target = prefix + today + '-';
  let count = 0;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0] || '').startsWith(target)) {
      count++;
    }
  }
  return count;
}

// ================== SHEET INITIALIZATION ==================
// Each _ensure function returns the sheet handle.
// Tab + headers are only created when the tab is missing.

function _ensureLucidInputSheet(ss) {
  let sheet = ss.getSheetByName(LUCID_TAB_INPUT);
  if (!sheet) {
    sheet = ss.insertSheet(LUCID_TAB_INPUT);
    sheet.getRange('A1').setValue('Paste Lucid Batch JSON into A2 below, then run Personal OS → Process Lucid JSON');
    sheet.getRange('A1').setFontWeight('bold');
    Logger.log('processLucidJson: created tab ' + LUCID_TAB_INPUT);
  }
  return sheet;
}

function _ensureLucidDecisionLogSheet(ss) {
  let sheet = ss.getSheetByName(LUCID_TAB_DECISION_LOG);
  if (!sheet) {
    sheet = ss.insertSheet(LUCID_TAB_DECISION_LOG);
    sheet.getRange(1, 1, 1, LUCID_DECISION_LOG_HEADERS.length)
      .setValues([LUCID_DECISION_LOG_HEADERS]);
    Logger.log('processLucidJson: created tab ' + LUCID_TAB_DECISION_LOG);
  }
  return sheet;
}

function _ensureTriageQueueSheet(ss) {
  let sheet = ss.getSheetByName(LUCID_TAB_TRIAGE_QUEUE);
  if (!sheet) {
    sheet = ss.insertSheet(LUCID_TAB_TRIAGE_QUEUE);
    sheet.getRange(1, 1, 1, TRIAGE_QUEUE_HEADERS.length)
      .setValues([TRIAGE_QUEUE_HEADERS]);
    Logger.log('processLucidJson: created tab ' + LUCID_TAB_TRIAGE_QUEUE);
  }
  return sheet;
}

// ================== HELPERS ==================

function _lucidDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

function _str(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    try { return JSON.stringify(value); } catch (_) { return String(value); }
  }
  return String(value);
}
