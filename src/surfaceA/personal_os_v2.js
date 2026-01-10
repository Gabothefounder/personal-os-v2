/************************************************************
 * Personal OS v2 — Shared Utilities
 *
 * Purpose:
 * - Shared helper functions for all modules
 * - No module-specific logic
 ************************************************************/

// ================== TAB NAMES ==================
const SURFACEA_TAB_RAW = 'RAW';

// ================== SHARED SHEET HELPERS ==================
function _getSheet(name) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(name);
  return sheet;
}

function _getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(name);
  
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  
  return sheet;
}

function _getSheetOrFail(name) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(name);

  if (!sheet) {
    throw new Error('Missing required tab: ' + name);
  }

  return sheet;
}

// ================== RAW INGESTION ==================
const RAW_MAX_CHARS = 800;

function _truncateRawNote(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  if (text.length <= RAW_MAX_CHARS) {
    return text;
  }
  
  return text.substring(0, RAW_MAX_CHARS) + '…';
}

function appendRawNote(text) {
  const processedText = _truncateRawNote(text);
  const sheet = _getOrCreateSheet(SURFACEA_TAB_RAW);
  
  // Check if sheet has headers
  const data = sheet.getDataRange().getValues();
  if (data.length === 0 || (data.length === 1 && data[0][0] !== 'timestamp')) {
    // Write headers if sheet is empty or missing headers
    sheet.getRange(1, 1, 1, 2).setValues([['timestamp', 'note']]);
  }
  
  // Append row with timestamp and processed note
  const now = new Date();
  sheet.appendRow([now, processedText]);
}

function createRawEntry(text) {
  if (!text || typeof text !== 'string') {
    return;
  }
  
  const trimmedText = text.trim();
  if (trimmedText.length === 0) {
    return;
  }
  
  const sheet = _getOrCreateSheet(SURFACEA_TAB_RAW);
  
  // Check if sheet has headers
  const data = sheet.getDataRange().getValues();
  if (data.length === 0 || (data.length === 1 && data[0][0] !== 'timestamp')) {
    // Write headers if sheet is empty or missing headers
    sheet.getRange(1, 1, 1, 2).setValues([['timestamp', 'note']]);
  }
  
  // Append row with timestamp and trimmed note
  const now = new Date();
  sheet.appendRow([now, trimmedText]);
}

// ================== SURFACE B HELPERS ==================
function _readConfirmedSpeakable() {
  try {
    // Call _listConfirmedSpeakable from decided_ledger.js
    if (typeof _listConfirmedSpeakable === 'function') {
      return _listConfirmedSpeakable();
    }
  } catch (e) {
    Logger.log('Could not read DECIDED items: ' + e.message);
  }
  return [];
}

// ================== JSON API ==================
// Pure JSON API backend - no UI
// Routes by e.parameter.action for GET requests
// Routes by JSON body.action for POST requests

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  try {
    // Parse action from GET parameters or POST body
    let action;
    let params = {};
    
    if (method === 'GET') {
      if (!e || !e.parameter) {
        return createResponse({ success: false, error: 'Invalid request' }, 400);
      }
      action = e.parameter.action;
      params = e.parameter;
    } else {
      // POST: parse JSON body
      if (!e || !e.postData || !e.postData.contents) {
        return createResponse({ success: false, error: 'Missing POST data' }, 400);
      }
      
      try {
        const postData = JSON.parse(e.postData.contents);
        action = postData.action;
        params = postData;
      } catch (parseError) {
        return createResponse({ success: false, error: 'Invalid JSON in request body' }, 400);
      }
    }
    
    if (!action) {
      return createResponse({ success: false, error: 'Missing action parameter' }, 400);
    }
    
    // Route to appropriate handler
    let result;
    switch (action) {
      case 'createRaw':
        result = handleCreateRaw(params.text);
        break;
      case 'createInbox':
        result = handleCreateInbox(params.text);
        break;
      case 'createPerson':
        result = handleCreatePerson(params.name, params.privacy, params.notes);
        break;
      case 'listPeople':
        result = handleListPeople();
        break;
      case 'createInteraction':
        result = handleCreateInteraction(params.personId, params.notes);
        break;
      default:
        return createResponse({ success: false, error: 'Unknown action: ' + action }, 400);
    }
    
    return createResponse(result, 200);
    
  } catch (error) {
    Logger.log('API Error: ' + error.message);
    return createResponse({ 
      success: false, 
      error: error.message || 'Internal server error' 
    }, 500);
  }
}

function createResponse(data, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Note: Google Apps Script Web Apps automatically allow CORS when deployed with:
  // - Execute as: Me
  // - Who has access: Anyone
  // For custom CORS headers, use a proxy or handle in frontend
  
  return output;
}

// ================== API HANDLERS ==================

function handleCreateRaw(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new Error('text parameter is required');
  }
  
  try {
    createRawEntry(text);
    return { success: true, message: 'RAW entry created' };
  } catch (error) {
    throw new Error('Failed to create RAW entry: ' + error.message);
  }
}

function handleCreateInbox(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new Error('text parameter is required');
  }
  
  try {
    const inboxId = createInboxItem(text);
    return { success: true, message: 'Inbox item created', id: inboxId };
  } catch (error) {
    throw new Error('Failed to create inbox item: ' + error.message);
  }
}

function handleCreatePerson(name, privacy, notes) {
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new Error('name parameter is required');
  }
  
  try {
    const personId = createPerson(name, privacy, notes);
    return { success: true, message: 'Person created', id: personId };
  } catch (error) {
    throw new Error('Failed to create person: ' + error.message);
  }
}

function handleListPeople() {
  try {
    const people = listPeople();
    return { success: true, data: people };
  } catch (error) {
    throw new Error('Failed to list people: ' + error.message);
  }
}

function handleCreateInteraction(personId, notes) {
  if (!personId || typeof personId !== 'string' || !personId.trim()) {
    throw new Error('personId parameter is required');
  }
  
  try {
    // createInteraction(personId, notes, followUpHint, followUpNote)
    // For API, we default followUpHint to false and followUpNote to empty
    const interactionId = createInteraction(personId, notes || '', false, '');
    return { success: true, message: 'Interaction created', id: interactionId };
  } catch (error) {
    throw new Error('Failed to create interaction: ' + error.message);
  }
}
