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
const SURFACEB_DAILY_TAB_WORKSPACE_HANDOFF = 'WORKSPACE_DAILY_HANDOFF';

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

// ================== WORKSPACE HANDOFF (FILTERED) ==================
// Legacy-safe: this does not change Personal OS daily composition.
// It provides a separate business-only payload for ScanScam Workspace.
function runWorkspaceDailyHandoffOnce() {
  const payload = buildWorkspaceDailyHandoffPayload();
  _writeWorkspaceDailyHandoff(payload);
  return payload;
}

function buildWorkspaceDailyHandoffPayload() {
  const now = new Date();
  const surfaceA = _readTodaySurfaceA();
  const derivedSignals = _readActiveDerivedSignals();
  const decidedItems = _readConfirmedSpeakable();
  const openTasks = typeof listOpenTasks === 'function' ? listOpenTasks() : [];

  const businessLoops = new Set(['Public', 'MSP', 'Product', 'Intelligence']);
  const businessActions = [];
  const pipelineAttention = [];
  const productOrIntelligenceItems = [];
  const founderConstraints = _extractFounderConstraints(surfaceA);

  for (const task of openTasks) {
    const businessLoop = String(task.business_loop || '').trim();
    const classification = String(task.classification || '').trim();
    const nextAction = String(task.next_action || '').trim();
    const content = String(task.content || '').trim();
    const priorityLabel = String(task.priority_label || '').trim();
    const leverageScore = Number(task.leverage_score || 0);

    const isBusinessLoop = businessLoops.has(businessLoop);
    const isBusinessAction = classification === 'Action' && isBusinessLoop && nextAction;
    if (isBusinessAction) {
      businessActions.push({
        task_id: task.task_id || '',
        business_loop: businessLoop,
        next_action: nextAction,
        priority_label: priorityLabel || 'Schedule',
        leverage_score: isNaN(leverageScore) ? 0 : leverageScore
      });
    }

    if (classification === 'Public Pipeline' || classification === 'MSP Pipeline') {
      if (isBusinessLoop || !businessLoop) {
        pipelineAttention.push({
          source: 'task',
          business_loop: businessLoop || (classification === 'MSP Pipeline' ? 'MSP' : 'Public'),
          item: nextAction || content
        });
      }
    }

    if (classification === 'Product & Intelligence' || businessLoop === 'Product' || businessLoop === 'Intelligence') {
      productOrIntelligenceItems.push({
        source: 'task',
        business_loop: businessLoop || 'Product',
        item: nextAction || content
      });
    }
  }

  const businessDecisions = [];
  const businessExperiments = [];
  const masterContextCandidates = [];

  for (const item of (decidedItems || [])) {
    const title = item && item.title ? String(item.title).trim() : '';
    if (!title) {
      continue;
    }

    // Keep payload business-facing and compact.
    businessDecisions.push({
      decided_id: item.decided_id || '',
      title: title
    });

    if (_looksLikeExperiment(title)) {
      businessExperiments.push({
        source: 'decided',
        title: title
      });
    }

    if (_isMasterContextCandidate(title)) {
      masterContextCandidates.push({
        source: 'decided',
        title: title
      });
    }
  }

  for (const signal of (derivedSignals || [])) {
    if (!signal || !signal.pattern_key) {
      continue;
    }
    if (_looksBusinessSignal(signal)) {
      productOrIntelligenceItems.push({
        source: 'derived',
        business_loop: 'Intelligence',
        item: String(signal.pattern_key).trim()
      });
    }
  }

  return {
    handoff_version: '1.0',
    generated_at: now.toISOString(),
    source: 'personal_os',
    scope: 'workspace_daily',
    date: _formatIsoDate(now),
    business_actions: _uniqueObjectsByKey(businessActions, function (x) {
      return [x.task_id, x.business_loop, x.next_action].join('|');
    }),
    business_decisions: _uniqueObjectsByKey(businessDecisions, function (x) {
      return [x.decided_id, x.title].join('|');
    }),
    business_experiments: _uniqueObjectsByKey(businessExperiments, function (x) {
      return [x.source, x.title].join('|');
    }),
    pipeline_attention: _uniqueObjectsByKey(pipelineAttention, function (x) {
      return [x.source, x.business_loop, x.item].join('|');
    }),
    product_or_intelligence_items: _uniqueObjectsByKey(productOrIntelligenceItems, function (x) {
      return [x.source, x.business_loop, x.item].join('|');
    }),
    master_context_candidates: _uniqueObjectsByKey(masterContextCandidates, function (x) {
      return [x.source, x.title].join('|');
    }),
    founder_constraints: founderConstraints
  };
}

