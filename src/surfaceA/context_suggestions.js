// TEMP EXECUTION GUARD — REMOVE AFTER VALIDATION
const CONTEXT_SUGGESTIONS_GUARD = true;

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
 * - Allowed: "Create a task to follow up with [Name]?"
 * - Forbidden: "This is important", "You should reach out"
 ************************************************************/

// ================== TAB NAMES ==================
const CONTEXT_SUGGESTIONS_TAB_PEOPLE = 'PEOPLE';
const CONTEXT_SUGGESTIONS_TAB_INTERACTIONS = 'INTERACTIONS';
const CONTEXT_SUGGESTIONS_TAB_SUGGESTIONS = 'CONTEXT_SUGGESTIONS';

// ================== ENTRY POINT ==================
function generateContextSuggestions() {
  if (CONTEXT_SUGGESTIONS_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  Logger.log('--- CONTEXT SUGGESTIONS START ---');

  const suggestions = findFollowUpOpportunities();

  if (suggestions.length === 0) {
    Logger.log('No suggestions found. Silence is valid output.');
    writeSuggestions([]);
    return;
  }

  writeSuggestions(suggestions);
  Logger.log('--- CONTEXT SUGGESTIONS END ---');
}

// ================== SUGGESTION LOGIC ==================
function findFollowUpOpportunities() {
  const people = getPeople();
  const interactions = getAllInteractions();
  const suggestions = [];

  // Group interactions by person
  const interactionsByPerson = new Map();
  for (const interaction of interactions) {
    if (!interactionsByPerson.has(interaction.person_id)) {
      interactionsByPerson.set(interaction.person_id, []);
    }
    interactionsByPerson.get(interaction.person_id).push(interaction);
  }

  // Find people with recent interactions (last 30 days) but no follow-up
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  for (const person of people) {
    const personInteractions = interactionsByPerson.get(person.person_id) || [];
    
    if (personInteractions.length === 0) {
      continue;
    }

    // Find most recent interaction
    const mostRecent = personInteractions[0]; // Already sorted by date descending
    
    if (!mostRecent.date || !(mostRecent.date instanceof Date)) {
      continue;
    }

    // Check if interaction is within last 30 days
    if (mostRecent.date < thirtyDaysAgo) {
      continue;
    }

    // Check if there's already a task for this person (optional check)
    // We'll skip this check to keep it simple and non-coercive

    // Create suggestion
    suggestions.push({
      person_id: person.person_id,
      person_name: person.name,
      last_interaction_date: mostRecent.date,
      suggestion_text: 'Create a task to follow up with ' + person.name + '?'
    });
  }

  return suggestions;
}

// ================== READ CONTEXT ==================
function getPeople() {
  const sheet = getSheet(CONTEXT_SUGGESTIONS_TAB_PEOPLE);
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

  const people = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    people.push({
      person_id: row[idIdx],
      name: row[nameIdx]
    });
  }

  return people;
}

function getAllInteractions() {
  const sheet = getSheet(CONTEXT_SUGGESTIONS_TAB_INTERACTIONS);
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
    interactions.push({
      interaction_id: row[idIdx],
      person_id: row[personIdx],
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

// ================== WRITE OUTPUT ==================
function writeSuggestions(suggestions) {
  const sheet = getOrCreateSheet(CONTEXT_SUGGESTIONS_TAB_SUGGESTIONS);
  sheet.clearContents();

  if (suggestions.length === 0) {
    return;
  }

  // Write header
  const header = ['person_id', 'person_name', 'last_interaction_date', 'suggestion_text'];
  const rows = [header];

  // Write suggestion rows
  for (const suggestion of suggestions) {
    rows.push([
      suggestion.person_id,
      suggestion.person_name,
      suggestion.last_interaction_date,
      suggestion.suggestion_text
    ]);
  }

  sheet.getRange(1, 1, rows.length, header.length).setValues(rows);
}

// ================== DISMISS SUGGESTION ==================
function dismissSuggestion(personId) {
  if (CONTEXT_SUGGESTIONS_GUARD) {
    throw new Error("TEMP GUARD: Do not run yet");
  }
  const sheet = getOrCreateSheet(CONTEXT_SUGGESTIONS_TAB_SUGGESTIONS);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return false;
  }

  const headerRow = data[0];
  const personIdIdx = headerRow.indexOf('person_id');

  if (personIdIdx === -1) {
    return false;
  }

  // Find and remove the suggestion
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][personIdIdx] === personId) {
      sheet.deleteRow(i + 1); // +1 because sheet rows are 1-indexed
      Logger.log('Dismissed suggestion for person: ' + personId);
      return true;
    }
  }

  return false;
}

// ================== HELPERS ==================
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
