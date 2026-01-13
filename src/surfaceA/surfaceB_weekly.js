// Surface B — Weekly Read Model

/************************************************************
 * Surface B — Weekly Intelligence Brief v1.0
 *
 * Purpose:
 * - Integrate persisted signals and confirmed commitments
 * - Describe system state and visible future space
 * - Must NOT decide, advise, instruct, motivate, or plan
 *
 * Input Boundaries (HARD):
 * - May read ONLY: DERIVED_SIGNALS (eligible), DECIDED (confirmed, speakable)
 * - Must NOT read: RAW, EXECUTION, PEOPLE/CONTEXT MEMORY, DECIDE MODE state
 *
 * Language Constraints (NON-NEGOTIABLE):
 * - No advice, planning verbs, psychological framing, motivational tone
 * - No urgency, "should" language, or interpretation of internal state
 *
 * Section Canon (Locked Order):
 * I. Week in Review
 * II. Sustained Signals (DERIVED)
 * III. Signals That Did Not Hold
 * IV. Tensions in View
 * V. System State
 * VI. Visible Paths (Not Decisions)
 * VII. Commitments in Context
 * VIII. Closing Note
 ************************************************************/

// ================== TAB NAMES ==================
const SURFACEB_WEEKLY_TAB_DERIVED = 'DERIVED_SIGNALS';

// ================== ELIGIBILITY THRESHOLD ==================
// Minimum ratio of count/possible for a signal to be eligible for weekly review
const WEEKLY_ELIGIBILITY_THRESHOLD = 0.4; // 40% recurrence rate

// ================== ENTRY POINT ==================
function runSurfaceBWeeklyOnce() {
  Logger.log('--- SURFACE B WEEKLY BRIEF START ---');

  const archiveRows = _getSurfaceAArchiveLastNDays(7);
  const derivedSignals = _readDerivedSignals();
  const eligibleSignals = derivedSignals && derivedSignals.length > 0 
    ? _selectEligibleSignals(derivedSignals) 
    : [];
  const decidedItems = _readConfirmedSpeakable();
  const executionData = _readExecutionData();

  // Silence is acceptable output - always compose brief even if empty
  const brief = _composeWeeklyBrief(archiveRows, eligibleSignals, decidedItems, executionData);

  Logger.log('=== WEEKLY BRIEF ===');
  Logger.log(brief);
  Logger.log('=== END WEEKLY BRIEF ===');

  _writeWeeklyView(brief);

  _writeWeeklyBriefToDoc(brief);

  Logger.log('--- SURFACE B WEEKLY BRIEF END ---');
}

// ================== ARCHIVE HELPERS ==================
function _getSurfaceAArchiveLastNDays(days) {
  const sheet = _getSheet('SURFACE_A_ARCHIVE');
  if (!sheet) {
    return [];
  }
  
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return [];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return data.slice(1).filter(row => {
    if (!row[0]) return false;
    const archivedAt = new Date(row[0]);
    if (isNaN(archivedAt.getTime())) return false;
    return archivedAt >= cutoff;
  });
}

