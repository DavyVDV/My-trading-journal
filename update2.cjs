const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// 1. Calendar weekTrades
code = code.replace(/var weekNet = 0;/g, 'var weekNet = 0; var weekTrades = 0;');
code = code.replace(/weekNet \+= dayStats\.net;/g, 'weekNet += dayStats.net; weekTrades += dayStats.count;');
code = code.replace(/'<span class="text-\[18px\] font-extrabold ' \+ wPnlClass \+ '">' \+ fmtUSD\(weekNet\) \+ '<\/span>';/g, 
`'<span class="text-[18px] font-extrabold ' + wPnlClass + '">' + fmtUSD(weekNet) + '</span>' +
'<span class="text-[10px] uppercase text-slate-400 font-bold mt-2 tracking-wider">' + weekTrades + ' TRADES</span>';`);
code = code.replace(/weekNet = 0;/g, 'weekNet = 0; weekTrades = 0;');

// 2. Long green, Short red
code = code.replace(/'text-blue-400' : 'text-amber-500'/g, "'text-emerald-500' : 'text-red-500'");
code = code.replace(/'text-blue-400' : 'text-amber-500'/g, "'text-emerald-500' : 'text-red-500'"); // repeat for instances

// 3. Tag matrix badges colors
code = code.replace(
/var badges = trade\.tags\.map\(function\(tg\)\{ return '<span class="bg-zinc-800 text-zinc-300 px-1 py-0\.5 rounded-sm text-\[10px\] mr-1 border border-zinc-700\/40 uppercase">' \+ esc\(tg\) \+ '<\/span>'; \}\)\.join\(''\);/,
`var badges = trade.tags.map(function(tg){
    var c = tagColors[tg] || '#64748b';
    return '<span class="bg-zinc-800 text-zinc-300 px-1 py-0.5 rounded-sm text-[10px] mr-1 border border-zinc-700/40 uppercase" style="border-left: 3px solid ' + c + '">' + esc(tg) + '</span>'; 
}).join('');`);

code = code.replace(
/var btn = document\.createElement\('button'\);\s+btn\.className = 'px-2\.5 py-1 rounded-sm text-xs border transition-colors uppercase font-mono ' \+ \(active \? 'bg-white text-black border-white font-bold' : 'bg-terminal-input text-zinc-300 border-terminal hover:text-white'\);/,
`var btn = document.createElement('button');
        var c = tagColors[t] || '#64748b';
        btn.className = 'px-2.5 py-1 rounded-sm text-xs border transition-colors uppercase font-mono ' + (active ? 'bg-white text-black border-white font-bold' : 'bg-terminal-input text-zinc-300 border-terminal hover:text-white');
        btn.style.borderLeft = '4px solid ' + c;`
);
code = code.replace(
/row\.innerHTML = '<span class="text-zinc-300 uppercase font-mono tracking-tight">' \+ esc\(t\) \+ '<\/span>' \+/,
`var c = tagColors[t] || '#64748b';
        row.innerHTML = '<span class="text-zinc-300 uppercase font-mono tracking-tight pt-1 pb-1" style="border-bottom: 2px solid ' + c + ';">' + esc(t) + '</span>' +`
);


// 4. Reset column widths button
code = code.replace(
/<button onclick="openManualTradeModal\(\); toggleDropdown\('dataMenuDropdown'\)"/,
`<button onclick="resetColumnWidths(); toggleDropdown('dataMenuDropdown')" class="w-full text-left px-3 py-2 hover:bg-zinc-800 hover:text-white rounded-sm text-xs transition-colors"><i class="fas fa-arrows-alt-h w-4 text-center mr-1 text-slate-200"></i> Reset kolombreedte</button>
                <button onclick="openManualTradeModal(); toggleDropdown('dataMenuDropdown')"`
);


// 5. Column resizing base variables
code = code.replace(
/var globalTags = \[\];/,
`
var colWidths = {};
function initColResize(e, resizer) {
    var th = resizer.parentElement;
    var startX = e.pageX;
    var startWidth = th.offsetWidth;
    var tableId = th.closest('table').id || 'unknown';
    
    function onMouseMove(moveEvent) {
        var newWidth = startWidth + (moveEvent.pageX - startX);
        th.style.width = newWidth + 'px';
        th.style.minWidth = newWidth + 'px';
        th.style.maxWidth = newWidth + 'px';
    }
    
    function onMouseUp(upEvent) {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        var finalWidth = th.offsetWidth;
        var colKey = th.getAttribute('data-col-key');
        if(colKey) {
            colWidths[tableId + '_' + colKey] = finalWidth;
            localStorage.setItem('qt_col_widths_v3', JSON.stringify(colWidths));
        }
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

function resetColumnWidths() {
    colWidths = {};
    localStorage.removeItem('qt_col_widths_v3');
    
    // reset analytics table
    ['time', 'symbol', 'side', 'volume', 'netpnl', 'tags'].forEach(function(k) {
        var th = document.getElementById('ath_' + k);
        if(th) { th.style.width = ''; th.style.minWidth = ''; th.style.maxWidth = ''; }
    });

    updateUI();
}

try {
    var loadedColWidths = localStorage.getItem('qt_col_widths_v3');
    if(loadedColWidths) colWidths = JSON.parse(loadedColWidths);
} catch(err) {}

var globalTags = [];
`
);

