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

// ================== REMINDER CONFIG ==================
const EXECUTION_REMINDER_EMAIL = 'gestionrockwell@gmail.com';

// ================== STATUS VALUES ==================
const STATUS_OPEN = 'open';
const STATUS_DONE = 'done';
const STATUS_DELETED = 'deleted';
const STATUS_CANCELED = 'canceled'; // Legacy support

// ================== CLARIFY OPTIONS ==================
const CLARIFY_CLASSIFICATIONS = [
  'Action',
  'Decision',
  'Experiment',
  'Product idea',
  'Sales insight',
  'Strategy insight',
  'Public Pipeline',
  'MSP Pipeline',
  'Product & Intelligence',
  'Founder OS',
  'Archive / No action'
];

const CLARIFY_BUSINESS_LOOPS = [
  'Public',
  'MSP',
  'Product',
  'Intelligence',
  'Founder',
  'Admin',
  'Archive'
];

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
    'notes',
    // Clarify fields (additive, legacy-safe defaults)
    'classification',
    'business_loop',
    'next_action',
    'urgency',
    'effort',
    'leverage_score',
    'priority_label',
    'stale_after',
    'promoted_to',
    'last_reviewed_at'
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
    'decided_id',
    // Clarify fields copied from inbox when available
    'classification',
    'business_loop',
    'next_action',
    'urgency',
    'effort',
    'leverage_score',
    'priority_label',
    'stale_after',
    'promoted_to',
    'last_reviewed_at'
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
  const input = _normalizeInboxInput(content);
  if (!input.content) {
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
    input.content,
    'text',
    input.capture_mode,
    input.source,
    input.notes,
    input.classification,
    input.business_loop,
    input.next_action,
    input.urgency,
    input.effort,
    input.leverage_score,
    input.priority_label,
    input.stale_after,
    input.promoted_to,
    input.last_reviewed_at
  ];
  
  sheet.appendRow(row);
  return inboxId;
}

