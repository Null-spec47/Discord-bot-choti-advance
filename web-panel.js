const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const config = require('./config');
const CommandPanel = require('./command-panel');

class BotManager {
    constructor() {
        this.bots = new Map();
        this.processes = new Map();
        this.logs = new Map();
        this.stats = new Map();
        this.commandPanel = new CommandPanel();
        this.init();
    }

    init() {
        // Initialize bot data
        for (let i = 1; i <= 6; i++) {
            const botId = `bot${i}`;
            this.bots.set(botId, {
                id: botId,
                name: `Bot ${i}`,
                status: 'stopped',
                uptime: 0,
                messages: 0,
                commands: 0,
                errors: 0,
                lastActivity: null,
                token: config.tokens[botId]
            });
            this.logs.set(botId, []);
            this.stats.set(botId, {
                startTime: null,
                messageCount: 0,
                commandCount: 0,
                errorCount: 0
            });
        }
    }

    startBot(botId) {
        if (this.processes.has(botId)) {
            return { success: false, message: 'Bot is already running' };
        }

        const botFile = path.join(__dirname, `${botId}.js`);
        if (!fs.existsSync(botFile)) {
            return { success: false, message: 'Bot file not found' };
        }

        try {
            const process = spawn('node', [botFile], {
                cwd: __dirname,
                stdio: ['pipe', 'pipe', 'pipe']
            });

            this.processes.set(botId, process);
            this.bots.get(botId).status = 'running';
            this.bots.get(botId).lastActivity = new Date();
            this.stats.get(botId).startTime = new Date();

            // Handle process output
            process.stdout.on('data', (data) => {
                const logEntry = {
                    timestamp: new Date(),
                    type: 'info',
                    message: data.toString().trim()
                };
                this.addLog(botId, logEntry);
            });

            process.stderr.on('data', (data) => {
                const logEntry = {
                    timestamp: new Date(),
                    type: 'error',
                    message: data.toString().trim()
                };
                this.addLog(botId, logEntry);
                this.stats.get(botId).errorCount++;
            });

            process.on('close', (code) => {
                this.processes.delete(botId);
                this.bots.get(botId).status = 'stopped';
                const logEntry = {
                    timestamp: new Date(),
                    type: 'info',
                    message: `Bot stopped with code ${code}`
                };
                this.addLog(botId, logEntry);
            });

            process.on('error', (error) => {
                this.processes.delete(botId);
                this.bots.get(botId).status = 'error';
                const logEntry = {
                    timestamp: new Date(),
                    type: 'error',
                    message: error.message
                };
                this.addLog(botId, logEntry);
            });

            return { success: true, message: 'Bot started successfully' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    stopBot(botId) {
        const process = this.processes.get(botId);
        if (!process) {
            return { success: false, message: 'Bot is not running' };
        }

        try {
            process.kill('SIGTERM');
            this.processes.delete(botId);
            this.bots.get(botId).status = 'stopped';
            return { success: true, message: 'Bot stopped successfully' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    restartBot(botId) {
        this.stopBot(botId);
        setTimeout(() => {
            this.startBot(botId);
        }, 2000);
        return { success: true, message: 'Bot restart initiated' };
    }

    addLog(botId, logEntry) {
        const logs = this.logs.get(botId) || [];
        logs.push(logEntry);
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        this.logs.set(botId, logs);
    }

    getBotStatus(botId) {
        const bot = this.bots.get(botId);
        const stats = this.stats.get(botId);
        const logs = this.logs.get(botId);

        if (bot.status === 'running' && stats.startTime) {
            bot.uptime = Date.now() - stats.startTime.getTime();
        }

        return {
            ...bot,
            stats: {
                messageCount: stats.messageCount,
                commandCount: stats.commandCount,
                errorCount: stats.errorCount,
                uptime: bot.uptime
            },
            recentLogs: logs.slice(-50)
        };
    }

    getAllBotsStatus() {
        const result = {};
        for (const botId of this.bots.keys()) {
            result[botId] = this.getBotStatus(botId);
        }
        return result;
    }

    async sendCommand(botId, command) {
        const process = this.processes.get(botId);
        if (!process) {
            return { success: false, message: 'Bot is not running' };
        }

        try {
            // Use command panel for advanced commands
            const result = await this.commandPanel.executeCommand(command);
            if (result.success) {
                this.stats.get(botId).commandCount++;
            }
            return result;
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

// Initialize bot manager
const botManager = new BotManager();

// Express app setup
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// WebSocket server
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket connections
const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected');

    // Send initial bot status
    ws.send(JSON.stringify({
        type: 'status',
        data: botManager.getAllBotsStatus()
    }));

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected');
    });

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleWebSocketMessage(ws, data);
        } catch (error) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format'
            }));
        }
    });
});

function handleWebSocketMessage(ws, data) {
    switch (data.action) {
        case 'startBot':
            const startResult = botManager.startBot(data.botId);
            broadcastStatus();
            ws.send(JSON.stringify({
                type: 'startBot',
                result: startResult
            }));
            break;

        case 'stopBot':
            const stopResult = botManager.stopBot(data.botId);
            broadcastStatus();
            ws.send(JSON.stringify({
                type: 'stopBot',
                result: stopResult
            }));
            break;

        case 'restartBot':
            const restartResult = botManager.restartBot(data.botId);
            broadcastStatus();
            ws.send(JSON.stringify({
                type: 'restartBot',
                result: restartResult
            }));
            break;

        case 'sendCommand':
            const commandResult = botManager.sendCommand(data.botId, data.command);
            ws.send(JSON.stringify({
                type: 'sendCommand',
                result: commandResult
            }));
            break;

        case 'getLogs':
            const logs = botManager.logs.get(data.botId) || [];
            ws.send(JSON.stringify({
                type: 'logs',
                botId: data.botId,
                logs: logs.slice(-100)
            }));
            break;
    }
}

function broadcastStatus() {
    const status = botManager.getAllBotsStatus();
    const message = JSON.stringify({
        type: 'status',
        data: status
    });

    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// API Routes
app.get('/api/bots', (req, res) => {
    res.json(botManager.getAllBotsStatus());
});

app.post('/api/bots/:botId/start', (req, res) => {
    const result = botManager.startBot(req.params.botId);
    broadcastStatus();
    res.json(result);
});

app.post('/api/bots/:botId/stop', (req, res) => {
    const result = botManager.stopBot(req.params.botId);
    broadcastStatus();
    res.json(result);
});

app.post('/api/bots/:botId/restart', (req, res) => {
    const result = botManager.restartBot(req.params.botId);
    broadcastStatus();
    res.json(result);
});

app.post('/api/bots/:botId/command', (req, res) => {
    const { command } = req.body;
    const result = botManager.sendCommand(req.params.botId, command);
    res.json(result);
});

app.get('/api/bots/:botId/logs', (req, res) => {
    const logs = botManager.logs.get(req.params.botId) || [];
    res.json(logs.slice(-100));
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Bot Management Panel running on http://localhost:${PORT}`);
    console.log(`📊 WebSocket server ready for real-time updates`);
});

// Auto-start all bots on server start
setTimeout(() => {
    console.log('🤖 Auto-starting all bots...');
    for (let i = 1; i <= 6; i++) {
        setTimeout(() => {
            botManager.startBot(`bot${i}`);
        }, i * 2000); // Staggered start
    }
}, 3000);

// Status broadcast interval
setInterval(broadcastStatus, 5000);

module.exports = { BotManager, botManager };