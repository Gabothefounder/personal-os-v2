// Surface B — Daily Read Model

/************************************************************
 * Surface B — Daily Brief Projection
 *
 * Purpose:
 * - Generate readable daily brief from multiple sources
 * - Read-only projection layer
 * - No decisions, no invitations, no pressure language
 *
 * Rules:
 * - READ ONLY (no writes to source sheets)
 * - Writes to DAILY_VIEW sheet only
 * - NO Gemini
 * - NO decisions
 * - NO invitations
 * - NO pressure language
 * - NO "should" language
 * - Silence is valid output
 ************************************************************/

// ================== TAB NAMES ==================
const SURFACEB_DAILY_TAB_SURFACE_A = 'SURFACE_A';
const SURFACEB_DAILY_TAB_DERIVED = 'DERIVED_SIGNALS';

// ================== ENTRY POINT ==================
function runSurfaceBDailyOnce() {
  Logger.log('--- SURFACE B DAILY BRIEF START ---');

  const surfaceA = _readTodaySurfaceA();
  const derivedSignals = _readActiveDerivedSignals();
  const decidedItems = _readConfirmedSpeakable();
  const openTasks = typeof listOpenTasks === 'function' ? listOpenTasks() : [];

  const dailyText = _composeDailyBrief(surfaceA, derivedSignals, decidedItems, openTasks);

  Logger.log('=== DAILY BRIEF ===');
  Logger.log(dailyText);
  Logger.log('=== END DAILY BRIEF ===');

  _writeDailyView(dailyText);

  _writeDailyVoiceBriefToDoc(dailyText);

  Logger.log('--- SURFACE B DAILY BRIEF END ---');
}

// ================== READ SOURCES ==================
// Surface A writes data as key/value vertical pairs:
// Column A: keys (generated_at, orientation, attention, context, framing, reflection, last_run_status, etc.)
// Column B: values
// Each run overwrites the previous entry, so we read the current key/value pairs.
function _readTodaySurfaceA() {
  const sheet = _getSheet(SURFACEB_DAILY_TAB_SURFACE_A);
  if (!sheet) {
    return null;
  }
  const data = sheet.getDataRange().getValues();

  if (data.length === 0) {
    return null;
  }

  // Build a map from keys (column A) to values (column B)
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

  // Check if this is a successful run
  const status = keyValueMap['last_run_status'];
  if (status !== 'SUCCESS') {
    return null;
  }

  // Extract fields - missing fields are skipped silently
  const entry = {
    generated_at: keyValueMap['generated_at'] || null,
    orientation: keyValueMap['orientation'] ? String(keyValueMap['orientation']).trim() : '',
    attention: keyValueMap['attention'] ? String(keyValueMap['attention']).trim() : '',
    context: keyValueMap['context'] ? String(keyValueMap['context']).trim() : '',
    framing: keyValueMap['framing'] ? String(keyValueMap['framing']).trim() : '',
    reflection: keyValueMap['reflection'] ? String(keyValueMap['reflection']).trim() : ''
  };

  // Return entry if we have at least generated_at (indicates valid Surface A data)
  if (entry.generated_at) {
    return entry;
  }

  return null;
}

function _readActiveDerivedSignals() {
  const sheet = getSheet(SURFACEB_DAILY_TAB_DERIVED);
  if (!sheet) {
    return [];
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
  const windowIdx = headerRow.indexOf('window');

  if (fieldIdx === -1 || patternKeyIdx === -1) {
    return [];
  }

  const signals = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const field = row[fieldIdx];
    const patternKey = row[patternKeyIdx];
    const count = row[countIdx];
    const window = row[windowIdx];

    if (field && patternKey) {
      signals.push({
        field: String(field).trim(),
        pattern_key: String(patternKey).trim(),
        count: count ? Number(count) : 0,
        window: window ? String(window).trim() : ''
      });
    }
  }

  return signals;
}