function promoteInboxToTask(inbox_id, options) {
  options = options || {};
  
  const sheet = _getOrCreateSheet(EXECUTION_TAB_INBOX);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    throw new Error('No inbox items found');
  }

  const headerRow = data[0];
  const idIdx = headerRow.indexOf('inbox_id');
  const contentIdx = headerRow.indexOf('content');
  const captureModeIdx = headerRow.indexOf('capture_mode');
  const sourceIdx = headerRow.indexOf('source');
  const notesIdx = headerRow.indexOf('notes');
  const classificationIdx = headerRow.indexOf('classification');
  const businessLoopIdx = headerRow.indexOf('business_loop');
  const nextActionIdx = headerRow.indexOf('next_action');
  const urgencyIdx = headerRow.indexOf('urgency');
  const effortIdx = headerRow.indexOf('effort');
  const leverageScoreIdx = headerRow.indexOf('leverage_score');
  const priorityLabelIdx = headerRow.indexOf('priority_label');
  const staleAfterIdx = headerRow.indexOf('stale_after');
  const promotedToIdx = headerRow.indexOf('promoted_to');
  const lastReviewedAtIdx = headerRow.indexOf('last_reviewed_at');

  if (idIdx === -1 || contentIdx === -1) {
    throw new Error('Invalid EXECUTION_INBOX sheet structure');
  }

  // Find the inbox item
  let inboxItem = null;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx] || '').trim() === String(inbox_id).trim()) {
      inboxItem = {
        inbox_id: String(data[i][idIdx]).trim(),
        content: data[i][contentIdx],
        capture_mode: captureModeIdx >= 0 ? String(data[i][captureModeIdx] || '').trim() : 'text',
        source: sourceIdx >= 0 ? String(data[i][sourceIdx] || '').trim() : 'mobile_capture',
        notes: notesIdx >= 0 ? String(data[i][notesIdx] || '').trim() : '',
        classification: classificationIdx >= 0 ? String(data[i][classificationIdx] || '').trim() : '',
        business_loop: businessLoopIdx >= 0 ? String(data[i][businessLoopIdx] || '').trim() : '',
        next_action: nextActionIdx >= 0 ? String(data[i][nextActionIdx] || '').trim() : '',
        urgency: urgencyIdx >= 0 ? Number(data[i][urgencyIdx]) : 3,
        effort: effortIdx >= 0 ? Number(data[i][effortIdx]) : 3,
        leverage_score: leverageScoreIdx >= 0 ? Number(data[i][leverageScoreIdx]) : null,
        priority_label: priorityLabelIdx >= 0 ? String(data[i][priorityLabelIdx] || '').trim() : '',
        stale_after: staleAfterIdx >= 0 ? data[i][staleAfterIdx] : '',
        promoted_to: promotedToIdx >= 0 ? String(data[i][promotedToIdx] || '').trim() : '',
        last_reviewed_at: lastReviewedAtIdx >= 0 ? data[i][lastReviewedAtIdx] : ''
      };
      break;
    }
  }

  if (!inboxItem) {
    throw new Error('Inbox item not found: ' + inbox_id);
  }

  const clarify = _normalizeClarifyFields({
    classification: options.classification || inboxItem.classification,
    business_loop: options.business_loop || inboxItem.business_loop,
    next_action: options.next_action || inboxItem.next_action,
    urgency: options.urgency !== undefined ? options.urgency : inboxItem.urgency,
    effort: options.effort !== undefined ? options.effort : inboxItem.effort,
    leverage_score: options.leverage_score !== undefined ? options.leverage_score : inboxItem.leverage_score,
    priority_label: options.priority_label || inboxItem.priority_label,
    stale_after: options.stale_after || inboxItem.stale_after,
    promoted_to: options.promoted_to || inboxItem.promoted_to,
    last_reviewed_at: options.last_reviewed_at || inboxItem.last_reviewed_at
  });

  const canCreateTask = _canPromoteToExecutionTask(clarify);
  if (!canCreateTask.allowed) {
    // Legacy-safe behavior: do not delete inbox item when clarify gate blocks promotion.
    return '';
  }

  // Create task from inbox item
  const taskInput = {
    content: clarify.next_action || inboxItem.content,
    origin: 'inbox',
    inbox_id: inboxItem.inbox_id,
    capture_mode: inboxItem.capture_mode,
    project_id: options.project_id || '',
    write_to_raw: options.write_to_raw || false,
    notes: inboxItem.notes,
    classification: clarify.classification,
    business_loop: clarify.business_loop,
    next_action: clarify.next_action,
    urgency: clarify.urgency,
    effort: clarify.effort,
    leverage_score: clarify.leverage_score,
    priority_label: clarify.priority_label,
    stale_after: clarify.stale_after,
    promoted_to: 'task',
    last_reviewed_at: new Date()
  };

  const taskId = createTask(taskInput);

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
  const sheet = _getOrCreateSheet(EXECUTION_TAB_INBOX);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return [];
  }

  const headerRow = data[0];
  const idIdx = headerRow.indexOf('inbox_id');
  const createdAtIdx = headerRow.indexOf('created_at');
  const contentIdx = headerRow.indexOf('content');
  const captureModeIdx = headerRow.indexOf('capture_mode');
  const sourceIdx = headerRow.indexOf('source');
  const notesIdx = headerRow.indexOf('notes');
  const classificationIdx = headerRow.indexOf('classification');
  const businessLoopIdx = headerRow.indexOf('business_loop');
  const nextActionIdx = headerRow.indexOf('next_action');
  const urgencyIdx = headerRow.indexOf('urgency');
  const effortIdx = headerRow.indexOf('effort');
  const leverageScoreIdx = headerRow.indexOf('leverage_score');
  const priorityLabelIdx = headerRow.indexOf('priority_label');
  const staleAfterIdx = headerRow.indexOf('stale_after');
  const promotedToIdx = headerRow.indexOf('promoted_to');
  const lastReviewedAtIdx = headerRow.indexOf('last_reviewed_at');

  if (idIdx === -1 || contentIdx === -1) {
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
      notes: notesIdx >= 0 ? (row[notesIdx] ? String(row[notesIdx]).trim() : '') : '',
      classification: classificationIdx >= 0 ? (row[classificationIdx] ? String(row[classificationIdx]).trim() : 'Action') : 'Action',
      business_loop: businessLoopIdx >= 0 ? (row[businessLoopIdx] ? String(row[businessLoopIdx]).trim() : 'Founder') : 'Founder',
      next_action: nextActionIdx >= 0 ? (row[nextActionIdx] ? String(row[nextActionIdx]).trim() : '') : '',
      urgency: urgencyIdx >= 0 && row[urgencyIdx] !== '' ? Number(row[urgencyIdx]) : 3,
      effort: effortIdx >= 0 && row[effortIdx] !== '' ? Number(row[effortIdx]) : 3,
      leverage_score: leverageScoreIdx >= 0 && row[leverageScoreIdx] !== '' ? Number(row[leverageScoreIdx]) : 0,
      priority_label: priorityLabelIdx >= 0 ? (row[priorityLabelIdx] ? String(row[priorityLabelIdx]).trim() : 'Schedule') : 'Schedule',
      stale_after: staleAfterIdx >= 0 ? (row[staleAfterIdx] || '') : '',
      promoted_to: promotedToIdx >= 0 ? (row[promotedToIdx] ? String(row[promotedToIdx]).trim() : '') : '',
      last_reviewed_at: lastReviewedAtIdx >= 0 ? (row[lastReviewedAtIdx] || '') : ''
    });
  }

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
  const clarify = _normalizeClarifyFields(input);

  const headerRowCreate = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const dueAtIdx = headerRowCreate.indexOf('due_at');
  const dueWindowIdx = headerRowCreate.indexOf('due_window');
  const reminderRuleIdx = headerRowCreate.indexOf('reminder_rule');
  const recurrenceRuleIdx = headerRowCreate.indexOf('recurrence_rule');
  const recurrenceAnchorIdx = headerRowCreate.indexOf('recurrence_anchor');
  
  let dueAt = '';
  if (input.due_at) {
    if (input.due_at instanceof Date) {
      dueAt = input.due_at;
    } else {
      dueAt = new Date(input.due_at);
    }
  }

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
    input.decided_id ? String(input.decided_id).trim() : '', // decided_id (legacy, maps to project_id if Project)
    clarify.classification,
    clarify.business_loop,
    clarify.next_action,
    clarify.urgency,
    clarify.effort,
    clarify.leverage_score,
    clarify.priority_label,
    clarify.stale_after,
    clarify.promoted_to,
    clarify.last_reviewed_at
  ];
  
  if (dueAtIdx >= 0) {
    while (row.length <= dueAtIdx) {
      row.push('');
    }
    row[dueAtIdx] = dueAt;
  }
  
  if (dueWindowIdx >= 0 && input.due_window) {
    while (row.length <= dueWindowIdx) {
      row.push('');
    }
    row[dueWindowIdx] = String(input.due_window).trim();
  }
  
  if (reminderRuleIdx >= 0 && input.reminder_rule) {
    while (row.length <= reminderRuleIdx) {
      row.push('');
    }
    row[reminderRuleIdx] = String(input.reminder_rule).trim();
  }
  
  if (recurrenceRuleIdx >= 0 && input.recurrence_rule) {
    while (row.length <= recurrenceRuleIdx) {
      row.push('');
    }
    row[recurrenceRuleIdx] = String(input.recurrence_rule).trim();
  }
  
  if (recurrenceAnchorIdx >= 0 && input.recurrence_anchor) {
    while (row.length <= recurrenceAnchorIdx) {
      row.push('');
    }
    let anchor = '';
    if (input.recurrence_anchor instanceof Date) {
      anchor = input.recurrence_anchor;
    } else {
      anchor = new Date(input.recurrence_anchor);
    }
    row[recurrenceAnchorIdx] = anchor;
  }

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

  // Handle recurrence on completion
  const headerRowRecur = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const recurrenceRuleIdx = headerRowRecur.indexOf('recurrence_rule');
  const recurrenceAnchorIdx = headerRowRecur.indexOf('recurrence_anchor');
  const dueAtIdx = headerRowRecur.indexOf('due_at');
  const reminderRuleIdx = headerRowRecur.indexOf('reminder_rule');
  const projectIdIdx = headerRowRecur.indexOf('project_id');
  const contentIdx = headerRowRecur.indexOf('content');
  
  if (recurrenceRuleIdx >= 0) {
    const recurrenceRule = String(data[rowIdx - 1][recurrenceRuleIdx] || '').trim();
    if (recurrenceRule && recurrenceRule !== 'none') {
      const currentDueAt = dueAtIdx >= 0 ? data[rowIdx - 1][dueAtIdx] : null;
      const anchor = recurrenceAnchorIdx >= 0 ? data[rowIdx - 1][recurrenceAnchorIdx] : null;
      const baseDate = currentDueAt || anchor || new Date();
      
      let nextDueAt = null;
      if (recurrenceRule === 'daily') {
        nextDueAt = new Date(baseDate);
        nextDueAt.setDate(nextDueAt.getDate() + 1);
      } else if (recurrenceRule.startsWith('weekly:')) {
        const weekday = parseInt(recurrenceRule.split(':')[1]);
        nextDueAt = new Date(baseDate);
        const daysUntil = (weekday - nextDueAt.getDay() + 7) % 7 || 7;
        nextDueAt.setDate(nextDueAt.getDate() + daysUntil);
      } else if (recurrenceRule.startsWith('monthly:')) {
        const day = parseInt(recurrenceRule.split(':')[1]);
        nextDueAt = new Date(baseDate);
        nextDueAt.setMonth(nextDueAt.getMonth() + 1);
        nextDueAt.setDate(day);
      }
      
      if (nextDueAt) {
        const taskContent = contentIdx >= 0 ? data[rowIdx - 1][contentIdx] : '';
        const taskProjectId = projectIdIdx >= 0 ? (data[rowIdx - 1][projectIdIdx] ? String(data[rowIdx - 1][projectIdIdx]).trim() : '') : '';
        const taskReminderRule = reminderRuleIdx >= 0 ? (data[rowIdx - 1][reminderRuleIdx] ? String(data[rowIdx - 1][reminderRuleIdx]).trim() : '') : '';
        
        createTask({
          content: taskContent,
          project_id: taskProjectId,
          due_at: nextDueAt,
          reminder_rule: taskReminderRule,
          recurrence_rule: recurrenceRule,
          recurrence_anchor: anchor || nextDueAt
        });
      }
    }
  }

  return true;
}

