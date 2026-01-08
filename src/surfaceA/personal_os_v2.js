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
