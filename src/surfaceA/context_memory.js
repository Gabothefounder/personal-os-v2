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

// ================== SCHEMA DEFINITIONS (FROZEN) ==================
// SCHEMA FROZEN — 2026-01-06
// PEOPLE: person_id, display_name, privacy_level, created_at, notes
// FACTS: fact_id, person_id, predicate, object, source, created_at, expires_at
// INTERACTIONS v1.0 (FROZEN): interaction_id, person_id, occurred_at, topic_tags, notes
// INTERACTIONS v1.1 (FROZEN): interaction_id, person_id, occurred_at, topic_tags, notes, notes_audio, follow_up_hint, follow_up_note
// INTERACTIONS v1.1 (FROZEN)
// notes_audio: raw audio reference only (no auto-transcription)
// follow_up_hint: non-binding marker of incompleteness
// follow_up_note: descriptive only, no scheduling or obligation
// INTERACTIONS memory is descriptive only.
// Follow-up hints do not imply action.
// Audio is stored raw and never interpreted.
// Do not modify these schemas without explicit contract reopening.

// ================== INITIALIZATION ==================
function _initContextSheets() {
  if (CONTEXT_MEMORY_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  
  _initPeopleSheet();
  _initFactsSheet();
  _initInteractionsSheet();
  
  Logger.log('Context sheets initialized');
}

function _initPeopleSheet() {
  const sheet = _getOrCreateSheet(CONTEXT_MEMORY_TAB_PEOPLE);
  const data = sheet.getDataRange().getValues();
  
  if (data.length > 0) {
    _validatePeopleSchema(data[0]);
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

function _initFactsSheet() {
  const sheet = _getOrCreateSheet(CONTEXT_MEMORY_TAB_FACTS);
  const data = sheet.getDataRange().getValues();
  
  if (data.length > 0) {
    _validateFactsSchema(data[0]);
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

function _initInteractionsSheet() {
  const sheet = _getOrCreateSheet(CONTEXT_MEMORY_TAB_INTERACTIONS);
  const data = sheet.getDataRange().getValues();
  
  if (data.length > 0) {
    _validateInteractionsSchema(data[0]);
    return;
  }
  
  const header = [
    'interaction_id',
    'person_id',
    'occurred_at',
    'topic_tags',
    'notes',
    'notes_audio',
    'follow_up_hint',
    'follow_up_note'
  ];
  
  sheet.getRange(1, 1, 1, header.length).setValues([header]);
}

// ================== PEOPLE ==================
function _addPerson(display_name, privacy_level, notes) {
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
  
  const sheet = _getOrCreateSheet(CONTEXT_MEMORY_TAB_PEOPLE);
  _initPeopleSheet();
  
  const personId = _generatePersonId();
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

function _getPeople() {
  const sheet = _getSheet(CONTEXT_MEMORY_TAB_PEOPLE);
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
function _addFact(person_id, predicate, object, source, expires_at) {
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
  
  const sheet = _getOrCreateSheet(CONTEXT_MEMORY_TAB_FACTS);
  _initFactsSheet();
  
  const factId = _generateFactId();
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

function _getActiveFacts(person_id) {
  const sheet = _getSheet(CONTEXT_MEMORY_TAB_FACTS);
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
function _addInteraction(person_id, occurred_at, notes, topic_tags, notes_audio, follow_up_hint, follow_up_note) {
  if (CONTEXT_MEMORY_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  
  if (!person_id || !person_id.trim()) {
    throw new Error('person_id is required');
  }
  
  if (!occurred_at || !(occurred_at instanceof Date)) {
    throw new Error('occurred_at is required and must be a Date');
  }
  
  const sheet = _getOrCreateSheet(CONTEXT_MEMORY_TAB_INTERACTIONS);
  _initInteractionsSheet();
  
  const data = sheet.getDataRange().getValues();
  const headerRow = data[0];
  const schemaVersion = _detectInteractionsSchemaVersion(headerRow);
  
  const interactionId = _generateInteractionId();
  
  const row = [
    interactionId,
    String(person_id).trim(),
    occurred_at,
    topic_tags ? String(topic_tags).trim() : '',
    notes ? String(notes).trim() : ''
  ];
  
  if (schemaVersion === 'v1.1') {
    row.push(notes_audio ? String(notes_audio).trim() : '');
    
    if (follow_up_hint === true || follow_up_hint === 'TRUE' || follow_up_hint === 'true') {
      row.push(true);
    } else {
      row.push(false);
    }
    
    row.push(follow_up_note ? String(follow_up_note).trim() : '');
  } else if (schemaVersion === 'v1.0') {
    if (notes_audio || follow_up_hint || follow_up_note) {
      throw new Error('Cannot write v1.1 fields to v1.0 schema. Run migrateInteractionsToV1_1() first.');
    }
  }
  
  sheet.appendRow(row);
  
  Logger.log('Added interaction: ' + interactionId);
  return interactionId;
}

function _getInteractions(person_id) {
  const sheet = _getSheet(CONTEXT_MEMORY_TAB_INTERACTIONS);
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
  const notesAudioIdx = headerRow.indexOf('notes_audio');
  const followUpHintIdx = headerRow.indexOf('follow_up_hint');
  const followUpNoteIdx = headerRow.indexOf('follow_up_note');
  
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
    
    const interaction = {
      interaction_id: row[idIdx],
      person_id: interactionPersonId,
      occurred_at: occurredIdx >= 0 ? row[occurredIdx] : null,
      topic_tags: topicTagsIdx >= 0 ? row[topicTagsIdx] : '',
      notes: notesIdx >= 0 ? row[notesIdx] : ''
    };
    
    if (notesAudioIdx >= 0) {
      interaction.notes_audio = row[notesAudioIdx] ? String(row[notesAudioIdx]).trim() : '';
    }
    
    if (followUpHintIdx >= 0) {
      const hintValue = row[followUpHintIdx];
      interaction.follow_up_hint = hintValue === true || hintValue === 'TRUE' || hintValue === 'true';
    }
    
    if (followUpNoteIdx >= 0) {
      interaction.follow_up_note = row[followUpNoteIdx] ? String(row[followUpNoteIdx]).trim() : '';
    }
    
    interactions.push(interaction);
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
function _runContextSelfTest() {
  if (CONTEXT_MEMORY_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  Logger.log('--- CONTEXT MEMORY SELF TEST START ---');
  
  _initContextSheets();
  
  // Count PEOPLE rows
  const peopleSheet = _getSheet(CONTEXT_MEMORY_TAB_PEOPLE);
  let peopleCount = 0;
  if (peopleSheet) {
    const peopleData = peopleSheet.getDataRange().getValues();
    peopleCount = Math.max(0, peopleData.length - 1); // Subtract header
  }
  
  // Count FACTS rows
  const factsSheet = _getSheet(CONTEXT_MEMORY_TAB_FACTS);
  let factsCount = 0;
  if (factsSheet) {
    const factsData = factsSheet.getDataRange().getValues();
    factsCount = Math.max(0, factsData.length - 1); // Subtract header
  }
  
  // Count INTERACTIONS rows
  const interactionsSheet = _getSheet(CONTEXT_MEMORY_TAB_INTERACTIONS);
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

// ================== SCHEMA VALIDATION ==================
function _validatePeopleSchema(headerRow) {
  const expected = ['person_id', 'display_name', 'privacy_level', 'created_at', 'notes'];
  const actual = headerRow.map(h => String(h || '').trim());
  
  if (actual.length !== expected.length) {
    throw new Error('PEOPLE schema mismatch: expected ' + expected.length + ' columns, found ' + actual.length);
  }
  
  for (let i = 0; i < expected.length; i++) {
    if (actual[i] !== expected[i]) {
      throw new Error('PEOPLE schema mismatch: column ' + (i + 1) + ' expected "' + expected[i] + '", found "' + actual[i] + '"');
    }
  }
}

function _validateFactsSchema(headerRow) {
  const expected = ['fact_id', 'person_id', 'predicate', 'object', 'source', 'created_at', 'expires_at'];
  const actual = headerRow.map(h => String(h || '').trim());
  
  if (actual.length !== expected.length) {
    throw new Error('FACTS schema mismatch: expected ' + expected.length + ' columns, found ' + actual.length);
  }
  
  for (let i = 0; i < expected.length; i++) {
    if (actual[i] !== expected[i]) {
      throw new Error('FACTS schema mismatch: column ' + (i + 1) + ' expected "' + expected[i] + '", found "' + actual[i] + '"');
    }
  }
}

function _validateInteractionsSchema(headerRow) {
  const version = _detectInteractionsSchemaVersion(headerRow);
  if (version === null) {
    throw new Error('INTERACTIONS schema mismatch: sheet does not match v1.0 or v1.1 schema');
  }
}

function _detectInteractionsSchemaVersion(headerRow) {
  const actual = headerRow.map(h => String(h || '').trim());
  
  const v1_0 = ['interaction_id', 'person_id', 'occurred_at', 'topic_tags', 'notes'];
  const v1_1 = ['interaction_id', 'person_id', 'occurred_at', 'topic_tags', 'notes', 'notes_audio', 'follow_up_hint', 'follow_up_note'];
  
  if (actual.length === v1_0.length) {
    let matches = true;
    for (let i = 0; i < v1_0.length; i++) {
      if (actual[i] !== v1_0[i]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      return 'v1.0';
    }
  }
  
  if (actual.length === v1_1.length) {
    let matches = true;
    for (let i = 0; i < v1_1.length; i++) {
      if (actual[i] !== v1_1[i]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      return 'v1.1';
    }
  }
  
  return null;
}

// ================== MIGRATION ==================
function migrateInteractionsToV1_1() {
  if (CONTEXT_MEMORY_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  
  Logger.log('--- INTERACTIONS MIGRATION TO V1.1 START ---');
  
  const sheet = _getOrCreateSheet(CONTEXT_MEMORY_TAB_INTERACTIONS);
  const data = sheet.getDataRange().getValues();
  
  if (data.length === 0) {
    Logger.log('Sheet is empty. Initializing with v1.1 schema.');
    _initInteractionsSheet();
    Logger.log('--- INTERACTIONS MIGRATION TO V1.1 END (INITIALIZED) ---');
    return;
  }
  
  const headerRow = data[0];
  const version = _detectInteractionsSchemaVersion(headerRow);
  
  if (version === 'v1.1') {
    Logger.log('Sheet already at v1.1. No migration needed.');
    Logger.log('--- INTERACTIONS MIGRATION TO V1.1 END (ALREADY V1.1) ---');
    return;
  }
  
  if (version !== 'v1.0') {
    throw new Error('Cannot migrate: sheet does not match v1.0 schema. Current schema is unrecognized.');
  }
  
  Logger.log('Detected v1.0 schema. Appending new columns...');
  
  const newColumns = ['notes_audio', 'follow_up_hint', 'follow_up_note'];
  const currentColCount = headerRow.length;
  
  for (let i = 0; i < newColumns.length; i++) {
    const colIndex = currentColCount + i + 1;
    sheet.getRange(1, colIndex).setValue(newColumns[i]);
  }
  
  Logger.log('Migration complete. Sheet is now v1.1.');
  Logger.log('--- INTERACTIONS MIGRATION TO V1.1 END (SUCCESS) ---');
}

// ================== HELPERS ==================
function _generatePersonId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return 'PERSON-' + timestamp + '-' + random;
}

function _generateFactId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return 'FACT-' + timestamp + '-' + random;
}

function _generateInteractionId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return 'INT-' + timestamp + '-' + random;
}

// _getSheet and _getOrCreateSheet are defined in personal_os_v2.js
