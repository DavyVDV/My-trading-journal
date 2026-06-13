const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const regexVue = /<!-- MONTE CARLO VIEW -->[\s\S]*?<\/main>/;

const newVue = `<!-- MONTE CARLO VIEW -->
    <div id="view-montecarlo" class="space-y-6 hidden pb-20 font-mono">
        
        <div class="flex flex-col xl:flex-row gap-4 h-auto xl:h-[550px]">
             <!-- Settings Panel -->
            <div class="bg-terminal-card border border-terminal p-4 rounded-sm flex-none xl:w-[450px] flex flex-col overflow-y-auto">
                 <div class="flex justify-between items-center mb-4 border-b border-terminal pb-2">
                     <h3 class="font-bold text-zinc-100 uppercase tracking-widest text-[#94a3b8]">Simulatie Parameters</h3>
                     <button onclick="resetMCStats()" class="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 flex py-1 items-center gap-1.5 rounded-sm border border-zinc-700 transition-colors text-[10px] uppercase font-bold"><i class="fas fa-sync-alt"></i> Data Reset</button>
                 </div>
                 
                 <div class="grid grid-cols-2 gap-x-6 gap-y-4 mb-4">
                     <div>
                         <label class="block mb-1 opacity-70 text-[10px] uppercase tracking-wider font-bold">Initial balance ($)</label>
                         <input type="number" id="mcCapital" value="3000" class="w-full bg-zinc-900/50 border border-zinc-700 rounded-sm p-2 focus:border-blue-500 focus:outline-none text-white text-sm transition-colors">
                     </div>
                     <div>
                         <label class="block mb-1 opacity-70 text-[10px] uppercase tracking-wider font-bold">Risk % per 1 trade</label>
                         <input type="number" step="0.1" id="mcRiskPct" value="0.5" class="w-full bg-zinc-900/50 border border-zinc-700 rounded-sm p-2 focus:border-blue-500 focus:outline-none text-white text-sm transition-colors">
                     </div>
                     <div>
                         <label class="block mb-1 opacity-70 text-[10px] uppercase tracking-wider font-bold">Winning trades %</label>
                         <input type="number" step="0.1" id="mcWinrate" value="55" class="w-full bg-zinc-900/50 border border-zinc-700 rounded-sm p-2 focus:border-blue-500 focus:outline-none text-white text-sm transition-colors">
                     </div>
                     <div>
                         <label class="block mb-1 opacity-70 text-[10px] uppercase tracking-wider font-bold">Break even trades %</label>
                         <input type="number" step="0.1" id="mcBreakEven" value="5" class="w-full bg-zinc-900/50 border border-zinc-700 rounded-sm p-2 focus:border-blue-500 focus:outline-none text-white text-sm transition-colors">
                     </div>
                     <div>
                         <label class="block mb-1 opacity-70 text-[10px] uppercase tracking-wider font-bold">Avg. no. trades per month</label>
                         <input type="number" step="1" id="mcTradesPerMonth" value="30" class="w-full bg-zinc-900/50 border border-zinc-700 rounded-sm p-2 focus:border-blue-500 focus:outline-none text-white text-sm transition-colors">
                     </div>
                     <div>
                         <label class="block mb-1 opacity-70 text-[10px] uppercase tracking-wider font-bold">Total months</label>
                         <input type="number" step="1" id="mcHorizon" value="48" class="w-full bg-zinc-900/50 border border-zinc-700 rounded-sm p-2 focus:border-blue-500 focus:outline-none text-white text-sm transition-colors">
                     </div>
                     <div>
                         <label class="block mb-1 opacity-70 text-[10px] uppercase tracking-wider font-bold">Take profit/Stop loss ratio</label>
                         <input type="number" step="0.01" id="mcRRRatio" value="1.0" class="w-full bg-zinc-900/50 border border-zinc-700 rounded-sm p-2 focus:border-blue-500 focus:outline-none text-white text-sm transition-colors">
                     </div>
                     <div>
                         <label class="block mb-1 opacity-70 text-[10px] uppercase tracking-wider font-bold">Aantal Simulaties</label>
                         <input type="number" step="1" id="mcSimulations" value="50" class="w-full bg-zinc-900/50 border border-zinc-700 rounded-sm p-2 focus:border-blue-500 focus:outline-none text-white text-sm transition-colors">
                     </div>
                 </div>
                 
                 <div class="mt-auto">
                     <button onclick="runMonteCarlo()" class="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold px-3 py-3 rounded-sm border border-[#1e40af] transition-colors uppercase text-sm tracking-widest shadow-lg">
                         Simulate Returns
                     </button>
                     <div id="mcError" class="text-red-400 mt-2 hidden text-[10px] leading-relaxed"></div>
                 </div>
            </div>
            
            <!-- Results Panel chart -->
            <div class="flex-1 bg-terminal-card border border-terminal p-4 rounded-sm flex flex-col relative min-h-[400px]">
                 <div class="flex-1 relative pb-[110px]">
                    <canvas id="mcChart"></canvas>
                 </div>
                 <!-- KPIs -->
                 <div class="h-auto grid grid-cols-4 gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-sm absolute bottom-4 left-4 right-4 z-10">
                     <div>
                         <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">Gem. Eindkapitaal</div>
                         <div id="mcAvgEnding" class="font-bold text-xl text-white">-</div>
                     </div>
                     <div>
                         <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">Kans op Winst</div>
                         <div id="mcProfitProb" class="font-bold text-xl text-emerald-400">-</div>
                     </div>
                     <div>
                         <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">Max Drawdown (Gem.)</div>
                         <div id="mcAvgDD" class="font-bold text-xl text-red-400">-</div>
                     </div>
                     <div>
                         <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">Kans op &lt;-20%</div>
                         <div id="mcRuinProb" class="font-bold text-xl text-red-500">-</div>
                     </div>
                 </div>
            </div>
        </div>
        
        <!-- Table list underneath -->
        <div id="mcTablesContainer" class="flex flex-wrap gap-6 font-sans justify-start items-start pt-4">
             <!-- JS will fill this with yearly cards -->
        </div>

    </div>
</main>`;
code = code.replace(regexVue, newVue);

