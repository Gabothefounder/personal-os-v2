function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const action = body.action;

    if (!action) {
      return jsonResponse({ ok: false, error: "Missing action" });
    }

    switch (action) {
      case "createRaw":
        if (!body.content) {
          return jsonResponse({ ok: false, error: "Missing content" });
        }
        createRawEntry(body.content);
        return jsonResponse({ ok: true });

      case "createInbox":
        if (!body.content) {
          return jsonResponse({ ok: false, error: "Missing content" });
        }
        createInboxItem(body.content);
        return jsonResponse({ ok: true });

      case "createPerson":
        createPerson(body.name, body.privacy, body.notes || "");
        return jsonResponse({ ok: true });

      case "createInteraction":
        createInteraction(body.personId, body.notes || "", false, "");
        return jsonResponse({ ok: true });

      default:
        return jsonResponse({ ok: false, error: "Unknown action: " + action });
    }
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

function doGet(e) {
  const wantsApi = e && e.parameter && e.parameter.api === "1";

  if (wantsApi) {
    const action = e.parameter.action;
    if (!action) {
      return jsonResponse({ ok: false, error: "Missing action parameter" });
    }

    const payload = JSON.parse(e.parameter.payload || "{}");

    switch (action) {
      case "createRaw":
        if (!payload.content) {
          return jsonResponse({ ok: false, error: "Missing content" });
        }
        createRawEntry(payload.content);
        return jsonResponse({ ok: true });

      case "createInbox":
        if (!payload.content) {
          return jsonResponse({ ok: false, error: "Missing content" });
        }
        createInboxItem(payload.content);
        return jsonResponse({ ok: true });

      case "createPerson":
        if (!payload.name) {
          return jsonResponse({ ok: false, error: "Missing name" });
        }
        createPerson(payload.name, payload.privacy, payload.notes || "");
        return jsonResponse({ ok: true });

      case "createInteraction":
        if (!payload.personId) {
          return jsonResponse({ ok: false, error: "Missing personId" });
        }
        createInteraction(payload.personId, payload.notes || "", false, "");
        return jsonResponse({ ok: true });

      case "listPeople":
        return jsonResponse(listPeople());

      case "list_open_tasks":
        return jsonResponse(listOpenTasks());

      case "complete_task":
        if (!payload.task_id) {
          return jsonResponse({ ok: false, error: "Missing task_id" });
        }
        completeTask(payload.task_id, payload.completion_note || "");
        return jsonResponse({ ok: true });

      case "cancel_task":
        if (!payload.task_id) {
          return jsonResponse({ ok: false, error: "Missing task_id" });
        }
        cancelTask(payload.task_id);
        return jsonResponse({ ok: true });

      case "auto_promote_inbox":
        const raw = listInboxItems();
        let items = [];
        if (Array.isArray(raw)) {
          items = raw;
        } else if (raw && Array.isArray(raw.items)) {
          items = raw.items;
        } else {
          items = [];
        }
        
        let promotedCount = 0;
        
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          let inboxId = null;
          
          if (Array.isArray(item)) {
            inboxId = item[0];
          } else if (item && typeof item === 'object') {
            inboxId = item.inbox_id || item.inboxId || item.id;
          }
          
          if (!inboxId) {
            continue;
          }
          
          const trimmedId = String(inboxId).trim();
          const taskId = promoteInboxToTask(trimmedId, {});
          if (taskId) {
            promotedCount++;
          }
        }
        
        return jsonResponse({ ok: true, promoted_count: promotedCount });

      case "set_task_timing":
        if (!payload.task_id) {
          return jsonResponse({ ok: false, error: "Missing task_id" });
        }
        setTaskTiming(payload.task_id, {
          due_at: payload.due_at,
          due_window: payload.due_window,
          reminder_rule: payload.reminder_rule
        });
        return jsonResponse({ ok: true });

      case "set_task_recurrence":
        if (!payload.task_id) {
          return jsonResponse({ ok: false, error: "Missing task_id" });
        }
        setTaskRecurrence(payload.task_id, {
          recurrence_rule: payload.recurrence_rule,
          recurrence_anchor: payload.recurrence_anchor
        });
        return jsonResponse({ ok: true });

      case "list_commitments":
        return jsonResponse(listCommitments());

      default:
        return jsonResponse({ ok: false, error: "Unknown action: " + action });
    }
  }

  const page = e && e.parameter && e.parameter.page;
  
  if (page === "execution") {
    return HtmlService
      .createHtmlOutputFromFile("mobile_execution_v1")
      .setTitle("Personal OS - Execution")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  if (page === "briefs") {
    return HtmlService
      .createHtmlOutputFromFile("mobile_capture_v1")
      .setTitle("Personal OS - Briefs")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  return HtmlService
    .createHtmlOutputFromFile("mobile_capture_v1")
    .setTitle("Personal OS")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doOptions() {
  return ContentService.createTextOutput("")
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}
