const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Make gray texts lighter
code = code.replace(/text-zinc-600/g, 'text-zinc-400');
code = code.replace(/text-zinc-500/g, 'text-zinc-300'); // wait, lighter than 400
code = code.replace(/text-zinc-400/g, 'text-zinc-300');
code = code.replace(/text-slate-500/g, 'text-slate-400');
code = code.replace(/text-slate-400/g, 'text-slate-200'); // lighter
code = code.replace(/text-slate-300/g, 'text-slate-200');

// Kolommen dropdown achtergrond
code = code.replace(/id="colDropdown" class="hidden absolute right-0 mt-1 w-44 bg-terminal-card/g, 'id="colDropdown" class="hidden absolute right-0 mt-1 w-44 bg-slate-800');

// Translation of COLUMN_DEFS labels
code = code.replace(/label: 'DATE TIME'/g, "label: 'Datum / Tijd'");
code = code.replace(/label: 'ACCOUNT'/g, "label: 'Account'");
code = code.replace(/label: 'SIDE'/g, "label: 'Richting'");
code = code.replace(/label: 'SIZE'/g, "label: 'Grootte'");
code = code.replace(/label: 'ENTRY\/EXIT'/g, "label: 'In- / Uitstap'");
code = code.replace(/label: 'GROSS PNL'/g, "label: 'Bruto PNL'");
code = code.replace(/label: 'NET PNL'/g, "label: 'Netto PNL'");
code = code.replace(/label: 'DEL'/g, "label: 'Wis'");

fs.writeFileSync('index.html', code);
