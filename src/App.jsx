import { useEffect, useState } from 'react'
import './App.css'





export default function App() {



const defaultEntries = [
  { id: 1, type: "character", name: "Sidriel", summary: "A quiet political architect with a fondness for crystal butterflies" },
  { id: 2, type: "character", name: "Isarion", summary: "Elder dragon in human guise; cold, brash, loyal."},
  { id: 3, type: "location", name: "Warden's Rest", summary: "A sunlit glade that feels fae-adjacent and safe." },
  { id: 4, type: "faction", name: "The Church", summary: "Radiance doctrine; inquisitions; moral authority as control."}
]


const ENTRY_TYPES = ["character", "location", "faction", "term"];
const [newEntryType, setNewEntryType] = useState("term");

const [entries, setEntries] = useState(() => {
  const raw = localStorage.getItem("codexEntries:v1");
  return raw ? JSON.parse(raw) : defaultEntries;
});

const [selectedID, setSelectedID] = useState(entries[0]?.id ?? null);
const selected = entries.find(e => e.id === selectedID);


useEffect(() => {
  localStorage.setItem("codexEntries:v1", JSON.stringify(entries));
}, [entries]);


function createEntry(type = "term") {
  const id = crypto.randomUUID();

  const newEntry = {
    id,
    type,
    name: "Untitled",
    summary: "",
  };

  setEntries((prev) => [newEntry, ...prev]);
  setSelectedID(id);
}

function updateEntry(id, patch) {
  setEntries((prev) =>
    prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
  );
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
              <input  placeholder="Search…"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>


                                  <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="text-sm font-medium text-slate-700">Entries</div>


                        <div className="flex items-center gap-2">
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

                      </div>

                          <button
                           onClick={exportJSON}
                           className="rounded-md border border-slate-300 bg-white/70 px-2 py-1 text-xs font-semibold text-slate-800 hover:bg-white"
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
                              className="rounded-md border border-slate-300 bg-white/70 px-2 py-1 text-xs font-semibold text-slate-800 hover:bg-white"
                            >
                              Import
                            </button>




            
                                    {ENTRY_TYPES.map((type) => (
                      <div key={type} className="mb-4">
                        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                          {type}s
                        </h2>

                        <ul className="space-y-1">
                          {entries
                            .filter((e) => e.type === type)
                            .map((e) => (
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
                    ))}


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

      <div className="text-xs text-slate-500">
        Autosaved locally
      </div>
    </div>
  ) : (
    <div className="text-slate-600">Select an entry</div>
  )}
</main>

        </div>
      </div>
    </div>
  )

}
