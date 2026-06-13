const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Make gray texts lighter
code = code.replace(/text-zinc-600/g, 'text-zinc-400');
code = code.replace(/text-zinc-500/g, 'text-zinc-400');
code = code.replace(/text-zinc-400/g, 'text-zinc-300');
code = code.replace(/text-slate-500/g, 'text-slate-400');
code = code.replace(/text-slate-400/g, 'text-slate-300');

// Kolommen dropdown achtergrond
code = code.replace(/id="colDropdown" class="hidden absolute right-0 mt-1 w-44 bg-terminal-card/g, 'id="colDropdown" class="hidden absolute right-0 mt-1 w-44 bg-slate-800');

fs.writeFileSync('index.html', code);
