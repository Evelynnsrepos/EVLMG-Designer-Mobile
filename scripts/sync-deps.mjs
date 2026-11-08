// Copy the desktop app's dependency versions into package.json (after moving the desktop/ submodule to a new tag).
import { readFileSync, writeFileSync } from 'node:fs'

const desktop = JSON.parse(readFileSync('desktop/package.json', 'utf8'))
const mobile = JSON.parse(readFileSync('package.json', 'utf8'))
mobile.dependencies = desktop.dependencies
mobile.devDependencies = { ...mobile.devDependencies, ...desktop.devDependencies }
delete mobile.devDependencies.oxlint
writeFileSync('package.json', JSON.stringify(mobile, null, 2) + '\n')
console.log('Done. Now run: npm install && npm test')
