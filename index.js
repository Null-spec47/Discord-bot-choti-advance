#!/usr/bin/env node

/**
 * Discord Bot Choti Advance - Terminal Interface
 * Main entry point for running Discord bots in terminal
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

// Bot configuration
const bots = {
    1: { file: 'bot1.js', name: 'Ultimate Self Bot #1', token: process.env.BOT1_TOKEN },
    2: { file: 'bot2.js', name: 'Ultimate Self Bot #2', token: process.env.BOT2_TOKEN },
    3: { file: 'bot3.js', name: 'Ultimate Self Bot #3', token: process.env.BOT3_TOKEN },
    4: { file: 'bot4.js', name: 'Ultimate Self Bot #4', token: process.env.BOT4_TOKEN },
    5: { file: 'bot5.js', name: 'Ultimate Self Bot #5', token: process.env.BOT5_TOKEN },
    6: { file: 'bot6.js', name: 'Ultimate Self Bot #6', token: process.env.BOT6_TOKEN }
};

function printHeader() {
    console.clear();
    console.log(colors.cyan + colors.bright + '╔══════════════════════════════════════════════════════════╗');
    console.log('║               🚀 DISCORD BOT CHOTI ADVANCE 🚀             ║');
    console.log('║                    Terminal Interface                     ║');
    console.log('╚══════════════════════════════════════════════════════════╝' + colors.reset);
    console.log();
}

function printMenu() {
    console.log(colors.yellow + '📱 Available Commands:' + colors.reset);
    console.log();
    
    // Bot options
    for (let i = 1; i <= 6; i++) {
        const bot = bots[i];
        const status = bot.token && bot.token !== `your_bot${i}_token_here` ? 
            colors.green + '✅ Ready' : colors.red + '❌ No Token';
        console.log(`${colors.white}${i}.${colors.reset} ${bot.name} ${status}${colors.reset}`);
    }
    
    console.log();
    console.log(`${colors.white}7.${colors.reset} ${colors.magenta}Start All Bots (PM2)${colors.reset}`);
    console.log(`${colors.white}8.${colors.reset} ${colors.blue}Web Panel${colors.reset}`);
    console.log(`${colors.white}9.${colors.reset} ${colors.yellow}Environment Setup${colors.reset}`);
    console.log(`${colors.white}0.${colors.reset} ${colors.red}Exit${colors.reset}`);
    console.log();
}

function checkEnvironment() {
    console.log(colors.yellow + '🔍 Checking Environment...' + colors.reset);
    console.log();
    
    // Check .env file
    if (fs.existsSync('.env')) {
        console.log(colors.green + '✅ .env file found' + colors.reset);
    } else {
        console.log(colors.red + '❌ .env file missing' + colors.reset);
        return false;
    }
    
    // Check bot files
    for (let i = 1; i <= 6; i++) {
        if (fs.existsSync(`bot${i}.js`)) {
            console.log(colors.green + `✅ bot${i}.js found` + colors.reset);
        } else {
            console.log(colors.red + `❌ bot${i}.js missing` + colors.reset);
        }
    }
    
    // Check dependencies
    if (fs.existsSync('node_modules')) {
        console.log(colors.green + '✅ Dependencies installed' + colors.reset);
    } else {
        console.log(colors.red + '❌ Dependencies missing - run npm install' + colors.reset);
        return false;
    }
    
    console.log();
    return true;
}

function runBot(botNumber) {
    const bot = bots[botNumber];
    if (!bot) {
        console.log(colors.red + '❌ Invalid bot number!' + colors.reset);
        return;
    }
    
    if (!bot.token || bot.token === `your_bot${botNumber}_token_here`) {
        console.log(colors.red + `❌ Bot ${botNumber} token not configured in .env file!` + colors.reset);
        console.log(colors.yellow + `💡 Please set BOT${botNumber}_TOKEN in .env file` + colors.reset);
        return;
    }
    
    if (!fs.existsSync(bot.file)) {
        console.log(colors.red + `❌ ${bot.file} not found!` + colors.reset);
        return;
    }
    
    console.log(colors.green + `🚀 Starting ${bot.name}...` + colors.reset);
    console.log(colors.yellow + '📝 Press Ctrl+C to stop the bot' + colors.reset);
    console.log();
    
    const child = spawn('node', [bot.file], {
        stdio: 'inherit',
        cwd: process.cwd()
    });
    
    child.on('close', (code) => {
        console.log();
        if (code === 0) {
            console.log(colors.green + `✅ ${bot.name} stopped successfully` + colors.reset);
        } else {
            console.log(colors.red + `❌ ${bot.name} stopped with code ${code}` + colors.reset);
        }
        waitForKeyPress(main);
    });
}

function startAllBots() {
    console.log(colors.green + '🚀 Starting all bots with PM2...' + colors.reset);
    
    const child = spawn('./start-all.sh', [], {
        stdio: 'inherit',
        cwd: process.cwd()
    });
    
    child.on('close', (code) => {
        console.log();
        if (code === 0) {
            console.log(colors.green + '✅ All bots started successfully with PM2' + colors.reset);
        } else {
            console.log(colors.red + `❌ Failed to start bots (code ${code})` + colors.reset);
        }
        waitForKeyPress(main);
    });
}

function startWebPanel() {
    console.log(colors.blue + '🌐 Starting Web Panel...' + colors.reset);
    console.log(colors.yellow + '📝 Press Ctrl+C to stop the web panel' + colors.reset);
    console.log();
    
    const child = spawn('node', ['web-panel.js'], {
        stdio: 'inherit',
        cwd: process.cwd()
    });
    
    child.on('close', (code) => {
        console.log();
        if (code === 0) {
            console.log(colors.green + '✅ Web Panel stopped successfully' + colors.reset);
        } else {
            console.log(colors.red + `❌ Web Panel stopped with code ${code}` + colors.reset);
        }
        waitForKeyPress(main);
    });
}

function waitForKeyPress(callback) {
    console.log(colors.yellow + '📝 Press any key to continue...' + colors.reset);
    
    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.once('data', () => {
            process.stdin.setRawMode(false);
            callback();
        });
    } else {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.once('line', () => {
            rl.close();
            callback();
        });
    }
}

function showEnvironmentSetup() {
    console.log(colors.yellow + '⚙️  Environment Setup Guide' + colors.reset);
    console.log();
    console.log('1. 📝 Edit .env file and add your bot tokens:');
    console.log('   BOT1_TOKEN=your_actual_discord_token_here');
    console.log();
    console.log('2. 🔧 Install dependencies (if needed):');
    console.log('   npm install');
    console.log();
    console.log('3. 🚀 Run a bot:');
    console.log('   Choose option 1-6 from the main menu');
    console.log();
    console.log(colors.red + '⚠️  Important: These are self-bots and may violate Discord ToS' + colors.reset);
    console.log(colors.yellow + '💡 Use at your own risk!' + colors.reset);
    console.log();
    
    waitForKeyPress(main);
}

function main() {
    printHeader();
    
    if (!checkEnvironment()) {
        console.log(colors.red + '❌ Environment check failed!' + colors.reset);
        console.log(colors.yellow + '💡 Please run option 9 for setup instructions' + colors.reset);
        console.log();
    }
    
    printMenu();
    
    process.stdout.write(colors.cyan + '🎯 Select an option (0-9): ' + colors.reset);
    
    // Check if stdin is a TTY (interactive terminal)
    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.once('data', (key) => {
            process.stdin.setRawMode(false);
            const choice = key.toString().trim();
            
            console.log(choice);
            console.log();
            
            handleChoice(choice);
        });
    } else {
        // For non-interactive environments, use readline
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.once('line', (choice) => {
            rl.close();
            console.log();
            handleChoice(choice.trim());
        });
    }
}

function handleChoice(choice) {
    switch (choice) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
            runBot(parseInt(choice));
            break;
        case '7':
            startAllBots();
            break;
        case '8':
            startWebPanel();
            break;
        case '9':
            showEnvironmentSetup();
            break;
        case '0':
            console.log(colors.green + '👋 Goodbye!' + colors.reset);
            process.exit(0);
            break;
        default:
            console.log(colors.red + '❌ Invalid option!' + colors.reset);
            setTimeout(main, 1000);
            break;
    }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
    console.log();
    console.log(colors.yellow + '👋 Exiting...' + colors.reset);
    process.exit(0);
});

// Start the application
if (require.main === module) {
    main();
}

module.exports = { main, bots, colors };