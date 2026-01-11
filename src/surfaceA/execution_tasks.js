// Execution — Action Without Meaning

/************************************************************
 * Execution Layer v2.0
 *
 * Purpose:
 * - Support doing without defining meaning
 * - Remain volatile, reversible, and semantically neutral
 *
 * Core Objects:
 * - Inbox Item (capture destination)
 * - Task (volatile action items)
 * - Project reference (read-only from DECIDED)
 *
 * Rules:
 * - Tasks are volatile
 * - Failure is neutral
 * - No feedback upward
 * - Do NOT create DECIDED items
 * - Do NOT judge progress
 * - Do NOT escalate failures
 * - No triggers
 * - No calls to Surface A, DERIVED, or DECIDED
 * - No scheduling logic
 * - No Gemini
 * - No auto-prioritization, reminders, escalation, or metrics
 ************************************************************/

// ================== TAB NAMES ==================
const EXECUTION_TAB_INBOX = 'EXECUTION_INBOX';
const EXECUTION_TAB_TASKS = 'EXECUTION_TASKS';

// ================== STATUS VALUES ==================
const STATUS_OPEN = 'open';
const STATUS_DONE = 'done';
const STATUS_DELETED = 'deleted';
const STATUS_CANCELED = 'canceled'; // Legacy support

// ================== INITIALIZATION ==================
function _initInboxSheet() {
  const sheet = _getOrCreateSheet(EXECUTION_TAB_INBOX);
  
  const data = sheet.getDataRange().getValues();
  if (data.length > 0) {
    return; // Sheet has data, do not write headers
  }

  // Inbox Item schema v1.0
  const header = [
    'inbox_id',
    'created_at',
    'content',
    'capture_mode',
    'source',
    'notes'
  ];

  sheet.getRange(1, 1, 1, header.length).setValues([header]);
}

function _initExecutionSheet() {
  const sheet = _getOrCreateSheet(EXECUTION_TAB_TASKS);
  
  const data = sheet.getDataRange().getValues();
  if (data.length > 0) {
    // Sheet has data - validate schema compatibility
    _validateTaskSchema(sheet);
    return;
  }

  // Task schema v1.0
  const header = [
    'task_id',
    'created_at',
    'content',
    'state',
    'project_id',
    'origin',
    'inbox_id',
    'capture_mode',
    'completed_at',
    'completion_note',
    'write_to_raw',
    // Legacy fields for backward compatibility
    'title',
    'notes',
    'status',
    'due_date',
    'decided_id'
  ];

  sheet.getRange(1, 1, 1, header.length).setValues([header]);
}

function _validateTaskSchema(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length === 0) {
    return;
  }

  const headerRow = data[0];
  const requiredFields = ['task_id', 'created_at', 'content', 'state'];
  
  for (let i = 0; i < requiredFields.length; i++) {
    if (headerRow.indexOf(requiredFields[i]) === -1) {
      throw new Error('Invalid EXECUTION_TASKS schema: missing required field ' + requiredFields[i]);
    }
  }
}

// Public entry point for initialization
function initExecutionSheet() {
  _initInboxSheet();
  _initExecutionSheet();
}

// ================== INBOX OPERATIONS ==================
function createInboxItem(content) {
  if (!content || typeof content !== 'string' || !content.trim()) {
    throw new Error('Content is required');
  }
  
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(EXECUTION_TAB_INBOX);
  
  if (!sheet) {
    sheet = ss.insertSheet(EXECUTION_TAB_INBOX);
  }
  
  _initInboxSheet();
  
  const inboxId = Utilities.getUuid();
  const now = new Date();
  
  const row = [
    inboxId,
    now,
    content.trim(),
    'text',
    'mobile_capture',
    ''
  ];
  
  sheet.appendRow(row);
  return inboxId;
}

