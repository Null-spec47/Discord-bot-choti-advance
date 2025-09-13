const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class SystemStatus {
    constructor() {
        this.status = {
            timestamp: new Date(),
            system: {},
            processes: {},
            resources: {},
            health: {}
        };
    }

    async getSystemInfo() {
        return new Promise((resolve, reject) => {
            exec('uname -a && uptime && whoami', (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                
                const lines = stdout.split('\n');
                resolve({
                    system: lines[0],
                    uptime: lines[1],
                    user: lines[2]
                });
            });
        });
    }

    async getPM2Status() {
        return new Promise((resolve, reject) => {
            exec('pm2 jlist', (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                
                try {
                    const processes = JSON.parse(stdout);
                    const summary = {
                        total: processes.length,
                        online: processes.filter(p => p.pm2_env.status === 'online').length,
                        stopped: processes.filter(p => p.pm2_env.status === 'stopped').length,
                        errored: processes.filter(p => p.pm2_env.status === 'errored').length
                    };
                    
                    resolve({ summary, processes });
                } catch (parseError) {
                    reject(parseError);
                }
            });
        });
    }

    async getResourceUsage() {
        return new Promise((resolve, reject) => {
            exec('free -m && df -h / && top -bn1 | grep "Cpu(s)"', (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                
                try {
                    const lines = stdout.split('\n');
                    
                    // Memory info
                    const memoryLine = lines[0].split(/\s+/);
                    const memory = {
                        total: parseInt(memoryLine[1]),
                        used: parseInt(memoryLine[2]),
                        free: parseInt(memoryLine[3]),
                        usage: (parseInt(memoryLine[2]) / parseInt(memoryLine[1])) * 100
                    };
                    
                    // Disk info
                    const diskLine = lines[1].split(/\s+/);
                    const disk = {
                        total: diskLine[1],
                        used: diskLine[2],
                        available: diskLine[3],
                        usage: parseInt(diskLine[4].replace('%', ''))
                    };
                    
                    // CPU info
                    const cpuLine = lines[2];
                    const cpuMatch = cpuLine.match(/(\d+\.\d+)%us/);
                    const cpu = {
                        usage: cpuMatch ? parseFloat(cpuMatch[1]) : 0
                    };
                    
                    resolve({ memory, disk, cpu });
                } catch (parseError) {
                    reject(parseError);
                }
            });
        });
    }

    async getWebPanelStatus() {
        return new Promise((resolve) => {
            const http = require('http');
            const req = http.get('http://localhost:3000/api/bots', (res) => {
                resolve({
                    status: 'online',
                    responseTime: Date.now(),
                    statusCode: res.statusCode
                });
            });
            
            req.on('error', (error) => {
                resolve({
                    status: 'offline',
                    error: error.message
                });
            });
            
            req.setTimeout(5000, () => {
                req.destroy();
                resolve({
                    status: 'timeout',
                    error: 'Request timeout'
                });
            });
        });
    }

    async getLogStats() {
        try {
            const logDir = path.join(__dirname, 'logs');
            if (!fs.existsSync(logDir)) {
                return { totalFiles: 0, totalSize: 0 };
            }
            
            const files = fs.readdirSync(logDir);
            let totalSize = 0;
            
            for (const file of files) {
                const filePath = path.join(logDir, file);
                const stats = fs.statSync(filePath);
                totalSize += stats.size;
            }
            
            return {
                totalFiles: files.length,
                totalSize: totalSize,
                totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    async generateFullStatus() {
        try {
            console.log('🔍 Gathering system status...');
            
            this.status.system = await this.getSystemInfo();
            this.status.processes = await this.getPM2Status();
            this.status.resources = await this.getResourceUsage();
            this.status.health = await this.getWebPanelStatus();
            this.status.logs = await this.getLogStats();
            this.status.timestamp = new Date();
            
            return this.status;
        } catch (error) {
            console.error('Error generating status:', error);
            return { error: error.message };
        }
    }

    displayStatus() {
        const status = this.status;
        
        console.log('\n🚀 Ultimate Bot Management System - Status Report');
        console.log('================================================');
        console.log(`📅 Generated: ${status.timestamp.toLocaleString()}`);
        console.log('');
        
        // System Info
        console.log('💻 System Information:');
        console.log(`   System: ${status.system.system || 'N/A'}`);
        console.log(`   Uptime: ${status.system.uptime || 'N/A'}`);
        console.log(`   User: ${status.system.user || 'N/A'}`);
        console.log('');
        
        // Process Status
        if (status.processes.summary) {
            console.log('🤖 Bot Processes:');
            console.log(`   Total: ${status.processes.summary.total}`);
            console.log(`   Online: ${status.processes.summary.online}`);
            console.log(`   Stopped: ${status.processes.summary.stopped}`);
            console.log(`   Errored: ${status.processes.summary.errored}`);
            console.log('');
        }
        
        // Resource Usage
        if (status.resources.memory) {
            console.log('📊 Resource Usage:');
            console.log(`   Memory: ${status.resources.memory.used}MB / ${status.resources.memory.total}MB (${status.resources.memory.usage.toFixed(1)}%)`);
            console.log(`   CPU: ${status.resources.cpu.usage.toFixed(1)}%`);
            console.log(`   Disk: ${status.resources.disk.used} / ${status.resources.disk.total} (${status.resources.disk.usage}%)`);
            console.log('');
        }
        
        // Web Panel Status
        console.log('🌐 Web Panel:');
        console.log(`   Status: ${status.health.status}`);
        if (status.health.statusCode) {
            console.log(`   HTTP Code: ${status.health.statusCode}`);
        }
        if (status.health.error) {
            console.log(`   Error: ${status.health.error}`);
        }
        console.log('');
        
        // Log Statistics
        if (status.logs.totalFiles !== undefined) {
            console.log('📝 Log Statistics:');
            console.log(`   Files: ${status.logs.totalFiles}`);
            console.log(`   Total Size: ${status.logs.totalSizeMB}MB`);
            console.log('');
        }
        
        // Overall Health
        const isHealthy = status.processes.summary && 
                         status.processes.summary.errored === 0 && 
                         status.health.status === 'online' &&
                         status.resources.memory.usage < 90;
        
        console.log('❤️ Overall Health:');
        console.log(`   Status: ${isHealthy ? '✅ Healthy' : '⚠️ Issues Detected'}`);
        console.log('');
        
        // Access Information
        console.log('🔗 Access Information:');
        console.log('   Web Panel: http://localhost:3000');
        console.log('   PM2 Monitor: pm2 monit');
        console.log('   PM2 Status: pm2 status');
        console.log('   PM2 Logs: pm2 logs');
        console.log('');
    }

    async saveStatusReport() {
        const reportFile = path.join(__dirname, 'logs', `status-report-${new Date().toISOString().split('T')[0]}.json`);
        fs.writeFileSync(reportFile, JSON.stringify(this.status, null, 2));
        console.log(`📄 Status report saved: ${reportFile}`);
    }
}

// Run if called directly
if (require.main === module) {
    const systemStatus = new SystemStatus();
    
    systemStatus.generateFullStatus()
        .then(() => {
            systemStatus.displayStatus();
            return systemStatus.saveStatusReport();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

module.exports = SystemStatus;