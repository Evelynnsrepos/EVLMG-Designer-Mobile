// Copy the desktop app's dependency versions into package.json and package-lock.json (after moving the desktop/ submodule to a new tag).
import { readFileSync, writeFileSync } from 'node:fs'

const desktop = JSON.parse(readFileSync('desktop/package.json', 'utf8'))
const mobile = JSON.parse(readFileSync('package.json', 'utf8'))
mobile.dependencies = desktop.dependencies
mobile.devDependencies = { ...mobile.devDependencies, ...desktop.devDependencies }
delete mobile.devDependencies.oxlint
writeFileSync('package.json', JSON.stringify(mobile, null, 2) + '\n')
// Same lock file too: the Tauri build refuses JS and Rust Tauri packages of different versions.
const lock = JSON.parse(readFileSync('desktop/package-lock.json', 'utf8'))
lock.name = lock.packages[''].name = mobile.name
lock.packages[''].version = mobile.version
writeFileSync('package-lock.json', JSON.stringify(lock, null, 2) + '\n')
console.log('Done. Now run: npm install && npm test')