function setTaskTiming(task_id, options) {
  const sheet = _getOrCreateSheet(EXECUTION_TAB_TASKS);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    throw new Error('No tasks found');
  }

  const headerRow = data[0];
  const idIdx = headerRow.indexOf('task_id');
  const dueAtIdx = headerRow.indexOf('due_at');
  const classificationIdx = headerRow.indexOf('classification');
  const businessLoopIdx = headerRow.indexOf('business_loop');
  const nextActionIdx = headerRow.indexOf('next_action');
  const urgencyIdx = headerRow.indexOf('urgency');
  const effortIdx = headerRow.indexOf('effort');
  const leverageScoreIdx = headerRow.indexOf('leverage_score');
  const priorityLabelIdx = headerRow.indexOf('priority_label');
  const staleAfterIdx = headerRow.indexOf('stale_after');
  const promotedToIdx = headerRow.indexOf('promoted_to');
  const lastReviewedAtIdx = headerRow.indexOf('last_reviewed_at');
  const dueWindowIdx = headerRow.indexOf('due_window');
  const reminderRuleIdx = headerRow.indexOf('reminder_rule');

  if (idIdx === -1) {
    throw new Error('Invalid EXECUTION_TASKS sheet structure');
  }

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

  if (options.due_at !== undefined && dueAtIdx >= 0) {
    let dueAt = '';
    if (options.due_at) {
      if (options.due_at instanceof Date) {
        dueAt = options.due_at;
      } else {
        dueAt = new Date(options.due_at);
      }
    }
    sheet.getRange(rowIdx, dueAtIdx + 1).setValue(dueAt);
  }

  if (options.due_window !== undefined && dueWindowIdx >= 0) {
    sheet.getRange(rowIdx, dueWindowIdx + 1).setValue(String(options.due_window || '').trim());
  }

  if (options.reminder_rule !== undefined && reminderRuleIdx >= 0) {
    sheet.getRange(rowIdx, reminderRuleIdx + 1).setValue(String(options.reminder_rule || '').trim());
  }

  return true;
}

