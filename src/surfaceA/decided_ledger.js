// TEMP EXECUTION GUARD — REMOVE AFTER VALIDATION
const DECIDED_GUARD = false;

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
 * - NO triggers
 * - NO writes outside DECIDED
 * - NO calls to DERIVED or Surface A
 ************************************************************/

// ================== TAB NAME ==================
const DECIDED_TAB_DECIDED = 'DECIDED';

// ================== CONSTANTS ==================
const STATUS_PROPOSED = 'proposed';
const STATUS_CONFIRMED = 'confirmed';
const STATUS_DEFERRED = 'deferred';
const STATUS_REJECTED = 'rejected';
const STATUS_EXPIRED = 'expired';

const SOURCE_MANUAL = 'manual';
const SOURCE_DERIVED_REFERENCE = 'derived_reference';

const USAGE_CAN_BE_SPOKEN = 'can_be_spoken';
const USAGE_SILENT = 'silent';

const REVERSIBILITY_REVERSIBLE = 'reversible';
const REVERSIBILITY_IRREVERSIBLE = 'irreversible';

// ================== INITIALIZATION ==================
function initDecidedSheet() {
  if (DECIDED_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  const sheet = getOrCreateSheet(DECIDED_TAB_DECIDED);
  
  // Check if sheet is empty
  const data = sheet.getDataRange().getValues();
  if (data.length > 0 && data[0][0] === 'decided_id') {
    Logger.log('DECIDED sheet already initialized');
    return;
  }

  // Write headers ONLY if sheet is empty
  const header = [
    'decided_id',
    'source',
    'title',
    'description',
    'status',
    'proposed_at',
    'confirmed_at',
    'deferred_until',
    'allowed_surface_usage',
    'reversibility',
    'notes'
  ];

  sheet.clearContents();
  sheet.getRange(1, 1, 1, header.length).setValues([header]);
  
  Logger.log('DECIDED sheet initialized');
}

// ================== CREATE PROPOSED ITEM ==================
function createProposedDecidedItem(input) {
  if (DECIDED_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }

  // Validate required fields
  if (!input.title || !input.title.trim()) {
    throw new Error('Title is required');
  }

  if (!input.description || !input.description.trim()) {
    throw new Error('Description is required');
  }

  const sheet = getOrCreateSheet(DECIDED_TAB_DECIDED);
  initDecidedSheet();

  // Generate ID
  const decidedId = generateDecidedId();
  const now = new Date();

  // Append row
  const row = [
    decidedId,
    input.source || SOURCE_MANUAL,
    input.title.trim(),
    input.description.trim(),
    STATUS_PROPOSED,
    now,
    '', // confirmed_at blank for proposed
    '', // deferred_until blank for proposed
    input.allowed_surface_usage || USAGE_SILENT,
    input.reversibility || REVERSIBILITY_REVERSIBLE,
    input.notes || ''
  ];

  sheet.appendRow(row);
  
  Logger.log('Created proposed DECIDED item: ' + decidedId);
  return decidedId;
}

// ================== STATE TRANSITIONS ==================
function confirmDecidedItem(decidedId) {
  if (DECIDED_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  const sheet = getOrCreateSheet(DECIDED_TAB_DECIDED);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    throw new Error('No DECIDED items found');
  }

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
      rowIdx = i + 1;
      break;
    }
  }

  if (rowIdx === -1) {
    throw new Error('DECIDED item not found: ' + decidedId);
  }

  // Check current status
  const currentStatus = data[rowIdx - 1][statusIdx];
  if (currentStatus !== STATUS_PROPOSED) {
    throw new Error('Invalid state transition: current status is ' + currentStatus + ', expected ' + STATUS_PROPOSED);
  }

  // Update status
  sheet.getRange(rowIdx, statusIdx + 1).setValue(STATUS_CONFIRMED);

  // Set confirmed_at
  if (confirmedAtIdx >= 0) {
    sheet.getRange(rowIdx, confirmedAtIdx + 1).setValue(new Date());
  }

  Logger.log('Confirmed DECIDED item: ' + decidedId);
  return true;
}

function rejectDecidedItem(decidedId) {
  if (DECIDED_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  const sheet = getOrCreateSheet(DECIDED_TAB_DECIDED);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    throw new Error('No DECIDED items found');
  }

  const headerRow = data[0];
  const idIdx = headerRow.indexOf('decided_id');
  const statusIdx = headerRow.indexOf('status');
  const notesIdx = headerRow.indexOf('notes');

  if (idIdx === -1 || statusIdx === -1) {
    throw new Error('Invalid DECIDED sheet structure');
  }

  // Find the item
  let rowIdx = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx] === decidedId) {
      rowIdx = i + 1;
      break;
    }
  }

  if (rowIdx === -1) {
    throw new Error('DECIDED item not found: ' + decidedId);
  }

  // Update status
  sheet.getRange(rowIdx, statusIdx + 1).setValue(STATUS_REJECTED);

  // Record rejection date in notes if notes column exists
  if (notesIdx >= 0) {
    const currentNotes = data[rowIdx - 1][notesIdx] || '';
    const rejectionNote = 'Rejected at ' + new Date().toISOString();
    const updatedNotes = currentNotes ? currentNotes + '; ' + rejectionNote : rejectionNote;
    sheet.getRange(rowIdx, notesIdx + 1).setValue(updatedNotes);
  }

  Logger.log('Rejected DECIDED item: ' + decidedId);
  return true;
}

