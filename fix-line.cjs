const fs = require('fs');

let content = fs.readFileSync('e:/hris/vue-dashboard/src/views/Employees.vue', 'utf8');

// Remove the icon tag from labels - it's causing parsing issues
content = content.replace(
  /<label><i class="pi pi-book"><\/i> /g,
  '<label>'
);

fs.writeFileSync('e:/hris/vue-dashboard/src/views/Employees.vue', content, 'utf8');
console.log('Fixed: Removed book icon from labels');
