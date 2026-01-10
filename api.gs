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
  const wantsApi =
    (e && e.parameter && e.parameter.api === "1") ||
    (e && e.headers && e.headers.Accept && e.headers.Accept.indexOf("application/json") !== -1);

  if (wantsApi) {
    const action = e.parameter.action;

    if (action === "listPeople") {
      return jsonResponse(listPeople());
    }

    return jsonResponse({ ok: false, error: "Unknown GET action" });
  }

  // Fallback: legacy UI or placeholder
  return HtmlService.createHtmlOutput("Personal OS API is running");
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
