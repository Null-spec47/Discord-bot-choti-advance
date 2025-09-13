const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class BotMonitor {
    constructor() {
        this.logFile = path.join(__dirname, 'logs', 'monitor.log');
        this.ensureLogDir();
        this.startMonitoring();
    }

    ensureLogDir() {
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;
        console.log(logMessage.trim());
        fs.appendFileSync(this.logFile, logMessage);
    }

    async executeCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({ stdout, stderr });
                }
            });
        });
    }

    async checkPM2Status() {
        try {
            const { stdout } = await this.executeCommand('pm2 jlist');
            const processes = JSON.parse(stdout);
            
            const status = {
                total: processes.length,
                online: processes.filter(p => p.pm2_env.status === 'online').length,
                stopped: processes.filter(p => p.pm2_env.status === 'stopped').length,
                errored: processes.filter(p => p.pm2_env.status === 'errored').length,
                processes: processes.map(p => ({
                    name: p.name,
                    status: p.pm2_env.status,
                    uptime: p.pm2_env.uptime,
                    memory: p.monit.memory,
                    cpu: p.monit.cpu
                }))
            };

            return status;
        } catch (error) {
            this.log(`Error checking PM2 status: ${error.message}`);
            return null;
        }
    }

    async restartFailedProcesses() {
        try {
            const { stdout } = await this.executeCommand('pm2 restart all');
            this.log('Restarted all processes');
        } catch (error) {
            this.log(`Error restarting processes: ${error.message}`);
        }
    }

    async cleanupLogs() {
        try {
            const logDir = path.join(__dirname, 'logs');
            const files = fs.readdirSync(logDir);
            
            for (const file of files) {
                const filePath = path.join(logDir, file);
                const stats = fs.statSync(filePath);
                const daysSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
                
                // Delete logs older than 7 days
                if (daysSinceModified > 7) {
                    fs.unlinkSync(filePath);
                    this.log(`Deleted old log file: ${file}`);
                }
            }
        } catch (error) {
            this.log(`Error cleaning up logs: ${error.message}`);
        }
    }

    async checkSystemResources() {
        try {
            const { stdout } = await this.executeCommand('free -m');
            const lines = stdout.split('\n');
            const memoryLine = lines[1].split(/\s+/);
            
            const totalMemory = parseInt(memoryLine[1]);
            const usedMemory = parseInt(memoryLine[2]);
            const freeMemory = parseInt(memoryLine[3]);
            const memoryUsage = (usedMemory / totalMemory) * 100;

            const { stdout: cpuOutput } = await this.executeCommand('top -bn1 | grep "Cpu(s)"');
            const cpuMatch = cpuOutput.match(/(\d+\.\d+)%us/);
            const cpuUsage = cpuMatch ? parseFloat(cpuMatch[1]) : 0;

            return {
                memory: {
                    total: totalMemory,
                    used: usedMemory,
                    free: freeMemory,
                    usage: memoryUsage
                },
                cpu: {
                    usage: cpuUsage
                }
            };
        } catch (error) {
            this.log(`Error checking system resources: ${error.message}`);
            return null;
        }
    }

    async generateReport() {
        const pm2Status = await this.checkPM2Status();
        const systemResources = await this.checkSystemResources();
        
        const report = {
            timestamp: new Date().toISOString(),
            pm2: pm2Status,
            system: systemResources
        };

        // Save report
        const reportFile = path.join(__dirname, 'logs', `report-${new Date().toISOString().split('T')[0]}.json`);
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

        this.log(`Generated daily report: ${reportFile}`);
        return report;
    }

    async startMonitoring() {
        this.log('🤖 Bot Monitor started');
        
        // Initial status check
        const initialStatus = await this.checkPM2Status();
        if (initialStatus) {
            this.log(`📊 Initial status: ${initialStatus.online}/${initialStatus.total} processes online`);
        }

        // Monitor every 5 minutes
        setInterval(async () => {
            const status = await this.checkPM2Status();
            if (status) {
                this.log(`📊 Status: ${status.online}/${status.total} online, ${status.stopped} stopped, ${status.errored} errored`);
                
                // Restart failed processes
                if (status.errored > 0) {
                    this.log(`⚠️  Found ${status.errored} errored processes, restarting...`);
                    await this.restartFailedProcesses();
                }
            }

            // Check system resources
            const resources = await this.checkSystemResources();
            if (resources) {
                if (resources.memory.usage > 90) {
                    this.log(`⚠️  High memory usage: ${resources.memory.usage.toFixed(1)}%`);
                }
                if (resources.cpu.usage > 90) {
                    this.log(`⚠️  High CPU usage: ${resources.cpu.usage.toFixed(1)}%`);
                }
            }
        }, 5 * 60 * 1000); // 5 minutes

        // Generate daily report at midnight
        const now = new Date();
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
        const timeUntilMidnight = midnight.getTime() - now.getTime();
        
        setTimeout(() => {
            this.generateReport();
            // Then generate report every 24 hours
            setInterval(() => this.generateReport(), 24 * 60 * 60 * 1000);
        }, timeUntilMidnight);

        // Cleanup logs weekly
        setInterval(() => this.cleanupLogs(), 7 * 24 * 60 * 60 * 1000);
    }
}

// Start monitoring if this file is run directly
if (require.main === module) {
    new BotMonitor();
}

module.exports = BotMonitor;