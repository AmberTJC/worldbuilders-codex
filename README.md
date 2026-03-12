Worldbuilder’s Codex


A lightweight, offline-first codex for worldbuilding: store and organize key terms, characters, locations, factions, and more for writing projects.

Built as a fast, low-friction place to capture lore while writing—no account, no backend, no fuss.

Features


Create, edit, and delete codex entries with type-based organization (e.g., Characters, Locations, Factions)
Tagging to cross-categorize entries
Search + filter to quickly find what you need
Grouped navigation for browsing by entry type
Local persistence via localStorage
JSON import/export with a versioned schema, validation, and clear error messages
Safety-focused UX touches (e.g., safe delete + reselection behavior)

Tech Stack


React
Vite
JavaScript
Tailwind CSS (v4)

Screenshots:

Main Screen
<img width="1164" height="923" alt="image" src="https://github.com/user-attachments/assets/0c81a117-bbb3-44cf-af06-b2c0299dbfe3" />


Editor

<img width="732" height="408" alt="image" src="https://github.com/user-attachments/assets/259b9499-6a7c-4b69-9687-aa748b719003" />


Tag Search

<img width="382" height="531" alt="image" src="https://github.com/user-attachments/assets/6f784e22-ed05-42c0-92b6-4ac355a6f079" />






Getting Started (Local)


npm install

npm run dev

Import / Export Notes


Export creates a JSON file containing your codex data.
Import validates the file before applying changes and provides user-friendly error messages if something’s wrong.



