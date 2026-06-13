const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const regexMenu = /<div id="dataMenuDropdown"([\s\S]*?)<div class="border-t border-zinc-800 my-1 mx-2"><\/div>/;

const newMenu = `<div id="dataMenuDropdown" class="hidden absolute right-0 mt-1.5 w-48 bg-slate-900 border border-slate-700 rounded-sm shadow-2xl p-1 z-50 text-slate-200">
                <button onclick="document.getElementById('fileInput').click(); toggleDropdown('dataMenuDropdown')" class="w-full text-left px-3 py-2 hover:bg-zinc-800 hover:text-white rounded-sm text-xs transition-colors">
                    <i class="fas fa-file-csv w-4 text-center mr-1 text-slate-200"></i> CSV Importeren
                </button>
                <button onclick="openManualTradeModal(); toggleDropdown('dataMenuDropdown')" class="w-full text-left px-3 py-2 hover:bg-zinc-800 hover:text-white rounded-sm text-xs transition-colors">
                    <i class="fas fa-keyboard w-4 text-center mr-1 text-slate-200"></i> Manuele Invoer
                </button>
                <button onclick="resetColumnWidths(); toggleDropdown('dataMenuDropdown')" class="w-full text-left px-3 py-2 hover:bg-zinc-800 hover:text-white rounded-sm text-xs transition-colors"><i class="fas fa-arrows-alt-h w-4 text-center mr-1 text-slate-200"></i> Reset kolombreedte</button>
                <div class="border-t border-zinc-800 my-1 mx-2"></div>`;

code = code.replace(regexMenu, newMenu);

// Make the resizers look like vertical lines on TH
code = code.replace(/<th class="px-4 py-2\.5 relative"/g, '<th class="px-4 py-2.5 relative border-r border-zinc-700/50"');
code = code.replace(/<th class="px-4 py-2\.5 text-right relative"/g, '<th class="px-4 py-2.5 text-right relative border-r border-zinc-700/50"');

// Remove the border-r from the resizer div in Analytics table
code = code.replace(/border-r border-zinc-700 hover:bg-white\/10/g, 'hover:bg-white/20');

// Dashboard TH
code = code.replace(
/th\.innerHTML = '<span style="pointer-events:none">' \+ def\.label \+ indicator \+ '<\/span><div class="col-resizer cursor-col-resize absolute right-0 top-0 w-1\.5 h-full hover:bg-white\/20 z-10" onmousedown="initColResize\\(event, this\\)"><\/div>';/,
`th.className = th.className + ' border-r border-zinc-700/50 relative';
        th.innerHTML = '<span style="pointer-events:none">' + def.label + indicator + '</span><div class="col-resizer cursor-col-resize absolute right-0 top-0 w-2 h-full hover:bg-white/20 z-10" onmousedown="initColResize(event, this)"></div>';`
);

fs.writeFileSync('index.html', code);
