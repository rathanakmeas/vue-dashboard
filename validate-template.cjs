const fs = require('fs');

const content = fs.readFileSync('src/views/Employees.vue', 'utf8');
const match = content.match(/<template>([\s\S]*?)<\/template>/);

if (!match) {
  console.log('No template found');
  process.exit(1);
}

const template = match[1];
const stack = [];
const lines = template.split('\n');

for (let lineNum = 0; lineNum < lines.length; lineNum++) {
  const line = lines[lineNum];
  
  // Find opening tags
  const openMatches = [...line.matchAll(/<([a-z][a-z0-9-]*)/gi)];
  for (const match of openMatches) {
    const fullTag = line.substring(match.index);
    if (!fullTag.match(/^<[^>]*\/>/)) { // Not self-closing
      const tagName = match[1].toLowerCase();
      if (!['input', 'img', 'br', 'hr', 'meta', 'link'].includes(tagName)) {
        stack.push({ tag: tagName, line: lineNum + 1 });
      }
    }
  }
  
  // Find closing tags
  const closeMatches = [...line.matchAll(/<\/([a-z][a-z0-9-]*)/gi)];
  for (const match of closeMatches) {
    const tagName = match[1].toLowerCase();
    if (stack.length === 0) {
      console.log(`ERROR: Closing tag </${tagName}> at line ${lineNum + 1} without opening tag`);
      process.exit(1);
    }
    const last = stack.pop();
    if (last.tag !== tagName) {
      console.log(`ERROR: Tag mismatch at line ${lineNum + 1}`);
      console.log(`  Expected: </${last.tag}> (opened at line ${last.line})`);
      console.log(`  Found: </${tagName}>`);
      console.log(`  Context: ${line.trim()}`);
      process.exit(1);
    }
  }
}

if (stack.length > 0) {
  console.log('ERROR: Unclosed tags:');
  stack.forEach(item => console.log(`  <${item.tag}> opened at line ${item.line}`));
  process.exit(1);
}

console.log('SUCCESS: All HTML tags are properly matched!');
