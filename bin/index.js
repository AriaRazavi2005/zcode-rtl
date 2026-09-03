#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import picocolors from 'picocolors';
import ora from 'ora';
import prompts from 'prompts';
import * as asar from '@electron/asar';
import figlet from 'figlet';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { blue, cyan, green, red, yellow, bold } = picocolors;

const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

function printBanner() {
    try {
        const fullArt = figlet.textSync('ZCode RTL', { font: 'Standard' }).split('\n');

        const hexColors = [
            '#38bdf8', // Sky 400
            '#818cf8', // Indigo 400
            '#c084fc', // Purple 400
            '#34d399'  // Emerald 400
        ];

        const colors = hexColors.map(hex => {
            const bigint = parseInt(hex.replace('#', ''), 16);
            return {
                r: (bigint >> 16) & 255,
                g: (bigint >> 8) & 255,
                b: bigint & 255
            };
        });

        const applyGradient = (text) => {
            let result = '';
            const len = text.length;
            for (let i = 0; i < len; i++) {
                const char = text[i];
                if (char === ' ' || char === '\n') {
                    result += char;
                    continue;
                }
                const factor = len > 1 ? i / (len - 1) : 0;
                const segments = colors.length - 1;
                const segmentFloat = factor * segments;
                const segmentIdx = Math.min(Math.floor(segmentFloat), segments - 1);
                const segmentFactor = segmentFloat - segmentIdx;

                const cStart = colors[segmentIdx];
                const cEnd = colors[segmentIdx + 1];

                const r = Math.round(cStart.r + segmentFactor * (cEnd.r - cStart.r));
                const g = Math.round(cStart.g + segmentFactor * (cEnd.g - cStart.g));
                const b = Math.round(cStart.b + segmentFactor * (cEnd.b - cStart.b));

                result += `\x1b[38;2;${r};${g};${b}m${char}\x1b[0m`;
            }
            return result;
        };

        console.log('');
        for (const line of fullArt) {
            if (!line.trim()) continue;
            console.log(applyGradient(line));
        }
        console.log(`\x1b[2m  Smart RTL & UI Patcher for ZCode | v${pkg.version}\x1b[0m\n`);
    } catch {
        console.log(bold(cyan(`\n✨ ZCode Smart RTL Patcher v${pkg.version}\n`)));
    }
}

printBanner();

function isZCodeRunning() {
    try {
        if (os.platform() === 'win32') {
            const out = execSync('tasklist /FI "IMAGENAME eq ZCode.exe" /FO CSV /NH', { encoding: 'utf8' });
            return out.toLowerCase().includes('zcode.exe');
        } else {
            const out = execSync('pgrep -i zcode || true', { encoding: 'utf8' });
            return out.trim().length > 0;
        }
    } catch {
        return false;
    }
}

function getDefaultPaths() {
    const platform = os.platform();
    const paths = [];

    if (platform === 'win32') {
        const localAppData = process.env.LOCALAPPDATA || '';
        const programFiles = process.env.ProgramFiles || 'C:\\Program Files';
        const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';

        paths.push(path.join(programFiles, 'ZCode', 'resources', 'app.asar'));
        paths.push(path.join(localAppData, 'Programs', 'ZCode', 'resources', 'app.asar'));
        paths.push(path.join(programFilesX86, 'ZCode', 'resources', 'app.asar'));
    } else if (platform === 'darwin') {
        paths.push('/Applications/ZCode.app/Contents/Resources/app.asar');
        paths.push(path.join(os.homedir(), 'Applications/ZCode.app/Contents/Resources/app.asar'));
    } else {
        paths.push('/opt/ZCode/resources/app.asar');
        paths.push('/usr/lib/zcode/resources/app.asar');
        paths.push('/usr/share/zcode/resources/app.asar');
    }

    return paths;
}

async function getAsarPath() {
    const defaultPaths = getDefaultPaths();
    for (const p of defaultPaths) {
        if (fs.existsSync(p)) {
            console.log(blue(`ℹ Found ZCode installation at:`));
            console.log(`  ${p}\n`);
            return p;
        }
    }

    console.log(yellow(`⚠ Could not find ZCode at default locations.`));
    const response = await prompts({
        type: 'text',
        name: 'customPath',
        message: 'Please enter the full path to app.asar of ZCode:'
    });

    if (!response.customPath || !fs.existsSync(response.customPath)) {
        console.error(red('\n✖ Invalid path. Aborting.\n'));
        process.exit(1);
    }
    return response.customPath;
}

const args = process.argv.slice(2);
const isRestore = args.includes('--restore');

