import { useEffect, useState } from 'react'
import './App.css'





export default function App() {



const defaultEntries = [
  { id: 1, type: "character", name: "Sidriel", summary: "A quiet political architect with a fondness for crystal butterflies" },
  { id: 2, type: "character", name: "Isarion", summary: "Elder dragon in human guise; cold, brash, loyal."},
  { id: 3, type: "location", name: "Warden's Rest", summary: "A sunlit glade that feels fae-adjacent and safe." },
  { id: 4, type: "faction", name: "The Church", summary: "Radiance doctrine; inquisitions; moral authority as control."}
]


const [entries, setEntries] = useState(() => {
  const raw = localStorage.getItem("codexEntries:v1");
  return raw ? JSON.parse(raw) : defaultEntries;
});

const [selectedID, setSelectedID] = useState(entries[0]?.id ?? null);
const selected = entries.find(e => e.id === selectedID);


useEffect(() => {
  localStorage.setItem("codexEntries:v1", JSON.stringify(entries));
}, [entries]);






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
            
                {["character", "location", "faction"].map((type) => (
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

          <main className="col-span-12 md:col-span-8 rounded-xl border border-slate-300 bg-white/60 p-3">
           {selected ? (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-600">{selected.type}</div>
                    <h2 className="text-2xl font-semibold">{selected.name}</h2>
                    <p className="mt-2 text-slate-700">{selected.summary}</p>
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
