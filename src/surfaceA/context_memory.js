// Context Memory — Fact Preservation Without Intent

/************************************************************
 * Context Memory v1.0
 *
 * Purpose:
 * - Preserve external reality without inference, interpretation, or action
 * - Silent infrastructure for recall
 *
 * Rules:
 * - Manual writes only
 * - No inference
 * - No auto-linking
 * - No auto-follow-up
 * - No reads from RAW, Surface A, DERIVED, or Surface B
 * - No writes to EXECUTION, DECIDED, or RAW
 * - follow_up_hint is descriptive only
 *
 * Entities:
 * - PERSON: identity anchors
 * - INTERACTION: occurrence records
 * - FACT: atomic, attributable, non-strategic
 ************************************************************/

// ================== TAB NAMES ==================
const CONTEXT_MEMORY_TAB_PEOPLE = 'PEOPLE';
const CONTEXT_MEMORY_TAB_FACTS = 'FACTS';
const CONTEXT_MEMORY_TAB_INTERACTIONS = 'INTERACTIONS';

// ================== SCHEMA DEFINITIONS (FROZEN) ==================
// SCHEMA FROZEN — Context Memory v1.0
//
// PERSON v1.0:
//   Required: person_id, display_name, created_at
//   Optional: aliases, relationship_category, privacy_level, notes
//
// FACT v1.0:
//   Required: fact_id, subject_type, subject_id, predicate, object, source, created_at
//   Optional: expires_at
//
// INTERACTION v1.1 (FROZEN):
//   Required: interaction_id, person_id, occurred_at
//   Optional: topic_tags, notes, notes_audio, follow_up_hint, follow_up_note
//
// INTERACTIONS memory is descriptive only.
// Follow-up hints do not imply action.
// Audio is stored raw and never interpreted.
// Do not modify these schemas without explicit contract reopening.

// ================== INITIALIZATION ==================
// Public entry point: initContextMemory()
// Initializes all Context Memory sheets if they don't exist.
// Validates schemas and fails hard on mismatch.
function initContextMemory() {
  _initPeopleSheet();
  _initFactsSheet();
  _initInteractionsSheet();
}

function _initContextSheets() {
  _initPeopleSheet();
  _initFactsSheet();
  _initInteractionsSheet();
}

function _initPeopleSheet() {
  const sheet = _getOrCreateSheet(CONTEXT_MEMORY_TAB_PEOPLE);
  const data = sheet.getDataRange().getValues();
  
  if (data.length > 0) {
    const headerRow = data[0].map(h => String(h || '').trim());
    const hasAnyHeader = headerRow.some(h => h.length > 0);
    
    if (hasAnyHeader) {
      _validatePeopleSchema(data[0]);
      return;
    }
    // else: blank header row → treat as empty sheet and write headers
  }
  
  // PERSON schema v1.0
  const header = [
    'person_id',
    'display_name',
    'created_at',
    'aliases',
    'relationship_category',
    'privacy_level',
    'notes'
  ];
  
  sheet.getRange(1, 1, 1, header.length).setValues([header]);
}