// ================== LANGUAGE DETECTION ==================
function _detectLanguage(surfaceA) {
  if (!surfaceA) {
    return 'en';
  }
  
  // Sample text from Surface A fields
  const sampleText = [
    surfaceA.orientation || '',
    surfaceA.attention || '',
    surfaceA.context || '',
    surfaceA.framing || '',
    surfaceA.reflection || ''
  ].join(' ').trim();
  
  if (!sampleText) {
    return 'en';
  }
  
  // Simple heuristic: check for French indicators
  const frenchIndicators = /\b(le|la|les|de|du|des|un|une|et|ou|dans|sur|avec|pour|par|est|sont|était|étaient|être|avoir|fait|faire)\b/i;
  const hasFrench = frenchIndicators.test(sampleText);
  
  // Check for French-specific characters/patterns
  const frenchChars = /[àâäéèêëïîôùûüÿç]/i;
  const hasFrenchChars = frenchChars.test(sampleText);
  
  if (hasFrench || hasFrenchChars) {
    return 'fr';
  }
  
  return 'en';
}

// ================== DATE FORMATTING ==================
function _formatDateHeader(dateValue, language) {
  if (!dateValue) {
    return language === 'fr' ? "Aujourd'hui" : 'Today';
  }

  let date;
  if (dateValue instanceof Date) {
    date = dateValue;
  } else {
    date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      return language === 'fr' ? "Aujourd'hui" : 'Today';
    }
  }

  const locale = language === 'fr' ? 'fr-FR' : 'en-US';
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(locale, options);
}

// ================== SECTION HEADERS ==================
function _getSectionHeaders(language) {
  if (language === 'fr') {
    return {
      operationalOrientation: 'Orientation Opérationnelle',
      attentionLoad: 'Attention et Charge',
      situationalContext: 'Contexte Situationnel',
      observations: 'Observations',
      operationalActions: 'Actions Opérationnelles en Attente',
      closingNote: 'Note de Clôture'
    };
  }
  
  return {
    operationalOrientation: 'Operational Orientation',
    attentionLoad: 'Attention & Load',
    situationalContext: 'Situational Context',
    observations: 'Observations',
    operationalActions: 'Operational Actions Outstanding',
    closingNote: 'Closing Note'
  };
}

// ================== WIT HELPERS ==================
function _addSubtleWit(surfaceA, openTasks, language, section) {
  // Maximum 1 witty line per brief, only in Observations or Closing Note
  // Wit must be dry, understated, observational, never distorting facts
  // Tone: observant, restrained, amused but professional, slightly teasing
  
  if (section !== 'observations' && section !== 'closing') {
    return '';
  }
  
  const taskCount = openTasks ? openTasks.length : 0;
  const hasPressure = surfaceA && surfaceA.attention && 
    /\b(pressure|stress|overwhelm|urgent|rush|busy|load|heavy|pression|charge|urgent|occupé)\b/i.test(surfaceA.attention);
  const hasActivity = surfaceA && (surfaceA.orientation || surfaceA.context);
  const hasPendingTasks = taskCount > 0;
  
  if (section === 'observations') {
    // One subtle remark allowed in Observations (dry, understated, observational)
    const observationsWit = language === 'fr' ? [
      'Rien d\'alarmant. Ce qui, dans ce contexte, mérite d\'être noté.',
      'Activité soutenue. Le rendement, quant à lui, se fait désirer.',
      'Les intentions sont claires. Leur exécution, moins ponctuelle.',
      'Progrès observés. Résultat attendu toujours en transit.',
      'La situation évolue. Pas nécessairement dans la direction prévue.'
    ] : [
      'Nothing alarming. Which, in this context, is worth noting.',
      'Activity sustained. Output, however, remains elusive.',
      'Intentions are clear. Their execution, less punctual.',
      'Progress observed. Expected results still in transit.',
      'The situation evolves. Not necessarily in the anticipated direction.'
    ];
    
    // Select based on context (deterministic)
    let index = 0;
    if (hasPendingTasks && hasActivity) {
      index = 2; // Execution vs intention
    } else if (hasPressure) {
      index = 1; // Activity vs output
    } else if (hasActivity) {
      index = 3; // Progress vs results
    } else {
      index = 0; // Nothing alarming
    }
    
    return observationsWit[index % observationsWit.length];
  }
  
  if (section === 'closing') {
    // Closing Note: one sentence, truthful, may contain restrained wit
    // Dry, understated, slightly teasing but never flippant
    const closingWit = language === 'fr' ? [
      'La pression est présente. Le levier semble apprécier le suspense.',
      'Clarté en formation. Exécution, quant à elle, prend son temps.',
      'Rien d\'irréparable. Rien de résolu.',
      'Les pièces sont en place. Le plateau, lui, reste à découvrir.',
      'La journée se déroulera comme elle se déroulera.',
      'Tout plutôt simple, plus ou moins.',
      'Progrès observés. Résultat attendu toujours en transit.',
      'La situation évolue. Pas nécessairement dans la direction prévue.'
    ] : [
      'Pressure is present. Leverage appears to appreciate the suspense.',
      'Clarity forming. Execution, however, takes its time.',
      'Nothing irreparable. Nothing resolved.',
      'The pieces are in place. The board, however, remains to be discovered.',
      'The day proceeds as it will.',
      'All rather straightforward, more or less.',
      'Progress observed. Expected results still in transit.',
      'The situation evolves. Not necessarily in the anticipated direction.'
    ];
    
    // Select based on context (deterministic)
    let index = 0;
    if (hasPendingTasks && hasPressure) {
      index = 0; // Pressure and leverage
    } else if (hasActivity && hasPendingTasks) {
      index = 1; // Clarity vs execution
    } else if (hasPendingTasks) {
      index = 3; // Pieces in place
    } else if (hasActivity) {
      index = 6; // Progress observed
    } else {
      index = 2; // Nothing irreparable
    }
    
    return closingWit[index % closingWit.length];
  }
  
  return '';
}