const regexJS = /function resetMCStats\(\) \{[\s\S]*?\}\s*<\/script>\s*<\/body>\s*<\/html>/;

const newJS = `function resetMCStats() {
    var pool = getFilteredTrades().filter(function(t) { return t.time instanceof Date && !isNaN(t.time); });
    if(pool.length < 3) {
        alert("Niet genoeg trades in de log (minimum 3 vereist om zinnige statistieken te berekenen).");
        return;
    }
    pool.sort(function(a,b){ return a.time - b.time; });
    var daysElapsed = (pool[pool.length - 1].time - pool[0].time) / (1000 * 60 * 60 * 24);
    if(daysElapsed < 1) daysElapsed = 1;
    var tradesPerDay = pool.length / daysElapsed;
    var tradesPerMonth = Math.ceil(tradesPerDay * 30.416);

    var wins = 0, lossCount = 0, be = 0;
    var winTotal = 0, lossTotal = 0;

    pool.forEach(function(t) {
        var c = (t.fee != null) ? t.fee : getCommission(t.symbol, t.volume);
        var net = t.pnl - c;
        if(net > 0) {
            wins++;
            winTotal += net;
        } else if (net < 0) {
            lossCount++;
            lossTotal += Math.abs(net);
        } else {
            be++;
        }
    });

    var winrate = pool.length > 0 ? (wins / pool.length) * 100 : 0;
    var breakEvenRate = pool.length > 0 ? (be / pool.length) * 100 : 0;
    var avgWin = wins > 0 ? (winTotal / wins) : 0;
    var avgLoss = lossCount > 0 ? (lossTotal / lossCount) : 0;
    var rrRatio = avgLoss > 0 ? (avgWin / avgLoss) : 1;

    var startCap = parseFloat(document.getElementById('mcCapital').value) || 3000;
    var riskPct = avgLoss > 0 ? (avgLoss / startCap) * 100 : 0.5;

    document.getElementById('mcWinrate').value = winrate.toFixed(1);
    document.getElementById('mcBreakEven').value = breakEvenRate.toFixed(1);
    document.getElementById('mcRiskPct').value = riskPct.toFixed(2);
    document.getElementById('mcRRRatio').value = rrRatio.toFixed(2);
    document.getElementById('mcTradesPerMonth').value = tradesPerMonth;
}

function runMonteCarlo() {
    var errorDiv = document.getElementById('mcError');
    var winrateInput = document.getElementById('mcWinrate');
    
    var startCapital = parseFloat(document.getElementById('mcCapital').value) || 3000;
    var riskPct = parseFloat(document.getElementById('mcRiskPct').value) || 0;
    var winrate = parseFloat(document.getElementById('mcWinrate').value) || 0;
    var breakEvenRate = parseFloat(document.getElementById('mcBreakEven').value) || 0;
    var tradesPerMonth = parseFloat(document.getElementById('mcTradesPerMonth').value) || 0;
    var horizonMonths = parseInt(document.getElementById('mcHorizon').value) || 0;
    var rrRatio = parseFloat(document.getElementById('mcRRRatio').value) || 0;
    var numSimulations = parseInt(document.getElementById('mcSimulations').value) || 50;
    
    if(winrate === 0 || horizonMonths === 0 || tradesPerMonth === 0) {
         errorDiv.innerText = "Voer geldige simulatie parameters in.";
         errorDiv.style.display = 'block';
         return;
    }
    errorDiv.style.display = 'none';

    var tradesToSimulate = Math.round(tradesPerMonth * horizonMonths);
    if(tradesToSimulate < 1) tradesToSimulate = 1;

    var simulations = [];
    var endingCapitals = [];
    var maxDrawdowns = [];
    var profitableCount = 0;
    var ruinCount = 0; 
    var ruinThreshold = startCapital * 0.8;
    
    var endOfMonthBalances = [];
    for(var s=0; s<numSimulations; s++) { endOfMonthBalances.push([]); }

    for (var s = 0; s < numSimulations; s++) {
        var path = [startCapital];
        var cap = startCapital;
        var peak = startCapital;
        var maxDD = 0;
        
        var tradesInCurrentMonth = 0;
        
        for (var t = 0; t < tradesToSimulate; t++) {
            var rand = Math.random() * 100;
            if (rand < winrate) {
                cap += cap * (riskPct / 100) * rrRatio;
            } else if (rand < winrate + breakEvenRate) {
                // cap += 0;
            } else {
                cap -= cap * (riskPct / 100);
            }
            if (cap < 0) cap = 0;
            
            path.push(cap);
            if (cap > peak) peak = cap;
            var dd = peak > 0 ? (peak - cap) / peak : 0; 
            if (dd > maxDD) maxDD = dd;
            
            tradesInCurrentMonth++;
            if (tradesInCurrentMonth >= tradesPerMonth) {
                endOfMonthBalances[s].push(cap);
                tradesInCurrentMonth = 0;
            }
        }
        
        if (tradesInCurrentMonth > 0 || endOfMonthBalances[s].length < horizonMonths) {
            endOfMonthBalances[s].push(cap);
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
    document.getElementById('mcAvgEnding').className = 'font-bold text-xl ' + (avgEnd >= startCapital ? 'text-emerald-400' : 'text-red-400');
    
    document.getElementById('mcProfitProb').innerText = profitProb.toFixed(1) + '%';
    document.getElementById('mcAvgDD').innerText = (avgMaxDD * 100).toFixed(1) + '%';
    document.getElementById('mcRuinProb').innerText = ruinProb.toFixed(1) + '%';

    var avgEomBalances = [];
    for (var m = 0; m < horizonMonths; m++) {
        var sum = 0;
        for (var s = 0; s < numSimulations; s++) {
            var val = endOfMonthBalances[s][m] !== undefined ? endOfMonthBalances[s][m] : endOfMonthBalances[s][endOfMonthBalances[s].length-1];
            sum += val;
        }
        avgEomBalances.push(sum / numSimulations);
    }

    renderMCChart(simulations);
    renderMCTables(startCapital, avgEomBalances);
}

function renderMCTables(startCapital, eomBalances) {
    var container = document.getElementById('mcTablesContainer');
    if (!container) return;
    container.innerHTML = '';
    
    var currentYear = new Date().getFullYear();
    var mIdx = 0;
    var html = '';
    var prevMonthBalance = startCapital;
    
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    while(mIdx < eomBalances.length) {
        var yearStartBalance = prevMonthBalance;
        
        var yearHtml = '<div class="bg-white rounded shadow-md text-slate-800 text-sm overflow-hidden min-w-[300px] w-[300px] flex-none">';
        yearHtml += '<div class="flex bg-[#3b66c4] text-white font-bold p-3.5 tracking-wide">';
        yearHtml += '<div class="flex-1 text-base">' + currentYear + '</div>';
        yearHtml += '<div class="flex-1 text-center text-[13px] self-center">Results %</div>';
        yearHtml += '<div class="flex-1 text-right text-[13px] self-center">Results $</div>';
        yearHtml += '</div>';
        
        var i = 0;
        
        for(; i < 12 && mIdx < eomBalances.length; i++, mIdx++) {
            var mBalance = eomBalances[mIdx];
            var mProfitDol = mBalance - prevMonthBalance;
            var mProfitPct = prevMonthBalance > 0 ? (mProfitDol / prevMonthBalance) * 100 : 0;
            
            var pctColor = mProfitPct > 0 ? 'text-[#22c55e]' : (mProfitPct < 0 ? 'text-[#ef4444]' : 'text-slate-500');
            var dolColor = 'text-slate-600'; 
            
            yearHtml += '<div class="flex px-4 py-3 ' + (i % 2 === 0 ? 'bg-white' : 'bg-slate-50') + ' border-b border-slate-100/50 font-medium tracking-tight">';
            yearHtml += '<div class="flex-1 text-slate-600">' + monthNames[i] + '</div>';
            yearHtml += '<div class="flex-1 text-center ' + pctColor + '">' + (mProfitPct>0?'+':'') + (mProfitPct === 0 ? '0.0' : mProfitPct.toFixed(1)) + '%</div>';
            yearHtml += '<div class="flex-1 text-right ' + dolColor + '">' + (mProfitDol < 0 ? '-$' : '$') + Math.abs(Math.round(mProfitDol)).toLocaleString() + '</div>';
            yearHtml += '</div>';
            
            prevMonthBalance = mBalance;
        }
        
        // Pad out the rest of the year if horizon ends mid-year
        for(; i < 12; i++) {
            yearHtml += '<div class="flex px-4 py-3 ' + (i % 2 === 0 ? 'bg-white' : 'bg-slate-50') + ' border-b border-slate-100/50 font-medium opacity-40 tracking-tight">';
            yearHtml += '<div class="flex-1 text-slate-600">' + monthNames[i] + '</div>';
            yearHtml += '<div class="flex-1 text-center">-</div>';
            yearHtml += '<div class="flex-1 text-right">-</div>';
            yearHtml += '</div>';
        }
        
        var yearEndBalance = prevMonthBalance;
        var yProfitDol = yearEndBalance - yearStartBalance;
        var yProfitPct = yearStartBalance > 0 ? (yProfitDol / yearStartBalance) * 100 : 0;
        
        yearHtml += '<div class="flex bg-[#3b66c4] text-white font-bold p-3.5 tracking-wide rounded-b">';
        yearHtml += '<div class="flex-1">Total</div>';
        yearHtml += '<div class="flex-1 text-center text-sm self-center">' + yProfitPct.toFixed(1) + '%</div>';
        yearHtml += '<div class="flex-1 text-right text-sm self-center">' + (yProfitDol < 0 ? '-$' : '$') + Math.abs(Math.round(yProfitDol)).toLocaleString() + '</div>';
        yearHtml += '</div>';
        
        yearHtml += '</div>'; 
        html += yearHtml;
        currentYear++;
    }
    
    container.innerHTML = html;
}

function renderMCChart(paths) {
    var canvas = document.getElementById('mcChart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    
    if (mcChartInstance) {
        mcChartInstance.destroy();
    }
    
    var tradesLength = paths[0].length;
    var labels = [];
    for(var i = 0; i < tradesLength; i++) {
        labels.push("T" + i);
    }
    
    var datasets = paths.map(function(path) {
        return {
            data: path,
            borderColor: 'rgba(56, 189, 248, 0.12)', 
            borderWidth: 1,
            pointRadius: 0,
            fill: false,
            tension: 0
        };
    });

    mcChartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: labels, datasets: datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            scales: {
                x: {
                    display: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { maxTicksLimit: 10, color: '#94a3b8' }
                },
                y: {
                    display: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#94a3b8',
                        callback: function(v) { return '$' + v.toLocaleString(); }
                    }
                }
            }
        }
    });
}
</script>
</body>
</html>`;

code = code.replace(regexJS, newJS);
fs.writeFileSync('index.html', code);

