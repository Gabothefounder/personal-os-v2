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
        } else if (raw && Array.isArray(raw.data)) {
          items = raw.data;
        } else {
          items = [];
        }
        
        let promotedCount = 0;
        let skippedMissingId = 0;
        
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          let inboxId = null;
          
          if (Array.isArray(item)) {
            inboxId = item[0];
          } else if (item && typeof item === 'object') {
            inboxId = item.inbox_id || item.inboxId || item.id;
          }
          
          if (!inboxId) {
            skippedMissingId++;
            continue;
          }
          
          try {
            const taskId = promoteInboxToTask(inboxId, {});
            if (taskId) {
              promotedCount++;
            }
          } catch (e) {
            // Continue with next item on error
          }
        }
        
        if (items.length > 0 && promotedCount === 0) {
          return jsonResponse({
            ok: false,
            error: "auto_promote_inbox: items detected but none promoted",
            debug: {
              items_len: items.length,
              first_item_type: items[0] === null ? "null" : Array.isArray(items[0]) ? "array" : typeof items[0],
              first_item_keys: (items[0] && !Array.isArray(items[0]) && typeof items[0] === "object") ? Object.keys(items[0]) : null,
              skipped_missing_id: skippedMissingId
            }
          });
        }
        
        return jsonResponse({ ok: true, promoted_count: promotedCount, inbox_items_seen: items.length, skipped_missing_id: skippedMissingId });

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