function deferDecidedItem(decidedId, untilDate) {
  if (DECIDED_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  if (!untilDate || !(untilDate instanceof Date)) {
    throw new Error('until_date is required and must be a Date');
  }

  const sheet = getOrCreateSheet(DECIDED_TAB_DECIDED);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    throw new Error('No DECIDED items found');
  }

  const headerRow = data[0];
  const idIdx = headerRow.indexOf('decided_id');
  const statusIdx = headerRow.indexOf('status');
  const deferredUntilIdx = headerRow.indexOf('deferred_until');

  if (idIdx === -1 || statusIdx === -1) {
    throw new Error('Invalid DECIDED sheet structure');
  }

  // Find the item
  let rowIdx = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx] === decidedId) {
      rowIdx = i + 1;
      break;
    }
  }

  if (rowIdx === -1) {
    throw new Error('DECIDED item not found: ' + decidedId);
  }

  // Update status
  sheet.getRange(rowIdx, statusIdx + 1).setValue(STATUS_DEFERRED);

  // Set deferred_until
  if (deferredUntilIdx >= 0) {
    sheet.getRange(rowIdx, deferredUntilIdx + 1).setValue(untilDate);
  }

  Logger.log('Deferred DECIDED item: ' + decidedId + ' until ' + untilDate);
  return true;
}

// ================== QUERY FUNCTIONS ==================
function listConfirmedSpeakable() {
  if (DECIDED_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  const sheet = getOrCreateSheet(DECIDED_TAB_DECIDED);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return [];
  }

  const headerRow = data[0];
  const idIdx = headerRow.indexOf('decided_id');
  const statusIdx = headerRow.indexOf('status');
  const usageIdx = headerRow.indexOf('allowed_surface_usage');
  const sourceIdx = headerRow.indexOf('source');
  const titleIdx = headerRow.indexOf('title');
  const descIdx = headerRow.indexOf('description');
  const reversibilityIdx = headerRow.indexOf('reversibility');
  const notesIdx = headerRow.indexOf('notes');
  const proposedAtIdx = headerRow.indexOf('proposed_at');
  const confirmedAtIdx = headerRow.indexOf('confirmed_at');
  const deferredUntilIdx = headerRow.indexOf('deferred_until');

  const items = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const itemStatus = row[statusIdx];
    const itemUsage = row[usageIdx];

    // Filter: status = confirmed AND allowed_surface_usage = can_be_spoken
    if (itemStatus !== STATUS_CONFIRMED || itemUsage !== USAGE_CAN_BE_SPOKEN) {
      continue;
    }

    items.push({
      decided_id: row[idIdx],
      source: sourceIdx >= 0 ? row[sourceIdx] : '',
      title: titleIdx >= 0 ? row[titleIdx] : '',
      description: descIdx >= 0 ? row[descIdx] : '',
      status: itemStatus,
      proposed_at: proposedAtIdx >= 0 ? row[proposedAtIdx] : null,
      confirmed_at: confirmedAtIdx >= 0 ? row[confirmedAtIdx] : null,
      deferred_until: deferredUntilIdx >= 0 ? row[deferredUntilIdx] : null,
      allowed_surface_usage: itemUsage,
      reversibility: reversibilityIdx >= 0 ? row[reversibilityIdx] : '',
      notes: notesIdx >= 0 ? row[notesIdx] : ''
    });
  }

  return items;
}

// ================== LINKAGE HELPERS ==================
function linkDecidedToTask(decided_id, task_input) {
  if (DECIDED_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  
  // Verify decided_id exists and status = "confirmed"
  const sheet = getOrCreateSheet(DECIDED_TAB_DECIDED);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    throw new Error('No DECIDED items found');
  }
  
  const headerRow = data[0];
  const idIdx = headerRow.indexOf('decided_id');
  const statusIdx = headerRow.indexOf('status');
  
  if (idIdx === -1 || statusIdx === -1) {
    throw new Error('Invalid DECIDED sheet structure');
  }
  
  // Find the item
  let found = false;
  let itemStatus = null;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx] || '').trim() === String(decided_id).trim()) {
      found = true;
      itemStatus = String(data[i][statusIdx] || '').trim();
      break;
    }
  }
  
  if (!found) {
    throw new Error('DECIDED item not found: ' + decided_id);
  }
  
  if (itemStatus !== STATUS_CONFIRMED) {
    throw new Error('DECIDED item must be confirmed. Current status: ' + itemStatus);
  }
  
  // Call createTask from execution_tasks.gs
  if (typeof createTask !== 'function') {
    throw new Error('createTask function not available from execution_tasks.gs');
  }
  
  // Set task.decided_id = decided_id
  const taskInput = task_input || {};
  taskInput.decided_id = String(decided_id).trim();
  
  const task_id = createTask(taskInput);
  
  Logger.log('Linked DECIDED item ' + decided_id + ' to task ' + task_id);
  return task_id;
}

