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

  _writeWeeklyBriefToDoc(brief);

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
  
  const surfaceA = _readWeeklySurfaceA();
  const executionData = _readExecutionData();
  const projects = _readProjectsFromDecided();
  const allDerivedSignals = _readDerivedSignals() || [];
  
  // Operating Reality
  lines.push('Operating Reality');
  lines.push('');
  if (surfaceA && (surfaceA.orientation || surfaceA.framing)) {
    const realityParts = [];
    if (surfaceA.orientation) {
      realityParts.push(surfaceA.orientation);
    }
    if (surfaceA.framing) {
      realityParts.push(surfaceA.framing);
    }
    lines.push(realityParts.join(' '));
  } else {
    lines.push('No operational orientation recorded.');
  }
  lines.push('');
  lines.push('');
  
  // Pressure & Load
  lines.push('Pressure & Load');
  lines.push('');
  const pressureParts = [];
  if (executionData.openCount > 0) {
    pressureParts.push(executionData.openCount + ' open task' + (executionData.openCount !== 1 ? 's' : ''));
  }
  if (executionData.agingCount > 0) {
    pressureParts.push(executionData.agingCount + ' aging task' + (executionData.agingCount !== 1 ? 's' : ''));
  }
  if (surfaceA && surfaceA.attention) {
    pressureParts.push('Attention cues: ' + surfaceA.attention);
  }
  if (pressureParts.length > 0) {
    lines.push(pressureParts.join('. ') + '.');
  } else {
    lines.push('No pressure indicators recorded.');
  }
  lines.push('');
  lines.push('');
  
  // Movement & Friction
  lines.push('Movement & Friction');
  lines.push('');
  const movementParts = [];
  if (executionData.completedCount > 0) {
    movementParts.push(executionData.completedCount + ' task' + (executionData.completedCount !== 1 ? 's' : '') + ' completed');
  }
  if (executionData.carriedCount > 0) {
    movementParts.push(executionData.carriedCount + ' task' + (executionData.carriedCount !== 1 ? 's' : '') + ' carried forward');
  }
  if (movementParts.length > 0) {
    lines.push('Movement: ' + movementParts.join('. ') + '.');
  } else {
    lines.push('No movement recorded.');
  }
  if (executionData.carriedCount > 0) {
    lines.push('Friction: ' + executionData.carriedCount + ' task' + (executionData.carriedCount !== 1 ? 's' : '') + ' stalled or repeated.');
  } else {
    lines.push('Friction: none recorded.');
  }
  lines.push('');
  lines.push('');
  
  // Leverage & Dependencies
  lines.push('Leverage & Dependencies');
  lines.push('');
  const projectTasks = executionData.projectLinkedTasks || 0;
  if (projects.length > 0 || projectTasks > 0) {
    const leverageParts = [];
    if (projects.length > 0) {
      leverageParts.push(projects.length + ' active project' + (projects.length !== 1 ? 's' : ''));
    }
    if (projectTasks > 0) {
      leverageParts.push(projectTasks + ' project-linked task' + (projectTasks !== 1 ? 's' : ''));
    }
    lines.push('Leverage: ' + leverageParts.join('. ') + '.');
  } else {
    lines.push('Leverage: none recorded.');
  }
  lines.push('');
  lines.push('');
  
  // Signals (DERIVED)
  lines.push('Signals (DERIVED)');
  lines.push('');
  
  const sustained = eligibleSignals || [];
  const emerging = _getEmergingSignals(allDerivedSignals, eligibleSignals);
  const collapsed = _getCollapsedSignals(allDerivedSignals, eligibleSignals);
  
  lines.push('A. Sustained');
  if (sustained.length > 0) {
    for (const signal of sustained) {
      const windowDays = _extractWindowDays(signal.window);
      const ratio = signal.possible > 0 ? (signal.count / signal.possible * 100).toFixed(0) : 0;
      lines.push(signal.pattern_key + ': ' + signal.count + '/' + signal.possible + ' (' + ratio + '%) over ' + windowDays + ' days.');
    }
  } else {
    lines.push('None.');
  }
  lines.push('');
  
  lines.push('B. Emerging (below threshold)');
  if (emerging.length > 0) {
    for (const signal of emerging.slice(0, 5)) {
      const ratio = signal.possible > 0 ? (signal.count / signal.possible * 100).toFixed(0) : 0;
      lines.push(signal.pattern_key + ': ' + signal.count + '/' + signal.possible + ' (' + ratio + '%).');
    }
  } else {
    lines.push('None.');
  }
  lines.push('');
  
  lines.push('C. Collapsed');
  if (collapsed.length > 0) {
    for (const signal of collapsed.slice(0, 3)) {
      lines.push(signal.pattern_key + ' no longer sustained.');
    }
  } else {
    lines.push('None.');
  }
  lines.push('');
  lines.push('');
  
  // External Context
  lines.push('External Context');
  lines.push('');
  if (surfaceA && surfaceA.context) {
    lines.push(surfaceA.context);
  } else {
    lines.push('None recorded.');
  }
  lines.push('');
  lines.push('');
  
  // DECIDED Commitments
  lines.push('DECIDED Commitments');
  lines.push('');
  if (decidedItems.length > 0) {
    for (const item of decidedItems) {
      if (item.title) {
        lines.push(item.title + '.');
      }
    }
  } else {
    lines.push('None.');
  }
  lines.push('');
  lines.push('');
  
  // Readiness & Posture
  lines.push('Readiness & Posture');
  lines.push('');
  const readiness = _assessReadiness(executionData, surfaceA);
  lines.push('Readiness: ' + readiness.level + '. Cause: ' + readiness.cause + '.');
  lines.push('');
  lines.push('');
  
  // Forward Tension
  lines.push('Forward Tension');
  lines.push('');
  const tensions = _identifyForwardTension(executionData, projects);
  if (tensions.length > 0) {
    for (const tension of tensions) {
      lines.push(tension + '.');
    }
  } else {
    lines.push('None identified.');
  }
  lines.push('');
  lines.push('');
  
  // Closing Statement
  lines.push('Closing Statement');
  lines.push('');
  const closing = _generateClosingStatement(executionData, surfaceA);
  lines.push(closing);
  lines.push('');

  return lines.join('\n');
}