// Dashboard TH resizing
code = code.replace(
/th\.innerHTML = def\.label \+ indicator;/,
`th.setAttribute('data-col-key', key);
        var savedW = colWidths['tradeTable_' + key];
        if(savedW) { th.style.width = savedW + 'px'; th.style.minWidth = savedW + 'px'; th.style.maxWidth = savedW + 'px'; }
        th.innerHTML = '<span style="pointer-events:none">' + def.label + indicator + '</span><div class="col-resizer cursor-col-resize absolute right-0 top-0 w-1\.5 h-full hover:bg-white/20 z-10" onmousedown="initColResize(event, this)"></div>';`
);

// Analytics Table THs
code = code.replace(
/<th class="px-4 py-2\.5">Datum Uitvoering<\/th>/,
`<th class="px-4 py-2.5 relative" id="ath_time" data-col-key="time"><span style="pointer-events:none">Datum Uitvoering</span><div class="col-resizer cursor-col-resize absolute right-0 top-0 w-1.5 h-full hover:bg-white/20 z-10" onmousedown="initColResize(event, this)"></div></th>`
);
code = code.replace(
/<th class="px-4 py-2\.5">Symbool<\/th>/,
`<th class="px-4 py-2.5 relative" id="ath_symbol" data-col-key="symbol"><span style="pointer-events:none">Symbool</span><div class="col-resizer cursor-col-resize absolute right-0 top-0 w-1.5 h-full hover:bg-white/20 z-10" onmousedown="initColResize(event, this)"></div></th>`
);
code = code.replace(
/<th class="px-4 py-2\.5">Kant<\/th>/,
`<th class="px-4 py-2.5 relative" id="ath_side" data-col-key="side"><span style="pointer-events:none">Kant</span><div class="col-resizer cursor-col-resize absolute right-0 top-0 w-1.5 h-full hover:bg-white/20 z-10" onmousedown="initColResize(event, this)"></div></th>`
);
code = code.replace(
/<th class="px-4 py-2\.5 text-right">Grootte<\/th>/,
`<th class="px-4 py-2.5 text-right relative" id="ath_volume" data-col-key="volume"><span style="pointer-events:none">Grootte</span><div class="col-resizer cursor-col-resize absolute right-0 top-0 w-1.5 h-full hover:bg-white/20 z-10" onmousedown="initColResize(event, this)"></div></th>`
);
code = code.replace(
/<th class="px-4 py-2\.5 text-right">Netto P&amp;L<\/th>/,
`<th class="px-4 py-2.5 text-right relative" id="ath_netpnl" data-col-key="netpnl"><span style="pointer-events:none">Netto P&amp;L</span><div class="col-resizer cursor-col-resize absolute right-0 top-0 w-1.5 h-full hover:bg-white/20 z-10" onmousedown="initColResize(event, this)"></div></th>`
);
code = code.replace(
/<th class="px-4 py-2\.5">Toegewezen Vector Tags<\/th>/,
`<th class="px-4 py-2.5 relative" id="ath_tags" data-col-key="tags"><span style="pointer-events:none">Toegewezen Vector Tags</span><div class="col-resizer cursor-col-resize absolute right-0 top-0 w-1.5 h-full hover:bg-white/20 z-10" onmousedown="initColResize(event, this)"></div></th>`
);
code = code.replace(
/<table class="w-full text-left font-mono text-xs text-slate-200">/,
`<table class="w-full text-left font-mono text-xs text-slate-200" id="analyticsTable">`
);

code = code.replace(
/function loadCustomAccounts\(\) \{/,
`function applyAnalyticsTableWidths() {
    ['time', 'symbol', 'side', 'volume', 'netpnl', 'tags'].forEach(function(k) {
        var savedW = colWidths['analyticsTable_' + k];
        if(savedW) {
            var th = document.getElementById('ath_' + k);
            if(th) {
                th.style.width = savedW + 'px';
                th.style.minWidth = savedW + 'px';
                th.style.maxWidth = savedW + 'px';
            }
        }
    });
}
function loadCustomAccounts() {`
);

code = code.replace(
/updateUI\(\);/,
`updateUI(); applyAnalyticsTableWidths();`
);

fs.writeFileSync('index.html', code);