function setTaskRecurrence(task_id, options) {
  const sheet = _getOrCreateSheet(EXECUTION_TAB_TASKS);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    throw new Error('No tasks found');
  }

  const headerRowRecurrence = data[0];
  const idIdx = headerRowRecurrence.indexOf('task_id');
  const recurrenceRuleIdx = headerRowRecurrence.indexOf('recurrence_rule');
  const recurrenceAnchorIdx = headerRowRecurrence.indexOf('recurrence_anchor');

  if (idIdx === -1) {
    throw new Error('Invalid EXECUTION_TASKS sheet structure');
  }

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

  if (options.recurrence_rule !== undefined && recurrenceRuleIdx >= 0) {
    sheet.getRange(rowIdx, recurrenceRuleIdx + 1).setValue(String(options.recurrence_rule || '').trim());
  }

  if (options.recurrence_anchor !== undefined && recurrenceAnchorIdx >= 0) {
    let anchor = '';
    if (options.recurrence_anchor) {
      if (options.recurrence_anchor instanceof Date) {
        anchor = options.recurrence_anchor;
      } else {
        anchor = new Date(options.recurrence_anchor);
      }
    }
    sheet.getRange(rowIdx, recurrenceAnchorIdx + 1).setValue(anchor);
  }

  return true;
}

