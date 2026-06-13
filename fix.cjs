const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const badPartIndex = code.indexOf("callback: function(v) { return '");
if (badPartIndex !== -1) {
    code = code.substring(0, badPartIndex);
    code += `callback: function(v) { return '$' + v.toLocaleString(); }
                    }
                }
            }
        }
    });
}
</script>
</body>
</html>
`;
    fs.writeFileSync('index.html', code);
}
