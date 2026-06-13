const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// 1. Settings Panel replacements
let settingsRegex = /<div>\s*<label class="block mb-1 opacity-70">Tijdshorizon<\/label>[\s\S]*?<\/select>\s*<\/div>/;

let newSettings = `<div>
                    <label class="block mb-1 opacity-70">Tijdshorizon (Maanden)</label>
                    <input type="number" id="mcHorizon" value="12" class="w-full bg-zinc-900 border border-zinc-700 rounded-sm p-1.5 focus:border-white focus:outline-none text-white">
                </div>
                
                <div class="mt-4 pt-4 border-t border-zinc-800">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="font-bold text-zinc-100 uppercase tracking-widest text-[#94a3b8]">Statistieken</h3>
                        <button onclick="resetMCStats()" class="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-sm border border-zinc-700 transition-colors text-[9px] uppercase"><i class="fas fa-sync-alt mr-1"></i>Reset</button>
                    </div>
                    <div class="space-y-3">
                        <div>
                            <label class="block mb-1 opacity-70">Winrate (%)</label>
                            <input type="number" step="0.1" id="mcWinrate" class="w-full bg-zinc-900 border border-zinc-700 rounded-sm p-1.5 focus:border-white focus:outline-none text-white">
                        </div>
                        <div>
                            <label class="block mb-1 opacity-70">Gemiddelde Winst ($)</label>
                            <input type="number" step="0.01" id="mcAvgWin" class="w-full bg-zinc-900 border border-zinc-700 rounded-sm p-1.5 focus:border-white focus:outline-none text-white">
                        </div>
                        <div>
                            <label class="block mb-1 opacity-70">Gemiddeld Verlies ($)</label>
                            <input type="number" step="0.01" id="mcAvgLoss" class="w-full bg-zinc-900 border border-zinc-700 rounded-sm p-1.5 focus:border-white focus:outline-none text-white">
                        </div>
                        <div>
                            <label class="block mb-1 opacity-70">Aantal Trades per Maand</label>
                            <input type="number" step="1" id="mcTradesPerMonth" class="w-full bg-zinc-900 border border-zinc-700 rounded-sm p-1.5 focus:border-white focus:outline-none text-white">
                        </div>
                    </div>
                </div>`;

code = code.replace(settingsRegex, newSettings);

// Increased padding bottom for canvas so the larger KPI box fits
code = code.replace(/<div class="flex-1 relative pb-20">/, '<div class="flex-1 relative pb-[140px]">');

// 2. Results Panel KPIs
let kpiRegex = /<div class="mt-auto grid grid-cols-4 gap-4 bg-zinc-900 border border-zinc-800 p-3 rounded-sm absolute bottom-4 left-4 right-4 z-10">([\s\S]*?)<\/div>\s*<\/div>/;

let newKPIs = `<div class="mt-auto flex flex-col gap-2 bg-zinc-900 border border-zinc-800 p-3 rounded-sm absolute bottom-4 left-4 right-4 z-10">
                     <div class="grid grid-cols-4 gap-4">
                         <div>
                             <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Gem. Eindkapitaal</div>
                             <div id="mcAvgEnding" class="font-bold text-lg text-white">-</div>
                         </div>
                         <div>
                             <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Kans op Winst</div>
                             <div id="mcProfitProb" class="font-bold text-lg text-emerald-400">-</div>
                         </div>
                         <div>
                             <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Max Drawdown (Gem.)</div>
                             <div id="mcAvgDD" class="font-bold text-lg text-red-400">-</div>
                         </div>
                         <div>
                             <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Kans op &lt;-20%</div>
                             <div id="mcRuinProb" class="font-bold text-lg text-red-500">-</div>
                         </div>
                     </div>
                     <div class="border-t border-zinc-800/50"></div>
                     <div class="grid grid-cols-4 gap-4">
                         <div>
                             <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Verwachte Winst / Maand ($)</div>
                             <div id="mcExpMonthDollar" class="font-bold text-base text-white">-</div>
                         </div>
                         <div>
                             <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Verwachte Winst / Maand (%)</div>
                             <div id="mcExpMonthPct" class="font-bold text-base text-white">-</div>
                         </div>
                         <div>
                             <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Verwachte Winst / Jaar ($)</div>
                             <div id="mcExpYearDollar" class="font-bold text-base text-white">-</div>
                         </div>
                         <div>
                             <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Verwachte Winst / Jaar (%)</div>
                             <div id="mcExpYearPct" class="font-bold text-base text-white">-</div>
                         </div>
                     </div>
                 </div>
            </div>`;

code = code.replace(kpiRegex, newKPIs);