function promoteInboxToTask(inbox_id, options) {
  Logger.log('promoteInboxToTask entry: inbox_id=' + inbox_id);
  options = options || {};
  
  const sheet = _getOrCreateSheet(EXECUTION_TAB_INBOX);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    Logger.log('Promotion aborted because: No inbox items found');
    throw new Error('No inbox items found');
  }

  const headerRow = data[0];
  const idIdx = headerRow.indexOf('inbox_id');
  const contentIdx = headerRow.indexOf('content');
  const captureModeIdx = headerRow.indexOf('capture_mode');

  if (idIdx === -1 || contentIdx === -1) {
    Logger.log('Promotion aborted because: Invalid EXECUTION_INBOX sheet structure (missing required headers)');
    throw new Error('Invalid EXECUTION_INBOX sheet structure');
  }

  // Find the inbox item
  let inboxItem = null;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx] || '').trim() === String(inbox_id).trim()) {
      inboxItem = {
        inbox_id: String(data[i][idIdx]).trim(),
        content: data[i][contentIdx],
        capture_mode: captureModeIdx >= 0 ? String(data[i][captureModeIdx] || '').trim() : 'text'
      };
      Logger.log('Loaded inbox row: ' + JSON.stringify(inboxItem));
      break;
    }
  }

  if (!inboxItem) {
    Logger.log('Promotion aborted because: Inbox item not found: ' + inbox_id);
    throw new Error('Inbox item not found: ' + inbox_id);
  }

  // Create task from inbox item
  const taskInput = {
    content: inboxItem.content,
    origin: 'inbox',
    inbox_id: inboxItem.inbox_id,
    capture_mode: inboxItem.capture_mode,
    project_id: options.project_id || '',
    write_to_raw: options.write_to_raw || false
  };

  const taskId = createTask(taskInput);
  Logger.log('Task created with task_id: ' + taskId);

  // Mark inbox item as processed (delete it)
  _deleteInboxItem(inbox_id);

  return taskId;
}

function markInboxDone(inbox_id, completion_note) {
  _deleteInboxItem(inbox_id);
  return true;
}

function deleteInboxItem(inbox_id) {
  _deleteInboxItem(inbox_id);
  return true;
}

function _deleteInboxItem(inbox_id) {
  const sheet = _getOrCreateSheet(EXECUTION_TAB_INBOX);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return;
  }

  const headerRow = data[0];
  const idIdx = headerRow.indexOf('inbox_id');

  if (idIdx === -1) {
    return;
  }

  // Find and delete the row
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][idIdx] || '').trim() === String(inbox_id).trim()) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

function listInboxItems() {
  const ss = SpreadsheetApp.getActive();
  const sheet = _getOrCreateSheet(EXECUTION_TAB_INBOX);
  
  Logger.log('EXECUTION_INBOX sheet found: ' + (sheet !== null));
  Logger.log('Spreadsheet ID: ' + ss.getId());
  Logger.log('Sheet name: ' + EXECUTION_TAB_INBOX);
  
  const data = sheet.getDataRange().getValues();
  
  Logger.log('Total rows (including header): ' + data.length);

  if (data.length <= 1) {
    Logger.log('Total rows (excluding header): 0');
    Logger.log('Rows after filtering: 0');
    return [];
  }

  const headerRow = data[0];
  Logger.log('Headers: ' + JSON.stringify(headerRow));
  
  const totalDataRows = data.length - 1;
  Logger.log('Total rows (excluding header): ' + totalDataRows);
  
  const idIdx = headerRow.indexOf('inbox_id');
  const createdAtIdx = headerRow.indexOf('created_at');
  const contentIdx = headerRow.indexOf('content');
  const captureModeIdx = headerRow.indexOf('capture_mode');
  const sourceIdx = headerRow.indexOf('source');
  const notesIdx = headerRow.indexOf('notes');

  if (idIdx === -1 || contentIdx === -1) {
    Logger.log('Rows after filtering: 0 (missing required headers)');
    return [];
  }

  const items = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    items.push({
      inbox_id: row[idIdx],
      created_at: createdAtIdx >= 0 ? row[createdAtIdx] : null,
      content: row[contentIdx],
      capture_mode: captureModeIdx >= 0 ? String(row[captureModeIdx] || '').trim() : 'text',
      source: sourceIdx >= 0 ? (row[sourceIdx] ? String(row[sourceIdx]).trim() : '') : '',
      notes: notesIdx >= 0 ? (row[notesIdx] ? String(row[notesIdx]).trim() : '') : ''
    });
  }

  Logger.log('Rows after filtering: ' + items.length);
  return items;
}

