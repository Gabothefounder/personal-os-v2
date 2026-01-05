// TEMP EXECUTION GUARD — REMOVE AFTER VALIDATION
const DECIDED_GUARD = true;

// DECIDED — Human Commitment Ledger (Authoritative, Manual)

/************************************************************
 * DECIDED Ledger Management
 *
 * Purpose:
 * - Maintain authoritative human commitments
 * - Enforce explicit state transitions
 * - No automation, no inference, no psychology
 *
 * Rules:
 * - NO Gemini
 * - NO auto-confirmation
 * - NO inference
 * - NO psychology
 * - NO escalation
 ************************************************************/

// ================== TAB NAME ==================
const DECIDED_TAB_DECIDED = 'DECIDED';

// ================== CONSTANTS ==================
const TYPE_PRINCIPLE = 'Principle';
const TYPE_OBJECTIVE = 'Objective';
const TYPE_PROJECT = 'Project';
const TYPE_CONSTRAINT = 'Constraint';
const TYPE_DECISION = 'Decision';

const STATUS_PROPOSED = 'proposed';
const STATUS_CONFIRMED = 'confirmed';
const STATUS_DEFERRED = 'deferred';
const STATUS_REJECTED = 'rejected';
const STATUS_ARCHIVED = 'archived';
const STATUS_SUPERSEDED = 'superseded';

const REVERSIBILITY_REVERSIBLE = 'reversible';
const REVERSIBILITY_IRREVERSIBLE = 'irreversible';

const USAGE_PRIVATE_ONLY = 'private_only';
const USAGE_CAN_BE_SPOKEN = 'can_be_spoken';

