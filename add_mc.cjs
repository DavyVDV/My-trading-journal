const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// 1. Add Navigation Button
code = code.replace(
    /(<button onclick="switchTab\('calendar'\)" id="tab-calendar" class="[^"]+">\[ 03\. KALENDER \]<\/button>)/,
    `$1\n            <button onclick="switchTab('montecarlo')" id="tab-montecarlo" class="py-1 border-b-2 border-transparent transition-colors hover:text-zinc-200">[ 04. MONTE CARLO ]</button>`
);

// 2. Add View HTML
const viewHtml = `

    <!-- MONTE CARLO VIEW -->
    <div id="view-montecarlo" class="space-y-6 hidden h-full flex flex-col font-mono">
        <div class="flex gap-4 flex-1 h-[600px]">
            <!-- Settings Panel -->
            <div class="bg-terminal-card border border-terminal p-4 rounded-sm flex-none w-64 space-y-4 text-xs text-slate-200 overflow-y-auto">
                <h3 class="font-bold text-zinc-100 uppercase tracking-widest border-b border-terminal pb-2 mb-2">Simulatie Parameters</h3>
                <div>
                    <label class="block mb-1 opacity-70">Startkapitaal ($)</label>
                    <input type="number" id="mcCapital" value="10000" class="w-full bg-zinc-900 border border-zinc-700 rounded-sm p-1.5 focus:border-white focus:outline-none text-white">
                </div>
                <div>
                    <label class="block mb-1 opacity-70">Aantal Simulaties (Lijnen)</label>
                    <input type="number" id="mcSimulations" value="50" class="w-full bg-zinc-900 border border-zinc-700 rounded-sm p-1.5 focus:border-white focus:outline-none text-white">
                </div>
                <div>
                    <label class="block mb-1 opacity-70">Tijdshorizon</label>
                    <select id="mcHorizon" class="w-full bg-zinc-900 border border-zinc-700 rounded-sm p-1.5 focus:border-white focus:outline-none text-white">
                        <option value="1">1 Maand</option>
                        <option value="3">3 Maanden</option>
                        <option value="6">6 Maanden</option>
                        <option value="12" selected>1 Jaar</option>
                        <option value="24">2 Jaar</option>
                    </select>
                </div>
                <button onclick="runMonteCarlo()" class="w-full bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 font-bold px-3 py-2 rounded-sm border border-blue-800 transition-colors uppercase text-xs mt-2">
                    Simulatie Starten
                </button>
                <div id="mcError" class="text-red-400 mt-2 hidden text-[10px] leading-relaxed">
                    Niet genoeg data.
                </div>
            </div>
            
            <!-- Results Panel -->
            <div class="flex-1 bg-terminal-card border border-terminal p-4 rounded-sm relative flex flex-col">
                 <div class="flex-1 relative pb-20">
                    <canvas id="mcChart"></canvas>
                 </div>
                 
                 <!-- KPIs -->
                 <div class="mt-auto grid grid-cols-4 gap-4 bg-zinc-900 border border-zinc-800 p-3 rounded-sm absolute bottom-4 left-4 right-4 z-10">
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
                         <div class="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Kans op <-20%</div>
                         <div id="mcRuinProb" class="font-bold text-lg text-red-500">-</div>
                     </div>
                 </div>
            </div>
        </div>
    </div>
</main>`;
code = code.replace(/<\/main>/, viewHtml);


// 3. Update switchTab Function
code = code.replace(
    /(document\.getElementById\('view-calendar'\)\.classList\.toggle\('hidden', tabId !== 'calendar'\);)/,
    `$1\n    var mcView = document.getElementById('view-montecarlo'); if(mcView) mcView.classList.toggle('hidden', tabId !== 'montecarlo');`
);
code = code.replace(
    /(document\.getElementById\('tab-calendar'\)\.classList\.toggle\('tab-nav-active', tabId === 'calendar'\);)/,
    `$1\n    var mcTab = document.getElementById('tab-montecarlo'); if(mcTab) mcTab.classList.toggle('tab-nav-active', tabId === 'montecarlo');\n    if(tabId === 'montecarlo') { if(!mcChartInstance) { runMonteCarlo(); } }`
);


// 4. Add Monte Carlo JS Logic
const mcScript = `
var mcChartInstance = null;
function runMonteCarlo() {
    var pool = getFilteredTrades().filter(function(t) { return t.time instanceof Date && !isNaN(t.time); });
    var errorDiv = document.getElementById('mcError');
    if(pool.length < 10) {
        errorDiv.innerText = "Te weinig trades om een betrouwbare simulatie te draaien (minimaal 10 vereist).";
        errorDiv.style.display = 'block';
        return;
    }
    errorDiv.style.display = 'none';

    // Calculate trades per month
    pool.sort(function(a,b){ return a.time - b.time; });
    var daysElapsed = (pool[pool.length - 1].time - pool[0].time) / (1000 * 60 * 60 * 24);
    if(daysElapsed < 1) daysElapsed = 1;
    var tradesPerDay = pool.length / daysElapsed;
    var tradesPerMonth = Math.ceil(tradesPerDay * 30.4);

    var startCapital = parseFloat(document.getElementById('mcCapital').value) || 10000;
    var numSimulations = parseInt(document.getElementById('mcSimulations').value) || 100;
    var horizonMonths = parseInt(document.getElementById('mcHorizon').value) || 12;
    var tradesToSimulate = tradesPerMonth * horizonMonths;

    // Use net PnL array
    var historicalPnLs = pool.map(function(t) {
        var c = (t.fee != null) ? t.fee : getCommission(t.symbol, t.volume);
        return t.pnl - c;
    });

    var simulations = [];
    var endingCapitals = [];
    var maxDrawdowns = [];
    var profitableCount = 0;
    var ruinCount = 0; // Ruin threshold: lost 20% of start capital (i.e. < 80% startCapital)
    var ruinThreshold = startCapital * 0.8;

    for (var s = 0; s < numSimulations; s++) {
        var path = [startCapital];
        var cap = startCapital;
        var peak = startCapital;
        var maxDD = 0;
        for (var t = 0; t < tradesToSimulate; t++) {
            // Random draw with replacement
            var r = Math.floor(Math.random() * historicalPnLs.length);
            cap += historicalPnLs[r];
            path.push(cap);
            if (cap > peak) peak = cap;
            var dd = (peak - cap) / peak; // Drawdown percentage
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

    renderMCChart(simulations);
}

function renderMCChart(paths) {
    var canvas = document.getElementById('mcChart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    
    if (mcChartInstance) {
        mcChartInstance.destroy();
    }
    
    // Setup labels based on average trades
    var tradesLength = paths[0].length;
    var labels = [];
    for(var i = 0; i < tradesLength; i++) {
        labels.push("T" + i);
    }
    
    var datasets = paths.map(function(path, index) {
        // slightly highlight median path or just very transparent lines
        return {
            data: path,
            borderColor: 'rgba(56, 189, 248, 0.15)', // Light blue with low opacity
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
`;
code += '\n<script>\n' + mcScript + '\n</script>\n';

fs.writeFileSync('index.html', code);