// ================== TASK OPERATIONS ==================
function createTask(input) {
  if (!input) {
    throw new Error('Input is required');
  }

  // Backward compatibility: support 'title' field
  const content = input.content ? String(input.content).trim() : 
                  (input.title ? String(input.title).trim() : '');
  
  if (!content) {
    throw new Error('Content (or title) is required');
  }

  const sheet = _getOrCreateSheet(EXECUTION_TAB_TASKS);
  _initExecutionSheet();

  const taskId = _generateTaskId();
  const now = new Date();
  const state = STATUS_OPEN;
  const origin = input.origin || (input.inbox_id ? 'inbox' : 'manual');

  // Build row with v1.0 schema
  const row = [
    taskId, // task_id
    now, // created_at
    content, // content
    state, // state
    input.project_id ? String(input.project_id).trim() : '', // project_id
    origin, // origin
    input.inbox_id ? String(input.inbox_id).trim() : '', // inbox_id
    input.capture_mode ? String(input.capture_mode).trim() : '', // capture_mode
    '', // completed_at
    '', // completion_note
    input.write_to_raw ? true : false, // write_to_raw
    // Legacy fields for backward compatibility
    content, // title (same as content)
    input.notes ? String(input.notes).trim() : '', // notes
    state, // status (same as state)
    input.due_date || '', // due_date (deprecated but preserved)
    input.decided_id ? String(input.decided_id).trim() : '' // decided_id (legacy, maps to project_id if Project)
  ];

  sheet.appendRow(row);
  return taskId;
}

function completeTask(task_id, completion_note) {
  const sheet = _getOrCreateSheet(EXECUTION_TAB_TASKS);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    throw new Error('No tasks found');
  }

  const headerRow = data[0];
  const idIdx = headerRow.indexOf('task_id');
  const stateIdx = headerRow.indexOf('state');
  const statusIdx = headerRow.indexOf('status'); // Legacy
  const completedAtIdx = headerRow.indexOf('completed_at');
  const completionNoteIdx = headerRow.indexOf('completion_note');

  if (idIdx === -1 || stateIdx === -1) {
    throw new Error('Invalid EXECUTION_TASKS sheet structure');
  }

  // Find the task
  let rowIdx = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx] || '').trim() === String(task_id).trim()) {
      rowIdx = i + 1;
      break;
    }
  }

  if (rowIdx === -1) {
    throw new Error('Task not found: ' + task_id);
  }

  // Update state
  sheet.getRange(rowIdx, stateIdx + 1).setValue(STATUS_DONE);

  // Update legacy status if present
  if (statusIdx >= 0) {
    sheet.getRange(rowIdx, statusIdx + 1).setValue(STATUS_DONE);
  }

  // Set completed_at
  if (completedAtIdx >= 0) {
    sheet.getRange(rowIdx, completedAtIdx + 1).setValue(new Date());
  }

  // Set completion_note if provided
  if (completionNoteIdx >= 0 && completion_note) {
    sheet.getRange(rowIdx, completionNoteIdx + 1).setValue(String(completion_note).trim());
  }

  return true;
}

