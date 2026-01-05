// TEMP EXECUTION GUARD — REMOVE AFTER VALIDATION
const CONTEXT_MEMORY_GUARD = false;

// Context Memory — Fact Preservation Without Intent

/************************************************************
 * Context Memory Management
 *
 * Purpose:
 * - Store people, facts, and interactions for recall
 * - Manual only, no inferred traits, no utility judgments
 *
 * Rules:
 * - Manual only
 * - No inferred traits
 * - No utility judgments
 * - Fact preservation without intent
 * - No triggers
 * - No calls to Surface A, DERIVED, DECIDED, or Execution
 * - No auto-decay jobs (read-time filtering only)
 * - No Gemini
 ************************************************************/

// ================== TAB NAMES ==================
const CONTEXT_MEMORY_TAB_PEOPLE = 'PEOPLE';
const CONTEXT_MEMORY_TAB_FACTS = 'FACTS';
const CONTEXT_MEMORY_TAB_INTERACTIONS = 'INTERACTIONS';

// ================== INITIALIZATION ==================
function initContextSheets() {
  if (CONTEXT_MEMORY_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  
  initPeopleSheet();
  initFactsSheet();
  initInteractionsSheet();
  
  Logger.log('Context sheets initialized');
}

function initPeopleSheet() {
  const sheet = getOrCreateSheet(CONTEXT_MEMORY_TAB_PEOPLE);
  const data = sheet.getDataRange().getValues();
  
  // Write headers only if empty
  if (data.length > 0) {
    return;
  }
  
  const header = [
    'person_id',
    'display_name',
    'privacy_level',
    'created_at',
    'notes'
  ];
  
  sheet.getRange(1, 1, 1, header.length).setValues([header]);
}

function initFactsSheet() {
  const sheet = getOrCreateSheet(CONTEXT_MEMORY_TAB_FACTS);
  const data = sheet.getDataRange().getValues();
  
  // Write headers only if empty
  if (data.length > 0) {
    return;
  }
  
  const header = [
    'fact_id',
    'person_id',
    'predicate',
    'object',
    'source',
    'created_at',
    'expires_at'
  ];
  
  sheet.getRange(1, 1, 1, header.length).setValues([header]);
}

function initInteractionsSheet() {
  const sheet = getOrCreateSheet(CONTEXT_MEMORY_TAB_INTERACTIONS);
  const data = sheet.getDataRange().getValues();
  
  // Write headers only if empty
  if (data.length > 0) {
    return;
  }
  
  const header = [
    'interaction_id',
    'person_id',
    'occurred_at',
    'topic_tags',
    'notes'
  ];
  
  sheet.getRange(1, 1, 1, header.length).setValues([header]);
}

// ================== PEOPLE ==================
function addPerson(display_name, privacy_level, notes) {
  if (CONTEXT_MEMORY_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  
  if (!display_name || !display_name.trim()) {
    throw new Error('display_name is required');
  }
  
  if (!privacy_level || !privacy_level.trim()) {
    throw new Error('privacy_level is required');
  }
  
  const validPrivacyLevels = ['private', 'normal', 'sensitive'];
  if (validPrivacyLevels.indexOf(privacy_level.trim()) === -1) {
    throw new Error('privacy_level must be: private, normal, or sensitive');
  }
  
  const sheet = getOrCreateSheet(CONTEXT_MEMORY_TAB_PEOPLE);
  initPeopleSheet();
  
  const personId = generatePersonId();
  const now = new Date();
  
  const row = [
    personId,
    String(display_name).trim(),
    String(privacy_level).trim(),
    now,
    notes ? String(notes).trim() : ''
  ];
  
  sheet.appendRow(row);
  
  Logger.log('Added person: ' + personId);
  return personId;
}

function getPeople() {
  const sheet = getSheet(CONTEXT_MEMORY_TAB_PEOPLE);
  if (!sheet) {
    return [];
  }
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return [];
  }
  
  const headerRow = data[0];
  const idIdx = headerRow.indexOf('person_id');
  const displayNameIdx = headerRow.indexOf('display_name');
  const privacyLevelIdx = headerRow.indexOf('privacy_level');
  const createdIdx = headerRow.indexOf('created_at');
  const notesIdx = headerRow.indexOf('notes');
  
  if (idIdx === -1) {
    return [];
  }
  
  const people = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    people.push({
      person_id: row[idIdx],
      display_name: displayNameIdx >= 0 ? row[displayNameIdx] : '',
      privacy_level: privacyLevelIdx >= 0 ? row[privacyLevelIdx] : '',
      created_at: createdIdx >= 0 ? row[createdIdx] : null,
      notes: notesIdx >= 0 ? row[notesIdx] : ''
    });
  }
  
  return people;
}