// ================== INITIALIZATION ==================
function initializeDecidedLedger() {
  if (DECIDED_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  const sheet = getOrCreateSheet(DECIDED_TAB_DECIDED);
  
  // Check if already initialized
  const data = sheet.getDataRange().getValues();
  if (data.length > 0 && data[0][0] === 'decided_id') {
    Logger.log('DECIDED ledger already initialized');
    return;
  }

  // Write header
  const header = [
    'decided_id',
    'type',
    'status',
    'title',
    'body',
    'reversibility',
    'allowed_surface_usage',
    'created_at',
    'confirmed_at'
  ];

  sheet.clearContents();
  sheet.getRange(1, 1, 1, header.length).setValues([header]);
  
  Logger.log('DECIDED ledger initialized');
}

// ================== ADD PROPOSED ITEM ==================
function proposeDecidedItem(type, title, body, reversibility, allowedSurfaceUsage) {
  if (DECIDED_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  // Validate type
  const validTypes = [TYPE_PRINCIPLE, TYPE_OBJECTIVE, TYPE_PROJECT, TYPE_CONSTRAINT, TYPE_DECISION];
  if (!validTypes.includes(type)) {
    throw new Error('Invalid type: ' + type);
  }

  // Validate reversibility
  if (reversibility !== REVERSIBILITY_REVERSIBLE && reversibility !== REVERSIBILITY_IRREVERSIBLE) {
    throw new Error('Invalid reversibility: ' + reversibility);
  }

  // Validate allowed_surface_usage
  if (allowedSurfaceUsage !== USAGE_PRIVATE_ONLY && allowedSurfaceUsage !== USAGE_CAN_BE_SPOKEN) {
    throw new Error('Invalid allowed_surface_usage: ' + allowedSurfaceUsage);
  }

  // Validate required fields
  if (!title || !title.trim()) {
    throw new Error('Title is required');
  }

  if (!body || !body.trim()) {
    throw new Error('Body is required');
  }

  const sheet = getOrCreateSheet(DECIDED_TAB_DECIDED);
  initializeDecidedLedger();

  // Generate ID
  const decidedId = generateDecidedId();

  const now = new Date();

  // Append row
  const row = [
    decidedId,
    type,
    STATUS_PROPOSED,
    title.trim(),
    body.trim(),
    reversibility,
    allowedSurfaceUsage,
    now,
    '' // confirmed_at empty for proposed
  ];

  sheet.appendRow(row);
  
  Logger.log('Proposed DECIDED item: ' + decidedId);
  return decidedId;
}

// ================== STATE TRANSITIONS ==================
function confirmDecidedItem(decidedId) {
  if (DECIDED_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  return transitionDecidedItem(decidedId, STATUS_PROPOSED, STATUS_CONFIRMED);
}

function deferDecidedItem(decidedId) {
  if (DECIDED_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  return transitionDecidedItem(decidedId, STATUS_PROPOSED, STATUS_DEFERRED);
}

function rejectDecidedItem(decidedId) {
  if (DECIDED_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  return transitionDecidedItem(decidedId, STATUS_PROPOSED, STATUS_REJECTED);
}

function archiveDecidedItem(decidedId) {
  if (DECIDED_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  return transitionDecidedItem(decidedId, STATUS_CONFIRMED, STATUS_ARCHIVED);
}

function supersedeDecidedItem(decidedId) {
  if (DECIDED_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  return transitionDecidedItem(decidedId, STATUS_CONFIRMED, STATUS_SUPERSEDED);
}

function transitionDecidedItem(decidedId, fromStatus, toStatus) {
  const sheet = getOrCreateSheet(DECIDED_TAB_DECIDED);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    throw new Error('No DECIDED items found');
  }

  // Find header indices
  const headerRow = data[0];
  const idIdx = headerRow.indexOf('decided_id');
  const statusIdx = headerRow.indexOf('status');
  const confirmedAtIdx = headerRow.indexOf('confirmed_at');

  if (idIdx === -1 || statusIdx === -1) {
    throw new Error('Invalid DECIDED sheet structure');
  }

  // Find the item
  let rowIdx = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx] === decidedId) {
      rowIdx = i + 1; // +1 because sheet rows are 1-indexed
      break;
    }
  }

  if (rowIdx === -1) {
    throw new Error('DECIDED item not found: ' + decidedId);
  }

  // Check current status
  const currentStatus = data[rowIdx - 1][statusIdx];
  if (currentStatus !== fromStatus) {
    throw new Error('Invalid state transition: current status is ' + currentStatus + ', expected ' + fromStatus);
  }

  // Update status
  sheet.getRange(rowIdx, statusIdx + 1).setValue(toStatus);

  // If confirming, set confirmed_at
  if (toStatus === STATUS_CONFIRMED && confirmedAtIdx >= 0) {
    sheet.getRange(rowIdx, confirmedAtIdx + 1).setValue(new Date());
  }

  Logger.log('Transitioned DECIDED item ' + decidedId + ' from ' + fromStatus + ' to ' + toStatus);
  return true;
}

// ================== QUERY FUNCTIONS ==================
function getDecidedItems(status, type) {
  const sheet = getOrCreateSheet(DECIDED_TAB_DECIDED);
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
  const reversibilityIdx = headerRow.indexOf('reversibility');
  const usageIdx = headerRow.indexOf('allowed_surface_usage');
  const createdIdx = headerRow.indexOf('created_at');
  const confirmedIdx = headerRow.indexOf('confirmed_at');

  const items = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const itemStatus = row[statusIdx];
    const itemType = row[typeIdx];

    // Filter by status if provided
    if (status && itemStatus !== status) {
      continue;
    }

    // Filter by type if provided
    if (type && itemType !== type) {
      continue;
    }

    items.push({
      decided_id: row[idIdx],
      type: itemType,
      status: itemStatus,
      title: row[titleIdx],
      body: row[bodyIdx],
      reversibility: row[reversibilityIdx],
      allowed_surface_usage: row[usageIdx],
      created_at: row[createdIdx],
      confirmed_at: row[confirmedIdx] || null
    });
  }

  return items;
}

function getConfirmedDecidedItems(type) {
  return getDecidedItems(STATUS_CONFIRMED, type);
}

function getProposedDecidedItems() {
  return getDecidedItems(STATUS_PROPOSED, null);
}

// ================== HELPERS ==================
function generateDecidedId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return 'DEC-' + timestamp + '-' + random;
}

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  return sheet;
}