function cancelTask(task_id) {
  const sheet = _getOrCreateSheet(EXECUTION_TAB_TASKS);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    throw new Error('No tasks found');
  }

  const headerRow = data[0];
  const idIdx = headerRow.indexOf('task_id');
  const stateIdx = headerRow.indexOf('state');
  const statusIdx = headerRow.indexOf('status'); // Legacy

  if (idIdx === -1 || stateIdx === -1) {
    throw new Error('Invalid EXECUTION_TASKS sheet structure');
  }

  // Find the task
  let rowIdx = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx] || '').trim() === String(task_id).trim()) {
      rowIdx = i + 1;
      break;
    }
  }

  if (rowIdx === -1) {
    throw new Error('Task not found: ' + task_id);
  }

  // Update state to deleted (v1.0) or canceled (legacy)
  sheet.getRange(rowIdx, stateIdx + 1).setValue(STATUS_DELETED);

  // Update legacy status if present
  if (statusIdx >= 0) {
    sheet.getRange(rowIdx, statusIdx + 1).setValue(STATUS_CANCELED);
  }

  return true;
}

// ================== QUERY FUNCTIONS ==================
function listOpenTasks() {
  const sheet = _getOrCreateSheet(EXECUTION_TAB_TASKS);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return [];
  }

  const headerRow = data[0];
  const idIdx = headerRow.indexOf('task_id');
  const contentIdx = headerRow.indexOf('content');
  const titleIdx = headerRow.indexOf('title'); // Legacy
  const stateIdx = headerRow.indexOf('state');
  const statusIdx = headerRow.indexOf('status'); // Legacy
  const createdIdx = headerRow.indexOf('created_at');
  const projectIdIdx = headerRow.indexOf('project_id');
  const originIdx = headerRow.indexOf('origin');
  const inboxIdIdx = headerRow.indexOf('inbox_id');
  const captureModeIdx = headerRow.indexOf('capture_mode');
  const completedIdx = headerRow.indexOf('completed_at');
  const completionNoteIdx = headerRow.indexOf('completion_note');
  const writeToRawIdx = headerRow.indexOf('write_to_raw');
  const notesIdx = headerRow.indexOf('notes');
  const decidedIdIdx = headerRow.indexOf('decided_id'); // Legacy

  if (idIdx === -1 || (stateIdx === -1 && statusIdx === -1)) {
    return [];
  }

  const tasks = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    // Check state (v1.0) or status (legacy)
    const state = stateIdx >= 0 ? String(row[stateIdx] || '').trim() : 
                  (statusIdx >= 0 ? String(row[statusIdx] || '').trim() : '');
    
    // Only return tasks where state = "open"
    if (state !== STATUS_OPEN) {
      continue;
    }

    const content = contentIdx >= 0 ? row[contentIdx] : 
                    (titleIdx >= 0 ? row[titleIdx] : '');

    tasks.push({
      task_id: row[idIdx],
      content: content,
      title: content, // Legacy compatibility
      state: state,
      status: state, // Legacy compatibility
      created_at: createdIdx >= 0 ? row[createdIdx] : null,
      project_id: projectIdIdx >= 0 ? (row[projectIdIdx] ? String(row[projectIdIdx]).trim() : '') : '',
      origin: originIdx >= 0 ? (row[originIdx] ? String(row[originIdx]).trim() : '') : '',
      inbox_id: inboxIdIdx >= 0 ? (row[inboxIdIdx] ? String(row[inboxIdIdx]).trim() : '') : '',
      capture_mode: captureModeIdx >= 0 ? (row[captureModeIdx] ? String(row[captureModeIdx]).trim() : '') : '',
      completed_at: completedIdx >= 0 ? row[completedIdx] : null,
      completion_note: completionNoteIdx >= 0 ? (row[completionNoteIdx] ? String(row[completionNoteIdx]).trim() : '') : '',
      write_to_raw: writeToRawIdx >= 0 ? (row[writeToRawIdx] === true || row[writeToRawIdx] === 'true') : false,
      notes: notesIdx >= 0 ? (row[notesIdx] ? String(row[notesIdx]).trim() : '') : '',
      decided_id: decidedIdIdx >= 0 ? (row[decidedIdIdx] ? String(row[decidedIdIdx]).trim() : '') : '' // Legacy
    });
  }

  return tasks;
}

function listTasksByDecided(decided_id) {
  // Legacy function - maps to project_id if it's a Project
  const tasks = listOpenTasks();
  const decidedIdStr = String(decided_id).trim();
  
  return tasks.filter(task => {
    // Check both decided_id (legacy) and project_id (v1.0)
    return (task.decided_id && task.decided_id === decidedIdStr) ||
           (task.project_id && task.project_id === decidedIdStr);
  });
}