async function main() {
    if (isZCodeRunning()) {
        console.log(yellow('⚠ ZCode is currently open and running.'));
        console.log(yellow('  Please completely close ZCode before patching or restoring.\n'));
        const response = await prompts({
            type: 'confirm',
            name: 'shouldClose',
            message: 'Would you like to close ZCode automatically now?',
            initial: true
        });

        if (response.shouldClose) {
            try {
                if (os.platform() === 'win32') {
                    execSync('taskkill /IM ZCode.exe /F /T');
                } else {
                    execSync('pkill -9 -i zcode');
                }
                console.log(green('✔ Successfully closed ZCode processes.\n'));
            } catch {
                console.log(yellow('Could not close ZCode automatically. Please close it manually and retry.\n'));
                process.exit(1);
            }
        } else {
            console.log(yellow('\nPlease close ZCode and rerun the command.\n'));
            process.exit(1);
        }
    }

    const asarPath = await getAsarPath();
    const backupPath = asarPath + '.bak';

    if (isRestore) {
        if (!fs.existsSync(backupPath)) {
            console.error(red('✖ No backup found to restore.\n'));
            process.exit(1);
        }
        const spinner = ora('Restoring original app.asar...').start();
        try {
            fs.copyFileSync(backupPath, asarPath);
            spinner.succeed('Successfully restored original ZCode!\n');
            process.exit(0);
        } catch (e) {
            spinner.fail('Failed to restore.');
            console.error(red(e.message));
            process.exit(1);
        }
    }

    const spinner = ora('Checking permissions and backing up...').start();
    try {
        fs.accessSync(path.dirname(asarPath), fs.constants.W_OK);
        if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(asarPath, backupPath);
        }
    } catch (e) {
        spinner.fail('Permission Denied.');
        console.error(red('\nSystem Error: ' + e.message));
        if (os.platform() === 'win32') {
            console.error(yellow('\nPlease run your terminal (PowerShell/CMD) as Administrator and try again.\n'));
        } else {
            console.error(yellow('\nPlease run this command with sudo.\n'));
        }
        process.exit(1);
    }

    const extractDir = path.join(os.tmpdir(), 'zcode-app-extracted-rtl-temp');
    spinner.text = 'Extracting app.asar...';
    try {
        if (fs.existsSync(extractDir)) {
            fs.rmSync(extractDir, { recursive: true, force: true });
        }
        asar.extractAll(asarPath, extractDir);
    } catch (e) {
        spinner.fail('Failed to extract ASAR.');
        console.error(red(e.message));
        process.exit(1);
    }

    spinner.text = 'Injecting RTL features...';
    try {
        const indexPath = path.join(extractDir, 'out', 'renderer', 'index.html');
        const mainPath = path.join(extractDir, 'out', 'main', 'index.js');
        const preloadPath = path.join(extractDir, 'out', 'preload', 'index.cjs');

        if (!fs.existsSync(indexPath) || !fs.existsSync(mainPath)) {
            throw new Error('Required files not found in ASAR. Unsupported ZCode version.');
        }

        // Prepare standalone bundled script
        const fontPath = path.join(__dirname, 'Vazirmatn-Variable.woff2');
        const fontB64 = fs.readFileSync(fontPath).toString('base64');
        const rendererTemplate = fs.readFileSync(path.join(__dirname, 'renderer-payload.js'), 'utf8');
        const bundledJs = rendererTemplate.replace('__FONT_BASE64_PLACEHOLDER__', fontB64);

        // 1. Write standalone script to renderer directory
        const rtlScriptDest = path.join(extractDir, 'out', 'renderer', 'zcode-rtl.js');
        fs.writeFileSync(rtlScriptDest, bundledJs, 'utf8');

        // 2. Inject into index.html so it loads guaranteed with DOM
        let indexHtml = fs.readFileSync(indexPath, 'utf8');
        if (!indexHtml.includes('zcode-rtl.js')) {
            indexHtml = indexHtml.replace('</body>', '<script src="./zcode-rtl.js"></script></body>');
            fs.writeFileSync(indexPath, indexHtml, 'utf8');
        }

        // 3. Inject DevTools context-menu unlock in main process
        let mainCode = fs.readFileSync(mainPath, 'utf8');
        // Ensure DevTools shortcut / context menu is always available
        mainCode = mainCode.replace(/YO\.isPackaged\s*\|\|/g, '');
        fs.writeFileSync(mainPath, mainCode, 'utf8');

        // 4. Also keep preload hook for full bridge coverage
        if (fs.existsSync(preloadPath)) {
            let preloadCode = fs.readFileSync(preloadPath, 'utf8');
            const preloadPayload = fs.readFileSync(path.join(__dirname, 'payload.js'), 'utf8');
            if (!preloadCode.includes('/* ZCODE RTL PATCH PAYLOAD */')) {
                preloadCode += '\n\n' + preloadPayload;
                fs.writeFileSync(preloadPath, preloadCode, 'utf8');
            }
        }

    } catch (e) {
        spinner.fail('Injection failed.');
        console.error(red(e.message));
        if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
        process.exit(1);
    }

    spinner.text = 'Repacking app.asar (please wait)...';
    try {
        const tempAsarPath = path.join(os.tmpdir(), 'zcode-patched-app.asar');
        if (fs.existsSync(tempAsarPath)) {
            fs.unlinkSync(tempAsarPath);
        }

        await asar.createPackage(extractDir, tempAsarPath);
        fs.rmSync(extractDir, { recursive: true, force: true });

        fs.copyFileSync(tempAsarPath, asarPath);
        fs.unlinkSync(tempAsarPath);

        spinner.succeed('Successfully patched ZCode!');
        console.log(green('\n✨ RTL Features have been enabled! Please restart ZCode to see the changes.\n'));
    } catch (e) {
        spinner.fail('Failed to repack ASAR.');
        console.error(red(e.message));
        if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
        process.exit(1);
    }
}

main().catch(e => {
    console.error(red('\n✖ An unexpected error occurred:'), e.message);
    process.exit(1);
});
