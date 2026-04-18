const form = document.getElementById("events-form");
const submitButton = document.getElementById("submit-button");
const statusText = document.getElementById("status-text");
const resultCard = document.getElementById("result-card");
const conversationField = document.getElementById("conversationId");
const scoutButtons = document.querySelectorAll("[data-prefill]");

const savedConversationId = sessionStorage.getItem("difyConversationId");
if (savedConversationId && !conversationField.value) {
  conversationField.value = savedConversationId;
}

for (const button of scoutButtons) {
  button.addEventListener("click", () => {
    form.interests.value = button.dataset.prefill || "";
    document.getElementById("event-search").scrollIntoView({ behavior: "smooth", block: "start" });
    form.interests.focus();
  });
}

form.addEventListener("submit", async event => {
  event.preventDefault();

  const payload = {
    interests: form.interests.value,
    dateRange: form.dateRange.value,
    city: form.city.value,
    maxEvents: form.maxEvents.value,
    notes: form.notes.value,
    conversationId: form.conversationId.value
  };

  setLoading(true);
  setResult('<div class="status-badge">Searching upcoming events</div>');
  statusText.textContent = "Waiting for your Dify agent...";

  try {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      const details = typeof data.details === "string"
        ? data.details
        : JSON.stringify(data.details || {}, null, 2);

      throw new Error(`${data.error || "Request failed"}${details ? `\n\n${details}` : ""}`);
    }

    if (data.conversationId) {
      conversationField.value = data.conversationId;
      sessionStorage.setItem("difyConversationId", data.conversationId);
    }

    setResult(renderMarkdown(data.answer || "No answer returned."));
    statusText.textContent = "Results ready. You can refine the query and search again.";
  } catch (error) {
    setResult(`
      <h3>Something went wrong</h3>
      <pre>${escapeHtml(error.message || "Unknown error")}</pre>
    `);
    statusText.textContent = "The request failed. Check your Dify config and try again.";
  } finally {
    setLoading(false);
  }
});

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "Finding Events..." : "Find Events";
}

function setResult(html) {
  resultCard.classList.remove("empty");
  resultCard.innerHTML = html;
}

function renderMarkdown(markdown) {
  const rich = renderEventCards(markdown);
  if (rich) {
    return rich;
  }

  const blocks = escapeHtml(markdown).split(/\n\s*\n/);

  return blocks.map(renderBlock).join("");
}

function renderEventCards(markdown) {
  const text = String(markdown || "").trim();
  if (!text) {
    return "";
  }

  const segments = text.split(/\n\s*(?=\d+\)\s+)/);
  if (segments.length < 2) {
    return "";
  }

  const overview = segments.shift()?.trim() || "";
  const eventCards = [];
  const notes = [];

  for (const segment of segments) {
    const event = parseEventSegment(segment.trim());
    if (event) {
      eventCards.push(event);
    } else {
      notes.push(segment.trim());
    }
  }

  if (!eventCards.length) {
    return "";
  }

  const overviewHtml = overview
    ? `<section class="result-overview"><h3>Overview</h3><p>${renderInline(escapeHtml(cleanMarkdownDecorators(overview))).replace(/\n/g, "<br />")}</p></section>`
    : "";

  const cardsHtml = eventCards.map((event, index) => {
    const meta = [event.date, event.location, event.confidence].filter(Boolean)
      .map(item => `<span>${escapeHtml(cleanMarkdownDecorators(item))}</span>`)
      .join("");

    const why = event.why ? `
      <div class="event-field">
        <strong>Why it matches</strong>
        <div>${renderInline(escapeHtml(event.why))}</div>
      </div>
    ` : "";

    const fit = event.fit ? `
      <div class="event-field">
        <strong>Student fit</strong>
        <div>${renderInline(escapeHtml(event.fit))}</div>
      </div>
    ` : "";

    const link = event.link ? `<a class="event-link" href="${escapeHtml(event.link)}" target="_blank" rel="noreferrer">Open Event Link</a>` : "";

    return `
      <article class="event-card">
        <div class="event-card-header">
          <div>
            <h3>${escapeHtml(cleanMarkdownDecorators(event.title || `Event ${index + 1}`))}</h3>
            ${meta ? `<div class="event-meta">${meta}</div>` : ""}
          </div>
          <div class="event-index">${index + 1}</div>
        </div>
        <div class="event-body">
          ${why}
          ${fit}
          ${link}
        </div>
      </article>
    `;
  }).join("");

  const notesHtml = notes.length
    ? `<section class="result-notes"><h3>Notes</h3><p>${renderInline(escapeHtml(cleanMarkdownDecorators(notes.join("\n\n")))).replace(/\n/g, "<br />")}</p></section>`
    : "";

  return `
    <div class="results-shell">
      ${overviewHtml}
      <section class="events-grid">${cardsHtml}</section>
      ${notesHtml}
    </div>
  `;
}

function parseEventSegment(segment) {
  const cleaned = segment.replace(/^\d+\)\s*/, "").replace(/\n+/g, " ").trim();
  if (!cleaned) {
    return null;
  }

  const titleMatch = cleaned.match(/^(.*?)(?=\s+-\s+Date:|\s+Date:|$)/i);
  const date = matchField(cleaned, "Date");
  const location = matchField(cleaned, "Location");
  const why = matchField(cleaned, "Why it matches");
  const fit = matchField(cleaned, "Student fit");
  const confidence = matchField(cleaned, "Confidence");
  const link = matchField(cleaned, "Link");

  return {
    title: titleMatch ? titleMatch[1].trim().replace(/\s+-\s*$/, "") : "",
    date,
    location,
    why,
    fit,
    confidence,
    link
  };
}

function matchField(text, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`${escaped}:\\s*(.*?)(?=\\s+-\\s+[A-Z][^:]*:|$)`, "i");
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}

function cleanMarkdownDecorators(text) {
  return String(text || "")
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/^[\-\s]+/, "")
    .trim();
}

function renderBlock(block) {
  const trimmed = block.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("- ")) {
    const items = trimmed
      .split("\n")
      .filter(line => line.startsWith("- "))
      .map(line => `<li>${renderInline(line.slice(2))}</li>`)
      .join("");

    return `<ul>${items}</ul>`;
  }

  if (trimmed.startsWith("### ")) {
    return `<h3>${renderInline(trimmed.slice(4))}</h3>`;
  }

  if (trimmed.startsWith("## ")) {
    return `<h2>${renderInline(trimmed.slice(3))}</h2>`;
  }

  if (trimmed.startsWith("# ")) {
    return `<h1>${renderInline(trimmed.slice(2))}</h1>`;
  }

  return `<p>${renderInline(trimmed).replace(/\n/g, "<br />")}</p>`;
}

function renderInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
