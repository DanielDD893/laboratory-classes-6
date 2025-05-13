const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

let mainWindow;
let serverProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    waitForServer(() => {
        mainWindow.loadURL('http://localhost:3000');
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function startServer() {
    serverProcess = spawn('npm', ['start'], {
        stdio: 'inherit',
        shell: true
    });

    serverProcess.on('error', (err) => {
        console.error('Failed to start server:', err);
    });
}

function waitForServer(callback) {
    const checkServer = () => {
        http.get('http://localhost:3000', (res) => {
            if (res.statusCode === 200) {
                callback();
            } else {
                setTimeout(checkServer, 1000);
            }
        }).on('error', () => {
            setTimeout(checkServer, 1000);
        });
    };

    checkServer();
}

app.whenReady().then(() => {
    startServer();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (serverProcess) {
            serverProcess.kill();
        }
        app.quit();
    }
}); 