// ================== REWRITING HELPERS ==================
function _isCompleteSentence(text) {
  if (!text || !text.trim()) {
    return false;
  }
  
  const trimmed = String(text).trim();
  
  // Must end with punctuation
  if (!/[.!?]$/.test(trimmed)) {
    return false;
  }
  
  // Must have at least a subject and verb (heuristic: at least 3 words)
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  if (words.length < 3) {
    return false;
  }
  
  // Must not be obviously truncated (no trailing ellipsis, no "and" at end)
  if (trimmed.endsWith('...') || trimmed.endsWith('…')) {
    return false;
  }
  
  return true;
}

function _extractCompleteSentences(text) {
  if (!text || !text.trim()) {
    return [];
  }
  
  const fullText = String(text).trim();
  
  // Split by sentence endings
  const parts = fullText.split(/([.!?]+)/);
  const sentences = [];
  let current = '';
  
  for (let i = 0; i < parts.length; i++) {
    current += parts[i];
    if (/[.!?]+/.test(parts[i])) {
      const sentence = current.trim();
      if (_isCompleteSentence(sentence)) {
        sentences.push(sentence);
      }
      current = '';
    }
  }
  
  // If there's remaining text that looks complete, include it
  if (current.trim() && _isCompleteSentence(current.trim())) {
    sentences.push(current.trim());
  }
  
  return sentences;
}