function _initFactsSheet() {
  const sheet = _getOrCreateSheet(CONTEXT_MEMORY_TAB_FACTS);
  const data = sheet.getDataRange().getValues();
  
  if (data.length > 0) {
    const headerRow = data[0].map(h => String(h || '').trim());
    const hasAnyHeader = headerRow.some(h => h.length > 0);
    
    if (hasAnyHeader) {
      _validateFactsSchema(data[0]);
      return;
    }
    // else: blank header row → treat as empty sheet and write headers
  }
  
  // FACT schema v1.0
  const header = [
    'fact_id',
    'subject_type',
    'subject_id',
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
    const headerRow = data[0].map(h => String(h || '').trim());
    const hasAnyHeader = headerRow.some(h => h.length > 0);
    
    if (hasAnyHeader) {
      _validateInteractionsSchema(data[0]);
      return;
    }
    // else: blank header row → treat as empty sheet and write headers
  }
  
  // INTERACTIONS schema v1.1
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
// Public entry point: addPerson()
// Manual writes only. No inference. No auto-linking.
function addPerson(input) {
  if (!input) {
    throw new Error('Input is required');
  }
  
  if (!input.display_name || !input.display_name.trim()) {
    throw new Error('display_name is required');
  }
  
  const sheet = _getOrCreateSheet(CONTEXT_MEMORY_TAB_PEOPLE);
  _initPeopleSheet();
  
  const personId = _generatePersonId();
  const now = new Date();
  
  // Validate privacy_level if provided
  if (input.privacy_level) {
    const validPrivacyLevels = ['private_only', 'recall_allowed', 'reminder_allowed'];
    if (validPrivacyLevels.indexOf(String(input.privacy_level).trim()) === -1) {
      throw new Error('privacy_level must be: private_only, recall_allowed, or reminder_allowed');
    }
  }
  
  const row = [
    personId, // person_id (required)
    String(input.display_name).trim(), // display_name (required)
    now, // created_at (required)
    input.aliases ? String(input.aliases).trim() : '', // aliases (optional)
    input.relationship_category ? String(input.relationship_category).trim() : '', // relationship_category (optional)
    input.privacy_level ? String(input.privacy_level).trim() : '', // privacy_level (optional)
    input.notes ? String(input.notes).trim() : '' // notes (optional)
  ];
  
  sheet.appendRow(row);
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
  const createdAtIdx = headerRow.indexOf('created_at');
  const aliasesIdx = headerRow.indexOf('aliases');
  const relationshipCategoryIdx = headerRow.indexOf('relationship_category');
  const privacyLevelIdx = headerRow.indexOf('privacy_level');
  const notesIdx = headerRow.indexOf('notes');
  
  if (idIdx === -1 || displayNameIdx === -1) {
    return [];
  }
  
  const people = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    people.push({
      person_id: row[idIdx],
      display_name: displayNameIdx >= 0 ? row[displayNameIdx] : '',
      created_at: createdAtIdx >= 0 ? row[createdAtIdx] : null,
      aliases: aliasesIdx >= 0 ? (row[aliasesIdx] ? String(row[aliasesIdx]).trim() : '') : '',
      relationship_category: relationshipCategoryIdx >= 0 ? (row[relationshipCategoryIdx] ? String(row[relationshipCategoryIdx]).trim() : '') : '',
      privacy_level: privacyLevelIdx >= 0 ? (row[privacyLevelIdx] ? String(row[privacyLevelIdx]).trim() : '') : '',
      notes: notesIdx >= 0 ? (row[notesIdx] ? String(row[notesIdx]).trim() : '') : ''
    });
  }
  
  return people;
}

function _getPersonById(person_id) {
  const people = _getPeople();
  for (let i = 0; i < people.length; i++) {
    if (String(people[i].person_id).trim() === String(person_id).trim()) {
      return people[i];
    }
  }
  return null;
}

// ================== FACTS ==================
// Public entry point: addFact()
// Manual writes only. No inference. No auto-linking.
// Facts are atomic, attributable, non-strategic.
function addFact(input) {
  if (!input) {
    throw new Error('Input is required');
  }
  
  if (!input.subject_type || !input.subject_type.trim()) {
    throw new Error('subject_type is required');
  }
  
  const validSubjectTypes = ['person', 'organization', 'self'];
  if (validSubjectTypes.indexOf(String(input.subject_type).trim()) === -1) {
    throw new Error('subject_type must be: person, organization, or self');
  }
  
  if (!input.subject_id || !input.subject_id.trim()) {
    throw new Error('subject_id is required');
  }
  
  if (!input.predicate || !input.predicate.trim()) {
    throw new Error('predicate is required');
  }
  
  if (!input.object || !input.object.trim()) {
    throw new Error('object is required');
  }
  
  if (!input.source || !input.source.trim()) {
    throw new Error('source is required');
  }
  
  const sheet = _getOrCreateSheet(CONTEXT_MEMORY_TAB_FACTS);
  _initFactsSheet();
  
  const factId = _generateFactId();
  const now = new Date();
  
  const row = [
    factId, // fact_id (required)
    String(input.subject_type).trim(), // subject_type (required)
    String(input.subject_id).trim(), // subject_id (required)
    String(input.predicate).trim(), // predicate (required)
    String(input.object).trim(), // object (required)
    String(input.source).trim(), // source (required)
    now, // created_at (required)
    input.expires_at || '' // expires_at (optional)
  ];
  
  sheet.appendRow(row);
  return factId;
}