// Replace JS logic for MC
let runMCRegex = /function runMonteCarlo\(\) \{[\s\S]*?function renderMCChart\(paths\) \{/;

let newJS = `
function resetMCStats() {
    var pool = getFilteredTrades().filter(function(t) { return t.time instanceof Date && !isNaN(t.time); });
    if(pool.length < 5) return;
    pool.sort(function(a,b){ return a.time - b.time; });
    var daysElapsed = (pool[pool.length - 1].time - pool[0].time) / (1000 * 60 * 60 * 24);
    if(daysElapsed < 1) daysElapsed = 1;
    var tradesPerDay = pool.length / daysElapsed;
    var tradesPerMonth = Math.ceil(tradesPerDay * 30.416);

    var wins = 0, lossCount = 0;
    var winTotal = 0, lossTotal = 0;

    pool.forEach(function(t) {
        var c = (t.fee != null) ? t.fee : getCommission(t.symbol, t.volume);
        var net = t.pnl - c;
        if(net > 0) {
            wins++;
            winTotal += net;
        } else if (net <= 0) {
            lossCount++;
            lossTotal += Math.abs(net);
        }
    });

    var winrate = pool.length > 0 ? (wins / pool.length) * 100 : 0;
    var avgWin = wins > 0 ? (winTotal / wins) : 0;
    var avgLoss = lossCount > 0 ? (lossTotal / lossCount) : 0;

    document.getElementById('mcWinrate').value = winrate.toFixed(1);
    document.getElementById('mcAvgWin').value = avgWin.toFixed(2);
    document.getElementById('mcAvgLoss').value = avgLoss.toFixed(2);
    document.getElementById('mcTradesPerMonth').value = tradesPerMonth;
}

function runMonteCarlo() {
    var errorDiv = document.getElementById('mcError');
    var winrateInput = document.getElementById('mcWinrate');
    
    // Auto-populate if empty
    if(!winrateInput.value) {
        resetMCStats();
    }
    
    var winrate = parseFloat(document.getElementById('mcWinrate').value) || 0;
    var avgWin = parseFloat(document.getElementById('mcAvgWin').value) || 0;
    var avgLoss = parseFloat(document.getElementById('mcAvgLoss').value) || 0;
    var tradesPerMonth = parseFloat(document.getElementById('mcTradesPerMonth').value) || 0;
    
    if(winrate === 0 || avgWin === 0) {
         errorDiv.innerText = "Voer geldige statistieken in of reset vanuit data.";
         errorDiv.style.display = 'block';
         return;
    }
    errorDiv.style.display = 'none';

    var startCapital = parseFloat(document.getElementById('mcCapital').value) || 10000;
    var numSimulations = parseInt(document.getElementById('mcSimulations').value) || 100;
    var horizonMonths = parseInt(document.getElementById('mcHorizon').value) || 12;
    var tradesToSimulate = Math.round(tradesPerMonth * horizonMonths);
    if(tradesToSimulate < 1) tradesToSimulate = 1;

    var simulations = [];
    var endingCapitals = [];
    var maxDrawdowns = [];
    var profitableCount = 0;
    var ruinCount = 0; 
    var ruinThreshold = startCapital * 0.8;

    for (var s = 0; s < numSimulations; s++) {
        var path = [startCapital];
        var cap = startCapital;
        var peak = startCapital;
        var maxDD = 0;
        for (var t = 0; t < tradesToSimulate; t++) {
            var isWin = Math.random() < (winrate / 100);
            var result = isWin ? avgWin : -avgLoss;
            cap += result;
            path.push(cap);
            if (cap > peak) peak = cap;
            var dd = (peak - cap) / peak; 
            if (dd > maxDD) maxDD = dd;
        }
        simulations.push(path);
        endingCapitals.push(cap);
        maxDrawdowns.push(maxDD);
        if (cap > startCapital) profitableCount++;
        if (path.some(function(v) { return v < ruinThreshold; })) ruinCount++;
    }

    var avgEnd = endingCapitals.reduce(function(sum, c) { return sum + c; }, 0) / numSimulations;
    var avgMaxDD = maxDrawdowns.reduce(function(sum, dd) { return sum + dd; }, 0) / numSimulations;
    var profitProb = (profitableCount / numSimulations) * 100;
    var ruinProb = (ruinCount / numSimulations) * 100;

    document.getElementById('mcAvgEnding').innerText = fmtUSD(avgEnd);
    document.getElementById('mcAvgEnding').className = 'font-bold text-lg ' + (avgEnd >= startCapital ? 'text-emerald-400' : 'text-red-400');
    
    document.getElementById('mcProfitProb').innerText = profitProb.toFixed(1) + '%';
    document.getElementById('mcAvgDD').innerText = (avgMaxDD * 100).toFixed(1) + '%';
    document.getElementById('mcRuinProb').innerText = ruinProb.toFixed(1) + '%';

    // Monthly & Yearly Calcs
    var totalExpectedProfit = avgEnd - startCapital;
    var expMonthDol = totalExpectedProfit / horizonMonths;
    var expMonthPct = (expMonthDol / startCapital) * 100;
    
    var expYearDol = expMonthDol * 12;
    var expYearPct = expMonthPct * 12;

    document.getElementById('mcExpMonthDollar').innerText = fmtUSD(expMonthDol);
    document.getElementById('mcExpMonthDollar').className = 'font-bold text-base ' + (expMonthDol >= 0 ? 'text-emerald-400' : 'text-red-400');
    document.getElementById('mcExpMonthPct').innerText = (expMonthPct > 0 ? '+' : '') + expMonthPct.toFixed(2) + '%';
    document.getElementById('mcExpMonthPct').className = 'font-bold text-base ' + (expMonthPct >= 0 ? 'text-emerald-400' : 'text-red-400');

    document.getElementById('mcExpYearDollar').innerText = fmtUSD(expYearDol);
    document.getElementById('mcExpYearDollar').className = 'font-bold text-base ' + (expYearDol >= 0 ? 'text-emerald-400' : 'text-red-400');
    document.getElementById('mcExpYearPct').innerText = (expYearPct > 0 ? '+' : '') + expYearPct.toFixed(2) + '%';
    document.getElementById('mcExpYearPct').className = 'font-bold text-base ' + (expYearPct >= 0 ? 'text-emerald-400' : 'text-red-400');

    renderMCChart(simulations);
}

function renderMCChart(paths) {`;

code = code.replace(runMCRegex, newJS);

fs.writeFileSync('index.html', code);