function listTasksByProject(project_id) {
  const tasks = listOpenTasks();
  const projectIdStr = String(project_id).trim();
  
  return tasks.filter(task => task.project_id === projectIdStr);
}

// ================== PROJECT HELPERS ==================
function _readProjectsFromDecided() {
  // Read-only access to DECIDED Projects
  // This is a placeholder - actual implementation would read from DECIDED
  // For now, return empty array to maintain contract
  try {
    if (typeof _listConfirmedSpeakable === 'function') {
      const items = _listConfirmedSpeakable();
      // Filter for Projects only (type === 'Project')
      return items.filter(item => item.type === 'Project');
    }
  } catch (e) {
    // Silent failure - no projects available
  }
  return [];
}

// ================== TEST ENTRY POINT ==================
function runExecutionSelfTest() {
  Logger.log('--- EXECUTION SELF TEST START ---');

  _initInboxSheet();
  _initExecutionSheet();

  const taskSheet = _getOrCreateSheet(EXECUTION_TAB_TASKS);
  const data = taskSheet.getDataRange().getValues();

  if (data.length <= 1) {
    Logger.log('No tasks found. Counts: open=0, done=0, deleted=0');
  } else {
    const headerRow = data[0];
    const stateIdx = headerRow.indexOf('state');
    const statusIdx = headerRow.indexOf('status'); // Legacy

    if (stateIdx === -1 && statusIdx === -1) {
      Logger.log('Invalid sheet structure');
    } else {
      let openCount = 0;
      let doneCount = 0;
      let deletedCount = 0;

      for (let i = 1; i < data.length; i++) {
        const state = stateIdx >= 0 ? String(data[i][stateIdx] || '').trim() : 
                      (statusIdx >= 0 ? String(data[i][statusIdx] || '').trim() : '');
        
        if (state === STATUS_OPEN) {
          openCount++;
        } else if (state === STATUS_DONE) {
          doneCount++;
        } else if (state === STATUS_DELETED || state === STATUS_CANCELED) {
          deletedCount++;
        }
      }

      Logger.log('Task counts by state:');
      Logger.log('  open: ' + openCount);
      Logger.log('  done: ' + doneCount);
      Logger.log('  deleted: ' + deletedCount);
    }
  }

  const inboxSheet = _getOrCreateSheet(EXECUTION_TAB_INBOX);
  const inboxData = inboxSheet.getDataRange().getValues();
  const inboxCount = inboxData.length > 1 ? inboxData.length - 1 : 0;
  Logger.log('Inbox items: ' + inboxCount);

  Logger.log('--- EXECUTION SELF TEST END ---');
}

// ================== SCHEMA NORMALIZATION ==================
function normalizeExecutionTasksSchema() {
  const sheet = _getOrCreateSheet(EXECUTION_TAB_TASKS);
  const data = sheet.getDataRange().getValues();
  
  if (data.length === 0) {
    _initExecutionSheet();
    return;
  }
  
  const headerRow = data[0];
  const canonicalHeaders = [
    'task_id',
    'created_at',
    'content',
    'state',
    'project_id',
    'origin',
    'inbox_id',
    'capture_mode',
    'completed_at',
    'completion_note',
    'write_to_raw',
    'title',
    'notes',
    'status',
    'due_date',
    'decided_id'
  ];
  
  const headerMap = {};
  for (let i = 0; i < headerRow.length; i++) {
    const header = String(headerRow[i] || '').trim();
    if (canonicalHeaders.indexOf(header) !== -1) {
      headerMap[header] = i;
    }
  }
  
  const newHeaderRow = [];
  const columnMapping = [];
  
  for (let i = 0; i < canonicalHeaders.length; i++) {
    const canonicalHeader = canonicalHeaders[i];
    newHeaderRow.push(canonicalHeader);
    if (headerMap.hasOwnProperty(canonicalHeader)) {
      columnMapping.push(headerMap[canonicalHeader]);
    } else {
      columnMapping.push(-1);
    }
  }
  
  const numRows = data.length;
  const numCols = canonicalHeaders.length;
  
  const newData = [newHeaderRow];
  
  for (let rowIdx = 1; rowIdx < numRows; rowIdx++) {
    const oldRow = data[rowIdx];
    const newRow = [];
    for (let colIdx = 0; colIdx < numCols; colIdx++) {
      const sourceColIdx = columnMapping[colIdx];
      if (sourceColIdx >= 0 && sourceColIdx < oldRow.length) {
        newRow.push(oldRow[sourceColIdx]);
      } else {
        newRow.push('');
      }
    }
    newData.push(newRow);
  }
  
  sheet.clear();
  if (newData.length > 0) {
    sheet.getRange(1, 1, newData.length, newData[0].length).setValues(newData);
  }
}