// ================== FACTS ==================
function addFact(person_id, predicate, object, source, expires_at) {
  if (CONTEXT_MEMORY_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  
  if (!person_id || !person_id.trim()) {
    throw new Error('person_id is required');
  }
  
  if (!predicate || !predicate.trim()) {
    throw new Error('predicate is required');
  }
  
  if (!object || !object.trim()) {
    throw new Error('object is required');
  }
  
  if (!source || !source.trim()) {
    throw new Error('source is required');
  }
  
  const validSources = ['conversation', 'observation', 'manual'];
  if (validSources.indexOf(source.trim()) === -1) {
    throw new Error('source must be: conversation, observation, or manual');
  }
  
  const sheet = getOrCreateSheet(CONTEXT_MEMORY_TAB_FACTS);
  initFactsSheet();
  
  const factId = generateFactId();
  const now = new Date();
  
  const row = [
    factId,
    String(person_id).trim(),
    String(predicate).trim(),
    String(object).trim(),
    String(source).trim(),
    now,
    expires_at || ''
  ];
  
  sheet.appendRow(row);
  
  Logger.log('Added fact: ' + factId);
  return factId;
}

function getActiveFacts(person_id) {
  const sheet = getSheet(CONTEXT_MEMORY_TAB_FACTS);
  if (!sheet) {
    return [];
  }
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return [];
  }
  
  const headerRow = data[0];
  const idIdx = headerRow.indexOf('fact_id');
  const personIdx = headerRow.indexOf('person_id');
  const predicateIdx = headerRow.indexOf('predicate');
  const objectIdx = headerRow.indexOf('object');
  const sourceIdx = headerRow.indexOf('source');
  const createdIdx = headerRow.indexOf('created_at');
  const expiresIdx = headerRow.indexOf('expires_at');
  
  if (idIdx === -1 || personIdx === -1) {
    return [];
  }
  
  const facts = [];
  const now = new Date();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const factPersonId = String(row[personIdx] || '').trim();
    const expiresAt = row[expiresIdx];
    
    // Filter by person_id if provided
    if (person_id && factPersonId !== String(person_id).trim()) {
      continue;
    }
    
    // Exclude expired facts (read-time filtering only)
    if (expiresAt && expiresAt instanceof Date && expiresAt < now) {
      continue;
    }
    
    facts.push({
      fact_id: row[idIdx],
      person_id: factPersonId,
      predicate: predicateIdx >= 0 ? row[predicateIdx] : '',
      object: objectIdx >= 0 ? row[objectIdx] : '',
      source: sourceIdx >= 0 ? row[sourceIdx] : '',
      created_at: createdIdx >= 0 ? row[createdIdx] : null,
      expires_at: expiresAt || null
    });
  }
  
  return facts;
}