// ================== LANGUAGE DETECTION ==================
function _detectLanguageFromArchive(archiveRows) {
  if (!archiveRows || archiveRows.length === 0) {
    return 'en';
  }
  
  // Sample text from archive rows (orientation, attention, context, framing)
  let sampleText = '';
  for (const row of archiveRows.slice(0, 5)) {
    // Archive columns: archived_at, run_id, orientation, attention, context, framing, reflection, constraints
    if (row.length > 2) {
      sampleText += (row[2] || '') + ' '; // orientation
      sampleText += (row[3] || '') + ' '; // attention
      sampleText += (row[4] || '') + ' '; // context
      sampleText += (row[5] || '') + ' '; // framing
    }
  }
  
  if (!sampleText.trim()) {
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

// ================== READ SOURCES ==================
function _readDerivedSignals() {
  const sheet = _getSheet(SURFACEB_WEEKLY_TAB_DERIVED);
  if (!sheet) {
    return null;
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
  const possibleIdx = headerRow.indexOf('possible');
  const windowIdx = headerRow.indexOf('window');

  if (fieldIdx === -1 || patternKeyIdx === -1 || windowIdx === -1) {
    return [];
  }

  const signals = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const field = row[fieldIdx];
    const patternKey = row[patternKeyIdx];
    const count = row[countIdx] ? Number(row[countIdx]) : 0;
    const possible = row[possibleIdx] ? Number(row[possibleIdx]) : 0;
    const window = String(row[windowIdx] || '').trim();

    if (field && patternKey && window) {
      signals.push({
        field: String(field).trim(),
        pattern_key: String(patternKey).trim(),
        count: count,
        possible: possible,
        window: window
      });
    }
  }

  return signals;
}


// ================== SELECT ELIGIBLE SIGNALS ==================
function _selectEligibleSignals(signals) {
  const eligible = [];

  for (const signal of signals) {
      const windowDays = _extractWindowDays(signal.window);
    
    // Window must be 7-14 days
    if (windowDays < 7 || windowDays > 14) {
      continue;
    }

    // Count/possible must meet threshold
    if (signal.possible === 0) {
      continue;
    }
    
    const ratio = signal.count / signal.possible;
    if (ratio < WEEKLY_ELIGIBILITY_THRESHOLD) {
      continue;
    }

    eligible.push(signal);
  }

  return eligible;
}

function _extractWindowDays(windowStr) {
  if (!windowStr) {
    return 0;
  }
  
  // Extract number from strings like "5 days", "14 days", or just "14"
  const match = windowStr.match(/(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  return 0;
}

// ================== COMPOSE BRIEF ==================
function _composeWeeklyBrief(archiveRows, eligibleSignals, decidedItems, executionData) {
  const lines = [];
  
  // LANGUAGE LOCK: Detect language from archive
  const language = _detectLanguageFromArchive(archiveRows);
  const headers = _getWeeklyHeaders(language);
  
  // Aggregate Surface A data from archive
  const aggregated = _aggregateArchiveData(archiveRows);
  const projects = _readProjectsFromDecided();
  const allDerivedSignals = _readDerivedSignals() || [];
  
  // I. Operating Reality
  lines.push(headers.operatingReality);
  lines.push('');
  if (aggregated.orientation || aggregated.framing) {
    const realityText = _synthesizeOperatingReality(aggregated.orientation, aggregated.framing, language);
    lines.push(realityText);
  } else {
    const noData = language === 'fr' 
      ? 'Aucune orientation opérationnelle enregistrée cette semaine.'
      : 'No operational orientation recorded this week.';
    lines.push(noData);
  }
  lines.push('');
  
  // II. Attention & Load
  lines.push(headers.attentionLoad);
  lines.push('');
  const attentionText = _synthesizeAttentionLoad(aggregated.attention, executionData, language);
  lines.push(attentionText);
  lines.push('');
  
  // III. Movement & Friction
  lines.push(headers.movementFriction);
  lines.push('');
  const movementText = _synthesizeMovementFriction(executionData, language);
  lines.push(movementText);
  lines.push('');
  
  // IV. Leverage & Dependencies
  lines.push(headers.leverageDependencies);
  lines.push('');
  const leverageText = _synthesizeLeverage(projects, executionData, language);
  lines.push(leverageText);
  lines.push('');
  
  // V. Signals (DERIVED)
  lines.push(headers.signals);
  lines.push('');
  const sustained = eligibleSignals || [];
  const emerging = _getEmergingSignals(allDerivedSignals, eligibleSignals);
  const collapsed = _getCollapsedSignals(allDerivedSignals, eligibleSignals);
  
  const sustainedLabel = language === 'fr' ? 'A. Soutenus' : 'A. Sustained';
  lines.push(sustainedLabel);
  if (sustained.length > 0) {
    for (const signal of sustained) {
      const windowDays = _extractWindowDays(signal.window);
      const ratio = signal.possible > 0 ? (signal.count / signal.possible * 100).toFixed(0) : 0;
      lines.push(signal.pattern_key + ': ' + signal.count + '/' + signal.possible + ' (' + ratio + '%) over ' + windowDays + ' days.');
    }
  } else {
    const none = language === 'fr' 
      ? 'Aucun signal soutenu n\'a atteint le seuil cette semaine.'
      : 'No sustained signals met threshold this week.';
    lines.push(none);
  }
  lines.push('');
  
  const emergingLabel = language === 'fr' ? 'B. Émergents (sous seuil)' : 'B. Emerging (below threshold)';
  lines.push(emergingLabel);
  if (emerging.length > 0) {
    for (const signal of emerging.slice(0, 5)) {
      const ratio = signal.possible > 0 ? (signal.count / signal.possible * 100).toFixed(0) : 0;
      lines.push(signal.pattern_key + ': ' + signal.count + '/' + signal.possible + ' (' + ratio + '%).');
    }
  } else {
    const none = language === 'fr' ? 'Aucun.' : 'None.';
    lines.push(none);
  }
  lines.push('');
  
  const collapsedLabel = language === 'fr' ? 'C. Effondrés' : 'C. Collapsed';
  lines.push(collapsedLabel);
  if (collapsed.length > 0) {
    for (const signal of collapsed.slice(0, 3)) {
      const noLonger = language === 'fr' 
        ? signal.pattern_key + ' n\'est plus soutenu.'
        : signal.pattern_key + ' no longer sustained.';
      lines.push(noLonger);
    }
  } else {
    const none = language === 'fr' ? 'Aucun.' : 'None.';
    lines.push(none);
  }
  lines.push('');
  
  // VI. External Context
  lines.push(headers.externalContext);
  lines.push('');
  if (aggregated.context) {
    lines.push(aggregated.context);
  } else {
    const none = language === 'fr' ? 'Aucun contexte externe enregistré.' : 'No external context recorded.';
    lines.push(none);
  }
  lines.push('');
  
  // VII. DECIDED Commitments
  lines.push(headers.decidedCommitments);
  lines.push('');
  if (decidedItems.length > 0) {
    for (const item of decidedItems) {
      if (item.title) {
        lines.push(item.title + '.');
      }
    }
  } else {
    const none = language === 'fr' 
      ? 'Aucun engagement confirmé.'
      : 'No commitments were confirmed.';
    lines.push(none);
  }
  lines.push('');
  
  // VIII. Readiness & Posture
  lines.push(headers.readinessPosture);
  lines.push('');
  const readiness = _assessReadiness(executionData, aggregated);
  const readinessLabel = language === 'fr' ? 'Préparation' : 'Readiness';
  const causeLabel = language === 'fr' ? 'Cause principale' : 'Primary cause';
  const causeMap = {
    'Load': language === 'fr' ? 'Charge' : 'Load',
    'Environment': language === 'fr' ? 'Environnement' : 'Environment',
    'Internal': language === 'fr' ? 'Interne' : 'Internal',
    'Unknown': language === 'fr' ? 'Inconnue' : 'Unknown'
  };
  const levelMap = {
    'High': language === 'fr' ? 'Élevée' : 'High',
    'Medium': language === 'fr' ? 'Moyenne' : 'Medium',
    'Degraded': language === 'fr' ? 'Dégradée' : 'Degraded'
  };
  lines.push(readinessLabel + ': ' + levelMap[readiness.level] + '. ' + causeLabel + ': ' + causeMap[readiness.cause] + '.');
  lines.push('');
  
  // IX. Forward Tension (Not Decisions)
  lines.push(headers.forwardTension);
  lines.push('');
  const tensions = _identifyForwardTension(executionData, projects, emerging, language);
  if (tensions.length > 0) {
    for (const tension of tensions) {
      lines.push(tension + '.');
    }
  } else {
    const none = language === 'fr' ? 'Aucune tension identifiée.' : 'None identified.';
    lines.push(none);
  }
  lines.push('');
  
  // X. Closing Line (M / Moneypenny Tone)
  lines.push(headers.closingLine);
  lines.push('');
  const closing = _generateClosingLine(executionData, aggregated, language);
  lines.push(closing);
  lines.push('');

  return lines.join('\n');
}

// ================== HEADERS ==================
function _getWeeklyHeaders(language) {
  if (language === 'fr') {
    return {
      operatingReality: 'I. Réalité Opérationnelle',
      attentionLoad: 'II. Attention et Charge',
      movementFriction: 'III. Mouvement et Friction',
      leverageDependencies: 'IV. Levier et Dépendances',
      signals: 'V. Signaux (DÉRIVÉS)',
      externalContext: 'VI. Contexte Externe',
      decidedCommitments: 'VII. Engagements DÉCIDÉS',
      readinessPosture: 'VIII. Préparation et Posture',
      forwardTension: 'IX. Tension Avant',
      closingLine: 'X. Ligne de Clôture'
    };
  }
  
  return {
    operatingReality: 'I. Operating Reality',
    attentionLoad: 'II. Attention & Load',
    movementFriction: 'III. Movement & Friction',
    leverageDependencies: 'IV. Leverage & Dependencies',
    signals: 'V. Signals (DERIVED)',
    externalContext: 'VI. External Context',
    decidedCommitments: 'VII. DECIDED Commitments',
    readinessPosture: 'VIII. Readiness & Posture',
    forwardTension: 'IX. Forward Tension',
    closingLine: 'X. Closing Line'
  };
}

// ================== ARCHIVE AGGREGATION ==================
function _aggregateArchiveData(archiveRows) {
  // Archive columns: archived_at, run_id, orientation, attention, context, framing, reflection, constraints
  const aggregated = {
    orientation: [],
    attention: [],
    context: [],
    framing: []
  };
  
  for (const row of archiveRows) {
    if (row.length > 2) {
      const orientation = String(row[2] || '').trim();
      const attention = String(row[3] || '').trim();
      const context = String(row[4] || '').trim();
      const framing = String(row[5] || '').trim();
      
      if (orientation) aggregated.orientation.push(orientation);
      if (attention) aggregated.attention.push(attention);
      if (context) aggregated.context.push(context);
      if (framing) aggregated.framing.push(framing);
    }
  }
  
  return {
    orientation: aggregated.orientation.join(' | '),
    attention: aggregated.attention.join(' | '),
    context: aggregated.context.join(' | '),
    framing: aggregated.framing.join(' | ')
  };
}

// ================== SYNTHESIS FUNCTIONS ==================
function _synthesizeOperatingReality(orientation, framing, language) {
  const parts = [];
  if (orientation) parts.push(orientation);
  if (framing) parts.push(framing);
  
  if (parts.length === 0) {
    return language === 'fr' 
      ? 'Aucune orientation opérationnelle enregistrée cette semaine.'
      : 'No operational orientation recorded this week.';
  }
  
  // Synthesize into one sentence describing what the week was about
  const combined = parts.join(' ').trim();
  // Extract key phrases and create a synthesis
  const sentences = combined.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  
  if (sentences.length === 0) {
    return language === 'fr'
      ? 'La semaine était principalement orientée autour d\'activités opérationnelles.'
      : 'The week was primarily oriented around operational activities.';
  }
  
  // Use first complete sentence, or synthesize
  const firstSentence = sentences[0];
  if (firstSentence.length > 20) {
    return firstSentence + '.';
  }
  
  // Fallback synthesis
  return language === 'fr'
    ? 'La semaine était principalement orientée autour d\'activités opérationnelles.'
    : 'The week was primarily oriented around operational activities.';
}

function _synthesizeAttentionLoad(attention, executionData, language) {
  const parts = [];
  
  if (attention && attention.trim()) {
    parts.push(attention.trim());
  }
  
  if (executionData.openCount > executionData.completedCount) {
    const loadText = language === 'fr'
      ? 'La charge d\'exécution a dépassé la complétion.'
      : 'Execution load exceeded completion.';
    parts.push(loadText);
  }
  
  if (parts.length === 0) {
    return language === 'fr'
      ? 'Aucune pression notable observée.'
      : 'No notable pressure observed.';
  }
  
  return parts.join(' ');
}

function _synthesizeMovementFriction(executionData, language) {
  const movementParts = [];
  const frictionParts = [];
  
  if (executionData.completedCount > 0) {
    const movement = language === 'fr'
      ? 'Progrès enregistré dans l\'exécution de routine.'
      : 'Progress occurred in routine execution.';
    movementParts.push(movement);
  }
  
  if (executionData.agingCount > 0 || executionData.carriedCount > 0) {
    const friction = language === 'fr'
      ? 'Report répété observé dans les éléments liés à la planification.'
      : 'Repeated deferral observed in planning-related items.';
    frictionParts.push(friction);
  }
  
  const result = [];
  if (movementParts.length > 0) {
    result.push('Movement: ' + movementParts.join(' '));
  } else {
    result.push(language === 'fr' ? 'Mouvement: aucun enregistré.' : 'Movement: none recorded.');
  }
  
  if (frictionParts.length > 0) {
    result.push('Friction: ' + frictionParts.join(' '));
  } else {
    result.push(language === 'fr' ? 'Friction: aucune enregistrée.' : 'Friction: none recorded.');
  }
  
  return result.join(' ');
}

function _synthesizeLeverage(projects, executionData, language) {
  const projectTasks = executionData.projectLinkedTasks || 0;
  
  if (projects.length === 0 && projectTasks === 0) {
    return language === 'fr'
      ? 'Aucune nouvelle relation de levier n\'a été activée.'
      : 'No new leverage relationships were activated.';
  }
  
  const parts = [];
  if (projects.length > 0) {
    const projText = language === 'fr'
      ? projects.length + ' projet(s) actif(s)'
      : projects.length + ' active project' + (projects.length !== 1 ? 's' : '');
    parts.push(projText);
  }
  if (projectTasks > 0) {
    const taskText = language === 'fr'
      ? projectTasks + ' tâche(s) liée(s) au projet'
      : projectTasks + ' project-linked task' + (projectTasks !== 1 ? 's' : '');
    parts.push(taskText);
  }
  
  return language === 'fr'
    ? 'Levier: ' + parts.join('. ') + '.'
    : 'Leverage: ' + parts.join('. ') + '.';
}

function _readExecutionData() {
  try {
    const tasks = typeof listOpenTasks === 'function' ? listOpenTasks() : [];
    const allTasks = _readAllExecutionTasks();
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let completedCount = 0;
    let agingCount = 0;
    let projectLinkedTasks = 0;
    
    for (const task of allTasks) {
      if (task.state === 'done' && task.completed_at) {
        const completedDate = new Date(task.completed_at);
        if (completedDate >= sevenDaysAgo) {
          completedCount++;
        }
      }
      if (task.state === 'open' && task.created_at) {
        const createdDate = new Date(task.created_at);
        if (createdDate < sevenDaysAgo) {
          agingCount++;
        }
      }
      if (task.project_id && task.project_id.trim()) {
        projectLinkedTasks++;
      }
    }
    
    const carriedCount = tasks.length;
    
    return {
      openCount: tasks.length,
      completedCount: completedCount,
      carriedCount: carriedCount,
      agingCount: agingCount,
      projectLinkedTasks: projectLinkedTasks
    };
  } catch (e) {
    return {
      openCount: 0,
      completedCount: 0,
      carriedCount: 0,
      agingCount: 0,
      projectLinkedTasks: 0
    };
  }
}

function _readAllExecutionTasks() {
  try {
    const sheet = _getSheet('EXECUTION_TASKS');
    if (!sheet) {
      return [];
    }
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return [];
    }
    
    const headerRow = data[0];
    const idIdx = headerRow.indexOf('task_id');
    const stateIdx = headerRow.indexOf('state');
    const createdIdx = headerRow.indexOf('created_at');
    const completedIdx = headerRow.indexOf('completed_at');
    const projectIdIdx = headerRow.indexOf('project_id');
    
    if (idIdx === -1 || stateIdx === -1) {
      return [];
    }
    
    const tasks = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      tasks.push({
        task_id: row[idIdx],
        state: String(row[stateIdx] || '').trim(),
        created_at: createdIdx >= 0 ? row[createdIdx] : null,
        completed_at: completedIdx >= 0 ? row[completedIdx] : null,
        project_id: projectIdIdx >= 0 ? (row[projectIdIdx] ? String(row[projectIdIdx]).trim() : '') : ''
      });
    }
    
    return tasks;
  } catch (e) {
    return [];
  }
}

function _readProjectsFromDecided() {
  try {
    const items = _readConfirmedSpeakable();
    return items.filter(item => item.type === 'Project');
  } catch (e) {
    return [];
  }
}

function _getEmergingSignals(allSignals, eligibleSignals) {
  const eligibleKeys = new Set(eligibleSignals.map(s => s.pattern_key));
  return allSignals.filter(s => {
    if (eligibleKeys.has(s.pattern_key)) {
      return false;
    }
    const windowDays = _extractWindowDays(s.window);
    if (windowDays < 7 || windowDays > 14) {
      return false;
    }
    if (s.possible === 0) {
      return false;
    }
    const ratio = s.count / s.possible;
    return ratio > 0 && ratio < WEEKLY_ELIGIBILITY_THRESHOLD;
  });
}

function _getCollapsedSignals(allSignals, eligibleSignals) {
  return [];
}

function _assessReadiness(executionData, aggregated) {
  if (executionData.agingCount > 5 || executionData.openCount > 15) {
    return { level: 'Degraded', cause: 'Load' };
  }
  if (executionData.openCount > 8) {
    return { level: 'Medium', cause: 'Load' };
  }
  if (aggregated && aggregated.context) {
    return { level: 'Medium', cause: 'Environment' };
  }
  return { level: 'High', cause: 'Unknown' };
}

function _identifyForwardTension(executionData, projects, emerging, language) {
  const tensions = [];
  
  if (executionData.agingCount > 0) {
    const tension = language === 'fr'
      ? 'Retard dans l\'alignement financier peut forcer un choix dans les semaines à venir'
      : 'Delay in financial alignment may force a choice within weeks.';
    tensions.push(tension);
  }
  
  if (emerging && emerging.length > 0) {
    const tension = language === 'fr'
      ? 'Signaux émergents nécessitent une attention continue'
      : 'Emerging signals require continued attention.';
    tensions.push(tension);
  }
  
  if (executionData.openCount > 10) {
    const tension = language === 'fr'
      ? 'Accumulation de tâches ouvertes approchant le seuil de gestion'
      : 'Open task accumulation approaching management threshold.';
    tensions.push(tension);
  }
  
  return tensions;
}

function _generateClosingLine(executionData, aggregated, language) {
  // M / Moneypenny tone: dry, slightly ironic, no comfort, no urgency, no instruction
  const closingLines = language === 'fr' ? [
    'La pression est présente; l\'optionalité demeure.',
    'La situation est stable, sinon encore élégante.',
    'Tous les actifs sont comptabilisés; l\'intention se forme encore.',
    'Rien ne brûle, mais plusieurs allumettes sont visibles.',
    'Le système fonctionne; l\'efficacité reste à déterminer.',
    'Rien d\'irréparable. Rien de résolu.',
    'Les pièces sont en place. Le plateau, lui, reste à découvrir.'
  ] : [
    'Pressure is present; optionality remains.',
    'The situation is stable, if not yet elegant.',
    'All assets accounted for; intent still forming.',
    'Nothing is on fire, but several matches are visible.',
    'The system functions; efficiency remains to be determined.',
    'Nothing irreparable. Nothing resolved.',
    'The pieces are in place. The board, however, remains to be discovered.'
  ];
  
  // Select based on context (deterministic)
  let index = 0;
  if (executionData.openCount > 10) {
    index = 0; // Pressure and optionality
  } else if (executionData.completedCount > 0 && executionData.carriedCount === 0) {
    index = 1; // Stable but not elegant
  } else if (executionData.agingCount > 0) {
    index = 3; // Matches visible
  } else if (aggregated && (aggregated.orientation || aggregated.framing)) {
    index = 2; // Assets accounted, intent forming
  } else {
    index = 5; // Nothing irreparable
  }
  
  return closingLines[index % closingLines.length];
}

// ================== WRITE OUTPUT ==================
function _writeWeeklyView(text) {
  const sheet = _getOrCreateSheet('WEEKLY_VIEW');
  sheet.clearContents();

  const now = new Date();
  const rows = [
    [now], // Row 1: generated_at
    ['weekly'], // Row 2: view_type
    [text] // Row 3+: the composed text (single cell, preserve line breaks)
  ];

  sheet.getRange(1, 1, rows.length, 1).setValues(rows);
}

// ================== EXPORT TO WEEKLY INTELLIGENCE BRIEF DOC ==================
function _writeWeeklyBriefToDoc(weeklyText) {
  if (!weeklyText || !weeklyText.trim()) {
    Logger.log('No weekly text to write to Weekly Intelligence Brief doc.');
    return;
  }

  const props = PropertiesService.getScriptProperties();
  let docId = props.getProperty('WEEKLY_BRIEF_DOC_ID');

  let doc = null;

  // Try to open by ID if it exists
  if (docId) {
    try {
      doc = DocumentApp.openById(docId);
      Logger.log('Weekly Intelligence Brief document opened by ID.');
    } catch (e) {
      Logger.log('Could not open Weekly Intelligence Brief document by ID: ' + e.message);
      Logger.log('Attempting to search Drive by name...');
      docId = null; // Clear invalid ID
    }
  }

  // If ID is invalid or missing, search Drive by name
  if (!doc && !docId) {
    try {
      const files = DriveApp.getFilesByName('Weekly Intelligence Brief');
      if (files.hasNext()) {
        const file = files.next();
        docId = file.getId();
        doc = DocumentApp.openById(docId);
        // Store the found ID for future use
        props.setProperty('WEEKLY_BRIEF_DOC_ID', docId);
        Logger.log('Weekly Intelligence Brief document found by name and opened. ID stored.');
      } else {
        Logger.log('Weekly Intelligence Brief document not found in Drive. Document not updated.');
        return;
      }
    } catch (e) {
      Logger.log('Could not search for Weekly Intelligence Brief document: ' + e.message);
      return;
    }
  }

  if (!doc) {
    Logger.log('Could not open Weekly Intelligence Brief document. Document not updated.');
    return;
  }

  const body = doc.getBody();
  body.clear();

  // Compute emission date header
  const now = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateString = now.toLocaleDateString('en-US', dateOptions);
  const dateHeader = 'Generated: ' + dateString;

  // Write date header as first paragraph
  body.appendParagraph(dateHeader);
  
  // Insert exactly one blank line
  body.appendParagraph('');
  
  // Write weeklyText verbatim, preserving line breaks
  const lines = weeklyText.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    body.appendParagraph(line);
  }

  Logger.log('Weekly Intelligence Brief document updated successfully.');
}

// ================== TRIGGER SETUP ==================
function ensureWeeklySunday8amTrigger() {
  const existingTriggers = ScriptApp.getProjectTriggers();
  const weeklyFunctions = ['runSurfaceBWeeklyOnce'];
  let deletedCount = 0;
  let hasCorrectTrigger = false;

  for (let i = 0; i < existingTriggers.length; i++) {
    const trigger = existingTriggers[i];
    const handlerFunction = trigger.getHandlerFunction();
    
    if (weeklyFunctions.indexOf(handlerFunction) !== -1) {
      if (trigger.getEventType() === ScriptApp.EventType.CLOCK &&
          trigger.getWeekDay() === ScriptApp.WeekDay.SUNDAY &&
          trigger.getHour() === 8) {
        hasCorrectTrigger = true;
      } else {
        ScriptApp.deleteTrigger(trigger);
        deletedCount++;
      }
    }
  }

  if (!hasCorrectTrigger) {
    ScriptApp.newTrigger('runSurfaceBWeeklyOnce')
      .timeBased()
      .onWeekDay(ScriptApp.WeekDay.SUNDAY)
      .atHour(8)
      .create();
    Logger.log('Weekly Sunday trigger created: runSurfaceBWeeklyOnce (Sundays at 8:00 AM).');
  } else if (deletedCount > 0) {
    Logger.log('Weekly Sunday trigger verified: runSurfaceBWeeklyOnce (Sundays at 8:00 AM). Removed ' + deletedCount + ' duplicate trigger(s).');
  } else {
    Logger.log('Weekly Sunday trigger already exists: runSurfaceBWeeklyOnce (Sundays at 8:00 AM).');
  }
}

// ================== HELPERS ==================
// _getSheet and _getOrCreateSheet are defined in personal_os_v2.js