function runExecutionRemindersOnce() {
  const sheet = _getOrCreateSheet(EXECUTION_TAB_TASKS);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return;
  }

  const headerRow = data[0];
  const idIdx = headerRow.indexOf('task_id');
  const stateIdx = headerRow.indexOf('state');
  const dueAtIdx = headerRow.indexOf('due_at');
  const reminderRuleIdx = headerRow.indexOf('reminder_rule');
  const lastRemindedIdx = headerRow.indexOf('last_reminded_at');

  if (idIdx === -1 || stateIdx === -1) {
    return;
  }

  const now = new Date();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const state = String(row[stateIdx] || '').trim();
    
    if (state !== STATUS_OPEN) {
      continue;
    }

    const dueAt = dueAtIdx >= 0 ? row[dueAtIdx] : null;
    if (!dueAt) {
      continue;
    }

    const reminderRule = reminderRuleIdx >= 0 ? String(row[reminderRuleIdx] || '').trim() : '';
    if (!reminderRule || reminderRule === 'none') {
      continue;
    }

    const lastReminded = lastRemindedIdx >= 0 ? row[lastRemindedIdx] : null;
    
    let reminderTime = null;
    if (reminderRule === 'at_due') {
      reminderTime = new Date(dueAt);
    } else if (reminderRule.startsWith('minutes_before:')) {
      const minutes = parseInt(reminderRule.split(':')[1]);
      reminderTime = new Date(dueAt);
      reminderTime.setMinutes(reminderTime.getMinutes() - minutes);
    } else if (reminderRule.startsWith('hours_before:')) {
      const hours = parseInt(reminderRule.split(':')[1]);
      reminderTime = new Date(dueAt);
      reminderTime.setHours(reminderTime.getHours() - hours);
    } else if (reminderRule.startsWith('day_of:')) {
      const timeStr = reminderRule.split(':')[1] + ':' + reminderRule.split(':')[2];
      const [hours, minutes] = timeStr.split(':').map(Number);
      reminderTime = new Date(dueAt);
      reminderTime.setHours(hours);
      reminderTime.setMinutes(minutes);
      reminderTime.setSeconds(0);
      reminderTime.setMilliseconds(0);
    }

    if (!reminderTime) {
      continue;
    }

    if (now < reminderTime) {
      continue;
    }

    if (lastReminded && new Date(lastReminded) >= reminderTime) {
      continue;
    }

    const contentIdx = headerRow.indexOf('content');
    const content = contentIdx >= 0 ? String(row[contentIdx] || '') : '';
    const dueAtDate = new Date(dueAt);
    const dueAtFormatted = dueAtDate.toLocaleString();
    const isOverdue = now > dueAtDate;
    const status = isOverdue ? 'overdue' : 'upcoming';

    try {
      MailApp.sendEmail({
        to: EXECUTION_REMINDER_EMAIL,
        subject: 'Execution reminder',
        body: 'Task: ' + content + '\nDue: ' + dueAtFormatted + '\nStatus: ' + status
      });
    } catch (e) {
      // Silent failure
    }

    if (lastRemindedIdx >= 0) {
      sheet.getRange(i + 1, lastRemindedIdx + 1).setValue(now);
    }
  }
}

function ensureExecutionReminderTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  let hasReminderTrigger = false;
  
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'runExecutionRemindersOnce') {
      hasReminderTrigger = true;
      break;
    }
  }
  
  if (!hasReminderTrigger) {
    ScriptApp.newTrigger('runExecutionRemindersOnce')
      .timeBased()
      .everyMinutes(15)
      .create();
  }
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
  const dueAtIdx = headerRow.indexOf('due_at');

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
    
    const dueAt = dueAtIdx >= 0 ? row[dueAtIdx] : null;
    const overdue = dueAt ? (new Date() > new Date(dueAt)) : false;

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
      decided_id: decidedIdIdx >= 0 ? (row[decidedIdIdx] ? String(row[decidedIdIdx]).trim() : '') : '', // Legacy
      due_at: dueAt,
      overdue: overdue,
      classification: classificationIdx >= 0 ? (row[classificationIdx] ? String(row[classificationIdx]).trim() : 'Action') : 'Action',
      business_loop: businessLoopIdx >= 0 ? (row[businessLoopIdx] ? String(row[businessLoopIdx]).trim() : 'Founder') : 'Founder',
      next_action: nextActionIdx >= 0 ? (row[nextActionIdx] ? String(row[nextActionIdx]).trim() : '') : '',
      urgency: urgencyIdx >= 0 && row[urgencyIdx] !== '' ? Number(row[urgencyIdx]) : 3,
      effort: effortIdx >= 0 && row[effortIdx] !== '' ? Number(row[effortIdx]) : 3,
      leverage_score: leverageScoreIdx >= 0 && row[leverageScoreIdx] !== '' ? Number(row[leverageScoreIdx]) : 0,
      priority_label: priorityLabelIdx >= 0 ? (row[priorityLabelIdx] ? String(row[priorityLabelIdx]).trim() : 'Schedule') : 'Schedule',
      stale_after: staleAfterIdx >= 0 ? (row[staleAfterIdx] || '') : '',
      promoted_to: promotedToIdx >= 0 ? (row[promotedToIdx] ? String(row[promotedToIdx]).trim() : '') : '',
      last_reviewed_at: lastReviewedAtIdx >= 0 ? (row[lastReviewedAtIdx] || '') : ''
    });
  }

  return tasks;
}

