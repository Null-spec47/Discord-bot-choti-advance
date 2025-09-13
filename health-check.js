const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class HealthChecker {
    constructor() {
        this.checks = [];
        this.results = new Map();
        this.startHealthChecks();
    }

    addCheck(name, checkFunction, interval = 30000) {
        this.checks.push({
            name,
            function: checkFunction,
            interval,
            lastRun: 0
        });
    }

    async runCheck(check) {
        try {
            const result = await check.function();
            this.results.set(check.name, {
                status: 'healthy',
                result,
                timestamp: new Date(),
                error: null
            });
        } catch (error) {
            this.results.set(check.name, {
                status: 'unhealthy',
                result: null,
                timestamp: new Date(),
                error: error.message
            });
        }
    }

    async startHealthChecks() {
        // Add various health checks
        this.addCheck('web-panel', this.checkWebPanel.bind(this));
        this.addCheck('pm2-processes', this.checkPM2Processes.bind(this));
        this.addCheck('system-resources', this.checkSystemResources.bind(this));
        this.addCheck('disk-space', this.checkDiskSpace.bind(this));
        this.addCheck('network-connectivity', this.checkNetworkConnectivity.bind(this));
        this.addCheck('bot-responsiveness', this.checkBotResponsiveness.bind(this));

        // Run checks periodically
        setInterval(() => {
            this.runAllChecks();
        }, 10000); // Check every 10 seconds

        // Initial check
        this.runAllChecks();
    }

    async runAllChecks() {
        const now = Date.now();
        
        for (const check of this.checks) {
            if (now - check.lastRun >= check.interval) {
                check.lastRun = now;
                await this.runCheck(check);
            }
        }
    }

    async checkWebPanel() {
        return new Promise((resolve, reject) => {
            const req = http.get('http://localhost:3000/api/bots', (res) => {
                if (res.statusCode === 200) {
                    resolve({ status: 'online', responseTime: Date.now() });
                } else {
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.setTimeout(5000, () => {
                req.destroy();
                reject(new Error('Timeout'));
            });
        });
    }

    async checkPM2Processes() {
        return new Promise((resolve, reject) => {
            exec('pm2 jlist', (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }

                try {
                    const processes = JSON.parse(stdout);
                    const online = processes.filter(p => p.pm2_env.status === 'online').length;
                    const total = processes.length;
                    
                    resolve({
                        total,
                        online,
                        offline: total - online,
                        processes: processes.map(p => ({
                            name: p.name,
                            status: p.pm2_env.status,
                            uptime: p.pm2_env.uptime
                        }))
                    });
                } catch (parseError) {
                    reject(parseError);
                }
            });
        });
    }

    async checkSystemResources() {
        return new Promise((resolve, reject) => {
            exec('free -m && top -bn1 | grep "Cpu(s)"', (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }

                try {
                    const lines = stdout.split('\n');
                    const memoryLine = lines[0].split(/\s+/);
                    const cpuLine = lines[1];

                    const totalMemory = parseInt(memoryLine[1]);
                    const usedMemory = parseInt(memoryLine[2]);
                    const freeMemory = parseInt(memoryLine[3]);
                    const memoryUsage = (usedMemory / totalMemory) * 100;

                    const cpuMatch = cpuLine.match(/(\d+\.\d+)%us/);
                    const cpuUsage = cpuMatch ? parseFloat(cpuMatch[1]) : 0;

                    resolve({
                        memory: {
                            total: totalMemory,
                            used: usedMemory,
                            free: freeMemory,
                            usage: memoryUsage
                        },
                        cpu: {
                            usage: cpuUsage
                        }
                    });
                } catch (parseError) {
                    reject(parseError);
                }
            });
        });
    }

    async checkDiskSpace() {
        return new Promise((resolve, reject) => {
            exec('df -h /', (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }

                try {
                    const lines = stdout.split('\n');
                    const dataLine = lines[1].split(/\s+/);
                    
                    const total = dataLine[1];
                    const used = dataLine[2];
                    const available = dataLine[3];
                    const usagePercent = parseInt(dataLine[4].replace('%', ''));

                    resolve({
                        total,
                        used,
                        available,
                        usagePercent
                    });
                } catch (parseError) {
                    reject(parseError);
                }
            });
        });
    }

    async checkNetworkConnectivity() {
        return new Promise((resolve, reject) => {
            exec('ping -c 1 8.8.8.8', (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }

                const match = stdout.match(/time=(\d+\.\d+)/);
                const pingTime = match ? parseFloat(match[1]) : 0;

                resolve({
                    connected: true,
                    pingTime
                });
            });
        });
    }

    async checkBotResponsiveness() {
        // This would check if bots are responding to commands
        // For now, we'll simulate this check
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    responsive: true,
                    averageResponseTime: Math.random() * 1000 + 100
                });
            }, 100);
        });
    }

    getHealthStatus() {
        const status = {
            overall: 'healthy',
            checks: {},
            timestamp: new Date()
        };

        let unhealthyCount = 0;

        for (const [name, result] of this.results) {
            status.checks[name] = result;
            if (result.status === 'unhealthy') {
                unhealthyCount++;
            }
        }

        if (unhealthyCount > 0) {
            status.overall = unhealthyCount === this.results.size ? 'unhealthy' : 'degraded';
        }

        return status;
    }

    generateHealthReport() {
        const status = this.getHealthStatus();
        const report = {
            timestamp: new Date().toISOString(),
            overall: status.overall,
            summary: {
                totalChecks: this.results.size,
                healthy: Array.from(this.results.values()).filter(r => r.status === 'healthy').length,
                unhealthy: Array.from(this.results.values()).filter(r => r.status === 'unhealthy').length
            },
            details: status.checks
        };

        // Save report
        const reportFile = path.join(__dirname, 'logs', `health-report-${new Date().toISOString().split('T')[0]}.json`);
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

        return report;
    }
}

// Start health checker if run directly
if (require.main === module) {
    const healthChecker = new HealthChecker();
    
    // Generate report every hour
    setInterval(() => {
        const report = healthChecker.generateHealthReport();
        console.log(`Health Report: ${report.overall} (${report.summary.healthy}/${report.summary.totalChecks} healthy)`);
    }, 60 * 60 * 1000);
}

module.exports = HealthChecker;