import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourceDir = path.join(__dirname, '..', 'dist');
const distDir = path.join(__dirname, '..', '..', 'safe-ds-vscode', 'dist');
const targetDir = path.join(distDir, 'custom-editor');

console.log(`Removing old files from <safe-ds-vscode>...`);
fs.ensureDirSync(distDir);
fs.emptyDirSync(targetDir);

/* Adding a delay ensures, that the build process is finished before we start copying
 * Currently 300 ms seems to be enough (build takes abouit 150 ms)
 */
console.log(`Copying webview from <safe-ds-editor> to <safe-ds-vscode>...`);
setTimeout(() => {
    fs.copy(sourceDir, targetDir, { overwrite: true })
        .then(() => console.log('Done'))
        .catch((err) => {
            console.error('Error during copying:', err);
            process.exit(1);
        });
}, 300);