function _removeRepetition(sentences) {
  if (!sentences || sentences.length === 0) {
    return [];
  }
  
  const seen = new Set();
  const unique = [];
  
  for (const sentence of sentences) {
    // Normalize for comparison (lowercase, remove extra spaces)
    const normalized = sentence.toLowerCase().replace(/\s+/g, ' ').trim();
    
    // Skip if too similar to something we've seen (simple heuristic)
    let isDuplicate = false;
    for (const seenNormalized of seen) {
      // If sentences share more than 70% of words, consider duplicate
      const words1 = normalized.split(/\s+/);
      const words2 = seenNormalized.split(/\s+/);
      const commonWords = words1.filter(w => words2.includes(w));
      const similarity = commonWords.length / Math.max(words1.length, words2.length);
      
      if (similarity > 0.7) {
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      seen.add(normalized);
      unique.push(sentence);
    }
  }
  
  return unique;
}

function _rewriteWithAuthority(sentences, maxSentences, language) {
  if (!sentences || sentences.length === 0) {
    return '';
  }
  
  // Remove repetition
  const unique = _removeRepetition(sentences);
  
  // Limit count
  const limited = unique.slice(0, maxSentences);
  
  // Clean each sentence
  const cleaned = limited.map(s => _makeDry(s)).filter(Boolean);
  
  // Merge if needed (for orientation section)
  if (cleaned.length === 0) {
    return '';
  }
  
  // LANGUAGE LOCK: Ensure output matches detected language
  // (Surface A should already be in correct language, but verify)
  return cleaned.join(' ');
}

function _makeDry(text) {
  if (!text || !text.trim()) {
    return text;
  }
  
  let dry = String(text).trim();
  
  // Remove forbidden phrases
  dry = dry.replace(/\byou should\b/gi, '');
  dry = dry.replace(/\bit would be good to\b/gi, '');
  dry = dry.replace(/\bthis suggests\b/gi, '');
  dry = dry.replace(/\bencouraging\b/gi, '');
  dry = dry.replace(/\bpositive\b/gi, '');
  dry = dry.replace(/\bgrowth\b/gi, '');
  dry = dry.replace(/\bjourney\b/gi, '');
  dry = dry.replace(/\breflection\b/gi, '');
  dry = dry.replace(/\btake time\b/gi, '');
  dry = dry.replace(/\bremember to\b/gi, '');
  
  // Remove hedging
  dry = dry.replace(/\bappears to be\b/gi, 'is');
  dry = dry.replace(/\bseems to be\b/gi, 'is');
  dry = dry.replace(/\bappears\b/gi, 'is');
  
  // Tighten phrasing
  dry = dry.replace(/\bin order to\b/gi, 'to');
  dry = dry.replace(/\bfor the purpose of\b/gi, 'to');
  dry = dry.replace(/\bwith regard to\b/gi, 'regarding');
  dry = dry.replace(/\bwith respect to\b/gi, 'regarding');
  
  // Clean up spaces
  dry = dry.replace(/\s+/g, ' ').trim();
  
  return dry;
}

function _groupTasksByType(tasks) {
  if (!tasks || tasks.length === 0) {
    return { domestic: [], operational: [], system: [], other: [] };
  }
  
  const groups = { domestic: [], operational: [], system: [], other: [] };
  
  for (const task of tasks) {
    const content = task.content ? String(task.content).toLowerCase() : '';
    
    // Simple keyword-based grouping
    if (/\b(house|home|domestic|maintenance|clean|repair|grocery|shopping|laundry|kitchen|bathroom)\b/.test(content)) {
      groups.domestic.push(task);
    } else if (/\b(system|server|code|deploy|config|database|api|script|technical|infrastructure)\b/.test(content)) {
      groups.system.push(task);
    } else if (/\b(work|meeting|project|client|business|email|call|report|deadline)\b/.test(content)) {
      groups.operational.push(task);
    } else {
      groups.other.push(task);
    }
  }
  
  return groups;
}

function _cleanTaskContent(content) {
  if (!content || !content.trim()) {
    return '';
  }
  
  let cleaned = String(content).trim();
  
  // Fix common grammar issues
  cleaned = cleaned.replace(/^\s*[-•*]\s*/, ''); // Remove leading bullets
  cleaned = cleaned.replace(/\s+/g, ' '); // Normalize spaces
  
  // Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  // Ensure ends with punctuation
  if (cleaned.length > 0 && !/[.!?]$/.test(cleaned)) {
    cleaned += '.';
  }
  
  return cleaned;
}

// ================== COMPOSE BRIEF ==================
function _composeDailyBrief(surfaceA, derivedSignals, decidedItems, openTasks) {
  const lines = [];
  
  // LANGUAGE LOCK (CRITICAL): Detect language from Surface A
  const language = _detectLanguage(surfaceA);
  const headers = _getSectionHeaders(language);

  // Header: Date only (in detected language)
  let dateHeader = language === 'fr' ? "Aujourd'hui" : 'Today';
  if (surfaceA && surfaceA.generated_at) {
    dateHeader = _formatDateHeader(surfaceA.generated_at, language);
  }
  lines.push(dateHeader);
  lines.push('');

  // Operational Orientation
  // Tone: Calm briefing tone. One light remark allowed (understatement, raised eyebrow energy).
  if (surfaceA) {
    const orientationText = surfaceA.orientation ? String(surfaceA.orientation).trim() : '';
    const framingText = surfaceA.framing ? String(surfaceA.framing).trim() : '';
    
    if (orientationText || framingText) {
      const combined = [orientationText, framingText].filter(Boolean).join(' ');
      const sentences = _extractCompleteSentences(combined);
      const rewritten = _rewriteWithAuthority(sentences, 2, language);
      
      if (rewritten && rewritten.trim()) {
        lines.push(headers.operationalOrientation);
        lines.push('');
        lines.push(rewritten);
        lines.push('');
      }
    }
  }

  // Attention & Load
  // Tone: Slight irony allowed if pressure is evident. No jokes about exhaustion or failure.
  if (surfaceA) {
    const attentionText = surfaceA.attention ? String(surfaceA.attention).trim() : '';
    if (attentionText) {
      const sentences = _extractCompleteSentences(attentionText);
      const rewritten = _rewriteWithAuthority(sentences, 1, language);
      
      if (rewritten && rewritten.trim()) {
        lines.push(headers.attentionLoad);
        lines.push('');
        lines.push(rewritten);
        lines.push('');
      }
    }
  }

  // Situational Context
  // Tone: Strictly factual. Humor optional, very light.
  if (surfaceA) {
    const contextText = surfaceA.context ? String(surfaceA.context).trim() : '';
    if (contextText) {
      const sentences = _extractCompleteSentences(contextText);
      const rewritten = _rewriteWithAuthority(sentences, 2, language);
      
      if (rewritten && rewritten.trim()) {
        lines.push(headers.situationalContext);
        lines.push('');
        lines.push(rewritten);
        lines.push('');
      }
    }
  }

  // Observations
  // Tone: This is where Money-Penny lives most naturally. Wry phrasing encouraged, but still factual.
  // Optional subtle wit allowed here (maximum 1 line).
  if (surfaceA) {
    const reflectionText = surfaceA.reflection ? String(surfaceA.reflection).trim() : '';
    const hasReflection = reflectionText && _extractCompleteSentences(reflectionText).length > 0;
    
    // Always include Observations section if there's any content or context
    const hasAnyContent = hasReflection || (surfaceA.orientation || surfaceA.attention || surfaceA.context);
    
    if (hasAnyContent) {
      lines.push(headers.observations);
      lines.push('');
      
      if (hasReflection) {
        const sentences = _extractCompleteSentences(reflectionText);
        const rewritten = _rewriteWithAuthority(sentences, 1, language);
        if (rewritten && rewritten.trim()) {
          lines.push(rewritten);
        }
      }
      
      // Add subtle wit (dry, understated, observational)
      // Only if we have enough context to make it meaningful
      // Maximum 1 witty line per brief - use in Observations OR Closing Note, not both
      if (hasAnyContent && !hasReflection) {
        // If no reflection content, use wit as the observation
        const wit = _addSubtleWit(surfaceA, openTasks, language, 'observations');
        if (wit) {
          lines.push(wit);
        }
      }
      
      lines.push('');
    }
  }

  // Operational Actions Outstanding
  if (openTasks && openTasks.length > 0) {
    const grouped = _groupTasksByType(openTasks);
    const hasAnyTasks = grouped.domestic.length > 0 || grouped.operational.length > 0 || 
                        grouped.system.length > 0 || grouped.other.length > 0;
    
    if (hasAnyTasks) {
      lines.push(headers.operationalActions);
      lines.push('');
      
      // Remove duplicates by content
      const seenContent = new Set();
      const uniqueTasks = [];
      for (const task of openTasks) {
        const content = task.content ? String(task.content).trim().toLowerCase() : '';
        if (content && !seenContent.has(content)) {
          seenContent.add(content);
          uniqueTasks.push(task);
        }
      }
      
      // Group and format
      const uniqueGrouped = _groupTasksByType(uniqueTasks);
      
      // Operational Actions Outstanding
      // Tone: Clear, explicit, no jokes inside task text. A single dry remark may appear before or after the list.
      if (uniqueGrouped.domestic.length > 0) {
        const remark = language === 'fr' 
          ? 'Maintenance domestique en attente.'
          : 'Domestic maintenance remains pending.';
        lines.push(remark);
        for (const task of uniqueGrouped.domestic) {
          const cleaned = _cleanTaskContent(task.content);
          if (cleaned) {
            lines.push('— ' + cleaned);
          }
        }
        lines.push('');
      }
      
      if (uniqueGrouped.operational.length > 0) {
        if (uniqueGrouped.domestic.length === 0) {
          const remark = language === 'fr'
            ? 'Éléments opérationnels nécessitant attention.'
            : 'Operational items require attention.';
          lines.push(remark);
        }
        for (const task of uniqueGrouped.operational) {
          const cleaned = _cleanTaskContent(task.content);
          if (cleaned) {
            lines.push('— ' + cleaned);
          }
        }
        lines.push('');
      }
      
      if (uniqueGrouped.system.length > 0) {
        if (uniqueGrouped.domestic.length === 0 && uniqueGrouped.operational.length === 0) {
          const remark = language === 'fr'
            ? 'Maintenance système en attente.'
            : 'System maintenance pending.';
          lines.push(remark);
        }
        for (const task of uniqueGrouped.system) {
          const cleaned = _cleanTaskContent(task.content);
          if (cleaned) {
            lines.push('— ' + cleaned);
          }
        }
        lines.push('');
      }
      
      if (uniqueGrouped.other.length > 0) {
        for (const task of uniqueGrouped.other) {
          const cleaned = _cleanTaskContent(task.content);
          if (cleaned) {
            lines.push('— ' + cleaned);
          }
        }
        lines.push('');
      }
    }
  }

  // Closing Note
  // Tone: One sentence. Can be witty. Must still be true. No reassurance.
  // Restrained wit allowed here (dry, understated, observational).
  const closingNote = _addSubtleWit(surfaceA, openTasks, language, 'closing');
  
  lines.push(headers.closingNote);
  lines.push('');
  lines.push(closingNote);

  return lines.join('\n');
}

// ================== WRITE OUTPUT ==================
function _writeDailyView(text) {
  const sheet = _getOrCreateSheet('DAILY_VIEW');
  sheet.clearContents();

  const now = new Date();
  const rows = [
    [now], // Row 1: generated_at
    ['daily'], // Row 2: view_type
    [text] // Row 3+: the composed text (single cell, preserve line breaks)
  ];

  sheet.getRange(1, 1, rows.length, 1).setValues(rows);
}

// ================== EXPORT TO DAILY VOICE BRIEF DOC ==================
function _writeDailyVoiceBriefToDoc(dailyText) {
  if (!dailyText || !dailyText.trim()) {
    Logger.log('No daily text to write to Daily Voice Brief doc.');
    return;
  }

  const props = PropertiesService.getScriptProperties();
  const docId = props.getProperty('DAILY_VOICE_DOC_ID');

  if (!docId) {
    Logger.log('DAILY_VOICE_DOC_ID not found in Script Properties. Document not updated.');
    return;
  }

  let doc;
  try {
    doc = DocumentApp.openById(docId);
  } catch (e) {
    Logger.log('Could not open Daily Voice Brief document by ID: ' + e.message);
    return;
  }

  const body = doc.getBody();
  body.clear();

  const lines = dailyText.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    body.appendParagraph(line);
  }

  Logger.log('Daily Voice Brief document updated successfully.');
}

// ================== HELPERS ==================
// _getSheet and _getOrCreateSheet are defined in personal_os_v2.js