function _formatIsoDate(dateValue) {
  const d = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (isNaN(d.getTime())) {
    return '';
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function _extractFounderConstraints(surfaceA) {
  const constraints = [];
  if (!surfaceA) {
    return constraints;
  }
  const text = [
    String(surfaceA.attention || '').trim(),
    String(surfaceA.context || '').trim(),
    String(surfaceA.framing || '').trim(),
    String(surfaceA.reflection || '').trim()
  ].join(' ');

  if (!text) {
    return constraints;
  }

  const lower = text.toLowerCase();
  if (/\b(low energy|tired|fatigue|exhausted|drained)\b/.test(lower)) {
    constraints.push('Low energy capacity today.');
  }
  if (/\b(limited time|time constraint|short day|few hours|timeboxed)\b/.test(lower)) {
    constraints.push('Limited execution time today.');
  }
  if (/\b(family|child|kids|school|caregiving|appointment)\b/.test(lower)) {
    constraints.push('Family obligation constrains schedule.');
  }
  if (/\b(gym|workout|training|health|medical|recovery)\b/.test(lower)) {
    constraints.push('Health commitment affects available work blocks.');
  }
  return _uniqueStrings(constraints);
}

function _looksLikeExperiment(text) {
  const v = String(text || '').toLowerCase();
  return /\b(experiment|test|hypothesis|pilot|trial|validate|validation)\b/.test(v);
}

function _isMasterContextCandidate(text) {
  const v = String(text || '').toLowerCase();
  return /\b(phase|strategy|priority|positioning|pipeline|principle|operating rule|open question|experiment)\b/.test(v);
}

function _looksBusinessSignal(signal) {
  const key = String(signal.pattern_key || '').toLowerCase();
  const field = String(signal.field || '').toLowerCase();
  return /\b(scan|signal|pattern|report|msp|lead|outreach|pilot|usage|product|bug|metric|brief|trust|paid)\b/.test(key + ' ' + field);
}

function _uniqueStrings(items) {
  const seen = new Set();
  const result = [];
  for (const item of (items || [])) {
    const key = String(item || '').trim();
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(key);
  }
  return result;
}

function _uniqueObjectsByKey(items, keyFn) {
  const seen = new Set();
  const result = [];
  for (const item of (items || [])) {
    const key = keyFn(item);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(item);
  }
  return result;
}

function _writeWorkspaceDailyHandoff(payload) {
  const sheet = _getOrCreateSheet(SURFACEB_DAILY_TAB_WORKSPACE_HANDOFF);
  sheet.clearContents();

  const rows = [
    [new Date()],
    ['workspace_handoff_daily'],
    [JSON.stringify(payload, null, 2)]
  ];
  sheet.getRange(1, 1, rows.length, 1).setValues(rows);
}

// ================== WORKSPACE CONSUMER CONTRACT ==================
// Contract boundary notes:
// - Personal OS remains the full-life capture layer (personal + business context).
// - Workspace handoff is filtered business context only.
// - Reader/validator below provide a deterministic ingestion boundary for future
//   ScanScam Workspace consumers without changing legacy daily/weekly systems.
function _createEmptyWorkspaceDailyHandoffTemplate(now) {
  const baseDate = now instanceof Date ? now : new Date();
  return {
    handoff_version: '1.0',
    generated_at: baseDate.toISOString(),
    source: 'personal_os',
    scope: 'workspace_daily',
    date: _formatIsoDate(baseDate),
    business_actions: [],
    business_decisions: [],
    business_experiments: [],
    pipeline_attention: [],
    product_or_intelligence_items: [],
    master_context_candidates: [],
    founder_constraints: []
  };
}

function _isObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function _asArray(value) {
  return Array.isArray(value) ? value : [];
}

function validateWorkspaceDailyHandoffPayload(payload) {
  const warnings = [];
  const normalized = _createEmptyWorkspaceDailyHandoffTemplate(new Date());
  const input = _isObject(payload) ? payload : {};

  if (!_isObject(payload)) {
    warnings.push('Payload was missing or malformed; default template used.');
  }

  // Metadata normalization (legacy-safe and deterministic).
  if (input.handoff_version === '1.0') {
    normalized.handoff_version = input.handoff_version;
  } else if (input.handoff_version) {
    warnings.push('Unsupported handoff_version found; defaulted to 1.0.');
  } else {
    warnings.push('Missing handoff_version; defaulted to 1.0.');
  }

  if (input.generated_at) {
    const generatedAt = new Date(input.generated_at);
    if (!isNaN(generatedAt.getTime())) {
      normalized.generated_at = generatedAt.toISOString();
    } else {
      warnings.push('Invalid generated_at; default timestamp used.');
    }
  } else {
    warnings.push('Missing generated_at; default timestamp used.');
  }

  if (input.source === 'personal_os') {
    normalized.source = 'personal_os';
  } else {
    warnings.push('Invalid source; expected "personal_os". Default applied.');
  }

  if (input.scope === 'workspace_daily') {
    normalized.scope = 'workspace_daily';
  } else {
    warnings.push('Invalid scope; expected "workspace_daily". Default applied.');
  }

  if (input.date && /^\d{4}-\d{2}-\d{2}$/.test(String(input.date))) {
    normalized.date = String(input.date);
  } else {
    warnings.push('Missing or invalid date; default ISO date applied.');
  }

  const requiredSections = [
    'business_actions',
    'business_decisions',
    'business_experiments',
    'pipeline_attention',
    'product_or_intelligence_items',
    'master_context_candidates',
    'founder_constraints'
  ];

  for (const section of requiredSections) {
    if (!Array.isArray(input[section])) {
      if (input[section] !== undefined) {
        warnings.push('Section "' + section + '" was not an array; normalized to empty array.');
      } else {
        warnings.push('Missing section "' + section + '"; normalized to empty array.');
      }
      normalized[section] = [];
    } else {
      normalized[section] = _asArray(input[section]);
    }
  }

  return {
    payload: normalized,
    warnings: warnings
  };
}

function readLatestWorkspaceDailyHandoff() {
  const warnings = [];
  const sheet = _getSheet(SURFACEB_DAILY_TAB_WORKSPACE_HANDOFF);

  if (!sheet) {
    warnings.push('WORKSPACE_DAILY_HANDOFF sheet not found; returning empty normalized payload.');
    return {
      ok: false,
      payload: _createEmptyWorkspaceDailyHandoffTemplate(new Date()),
      warnings: warnings
    };
  }

  const data = sheet.getDataRange().getValues();
  if (!data || data.length === 0) {
    warnings.push('WORKSPACE_DAILY_HANDOFF is empty; returning empty normalized payload.');
    return {
      ok: false,
      payload: _createEmptyWorkspaceDailyHandoffTemplate(new Date()),
      warnings: warnings
    };
  }

  // Legacy-safe: writer currently stores JSON payload in row 3 col 1, but we read
  // the latest non-empty row so future storage tweaks remain compatible.
  let rawPayload = '';
  for (let i = data.length - 1; i >= 0; i--) {
    const value = data[i][0];
    if (value !== null && value !== undefined && String(value).trim()) {
      rawPayload = String(value);
      break;
    }
  }

  if (!rawPayload) {
    warnings.push('No payload row found in WORKSPACE_DAILY_HANDOFF; returning empty normalized payload.');
    return {
      ok: false,
      payload: _createEmptyWorkspaceDailyHandoffTemplate(new Date()),
      warnings: warnings
    };
  }

  let parsed = null;
  try {
    parsed = JSON.parse(rawPayload);
  } catch (e) {
    warnings.push('Payload JSON parse failed; returning empty normalized payload.');
    return {
      ok: false,
      payload: _createEmptyWorkspaceDailyHandoffTemplate(new Date()),
      warnings: warnings
    };
  }

  const validated = validateWorkspaceDailyHandoffPayload(parsed);
  return {
    ok: warnings.length === 0 && validated.warnings.length === 0,
    payload: validated.payload,
    warnings: warnings.concat(validated.warnings)
  };
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
      highestLeverageAction: 'Action à plus fort levier (Aujourd\'hui)',
      secondaryActions: 'Actions secondaires (maximum 2)',
      decisionNeeded: 'Décision requise',
      pipelineAttention: 'Pipeline nécessitant attention',
      ignoreToday: 'À ignorer aujourd\'hui',
      founderInsight: 'Insight fondateur',
      notesNotTasks: 'Notes à ne pas convertir en tâches',
      closingNote: 'Note de Clôture'
    };
  }
  
  return {
    highestLeverageAction: 'Highest-Leverage Action (Today)',
    secondaryActions: 'Secondary Actions (Maximum 2)',
    decisionNeeded: 'Decision Needed',
    pipelineAttention: 'Pipeline Needing Attention',
    ignoreToday: 'Ignore Today',
    founderInsight: 'Founder Insight',
    notesNotTasks: 'Notes That Should Not Become Tasks',
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

  const prioritizedTasks = _selectExecutionFocusTasks(openTasks || []);
  const highest = prioritizedTasks.length > 0 ? prioritizedTasks[0] : null;
  const secondary = prioritizedTasks.slice(1, 3);

  lines.push(headers.highestLeverageAction);
  lines.push('');
  if (highest) {
    lines.push('— ' + _cleanTaskContent(highest.next_action || highest.content));
  } else {
    lines.push(language === 'fr' ? '— Aucune action qualifiée.' : '— No qualified action.');
  }
  lines.push('');

  lines.push(headers.secondaryActions);
  lines.push('');
  if (secondary.length > 0) {
    for (const task of secondary) {
      lines.push('— ' + _cleanTaskContent(task.next_action || task.content));
    }
  } else {
    lines.push(language === 'fr' ? '— Aucune.' : '— None.');
  }
  lines.push('');

  lines.push(headers.decisionNeeded);
  lines.push('');
  const decisionLine = _selectDecisionNeeded(decidedItems || [], surfaceA, language);
  lines.push('— ' + decisionLine);
  lines.push('');

  lines.push(headers.pipelineAttention);
  lines.push('');
  lines.push('— ' + _selectPipelineAttention(prioritizedTasks, derivedSignals || [], surfaceA, language));
  lines.push('');

  lines.push(headers.ignoreToday);
  lines.push('');
  lines.push('— ' + _selectIgnoreToday(prioritizedTasks, language));
  lines.push('');

  lines.push(headers.founderInsight);
  lines.push('');
  lines.push('— ' + _selectFounderInsight(surfaceA, openTasks || [], language));
  lines.push('');

  lines.push(headers.notesNotTasks);
  lines.push('');
  const nonTaskNotes = _extractNonTaskNotes(surfaceA, language);
  if (nonTaskNotes.length > 0) {
    for (const note of nonTaskNotes) {
      lines.push('— ' + note);
    }
  } else {
    lines.push(language === 'fr'
      ? '— Aucune note à préserver hors exécution.'
      : '— No notes explicitly preserved outside execution.');
  }
  lines.push('');

  // Closing Note
  // Tone: One sentence. Can be witty. Must still be true. No reassurance.
  // Restrained wit allowed here (dry, understated, observational).
  const closingNote = _addSubtleWit(surfaceA, openTasks, language, 'closing');
  
  lines.push(headers.closingNote);
  lines.push('');
  lines.push(closingNote);

  return lines.join('\n');
}

function _selectExecutionFocusTasks(openTasks) {
  if (!openTasks || openTasks.length === 0) {
    return [];
  }
  const actionable = openTasks.filter(task => {
    const classification = String(task.classification || 'Action').trim();
    const businessLoop = String(task.business_loop || 'Founder').trim();
    const nextAction = String(task.next_action || '').trim();
    return classification === 'Action' && businessLoop !== 'Archive' && !!nextAction;
  });

  const withScore = actionable.map(task => {
    const score = Number(task.leverage_score);
    const normalizedScore = isNaN(score) ? 0 : score;
    const urgency = Number(task.urgency);
    const normalizedUrgency = isNaN(urgency) ? 3 : urgency;
    const overdueBoost = task.overdue ? 1 : 0;
    return {
      task: task,
      score: normalizedScore + normalizedUrgency + overdueBoost
    };
  });

  withScore.sort((a, b) => b.score - a.score);
  return withScore.map(x => x.task);
}

function _selectDecisionNeeded(decidedItems, surfaceA, language) {
  if (decidedItems && decidedItems.length > 0) {
    const first = decidedItems[0];
    if (first && first.title) {
      return _makeDry(String(first.title).trim());
    }
  }
  const framing = surfaceA && surfaceA.framing ? _extractCompleteSentences(String(surfaceA.framing).trim()) : [];
  if (framing.length > 0) {
    return _makeDry(framing[0]);
  }
  return language === 'fr' ? 'Aucune décision explicite capturée.' : 'No explicit decision captured.';
}

function _selectPipelineAttention(tasks, derivedSignals, surfaceA, language) {
  const loops = {};
  for (const task of tasks || []) {
    const loop = String(task.business_loop || 'Founder').trim();
    loops[loop] = (loops[loop] || 0) + 1;
  }
  let bestLoop = '';
  let bestCount = -1;
  for (const key in loops) {
    if (loops[key] > bestCount) {
      bestLoop = key;
      bestCount = loops[key];
    }
  }
  if (bestLoop) {
    return language === 'fr'
      ? ('Pipeline dominant aujourd\'hui: ' + bestLoop + '.')
      : ('Dominant pipeline today: ' + bestLoop + '.');
  }
  if (derivedSignals && derivedSignals.length > 0) {
    return language === 'fr'
      ? 'Signaux actifs détectés; prioriser la boucle avec validation immédiate.'
      : 'Active signals detected; prioritize the loop with immediate validation.';
  }
  return language === 'fr'
    ? 'Aucune pression pipeline explicite.'
    : 'No explicit pipeline pressure detected.';
}

function _selectIgnoreToday(tasks, language) {
  if (!tasks || tasks.length <= 3) {
    return language === 'fr' ? 'Nouveaux inputs non classifiés.' : 'New unclassified inputs.';
  }
  const tail = tasks[tasks.length - 1];
  const text = _cleanTaskContent(tail.content || '');
  return text || (language === 'fr' ? 'Backlog faible levier.' : 'Low-leverage backlog.');
}

function _selectFounderInsight(surfaceA, openTasks, language) {
  const reflectionText = surfaceA && surfaceA.reflection ? String(surfaceA.reflection).trim() : '';
  const reflectionSentences = _extractCompleteSentences(reflectionText);
  if (reflectionSentences.length > 0) {
    return _makeDry(reflectionSentences[0]);
  }
  const wit = _addSubtleWit(surfaceA, openTasks, language, 'observations');
  if (wit) {
    return wit;
  }
  return language === 'fr' ? 'Signal limité; exécution prioritaire.' : 'Limited signal; execution is the priority.';
}

function _extractNonTaskNotes(surfaceA, language) {
  const notes = [];
  if (!surfaceA) {
    return notes;
  }
  const candidates = [];
  if (surfaceA.attention) {
    candidates.push.apply(candidates, _extractCompleteSentences(String(surfaceA.attention).trim()));
  }
  if (surfaceA.reflection) {
    candidates.push.apply(candidates, _extractCompleteSentences(String(surfaceA.reflection).trim()));
  }
  const unique = _removeRepetition(candidates).slice(0, 2);
  for (const sentence of unique) {
    const normalized = String(sentence || '').toLowerCase();
    // Explicitly preserve reflective/emotional material as context, not execution.
    if (/\b(feel|felt|emotion|energy|focus|stress|overwhelm|anxious|tired|fatigue|pression|énergie|fatigue|stress)\b/.test(normalized)) {
      notes.push(_makeDry(sentence));
    }
  }
  if (notes.length === 0 && unique.length > 0) {
    notes.push(language === 'fr'
      ? 'Conserver la réflexion comme contexte, sans conversion automatique en tâche.'
      : 'Keep reflection as context without automatic task conversion.');
  }
  return notes;
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
