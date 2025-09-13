// Bot Configuration - Secure Token Storage
require('dotenv').config();

const config = {
    tokens: {
        bot1: process.env.BOT1_TOKEN,
        bot2: process.env.BOT2_TOKEN,
        bot3: process.env.BOT3_TOKEN,
        bot4: process.env.BOT4_TOKEN,
        bot5: process.env.BOT5_TOKEN,
        bot6: process.env.BOT6_TOKEN,
        bot7: process.env.BOT7_TOKEN
    },
    security: {
        encryptionKey: process.env.ENCRYPTION_KEY || 'ultimate-self-bot-2025-secure-key',
        maxRetries: parseInt(process.env.MAX_RETRIES) || 10,
        retryDelay: parseInt(process.env.RETRY_DELAY) || 3000,
        tokenRotationInterval: parseInt(process.env.TOKEN_ROTATION_INTERVAL) || 3600000
    },
    antiDetection: {
        userAgentRotation: process.env.USER_AGENT_ROTATION === 'true',
        messagePatternRotation: process.env.MESSAGE_PATTERN_ROTATION === 'true',
        activityRotation: process.env.ACTIVITY_ROTATION === 'true',
        statusRotation: process.env.STATUS_ROTATION === 'true',
        typingSimulation: process.env.TYPING_SIMULATION === 'true',
        reactionSimulation: process.env.REACTION_SIMULATION === 'true'
    },
    rateLimiting: {
        maxMessagesPerMinute: parseInt(process.env.MAX_MESSAGES_PER_MINUTE) || 999999,
        maxCommandsPerMinute: parseInt(process.env.MAX_COMMANDS_PER_MINUTE) || 999999,
        maxReactionsPerMinute: parseInt(process.env.MAX_REACTIONS_PER_MINUTE) || 999999,
        maxJoinsPerHour: parseInt(process.env.MAX_JOINS_PER_HOUR) || 999999,
        maxLeavesPerHour: parseInt(process.env.MAX_LEAVES_PER_HOUR) || 999999
    },
    stealth: {
        stealthMode: process.env.STEALTH_MODE === 'true' || true,
        humanBehavior: process.env.HUMAN_BEHAVIOR === 'true' || true,
        antiDetection: process.env.ANTI_DETECTION === 'true' || true,
        maxStealth: true,
        undetectable: true
    },
    discord: {
        apiVersion: process.env.API_VERSION || 'v10',
        gatewayVersion: process.env.GATEWAY_VERSION || 10,
        intents: parseInt(process.env.INTENTS) || 3276799
    }
};

module.exports = config;
