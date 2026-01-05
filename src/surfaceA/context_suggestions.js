// TEMP EXECUTION GUARD — REMOVE AFTER VALIDATION
const CONTEXT_SUGGESTIONS_GUARD = false;

// Context → Execution Bridge (Non-Coercive)

/************************************************************
 * Context-Based Task Suggestions
 *
 * Purpose:
 * - Offer optional task suggestions from recalled context
 * - Opt-in only, one-shot, dismissible, never pressure
 *
 * Rules:
 * - Opt-in only
 * - One-shot
 * - Dismissible
 * - Never pressure
 * - No background suggestions
 * - No triggers
 * - No calls to Surface A, DERIVED, DECIDED, or Execution
 * - No Gemini
 * - Silence is a valid outcome
 ************************************************************/

// ================== TAB NAMES ==================
const CONTEXT_SUGGESTIONS_TAB_PEOPLE = 'PEOPLE';
const CONTEXT_SUGGESTIONS_TAB_INTERACTIONS = 'INTERACTIONS';
const CONTEXT_SUGGESTIONS_TAB_STATE = 'CONTEXT_SUGGESTION_STATE';

// ================== SCRIPT PROPERTIES KEY ==================
const PROP_KEY_ENABLED = 'CONTEXT_SUGGESTIONS_ENABLED';

// ================== SUGGESTION TYPES ==================
const SUGGESTION_TYPE_FOLLOW_UP = 'follow_up';
const SUGGESTION_TYPE_BIRTHDAY = 'birthday';
const SUGGESTION_TYPE_RAPPORT = 'rapport';

// ================== TIME WINDOWS ==================
const FOLLOW_UP_MIN_DAYS = 7;
const FOLLOW_UP_MAX_DAYS = 30;

// ================== OPT-IN CONTROL ==================
function enableContextSuggestions() {
  if (CONTEXT_SUGGESTIONS_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  PropertiesService.getScriptProperties().setProperty(PROP_KEY_ENABLED, 'true');
  Logger.log('Context suggestions enabled');
}

function disableContextSuggestions() {
  if (CONTEXT_SUGGESTIONS_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  PropertiesService.getScriptProperties().setProperty(PROP_KEY_ENABLED, 'false');
  Logger.log('Context suggestions disabled');
}

function isContextSuggestionsEnabled() {
  const value = PropertiesService.getScriptProperties().getProperty(PROP_KEY_ENABLED);
  // Default is false
  return value === 'true';
}

// ================== STATE STORE ==================
function initSuggestionStateSheet() {
  const sheet = getOrCreateSheet(CONTEXT_SUGGESTIONS_TAB_STATE);
  const data = sheet.getDataRange().getValues();
  
  // Write headers only if empty
  if (data.length > 0) {
    return;
  }
  
  const header = [
    'suggestion_id',
    'person_id',
    'suggestion_type',
    'created_at',
    'dismissed_at'
  ];
  
  sheet.getRange(1, 1, 1, header.length).setValues([header]);
}

// ================== SUGGEST FOLLOW-UP ==================
function suggestFollowUp(person_id) {
  if (CONTEXT_SUGGESTIONS_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  
  // Precondition: CONTEXT_SUGGESTIONS_ENABLED === true
  if (!isContextSuggestionsEnabled()) {
    return null;
  }
  
  // Precondition: person exists
  const person = getPersonById(person_id);
  if (!person) {
    return null;
  }
  
  // Precondition: person.privacy_level != "sensitive"
  if (person.privacy_level === 'sensitive') {
    return null;
  }
  
  // Precondition: no active (non-dismissed) suggestion of this type for this person
  if (hasActiveSuggestion(person_id, SUGGESTION_TYPE_FOLLOW_UP)) {
    return null;
  }
  
  // Read last INTERACTION for the person
  const lastInteraction = getLastInteraction(person_id);
  if (!lastInteraction) {
    return null;
  }
  
  // Check if last interaction is within reasonable window (7-30 days)
  const now = new Date();
  const daysSince = Math.floor((now - lastInteraction.occurred_at) / (1000 * 60 * 60 * 24));
  
  if (daysSince < FOLLOW_UP_MIN_DAYS || daysSince > FOLLOW_UP_MAX_DAYS) {
    return null;
  }
  
  // Create suggestion
  const suggestionId = generateSuggestionId();
  const suggestion = {
    suggestion_id: suggestionId,
    text: 'A past interaction with ' + person.display_name + ' may be worth revisiting.'
  };
  
  // Store suggestion in state
  storeSuggestion(suggestionId, person_id, SUGGESTION_TYPE_FOLLOW_UP);
  
  Logger.log('Created follow-up suggestion: ' + suggestionId + ' for person: ' + person_id);
  return suggestion;
}

// ================== DISMISS SUGGESTION ==================
function dismissSuggestion(suggestion_id) {
  if (CONTEXT_SUGGESTIONS_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  
  const sheet = getOrCreateSheet(CONTEXT_SUGGESTIONS_TAB_STATE);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return false;
  }
  
  const headerRow = data[0];
  const idIdx = headerRow.indexOf('suggestion_id');
  const dismissedIdx = headerRow.indexOf('dismissed_at');
  
  if (idIdx === -1 || dismissedIdx === -1) {
    return false;
  }
  
  // Find the suggestion
  let rowIdx = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx] || '').trim() === String(suggestion_id).trim()) {
      rowIdx = i + 1; // +1 because sheet rows are 1-indexed
      break;
    }
  }
  
  if (rowIdx === -1) {
    return false;
  }
  
  // Check if already dismissed
  const currentDismissed = data[rowIdx - 1][dismissedIdx];
  if (currentDismissed) {
    return true; // Already dismissed
  }
  
  // Mark dismissed_at
  sheet.getRange(rowIdx, dismissedIdx + 1).setValue(new Date());
  
  Logger.log('Dismissed suggestion: ' + suggestion_id);
  return true;
}