function listCommitments() {
  const tasks = listOpenTasks();
  return tasks.filter(task => task.due_at !== null && task.due_at !== '');
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
function normalizeExecutionTasksSchema_v1_2() {
  const sheet = _getOrCreateSheet(EXECUTION_TAB_TASKS);
  const data = sheet.getDataRange().getValues();
  
  if (data.length === 0) {
    _initExecutionSheet();
    return;
  }
  
  const headerRow = data[0];
  const newColumns = [
    'due_at',
    'due_window',
    'reminder_rule',
    'last_reminded_at',
    'recurrence_rule',
    'recurrence_anchor',
    'classification',
    'business_loop',
    'next_action',
    'urgency',
    'effort',
    'leverage_score',
    'priority_label',
    'stale_after',
    'promoted_to',
    'last_reviewed_at'
  ];
  
  const existingHeaders = headerRow.map(h => String(h || '').trim());
  const missingColumns = [];
  
  for (let i = 0; i < newColumns.length; i++) {
    if (existingHeaders.indexOf(newColumns[i]) === -1) {
      missingColumns.push(newColumns[i]);
    }
  }
  
  if (missingColumns.length === 0) {
    return;
  }
  
  const numRows = data.length;
  const numCols = headerRow.length + missingColumns.length;
  
  const newHeaderRow = headerRow.slice();
  for (let i = 0; i < missingColumns.length; i++) {
    newHeaderRow.push(missingColumns[i]);
  }
  
  const newData = [newHeaderRow];
  
  for (let rowIdx = 1; rowIdx < numRows; rowIdx++) {
    const oldRow = data[rowIdx];
    const newRow = oldRow.slice();
    for (let i = 0; i < missingColumns.length; i++) {
      newRow.push('');
    }
    newData.push(newRow);
  }
  
  sheet.clear();
  if (newData.length > 0) {
    sheet.getRange(1, 1, newData.length, newData[0].length).setValues(newData);
  }
}

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
    'decided_id',
    'classification',
    'business_loop',
    'next_action',
    'urgency',
    'effort',
    'leverage_score',
    'priority_label',
    'stale_after',
    'promoted_to',
    'last_reviewed_at'
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
  const clarifyHeaders = [
    'classification',
    'business_loop',
    'next_action',
    'urgency',
    'effort',
    'leverage_score',
    'priority_label',
    'stale_after',
    'promoted_to',
    'last_reviewed_at'
  ];
  const allCanonicalHeaders = canonicalHeaders.concat(clarifyHeaders);
  
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
    } else if (allCanonicalHeaders.indexOf(headerRow[i]) !== -1) {
      headerMap[headerRow[i]] = i;
    }
  }
  
  // Check which canonical headers are missing
  const missingHeaders = [];
  const newHeaderRow = [];
  const columnMapping = [];
  
  for (let i = 0; i < allCanonicalHeaders.length; i++) {
    const canonicalHeader = allCanonicalHeaders[i];
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
  if (missingHeaders.length > 0 || headerRow.length !== allCanonicalHeaders.length) {
    const numRows = data.length;
    const numCols = allCanonicalHeaders.length;
    
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

// ================== CLARIFY HELPERS ==================
function _normalizeInboxInput(contentOrInput) {
  const rawInput = (typeof contentOrInput === 'string') ? { content: contentOrInput } : (contentOrInput || {});
  const content = rawInput.content ? String(rawInput.content).trim() :
    (rawInput.title ? String(rawInput.title).trim() : '');
  const clarify = _normalizeClarifyFields(rawInput);
  return {
    content: content,
    capture_mode: rawInput.capture_mode ? String(rawInput.capture_mode).trim() : 'text',
    source: rawInput.source ? String(rawInput.source).trim() : 'mobile_capture',
    notes: rawInput.notes ? String(rawInput.notes).trim() : '',
    classification: clarify.classification,
    business_loop: clarify.business_loop,
    next_action: clarify.next_action,
    urgency: clarify.urgency,
    effort: clarify.effort,
    leverage_score: clarify.leverage_score,
    priority_label: clarify.priority_label,
    stale_after: clarify.stale_after,
    promoted_to: clarify.promoted_to,
    last_reviewed_at: clarify.last_reviewed_at
  };
}

function _normalizeClarifyFields(input) {
  const safe = input || {};
  const classification = CLARIFY_CLASSIFICATIONS.indexOf(String(safe.classification || '').trim()) >= 0
    ? String(safe.classification).trim()
    : 'Action'; // Preserve legacy behavior by defaulting captures to actionable.
  const businessLoop = CLARIFY_BUSINESS_LOOPS.indexOf(String(safe.business_loop || '').trim()) >= 0
    ? String(safe.business_loop).trim()
    : 'Founder';
  const nextAction = safe.next_action ? String(safe.next_action).trim() : '';
  const urgency = _normalizeScoreValue(safe.urgency, 3);
  const effort = _normalizeScoreValue(safe.effort, 3);

  const hasExplicitScore = safe.leverage_score !== undefined && safe.leverage_score !== null && safe.leverage_score !== '';
  const leverageScore = hasExplicitScore ? Number(safe.leverage_score) : _computeLeverageScore(safe);
  const priorityLabel = safe.priority_label
    ? String(safe.priority_label).trim()
    : _labelFromLeverageScore(leverageScore);
  const staleAfter = safe.stale_after ? safe.stale_after : '';
  const promotedTo = safe.promoted_to ? String(safe.promoted_to).trim() : '';
  const lastReviewedAt = safe.last_reviewed_at ? safe.last_reviewed_at : new Date();

  return {
    classification: classification,
    business_loop: businessLoop,
    next_action: nextAction,
    urgency: urgency,
    effort: effort,
    leverage_score: leverageScore,
    priority_label: priorityLabel,
    stale_after: staleAfter,
    promoted_to: promotedTo,
    last_reviewed_at: lastReviewedAt
  };
}

function _normalizeScoreValue(value, fallback) {
  const num = Number(value);
  if (!isNaN(num) && num >= 1 && num <= 5) {
    return Math.round(num);
  }
  return fallback;
}

function _computeLeverageScore(input) {
  const safe = input || {};
  const revenue = _normalizeScoreValue(safe.revenue, 3);
  const validation = _normalizeScoreValue(safe.validation, 3);
  const learning = _normalizeScoreValue(safe.learning, 3);
  const strategic = _normalizeScoreValue(safe.strategic, 3);
  const urgency = _normalizeScoreValue(safe.urgency, 3);
  const effort = _normalizeScoreValue(safe.effort, 3);
  return revenue + validation + learning + strategic + urgency - effort;
}

function _labelFromLeverageScore(score) {
  const n = Number(score);
  if (isNaN(n)) {
    return 'Schedule';
  }
  if (n >= 14) return 'Do now';
  if (n >= 10) return 'Schedule';
  if (n >= 7) return 'Convert to experiment';
  if (n >= 5) return 'Park';
  return 'Archive';
}

function _canPromoteToExecutionTask(clarify) {
  const c = clarify || {};
  const isAction = c.classification === 'Action';
  const hasNextAction = !!(c.next_action && String(c.next_action).trim());
  const notArchiveLoop = c.business_loop !== 'Archive';
  return { allowed: isAction && hasNextAction && notArchiveLoop };
}

// Public helper for callers that want explicit scoring.
function calculateLeveragePriority(input) {
  const score = _computeLeverageScore(input || {});
  return {
    leverage_score: score,
    priority_label: _labelFromLeverageScore(score)
  };
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