function listConfirmedWithLinkedTasks() {
  if (DECIDED_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  const sheet = getOrCreateSheet(DECIDED_TAB_DECIDED);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return [];
  }
  
  const headerRow = data[0];
  const idIdx = headerRow.indexOf('decided_id');
  const statusIdx = headerRow.indexOf('status');
  const sourceIdx = headerRow.indexOf('source');
  const titleIdx = headerRow.indexOf('title');
  const descIdx = headerRow.indexOf('description');
  const reversibilityIdx = headerRow.indexOf('reversibility');
  const notesIdx = headerRow.indexOf('notes');
  const proposedAtIdx = headerRow.indexOf('proposed_at');
  const confirmedAtIdx = headerRow.indexOf('confirmed_at');
  const deferredUntilIdx = headerRow.indexOf('deferred_until');
  const usageIdx = headerRow.indexOf('allowed_surface_usage');
  
  if (idIdx === -1 || statusIdx === -1) {
    return [];
  }
  
  // Get task counts by decided_id (read-only aggregation)
  const taskCounts = {};
  try {
    // Read all tasks and count by decided_id
    const allTasks = getAllTasksWithDecidedId();
    for (const task of allTasks) {
      if (task.decided_id) {
        const did = String(task.decided_id).trim();
        taskCounts[did] = (taskCounts[did] || 0) + 1;
      }
    }
  } catch (e) {
    Logger.log('Could not read tasks for aggregation: ' + e.message);
  }
  
  const items = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const itemStatus = String(row[statusIdx] || '').trim();
    
    // Only confirmed items
    if (itemStatus !== STATUS_CONFIRMED) {
      continue;
    }
    
    const decidedId = String(row[idIdx] || '').trim();
    const linkedTaskCount = taskCounts[decidedId] || 0;
    
    items.push({
      decided_id: decidedId,
      source: sourceIdx >= 0 ? row[sourceIdx] : '',
      title: titleIdx >= 0 ? row[titleIdx] : '',
      description: descIdx >= 0 ? row[descIdx] : '',
      status: itemStatus,
      proposed_at: proposedAtIdx >= 0 ? row[proposedAtIdx] : null,
      confirmed_at: confirmedAtIdx >= 0 ? row[confirmedAtIdx] : null,
      deferred_until: deferredUntilIdx >= 0 ? row[deferredUntilIdx] : null,
      allowed_surface_usage: usageIdx >= 0 ? row[usageIdx] : '',
      reversibility: reversibilityIdx >= 0 ? row[reversibilityIdx] : '',
      notes: notesIdx >= 0 ? row[notesIdx] : '',
      linked_task_count: linkedTaskCount
    });
  }
  
  return items;
}

// Helper to get all tasks with decided_id (read-only)
function getAllTasksWithDecidedId() {
  try {
    // Read the EXECUTION_TASKS sheet directly for aggregation
    const ss = SpreadsheetApp.getActive();
    const taskSheet = ss.getSheetByName('EXECUTION_TASKS');
    if (!taskSheet) {
      return [];
    }
    
    const taskData = taskSheet.getDataRange().getValues();
    if (taskData.length <= 1) {
      return [];
    }
    
    const taskHeaderRow = taskData[0];
    const taskIdIdx = taskHeaderRow.indexOf('task_id');
    const taskDecidedIdIdx = taskHeaderRow.indexOf('decided_id');
    
    if (taskIdIdx === -1 || taskDecidedIdIdx === -1) {
      return [];
    }
    
    const tasks = [];
    for (let i = 1; i < taskData.length; i++) {
      const taskRow = taskData[i];
      const decidedId = taskRow[taskDecidedIdIdx];
      if (decidedId) {
        tasks.push({
          task_id: taskRow[taskIdIdx],
          decided_id: String(decidedId).trim()
        });
      }
    }
    
    return tasks;
  } catch (e) {
    Logger.log('Could not read tasks: ' + e.message);
    return [];
  }
}

// ================== TEST ENTRY POINT ==================
function runDecidedSelfTest() {
  if (DECIDED_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  Logger.log('--- DECIDED SELF TEST START ---');

  initDecidedSheet();

  const sheet = getOrCreateSheet(DECIDED_TAB_DECIDED);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    Logger.log('No DECIDED items found');
    Logger.log('--- DECIDED SELF TEST END ---');
    return;
  }

  const headerRow = data[0];
  const statusIdx = headerRow.indexOf('status');

  if (statusIdx === -1) {
    Logger.log('Invalid DECIDED sheet structure');
    Logger.log('--- DECIDED SELF TEST END ---');
    return;
  }

  // Count by status
  const counts = {};
  for (let i = 1; i < data.length; i++) {
    const status = data[i][statusIdx];
    counts[status] = (counts[status] || 0) + 1;
  }

  Logger.log('DECIDED items by status:');
  for (const [status, count] of Object.entries(counts)) {
    Logger.log('  ' + status + ': ' + count);
  }

  Logger.log('--- DECIDED SELF TEST END ---');
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