// ================== HELPERS ==================
function getPersonById(person_id) {
  const sheet = getSheet(CONTEXT_SUGGESTIONS_TAB_PEOPLE);
  if (!sheet) {
    return null;
  }
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return null;
  }
  
  const headerRow = data[0];
  const idIdx = headerRow.indexOf('person_id');
  const displayNameIdx = headerRow.indexOf('display_name');
  const privacyLevelIdx = headerRow.indexOf('privacy_level');
  
  if (idIdx === -1) {
    return null;
  }
  
  const personIdStr = String(person_id).trim();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowPersonId = String(row[idIdx] || '').trim();
    
    if (rowPersonId === personIdStr) {
      return {
        person_id: rowPersonId,
        display_name: displayNameIdx >= 0 ? row[displayNameIdx] : '',
        privacy_level: privacyLevelIdx >= 0 ? row[privacyLevelIdx] : ''
      };
    }
  }
  
  return null;
}

function getLastInteraction(person_id) {
  const sheet = getSheet(CONTEXT_SUGGESTIONS_TAB_INTERACTIONS);
  if (!sheet) {
    return null;
  }
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return null;
  }
  
  const headerRow = data[0];
  const personIdx = headerRow.indexOf('person_id');
  const occurredIdx = headerRow.indexOf('occurred_at');
  
  if (personIdx === -1 || occurredIdx === -1) {
    return null;
  }
  
  const personIdStr = String(person_id).trim();
  let lastInteraction = null;
  let lastDate = null;
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowPersonId = String(row[personIdx] || '').trim();
    
    if (rowPersonId !== personIdStr) {
      continue;
    }
    
    const occurredAt = row[occurredIdx];
    if (!occurredAt || !(occurredAt instanceof Date)) {
      continue;
    }
    
    if (!lastDate || occurredAt > lastDate) {
      lastDate = occurredAt;
      lastInteraction = {
        person_id: rowPersonId,
        occurred_at: occurredAt
      };
    }
  }
  
  return lastInteraction;
}

function hasActiveSuggestion(person_id, suggestion_type) {
  const sheet = getSheet(CONTEXT_SUGGESTIONS_TAB_STATE);
  if (!sheet) {
    return false;
  }
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return false;
  }
  
  const headerRow = data[0];
  const personIdx = headerRow.indexOf('person_id');
  const typeIdx = headerRow.indexOf('suggestion_type');
  const dismissedIdx = headerRow.indexOf('dismissed_at');
  
  if (personIdx === -1 || typeIdx === -1 || dismissedIdx === -1) {
    return false;
  }
  
  const personIdStr = String(person_id).trim();
  const typeStr = String(suggestion_type).trim();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowPersonId = String(row[personIdx] || '').trim();
    const rowType = String(row[typeIdx] || '').trim();
    const dismissed = row[dismissedIdx];
    
    if (rowPersonId === personIdStr && rowType === typeStr && !dismissed) {
      return true; // Active (non-dismissed) suggestion found
    }
  }
  
  return false;
}

function storeSuggestion(suggestion_id, person_id, suggestion_type) {
  initSuggestionStateSheet();
  const sheet = getOrCreateSheet(CONTEXT_SUGGESTIONS_TAB_STATE);
  
  const now = new Date();
  const row = [
    String(suggestion_id).trim(),
    String(person_id).trim(),
    String(suggestion_type).trim(),
    now,
    '' // dismissed_at empty for new suggestions
  ];
  
  sheet.appendRow(row);
}

function getActiveSuggestionsCount() {
  const sheet = getSheet(CONTEXT_SUGGESTIONS_TAB_STATE);
  if (!sheet) {
    return 0;
  }
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return 0;
  }
  
  const headerRow = data[0];
  const dismissedIdx = headerRow.indexOf('dismissed_at');
  
  if (dismissedIdx === -1) {
    return 0;
  }
  
  let count = 0;
  for (let i = 1; i < data.length; i++) {
    const dismissed = data[i][dismissedIdx];
    if (!dismissed) {
      count++;
    }
  }
  
  return count;
}

function generateSuggestionId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return 'SUGG-' + timestamp + '-' + random;
}

// ================== TEST ENTRY POINT ==================
function runContextSuggestionsSelfTest() {
  if (CONTEXT_SUGGESTIONS_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  Logger.log('--- CONTEXT SUGGESTIONS SELF TEST START ---');
  
  const enabled = isContextSuggestionsEnabled();
  Logger.log('Suggestions enabled: ' + enabled);
  
  initSuggestionStateSheet();
  const activeCount = getActiveSuggestionsCount();
  Logger.log('Active suggestions count: ' + activeCount);
  
  Logger.log('--- CONTEXT SUGGESTIONS SELF TEST END ---');
}

// ================== SHEET HELPERS ==================
function getSheet(name) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(name);
  return sheet;
}

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(name);
  
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  
  return sheet;
}
