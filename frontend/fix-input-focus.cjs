const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldInputBlock = `                    onChange={e => {
                      setStartPostcode(e.target.value);
                      if (userCoords) setUserCoords(null);
                    }}
                  />`;

const newInputBlock = `                    onChange={e => {
                      setStartPostcode(e.target.value);
                      if (userCoords) setUserCoords(null);
                    }}
                    onFocus={() => {
                      if (startPostcode === 'Current location') {
                        setStartPostcode('');
                        setUserCoords(null);
                      }
                    }}
                  />`;

code = code.replace(oldInputBlock, newInputBlock);
fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated with onFocus clear logic!');
