const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const scriptMatches = content.match(/<script.*?>([\s\S]*?)<\/script>/gi);
if (scriptMatches) {
    scriptMatches.forEach(s => {
        const code = s.replace(/<script.*?>/i, '').replace(/<\/script>/i, '');
        try {
            const esprima = require('esprima');
            esprima.parseScript(code);
        } catch(e) {
            console.error('Syntax Error:', e.message);
        }
    });
}
