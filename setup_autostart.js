const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

function setupAutostart() {
    console.log('Setting up VCP Backend Autostart...');

    // Get the path to the startup folder
    const startupFolder = path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');

    // Paths to files we will create
    const vcpBackendDir = __dirname;
    const batFilePath = path.join(vcpBackendDir, 'start_silent.bat');
    const vbsFilePath = path.join(startupFolder, 'VCP_Backend.vbs');

    // 1. Create a quiet batch file to run the server
    const batContent = `@echo off
cd /d "${vcpBackendDir}"
npm start
`;
    fs.writeFileSync(batFilePath, batContent, 'utf8');
    console.log(`Created batch file at: ${batFilePath}`);

    // 2. Create the VBScript in the Startup folder to run the bat file silently (no cmd window)
    const vbsContent = `Set WshShell = CreateObject("WScript.Shell")
WshShell.Run chr(34) & "${batFilePath}" & Chr(34), 0
Set WshShell = Nothing
`;
    fs.writeFileSync(vbsFilePath, vbsContent, 'utf8');
    console.log(`Created startup script at: ${vbsFilePath}`);

    console.log('\\n✅ Success! The VCP Backend will now start silently on system boot.');
    console.log('To remove the autostart, simply delete the file:');
    console.log(`  ${vbsFilePath}`);
}

try {
    setupAutostart();
} catch (err) {
    console.error('Failed to set up autostart:', err);
}