function normalizeExecutionInboxSchema() {
  const sheet = _getOrCreateSheet(EXECUTION_TAB_INBOX);
  const data = sheet.getDataRange().getValues();
  
  if (data.length === 0) {
    _initInboxSheet();
    return;
  }
  
  const headerRow = data[0];
  const canonicalHeaders = ['inbox_id', 'created_at', 'content', 'capture_mode', 'source', 'notes'];
  
  // Map legacy headers to canonical names
  const headerMap = {};
  for (let i = 0; i < headerRow.length; i++) {
    const header = String(headerRow[i] || '').trim().toLowerCase();
    if (header === 'id') {
      headerMap['inbox_id'] = i;
    } else if (header === 'timestamp') {
      headerMap['created_at'] = i;
    } else if (header === 'text' || header === 'note') {
      headerMap['content'] = i;
    } else if (canonicalHeaders.indexOf(headerRow[i]) !== -1) {
      headerMap[headerRow[i]] = i;
    }
  }
  
  // Check which canonical headers are missing
  const missingHeaders = [];
  const newHeaderRow = [];
  const columnMapping = [];
  
  for (let i = 0; i < canonicalHeaders.length; i++) {
    const canonicalHeader = canonicalHeaders[i];
    if (headerMap.hasOwnProperty(canonicalHeader)) {
      newHeaderRow.push(canonicalHeader);
      columnMapping.push(headerMap[canonicalHeader]);
    } else {
      newHeaderRow.push(canonicalHeader);
      columnMapping.push(-1);
      missingHeaders.push(canonicalHeader);
    }
  }
  
  // If headers need normalization, rebuild the sheet
  if (missingHeaders.length > 0 || headerRow.length !== canonicalHeaders.length) {
    const numRows = data.length;
    const numCols = canonicalHeaders.length;
    
    // Build new data array
    const newData = [newHeaderRow];
    
    for (let rowIdx = 1; rowIdx < numRows; rowIdx++) {
      const oldRow = data[rowIdx];
      const newRow = [];
      for (let colIdx = 0; colIdx < numCols; colIdx++) {
        const sourceColIdx = columnMapping[colIdx];
        if (sourceColIdx >= 0 && sourceColIdx < oldRow.length) {
          newRow.push(oldRow[sourceColIdx]);
        } else {
          newRow.push('');
        }
      }
      newData.push(newRow);
    }
    
    // Clear and rewrite
    sheet.clear();
    if (newData.length > 0) {
      sheet.getRange(1, 1, newData.length, newData[0].length).setValues(newData);
    }
  }
}

// ================== HELPERS ==================
function _generateInboxId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return 'INBOX-' + timestamp + '-' + random;
}

function _generateTaskId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return 'TASK-' + timestamp + '-' + random;
}

function _getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  return sheet;
}

// ================== UI OPERATIONS ==================
function openExecutionInboxSidebar() {
  const html = HtmlService.createHtmlOutputFromFile("execution_inbox_sidebar")
    .setTitle("Execution Inbox");
  SpreadsheetApp.getUi().showSidebar(html);
}