// ================== INTERACTIONS ==================
function addInteraction(person_id, occurred_at, notes, topic_tags) {
  if (CONTEXT_MEMORY_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  
  if (!person_id || !person_id.trim()) {
    throw new Error('person_id is required');
  }
  
  if (!occurred_at || !(occurred_at instanceof Date)) {
    throw new Error('occurred_at is required and must be a Date');
  }
  
  const sheet = getOrCreateSheet(CONTEXT_MEMORY_TAB_INTERACTIONS);
  initInteractionsSheet();
  
  const interactionId = generateInteractionId();
  
  const row = [
    interactionId,
    String(person_id).trim(),
    occurred_at,
    topic_tags ? String(topic_tags).trim() : '',
    notes ? String(notes).trim() : ''
  ];
  
  sheet.appendRow(row);
  
  Logger.log('Added interaction: ' + interactionId);
  return interactionId;
}

function getInteractions(person_id) {
  const sheet = getSheet(CONTEXT_MEMORY_TAB_INTERACTIONS);
  if (!sheet) {
    return [];
  }
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return [];
  }
  
  const headerRow = data[0];
  const idIdx = headerRow.indexOf('interaction_id');
  const personIdx = headerRow.indexOf('person_id');
  const occurredIdx = headerRow.indexOf('occurred_at');
  const topicTagsIdx = headerRow.indexOf('topic_tags');
  const notesIdx = headerRow.indexOf('notes');
  
  if (idIdx === -1 || personIdx === -1) {
    return [];
  }
  
  const interactions = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const interactionPersonId = String(row[personIdx] || '').trim();
    
    // Filter by person_id if provided
    if (person_id && interactionPersonId !== String(person_id).trim()) {
      continue;
    }
    
    interactions.push({
      interaction_id: row[idIdx],
      person_id: interactionPersonId,
      occurred_at: occurredIdx >= 0 ? row[occurredIdx] : null,
      topic_tags: topicTagsIdx >= 0 ? row[topicTagsIdx] : '',
      notes: notesIdx >= 0 ? row[notesIdx] : ''
    });
  }
  
  // Sort by occurred_at descending (most recent first)
  interactions.sort((a, b) => {
    const dateA = a.occurred_at instanceof Date ? a.occurred_at.getTime() : 0;
    const dateB = b.occurred_at instanceof Date ? b.occurred_at.getTime() : 0;
    return dateB - dateA;
  });
  
  return interactions;
}

// ================== TEST ENTRY POINT ==================
function runContextSelfTest() {
  if (CONTEXT_MEMORY_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  Logger.log('--- CONTEXT MEMORY SELF TEST START ---');
  
  initContextSheets();
  
  // Count PEOPLE rows
  const peopleSheet = getSheet(CONTEXT_MEMORY_TAB_PEOPLE);
  let peopleCount = 0;
  if (peopleSheet) {
    const peopleData = peopleSheet.getDataRange().getValues();
    peopleCount = Math.max(0, peopleData.length - 1); // Subtract header
  }
  
  // Count FACTS rows
  const factsSheet = getSheet(CONTEXT_MEMORY_TAB_FACTS);
  let factsCount = 0;
  if (factsSheet) {
    const factsData = factsSheet.getDataRange().getValues();
    factsCount = Math.max(0, factsData.length - 1); // Subtract header
  }
  
  // Count INTERACTIONS rows
  const interactionsSheet = getSheet(CONTEXT_MEMORY_TAB_INTERACTIONS);
  let interactionsCount = 0;
  if (interactionsSheet) {
    const interactionsData = interactionsSheet.getDataRange().getValues();
    interactionsCount = Math.max(0, interactionsData.length - 1); // Subtract header
  }
  
  Logger.log('Row counts:');
  Logger.log('  PEOPLE: ' + peopleCount);
  Logger.log('  FACTS: ' + factsCount);
  Logger.log('  INTERACTIONS: ' + interactionsCount);
  
  Logger.log('--- CONTEXT MEMORY SELF TEST END ---');
}

// ================== HELPERS ==================
function generatePersonId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return 'PERSON-' + timestamp + '-' + random;
}

function generateFactId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return 'FACT-' + timestamp + '-' + random;
}

function generateInteractionId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return 'INT-' + timestamp + '-' + random;
}

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
