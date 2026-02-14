import { useEffect, useState } from 'react'
import './App.css'


export default function App() {



const defaultEntries = [
  { id: 1, type: "character", name: "Sidriel", summary: "A quiet political architect with a fondness for crystal butterflies", tags: [] },
  { id: 2, type: "character", name: "Isarion", summary: "Elder dragon in human guise; cold, brash, loyal.", tags: [] },
  { id: 3, type: "location", name: "Warden's Rest", summary: "A sunlit glade that feels fae-adjacent and safe.", tags: [] },
  { id: 4, type: "faction", name: "The Church", summary: "Radiance doctrine; inquisitions; moral authority as control.", tags: [] }
]


const ENTRY_TYPES = ["character", "location", "faction", "term"];
const [newEntryType, setNewEntryType] = useState("term");

const [entries, setEntries] = useState(() => {
  const raw = localStorage.getItem("codexEntries:v1");
  return raw ? JSON.parse(raw) : defaultEntries;
});

const [selectedID, setSelectedID] = useState(entries[0]?.id ?? null);
const selected = entries.find((e) => e.id === selectedID) ?? null;

const [tagInput, setTagInput] = useState("");

const [query, setQuery] = useState("");


useEffect(() => {
  localStorage.setItem("codexEntries:v1", JSON.stringify(entries));
}, [entries]);

// One-time normalize: ensure tags exists on all entries (old saves won't have it)
useEffect(() => {
  setEntries((prev) =>
    prev.map((e) => ({
      ...e,
      tags: Array.isArray(e.tags) ? e.tags : [],
    }))
  );
}, []);

function createEntry(type = "term") {
  const id = crypto.randomUUID();
  const newEntry = { id, type, name: "Untitled", summary: "", tags: [] };
  setEntries((prev) => [newEntry, ...prev]);
  setSelectedID(id);
}
function updateEntry(id, patch) {
  setEntries((prev) =>
    prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
  );
}


function deleteEntry(id) {
  const entry = entries.find((e) => e.id === id);
  if (!entry) return;

  const ok = window.confirm(
    `Delete "${entry.name || "Untitled"}" (${entry.type})?\n\nThis cannot be undone.`
  );
  if (!ok) return;

  // Precompute a sensible next selection BEFORE it is removed
  const sameType = entries.filter((e) => e.type === entry.type);
  const idxInType = sameType.findIndex((e) => e.id === id);

  const nextInType =
    idxInType >= 0 ? sameType[idxInType + 1]?.id ?? null : null;
  const prevInType =
    idxInType > 0 ? sameType[idxInType - 1]?.id ?? null : null;

  // Remove entry
  setEntries((prev) => prev.filter((e) => e.id !== id));

  // Update selection
  if (selectedID === id) {
    const remaining = entries.filter((e) => e.id !== id);
    const fallback =
      nextInType ??
      prevInType ??
      remaining[0]?.id ??
      null;

    setSelectedID(fallback);
  }
}




function exportJSON() {
  const payload = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    entries,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `worldbuilders-codex-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importJSONFromFile(file) {
  const reader = new FileReader();

  reader.onload = () => {
    try {
      const text = reader.result;
      const data = JSON.parse(String(text));

      // Accept either { entries: [...] } or just [...]
      const incomingEntries = Array.isArray(data) ? data : data?.entries;
      if (!Array.isArray(incomingEntries)) {
        alert("Import failed: JSON must be an array of entries or an object with an 'entries' array.");
        return;
      }

      // Light validation / normalization
      const normalized = incomingEntries
        .filter((e) => e && e.id && e.type && typeof e.name === "string")
        .map((e) => ({
          id: e.id,
          type: e.type,
          name: e.name,
          summary: typeof e.summary === "string" ? e.summary : "",
          tags: Array.isArray(e.tags) ? e.tags : [],
        }));
      if (normalized.length === 0) {
        alert("Import failed: No valid entries found.");
        return;
      }

      const ok = confirm(
        `Import ${normalized.length} entries?\n\nOK = Replace current entries\nCancel = Do nothing`
      );
      if (!ok) return;

      setEntries(normalized);
      setSelectedID(normalized[0]?.id ?? null);
    } catch (err) {
      console.error(err);
      alert("Import failed: invalid JSON.");
    }
  };

  reader.readAsText(file);
}


function normalizeTag(raw) {
  let t = String(raw ?? "").trim().toLowerCase();
  if (!t) return "";

  //treat spaces/underscores as dashes
  t = t.replace(/[\s_]+/g, "-");

  // keep only a-z 0-9 and -
  t = t.replace(/[^a-z0-9-]/g, "");

  // collapse multiple dashes
 t = t.replace(/-+/g, "-");

  // trim dashes on ends
  t = t.replace(/^-+|-+$/g, "");

  return t;
}

function addTag(entryId, rawTag) {
  const tag = normalizeTag(rawTag);
  if (!tag) return;

  setEntries((prev) =>
    prev.map((e) => {
      if (e.id !== entryId) return e;
       const tags = Array.isArray(e.tags) ? e.tags : [];
      if (tags.includes(tag)) return e;
      return { ...e, tags: [...tags, tag] };
    })
  );
}

function removeTag(entryId, tag) {
  setEntries((prev) =>
    prev.map((e) => {
      if (e.id !== entryId) return e;
      const tags = Array.isArray(e.tags) ? e.tags : [];
      return { ...e, tags: tags.filter((t) => t !== tag) };
    })
  );
}



const q = query.trim().toLowerCase();
const hasQuery = q.length > 0;

function entryMatches(e) {
  if (!hasQuery) return true;
  const name = String(e.name ?? "").toLowerCase();
  if (name.includes(q)) return true;

  const tags = Array.isArray(e.tags) ? e.tags : [];
  return tags.some((t) => String(t).toLowerCase().includes(q));
}

const matchedEntries = entries.filter(entryMatches);
const hasResults = matchedEntries.length > 0;


  return (
    
    <div className="min-h-screen bg-[#f4efe6] text-slate-900">
      <div className="mx-auto max-w-6xl p-4">
        <header className="mb-4 flex items-baseline justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Worldbuilder’s Codex</h1>
          <div className="text-sm text-slate-600">Local • No backend</div>
        </header>

        <div className="grid grid-cols-12 gap-4">
          <aside className="col-span-12 md:col-span-4 rounded-xl border border-slate-300 bg-white/60 p-3">
            <div className="mb-3">
              <input
          placeholder="Search… (name or tag)"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
            </div>


            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-medium text-slate-700">Entries</div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Create */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={newEntryType}
                    onChange={(e) => setNewEntryType(e.target.value)}
                    className="rounded-md border border-slate-300 bg-white/70 px-2 py-1 text-xs text-slate-800"
                  >
                    {ENTRY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t[0].toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => createEntry(newEntryType)}
                    className="rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-slate-50 hover:bg-slate-800"
                  >
                    + New
                  </button>
                </div>

                {/* Divider */}
                <span className="mx-1 hidden h-6 w-px bg-slate-300 md:inline-block" />

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => selectedID && deleteEntry(selectedID)}
                    disabled={!selectedID}
                    className="rounded-md border border-rose-300 bg-white/70 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete
                  </button>

                  <button
                    onClick={exportJSON}
                    className="rounded-md border border-slate-300 bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-white"
                  >
                    Export
                  </button>

                  <input
                    type="file"
                    accept="application/json"
                    id="import-json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      importJSONFromFile(file);

                      // allow re-importing the same file later
                      e.target.value = "";
                    }}
                  />

                  <button
                    onClick={() => document.getElementById("import-json")?.click()}
                    className="rounded-md border border-slate-300 bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-white"
                  >
                    Import
                  </button>
                </div>
              </div>
            </div>



              {hasQuery && !hasResults && (
                <div className="mb-3 rounded-md border border-slate-300 bg-white/70 px-2 py-2 text-xs text-slate-600">
                  No results for “{query.trim()}”.
                </div>
              )}

              {ENTRY_TYPES.map((type) => {
                const items = entries
                  .filter((e) => e.type === type)
                  .filter(entryMatches);

                // Polished behavior: hide empty groups while searching
                if (hasQuery && items.length === 0) return null;

                return (
                  <div key={type} className="mb-4">
                    <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-700">
                      {type}s
                    </h2>

                    <ul className="space-y-1">
                      {items.map((e) => (
                        <li
                          key={e.id}
                          onClick={() => setSelectedID(e.id)}
                          className={`cursor-pointer rounded-md px-2 py-1 hover:bg-slate-200/60 ${
                            selectedID === e.id ? "bg-slate-200/80 font-medium" : ""
                          }`}
                        >
                          {e.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}


          </aside>

         <main className="col-span-12 md:col-span-8 rounded-xl border border-slate-300 bg-white/60 p-4">
  {selected ? (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-wide text-slate-600">
        {selected.type}
      </div>

      <input
        className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-2xl font-semibold outline-none focus:border-slate-400"
        value={selected.name}
        onChange={(ev) => updateEntry(selected.id, { name: ev.target.value })}
      />

      <textarea
        className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-slate-800 outline-none focus:border-slate-400"
        rows={6}
        placeholder="Summary…"
        value={selected.summary}
        onChange={(ev) =>
          updateEntry(selected.id, { summary: ev.target.value })
        }
      />
            {/* Tags */}
<div className="space-y-2">
  <div className="text-xs font-medium text-slate-700">Tags</div>

  <div className="flex flex-wrap gap-2">
    {(selected.tags ?? []).map((t) => (
      <button
        key={t}
        type="button"
        onClick={() => removeTag(selected.id, t)}
        className="flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
        title="Remove tag"
      >
        <span>{t}</span>
        <span className="text-slate-500">×</span>
      </button>
    ))}
    {(selected.tags ?? []).length === 0 && (
      <div className="text-xs text-slate-500">No tags yet</div>
    )}
  </div>

  <input
    className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-sm outline-none focus:border-slate-400"
    placeholder="Add tag (letters/numbers/-), press Enter…"
    value={tagInput}
    onChange={(e) => setTagInput(e.target.value)}
    onKeyDown={(e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      addTag(selected.id, tagInput);
      setTagInput("");
    }}
  />
</div>

                  <div className="text-xs text-slate-500">
                    
                    Autosaved locally
                  </div>
                </div>
              ) : (
                <div className="text-slate-600">Select an entry</div>
              )}
            </main>


          <div className="text-slate-600">
            {entries.length === 0 ? "No entries yet. Create one!" : "Select an entry"}
          </div>


        </div>
      </div>
    </div>
  )

}
