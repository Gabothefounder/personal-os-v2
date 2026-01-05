// TEMP EXECUTION GUARD — REMOVE AFTER VALIDATION
throw new Error("TEMP GUARD: Do not run yet");

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
 ************************************************************/

// ================== TAB NAME ==================
const TAB_EXECUTION_TASKS = 'EXECUTION_TASKS';

// ================== CONSTANTS ==================
const STATUS_OPEN = 'open';
const STATUS_DONE = 'done';

// ================== INITIALIZATION ==================
function initializeExecutionTasks() {
  const sheet = getOrCreateSheet(TAB_EXECUTION_TASKS);
  
  // Check if already initialized
  const data = sheet.getDataRange().getValues();
  if (data.length > 0 && data[0][0] === 'task_id') {
    Logger.log('EXECUTION_TASKS already initialized');
    return;
  }

  // Write header
  const header = [
    'task_id',
    'title',
    'status',
    'linked_decided_id',
    'created_at',
    'completed_at'
  ];

  sheet.clearContents();
  sheet.getRange(1, 1, 1, header.length).setValues([header]);
  
  Logger.log('EXECUTION_TASKS initialized');
}

// ================== TASK OPERATIONS ==================
function createTask(title, linkedDecidedId) {
  if (!title || !title.trim()) {
    throw new Error('Title is required');
  }

  const sheet = getOrCreateSheet(TAB_EXECUTION_TASKS);
  initializeExecutionTasks();

  // Generate ID
  const taskId = generateTaskId();

  const now = new Date();

  // Append row
  const row = [
    taskId,
    title.trim(),
    STATUS_OPEN,
    linkedDecidedId ? String(linkedDecidedId).trim() : '',
    now,
    '' // completed_at empty for open tasks
  ];

  sheet.appendRow(row);
  
  Logger.log('Created task: ' + taskId);
  return taskId;
}

function completeTask(taskId) {
  const sheet = getOrCreateSheet(TAB_EXECUTION_TASKS);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    throw new Error('No tasks found');
  }

  // Find header indices
  const headerRow = data[0];
  const idIdx = headerRow.indexOf('task_id');
  const statusIdx = headerRow.indexOf('status');
  const completedAtIdx = headerRow.indexOf('completed_at');

  if (idIdx === -1 || statusIdx === -1) {
    throw new Error('Invalid EXECUTION_TASKS sheet structure');
  }

  // Find the task
  let rowIdx = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx] === taskId) {
      rowIdx = i + 1; // +1 because sheet rows are 1-indexed
      break;
    }
  }

  if (rowIdx === -1) {
    throw new Error('Task not found: ' + taskId);
  }

  // Update status
  sheet.getRange(rowIdx, statusIdx + 1).setValue(STATUS_DONE);

  // Set completed_at
  if (completedAtIdx >= 0) {
    sheet.getRange(rowIdx, completedAtIdx + 1).setValue(new Date());
  }

  Logger.log('Completed task: ' + taskId);
  return true;
}

function deleteTask(taskId) {
  const sheet = getOrCreateSheet(TAB_EXECUTION_TASKS);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    throw new Error('No tasks found');
  }

  // Find header indices
  const headerRow = data[0];
  const idIdx = headerRow.indexOf('task_id');

  if (idIdx === -1) {
    throw new Error('Invalid EXECUTION_TASKS sheet structure');
  }

  // Find the task
  let rowIdx = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx] === taskId) {
      rowIdx = i + 1; // +1 because sheet rows are 1-indexed
      break;
    }
  }

  if (rowIdx === -1) {
    throw new Error('Task not found: ' + taskId);
  }

  // Delete the row
  sheet.deleteRow(rowIdx);

  Logger.log('Deleted task: ' + taskId);
  return true;
}

// ================== QUERY FUNCTIONS ==================
function getTasks(status, linkedDecidedId) {
  const sheet = getOrCreateSheet(TAB_EXECUTION_TASKS);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return [];
  }

  // Find header indices
  const headerRow = data[0];
  const idIdx = headerRow.indexOf('task_id');
  const titleIdx = headerRow.indexOf('title');
  const statusIdx = headerRow.indexOf('status');
  const linkedIdx = headerRow.indexOf('linked_decided_id');
  const createdIdx = headerRow.indexOf('created_at');
  const completedIdx = headerRow.indexOf('completed_at');

  const tasks = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const taskStatus = row[statusIdx];
    const taskLinkedId = linkedIdx >= 0 ? String(row[linkedIdx] || '').trim() : '';

    // Filter by status if provided
    if (status && taskStatus !== status) {
      continue;
    }

    // Filter by linked_decided_id if provided
    if (linkedDecidedId && taskLinkedId !== linkedDecidedId) {
      continue;
    }

    tasks.push({
      task_id: row[idIdx],
      title: row[titleIdx],
      status: taskStatus,
      linked_decided_id: taskLinkedId || null,
      created_at: row[createdIdx],
      completed_at: row[completedIdx] || null
    });
  }

  return tasks;
}

function getOpenTasks(linkedDecidedId) {
  return getTasks(STATUS_OPEN, linkedDecidedId);
}

function getDoneTasks(linkedDecidedId) {
  return getTasks(STATUS_DONE, linkedDecidedId);
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
