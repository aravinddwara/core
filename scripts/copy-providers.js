import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const apiDir = path.join(rootDir, 'api');

// Ensure api directory exists
if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
}

// Copy providers directory
const srcProvidersDir = path.join(distDir, 'providers');
const destProvidersDir = path.join(apiDir, 'providers');

if (fs.existsSync(srcProvidersDir)) {
    copyDirectory(srcProvidersDir, destProvidersDir);
    console.log('✓ Copied providers to api/providers');
}

// Copy config.js
const srcConfig = path.join(distDir, 'config.js');
const destConfig = path.join(apiDir, 'config.js');

if (fs.existsSync(srcConfig)) {
    fs.copyFileSync(srcConfig, destConfig);
    console.log('✓ Copied config.js to api/');
}

console.log('✓ Build preparation complete!');

function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