function _readWeeklySurfaceA() {
  const sheet = _getSheet('SURFACE_A');
  if (!sheet) {
    return null;
  }
  const data = sheet.getDataRange().getValues();
  if (data.length === 0) {
    return null;
  }
  
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
  
  if (keyValueMap['last_run_status'] !== 'SUCCESS') {
    return null;
  }
  
  return {
    orientation: keyValueMap['orientation'] ? String(keyValueMap['orientation']).trim() : '',
    framing: keyValueMap['framing'] ? String(keyValueMap['framing']).trim() : '',
    attention: keyValueMap['attention'] ? String(keyValueMap['attention']).trim() : '',
    context: keyValueMap['context'] ? String(keyValueMap['context']).trim() : ''
  };
}

function _readExecutionData() {
  try {
    const tasks = typeof listOpenTasks === 'function' ? listOpenTasks() : [];
    const allTasks = _readAllExecutionTasks();
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let completedCount = 0;
    let agingCount = 0;
    let projectLinkedTasks = 0;
    
    for (const task of allTasks) {
      if (task.state === 'done' && task.completed_at) {
        const completedDate = new Date(task.completed_at);
        if (completedDate >= sevenDaysAgo) {
          completedCount++;
        }
      }
      if (task.state === 'open' && task.created_at) {
        const createdDate = new Date(task.created_at);
        if (createdDate < sevenDaysAgo) {
          agingCount++;
        }
      }
      if (task.project_id && task.project_id.trim()) {
        projectLinkedTasks++;
      }
    }
    
    const carriedCount = tasks.length;
    
    return {
      openCount: tasks.length,
      completedCount: completedCount,
      carriedCount: carriedCount,
      agingCount: agingCount,
      projectLinkedTasks: projectLinkedTasks
    };
  } catch (e) {
    return {
      openCount: 0,
      completedCount: 0,
      carriedCount: 0,
      agingCount: 0,
      projectLinkedTasks: 0
    };
  }
}