function _getActiveFacts(subject_id, subject_type) {
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
  const subjectTypeIdx = headerRow.indexOf('subject_type');
  const subjectIdIdx = headerRow.indexOf('subject_id');
  const personIdIdx = headerRow.indexOf('person_id'); // Legacy support
  const predicateIdx = headerRow.indexOf('predicate');
  const objectIdx = headerRow.indexOf('object');
  const sourceIdx = headerRow.indexOf('source');
  const createdIdx = headerRow.indexOf('created_at');
  const expiresIdx = headerRow.indexOf('expires_at');
  
  if (idIdx === -1) {
    return [];
  }
  
  const facts = [];
  const now = new Date();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    // Support both v1.0 (subject_id) and legacy (person_id) schemas
    const factSubjectId = subjectIdIdx >= 0 ? String(row[subjectIdIdx] || '').trim() : 
                          (personIdIdx >= 0 ? String(row[personIdIdx] || '').trim() : '');
    const factSubjectType = subjectTypeIdx >= 0 ? String(row[subjectTypeIdx] || '').trim() : 'person';
    
    // Filter by subject_id if provided
    if (subject_id && factSubjectId !== String(subject_id).trim()) {
      continue;
    }
    
    // Filter by subject_type if provided
    if (subject_type && factSubjectType !== String(subject_type).trim()) {
      continue;
    }
    
    // Exclude expired facts (read-time filtering only)
    const expiresAt = expiresIdx >= 0 ? row[expiresIdx] : null;
    if (expiresAt && expiresAt instanceof Date && expiresAt < now) {
      continue;
    }
    
    facts.push({
      fact_id: row[idIdx],
      subject_type: factSubjectType,
      subject_id: factSubjectId,
      person_id: factSubjectId, // Legacy compatibility
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
// Public entry point: addInteraction()
// Manual writes only. No inference. No auto-linking.
// Interactions are occurrence records only.
// follow_up_hint is descriptive only and does not imply action.
function addInteraction(input) {
  if (!input) {
    throw new Error('Input is required');
  }
  
  if (!input.person_id || !input.person_id.trim()) {
    throw new Error('person_id is required');
  }
  
  if (!input.occurred_at || !(input.occurred_at instanceof Date)) {
    throw new Error('occurred_at is required and must be a Date');
  }
  
  const sheet = _getOrCreateSheet(CONTEXT_MEMORY_TAB_INTERACTIONS);
  _initInteractionsSheet();
  
  const data = sheet.getDataRange().getValues();
  const headerRow = data[0];
  const schemaVersion = _detectInteractionsSchemaVersion(headerRow);
  
  if (!schemaVersion) {
    throw new Error('INTERACTIONS sheet schema is invalid. Cannot add interaction.');
  }
  
  const interactionId = _generateInteractionId();
  
  const row = [
    interactionId, // interaction_id (required)
    String(input.person_id).trim(), // person_id (required)
    input.occurred_at, // occurred_at (required)
    input.topic_tags ? String(input.topic_tags).trim() : '', // topic_tags (optional)
    input.notes ? String(input.notes).trim() : '' // notes (optional)
  ];
  
  if (schemaVersion === 'v1.1') {
    row.push(input.notes_audio ? String(input.notes_audio).trim() : ''); // notes_audio (optional)
    
    // follow_up_hint (optional, boolean)
    if (input.follow_up_hint === true || input.follow_up_hint === 'TRUE' || input.follow_up_hint === 'true') {
      row.push(true);
    } else {
      row.push(false);
    }
    
    row.push(input.follow_up_note ? String(input.follow_up_note).trim() : ''); // follow_up_note (optional)
  } else if (schemaVersion === 'v1.0') {
    // Block v1.1 fields from being written to v1.0 schema
    if (input.notes_audio || input.follow_up_hint || input.follow_up_note) {
      throw new Error('Cannot write v1.1 fields to v1.0 schema. Run migrateInteractionsToV1_1() first.');
    }
  }
  
  sheet.appendRow(row);
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
      topic_tags: topicTagsIdx >= 0 ? (row[topicTagsIdx] ? String(row[topicTagsIdx]).trim() : '') : '',
      notes: notesIdx >= 0 ? (row[notesIdx] ? String(row[notesIdx]).trim() : '') : ''
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
  Logger.log('--- CONTEXT MEMORY SELF TEST START ---');
  
  _initContextSheets();
  
  // Count PEOPLE rows
  const peopleSheet = _getSheet(CONTEXT_MEMORY_TAB_PEOPLE);
  let peopleCount = 0;
  if (peopleSheet) {
    const peopleData = peopleSheet.getDataRange().getValues();
    peopleCount = Math.max(0, peopleData.length - 1);
  }
  
  // Count FACTS rows
  const factsSheet = _getSheet(CONTEXT_MEMORY_TAB_FACTS);
  let factsCount = 0;
  if (factsSheet) {
    const factsData = factsSheet.getDataRange().getValues();
    factsCount = Math.max(0, factsData.length - 1);
  }
  
  // Count INTERACTIONS rows
  const interactionsSheet = _getSheet(CONTEXT_MEMORY_TAB_INTERACTIONS);
  let interactionsCount = 0;
  if (interactionsSheet) {
    const interactionsData = interactionsSheet.getDataRange().getValues();
    interactionsCount = Math.max(0, interactionsData.length - 1);
  }
  
  Logger.log('Row counts:');
  Logger.log('  PEOPLE: ' + peopleCount);
  Logger.log('  FACTS: ' + factsCount);
  Logger.log('  INTERACTIONS: ' + interactionsCount);
  
  Logger.log('--- CONTEXT MEMORY SELF TEST END ---');
}

// ================== SCHEMA VALIDATION ==================
// Fail hard on schema mismatch. Support backward-compatible versions.
function _validatePeopleSchema(headerRow) {
  if (!headerRow || headerRow.length === 0) {
    throw new Error('PEOPLE schema validation failed: empty header row');
  }
  
  const actual = headerRow.map(h => String(h || '').trim());
  
  // Required fields for v1.0
  const required = ['person_id', 'display_name', 'created_at'];
  for (let i = 0; i < required.length; i++) {
    if (actual.indexOf(required[i]) === -1) {
      throw new Error('PEOPLE schema mismatch: missing required field "' + required[i] + '"');
    }
  }
  
  // Support backward compatibility with legacy schema
  const legacySchema = ['person_id', 'display_name', 'privacy_level', 'created_at', 'notes'];
  if (actual.length === legacySchema.length) {
    let matches = true;
    for (let i = 0; i < legacySchema.length; i++) {
      if (actual[i] !== legacySchema[i]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      return; // Legacy schema is acceptable
    }
  }
  
  // If we get here and it's not the v1.0 schema, it's still valid if it has required fields
  // (allows for future optional fields to be added)
}

function _validateFactsSchema(headerRow) {
  if (!headerRow || headerRow.length === 0) {
    throw new Error('FACTS schema validation failed: empty header row');
  }
  
  const actual = headerRow.map(h => String(h || '').trim());
  
  // Required fields for v1.0
  const required = ['fact_id', 'subject_type', 'subject_id', 'predicate', 'object', 'source', 'created_at'];
  for (let i = 0; i < required.length; i++) {
    if (actual.indexOf(required[i]) === -1) {
      // Support legacy schema with person_id instead of subject_id/subject_type
      if (required[i] === 'subject_type' || required[i] === 'subject_id') {
        if (actual.indexOf('person_id') === -1) {
          throw new Error('FACTS schema mismatch: missing required field "' + required[i] + '" or legacy "person_id"');
        }
      } else {
        throw new Error('FACTS schema mismatch: missing required field "' + required[i] + '"');
      }
    }
  }
  
  // Support backward compatibility with legacy schema
  const legacySchema = ['fact_id', 'person_id', 'predicate', 'object', 'source', 'created_at', 'expires_at'];
  if (actual.length === legacySchema.length) {
    let matches = true;
    for (let i = 0; i < legacySchema.length; i++) {
      if (actual[i] !== legacySchema[i]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      return; // Legacy schema is acceptable
    }
  }
  
  // If we get here and it's not the v1.0 schema, it's still valid if it has required fields
  // (allows for future optional fields to be added)
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
