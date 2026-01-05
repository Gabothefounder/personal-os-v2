// TEMP EXECUTION GUARD — REMOVE AFTER VALIDATION
const EXECUTION_GUARD = false;

// Execution — Action Without Meaning

/************************************************************
 * Execution Task Management
 *
 * Purpose:
 * - Manage volatile tasks downstream of DECIDED
 * - Failure is neutral
 * - No feedback upward
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
 ************************************************************/

// ================== TAB NAME ==================
const EXECUTION_TAB_TASKS = 'EXECUTION_TASKS';

// ================== STATUS VALUES ==================
const STATUS_OPEN = 'open';
const STATUS_DONE = 'done';
const STATUS_CANCELED = 'canceled';

// ================== INITIALIZATION ==================
function initExecutionSheet() {
  if (EXECUTION_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  const sheet = getOrCreateSheet(EXECUTION_TAB_TASKS);
  
  // Check if sheet is empty (no data rows)
  const data = sheet.getDataRange().getValues();
  if (data.length > 0) {
    // Sheet has data, do not write headers
    Logger.log('EXECUTION_TASKS sheet exists and has data');
    return;
  }

  // Write headers only if empty
  const header = [
    'task_id',
    'title',
    'notes',
    'status',
    'created_at',
    'completed_at',
    'due_date',
    'decided_id'
  ];

  sheet.getRange(1, 1, 1, header.length).setValues([header]);
  
  Logger.log('EXECUTION_TASKS sheet initialized with headers');
}

// ================== TASK OPERATIONS ==================
function createTask(input) {
  if (EXECUTION_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  
  if (!input || !input.title || !input.title.trim()) {
    throw new Error('Title is required');
  }

  const sheet = getOrCreateSheet(EXECUTION_TAB_TASKS);
  initExecutionSheet();

  // Generate ID
  const taskId = generateTaskId();
  const now = new Date();

  // Append row - no inference, no defaults beyond required fields
  const row = [
    taskId,
    String(input.title).trim(),
    input.notes ? String(input.notes).trim() : '',
    STATUS_OPEN,
    now,
    '', // completed_at empty for open tasks
    input.due_date || '',
    input.decided_id ? String(input.decided_id).trim() : ''
  ];

  sheet.appendRow(row);
  
  Logger.log('Created task: ' + taskId);
  return taskId;
}

function completeTask(task_id) {
  if (EXECUTION_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  const sheet = getOrCreateSheet(EXECUTION_TAB_TASKS);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    throw new Error('No tasks found');
  }

  // Find header indices
  const headerRow = data[0];
  const idIdx = headerRow.indexOf('task_id');
  const statusIdx = headerRow.indexOf('status');
  const completedAtIdx = headerRow.indexOf('completed_at');

  if (idIdx === -1 || statusIdx === -1 || completedAtIdx === -1) {
    throw new Error('Invalid EXECUTION_TASKS sheet structure');
  }

  // Find the task
  let rowIdx = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx] || '').trim() === String(task_id).trim()) {
      rowIdx = i + 1; // +1 because sheet rows are 1-indexed
      break;
    }
  }

  if (rowIdx === -1) {
    throw new Error('Task not found: ' + task_id);
  }

  // Update status
  sheet.getRange(rowIdx, statusIdx + 1).setValue(STATUS_DONE);

  // Set completed_at
  sheet.getRange(rowIdx, completedAtIdx + 1).setValue(new Date());

  Logger.log('Completed task: ' + task_id);
  return true;
}

function cancelTask(task_id) {
  if (EXECUTION_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  const sheet = getOrCreateSheet(EXECUTION_TAB_TASKS);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    throw new Error('No tasks found');
  }

  // Find header indices
  const headerRow = data[0];
  const idIdx = headerRow.indexOf('task_id');
  const statusIdx = headerRow.indexOf('status');
  const completedAtIdx = headerRow.indexOf('completed_at');

  if (idIdx === -1 || statusIdx === -1 || completedAtIdx === -1) {
    throw new Error('Invalid EXECUTION_TASKS sheet structure');
  }

  // Find the task
  let rowIdx = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx] || '').trim() === String(task_id).trim()) {
      rowIdx = i + 1; // +1 because sheet rows are 1-indexed
      break;
    }
  }

  if (rowIdx === -1) {
    throw new Error('Task not found: ' + task_id);
  }

  // Update status
  sheet.getRange(rowIdx, statusIdx + 1).setValue(STATUS_CANCELED);

  // Set completed_at
  sheet.getRange(rowIdx, completedAtIdx + 1).setValue(new Date());

  Logger.log('Canceled task: ' + task_id);
  return true;
}

