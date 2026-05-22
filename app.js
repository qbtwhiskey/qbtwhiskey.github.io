const reviews = Array.isArray(window.TBT_REVIEWS) ? window.TBT_REVIEWS : [];
const stats = window.TBT_STATS || {};

const state = {
  query: "",
  category: "all",
  status: "all",
  sort: "ready",
  quick: "",
  visible: 24
};

const els = {
  header: document.querySelector("[data-header]"),
  grid: document.querySelector("#review-grid"),
  search: document.querySelector("#review-search"),
  category: document.querySelector("#category-filter"),
  status: document.querySelector("#status-filter"),
  sort: document.querySelector("#sort-filter"),
  quickFilters: document.querySelector("#quick-filters"),
  count: document.querySelector("#results-count"),
  clear: document.querySelector("#clear-filters"),
  loadMore: document.querySelector("#load-more"),
  dialog: document.querySelector("#review-dialog"),
  dialogContent: document.querySelector("#dialog-content"),
  dialogClose: document.querySelector("#dialog-close")
};

const quickFilters = [
  "Bourbon",
  "Rye",
  "Bottled in bond",
  "Barrel proof",
  "Single barrel",
  "Store pick",
  "Finished",
  "Allocated",
  "Scotch",
  "Irish Whiskey"
];

const escaped = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const normalized = (value) => String(value ?? "").trim().toLowerCase();

const displayDateLabel = (value) => {
  const monthNames = {
    Jan: "January",
    Feb: "February",
    Mar: "March",
    Apr: "April",
    May: "May",
    Jun: "June",
    Jul: "July",
    Aug: "August",
    Sep: "September",
    Oct: "October",
    Nov: "November",
    Dec: "December"
  };
  const label = String(value || "Date TBD");
  return label.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g, (match) => monthNames[match]);
};

const getSearchText = (review) => {
  const notes = review.notes || {};
  return [
    review.bottle,
    review.category,
    review.classification,
    review.dateLabel,
    review.summary,
    review.sourceFile,
    review.proof,
    review.price,
    ...(review.tags || []),
    ...(review.reviewers || []),
    notes.nose,
    notes.palate,
    notes.finish,
    notes.table
  ].join(" ");
};

const isTranscribed = (review) => review.status === "sample_transcribed";

const statusLabel = (review) =>
  isTranscribed(review) ? "Notes published" : "Reviewed, notes pending";

const transcriptionStatus = (review) => {
  if (isTranscribed(review)) return "Standardized notes";
  return review.localPdfAvailable
    ? "We have the original sheet locally and are standardizing the handwritten tasting notes."
    : "This pour is indexed from the handwritten archive and still needs the original tasting notes added.";
};

const displaySummary = (review) =>
  isTranscribed(review)
    ? review.summary
    : "Reviewed by The Table. Handwritten tasting notes are being standardized for publication.";

const styleMatches = (review, value) => {
  if (!value) return true;
  const target = normalized(value);
  const category = normalized(review.category);
  const classification = normalized(review.classification);
  const tags = (review.tags || []).map(normalized);
  return category === target || classification === target || tags.includes(target);
};

const monthSortValue = (review) => {
  if (!review.year) return 0;
  return review.year * 100 + (review.month || 0);
};

const bottleFamily = (review) => {
  const stop = new Set([
    "the",
    "and",
    "single",
    "barrel",
    "proof",
    "bourbon",
    "rye",
    "whiskey",
    "reserve",
    "select",
    "private",
    "store",
    "pick",
    "bib",
    "bottled",
    "bond",
    "batch",
    "year",
    "yr"
  ]);
  return normalized(review.bottle)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stop.has(word))
    .slice(0, 3);
};

