const fs = require('fs');
const path = require('path');

const schemaDir = path.join(__dirname, 'src', 'db', 'schema');
const files = [
  'resources.js',
  'reports.js',
  'questions.js',
  'posts.js',
  'opportunities.js',
  'comments.js',
  'books.js',
  'answers.js'
];

const targetStr = 'const { nanoid } = require("nanoid");';
const replacementStr = `const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 12);`;

let updatedCount = 0;

for (const file of files) {
  const filePath = path.join(schemaDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(targetStr)) {
      content = content.replace(targetStr, replacementStr);
      // Wait, there might be nanoid(12) calls. `customAlphabet` returns a function that doesn't take size argument if we define it with size 12?
      // Actually `customAlphabet(alphabet, defaultSize)` returns a function `nanoid(size)`.
      // So `nanoid(12)` will still work perfectly if we replace `const nanoid = customAlphabet(..., 12)`.
      // Let's replace the occurrences of `nanoid(12)` to `nanoid()` just to be safe? 
      // Actually `customAlphabet` signature is: customAlphabet(alphabet, size) => () => string.
      // So it returns a function that generates a string of `size`. If we call it with a number, does it override? Yes, `nanoid(size)`.
      // Wait, let's look at nanoid docs. `const nanoid = customAlphabet('1234567890abcdef', 10); nanoid();` returns 10 chars.
      // If we do `nanoid(12)`, it returns 12 chars.
      
      fs.writeFileSync(filePath, content, 'utf8');
      updatedCount++;
      console.log(`Updated ${file}`);
    }
  }
}

console.log(`Finished. Updated ${updatedCount} files.`);
