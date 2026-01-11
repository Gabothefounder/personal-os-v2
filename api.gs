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
  try {
    const wantsApi = e?.parameter?.api === "1";
    const action = e?.parameter?.action;
    const payload = e.parameter.payload
      ? JSON.parse(e.parameter.payload)
      : {};

    if (!wantsApi || !action) {
      return HtmlService.createHtmlOutput("Personal OS");
    }

    switch (action) {
      case "createRaw":
        if (!payload.content) throw new Error("Missing content");
        createRawEntry(payload.content);
        return jsonResponse({ ok: true });

      case "createInbox":
        if (!payload.content) throw new Error("Missing content");
        createInboxItem(payload.content);
        return jsonResponse({ ok: true });

      case "createPerson":
        if (!payload.name) throw new Error("Missing name");
        createPerson(
          payload.name,
          payload.privacy || "private_only",
          payload.notes || ""
        );
        return jsonResponse({ ok: true });

      case "createInteraction":
        if (!payload.personId) throw new Error("Missing personId");
        createInteraction(
          payload.personId,
          payload.notes || "",
          false,
          ""
        );
        return jsonResponse({ ok: true });

      case "listPeople":
        return jsonResponse(listPeople());

      default:
        return jsonResponse({ ok: false, error: "Unknown action" });
    }

  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

function jsonResponse(payload, statusCode = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function doOptions() {
  return ContentService.createTextOutput("")
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}