const findRelated = (review, limit = 3) => {
  const sourceTags = new Set((review.tags || []).map(normalized));
  const sourceFamily = new Set(bottleFamily(review));

  return reviews
    .filter((candidate) => candidate.id !== review.id)
    .map((candidate) => {
      let score = 0;
      if (normalized(candidate.category) === normalized(review.category)) score += 4;
      if (normalized(candidate.classification) === normalized(review.classification)) score += 2;
      for (const tag of candidate.tags || []) {
        if (sourceTags.has(normalized(tag))) score += 3;
      }
      for (const word of bottleFamily(candidate)) {
        if (sourceFamily.has(word)) score += 2;
      }
      if (review.year && candidate.year && Math.abs(review.year - candidate.year) <= 1) score += 1;
      if (isTranscribed(candidate)) score += 1;
      return { candidate, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || monthSortValue(b.candidate) - monthSortValue(a.candidate))
    .slice(0, limit)
    .map((item) => item.candidate);
};

const populateStats = () => {
  for (const [key, value] of Object.entries(stats)) {
    const target = document.querySelector(`[data-stat="${key}"]`);
    if (target && value !== null && value !== undefined) target.textContent = value;
  }
};

const populateCategories = () => {
  const categories = [...new Set(reviews.map((review) => review.category).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    els.category.append(option);
  }
};

const renderQuickFilters = () => {
  els.quickFilters.innerHTML = quickFilters
    .map((filter) => {
      const count = reviews.filter((review) => styleMatches(review, filter)).length;
      if (!count) return "";
      const active = state.quick === filter ? " is-active" : "";
      return `<button class="chip${active}" type="button" data-filter="${escaped(filter)}">${escaped(filter)} <span>${count}</span></button>`;
    })
    .join("");
};

const getFilteredReviews = () => {
  const query = normalized(state.query);
  const filtered = reviews.filter((review) => {
    if (state.category !== "all" && normalized(review.category) !== normalized(state.category)) return false;
    if (state.status !== "all" && review.status !== state.status) return false;
    if (state.quick && !styleMatches(review, state.quick)) return false;
    if (query && !normalized(getSearchText(review)).includes(query)) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (state.sort === "ready") {
      const ready = Number(isTranscribed(b)) - Number(isTranscribed(a));
      if (ready) return ready;
      return monthSortValue(b) - monthSortValue(a) || a.bottle.localeCompare(b.bottle);
    }
    if (state.sort === "az") return a.bottle.localeCompare(b.bottle);
    if (state.sort === "oldest") return monthSortValue(a) - monthSortValue(b) || a.bottle.localeCompare(b.bottle);
    return monthSortValue(b) - monthSortValue(a) || a.bottle.localeCompare(b.bottle);
  });

  return filtered;
};

const renderCard = (review) => {
  const tags = (review.tags || []).slice(0, 3);
  const note = displaySummary(review);
  const proof = review.proof ? `${escaped(review.proof)} proof` : "Proof pending";
  const price = review.price ? escaped(review.price) : "Price pending";

  return `
    <article class="review-card" role="button" tabindex="0" data-review-id="${escaped(review.id)}">
      <div>
        <div class="card-top">
          <span class="badge">${escaped(review.category || "Whiskey")}</span>
          <span class="badge${isTranscribed(review) ? " is-live" : ""}">${statusLabel(review)}</span>
        </div>
        <h3>${escaped(review.bottle)}</h3>
        <p>${escaped(note)}</p>
      </div>
      <div>
        <div class="card-tags">
          ${tags.map((tag) => `<span class="tag">${escaped(tag)}</span>`).join("")}
        </div>
        <div class="card-meta">
          <span>${escaped(displayDateLabel(review.dateLabel))}</span>
          <span>${proof}</span>
          <span>${price}</span>
        </div>
      </div>
    </article>
  `;
};

const renderReviews = () => {
  const filtered = getFilteredReviews();
  const visible = filtered.slice(0, state.visible);
  els.grid.innerHTML = visible.length
    ? visible.map(renderCard).join("")
    : `<div class="empty-state">No pours match those filters yet. Clear the filters or try a broader search.</div>`;

  els.count.textContent = `${filtered.length} review${filtered.length === 1 ? "" : "s"} found`;
  els.loadMore.hidden = state.visible >= filtered.length;
  renderQuickFilters();
};

const setQuickFilter = (value) => {
  state.quick = state.quick === value ? "" : value;
  state.visible = 24;
  renderReviews();
  document.querySelector("#archive")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const noteBox = (title, value) => `
  <div class="note-box">
    <strong>${escaped(title)}</strong>
    <p>${escaped(value)}</p>
  </div>
`;

const externalLinks = (review) => {
  const query = encodeURIComponent(`${review.bottle} whiskey review`);
  const similar = encodeURIComponent(`${review.bottle} similar bourbon whiskey`);
  return [
    {
      title: "Search wider reviews",
      text: "Open a web search for this bottle across review sites.",
      href: `https://www.google.com/search?q=${query}`
    },
    {
      title: "Find similar profiles",
      text: "Look for bottles with a similar flavor or style profile.",
      href: `https://www.google.com/search?q=${similar}`
    },
    {
      title: "Learn the style",
      text: `Explore background on ${review.category || "whiskey"} before the next pour.`,
      href: `https://www.google.com/search?q=${encodeURIComponent(`${review.category || "whiskey"} whiskey style guide`)}`
    }
  ];
};

const openReview = (review) => {
  const notes = review.notes || {};
  const related = findRelated(review, 3);
  const tags = (review.tags || []).map((tag) => `<span class="chip">${escaped(tag)}</span>`).join("");
  const hasNotes = isTranscribed(review);
  const notesMarkup = hasNotes
    ? `
      <h3 class="dialog-section-title">Tasting Notes</h3>
      <div class="note-grid">
        ${noteBox("Nose", notes.nose)}
        ${noteBox("Palate", notes.palate)}
        ${noteBox("Finish", notes.finish)}
      </div>

      <h3 class="dialog-section-title">Table Read</h3>
      <div class="note-box">
        <strong>What stuck with us</strong>
        <p>${escaped(notes.table || review.summary)}</p>
      </div>
    `
    : `
      <h3 class="dialog-section-title">Transcription Status</h3>
      <div class="transcription-notice">
        <strong>Reviewed by The Table, with tasting notes pending.</strong>
        <p>${escaped(transcriptionStatus(review))}</p>
        <p>Source file: ${escaped(review.sourceFile || "Unknown")}</p>
        <p>Once the sheet is standardized, the Nose, Palate, Finish, and Table Read sections will appear here.</p>
      </div>
    `;

  els.dialogContent.innerHTML = `
    <section class="dialog-hero">
      <div class="card-tags">${tags}</div>
      <h2 id="dialog-title">${escaped(review.bottle)}</h2>
      <p>${escaped(displaySummary(review))}</p>
      <div class="dialog-meta">
        <div class="meta-cell"><small>Style</small><span>${escaped(review.classification || review.category || "Whiskey")}</span></div>
        <div class="meta-cell"><small>Date</small><span>${escaped(displayDateLabel(review.dateLabel))}</span></div>
        <div class="meta-cell"><small>Proof</small><span>${escaped(review.proof || "Pending")}</span></div>
        <div class="meta-cell"><small>Status</small><span>${escaped(statusLabel(review))}</span></div>
      </div>
    </section>

    ${notesMarkup}

    <h3 class="dialog-section-title">Similar Pours From The Handwritten Archive</h3>
    <div class="related-grid">
      ${
        related.length
          ? related
              .map(
                (item) => `
                  <button class="related-card" type="button" data-review-id="${escaped(item.id)}">
                    <strong>${escaped(item.bottle)}</strong>
                    <span>${escaped(item.category)} | ${escaped(displayDateLabel(item.dateLabel))}</span>
                    <span>${escaped(displaySummary(item))}</span>
                  </button>
                `
              )
              .join("")
          : `<div class="empty-state">No close matches found yet.</div>`
      }
    </div>

    <h3 class="dialog-section-title">Explore Beyond The Table</h3>
    <div class="external-links">
      ${externalLinks(review)
        .map(
          (link) => `
            <a class="external-link" href="${escaped(link.href)}" target="_blank" rel="noreferrer">
              <strong>${escaped(link.title)}</strong>
              <span>${escaped(link.text)}</span>
            </a>
          `
        )
        .join("")}
    </div>
  `;

  if (!els.dialog.open) els.dialog.showModal();
};

const bindEvents = () => {
  window.addEventListener("scroll", () => {
    els.header.classList.toggle("is-scrolled", window.scrollY > 16);
  });

  els.search.addEventListener("input", (event) => {
    state.query = event.target.value;
    state.visible = 24;
    renderReviews();
  });

  els.category.addEventListener("change", (event) => {
    state.category = event.target.value;
    state.visible = 24;
    renderReviews();
  });

  els.status.addEventListener("change", (event) => {
    state.status = event.target.value;
    state.visible = 24;
    renderReviews();
  });

  els.sort.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderReviews();
  });

  els.quickFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (button) setQuickFilter(button.dataset.filter);
  });

  document.querySelector("#explore-grid")?.addEventListener("click", (event) => {
    const tile = event.target.closest("[data-explore]");
    if (tile) setQuickFilter(tile.dataset.explore);
  });

  els.grid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-review-id]");
    if (!card) return;
    const review = reviews.find((item) => item.id === card.dataset.reviewId);
    if (review) openReview(review);
  });

  els.grid.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest("[data-review-id]");
    if (!card) return;
    event.preventDefault();
    const review = reviews.find((item) => item.id === card.dataset.reviewId);
    if (review) openReview(review);
  });

  els.dialogContent.addEventListener("click", (event) => {
    const related = event.target.closest(".related-card[data-review-id]");
    if (!related) return;
    const review = reviews.find((item) => item.id === related.dataset.reviewId);
    if (review) openReview(review);
  });

  els.dialogClose.addEventListener("click", () => els.dialog.close());

  els.loadMore.addEventListener("click", () => {
    state.visible += 24;
    renderReviews();
  });

  els.clear.addEventListener("click", () => {
    state.query = "";
    state.category = "all";
    state.status = "all";
    state.sort = "ready";
    state.quick = "";
    state.visible = 24;
    els.search.value = "";
    els.category.value = "all";
    els.status.value = "all";
    els.sort.value = "ready";
    renderReviews();
  });
};

populateStats();
populateCategories();
renderQuickFilters();
renderReviews();
bindEvents();