// ================== QUERY FUNCTIONS ==================
function listOpenTasks() {
  const sheet = getOrCreateSheet(EXECUTION_TAB_TASKS);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return [];
  }

  // Find header indices
  const headerRow = data[0];
  const idIdx = headerRow.indexOf('task_id');
  const titleIdx = headerRow.indexOf('title');
  const notesIdx = headerRow.indexOf('notes');
  const statusIdx = headerRow.indexOf('status');
  const createdIdx = headerRow.indexOf('created_at');
  const completedIdx = headerRow.indexOf('completed_at');
  const dueDateIdx = headerRow.indexOf('due_date');
  const decidedIdIdx = headerRow.indexOf('decided_id');

  if (idIdx === -1 || statusIdx === -1) {
    return [];
  }

  const tasks = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const taskStatus = String(row[statusIdx] || '').trim();

    // Only return tasks where status = "open"
    if (taskStatus !== STATUS_OPEN) {
      continue;
    }

    tasks.push({
      task_id: row[idIdx],
      title: titleIdx >= 0 ? row[titleIdx] : '',
      notes: notesIdx >= 0 ? row[notesIdx] : '',
      status: taskStatus,
      created_at: createdIdx >= 0 ? row[createdIdx] : null,
      completed_at: completedIdx >= 0 ? row[completedIdx] : null,
      due_date: dueDateIdx >= 0 ? row[dueDateIdx] : null,
      decided_id: decidedIdIdx >= 0 ? (row[decidedIdIdx] ? String(row[decidedIdIdx]).trim() : '') : ''
    });
  }

  return tasks;
}

function listTasksByDecided(decided_id) {
  const sheet = getOrCreateSheet(EXECUTION_TAB_TASKS);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return [];
  }
  
  // Find header indices
  const headerRow = data[0];
  const idIdx = headerRow.indexOf('task_id');
  const titleIdx = headerRow.indexOf('title');
  const notesIdx = headerRow.indexOf('notes');
  const statusIdx = headerRow.indexOf('status');
  const createdIdx = headerRow.indexOf('created_at');
  const completedIdx = headerRow.indexOf('completed_at');
  const dueDateIdx = headerRow.indexOf('due_date');
  const decidedIdIdx = headerRow.indexOf('decided_id');
  
  if (idIdx === -1 || decidedIdIdx === -1) {
    return [];
  }
  
  const tasks = [];
  const decidedIdStr = String(decided_id).trim();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const taskDecidedId = row[decidedIdIdx] ? String(row[decidedIdIdx]).trim() : '';
    
    // Filter by decided_id
    if (taskDecidedId !== decidedIdStr) {
      continue;
    }
    
    tasks.push({
      task_id: row[idIdx],
      title: titleIdx >= 0 ? row[titleIdx] : '',
      notes: notesIdx >= 0 ? row[notesIdx] : '',
      status: statusIdx >= 0 ? String(row[statusIdx] || '').trim() : '',
      created_at: createdIdx >= 0 ? row[createdIdx] : null,
      completed_at: completedIdx >= 0 ? row[completedIdx] : null,
      due_date: dueDateIdx >= 0 ? row[dueDateIdx] : null,
      decided_id: taskDecidedId
    });
  }
  
  return tasks;
}

// ================== TEST ENTRY POINT ==================
function runExecutionSelfTest() {
  if (EXECUTION_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  Logger.log('--- EXECUTION SELF TEST START ---');

  initExecutionSheet();

  const sheet = getOrCreateSheet(EXECUTION_TAB_TASKS);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    Logger.log('No tasks found. Counts: open=0, done=0, canceled=0');
    Logger.log('--- EXECUTION SELF TEST END ---');
    return;
  }

  // Find header indices
  const headerRow = data[0];
  const statusIdx = headerRow.indexOf('status');

  if (statusIdx === -1) {
    Logger.log('Invalid sheet structure');
    Logger.log('--- EXECUTION SELF TEST END ---');
    return;
  }

  // Count by status
  let openCount = 0;
  let doneCount = 0;
  let canceledCount = 0;

  for (let i = 1; i < data.length; i++) {
    const status = String(data[i][statusIdx] || '').trim();
    if (status === STATUS_OPEN) {
      openCount++;
    } else if (status === STATUS_DONE) {
      doneCount++;
    } else if (status === STATUS_CANCELED) {
      canceledCount++;
    }
  }

  Logger.log('Task counts by status:');
  Logger.log('  open: ' + openCount);
  Logger.log('  done: ' + doneCount);
  Logger.log('  canceled: ' + canceledCount);

  Logger.log('--- EXECUTION SELF TEST END ---');
}

// ================== HELPERS ==================
function generateTaskId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return 'TASK-' + timestamp + '-' + random;
}

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  return sheet;
}
