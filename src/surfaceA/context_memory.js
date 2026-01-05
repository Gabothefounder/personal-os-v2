// TEMP EXECUTION GUARD — REMOVE AFTER VALIDATION
const CONTEXT_MEMORY_GUARD = true;

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
 ************************************************************/

// ================== TAB NAMES ==================
const CONTEXT_MEMORY_TAB_PEOPLE = 'PEOPLE';
const CONTEXT_MEMORY_TAB_FACTS = 'FACTS';
const CONTEXT_MEMORY_TAB_INTERACTIONS = 'INTERACTIONS';

// ================== PEOPLE ==================
function initializePeople() {
  if (CONTEXT_MEMORY_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  const sheet = getOrCreateSheet(CONTEXT_MEMORY_TAB_PEOPLE);
  
  const data = sheet.getDataRange().getValues();
  if (data.length > 0 && data[0][0] === 'person_id') {
    Logger.log('PEOPLE already initialized');
    return;
  }

  const header = [
    'person_id',
    'name',
    'created_at',
    'updated_at'
  ];

  sheet.clearContents();
  sheet.getRange(1, 1, 1, header.length).setValues([header]);
  
  Logger.log('PEOPLE initialized');
}

function addPerson(name) {
  if (CONTEXT_MEMORY_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  if (!name || !name.trim()) {
    throw new Error('Name is required');
  }

  const sheet = getOrCreateSheet(CONTEXT_MEMORY_TAB_PEOPLE);
  initializePeople();

  const personId = generatePersonId();
  const now = new Date();

  const row = [
    personId,
    name.trim(),
    now,
    now
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
  const nameIdx = headerRow.indexOf('name');
  const createdIdx = headerRow.indexOf('created_at');
  const updatedIdx = headerRow.indexOf('updated_at');

  const people = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    people.push({
      person_id: row[idIdx],
      name: row[nameIdx],
      created_at: row[createdIdx],
      updated_at: row[updatedIdx]
    });
  }

  return people;
}

// ================== FACTS ==================
function initializeFacts() {
  if (CONTEXT_MEMORY_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  const sheet = getOrCreateSheet(CONTEXT_MEMORY_TAB_FACTS);
  
  const data = sheet.getDataRange().getValues();
  if (data.length > 0 && data[0][0] === 'fact_id') {
    Logger.log('FACTS already initialized');
    return;
  }

  const header = [
    'fact_id',
    'person_id',
    'predicate',
    'object',
    'source',
    'expires_at',
    'created_at'
  ];

  sheet.clearContents();
  sheet.getRange(1, 1, 1, header.length).setValues([header]);
  
  Logger.log('FACTS initialized');
}

function addFact(personId, predicate, object, source, expiresAt) {
  if (CONTEXT_MEMORY_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  if (!personId || !personId.trim()) {
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

  const sheet = getOrCreateSheet(CONTEXT_MEMORY_TAB_FACTS);
  initializeFacts();

  const factId = generateFactId();
  const now = new Date();

  const row = [
    factId,
    personId.trim(),
    predicate.trim(),
    object.trim(),
    source.trim(),
    expiresAt || '',
    now
  ];

  sheet.appendRow(row);
  
  Logger.log('Added fact: ' + factId);
  return factId;
}

function getFacts(personId) {
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
  const expiresIdx = headerRow.indexOf('expires_at');
  const createdIdx = headerRow.indexOf('created_at');

  const facts = [];
  const now = new Date();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const factPersonId = row[personIdx];
    const expiresAt = row[expiresIdx];

    // Filter by person_id if provided
    if (personId && factPersonId !== personId) {
      continue;
    }

    // Skip expired facts
    if (expiresAt && expiresAt instanceof Date && expiresAt < now) {
      continue;
    }

    facts.push({
      fact_id: row[idIdx],
      person_id: factPersonId,
      predicate: row[predicateIdx],
      object: row[objectIdx],
      source: row[sourceIdx],
      expires_at: expiresAt || null,
      created_at: row[createdIdx]
    });
  }

  return facts;
}

// ================== INTERACTIONS ==================
function initializeInteractions() {
  if (CONTEXT_MEMORY_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  const sheet = getOrCreateSheet(CONTEXT_MEMORY_TAB_INTERACTIONS);
  
  const data = sheet.getDataRange().getValues();
  if (data.length > 0 && data[0][0] === 'interaction_id') {
    Logger.log('INTERACTIONS already initialized');
    return;
  }

  const header = [
    'interaction_id',
    'person_id',
    'date',
    'summary',
    'source',
    'created_at'
  ];

  sheet.clearContents();
  sheet.getRange(1, 1, 1, header.length).setValues([header]);
  
  Logger.log('INTERACTIONS initialized');
}

function addInteraction(personId, date, summary, source) {
  if (CONTEXT_MEMORY_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  if (!personId || !personId.trim()) {
    throw new Error('person_id is required');
  }

  if (!date || !(date instanceof Date)) {
    throw new Error('date is required and must be a Date');
  }

  if (!summary || !summary.trim()) {
    throw new Error('summary is required');
  }

  if (!source || !source.trim()) {
    throw new Error('source is required');
  }

  const sheet = getOrCreateSheet(CONTEXT_MEMORY_TAB_INTERACTIONS);
  initializeInteractions();

  const interactionId = generateInteractionId();
  const now = new Date();

  const row = [
    interactionId,
    personId.trim(),
    date,
    summary.trim(),
    source.trim(),
    now
  ];

  sheet.appendRow(row);
  
  Logger.log('Added interaction: ' + interactionId);
  return interactionId;
}

function getInteractions(personId) {
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
  const dateIdx = headerRow.indexOf('date');
  const summaryIdx = headerRow.indexOf('summary');
  const sourceIdx = headerRow.indexOf('source');
  const createdIdx = headerRow.indexOf('created_at');

  const interactions = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const interactionPersonId = row[personIdx];

    // Filter by person_id if provided
    if (personId && interactionPersonId !== personId) {
      continue;
    }

    interactions.push({
      interaction_id: row[idIdx],
      person_id: interactionPersonId,
      date: row[dateIdx],
      summary: row[summaryIdx],
      source: row[sourceIdx],
      created_at: row[createdIdx]
    });
  }

  // Sort by date descending (most recent first)
  interactions.sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date.getTime() : 0;
    const dateB = b.date instanceof Date ? b.date.getTime() : 0;
    return dateB - dateA;
  });

  return interactions;
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