function _readAllExecutionTasks() {
  try {
    const sheet = _getSheet('EXECUTION_TASKS');
    if (!sheet) {
      return [];
    }
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return [];
    }
    
    const headerRow = data[0];
    const idIdx = headerRow.indexOf('task_id');
    const stateIdx = headerRow.indexOf('state');
    const createdIdx = headerRow.indexOf('created_at');
    const completedIdx = headerRow.indexOf('completed_at');
    const projectIdIdx = headerRow.indexOf('project_id');
    
    if (idIdx === -1 || stateIdx === -1) {
      return [];
    }
    
    const tasks = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      tasks.push({
        task_id: row[idIdx],
        state: String(row[stateIdx] || '').trim(),
        created_at: createdIdx >= 0 ? row[createdIdx] : null,
        completed_at: completedIdx >= 0 ? row[completedIdx] : null,
        project_id: projectIdIdx >= 0 ? (row[projectIdIdx] ? String(row[projectIdIdx]).trim() : '') : ''
      });
    }
    
    return tasks;
  } catch (e) {
    return [];
  }
}

function _readProjectsFromDecided() {
  try {
    const items = _readConfirmedSpeakable();
    return items.filter(item => item.type === 'Project');
  } catch (e) {
    return [];
  }
}

function _getEmergingSignals(allSignals, eligibleSignals) {
  const eligibleKeys = new Set(eligibleSignals.map(s => s.pattern_key));
  return allSignals.filter(s => {
    if (eligibleKeys.has(s.pattern_key)) {
      return false;
    }
    const windowDays = _extractWindowDays(s.window);
    if (windowDays < 7 || windowDays > 14) {
      return false;
    }
    if (s.possible === 0) {
      return false;
    }
    const ratio = s.count / s.possible;
    return ratio > 0 && ratio < WEEKLY_ELIGIBILITY_THRESHOLD;
  });
}

function _getCollapsedSignals(allSignals, eligibleSignals) {
  return [];
}

function _assessReadiness(executionData, surfaceA) {
  if (executionData.agingCount > 5 || executionData.openCount > 15) {
    return { level: 'Degraded', cause: 'Load' };
  }
  if (executionData.openCount > 8) {
    return { level: 'Medium', cause: 'Load' };
  }
  if (surfaceA && surfaceA.context) {
    return { level: 'Medium', cause: 'Environment' };
  }
  return { level: 'High', cause: 'Unknown' };
}

function _identifyForwardTension(executionData, projects) {
  const tensions = [];
  if (executionData.agingCount > 0) {
    tensions.push(executionData.agingCount + ' aging task' + (executionData.agingCount !== 1 ? 's' : '') + ' approaching');
  }
  if (executionData.openCount > 10) {
    tensions.push('Open task count: ' + executionData.openCount);
  }
  if (projects.length > 0 && executionData.projectLinkedTasks === 0) {
    tensions.push('Projects active but no project-linked tasks');
  }
  return tensions;
}

function _generateClosingStatement(executionData, surfaceA) {
  if (executionData.completedCount > 0 && executionData.carriedCount === 0) {
    return 'All tasks completed. No carryover.';
  }
  if (executionData.carriedCount > executionData.completedCount) {
    return 'More tasks carried than completed.';
  }
  if (executionData.completedCount > 0) {
    return 'Some movement recorded.';
  }
  return 'No movement recorded this week.';
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

// ================== EXPORT TO WEEKLY INTELLIGENCE BRIEF DOC ==================
function _writeWeeklyBriefToDoc(weeklyText) {
  if (!weeklyText || !weeklyText.trim()) {
    Logger.log('No weekly text to write to Weekly Intelligence Brief doc.');
    return;
  }

  const props = PropertiesService.getScriptProperties();
  let docId = props.getProperty('WEEKLY_BRIEF_DOC_ID');

  let doc = null;

  // Try to open by ID if it exists
  if (docId) {
    try {
      doc = DocumentApp.openById(docId);
      Logger.log('Weekly Intelligence Brief document opened by ID.');
    } catch (e) {
      Logger.log('Could not open Weekly Intelligence Brief document by ID: ' + e.message);
      Logger.log('Attempting to search Drive by name...');
      docId = null; // Clear invalid ID
    }
  }

  // If ID is invalid or missing, search Drive by name
  if (!doc && !docId) {
    try {
      const files = DriveApp.getFilesByName('Weekly Intelligence Brief');
      if (files.hasNext()) {
        const file = files.next();
        docId = file.getId();
        doc = DocumentApp.openById(docId);
        // Store the found ID for future use
        props.setProperty('WEEKLY_BRIEF_DOC_ID', docId);
        Logger.log('Weekly Intelligence Brief document found by name and opened. ID stored.');
      } else {
        Logger.log('Weekly Intelligence Brief document not found in Drive. Document not updated.');
        return;
      }
    } catch (e) {
      Logger.log('Could not search for Weekly Intelligence Brief document: ' + e.message);
      return;
    }
  }

  if (!doc) {
    Logger.log('Could not open Weekly Intelligence Brief document. Document not updated.');
    return;
  }

  const body = doc.getBody();
  body.clear();

  // Compute emission date header
  const now = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateString = now.toLocaleDateString('en-US', dateOptions);
  const dateHeader = 'Generated: ' + dateString;

  // Write date header as first paragraph
  body.appendParagraph(dateHeader);
  
  // Insert exactly one blank line
  body.appendParagraph('');
  
  // Write weeklyText verbatim, preserving line breaks
  const lines = weeklyText.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    body.appendParagraph(line);
  }

  Logger.log('Weekly Intelligence Brief document updated successfully.');
}

// ================== TRIGGER SETUP ==================
function ensureWeeklySunday8amTrigger() {
  const existingTriggers = ScriptApp.getProjectTriggers();
  const weeklyFunctions = ['runSurfaceBWeeklyOnce'];
  let deletedCount = 0;
  let hasCorrectTrigger = false;

  for (let i = 0; i < existingTriggers.length; i++) {
    const trigger = existingTriggers[i];
    const handlerFunction = trigger.getHandlerFunction();
    
    if (weeklyFunctions.indexOf(handlerFunction) !== -1) {
      if (trigger.getEventType() === ScriptApp.EventType.CLOCK &&
          trigger.getWeekDay() === ScriptApp.WeekDay.SUNDAY &&
          trigger.getHour() === 8) {
        hasCorrectTrigger = true;
      } else {
        ScriptApp.deleteTrigger(trigger);
        deletedCount++;
      }
    }
  }

  if (!hasCorrectTrigger) {
    ScriptApp.newTrigger('runSurfaceBWeeklyOnce')
      .timeBased()
      .onWeekDay(ScriptApp.WeekDay.SUNDAY)
      .atHour(8)
      .create();
    Logger.log('Weekly Sunday trigger created: runSurfaceBWeeklyOnce (Sundays at 8:00 AM).');
  } else if (deletedCount > 0) {
    Logger.log('Weekly Sunday trigger verified: runSurfaceBWeeklyOnce (Sundays at 8:00 AM). Removed ' + deletedCount + ' duplicate trigger(s).');
  } else {
    Logger.log('Weekly Sunday trigger already exists: runSurfaceBWeeklyOnce (Sundays at 8:00 AM).');
  }
}

// ================== HELPERS ==================
// _getSheet and _getOrCreateSheet are defined in personal_os_v2.js
