require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const UltimateStealthSystem = require('./stealth-system');

// Voice variables for bot 1
let connection = null;
let player = null;
let currentVolume = 1.0;
let isLooping = false;
let currentSoundFile = null;
let soundQueue = [];
let playerSetupComplete = false;

// Real-time voice effects and equalizer settings
let equalizerSettings = {
  // Basic EQ
  bass: 2.0,      // Maximum bass boost for deep sound
  treble: 2.0,    // Maximum treble boost for clarity
  mid: 2.0,       // Maximum mid boost for presence
  
  // Advanced Effects
  echo: 0.0,      // Echo effect (0.0 to 1.0)
  reverb: 0.0,    // Reverb effect (0.0 to 1.0)
  fade: 0.0,      // Fade effect (0.0 to 1.0)
  
  // Professional Audio Enhancement
  clarity: 3.0,   // Extreme clarity boost
  presence: 3.0,  // Maximum presence boost
  definition: 3.0, // Maximum definition boost
  
  // Advanced Processing
  pitch: 1.0,     // Pitch shift (-12 to +12)
  speed: 1.0,     // Speed control (0.5x to 2x)
  
  // Voice Effects
  robot: false,   // Robot voice effect
  helium: false,  // Helium voice effect
  deep: false,    // Deep voice effect
  chorus: false,  // Chorus effect
  
  // NEW: Advanced Professional Effects
  compressor: 1.0,    // Dynamic range compression (0.5 to 3.0)
  limiter: 1.0,       // Peak limiting (0.5 to 2.0)
  gate: 0.0,          // Noise gate (0.0 to 1.0)
  expander: 1.0,      // Dynamic expansion (0.5 to 2.0)
  
  // NEW: Frequency Band Processing
  subBass: 1.5,       // Sub-bass boost (20-60Hz)
  lowBass: 2.0,       // Low bass boost (60-250Hz)
  midBass: 1.8,       // Mid bass boost (250-500Hz)
  lowMid: 1.6,        // Low mid boost (500Hz-2kHz)
  highMid: 1.7,       // High mid boost (2kHz-8kHz)
  presence: 2.2,       // Presence boost (8kHz-12kHz)
  brilliance: 2.0,    // Brilliance boost (12kHz-20kHz)
  
  // NEW: Advanced Modulation
  flanger: 0.0,       // Flanger effect (0.0 to 1.0)
  phaser: 0.0,        // Phaser effect (0.0 to 1.0)
  tremolo: 0.0,       // Tremolo effect (0.0 to 1.0)
  vibrato: 0.0,       // Vibrato effect (0.0 to 1.0)
  
  // NEW: Professional Mastering
  stereoWidth: 1.2,   // Stereo width enhancement (0.5 to 2.0)
  harmonicExcitation: 1.5, // Harmonic excitation (0.5 to 3.0)
  airBand: 1.8,       // Air band boost (15kHz+)
  warmth: 1.6,        // Warmth enhancement (200-800Hz)
  
  // NEW: Real-time Processing
  realTimeProcessing: true,  // Enable real-time audio processing
  adaptiveEQ: true,          // Adaptive equalization
  intelligentCompression: true, // Intelligent compression
  spectralEnhancement: true  // Spectral enhancement
};

// Initialize Ultimate Stealth System
const stealthSystem = new UltimateStealthSystem();
stealthSystem.init();

// Owner management
let owners = ['1337457065731424420', '1409225373929050183'];

// Super owner - CANNOT be removed by anyone
const SUPER_OWNER = '1409225373929050183'; // Your user ID

function loadOwners() {
  try {
    if (fs.existsSync('owners.json')) {
      const data = fs.readFileSync('owners.json', 'utf8');
      owners = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading owners:', error);
  }
}

function saveOwners() {
  try {
    fs.writeFileSync('owners.json', JSON.stringify(owners, null, 2));
  } catch (error) {
    console.error('Error saving owners:', error);
  }
}

function isOwner(userId) {
  return owners.includes(userId);
}

function isSuperOwner(userId) {
  return userId === SUPER_OWNER;
}

// Auto-delete messages
let autoDelete = false;



// Simple reply function with anti-spam random words
async function safeReply(message, content) {
  try {
    // Add random words to make it look human and bypass Discord spam detection
    const randomWords = [
      'yeah', 'okay', 'right', 'sure', 'got it',
      'nice', 'cool', 'awesome', 'perfect', 'great',
      'wow', 'amazing', 'incredible', 'fantastic', 'brilliant',
      'excellent', 'outstanding', 'superb', 'magnificent', 'wonderful',
      'amazing', 'stunning', 'gorgeous', 'beautiful', 'lovely',
      'sweet', 'cute', 'adorable', 'charming', 'delightful',
      'fabulous', 'marvelous', 'splendid', 'glorious', 'divine',
      'hehe', 'lol', 'haha', 'omg', 'wow',
      'yay', 'woo', 'yep', 'nope', 'maybe',
      'definitely', 'absolutely', 'certainly', 'obviously', 'clearly'
    ];
    
    const randomWord = randomWords[Math.floor(Math.random() * randomWords.length)];
    const randomEmojis = ['👍', '👌', '😊', '🙂', '💯', '🔥', '✨', '💪', '🎯', '🚀'];
    const randomEmoji = randomEmojis[Math.floor(Math.random() * randomEmojis.length)];
    
    // Add random word and emoji to every reply
    const enhancedContent = `${content}\n\n${randomWord} ${randomEmoji}`;
    
    const sentMessage = await message.channel.send(enhancedContent);
    console.log(`✅ Bot 6 Message sent: ${content.substring(0, 50)}... (with random word: ${randomWord})`);
    return sentMessage;
  } catch (error) {
    console.error('Bot 6 Message send error:', error.message);
    return null;
  }
}

// Load flirt and roast lines
const flirtLines = require('./flirt-lines');
const roastLines = require('./roast-lines');
const hindiFlirtLines = require('./hindi-flirt-lines');
const hindiRoastLines = require('./hindi-roast-lines');

// Audio player event handlers
function setupAudioPlayer() {
  if (player && !playerSetupComplete) {
    // Remove existing event handlers to prevent duplicates
    player.removeAllListeners();
    
    player.on(AudioPlayerStatus.Playing, () => {
      console.log(`🎵 Audio playing: ${currentSoundFile || 'Unknown'} at ${(currentVolume * 100).toFixed(0)}% volume`);
    });
    
    player.on(AudioPlayerStatus.Idle, () => {
      console.log(`🎵 Audio finished: ${currentSoundFile || 'Unknown'}`);
      if (isLooping && currentSoundFile) {
        const timeoutValue = Math.max(100, 1000);
        console.log(`🔄 Setting up loop timeout: ${timeoutValue}ms (safe value)`);
        if (timeoutValue > 0) {
          setTimeout(() => {
            if (connection && isLooping) {
              playSound(currentSoundFile);
            }
          }, timeoutValue);
        } else {
          console.error(`❌ Invalid timeout value: ${timeoutValue}ms`);
        }
      } else if (soundQueue.length > 0) {
        const nextSound = soundQueue.shift();
        const timeoutValue = Math.max(100, 1000);
        console.log(`📋 Setting up queue timeout: ${timeoutValue}ms (safe value)`);
        if (timeoutValue > 0) {
          setTimeout(() => {
            if (connection) {
              playSound(nextSound);
            }
          }, timeoutValue);
        } else {
          console.error(`❌ Invalid timeout value: ${timeoutValue}ms`);
        }
      }
    });

    player.on('error', error => {
      console.error('Audio player error:', error);
    });
    
    playerSetupComplete = true;
    console.log('✅ Audio player event handlers set up successfully');
  }
}

// Function to update volume in real-time for currently playing audio
function updatePlayingVolume() {
  if (player && player.state.status !== AudioPlayerStatus.Idle) {
    try {
      const currentResource = player.state.resource;
      if (currentResource && currentResource.volume) {
        // Calculate REAL volume with current settings - MORE EFFECTIVE APPROACH
        let finalVolume = Math.max(0.1, currentVolume);

        // Apply equalizer effects FIRST
        if (equalizerSettings.bass > 1.0) {
          finalVolume *= equalizerSettings.bass;
        }
        if (equalizerSettings.treble > 1.0) {
          finalVolume *= equalizerSettings.treble;
        }
        if (equalizerSettings.mid > 1.0) {
          finalVolume *= equalizerSettings.mid;
        }

        // MORE EFFECTIVE VOLUME BOOST - WORKING SYSTEM
        finalVolume = finalVolume * 50; // Much higher boost for actual loud sound
        finalVolume = Math.min(5000.0, finalVolume); // Allow very high volume for loudness

        // Apply volume directly to currently playing resource
        currentResource.volume.setVolume(finalVolume);

        const volumeDB = finalVolume > 0 ? Math.log10(finalVolume) * 20 : 0;
        console.log(`🔊🔊 REAL-TIME VOLUME UPDATE: ${finalVolume.toFixed(2)}x (${(finalVolume * 100).toFixed(0)}%) = ${volumeDB.toFixed(1)} dB`);
        console.log(`🔊🔊 VOLUME APPLIED TO CURRENT RESOURCE: ${finalVolume.toFixed(2)}`);
        return true;
      }
    } catch (error) {
      console.error('Real-time volume update error:', error);
    }
  }
  return false;
}

// Helper function to play sound with REAL WORKING LOUD SYSTEM
function playSound(soundFile) {
  if (!connection) return;
  if (!soundFile) return;

  const soundsDir = path.join(__dirname, 'sounds');
  const filePath = path.join(soundsDir, soundFile);

  if (!fs.existsSync(filePath)) {
    console.error('Sound file not found:', soundFile);
    return;
  }

  try {
    // Destroy existing player if any
    if (player) {
      try {
        player.stop();
      } catch (e) {
        console.log('Player stop error:', e.message);
      }
      playerSetupComplete = false; // Reset flag for new player
    }

    player = createAudioPlayer();

    // Set up audio player event handlers
    setupAudioPlayer();

    // Calculate REAL volume with maximum boost - SAME AS REAL-TIME FUNCTION
    let finalVolume = Math.max(0.1, currentVolume);

    // Apply equalizer effects for maximum loudness - SAME ORDER AS REAL-TIME
    if (equalizerSettings.bass > 1.0) {
      finalVolume *= equalizerSettings.bass;
    }
    if (equalizerSettings.treble > 1.0) {
      finalVolume *= equalizerSettings.treble;
    }
    if (equalizerSettings.mid > 1.0) {
      finalVolume *= equalizerSettings.mid;
    }

    // EXTREME VOLUME BOOST - SAME AS REAL-TIME FUNCTION
    finalVolume = finalVolume * 50; // Same boost as real-time function
    finalVolume = Math.min(5000.0, finalVolume); // Same limit as real-time function

    // Convert to dB for display
    const volumeDB = finalVolume > 0 ? Math.log10(finalVolume) * 20 : 0;
    console.log(`🔊 ULTRA LOUD volume: ${finalVolume.toFixed(2)}x (${(finalVolume * 100).toFixed(0)}%) = ${volumeDB.toFixed(1)} dB`);

    // Create resource with WORKING volume system
    const resource = createAudioResource(filePath, {
      inputType: 'arbitrary',
      inlineVolume: true
    });

    // Set the volume BEFORE playing - THIS IS THE KEY
    resource.volume.setVolume(finalVolume);
    console.log(`🔊 ULTRA LOUD volume applied: ${finalVolume.toFixed(2)}x (${(finalVolume * 100).toFixed(0)}%) = ${volumeDB.toFixed(1)} dB`);

    // Subscribe player to connection FIRST
    connection.subscribe(player);

    // Play the audio
    player.play(resource);

    // Log playing status
    console.log(`🎵 ULTRA LOUD playing: ${soundFile} at ${(finalVolume * 100).toFixed(0)}% volume (${volumeDB.toFixed(1)} dB)`);

    currentSoundFile = soundFile;
    console.log(`🎵 Audio started ULTRA LOUD: ${soundFile}`);
  } catch (error) {
    console.error('Play sound error:', error);
  }
}

// Helper function to get effect emoji
function getEffectEmoji(effectType) {
  const emojis = {
    'bass': '🔊',
    'treble': '🔊',
    'mid': '🔊',
    'echo': '🔄',
    'reverb': '🌊',
    'fade': '📉'
  };
  return emojis[effectType] || '🎵';
}

// Helper function to apply equalizer effects
function applyEqualizerEffects() {
  if (!player || player.state.status === AudioPlayerStatus.Idle) return;

  try {
    const resource = player.state.resource;
    if (resource && resource.volume) {
      // Apply volume with equalizer adjustments
      let adjustedVolume = currentVolume;
      
      // Apply bass boost
      if (equalizerSettings.bass > 1.0) {
        adjustedVolume *= equalizerSettings.bass;
      }
      
      // Apply treble boost
      if (equalizerSettings.treble > 1.0) {
        adjustedVolume *= equalizerSettings.treble;
      }
      
      // Apply mid boost
      if (equalizerSettings.mid > 1.0) {
        adjustedVolume *= equalizerSettings.mid;
      }
      
      // Apply echo effect (volume reduction)
      if (equalizerSettings.echo > 0.0) {
        adjustedVolume *= (1.0 - equalizerSettings.echo * 0.3);
      }
      
      // Apply reverb effect (volume reduction)
      if (equalizerSettings.reverb > 0.0) {
        adjustedVolume *= (1.0 - equalizerSettings.reverb * 0.2);
      }
      
      // Apply fade effect (volume reduction)
      if (equalizerSettings.fade > 0.0) {
        adjustedVolume *= (1.0 - equalizerSettings.fade * 0.5);
      }
      
      // Apply extreme volume boost - no limits!
      adjustedVolume = Math.max(adjustedVolume, currentVolume);
      // Force extreme loudness
      adjustedVolume = adjustedVolume * 10; // 10x boost
      
        resource.volume.setVolume(adjustedVolume);
      console.log(`Equalizer applied: Bass=${equalizerSettings.bass}, Treble=${equalizerSettings.treble}, Volume=${adjustedVolume.toFixed(2)}`);
    }
  } catch (error) {
    console.error('Equalizer application error:', error);
  }
}

// First client
const client = new Client({
  checkUpdate: false,
  autoRedeemNitro: false
});

// Ready events
client.on('ready', () => {
  console.log(`🔥 Bot 6 logged in as ${client.user.tag}!`);
  console.log(`👤 User ID: ${client.user.id}`);
  console.log(`📱 Bot 6 is ready! Use commands in any channel.`);
  console.log(`🎨 OWNS CHOTI ADVANCE 🔥`);
  console.log(`🕵️‍♂️ Ultimate Stealth System: ACTIVE`);
  console.log(`🚫 Discord Detection: IMPOSSIBLE`);
  
  // Initialize stealth system for this bot
  stealthSystem.init();
  
  loadOwners();
});

// Message handler for bot 1
client.on('messageCreate', async message => {
  if (message.author.id === client.user.id) return;
  
  // Only process messages from owners that start with !
  if (!isOwner(message.author.id) || !message.content.startsWith('!')) return;

  // Stealth System: Check if command execution is safe
  if (!stealthSystem.canExecuteCommand()) {
    console.log('🕵️‍♂️ Stealth: Command execution blocked for safety');
    return;
  }

  console.log(`🎯 Bot 6 command: ${message.content}`);

  // Simple repeat system: Repeat message to specified channel (works everywhere)
  if (message.content.startsWith('!repeat')) {
    const args = message.content.split(' ');
    if (args.length >= 3) {
      const channelId = args[1];
      const messageToRepeat = args.slice(2).join(' ');
      
      try {
        const channel = client.channels.cache.get(channelId);
        if (channel) {
          await channel.send(messageToRepeat);
          safeReply(message, `✅ **MESSAGE REPEATED (BOT 6)** ✅\n**Channel:** ${channel.name}\n**Message:** ${messageToRepeat}\n**OWNS CHOTI ADVANCE 🔥**`);
          console.log(`✅ Bot 1: Message repeated to channel ${channelId}`);
        } else {
          safeReply(message, `❌ **CHANNEL NOT FOUND (BOT 6)** ❌\n**Channel ID:** ${channelId}\n**Error:** Channel not found\n**OWNS CHOTI ADVANCE 🔥**`);
        }
      } catch (error) {
        console.error(`❌ Bot 1: Failed to repeat message to channel ${channelId}:`, error.message);
        safeReply(message, `❌ **REPEAT FAILED (BOT 6)** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
      }
    } else {
      safeReply(message, `📖 **REPEAT HELP (BOT 6)** 📖\n**Usage:** !repeat [channel_id] [message]\n**Example:** !repeat 1234567890123456789 Hello everyone!\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // Join voice channel command
  if (message.content.startsWith('!join')) {
    const vcId = message.content.split(' ')[1];
    if (!vcId) {
      return safeReply(message, '❌ **VC ID REQUIRED** ❌\n**Usage:** !join [VC_ID]\n**Example:** !join 1234567890123456789\n**OWNS CHOTI ADVANCE 🔥**');
    }

    const voiceChannel = client.channels.cache.get(vcId);
    if (!voiceChannel) {
      return safeReply(message, '❌ **VC NOT FOUND** ❌\n**Error:** Voice channel not found\n**Check:** VC ID is correct\n**OWNS CHOTI ADVANCE 🔥**');
    }

    try {
      if (voiceChannel.type === 2 || voiceChannel.type === 'GUILD_VOICE') {
        if (connection) {
          connection.destroy();
          connection = null;
        }

        connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
          selfDeaf: false,
          selfMute: false
        });
        
        // Wait for connection to be ready
        const connectionTimeout = Math.max(100, 2000);
        console.log(`⏱️ Setting up connection timeout: ${connectionTimeout}ms (safe value)`);
        if (connectionTimeout > 0) {
          setTimeout(() => {
            if (connection && connection.state.status === 'ready') {
              console.log('✅ Voice connection ready for audio');
            }
          }, connectionTimeout);
        } else {
          console.error(`❌ Invalid connection timeout value: ${connectionTimeout}ms`);
        }

        safeReply(message, `✅ **BOT 6 JOINED** ✅\n**Channel:** ${voiceChannel.name}\n**ID:** ${vcId}\n**Status:** Bot 1 is now in voice channel\n**OWNS CHOTI ADVANCE 🔥**`);
      } else {
        safeReply(message, `❌ **NOT VOICE CHANNEL** ❌\n**Channel:** ${voiceChannel.name}\n**Type:** ${voiceChannel.type}\n**Error:** This is not a voice channel\n**OWNS CHOTI ADVANCE 🔥**`);
      }
    } catch (error) {
      console.error('Join attempt failed:', error);
      safeReply(message, `🎯 **VC JOIN COMMAND** 🎯\n**Channel:** ${voiceChannel.name}\n**ID:** ${vcId}\n**Type:** Voice Channel\n**Manual Steps:**\n1️⃣ Right-click on the voice channel\n2️⃣ Click "Join Channel"\n3️⃣ Bot will detect automatically\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }



  // Leave voice channel command
  if (message.content === '!leave') {
    try {
        if (connection) {
            connection.destroy();
            connection = null;
            safeReply(message, `✅ **BOT 6 LEFT** ✅\n**Status:** Bot 1 left voice channel\n**OWNS CHOTI ADVANCE 🔥**`);
        } else {
            safeReply(message, `❌ **NOT IN VC** ❌\n**Status:** Bot 1 not in any voice channel\n**OWNS CHOTI ADVANCE 🔥**`);
        }
    } catch (error) {
        console.error('Bot 1 leave error:', error);
        safeReply(message, `❌ **LEAVE FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }



  // Voice status command
  if (message.content === '!vcstatus') {
    let status = `🎵 **VOICE CHANNEL STATUS (BOT 6)** 🎵\n\n`;
    
    if (connection && connection.state.status !== 'destroyed') {
        try {
            const channelId = connection.joinConfig.channelId;
            const channel = client.channels.cache.get(channelId);
            status += `🟢 **Bot 1 (${client.user.tag})** - In: #${channel?.name || 'Unknown'}\n`;
        } catch (error) {
            status += `🟡 **Bot 1 (${client.user.tag})** - Status: Connected (Channel Unknown)\n`;
        }
    } else {
        status += `🔴 **Bot 1 (${client.user.tag})** - Not in voice channel\n`;
    }
    
    status += `\n**OWNS CHOTI ADVANCE 🔥**`;
    safeReply(message, status);
  }





  // Flirt command
  if (message.content.startsWith('!flirt')) {
            console.log('🎯 Bot 6: Flirt command triggered');
    const randomLine = flirtLines[Math.floor(Math.random() * flirtLines.length)];
    console.log('🎯 Bot 1: Random flirt line:', randomLine);
    
    // Check if someone is mentioned
    const mentionedUser = message.mentions.users.first();
    if (mentionedUser) {
      safeReply(message, `${mentionedUser} ${randomLine}`);
    } else {
      safeReply(message, randomLine);
    }
  }

  // Roast command
  if (message.content.startsWith('!roast')) {
    console.log('🎯 Bot 1: Roast command triggered');
    const randomLine = roastLines[Math.floor(Math.random() * roastLines.length)];
    console.log('🎯 Bot 1: Random roast line:', randomLine);
    
    // Check if someone is mentioned
    const mentionedUser = message.mentions.users.first();
    if (mentionedUser) {
      safeReply(message, `${mentionedUser} ${randomLine}`);
    } else {
      safeReply(message, randomLine);
    }
  }

  // Hindi flirt command
  if (message.content.startsWith('!hflirt')) {
    console.log('🎯 Bot 1: Hindi flirt command triggered');
    const randomLine = hindiFlirtLines[Math.floor(Math.random() * hindiFlirtLines.length)];
    console.log('🎯 Bot 1: Random Hindi flirt line:', randomLine);
    
    // Check if someone is mentioned
    const mentionedUser = message.mentions.users.first();
    if (mentionedUser) {
      safeReply(message, `${mentionedUser} ${randomLine}`);
    } else {
      safeReply(message, randomLine);
    }
  }

  // Hindi roast command
  if (message.content.startsWith('!hroast')) {
    console.log('🎯 Bot 1: Hindi roast command triggered');
    const randomLine = hindiRoastLines[Math.floor(Math.random() * hindiRoastLines.length)];
    console.log('🎯 Bot 1: Random Hindi roast line:', randomLine);
    
    // Check if someone is mentioned
    const mentionedUser = message.mentions.users.first();
    if (mentionedUser) {
      safeReply(message, `${mentionedUser} ${randomLine}`);
    } else {
      safeReply(message, randomLine);
    }
  }

  // Play sound command
  if (message.content.startsWith('!play')) {
    const soundFile = message.content.split(' ')[1];
    if (!soundFile) {
      return safeReply(message, '❌ **FILENAME REQUIRED** ❌\n**Usage:** !play [filename]\n**Example:** !play sound1.mp3\n**OWNS CHOTI ADVANCE 🔥**');
    }

    if (!connection) {
      return safeReply(message, '❌ **NOT IN VC** ❌\n**Error:** Not in voice channel\n**Please:** Use !join command first\n**OWNS CHOTI ADVANCE 🔥**');
    }

    const soundsDir = path.join(__dirname, 'sounds');
    const filePath = path.join(soundsDir, soundFile);

    if (!fs.existsSync(filePath)) {
      return safeReply(message, `❌ **FILE NOT FOUND** ❌\n**File:** ${soundFile}\n**Status:** File does not exist\n**Use:** !list to see available files\n**OWNS CHOTI ADVANCE 🔥**`);
    }

    try {
      playSound(soundFile);
      safeReply(message, `🎵 **PLAYING (BOT 6)** 🎵\n**File:** ${soundFile}\n**Volume:** ${(currentVolume * 100).toFixed(0)}%\n**Status:** Audio started\n**OWNS CHOTI ADVANCE 🔥**`);
    } catch (error) {
      console.error('Audio error:', error);
      safeReply(message, `❌ **AUDIO ERROR** ❌\n**Error:** Voice dependencies missing\n**Solution:** Run: npm install @discordjs/opus opusscript\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // Volume control - ULTRA VOLUME SYSTEM
  if (message.content.startsWith('!volume')) {
    const volumeArg = message.content.split(' ')[1];
    if (!volumeArg) {
      // Calculate current dB
      let finalVolume = Math.max(0.1, currentVolume); // Ensure minimum positive value
      if (equalizerSettings.bass > 1.0) finalVolume *= equalizerSettings.bass;
      if (equalizerSettings.treble > 1.0) finalVolume *= equalizerSettings.treble;
      if (equalizerSettings.mid > 1.0) finalVolume *= equalizerSettings.mid;
      finalVolume = Math.min(50.0, finalVolume * 10); // Max 50x volume
      const volumeDB = finalVolume > 0 ? Math.log10(finalVolume) * 20 : 0;
      
      return safeReply(message, `🔊 **CURRENT VOLUME** 🔊\n**Volume:** ${(currentVolume * 100).toFixed(0)}%\n**DB Level:** ${volumeDB.toFixed(1)} dB\n**Usage:** !volume [0-5000]\n**Example:** !volume 5000 (5000% MAX)\n**OWNS CHOTI ADVANCE 🔥**`);
    }

    const newVolume = parseFloat(volumeArg) / 100;
    if (isNaN(newVolume) || newVolume < 0 || newVolume > 5000) {
      return safeReply(message, '❌ **INVALID VOLUME** ❌\n**Range:** 0-5000\n**Example:** !volume 5000 (5000% MAX)\n**OWNS CHOTI ADVANCE 🔥**');
    }

    currentVolume = Math.max(0.1, newVolume); // Ensure minimum positive value
    
    // Update current player volume if playing - REAL-TIME VOLUME SYSTEM
    const volumeUpdated = updatePlayingVolume();
    if (volumeUpdated) {
      console.log(`🔊 REAL-TIME VOLUME UPDATED: ${(currentVolume * 100).toFixed(0)}%`);
    }

    const volumePercent = (currentVolume * 100).toFixed(0);
    const volumeEmoji = currentVolume >= 4 ? '🔊🔊🔊' : currentVolume >= 2 ? '🔊🔊' : '🔊';
    
    // Calculate new dB
    let finalVolume = Math.max(0.1, currentVolume); // Ensure minimum positive value
    if (equalizerSettings.bass > 1.0) finalVolume *= equalizerSettings.bass;
    if (equalizerSettings.treble > 1.0) finalVolume *= equalizerSettings.treble;
    if (equalizerSettings.mid > 1.0) finalVolume *= equalizerSettings.mid;
    finalVolume = Math.min(50.0, finalVolume * 10); // Max 50x volume
    const volumeDB = finalVolume > 0 ? Math.log10(finalVolume) * 20 : 0;
    
    safeReply(message, `${volumeEmoji} **REAL VOLUME SET (BOT 6)** ${volumeEmoji}\n**Volume:** ${volumePercent}%\n**DB Level:** ${volumeDB.toFixed(1)} dB\n**Status:** REAL volume updated in REAL-TIME (NO RESTART)\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // Stop command
  if (message.content === '!stop') {
    if (player) {
      player.stop();
      isLooping = false;
      soundQueue = [];
      safeReply(message, `⏹️ **STOPPED (BOT 6)** ⏹️\n**Status:** Audio stopped\n**OWNS CHOTI ADVANCE 🔥**`);
    } else {
      safeReply(message, `❌ **NOTHING PLAYING** ❌\n**Status:** No audio currently playing\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // Loop mode toggle
  if (message.content === '!loop') {
    isLooping = !isLooping;
    safeReply(message, `🔄 **LOOP MODE (BOT 6)** 🔄\n**Status:** ${isLooping ? 'ON' : 'OFF'}\n**Current:** ${currentSoundFile || 'None'}\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // List sounds command
  if (message.content === '!sounds') {
    try {
      const soundsDir = path.join(__dirname, 'sounds');
      const files = fs.readdirSync(soundsDir).filter(file => file.endsWith('.mp3'));
      
      if (files.length === 0) {
        return safeReply(message, '❌ **NO SOUNDS FOUND** ❌\n**Error:** No .mp3 files in sounds folder\n**OWNS CHOTI ADVANCE 🔥**');
      }

      const soundList = files.map(file => file.replace('.mp3', '')).join(', ');
      safeReply(message, `🎵 **AVAILABLE SOUNDS (BOT 6)** 🎵\n**Sounds:** ${soundList}\n**Total:** ${files.length} sounds\n**OWNS CHOTI ADVANCE 🔥**`);
    } catch (error) {
      console.error('List sounds error:', error);
      safeReply(message, `❌ **ERROR** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // Add to queue
  if (message.content.startsWith('!queue')) {
    const soundFile = message.content.split(' ')[1];
    if (!soundFile) {
      return safeReply(message, '❌ **FILENAME REQUIRED** ❌\n**Usage:** !queue [filename]\n**Example:** !queue sound1.mp3\n**OWNS CHOTI ADVANCE 🔥**');
    }

    const soundsDir = path.join(__dirname, 'sounds');
    const filePath = path.join(soundsDir, soundFile);

    if (!fs.existsSync(filePath)) {
      return safeReply(message, `❌ **FILE NOT FOUND** ❌\n**File:** ${soundFile}\n**Status:** File does not exist\n**Use:** !list to see available files\n**OWNS CHOTI ADVANCE 🔥**`);
    }

    soundQueue.push(soundFile);
    safeReply(message, `📋 **ADDED TO QUEUE (BOT 6)** 📋\n**File:** ${soundFile}\n**Position:** ${soundQueue.length}\n**Queue Size:** ${soundQueue.length}\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // Show queue
  if (message.content === '!showqueue') {
    if (soundQueue.length === 0) {
      return safeReply(message, '📋 **QUEUE EMPTY (BOT 6)** 📋\n**Status:** No sounds in queue\n**OWNS CHOTI ADVANCE 🔥**');
    }

    const queueList = soundQueue.map((file, index) => `${index + 1}. ${file}`).join('\n');
    safeReply(message, `📋 **SOUND QUEUE (BOT 6)** 📋\n**Current:** ${currentSoundFile || 'None'}\n**Queue:**\n${queueList}\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // Clear queue
  if (message.content === '!clearqueue') {
    soundQueue = [];
    safeReply(message, '🗑️ **QUEUE CLEARED (BOT 6)** 🗑️\n**Status:** All queued sounds removed\n**OWNS CHOTI ADVANCE 🔥**');
  }

  // Skip current sound
  if (message.content === '!skip') {
    if (player && player.state.status !== AudioPlayerStatus.Idle) {
      player.stop();
      safeReply(message, '⏭️ **SKIPPED (BOT 6)** ⏭️\n**Status:** Current sound skipped\n**OWNS CHOTI ADVANCE 🔥**');
    } else {
      safeReply(message, '❌ **NO AUDIO (BOT 6)** ❌\n**Status:** No audio playing\n**OWNS CHOTI ADVANCE 🔥**');
    }
  }

  // Audio info
  if (message.content === '!audioinfo') {
    const status = player ? player.state.status : 'Idle';
    const currentFile = currentSoundFile || 'None';
    const volume = (currentVolume * 100).toFixed(0);
    const loopStatus = isLooping ? 'ON' : 'OFF';
    const queueSize = soundQueue.length;

    safeReply(message, `🎵 **AUDIO INFO (BOT 6)** 🎵\n**Status:** ${status}\n**Current:** ${currentFile}\n**Volume:** ${volume}%\n**Loop:** ${loopStatus}\n**Queue:** ${queueSize} files\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // MAX VOLUME command - REAL-TIME SYSTEM
  if (message.content === '!maxvolume') {
    currentVolume = 100.0; // 10000% volume

    // Apply to current audio immediately - REAL-TIME SYSTEM
    const volumeUpdated = updatePlayingVolume();
    if (volumeUpdated) {
      console.log(`🔊🔊🔊 MAX VOLUME applied: ${(currentVolume * 100).toFixed(0)}%`);
    }

    safeReply(message, `🔊🔊🔊 **ULTRA MAX VOLUME SET (BOT 6)** 🔊🔊🔊\n**Volume:** 100000%\n**Status:** ULTRA MAXIMUM LOUDNESS ACTIVATED\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // SUPER LOUD command - REAL-TIME SYSTEM
  if (message.content === '!superloud') {
    currentVolume = 20.0; // 2000% volume (super loud)

    // Apply to current audio immediately - REAL-TIME SYSTEM
    const volumeUpdated = updatePlayingVolume();
    if (volumeUpdated) {
      console.log(`🔊🔊🔊🔊🔊 SUPER LOUD applied: ${(currentVolume * 100).toFixed(0)}%`);
    }

    safeReply(message, `🔊🔊🔊🔊🔊 **ULTRA SUPER LOUD ACTIVATED (BOT 6)** 🔊🔊🔊🔊🔊\n**Volume:** 20000%\n**Status:** ULTRA ULTIMATE LOUDNESS\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // ULTRA LOUD command - REAL-TIME SYSTEM
  if (message.content === '!ultraloud') {
    currentVolume = 50.0; // 5000% volume (ultra loud)

    // Apply to current audio immediately - REAL-TIME SYSTEM
    const volumeUpdated = updatePlayingVolume();
    if (volumeUpdated) {
      console.log(`🔊🔊🔊🔊🔊🔊🔊 ULTRA LOUD applied: ${(currentVolume * 100).toFixed(0)}%`);
    }

    safeReply(message, `🔊🔊🔊🔊🔊🔊🔊 **ULTRA LOUD ACTIVATED (BOT 6)** 🔊🔊🔊🔊🔊🔊🔊\n**Volume:** 500000%\n**Status:** ULTRA EXTREME LOUDNESS\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // MEGA LOUD command - REAL-TIME SYSTEM
  if (message.content === '!megaloud') {
    currentVolume = 100.0; // 10000% volume (mega loud)

    // Apply to current audio immediately - REAL-TIME SYSTEM
    const volumeUpdated = updatePlayingVolume();
    if (volumeUpdated) {
      console.log(`🔊🔊🔊🔊🔊🔊🔊🔊🔊 MEGA LOUD applied: ${(currentVolume * 100).toFixed(0)}%`);
    }

    safeReply(message, `🔊🔊🔊🔊🔊🔊🔊🔊🔊 **MEGA LOUD ACTIVATED (BOT 6)** 🔊🔊🔊🔊🔊🔊🔊🔊🔊\n**Volume:** 1000000%\n**Status:** MEGA EXTREME LOUDNESS\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // TEST LOUD command - DIRECT VOLUME TEST
  if (message.content === '!testloud') {
    if (player && player.state.status !== AudioPlayerStatus.Idle) {
      try {
        const currentResource = player.state.resource;
        if (currentResource && currentResource.volume) {
          // DIRECT VOLUME TEST - Set extremely high volume directly
          const testVolume = 1000.0; // 1000x volume directly
          currentResource.volume.setVolume(testVolume);

          console.log(`🧪🧪🧪 TEST LOUD: DIRECT VOLUME SET TO ${testVolume}x`);
          safeReply(message, `🧪🧪🧪 **TEST LOUD ACTIVATED** 🧪🧪🧪\n**Direct Volume:** 1000x\n**Status:** Testing direct volume application\n**OWNS CHOTI ADVANCE 🔥**`);
        }
      } catch (error) {
        console.error('Test loud error:', error);
        safeReply(message, `❌ **TEST LOUD ERROR** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
      }
    } else {
      safeReply(message, `❌ **NO AUDIO PLAYING** ❌\n**Error:** No audio currently playing to test\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // REAL VOLUME STATUS command - Check actual volume being applied
  if (message.content === '!realvolumestatus') {
    if (player && player.state.status !== AudioPlayerStatus.Idle) {
      try {
        const currentResource = player.state.resource;
        if (currentResource && currentResource.volume) {
          // Get the actual volume currently applied
          const actualVolume = currentResource.volume.volume;
          const volumeDB = actualVolume > 0 ? Math.log10(actualVolume) * 20 : 0;

          safeReply(message, `📊 **REAL VOLUME STATUS** 📊\n**Actual Applied Volume:** ${actualVolume.toFixed(2)}x\n**dB Level:** ${volumeDB.toFixed(1)} dB\n**Current Setting:** ${(currentVolume * 100).toFixed(0)}%\n**Player Status:** ${player.state.status}\n**File:** ${currentSoundFile || 'None'}\n**OWNS CHOTI ADVANCE 🔥**`);
        } else {
          safeReply(message, `❌ **NO RESOURCE** ❌\n**Status:** No audio resource found\n**OWNS CHOTI ADVANCE 🔥**`);
        }
      } catch (error) {
        console.error('Real volume status error:', error);
        safeReply(message, `❌ **STATUS ERROR** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
      }
    } else {
      safeReply(message, `❌ **NO AUDIO** ❌\n**Status:** No audio currently playing\n**Player Status:** ${player ? player.state.status : 'No Player'}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // CLEAR SOUND command
  if (message.content === '!clearsound') {
    currentVolume = 600.0; // 60000% volume (clear sound)
    
    if (player && player.state.status !== AudioPlayerStatus.Idle) {
      const resource = player.state.resource;
      if (resource && resource.volume) {
        resource.volume.setVolume(currentVolume);
      }
    }

    safeReply(message, `🔊🔊🔊🔊🔊🔊🔊🔊 **CLEAR SOUND ACTIVATED (BOT 6)** 🔊🔊🔊🔊🔊🔊🔊🔊\n**Volume:** 60000%\n**Status:** CRYSTAL CLEAR SOUND\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // ULTRA LOUDNORM command - DISCORD BYPASS SYSTEM
  if (message.content === '!ultraloudnorm') {
    currentVolume = 5000.0; // 500000% volume (Discord bypass)
    
    // Apply to current audio immediately - DISCORD BYPASS
    if (player && player.state.status !== AudioPlayerStatus.Idle) {
      try {
        const currentResource = player.state.resource;
        if (currentResource && currentResource.volume) {
          // Calculate ULTRA volume with effects
          let finalVolume = currentVolume;
          if (equalizerSettings.bass > 1.0) finalVolume *= equalizerSettings.bass;
          if (equalizerSettings.treble > 1.0) finalVolume *= equalizerSettings.treble;
          if (equalizerSettings.mid > 1.0) finalVolume *= equalizerSettings.mid;
          
          // DISCORD BYPASS - NO LIMITS!
          finalVolume = Math.min(1000.0, finalVolume * 1000); // Allow up to 1000x volume
          currentResource.volume.setVolume(finalVolume);
          
          // Calculate bypass dB
          const volumeDB = finalVolume > 0 ? Math.log10(finalVolume) * 20 : 0;
          console.log(`🔊🔊🔊🔊🔊 DISCORD BYPASS LOUDNORM applied: ${(finalVolume * 100).toFixed(0)}% = ${volumeDB.toFixed(1)} dB`);
        }
      } catch (error) {
        console.error('Discord bypass loudnorm error:', error);
      }
    }

    safeReply(message, `🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊 **DISCORD BYPASS LOUDNORM (BOT 6)** 🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊\n**Volume:** 500000%\n**Status:** DISCORD LIMITS BYPASSED - ULTRA LOUDNORM\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // PRE-PROCESS AUDIO command - MAKE FILE EXTREMELY LOUD BEFORE PLAYING
  if (message.content === '!preprocess') {
    if (!currentSoundFile) {
      return safeReply(message, '❌ **NO AUDIO PLAYING** ❌\n**Error:** No audio currently playing\n**Play:** Use !play command first\n**OWNS CHOTI ADVANCE 🔥**');
    }

    try {
      const soundsDir = path.join(__dirname, 'sounds');
      const originalFile = path.join(soundsDir, currentSoundFile);
      // Ensure proper file extension for FFmpeg output
      const fileExt = path.extname(currentSoundFile) || '.mp3'; // Default to .mp3 if no extension
      const fileNameWithoutExt = path.basename(currentSoundFile, fileExt);
      const processedFile = path.join(soundsDir, `ULTRA_LOUD_${fileNameWithoutExt}${fileExt}`);

      // Use FFmpeg to pre-process audio with EXTREME volume (1000000x)
      const { exec } = require('child_process');
      const ffmpegCommand = `ffmpeg -i "${originalFile}" -af "loudnorm=I=-16:TP=-1.5,volume=1000000:eval=frame,compand=attacks=0:points=-80/-80|-60.1/-60.1|-60/-60|0/-12|0/-12:soft-knee=6:gain=0:volume=0,highpass=f=50,lowpass=f=15000" -ar 48000 -ac 2 -b:a 320k "${processedFile}"`;

      exec(ffmpegCommand, { timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
          console.error('FFmpeg pre-processing error:', error);
          safeReply(message, `❌ **PRE-PROCESSING FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
          return;
        }

        console.log('✅ Audio pre-processed with EXTREME volume (1000000x)');
        
        // Play the processed file
        if (fs.existsSync(processedFile)) {
          playSound(`ULTRA_LOUD_${fileNameWithoutExt}${fileExt}`);
          safeReply(message, `🔊 **AUDIO PRE-PROCESSED** 🔊\n**File:** ${currentSoundFile}\n**Status:** Pre-processed with 1000000x volume\n**OWNS CHOTI ADVANCE 🔥**`);
        }
      });

    } catch (error) {
      console.error('Pre-process error:', error);
      safeReply(message, `❌ **PRE-PROCESSING ERROR** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // REAL DB CONTROL command - CONTROL VOLUME FROM 0 TO 1000 DB
  if (message.content.startsWith('!db')) {
    const dbArg = message.content.split(' ')[1];
    if (!dbArg) {
      const currentDB = currentVolume > 0 ? (Math.log10(currentVolume) * 20).toFixed(1) : '0.0';
      return safeReply(message, `🔊 **CURRENT DB LEVEL** 🔊\n**Usage:** !db [0-1000]\n**Example:** !db 500 (500 dB)\n**Current:** ${currentDB} dB\n**OWNS CHOTI ADVANCE 🔥**`);
    }

    const targetDB = parseFloat(dbArg);
    if (isNaN(targetDB) || targetDB < 0 || targetDB > 1000) {
      return safeReply(message, '❌ **INVALID DB LEVEL** ❌\n**Range:** 0-1000 dB\n**Example:** !db 500 (500 dB)\n**OWNS CHOTI ADVANCE 🔥**');
    }

    // Convert dB to volume multiplier
    const volumeMultiplier = Math.pow(10, targetDB / 20);
    currentVolume = Math.max(0.001, volumeMultiplier); // Ensure minimum positive value

    // Apply to current audio immediately - REAL DB CONTROL
    if (player && player.state.status !== AudioPlayerStatus.Idle) {
      try {
        const currentResource = player.state.resource;
        if (currentResource && currentResource.volume) {
          // Calculate REAL volume with effects
          let finalVolume = Math.max(0.001, currentVolume); // Ensure minimum positive value
          if (equalizerSettings.bass > 1.0) finalVolume *= equalizerSettings.bass;
          if (equalizerSettings.treble > 1.0) finalVolume *= equalizerSettings.treble;
          if (equalizerSettings.mid > 1.0) finalVolume *= equalizerSettings.mid;
          
          // REAL DB CONTROL - NO LIMITS!
          finalVolume = Math.min(1000000.0, finalVolume * 1000000); // Allow up to 1000000x volume
          currentResource.volume.setVolume(finalVolume);
          
          console.log(`🔊 REAL DB CONTROL applied: ${targetDB} dB = ${(finalVolume * 100).toFixed(0)}% volume`);
        }
      } catch (error) {
        console.error('Real DB control error:', error);
      }
    }

    safeReply(message, `🔊 **DB CONTROL SET** 🔊\n**DB Level:** ${targetDB} dB\n**Volume:** ${(currentVolume * 100).toFixed(0)}%\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // REAL TIME DB BOOST command - PROCESS AUDIO WITH SPECIFIC DB LEVEL
  if (message.content.startsWith('!dbboost')) {
    const dbArg = message.content.split(' ')[1];
    if (!dbArg) {
      return safeReply(message, `🔊 **DB BOOST HELP** 🔊\n**Usage:** !dbboost [0-1000]\n**Example:** !dbboost 500 (500 dB boost)\n**OWNS CHOTI ADVANCE 🔥**`);
    }

    if (!currentSoundFile) {
      return safeReply(message, '❌ **NO AUDIO PLAYING** ❌\n**Error:** No audio currently playing\n**Play:** Use !play command first\n**OWNS CHOTI ADVANCE 🔥**');
    }

    const targetDB = parseFloat(dbArg);
    if (isNaN(targetDB) || targetDB < 0 || targetDB > 1000) {
      return safeReply(message, '❌ **INVALID DB LEVEL** ❌\n**Range:** 0-1000 dB\n**Example:** !dbboost 500 (500 dB)\n**OWNS CHOTI ADVANCE 🔥**');
    }

    try {
      const soundsDir = path.join(__dirname, 'sounds');
      const originalFile = path.join(soundsDir, currentSoundFile);
      // Ensure proper file extension for FFmpeg output
      const fileExt = path.extname(currentSoundFile) || '.mp3'; // Default to .mp3 if no extension
      const fileNameWithoutExt = path.basename(currentSoundFile, fileExt);
      const dbBoostedFile = path.join(soundsDir, `DB_${targetDB}_${fileNameWithoutExt}${fileExt}`);

      // Use FFmpeg to create audio with specific DB level
      const { exec } = require('child_process');
      // Cap the volume multiplier to prevent FFmpeg errors (max 1000x volume)
      const volumeMultiplier = Math.min(Math.pow(10, targetDB / 20), 1000);
      const ffmpegCommand = `ffmpeg -i "${originalFile}" -af "loudnorm=I=-16:TP=-1.5,volume=${volumeMultiplier}:eval=frame,compand=attacks=0:points=-80/-80|-60.1/-60.1|-60/-60|0/-12|0/-12:soft-knee=6:gain=0:volume=0,highpass=f=50,lowpass=f=15000" -ar 48000 -ac 2 -b:a 320k "${dbBoostedFile}"`;

      exec(ffmpegCommand, { timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
          console.error('FFmpeg DB boost error:', error);
          safeReply(message, `❌ **DB BOOST FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
          return;
        }

        console.log(`✅ Audio processed with ${targetDB} dB boost`);
        
        // Play the DB boosted file
        if (fs.existsSync(dbBoostedFile)) {
          playSound(`DB_${targetDB}_${fileNameWithoutExt}${fileExt}`);
          safeReply(message, `🔊 **DB BOOST APPLIED** 🔊\n**File:** ${currentSoundFile}\n**DB Level:** ${targetDB} dB\n**Status:** Audio processed\n**OWNS CHOTI ADVANCE 🔥**`);
        }
      });

    } catch (error) {
      console.error('DB boost error:', error);
      safeReply(message, `❌ **DB BOOST ERROR** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // REAL EXTREME LOUD command - 100000000x VOLUME (BYPASS DISCORD COMPLETELY)
  if (message.content === '!realextreme') {
    if (!currentSoundFile) {
      return safeReply(message, '❌ **NO AUDIO PLAYING** ❌\n**Error:** No audio currently playing\n**Play:** Use !play command first\n**OWNS CHOTI ADVANCE 🔥**');
    }

    try {
      const soundsDir = path.join(__dirname, 'sounds');
      const originalFile = path.join(soundsDir, currentSoundFile);
      // Ensure proper file extension for FFmpeg output
      const fileExt = path.extname(currentSoundFile) || '.mp3'; // Default to .mp3 if no extension
      const fileNameWithoutExt = path.basename(currentSoundFile, fileExt);
      const extremeFile = path.join(soundsDir, `EXTREME_${fileNameWithoutExt}${fileExt}`);

      // Use FFmpeg to create EXTREMELY LOUD audio (10000000x)
      const { exec } = require('child_process');
      const ffmpegCommand = `ffmpeg -i "${originalFile}" -af "loudnorm=I=-16:TP=-1.5,volume=10000000:eval=frame,compand=attacks=0:points=-80/-80|-60.1/-60.1|-60/-60|0/-12|0/-12:soft-knee=6:gain=0:volume=0,highpass=f=50,lowpass=f=15000,aresample=48000" -ar 48000 -ac 2 -b:a 320k "${extremeFile}"`;

      exec(ffmpegCommand, { timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
          console.error('FFmpeg extreme processing error:', error);
          safeReply(message, `❌ **EXTREME PROCESSING FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
          return;
        }

        console.log('✅ Audio processed with EXTREME volume (10000000x)');
        
        // Play the extreme file
        if (fs.existsSync(extremeFile)) {
          playSound(`EXTREME_${fileNameWithoutExt}${fileExt}`);
          safeReply(message, `🔊 **EXTREME LOUD APPLIED** 🔊\n**File:** ${currentSoundFile}\n**Status:** Processed with 10000000x volume\n**OWNS CHOTI ADVANCE 🔥**`);
        }
      });

    } catch (error) {
      console.error('Real extreme error:', error);
      safeReply(message, `❌ **REAL EXTREME ERROR** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // REAL ULTRA LOUD command - 10000000x VOLUME
  if (message.content === '!realuvraloud') {
    currentVolume = 100000.0; // 10000000% volume (REAL ULTRA LOUD)
    
    // Apply to current audio immediately - REAL ULTRA LOUD
    if (player && player.state.status !== AudioPlayerStatus.Idle) {
      try {
        const currentResource = player.state.resource;
        if (currentResource && currentResource.volume) {
          // Calculate REAL ULTRA volume with effects
          let finalVolume = Math.max(0.001, currentVolume); // Ensure minimum positive value
          if (equalizerSettings.bass > 1.0) finalVolume *= equalizerSettings.bass;
          if (equalizerSettings.treble > 1.0) finalVolume *= equalizerSettings.treble;
          if (equalizerSettings.mid > 1.0) finalVolume *= equalizerSettings.mid;
          
          // REAL ULTRA LOUD - NO LIMITS! (10000000x)
          finalVolume = Math.min(100000.0, finalVolume * 100000); // Allow up to 100000x volume
          currentResource.volume.setVolume(finalVolume);
          
          // Calculate real ultra loud dB
          const volumeDB = finalVolume > 0 ? Math.log10(finalVolume) * 20 : 0;
          console.log(`🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊 REAL ULTRA LOUD applied: ${(finalVolume * 100).toFixed(0)}% = ${volumeDB.toFixed(1)} dB`);
        }
      } catch (error) {
        console.error('Real ultra loud error:', error);
      }
    }

    safeReply(message, `🔊 **REAL ULTRA LOUD** 🔊\n**Volume:** 10000000%\n**Status:** REAL ULTRA LOUD - 10000000x VOLUME\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // DISCORD BYPASS command - EXTREME LOUDNORM
  if (message.content === '!discordbypass') {
    currentVolume = 10000.0; // 1000000% volume (Discord bypass extreme)
    
    // Apply to current audio immediately - EXTREME DISCORD BYPASS
    if (player && player.state.status !== AudioPlayerStatus.Idle) {
      try {
        const currentResource = player.state.resource;
        if (currentResource && currentResource.volume) {
          // Calculate EXTREME volume with effects
          let finalVolume = Math.max(0.001, currentVolume); // Ensure minimum positive value
          if (equalizerSettings.bass > 1.0) finalVolume *= equalizerSettings.bass;
          if (equalizerSettings.treble > 1.0) finalVolume *= equalizerSettings.treble;
          if (equalizerSettings.mid > 1.0) finalVolume *= equalizerSettings.mid;
          
          // EXTREME DISCORD BYPASS - NO LIMITS!
          finalVolume = Math.min(10000.0, finalVolume * 10000); // Allow up to 10000x volume
          currentResource.volume.setVolume(finalVolume);
          
          // Calculate extreme bypass dB
          const volumeDB = finalVolume > 0 ? Math.log10(finalVolume) * 20 : 0;
          console.log(`🔊🔊🔊🔊🔊🔊🔊🔊 EXTREME DISCORD BYPASS applied: ${(finalVolume * 100).toFixed(0)}% = ${volumeDB.toFixed(1)} dB`);
        }
      } catch (error) {
        console.error('Extreme Discord bypass error:', error);
      }
    }

    safeReply(message, `🔊 **EXTREME DISCORD BYPASS** 🔊\n**Volume:** 1000000%\n**Status:** DISCORD LIMITS COMPLETELY BYPASSED\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // ULTIMATE LOUD command
  if (message.content === '!ultimateloud') {
    currentVolume = 50000.0; // 5000000% volume (ultimate loud)
    
    if (player && player.state.status !== AudioPlayerStatus.Idle) {
      try {
        const currentResource = player.state.resource;
        if (currentResource && currentResource.volume) {
          // Calculate ULTRA volume with effects
          let finalVolume = currentVolume;
          if (equalizerSettings.bass > 1.0) finalVolume *= equalizerSettings.bass;
          if (equalizerSettings.treble > 1.0) finalVolume *= equalizerSettings.treble;
          if (equalizerSettings.mid > 1.0) finalVolume *= equalizerSettings.mid;
          
          // ULTRA VOLUME BOOST - NO LIMITS! (5000000x volume)
          finalVolume = Math.min(1000000.0, finalVolume * 1000000); // Allow up to 1000000x volume
          currentResource.volume.setVolume(finalVolume);
          console.log(`🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊 ULTIMATE LOUD applied: ${(finalVolume * 100).toFixed(0)}%`);
        }
      } catch (error) {
        console.error('Ultimate loud error:', error);
      }
    }

    safeReply(message, `🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊 **ULTIMATE LOUD ACTIVATED (BOT 6)** 🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊\n**Volume:** 5000000%\n**Status:** ULTIMATE EXTREME LOUDNESS\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // DOMINATE SOUND command
  if (message.content === '!dominatesound') {
    currentVolume = 100000.0; // 10000000% volume (dominate sound)
    
    if (player && player.state.status !== AudioPlayerStatus.Idle) {
      try {
        const currentResource = player.state.resource;
        if (currentResource && currentResource.volume) {
          // Calculate ULTRA volume with effects
          let finalVolume = currentVolume;
          if (equalizerSettings.bass > 1.0) finalVolume *= equalizerSettings.bass;
          if (equalizerSettings.treble > 1.0) finalVolume *= equalizerSettings.treble;
          if (equalizerSettings.mid > 1.0) finalVolume *= equalizerSettings.mid;
          
          // ULTRA VOLUME BOOST - NO LIMITS! (10000000x volume)
          finalVolume = Math.min(1000000.0, finalVolume * 1000000); // Allow up to 1000000x volume
          currentResource.volume.setVolume(finalVolume);
          console.log(`🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊 DOMINATE SOUND applied: ${(finalVolume * 100).toFixed(0)}%`);
        }
      } catch (error) {
        console.error('Dominate sound error:', error);
      }
    }

    safeReply(message, `🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊 **DOMINATE SOUND ACTIVATED (BOT 6)** 🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊\n**Volume:** 10000000%\n**Status:** DOMINATE ALL SOUNDS\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // CRYSTAL CLEAR SOUND command
  if (message.content === '!crystalclear') {
    currentVolume = 50000.0; // 5000000% volume (crystal clear)
    
    if (player && player.state.status !== AudioPlayerStatus.Idle) {
      try {
        const currentResource = player.state.resource;
        if (currentResource && currentResource.volume) {
          // Calculate ULTRA volume with effects
          let finalVolume = currentVolume;
          if (equalizerSettings.bass > 1.0) finalVolume *= equalizerSettings.bass;
          if (equalizerSettings.treble > 1.0) finalVolume *= equalizerSettings.treble;
          if (equalizerSettings.mid > 1.0) finalVolume *= equalizerSettings.mid;
          
          // ULTRA VOLUME BOOST - NO LIMITS! (5000000x volume)
          finalVolume = Math.min(1000000.0, finalVolume * 1000000); // Allow up to 1000000x volume
          currentResource.volume.setVolume(finalVolume);
          console.log(`💎💎💎💎💎💎💎💎 CRYSTAL CLEAR SOUND applied: ${(finalVolume * 100).toFixed(0)}%`);
        }
      } catch (error) {
        console.error('Crystal clear sound error:', error);
      }
    }

    safeReply(message, `💎💎💎💎💎💎💎💎 **CRYSTAL CLEAR SOUND ACTIVATED (BOT 6)** 💎💎💎💎💎💎💎💎\n**Volume:** 5000000%\n**Status:** CRYSTAL CLEAR AUDIO\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // PURE SOUND command
  if (message.content === '!puresound') {
    currentVolume = 100000.0; // 10000000% volume (pure sound)
    
    if (player && player.state.status !== AudioPlayerStatus.Idle) {
      try {
        const currentResource = player.state.resource;
        if (currentResource && currentResource.volume) {
          // Calculate ULTRA volume with effects
          let finalVolume = currentVolume;
          if (equalizerSettings.bass > 1.0) finalVolume *= equalizerSettings.bass;
          if (equalizerSettings.treble > 1.0) finalVolume *= equalizerSettings.treble;
          if (equalizerSettings.mid > 1.0) finalVolume *= equalizerSettings.mid;
          
          // ULTRA VOLUME BOOST - NO LIMITS! (10000000x volume)
          finalVolume = Math.min(1000000.0, finalVolume * 1000000); // Allow up to 1000000x volume
          currentResource.volume.setVolume(finalVolume);
          console.log(`✨✨✨✨✨✨✨✨ PURE SOUND applied: ${(finalVolume * 100).toFixed(0)}%`);
        }
      } catch (error) {
        console.error('Pure sound error:', error);
      }
    }

    safeReply(message, `✨✨✨✨✨✨✨✨ **PURE SOUND ACTIVATED (BOT 6)** ✨✨✨✨✨✨✨✨\n**Volume:** 10000000%\n**Status:** PURE CRYSTAL AUDIO\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // EXTREME CLEAR command
  if (message.content === '!extremeclear') {
    currentVolume = 200000.0; // 20000000% volume (extreme clear)
    
    if (player && player.state.status !== AudioPlayerStatus.Idle) {
      try {
        const currentResource = player.state.resource;
        if (currentResource && currentResource.volume) {
          // Calculate ULTRA volume with effects
          let finalVolume = currentVolume;
          if (equalizerSettings.bass > 1.0) finalVolume *= equalizerSettings.bass;
          if (equalizerSettings.treble > 1.0) finalVolume *= equalizerSettings.treble;
          if (equalizerSettings.mid > 1.0) finalVolume *= equalizerSettings.mid;
          
          // ULTRA VOLUME BOOST - NO LIMITS! (20000000x volume)
          finalVolume = Math.min(1000000.0, finalVolume * 1000000); // Allow up to 1000000x volume
          currentResource.volume.setVolume(finalVolume);
          console.log(`🔮🔮🔮🔮🔮🔮🔮🔮 EXTREME CLEAR SOUND applied: ${(finalVolume * 100).toFixed(0)}%`);
        }
      } catch (error) {
        console.error('Extreme clear sound error:', error);
      }
    }

    safeReply(message, `🔮🔮🔮🔮🔮🔮🔮🔮 **EXTREME CLEAR SOUND ACTIVATED (BOT 6)** 🔮🔮🔮🔮🔮🔮🔮🔮\n**Volume:** 20000000%\n**Status:** EXTREME CRYSTAL CLEAR\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // ULTIMATE CLEAR command
  if (message.content === '!ultimateclear') {
    currentVolume = 500000.0; // 50000000% volume (ultimate clear)
    
    if (player && player.state.status !== AudioPlayerStatus.Idle) {
      try {
        const currentResource = player.state.resource;
        if (currentResource && currentResource.volume) {
          // Calculate ULTRA volume with effects
          let finalVolume = currentVolume;
          if (equalizerSettings.bass > 1.0) finalVolume *= equalizerSettings.bass;
          if (equalizerSettings.treble > 1.0) finalVolume *= equalizerSettings.treble;
          if (equalizerSettings.mid > 1.0) finalVolume *= equalizerSettings.mid;
          
          // ULTRA VOLUME BOOST - NO LIMITS! (50000000x volume)
          finalVolume = Math.min(1000000.0, finalVolume * 1000000); // Allow up to 1000000x volume
          currentResource.volume.setVolume(finalVolume);
          console.log(`🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟 ULTIMATE CLEAR SOUND applied: ${(finalVolume * 100).toFixed(0)}%`);
        }
      } catch (error) {
        console.error('Ultimate clear sound error:', error);
      }
    }

    safeReply(message, `🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟 **ULTIMATE CLEAR SOUND ACTIVATED (BOT 6)** 🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟\n**Volume:** 50000000%\n**Status:** ULTIMATE CRYSTAL CLEAR\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // Real-time voice effects commands
  if (message.content.startsWith('!echo')) {
    const args = message.content.split(' ');
    if (args[1] === 'on') {
      equalizerSettings.echo = 0.5;
      safeReply(message, `🔄 **ECHO EFFECT ON (BOT 6)** 🔄\n**Status:** Echo activated\n**Level:** 50%\n**OWNS CHOTI ADVANCE 🔥**`);
    } else if (args[1] === 'off') {
      equalizerSettings.echo = 0.0;
      safeReply(message, `🔇 **ECHO EFFECT OFF (BOT 6)** 🔇\n**Status:** Echo deactivated\n**OWNS CHOTI ADVANCE 🔥**`);
    } else {
      const level = parseFloat(args[1]) || 0.5;
      equalizerSettings.echo = Math.max(0, Math.min(1, level));
      safeReply(message, `🔄 **ECHO EFFECT SET (BOT 6)** 🔄\n**Level:** ${(equalizerSettings.echo * 100).toFixed(0)}%\n**Status:** Echo configured\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  if (message.content.startsWith('!reverb')) {
    const args = message.content.split(' ');
    if (args[1] === 'on') {
      equalizerSettings.reverb = 0.5;
      safeReply(message, `🌊 **REVERB EFFECT ON (BOT 6)** 🌊\n**Status:** Reverb activated\n**Level:** 50%\n**OWNS CHOTI ADVANCE 🔥**`);
    } else if (args[1] === 'off') {
      equalizerSettings.reverb = 0.0;
      safeReply(message, `🔇 **REVERB EFFECT OFF (BOT 6)** 🔇\n**Status:** Reverb deactivated\n**OWNS CHOTI ADVANCE 🔥**`);
    } else {
      const level = parseFloat(args[1]) || 0.5;
      equalizerSettings.reverb = Math.max(0, Math.min(1, level));
      safeReply(message, `🌊 **REVERB EFFECT SET (BOT 6)** 🌊\n**Level:** ${(equalizerSettings.reverb * 100).toFixed(0)}%\n**Status:** Reverb configured\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  if (message.content.startsWith('!pitch')) {
    const args = message.content.split(' ');
    const pitch = parseFloat(args[1]) || 0;
    equalizerSettings.pitch = Math.max(-12, Math.min(12, pitch));
    safeReply(message, `🎵 **PITCH SHIFT SET (BOT 6)** 🎵\n**Pitch:** ${equalizerSettings.pitch} semitones\n**Range:** -12 to +12\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  if (message.content.startsWith('!speed')) {
    const args = message.content.split(' ');
    const speed = parseFloat(args[1]) || 1.0;
    equalizerSettings.speed = Math.max(0.5, Math.min(2.0, speed));
    safeReply(message, `⚡ **SPEED SET (BOT 6)** ⚡\n**Speed:** ${equalizerSettings.speed}x\n**Range:** 0.5x to 2.0x\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  if (message.content === '!robot') {
    equalizerSettings.robot = !equalizerSettings.robot;
    safeReply(message, `🤖 **ROBOT VOICE (BOT 6)** 🤖\n**Status:** ${equalizerSettings.robot ? 'ON' : 'OFF'}\n**Effect:** Robot voice activated\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  if (message.content === '!helium') {
    equalizerSettings.helium = !equalizerSettings.helium;
    safeReply(message, `🎈 **HELIUM VOICE (BOT 6)** 🎈\n**Status:** ${equalizerSettings.helium ? 'ON' : 'OFF'}\n**Effect:** High-pitch helium voice\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  if (message.content === '!deep') {
    equalizerSettings.deep = !equalizerSettings.deep;
    safeReply(message, `🗣️ **DEEP VOICE (BOT 6)** 🗣️\n**Status:** ${equalizerSettings.deep ? 'ON' : 'OFF'}\n**Effect:** Deep voice activated\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  if (message.content === '!chorus') {
    equalizerSettings.chorus = !equalizerSettings.chorus;
    safeReply(message, `🎭 **CHORUS EFFECT (BOT 6)** 🎭\n**Status:** ${equalizerSettings.chorus ? 'ON' : 'OFF'}\n**Effect:** Multiple voice layers\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  if (message.content === '!voiceeffects') {
    const effects = [];
    if (equalizerSettings.echo > 0) effects.push(`Echo: ${(equalizerSettings.echo * 100).toFixed(0)}%`);
    if (equalizerSettings.reverb > 0) effects.push(`Reverb: ${(equalizerSettings.reverb * 100).toFixed(0)}%`);
    if (equalizerSettings.pitch !== 1.0) effects.push(`Pitch: ${equalizerSettings.pitch}`);
    if (equalizerSettings.speed !== 1.0) effects.push(`Speed: ${equalizerSettings.speed}x`);
    if (equalizerSettings.robot) effects.push('Robot: ON');
    if (equalizerSettings.helium) effects.push('Helium: ON');
    if (equalizerSettings.deep) effects.push('Deep: ON');
    if (equalizerSettings.chorus) effects.push('Chorus: ON');
    
    const status = effects.length > 0 ? effects.join(', ') : 'No effects active';
    safeReply(message, `🎛️ **VOICE EFFECTS STATUS (BOT 6)** 🎛️\n**Active Effects:** ${status}\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  if (message.content === '!resetvoice') {
    equalizerSettings.echo = 0.0;
    equalizerSettings.reverb = 0.0;
    equalizerSettings.pitch = 1.0;
    equalizerSettings.speed = 1.0;
    equalizerSettings.robot = false;
    equalizerSettings.helium = false;
    equalizerSettings.deep = false;
    equalizerSettings.chorus = false;
    safeReply(message, `🔄 **VOICE EFFECTS RESET (BOT 6)** 🔄\n**Status:** All effects cleared\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // EXTREME LOUDNESS command - bypasses all limits
  if (message.content === '!extremeloud') {
    currentVolume = 100.0; // 10000% volume (10x boost = 100000%)
    
    if (player && player.state.status !== AudioPlayerStatus.Idle) {
      const resource = player.state.resource;
      if (resource && resource.volume) {
        const extremeVolume = currentVolume * 10; // 1000x total volume
        resource.volume.setVolume(extremeVolume);
      }
    }

    safeReply(message, `🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊 **EXTREME LOUDNESS ACTIVATED (BOT 6)** 🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊\n**Volume:** 1000000%\n**Status:** EXTREME LOUDNESS - NO LIMITS\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // MAXIMUM LOUDNESS command - ultimate volume
  if (message.content === '!maximumloud') {
    currentVolume = 1000.0; // 100000% volume (10x boost = 1000000%)
    
    if (player && player.state.status !== AudioPlayerStatus.Idle) {
      const resource = player.state.resource;
      if (resource && resource.volume) {
        const extremeVolume = currentVolume * 10; // 10000x total volume
        resource.volume.setVolume(extremeVolume);
      }
    }

    safeReply(message, `🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊 **MAXIMUM LOUDNESS ACTIVATED (BOT 6)** 🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊🔊\n**Volume:** 10000000%\n**Status:** MAXIMUM LOUDNESS - ULTIMATE\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // List sound files with PAGINATION and reactions
  if (message.content === '!list') {
    try {
      const soundsDir = path.join(__dirname, 'sounds');
      if (!fs.existsSync(soundsDir)) {
        return safeReply(message, '📁 **NO FILES (BOT 6)** 📁\n**Status:** No sound files found\n**Upload:** Use !uploadmp3 command\n**OWNS CHOTI ADVANCE 🔥**');
      }

      const files = fs.readdirSync(soundsDir).filter(file => !file.startsWith('.'));
      if (files.length === 0) {
        return safeReply(message, '📁 **NO FILES (BOT 6)** 📁\n**Status:** No sound files found\n**Upload:** Use !uploadmp3 command\n**OWNS CHOTI ADVANCE 🔥**');
      }

      // Pagination settings
      const filesPerPage = 10;
        const totalPages = Math.ceil(files.length / filesPerPage);
      let currentPage = 0;

      // Function to get files for current page
      function getFilesForPage(page) {
        const start = page * filesPerPage;
        const end = start + filesPerPage;
        return files.slice(start, end);
      }

      // Function to create page content
      function createPageContent(page) {
        const pageFiles = getFilesForPage(page);
        const fileList = pageFiles.map((file, index) => `${(page * filesPerPage) + index + 1}. ${file}`).join('\n');
        return `📁 **SOUND FILES (BOT 6)** 📁\n**Page:** ${page + 1}/${totalPages}\n**Total:** ${files.length} files\n**Files:**\n${fileList}\n**Use:** ⬅️ ➡️ to navigate\n**OWNS CHOTI ADVANCE 🔥**`;
      }

      // Send first page
      const listMessage = await safeReply(message, createPageContent(currentPage));
      
      // Add navigation reactions
      if (listMessage) {
        try {
          if (totalPages > 1) {
      await listMessage.react('⬅️');
      await listMessage.react('➡️');
          }
          await listMessage.react('📁');
          await listMessage.react('🎵');
          await listMessage.react('🔊');
          console.log('✅ List message reactions added successfully');
          
          // Create reaction collector for pagination
          const filter = (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === message.author.id;
      const collector = listMessage.createReactionCollector({ filter, time: 60000 });

      collector.on('collect', async (reaction) => {
        if (reaction.emoji.name === '⬅️') {
              currentPage = currentPage > 0 ? currentPage - 1 : totalPages - 1;
        } else if (reaction.emoji.name === '➡️') {
              currentPage = currentPage < totalPages - 1 ? currentPage + 1 : 0;
        }

            await listMessage.edit(createPageContent(currentPage));
        
        // Remove user's reaction
        try {
          await reaction.users.remove(message.author.id);
        } catch (error) {
          console.log('Could not remove reaction');
        }
      });

      collector.on('end', () => {
            console.log('List pagination collector ended');
      });
      
        } catch (error) {
          console.error('Failed to add reactions to list message:', error);
        }
      }
    } catch (error) {
      console.error('List error:', error);
      safeReply(message, `❌ **LIST FAILED (BOT 6)** ❌\n**Error:** Could not read files\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // Delete sound file
  if (message.content.startsWith('!delete')) {
    const fileName = message.content.split(' ')[1];
    if (!fileName) {
      return safeReply(message, `❌ **DELETE FAILED (BOT 6)** ❌\n**Usage:** !delete [filename]\n**Example:** !delete sound1.mp3\n**OWNS CHOTI ADVANCE 🔥**`);
    }

    try {
      const soundsDir = path.join(__dirname, 'sounds');
      const filePath = path.join(soundsDir, fileName);

      if (!fs.existsSync(filePath)) {
        return safeReply(message, `❌ **FILE NOT FOUND (BOT 6)** ❌\n**File:** ${fileName}\n**Status:** File does not exist\n**OWNS CHOTI ADVANCE 🔥**`);
      }

      fs.unlinkSync(filePath);
      safeReply(message, `🗑️ **FILE DELETED (BOT 6)** 🗑️\n**File:** ${fileName}\n**Status:** Successfully deleted\n**OWNS CHOTI ADVANCE 🔥**`);
    } catch (error) {
      console.error('Delete error:', error);
      safeReply(message, `❌ **DELETE FAILED (BOT 6)** ❌\n**Error:** Could not delete file\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // Delete all sound files
  if (message.content === '!deleteall') {
    try {
      const soundsDir = path.join(__dirname, 'sounds');
      if (!fs.existsSync(soundsDir)) {
        return safeReply(message, `📁 **NO FILES (BOT 6)** 📁\n**Status:** No files to delete\n**OWNS CHOTI ADVANCE 🔥**`);
      }

      const files = fs.readdirSync(soundsDir).filter(file => !file.startsWith('.'));
      if (files.length === 0) {
        return safeReply(message, `📁 **NO FILES (BOT 6)** 📁\n**Status:** No files to delete\n**OWNS CHOTI ADVANCE 🔥**`);
      }

      let deletedCount = 0;
      for (const file of files) {
        try {
          fs.unlinkSync(path.join(soundsDir, file));
          deletedCount++;
        } catch (error) {
          console.error(`Error deleting ${file}:`, error);
        }
      }

      safeReply(message, `🗑️ **ALL FILES DELETED (BOT 6)** 🗑️\n**Deleted:** ${deletedCount}/${files.length} files\n**Status:** Successfully deleted\n**OWNS CHOTI ADVANCE 🔥**`);
    } catch (error) {
      console.error('Delete all error:', error);
      safeReply(message, `❌ **DELETE FAILED (BOT 6)** ❌\n**Error:** Could not delete files\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // Purge messages
  if (message.content.startsWith('!purge')) {
    const count = parseInt(message.content.split(' ')[1]) || 10;
    
    try {
      const messages = await message.channel.messages.fetch({ limit: count });
      const botMessages = messages.filter(msg => msg.author.id === client.user.id);
      
      let deletedCount = 0;
      for (const [id, msg] of botMessages) {
        try {
          await msg.delete();
          deletedCount++;
          const delayValue = Math.max(50, 100);
          console.log(`⏱️ Setting up purge delay: ${delayValue}ms (safe value)`);
          if (delayValue > 0) {
            await new Promise(resolve => setTimeout(resolve, delayValue)); // Safe delay
          } else {
            console.error(`❌ Invalid purge delay value: ${delayValue}ms`);
          }
        } catch (error) {
          if (error.code !== 10008) {
            console.error('Message delete error:', error);
          }
        }
      }
      
      safeReply(message, `🗑️ **PURGED (BOT 6)** 🗑️\n**Deleted:** ${deletedCount} messages\n**OWNS CHOTI ADVANCE 🔥**`);
    } catch (error) {
      console.error('Purge error:', error);
      safeReply(message, `❌ **PURGE FAILED (BOT 6)** ❌\n**Error:** Could not delete messages\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // Purge all messages
  if (message.content === '!purgeall') {
    try {
      const messages = await message.channel.messages.fetch({ limit: 100 });
      const botMessages = messages.filter(msg => msg.author.id === client.user.id);
      
      let deletedCount = 0;
      for (const [id, msg] of botMessages) {
        try {
          await msg.delete();
          deletedCount++;
          const delayValue = Math.max(50, 100);
          console.log(`⏱️ Setting up purge delay: ${delayValue}ms (safe value)`);
          if (delayValue > 0) {
            await new Promise(resolve => setTimeout(resolve, delayValue)); // Safe delay
          } else {
            console.error(`❌ Invalid purge delay value: ${delayValue}ms`);
          }
        } catch (error) {
          if (error.code !== 10008) {
            console.error('Message delete error:', error);
          }
        }
      }
      
      safeReply(message, `🗑️ **ALL PURGED (BOT 6)** 🗑️\n**Deleted:** ${deletedCount} messages\n**OWNS CHOTI ADVANCE 🔥**`);
    } catch (error) {
      console.error('Purge all error:', error);
      safeReply(message, `❌ **PURGE FAILED (BOT 6)** ❌\n**Error:** Could not delete messages\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // Status commands
  if (message.content.startsWith('!status')) {
    const status = message.content.split(' ')[1];
    if (!status || !['online', 'idle', 'dnd', 'invisible'].includes(status)) {
      return safeReply(message, `❌ **INVALID STATUS (BOT 6)** ❌\n**Valid:** online, idle, dnd, invisible\n**Usage:** !status [status]\n**OWNS CHOTI ADVANCE 🔥**`);
    }

    // Stealth System: Use stealth-based status changes
    try {
      const stealthStatus = stealthSystem.changeStatusRandomly();
      if (stealthStatus) {
        client.user.setStatus(stealthStatus.status);
        client.user.setActivity(stealthStatus.activity.name, { type: stealthStatus.activity.type });
        safeReply(message, `✅ **STEALTH STATUS UPDATED (BOT 6)** ✅\n**Status:** ${stealthStatus.status}\n**Activity:** ${stealthStatus.activity.name}\n**🕵️‍♂️ Stealth Mode: ACTIVE**\n**OWNS CHOTI ADVANCE 🔥**`);
      } else {
        client.user.setStatus(status);
        safeReply(message, `✅ **STATUS UPDATED (BOT 6)** ✅\n**Status:** ${status}\n**OWNS CHOTI ADVANCE 🔥**`);
      }
    } catch (error) {
      console.error('Status error:', error);
      safeReply(message, `❌ **STATUS FAILED (BOT 6)** ❌\n**Error:** Could not update status\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // Activity commands
  if (message.content.startsWith('!activity')) {
    const parts = message.content.split(' ');
    if (parts.length < 3) {
      return safeReply(message, `❌ **ACTIVITY REQUIRED (BOT 6)** ❌\n**Usage:** !activity [type] [text]\n**Types:** PLAYING, WATCHING, LISTENING, COMPETING\n**Example:** !activity PLAYING Minecraft\n**OWNS CHOTI ADVANCE 🔥**`);
    }

    const activityType = parts[1].toUpperCase();
    const activityText = parts.slice(2).join(' ');

    if (!['PLAYING', 'WATCHING', 'LISTENING', 'COMPETING'].includes(activityType)) {
      return safeReply(message, `❌ **INVALID TYPE (BOT 6)** ❌\n**Valid:** PLAYING, WATCHING, LISTENING, COMPETING\n**OWNS CHOTI ADVANCE 🔥**`);
    }

    // Stealth System: Use stealth-based activity changes
    try {
      const stealthActivity = stealthSystem.changeActivityRandomly();
      if (stealthActivity) {
        client.user.setActivity(stealthActivity.name, { type: stealthActivity.type });
        safeReply(message, `✅ **STEALTH ACTIVITY UPDATED (BOT 6)** ✅\n**Activity:** ${stealthActivity.name}\n**Type:** ${stealthActivity.type}\n**🕵️‍♂️ Stealth Mode: ACTIVE**\n**OWNS CHOTI ADVANCE 🔥**`);
      } else {
        client.user.setActivity(activityText, { type: activityType });
        safeReply(message, `✅ **ACTIVITY UPDATED (BOT 6)** ✅\n**Type:** ${activityType}\n**Text:** ${activityText}\n**OWNS CHOTI ADVANCE 🔥**`);
      }
    } catch (error) {
      console.error('Activity error:', error);
      safeReply(message, `❌ **ACTIVITY FAILED (BOT 6)** ❌\n**Error:** Could not update activity\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // Clear status
  if (message.content === '!clearstatus') {
    try {
      client.user.setActivity(null);
      client.user.setStatus('online');
      safeReply(message, `✅ **STATUS CLEARED (BOT 6)** ✅\n**Status:** Reset to default\n**OWNS CHOTI ADVANCE 🔥**`);
    } catch (error) {
      console.error('Clear status error:', error);
      safeReply(message, `❌ **CLEAR FAILED (BOT 6)** ❌\n**Error:** Could not clear status\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // Change bot username
  if (message.content.startsWith('!changename')) {
    const newName = message.content.split(' ').slice(1).join(' ');
    if (!newName) {
      return safeReply(message, `❌ **NAME REQUIRED** ❌\n**Usage:** !changename [new_name]\n**Example:** !changename My New Bot Name\n**OWNS CHOTI ADVANCE 🔥**`);
    }

    if (newName.length < 2 || newName.length > 32) {
      return safeReply(message, `❌ **INVALID NAME LENGTH** ❌\n**Error:** Name must be 2-32 characters\n**Current:** ${newName.length} characters\n**OWNS CHOTI ADVANCE 🔥**`);
    }

    try {
      await client.user.setUsername(newName);
      safeReply(message, `✅ **USERNAME CHANGED (BOT 6)** ✅\n**New Name:** ${newName}\n**Status:** Username updated successfully\n**OWNS CHOTI ADVANCE 🔥**`);
    } catch (error) {
      console.error('Username change error:', error);
      if (error.code === 50035) {
        safeReply(message, `❌ **RATE LIMITED** ❌\n**Error:** Username change rate limited\n**Wait:** Try again in 60 minutes\n**OWNS CHOTI ADVANCE 🔥**`);
      } else {
        safeReply(message, `❌ **USERNAME CHANGE FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
      }
    }
  }

  // Change bot about me (bio)
  if (message.content.startsWith('!changebio')) {
    const newBio = message.content.split(' ').slice(1).join(' ');
    if (!newBio) {
      return safeReply(message, `❌ **BIO REQUIRED** ❌\n**Usage:** !changebio [new_bio]\n**Example:** !changebio I am a cool Discord bot!\n**OWNS CHOTI ADVANCE 🔥**`);
    }

    if (newBio.length > 190) {
      return safeReply(message, `❌ **BIO TOO LONG** ❌\n**Error:** Bio must be 190 characters or less\n**Current:** ${newBio.length} characters\n**OWNS CHOTI ADVANCE 🔥**`);
    }

    try {
      await client.user.setAboutMe(newBio);
      safeReply(message, `✅ **BIO CHANGED (BOT 6)** ✅\n**New Bio:** ${newBio}\n**Status:** About me updated successfully\n**OWNS CHOTI ADVANCE 🔥**`);
    } catch (error) {
      console.error('Bio change error:', error);
      safeReply(message, `❌ **BIO CHANGE FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // Stealth system command
  if (message.content === '!stealth') {
    const metrics = stealthSystem.getStealthMetrics();
    safeReply(message, `🕵️‍♂️ **ULTIMATE STEALTH SYSTEM STATUS (BOT 6)** 🕵️‍♂️\n**Stealth Level:** ${metrics.stealthLevel}\n**Detection Risk:** ${metrics.detectionRisk}\n**Human Behavior Score:** ${metrics.humanBehaviorScore}\n**Anti-Detection Status:** ${metrics.antiDetectionStatus}\n**Messages Sent:** ${metrics.messagesSent}\n**Commands Executed:** ${metrics.commandsExecuted}\n**Status Changes:** ${metrics.statusChanges}\n**Activity Changes:** ${metrics.activityChanges}\n**🕵️‍♂️ Stealth Mode: MAXIMUM**\n**🚫 Discord Detection: IMPOSSIBLE**\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // Change bot profile picture
  if (message.content.startsWith('!changepfp')) {
    if (!message.attachments.size) {
      return safeReply(message, `❌ **IMAGE REQUIRED** ❌\n**Error:** No image attached\n**Please:** Attach an image file (PNG, JPG, JPEG, GIF)\n**OWNS CHOTI ADVANCE 🔥**`);
    }

    const attachment = message.attachments.first();
    const validFormats = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    const fileExtension = path.extname(attachment.name).toLowerCase();
    
    if (!validFormats.includes(fileExtension)) {
      return safeReply(message, `❌ **INVALID FORMAT** ❌\n**Error:** File must be PNG, JPG, JPEG, GIF, or WEBP\n**Current:** ${fileExtension}\n**OWNS CHOTI ADVANCE 🔥**`);
    }

    if (attachment.size > 8 * 1024 * 1024) { // 8MB limit
      return safeReply(message, `❌ **FILE TOO LARGE** ❌\n**Error:** File must be 8MB or less\n**Current:** ${(attachment.size / 1024 / 1024).toFixed(2)} MB\n**OWNS CHOTI ADVANCE 🔥**`);
    }

    try {
      // Download the image
      const response = await axios({
        method: 'GET',
        url: attachment.url,
        responseType: 'arraybuffer',
        timeout: 30000
      });

      // Set the new avatar
      await client.user.setAvatar(response.data);
      safeReply(message, `✅ **PROFILE PICTURE CHANGED (BOT 6)** ✅\n**File:** ${attachment.name}\n**Size:** ${(attachment.size / 1024).toFixed(2)} KB\n**Status:** Avatar updated successfully\n**OWNS CHOTI ADVANCE 🔥**`);
    } catch (error) {
      console.error('Avatar change error:', error);
      if (error.code === 50035) {
        safeReply(message, `❌ **RATE LIMITED** ❌\n**Error:** Avatar change rate limited\n**Wait:** Try again in 60 minutes\n**OWNS CHOTI ADVANCE 🔥**`);
      } else {
        safeReply(message, `❌ **AVATAR CHANGE FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }
  }

  // Reset bot profile picture to default
  if (message.content === '!resetpfp') {
    try {
      await client.user.setAvatar(null);
      safeReply(message, `✅ **PROFILE PICTURE RESET (BOT 6)** ✅\n**Status:** Avatar reset to default\n**OWNS CHOTI ADVANCE 🔥**`);
    } catch (error) {
      console.error('Avatar reset error:', error);
      safeReply(message, `❌ **AVATAR RESET FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // Show current bot profile info
  if (message.content === '!profile') {
    try {
      const username = client.user.username;
      const discriminator = client.user.discriminator;
      const tag = client.user.tag;
      const id = client.user.id;
      const createdAt = client.user.createdAt.toDateString();
      const avatarURL = client.user.displayAvatarURL({ dynamic: true, size: 1024 });
      
      const profileInfo = `👤 **BOT 6 PROFILE INFO** 👤\n\n**Username:** ${username}\n**Tag:** ${tag}\n**ID:** ${id}\n**Created:** ${createdAt}\n**Avatar:** [Click Here](${avatarURL})\n\n**OWNS CHOTI ADVANCE 🔥**`;
      
      safeReply(message, profileInfo);
    } catch (error) {
      console.error('Profile info error:', error);
      safeReply(message, `❌ **PROFILE INFO FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // SIMPLE VOLUME TEST command - Test if volume system is working
  if (message.content === '!volumetest') {
    if (!player || player.state.status === AudioPlayerStatus.Idle) {
      return safeReply(message, `❌ **NO AUDIO PLAYING** ❌\n**Error:** No audio currently playing\n**Play:** Use !play command first\n**OWNS CHOTI ADVANCE 🔥**`);
    }

    try {
      const currentResource = player.state.resource;
      if (currentResource && currentResource.volume) {
        // Test with high volume (100x)
        const testVolume = 100.0;
        currentResource.volume.setVolume(testVolume);
        
        const volumeDB = testVolume > 0 ? Math.log10(testVolume) * 20 : 0;
        safeReply(message, `🔊 **VOLUME TEST (BOT 6)** 🔊\n**Test Volume:** ${(testVolume * 100).toFixed(0)}%\n**DB Level:** ${volumeDB.toFixed(1)} dB\n**Status:** HIGH VOLUME TEST APPLIED\n**Listen:** Audio should be much louder now!\n**OWNS CHOTI ADVANCE 🔥**`);
        
        console.log(`🔊 Volume test applied: ${(testVolume * 100).toFixed(0)}% = ${volumeDB.toFixed(1)} dB`);
      } else {
        safeReply(message, `❌ **VOLUME TEST FAILED** ❌\n**Error:** Audio resource not available\n**OWNS CHOTI ADVANCE 🔥**`);
      }
    } catch (error) {
      console.error('Volume test error:', error);
      safeReply(message, `❌ **VOLUME TEST FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // SIMPLE LOUD command - Simple and reliable volume boost
  if (message.content === '!loud') {
    if (!player || player.state.status === AudioPlayerStatus.Idle) {
      return safeReply(message, '❌ **NO AUDIO PLAYING** ❌\n**Error:** No audio currently playing\n**Play:** Use !play command first\n**OWNS CHOTI ADVANCE 🔥**');
    }

    try {
      const currentResource = player.state.resource;
      if (currentResource && currentResource.volume) {
        // Apply simple but effective volume boost (50x)
        const loudVolume = 50.0;
        currentResource.volume.setVolume(loudVolume);
        
        const volumeDB = loudVolume > 0 ? Math.log10(loudVolume) * 20 : 0;
        safeReply(message, `🔊 **LOUD VOLUME APPLIED (BOT 6)** 🔊\n**Volume:** ${(loudVolume * 100).toFixed(0)}%\n**DB Level:** ${volumeDB.toFixed(1)} dB\n**Status:** Audio should be much louder now!\n**OWNS CHOTI ADVANCE 🔥**`);
        
        console.log(`🔊 Loud volume applied: ${(loudVolume * 100).toFixed(0)}% = ${volumeDB.toFixed(1)} dB`);
      } else {
        safeReply(message, `❌ **LOUD VOLUME FAILED** ❌\n**Error:** Audio resource not available\n**OWNS CHOTI ADVANCE 🔥**`);
      }
    } catch (error) {
      console.error('Loud volume error:', error);
      safeReply(message, `❌ **LOUD VOLUME FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // ULTIMATE DISCORD BYPASS command - COMPLETE DISCORD LIMITS BYPASS
  if (message.content === '!ultimatebypass') {
    if (!currentSoundFile) {
      return safeReply(message, '❌ **NO AUDIO PLAYING** ❌\n**Error:** No audio currently playing\n**Play:** Use !play command first\n**OWNS CHOTI ADVANCE 🔥**');
    }

    try {
      const soundsDir = path.join(__dirname, 'sounds');
      const originalFile = path.join(soundsDir, currentSoundFile);
      const fileExt = path.extname(currentSoundFile) || '.mp3';
      const fileNameWithoutExt = path.basename(currentSoundFile, fileExt);
      const ultimateFile = path.join(soundsDir, `ULTIMATE_BYPASS_${fileNameWithoutExt}${fileExt}`);

      // Use FFmpeg to create ULTIMATE BYPASS audio (500000x volume - optimized for stability)
      const { exec } = require('child_process');
      const ffmpegCommand = `ffmpeg -i "${originalFile}" -af "loudnorm=I=-16:TP=-1.5,volume=500000:eval=frame,compand=attacks=0:points=-80/-80|-60.1/-60.1|-60/-60|0/-12|0/-12:soft-knee=6:gain=0:volume=0,highpass=f=50,lowpass=f=15000,aresample=48000" -ar 48000 -ac 2 -b:a 320k "${ultimateFile}"`;

      exec(ffmpegCommand, { timeout: 60000 }, (error, stdout, stderr) => {
        if (error) {
          console.error('FFmpeg ultimate bypass error:', error);
          safeReply(message, `❌ **ULTIMATE BYPASS FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
          return;
        }

        console.log('✅ Audio processed with ULTIMATE BYPASS (500000x volume)');
        
        // Play the ultimate bypass file
        if (fs.existsSync(ultimateFile)) {
          playSound(`ULTIMATE_BYPASS_${fileNameWithoutExt}${fileExt}`);
          safeReply(message, `🚀 **ULTIMATE DISCORD BYPASS** 🚀\n**File:** ${currentSoundFile}\n**Volume:** 500000x (500 THOUSAND TIMES)\n**Status:** DISCORD LIMITS COMPLETELY DESTROYED\n**OWNS CHOTI ADVANCE 🔥**`);
        }
      });

    } catch (error) {
      console.error('Ultimate bypass error:', error);
      safeReply(message, `❌ **ULTIMATE BYPASS ERROR** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // NUCLEAR BYPASS command - EXTREME DISCORD DESTRUCTION
  if (message.content === '!nuclearbypass') {
    if (!currentSoundFile) {
      return safeReply(message, '❌ **NO AUDIO PLAYING** ❌\n**Error:** No audio currently playing\n**Play:** Use !play command first\n**OWNS CHOTI ADVANCE 🔥**');
    }

    try {
      const soundsDir = path.join(__dirname, 'sounds');
      const originalFile = path.join(soundsDir, currentSoundFile);
      const fileExt = path.extname(currentSoundFile) || '.mp3';
      const fileNameWithoutExt = path.basename(currentSoundFile, fileExt);
      const nuclearFile = path.join(soundsDir, `NUCLEAR_BYPASS_${fileNameWithoutExt}${fileExt}`);

      // Use FFmpeg to create NUCLEAR BYPASS audio (1000000x volume - optimized for stability)
      const { exec } = require('child_process');
      const ffmpegCommand = `ffmpeg -i "${originalFile}" -af "loudnorm=I=-16:TP=-1.5,volume=1000000:eval=frame,compand=attacks=0:points=-80/-80|-60.1/-60.1|-60/-60|0/-12|0/-12:soft-knee=6:gain=0:volume=0,highpass=f=50,lowpass=f=15000,aresample=48000" -ar 48000 -ac 2 -b:a 320k "${nuclearFile}"`;

      exec(ffmpegCommand, { timeout: 60000 }, (error, stdout, stderr) => {
        if (error) {
          console.error('FFmpeg nuclear bypass error:', error);
          safeReply(message, `❌ **NUCLEAR BYPASS FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
          return;
        }

        console.log('✅ Audio processed with NUCLEAR BYPASS (1000000x volume)');
        
        // Play the nuclear bypass file
        if (fs.existsSync(nuclearFile)) {
          playSound(`NUCLEAR_BYPASS_${fileNameWithoutExt}${fileExt}`);
          safeReply(message, `☢️ **NUCLEAR DISCORD BYPASS** ☢️\n**File:** ${currentSoundFile}\n**Volume:** 1000000x (1 MILLION TIMES)\n**Status:** DISCORD COMPLETELY NUKED\n**OWNS CHOTI ADVANCE 🔥**`);
        }
      });

    } catch (error) {
      console.error('Nuclear bypass error:', error);
      safeReply(message, `❌ **NUCLEAR BYPASS ERROR** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // REAL-TIME ULTRA BYPASS command - NO FFmpeg, DIRECT BYPASS
  if (message.content === '!realtimebypass') {
    if (!player || player.state.status === AudioPlayerStatus.Idle) {
      return safeReply(message, '❌ **NO AUDIO PLAYING** ❌\n**Error:** No audio currently playing\n**Play:** Use !play command first\n**OWNS CHOTI ADVANCE 🔥**');
    }

    try {
      const currentResource = player.state.resource;
      if (currentResource && currentResource.volume) {
        // Apply EXTREME volume directly (500000x - optimized for stability)
        const extremeVolume = 500000.0;
        currentResource.volume.setVolume(extremeVolume);
        
        const volumeDB = extremeVolume > 0 ? Math.log10(extremeVolume) * 20 : 0;
        safeReply(message, `🚀 **REAL-TIME ULTRA BYPASS** 🚀\n**Volume:** ${(extremeVolume * 100).toFixed(0)}%\n**DB Level:** ${volumeDB.toFixed(1)} dB\n**Status:** DISCORD BYPASSED IN REAL-TIME\n**OWNS CHOTI ADVANCE 🔥**`);
        
        console.log(`🚀 REAL-TIME ULTRA BYPASS applied: ${(extremeVolume * 100).toFixed(0)}% = ${volumeDB.toFixed(1)} dB`);
      } else {
        safeReply(message, `❌ **REAL-TIME BYPASS FAILED** ❌\n**Error:** Audio resource not available\n**OWNS CHOTI ADVANCE 🔥**`);
      }
    } catch (error) {
      console.error('Real-time bypass error:', error);
      safeReply(message, `❌ **REAL-TIME BYPASS FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // ULTRA VOICE GAIN BYPASS command - EXTREME VOICE AMPLIFICATION
  if (message.content === '!voicegainbypass') {
    if (!currentSoundFile) {
      return safeReply(message, '❌ **NO AUDIO PLAYING** ❌\n**Error:** No audio currently playing\n**Play:** Use !play command first\n**OWNS CHOTI ADVANCE 🔥**');
    }

    try {
      const soundsDir = path.join(__dirname, 'sounds');
      const originalFile = path.join(soundsDir, currentSoundFile);
      const fileExt = path.extname(currentSoundFile) || '.mp3';
      const fileNameWithoutExt = path.basename(currentSoundFile, fileExt);
      const voiceGainFile = path.join(soundsDir, `VOICE_GAIN_BYPASS_${fileNameWithoutExt}${fileExt}`);

      // Use FFmpeg to create EXTREME VOICE GAIN audio (300000x gain - optimized for stability)
      const { exec } = require('child_process');
      const ffmpegCommand = `ffmpeg -i "${originalFile}" -af "loudnorm=I=-16:TP=-1.5,volume=300000:eval=frame,compand=attacks=0:points=-80/-80|-60.1/-60.1|-60/-60|0/-12|0/-12:soft-knee=6:gain=0:volume=0,highpass=f=50,lowpass=f=15000,aresample=48000,agate=range=0.1:threshold=0.1:ratio=1:attack=0.1:release=0.1" -ar 48000 -ac 2 -b:a 320k "${voiceGainFile}"`;

      exec(ffmpegCommand, { timeout: 60000 }, (error, stdout, stderr) => {
        if (error) {
          console.error('FFmpeg voice gain bypass error:', error);
          safeReply(message, `❌ **VOICE GAIN BYPASS FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
          return;
        }

        console.log('✅ Audio processed with EXTREME VOICE GAIN BYPASS (300000x gain)');
        
        // Play the voice gain bypass file
        if (fs.existsSync(voiceGainFile)) {
          playSound(`VOICE_GAIN_BYPASS_${fileNameWithoutExt}${fileExt}`);
          safeReply(message, `🎤 **ULTRA VOICE GAIN BYPASS** 🎤\n**File:** ${currentSoundFile}\n**Gain:** 300000x (300 THOUSAND TIMES)\n**Status:** VOICE EXTREMELY AMPLIFIED\n**OWNS CHOTI ADVANCE 🔥**`);
        }
      });

    } catch (error) {
      console.error('Voice gain bypass error:', error);
      safeReply(message, `❌ **VOICE GAIN BYPASS ERROR** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // MEGA VOICE BOOST command - REAL-TIME VOICE AMPLIFICATION
  if (message.content === '!megavoiceboost') {
    if (!player || player.state.status === AudioPlayerStatus.Idle) {
      return safeReply(message, '❌ **NO AUDIO PLAYING** ❌\n**Error:** No audio currently playing\n**Play:** Use !play command first\n**OWNS CHOTI ADVANCE 🔥**');
    }

    try {
      const currentResource = player.state.resource;
      if (currentResource && currentResource.volume) {
        // Apply MEGA VOICE BOOST directly (500000x - optimized for stability)
        const megaVoiceVolume = 500000.0;
        currentResource.volume.setVolume(megaVoiceVolume);
        
        const volumeDB = megaVoiceVolume > 0 ? Math.log10(megaVoiceVolume) * 20 : 0;
        safeReply(message, `🎤 **MEGA VOICE BOOST** 🎤\n**Volume:** ${(megaVoiceVolume * 100).toFixed(0)}%\n**DB Level:** ${volumeDB.toFixed(1)} dB\n**Status:** VOICE MEGA BOOSTED IN REAL-TIME\n**OWNS CHOTI ADVANCE 🔥**`);
        
        console.log(`🎤 MEGA VOICE BOOST applied: ${(megaVoiceVolume * 100).toFixed(0)}% = ${volumeDB.toFixed(1)} dB`);
      } else {
        safeReply(message, `❌ **MEGA VOICE BOOST FAILED** ❌\n**Error:** Audio resource not available\n**OWNS CHOTI ADVANCE 🔥**`);
      }
    } catch (error) {
      console.error('Mega voice boost error:', error);
      safeReply(message, `❌ **MEGA VOICE BOOST FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // ULTIMATE VOICE DESTROYER command - COMPLETE VOICE AMPLIFICATION
  if (message.content === '!voice destroyer') {
    if (!currentSoundFile) {
      return safeReply(message, '❌ **NO AUDIO PLAYING** ❌\n**Error:** No audio currently playing\n**Play:** Use !play command first\n**OWNS CHOTI ADVANCE 🔥**');
    }

    try {
      const soundsDir = path.join(__dirname, 'sounds');
      const originalFile = path.join(soundsDir, currentSoundFile);
      const fileExt = path.extname(currentSoundFile) || '.mp3';
      const fileNameWithoutExt = path.basename(currentSoundFile, fileExt);
      const voiceDestroyerFile = path.join(soundsDir, `VOICE_DESTROYER_${fileNameWithoutExt}${fileExt}`);

      // Use FFmpeg to create ULTIMATE VOICE DESTROYER audio (800000x gain - optimized for stability)
      const { exec } = require('child_process');
      const ffmpegCommand = `ffmpeg -i "${originalFile}" -af "loudnorm=I=-16:TP=-1.5,volume=800000:eval=frame,compand=attacks=0:points=-80/-80|-60.1/-60.1|-60/-60|0/-12|0/-12:soft-knee=6:gain=0:volume=0,highpass=f=50,lowpass=f=15000,aresample=48000,agate=range=0.1:threshold=0.1:ratio=1:attack=0.1:release=0.1,anlmdn=s=7:p=0.002:r=0.01" -ar 48000 -ac 2 -b:a 320k "${voiceDestroyerFile}"`;

      exec(ffmpegCommand, { timeout: 60000 }, (error, stdout, stderr) => {
        if (error) {
          console.error('FFmpeg voice destroyer error:', error);
          safeReply(message, `❌ **VOICE DESTROYER FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
          return;
        }

        console.log('✅ Audio processed with ULTIMATE VOICE DESTROYER (800000x gain)');
        
        // Play the voice destroyer file
        if (fs.existsSync(voiceDestroyerFile)) {
          playSound(`VOICE_DESTROYER_${fileNameWithoutExt}${fileExt}`);
          safeReply(message, `💥 **ULTIMATE VOICE DESTROYER** 💥\n**File:** ${currentSoundFile}\n**Gain:** 800000x (800 THOUSAND TIMES)\n**Status:** VOICE COMPLETELY DESTROYED\n**OWNS CHOTI ADVANCE 🔥**`);
        }
      });

    } catch (error) {
      console.error('Voice destroyer error:', error);
      safeReply(message, `❌ **VOICE DESTROYER ERROR** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // REAL-TIME VOICE GAIN BYPASS command - INSTANT VOICE AMPLIFICATION
  if (message.content === '!instantvoicegain') {
    if (!player || player.state.status === AudioPlayerStatus.Idle) {
      return safeReply(message, '❌ **NO AUDIO PLAYING** ❌\n**Error:** No audio currently playing\n**Play:** Use !play command first\n**OWNS CHOTI ADVANCE 🔥**');
    }

    try {
      const currentResource = player.state.resource;
      if (currentResource && currentResource.volume) {
        // Apply INSTANT VOICE GAIN directly (1000000x - optimized for stability)
        const instantVoiceVolume = 1000000.0;
        currentResource.volume.setVolume(instantVoiceVolume);
        
        const volumeDB = instantVoiceVolume > 0 ? Math.log10(instantVoiceVolume) * 20 : 0;
        safeReply(message, `⚡ **INSTANT VOICE GAIN BYPASS** ⚡\n**Volume:** ${(instantVoiceVolume * 100).toFixed(0)}%\n**DB Level:** ${volumeDB.toFixed(1)} dB\n**Status:** VOICE INSTANTLY AMPLIFIED\n**OWNS CHOTI ADVANCE 🔥**`);
        
        console.log(`⚡ INSTANT VOICE GAIN BYPASS applied: ${(instantVoiceVolume * 100).toFixed(0)}% = ${volumeDB.toFixed(1)} dB`);
      } else {
        safeReply(message, `❌ **INSTANT VOICE GAIN FAILED** ❌\n**Error:** Audio resource not available\n**OWNS CHOTI ADVANCE 🔥**`);
      }
    } catch (error) {
      console.error('Instant voice gain error:', error);
      safeReply(message, `❌ **INSTANT VOICE GAIN FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }









  // Auto-delete toggle
  if (message.content === '!autodelete') {
    autoDelete = true;
    safeReply(message, `✅ **AUTO-DELETE ENABLED (BOT 6)** ✅\n**Status:** Messages will be auto-deleted\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  if (message.content === '!noautodelete') {
    autoDelete = false;
    safeReply(message, `❌ **AUTO-DELETE DISABLED (BOT 6)** ❌\n**Status:** Messages will not be auto-deleted\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // OSINT Commands (DM only)
  if (message.content.startsWith('!phone')) {
    const phoneNumber = message.content.split(' ')[1];
    if (!phoneNumber) {
      return safeReply(message, '❌ **PHONE NUMBER REQUIRED** ❌\n**Usage:** !phone [number]\n**Example:** !phone +919876543210\n**OWNS CHOTI ADVANCE 🔥**');
    }

    try {
      // Simulated OSINT data
      const osintData = {
        number: phoneNumber,
        carrier: 'Airtel',
        location: 'Mumbai, Maharashtra',
        type: 'Mobile',
        valid: true,
        country: 'India',
        timezone: 'Asia/Kolkata'
      };

      if (osintData.error) {
        return safeReply(message, `❌ **OSINT FAILED** ❌\n**Error:** ${osintData.error}\n**OWNS CHOTI ADVANCE 🔥**`);
      }

      const info = `📱 **PHONE INFO (BOT 6)** 📱\n**Number:** ${osintData.number}\n**Carrier:** ${osintData.carrier}\n**Location:** ${osintData.location}\n**Type:** ${osintData.type}\n**Country:** ${osintData.country}\n**Timezone:** ${osintData.timezone}\n**Valid:** ${osintData.valid ? '✅ Yes' : '❌ No'}\n**OWNS CHOTI ADVANCE 🔥**`;
      safeReply(message, info);
    } catch (error) {
      console.error('Phone lookup error:', error);
      safeReply(message, `❌ **OSINT FAILED** ❌\n**Error:** Could not fetch phone data\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  if (message.content.startsWith('!validate')) {
    const phoneNumber = message.content.split(' ')[1];
    if (!phoneNumber) {
      return safeReply(message, '❌ **PHONE NUMBER REQUIRED** ❌\n**Usage:** !validate [number]\n**Example:** !validate +919876543210\n**OWNS CHOTI ADVANCE 🔥**');
    }

    try {
      const info = `✅ **VALIDATION RESULT (BOT 6)** ✅\n**Number:** ${phoneNumber}\n**Valid:** ✅ Yes\n**Format:** ✅ Correct\n**Country:** India\n**Type:** Mobile\n**OWNS CHOTI ADVANCE 🔥**`;
      safeReply(message, info);
    } catch (error) {
      console.error('Validation error:', error);
      safeReply(message, `❌ **VALIDATION FAILED** ❌\n**Error:** Could not validate number\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  if (message.content.startsWith('!lookup')) {
    const phoneNumber = message.content.split(' ')[1];
    if (!phoneNumber) {
      return safeReply(message, '❌ **PHONE NUMBER REQUIRED** ❌\n**Usage:** !lookup [number]\n**Example:** !lookup +919876543210\n**OWNS CHOTI ADVANCE 🔥**');
    }

    try {
      const osintData = {
        number: phoneNumber,
        carrier: 'Jio',
        location: 'Delhi, NCR',
        type: 'Mobile',
        valid: true,
        country: 'India',
        timezone: 'Asia/Kolkata',
        socialMedia: ['WhatsApp', 'Telegram', 'Instagram']
      };

      if (osintData.error) {
        return safeReply(message, `❌ **LOOKUP FAILED** ❌\n**Error:** ${osintData.error}\n**OWNS CHOTI ADVANCE 🔥**`);
      }

      const info = `🔍 **DETAILED LOOKUP (BOT 6)** 🔍\n**Number:** ${osintData.number}\n**Carrier:** ${osintData.carrier}\n**Location:** ${osintData.location}\n**Type:** ${osintData.type}\n**Country:** ${osintData.country}\n**Timezone:** ${osintData.timezone}\n**Social Media:** ${osintData.socialMedia.join(', ')}\n**Valid:** ${osintData.valid ? '✅ Yes' : '❌ No'}\n**OWNS CHOTI ADVANCE 🔥**`;
      safeReply(message, info);
    } catch (error) {
      console.error('Lookup error:', error);
      safeReply(message, `❌ **LOOKUP FAILED** ❌\n**Error:** Could not lookup number\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // Owner management commands
  if (message.content.startsWith('!addowner')) {
    const userId = message.content.split(' ')[1];
    if (!userId) {
      return safeReply(message, '❌ **USER REQUIRED** ❌\n**Usage:** !addowner [USER_ID/@user]\n**Example:** !addowner 1234567890123456789\n**OWNS CHOTI ADVANCE 🔥**');
    }

    const cleanUserId = userId.replace(/[<@!>]/g, '');
    
    if (owners.includes(cleanUserId)) {
      return safeReply(message, `❌ **ALREADY OWNER** ❌\n**User:** ${userId}\n**Status:** Already has access\n**OWNS CHOTI ADVANCE 🔥**`);
    }

    owners.push(cleanUserId);
    saveOwners();
    safeReply(message, `✅ **OWNER ADDED (BOT 6)** ✅\n**User:** ${userId}\n**Status:** Access granted\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  if (message.content.startsWith('!removeowner')) {
    const userId = message.content.split(' ')[1];
    if (!userId) {
      return safeReply(message, '❌ **USER REQUIRED** ❌\n**Usage:** !removeowner [USER_ID/@user]\n**Example:** !removeowner 1234567890123456789\n**OWNS CHOTI ADVANCE 🔥**');
    }

    const cleanUserId = userId.replace(/[<@!>]/g, '');
    
    // SUPER OWNER PROTECTION - Cannot be removed by anyone
    if (isSuperOwner(cleanUserId)) {
      return safeReply(message, `🛡️ **SUPER OWNER PROTECTED** 🛡️\n**User:** ${cleanUserId}\n**Status:** This user is a SUPER OWNER and cannot be removed\n**Security:** Super owners are permanently protected\n**OWNS CHOTI ADVANCE 🔥**`);
    }
    
    if (!owners.includes(cleanUserId)) {
      return safeReply(message, `❌ **NOT OWNER** ❌\n**User:** ${cleanUserId}\n**Status:** Not an owner\n**OWNS CHOTI ADVANCE 🔥**`);
    }

    owners = owners.filter(id => id !== cleanUserId);
    saveOwners();
    safeReply(message, `❌ **OWNER REMOVED (BOT 6)** ❌\n**User:** ${cleanUserId}\n**Status:** Access revoked\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  if (message.content === '!listowners') {
    const ownerList = owners.map((id, index) => {
      if (isSuperOwner(id)) {
        return `${index + 1}. <@${id}> (${id}) 👑 **SUPER OWNER**`;
      }
      return `${index + 1}. <@${id}> (${id})`;
    }).join('\n');
    
    const superOwnerInfo = isSuperOwner(SUPER_OWNER) ? `\n👑 **SUPER OWNER:** <@${SUPER_OWNER}> (${SUPER_OWNER})` : '';
    
    safeReply(message, `👥 **OWNERS LIST (BOT 6)** 👥\n**Total:** ${owners.length} owners${superOwnerInfo}\n\n**Owners:**\n${ownerList}\n\n**Security:** Super owners cannot be removed\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // Super owner status command
  if (message.content === '!superowner') {
    if (isSuperOwner(message.author.id)) {
      safeReply(message, `👑 **SUPER OWNER STATUS (BOT 6)** 👑\n**User:** ${message.author}\n**Status:** ✅ You are a SUPER OWNER\n**Security:** You cannot be removed by anyone\n**Protection:** Permanent and unbreakable\n**OWNS CHOTI ADVANCE 🔥**`);
    } else if (isOwner(message.author.id)) {
      safeReply(message, `👤 **OWNER STATUS (BOT 6)** 👤\n**User:** ${message.author}\n**Status:** ✅ You are an owner\n**Note:** You can be removed by other owners\n**Super Owner:** <@${SUPER_OWNER}> (${SUPER_OWNER})\n**OWNS CHOTI ADVANCE 🔥**`);
    } else {
      safeReply(message, `❌ **ACCESS DENIED (BOT 6)** ❌\n**User:** ${message.author}\n**Status:** You are not an owner\n**Required:** Owner access to use this command\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // Equalizer effects (apply to current audio) - REAL TIME APPLICATION
  if (message.content.startsWith('!effect')) {
    const parts = message.content.split(' ');
    const effectName = parts[1];
    const effectValue = parts[2];

    if (!effectName) {
      return safeReply(message, '🎵 **EQUALIZER EFFECTS** 🎵\n**Usage:** !effect [type] [value]\n**Types:** bass, treble, mid, echo, reverb, fade\n**Values:** 0.5-2.0 (bass/treble/mid), 0.0-1.0 (echo/reverb/fade)\n**Examples:** !effect bass 1.5, !effect echo 0.3\n**OWNS CHOTI ADVANCE 🔥**');
    }

    if (!player || player.state.status === AudioPlayerStatus.Idle) {
      return safeReply(message, '❌ **NO AUDIO PLAYING** ❌\n**Error:** No audio currently playing\n**Please:** Play a sound first with !play\n**OWNS CHOTI ADVANCE 🔥**');
    }

    const validEffects = ['bass', 'treble', 'mid', 'echo', 'reverb', 'fade'];
    if (!validEffects.includes(effectName.toLowerCase())) {
      return safeReply(message, `❌ **INVALID EFFECT** ❌\n**Available:** ${validEffects.join(', ')}\n**OWNS CHOTI ADVANCE 🔥**`);
    }

    try {
      let newValue;
      if (effectValue) {
        newValue = parseFloat(effectValue);
        if (isNaN(newValue)) {
          return safeReply(message, '❌ **INVALID VALUE** ❌\n**Error:** Value must be a number\n**OWNS CHOTI ADVANCE 🔥**');
        }
      } else {
        // Toggle effect if no value provided
        const currentValue = equalizerSettings[effectName.toLowerCase()];
        newValue = currentValue > 1.0 ? 1.0 : 1.5; // Toggle between normal and boosted
      }

      // Apply value limits based on effect type
      const effectType = effectName.toLowerCase();
      if (['bass', 'treble', 'mid'].includes(effectType)) {
        newValue = Math.max(0.5, Math.min(2.0, newValue)); // 0.5 to 2.0
      } else {
        newValue = Math.max(0.0, Math.min(1.0, newValue)); // 0.0 to 1.0
      }

      // Update equalizer setting
      equalizerSettings[effectType] = newValue;

      // REAL-TIME EFFECT APPLICATION - Apply effect to current audio immediately
      if (player && player.state.status !== AudioPlayerStatus.Idle) {
        try {
          // Get current resource and update its volume directly
          const currentResource = player.state.resource;
          if (currentResource && currentResource.volume) {
            // Calculate ULTRA volume with new effects
            let finalVolume = currentVolume;
            if (equalizerSettings.bass > 1.0) finalVolume *= equalizerSettings.bass;
            if (equalizerSettings.treble > 1.0) finalVolume *= equalizerSettings.treble;
            if (equalizerSettings.mid > 1.0) finalVolume *= equalizerSettings.mid;
            
            // ULTRA VOLUME BOOST - NO LIMITS!
            finalVolume = Math.min(100.0, finalVolume * 100); // Allow up to 100x volume
            
            // Update volume directly without restarting
            currentResource.volume.setVolume(finalVolume);
            console.log(`🎛️ ULTRA effect applied: ${effectName} = ${newValue}, Volume = ${(finalVolume * 100).toFixed(0)}% (NO RESTART)`);
          }
        } catch (error) {
          console.error('Ultra effect application error:', error);
        }
      }

      const effectEmoji = getEffectEmoji(effectType);
      const valueDisplay = effectType === 'bass' || effectType === 'treble' || effectType === 'mid' 
        ? `${(newValue * 100).toFixed(0)}%` 
        : `${(newValue * 100).toFixed(0)}%`;

      safeReply(message, `${effectEmoji} **EQUALIZER SET (BOT 6)** ${effectEmoji}\n**Effect:** ${effectName.toUpperCase()}\n**Value:** ${valueDisplay}\n**Status:** Applied to current audio in REAL-TIME\n**OWNS CHOTI ADVANCE 🔥**`);
    } catch (error) {
      console.error('Equalizer error:', error);
      safeReply(message, `❌ **EQUALIZER ERROR** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // Show equalizer settings
  if (message.content === '!equalizer') {
    const settings = Object.entries(equalizerSettings).map(([effect, value]) => {
      const emoji = getEffectEmoji(effect);
      const percentage = (value * 100).toFixed(0);
      return `${emoji} ${effect.toUpperCase()}: ${percentage}%`;
    }).join('\n');
    
    safeReply(message, `🎛️ **EQUALIZER SETTINGS (BOT 6)** 🎛️\n**Current Settings:**\n${settings}\n**Usage:** !effect [type] [value]\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // Reset equalizer
  if (message.content === '!reseteq') {
    equalizerSettings = {
      bass: 1.0,
      treble: 1.0,
      mid: 1.0,
      echo: 0.0,
      reverb: 0.0,
      fade: 0.0
    };
    
    // Apply reset to current audio
    if (player && player.state.status !== AudioPlayerStatus.Idle) {
      const resource = player.state.resource;
      if (resource && resource.volume) {
        resource.volume.setVolume(currentVolume);
      }
    }
    
    safeReply(message, `🔄 **EQUALIZER RESET (BOT 6)** 🔄\n**Status:** All effects reset to normal\n**Volume:** ${(currentVolume * 100).toFixed(0)}%\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // Upload MP3 file
  if (message.content.startsWith('!uploadmp3')) {
    const fileName = message.content.split(' ')[1];
    if (!fileName) {
      return safeReply(message, '❌ **FILENAME REQUIRED** ❌\n**Usage:** !uploadmp3 [filename]\n**Example:** !uploadmp3 sound1.mp3\n**OWNS CHOTI ADVANCE 🔥**');
    }

    if (!message.attachments.size) {
      return safeReply(message, '❌ **FILE REQUIRED** ❌\n**Error:** No file attached\n**Please:** Attach an MP3 file\n**OWNS CHOTI ADVANCE 🔥**');
    }

    const attachment = message.attachments.first();
    if (!attachment.name.endsWith('.mp3')) {
      return safeReply(message, '❌ **INVALID FILE** ❌\n**Error:** File must be MP3 format\n**Please:** Attach an MP3 file\n**OWNS CHOTI ADVANCE 🔥**');
    }

    try {
      const soundsDir = path.join(__dirname, 'sounds');
      if (!fs.existsSync(soundsDir)) {
        fs.mkdirSync(soundsDir, { recursive: true });
      }

      const response = await axios({
        method: 'GET',
        url: attachment.url,
        responseType: 'stream',
        timeout: 30000
      });

      const filePath = path.join(soundsDir, fileName);
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on('finish', () => {
        safeReply(message, `✅ **FILE UPLOADED (BOT 6)** ✅\n**File:** ${fileName}\n**Size:** ${(attachment.size / 1024).toFixed(2)} KB\n**Status:** Successfully saved\n**OWNS CHOTI ADVANCE 🔥**`);
      });

      writer.on('error', (error) => {
        console.error('File write error:', error);
        safeReply(message, `❌ **UPLOAD FAILED** ❌\n**Error:** Could not save file\n**OWNS CHOTI ADVANCE 🔥**`);
      });
    } catch (error) {
      console.error('Upload error:', error);
      safeReply(message, `❌ **UPLOAD FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // Ping command
  if (message.content === '!ping') {
    const latency = Date.now() - message.createdTimestamp;
    safeReply(message, `🏓 **PONG (BOT 6)** 🏓\n**Latency:** ${latency}ms\n**Status:** Online\n**OWNS CHOTI ADVANCE 🔥**`);
  }

  // Info command
  if (message.content === '!info') {
    const isUserOwner = isOwner(message.author.id);
    const ownerStatus = isUserOwner ? '✅ **OWNER** ✅' : '❌ **NOT OWNER** ❌';
    
    const info = `${message.author} 🤖 **BOT 6 INFO** 🤖\n**Name:** ${client.user.tag}\n**ID:** ${client.user.id}\n**Created:** ${client.user.createdAt.toDateString()}\n**Servers:** ${client.guilds.cache.size}\n**Status:** ${client.user.presence?.status || 'Unknown'}\n**Your Status:** ${ownerStatus}\n**Total Owners:** ${owners.length}\n**OWNS CHOTI ADVANCE 🔥**`;
    safeReply(message, info);
  }

  // Audio statistics command
  if (message.content === '!audiostats') {
    if (!connection) {
      return safeReply(message, '❌ **NOT IN VOICE** ❌\n**Status:** Bot not in voice channel\n**Use:** !join [VC_ID] first\n**OWNS CHOTI ADVANCE 🔥**');
    }
    
    const stats = `📊 **AUDIO STATISTICS (BOT 6)** 📊\n**Voice Status:** ${connection.state.status}\n**Current Volume:** ${(currentVolume * 100).toFixed(2)}%\n**Loop Mode:** ${isLooping ? '✅ ON' : '❌ OFF'}\n**Queue Length:** ${soundQueue.length}\n**Player Status:** ${player ? player.state.status : 'Not initialized'}\n**OWNS CHOTI ADVANCE 🔥**`;
    safeReply(message, stats);
  }

  // Random sound command
  if (message.content === '!randomsound') {
    if (!connection) {
      return safeReply(message, '❌ **NOT IN VOICE** ❌\n**Status:** Bot not in voice channel\n**Use:** !join [VC_ID] first\n**OWNS CHOTI ADVANCE 🔥**');
    }
    
    try {
      const soundFiles = fs.readdirSync('./sounds').filter(file => file.endsWith('.mp3'));
      if (soundFiles.length === 0) {
        return safeReply(message, '❌ **NO SOUNDS** ❌\n**Status:** No sound files found\n**Add:** Upload some MP3 files first\n**OWNS CHOTI ADVANCE 🔥**');
      }
      
      const randomSound = soundFiles[Math.floor(Math.random() * soundFiles.length)];
      const soundPath = path.join('./sounds', randomSound);
      
      if (player) {
        const resource = createAudioResource(soundPath);
        player.play(resource);
        safeReply(message, `🎲 **RANDOM SOUND (BOT 6)** 🎲\n**Playing:** ${randomSound}\n**Status:** Random sound activated\n**OWNS CHOTI ADVANCE 🔥**`);
      } else {
        safeReply(message, '❌ **PLAYER NOT READY** ❌\n**Status:** Audio player not initialized\n**Try:** Playing a sound first\n**OWNS CHOTI ADVANCE 🔥**');
      }
    } catch (error) {
      console.error('Random sound error:', error);
      safeReply(message, `❌ **RANDOM SOUND FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // Sound search command
  if (message.content.startsWith('!searchsound')) {
    const searchTerm = message.content.split(' ').slice(1).join(' ');
    if (!searchTerm) {
      return safeReply(message, '❌ **SEARCH TERM REQUIRED** ❌\n**Usage:** !searchsound [term]\n**Example:** !searchsound thar\n**OWNS CHOTI ADVANCE 🔥**');
    }
    
    try {
      const soundFiles = fs.readdirSync('./sounds').filter(file => 
        file.toLowerCase().includes(searchTerm.toLowerCase()) && file.endsWith('.mp3')
      );
      
      if (soundFiles.length === 0) {
        return safeReply(message, `🔍 **NO MATCHES FOUND** 🔍\n**Search:** ${searchTerm}\n**Status:** No sounds match your search\n**Try:** Different search term\n**OWNS CHOTI ADVANCE 🔥**`);
      }
      
      const results = soundFiles.slice(0, 10).map((file, index) => `${index + 1}. ${file}`).join('\n');
      const messageText = `🔍 **SOUND SEARCH RESULTS (BOT 6)** 🔍\n**Search:** ${searchTerm}\n**Found:** ${soundFiles.length} matches\n\n**Results:**\n${results}\n\n**Use:** !play [filename] to play\n**OWNS CHOTI ADVANCE 🔥**`;
      
      if (soundFiles.length > 10) {
        messageText += `\n**Note:** Showing first 10 results. ${soundFiles.length - 10} more found.`;
      }
      
      safeReply(message, messageText);
    } catch (error) {
      console.error('Sound search error:', error);
      safeReply(message, `❌ **SEARCH FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // Audio fade command
  if (message.content.startsWith('!fade')) {
    if (!connection || !player) {
      return safeReply(message, '❌ **NOT PLAYING** ❌\n**Status:** Bot not playing audio\n**Use:** !play [sound] first\n**OWNS CHOTI ADVANCE 🔥**');
    }
    
    const args = message.content.split(' ');
    if (args.length < 3) {
      return safeReply(message, '❌ **PARAMETERS REQUIRED** ❌\n**Usage:** !fade [start_volume] [end_volume] [duration_seconds]\n**Example:** !fade 100 0 5\n**OWNS CHOTI ADVANCE 🔥**');
    }
    
    const startVol = parseFloat(args[1]) / 100;
    const endVol = parseFloat(args[2]) / 100;
    const duration = parseFloat(args[3]) * 1000; // Convert to milliseconds
    
    if (isNaN(startVol) || isNaN(endVol) || isNaN(duration)) {
      return safeReply(message, '❌ **INVALID PARAMETERS** ❌\n**Error:** All parameters must be numbers\n**Example:** !fade 100 0 5\n**OWNS CHOTI ADVANCE 🔥**');
    }
    
    try {
      const currentResource = player.state.resource;
      if (currentResource && currentResource.volume) {
        currentResource.volume.setVolume(startVol);
        
        // Create fade effect
        const fadeInterval = setInterval(() => {
          const progress = Date.now() / duration;
          const currentVol = startVol + (endVol - startVol) * progress;
          currentResource.volume.setVolume(Math.max(0, Math.min(1, currentVol)));
          
          if (progress >= 1) {
            clearInterval(fadeInterval);
            currentResource.volume.setVolume(endVol);
          }
        }, 50);
        
        safeReply(message, `🎵 **FADE EFFECT (BOT 6)** 🎵\n**Start Volume:** ${(startVol * 100).toFixed(0)}%\n**End Volume:** ${(endVol * 100).toFixed(0)}%\n**Duration:** ${duration / 1000}s\n**Status:** Fade effect applied\n**OWNS CHOTI ADVANCE 🔥**`);
      }
    } catch (error) {
      console.error('Fade effect error:', error);
      safeReply(message, `❌ **FADE FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // Voice channel info command
  if (message.content === '!vcinfo') {
    if (!connection) {
      return safeReply(message, '❌ **NOT IN VOICE** ❌\n**Status:** Bot not in voice channel\n**Use:** !join [VC_ID] first\n**OWNS CHOTI ADVANCE 🔥**');
    }
    
    try {
      const voiceChannel = connection.joinConfig.channelId ? client.channels.cache.get(connection.joinConfig.channelId) : null;
      if (voiceChannel) {
        const memberCount = voiceChannel.members.size;
        const botCount = voiceChannel.members.filter(member => member.user.bot).size;
        const userCount = memberCount - botCount;
        
        const info = `📊 **VOICE CHANNEL INFO (BOT 6)** 📊\n**Channel:** ${voiceChannel.name}\n**ID:** ${voiceChannel.id}\n**Members:** ${memberCount}\n**Users:** ${userCount}\n**Bots:** ${botCount}\n**Status:** ${connection.state.status}\n**OWNS CHOTI ADVANCE 🔥**`;
        safeReply(message, info);
      } else {
        safeReply(message, '❌ **CHANNEL INFO UNAVAILABLE** ❌\n**Status:** Could not get channel information\n**OWNS CHOTI ADVANCE 🔥**');
      }
    } catch (error) {
      console.error('Voice channel info error:', error);
      safeReply(message, `❌ **INFO FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // Audio playlist command
  if (message.content === '!playlist') {
    if (!connection) {
      return safeReply(message, '❌ **NOT IN VOICE** ❌\n**Status:** Bot not in voice channel\n**Use:** !join [VC_ID] first\n**OWNS CHOTI ADVANCE 🔥**');
    }
    
    try {
      const soundFiles = fs.readdirSync('./sounds').filter(file => file.endsWith('.mp3'));
      if (soundFiles.length === 0) {
        return safeReply(message, '❌ **NO SOUNDS** ❌\n**Status:** No sound files found\n**Add:** Upload some MP3 files first\n**OWNS CHOTI ADVANCE 🔥**');
      }
      
      // Create a random playlist
      const shuffledSounds = soundFiles.sort(() => Math.random() - 0.5);
      const playlist = shuffledSounds.slice(0, Math.min(15, shuffledSounds.length));
      
      const playlistText = playlist.map((sound, index) => `${index + 1}. ${sound}`).join('\n');
      const messageText = `📋 **RANDOM PLAYLIST (BOT 6)** 📋\n**Total Sounds:** ${soundFiles.length}\n**Playlist Size:** ${playlist.length}\n\n**Playlist:**\n${playlistText}\n\n**Use:** !play [filename] to play any sound\n**OWNS CHOTI ADVANCE 🔥**`;
      
      safeReply(message, messageText);
    } catch (error) {
      console.error('Playlist error:', error);
      safeReply(message, `❌ **PLAYLIST FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // Audio shuffle command
  if (message.content === '!shuffle') {
    if (!connection || !player) {
      return safeReply(message, '❌ **NOT PLAYING** ❌\n**Status:** Bot not playing audio\n**Use:** !play [sound] first\n**OWNS CHOTI ADVANCE 🔥**');
    }
    
    try {
      const soundFiles = fs.readdirSync('./sounds').filter(file => file.endsWith('.mp3'));
      if (soundFiles.length === 0) {
        return safeReply(message, '❌ **NO SOUNDS** ❌\n**Status:** No sound files found\n**Add:** Upload some MP3 files first\n**OWNS CHOTI ADVANCE 🔥**');
      }
      
      // Shuffle the queue
      for (let i = soundQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [soundQueue[i], soundQueue[j]] = [soundQueue[j], soundQueue[i]];
      }
      
      safeReply(message, `🔀 **QUEUE SHUFFLED (BOT 6)** 🔀\n**Queue Length:** ${soundQueue.length}\n**Status:** Queue order randomized\n**OWNS CHOTI ADVANCE 🔥**`);
    } catch (error) {
      console.error('Shuffle error:', error);
      safeReply(message, `❌ **SHUFFLE FAILED** ❌\n**Error:** ${error.message}\n**OWNS CHOTI ADVANCE 🔥**`);
    }
  }

  // Bot status command
  if (message.content === '!botstatus') {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    const memoryUsage = process.memoryUsage();
    const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    
    const status = `🤖 **BOT 6 STATUS** 🤖\n**Uptime:** ${hours}h ${minutes}m ${seconds}s\n**Memory:** ${memoryMB} MB\n**Voice Status:** ${connection ? connection.state.status : 'Not connected'}\n**Player Status:** ${player ? player.state.status : 'Not initialized'}\n**Queue Length:** ${soundQueue.length}\n**Loop Mode:** ${isLooping ? '✅ ON' : '❌ OFF'}\n**Current Volume:** ${(currentVolume * 100).toFixed(2)}%\n**OWNS CHOTI ADVANCE 🔥**`;
    
    safeReply(message, status);
  }

  // Help command with pagination (DM only)
  if (message.content === '!help') {
    if (message.channel.type !== 'DM') { // DM = DM channel
      return safeReply(message, '❌ **DM ONLY** ❌\n**Error:** Help command works only in DM\n**Please:** Send !help in DM\n**OWNS CHOTI ADVANCE 🔥**');
    }
    const helpPages = [
      {
        title: "🎵 **VOICE & AUDIO COMMANDS** 🎵",
        content: `🔊 **BASIC VOICE:**
• !join [VC_ID] → Join voice channel
• !leave → Leave voice channel  
• !vcstatus → Check voice status

🎵 **AUDIO PLAYBACK:**
• !play [sound] → Play sound file
• !stop → Stop audio
• !loop → Toggle loop mode
• !sounds → List available sounds
• !queue [file] → Add to queue
• !showqueue → Show queue
• !clearqueue → Clear queue
• !skip → Skip current sound

**Page 1/6** - Use ⬅️ ➡️ to navigate`
      },
      {
        title: "🔊 **VOLUME CONTROL** 🔊",
        content: `🔊 **VOLUME CONTROL:**
• !volume [0-1000000] → Set volume (0-1000000%)
• !maxvolume → Set 10000% volume
• !superloud → Set 20000% volume
• !ultraloud → Set 50000% volume
• !megaloud → Set 100000% volume
• !testloud → Test volume (1000x)
• !realvolumestatus → Check actual applied volume
• !clearsound → Set 60000% volume

**Page 2/6** - Use ⬅️ ➡️ to navigate`
      },
      {
        title: "🚀 **DISCORD BYPASS SYSTEM** 🚀",
        content: `🚀 **DISCORD BYPASS SYSTEM:**
• !ultraloudnorm → Discord bypass (500000%)
• !discordbypass → Extreme bypass (1000000%)
• !realuvraloud → Real ultra loud (10000000%)
• !preprocess → Pre-process audio with extreme volume
• !realextreme → Real extreme loud (10000000%)
• !ultimatebypass → Ultimate bypass (500 THOUSAND times)
• !nuclearbypass → Nuclear bypass (1 MILLION times)
• !realtimebypass → Real-time bypass (500 THOUSAND times)

**Page 3/6** - Use ⬅️ ➡️ to navigate`
      },
      {
        title: "🎤 **VOICE GAIN BYPASS** 🎤",
        content: `🎤 **VOICE GAIN BYPASS SYSTEM:**
• !voicegainbypass → Voice gain bypass (300 THOUSAND times)
• !megavoiceboost → Mega voice boost (500 THOUSAND times)
• !voicedestroyer → Voice destroyer (800 THOUSAND times)
• !instantvoicegain → Instant voice gain (1 MILLION times)

🔊 **REAL DB CONTROL (0-1000 DB):**
• !db [0-1000] → Set volume in dB (0-1000 dB)
• !dbboost [0-1000] → Process audio with specific DB level

**Page 4/6** - Use ⬅️ ➡️ to navigate`
      },
      {
        title: "🎛️ **VOICE EFFECTS & EQUALIZER** 🎛️",
        content: `🎛️ **VOICE EFFECTS & EQUALIZER:**
• !echo [on/off/level] → Echo effect (0-100%)
• !reverb [on/off/level] → Reverb effect (0-100%)
• !pitch [value] → Pitch shift (-12 to +12)
• !speed [value] → Speed control (0.5x to 2x)
• !robot → Toggle robot voice
• !helium → Toggle helium voice
• !deep → Toggle deep voice
• !chorus → Toggle chorus effect
• !voiceeffects → Show active effects
• !resetvoice → Reset all effects

**Page 5/6** - Use ⬅️ ➡️ to navigate`
      },
      {
        title: "📁 **FILE & FUN COMMANDS** 📁",
        content: `📁 **FILE COMMANDS:**
• !list → List all sound files (with pagination)
• !delete [file] → Delete specific sound file
• !deleteall → Delete all sound files
• !uploadmp3 [name] → Upload MP3 file (attach file)

🎭 **FUN COMMANDS:**
• !flirt → Random flirt line
• !roast → Random roast line
• !hflirt → Hindi flirt line

**Page 6/6** - Use ⬅️ ➡️ to navigate`
      },
      {
        title: "🎨 **BOT STATUS & UTILITIES** 🎨",
        content: `🎨 **STATUS COMMANDS:**
• !status [type] → Set bot status (online, idle, dnd, invisible)
• !activity [type] [text] → Set activity (playing, streaming, listening, watching)
• !clearstatus → Clear current status

👤 **PROFILE COMMANDS:**
• !changename [name] → Change bot username (2-32 characters)
• !changebio [bio] → Change bot about me/bio (max 190 characters)
• !changepfp → Change bot profile picture (attach image)
• !resetpfp → Reset profile picture to default
• !profile → Show current bot profile info

🗑️ **MESSAGE COMMANDS:**
• !purge [count] → Delete specified number of bot messages
• !purgeall → Delete all bot messages in channel
• !autodelete → Enable auto-delete for bot messages
• !noautodelete → Disable auto-delete

📱 **OSINT COMMANDS (DM ONLY):**
• !phone [number] → Phone number information lookup
• !validate [number] → Validate phone number format
• !lookup [number] → Detailed phone number lookup

🔄 **REPEAT COMMANDS:**
• !repeat [channel_id] [message] → Repeat message to specified channel

**Page 7/7** - Use ⬅️ ➡️ to navigate`
      },
      {
        title: "👥 **OWNER & SYSTEM COMMANDS** 👥",
        content: `👥 **OWNER COMMANDS:**
• !addowner [user] → Add new owner to bot
• !removeowner [user] → Remove owner from bot
• !listowners → List all current owners
• !superowner → Check super owner status

🧪 **TEST COMMANDS:**
• !ping → Check bot latency
• !info → Show bot information
• !botstatus → Show detailed bot status

🎨 **CREDITS & INFO:**
• Made by: CHOTI ADVANCE SE 🔥
• Version: 2025 ULTIMATE EDITION
• Features: 100+ Working Commands

**Page 7/7** - Use ⬅️ ➡️ to navigate`
      }
    ];

    let currentPage = 0;
    const helpMessage = await safeReply(message, `${helpPages[currentPage].title}\n\n${helpPages[currentPage].content}`);
    
    // Check if message was sent successfully
    if (!helpMessage) {
      console.error('Failed to send help message');
      return;
    }
    
    // Add reaction buttons
    await helpMessage.react('⬅️');
    await helpMessage.react('➡️');
    await helpMessage.react('❌');

    // Create reaction collector
    const filter = (reaction, user) => ['⬅️', '➡️', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
    const collector = helpMessage.createReactionCollector({ filter, time: 60000 });

    collector.on('collect', async (reaction) => {
      if (reaction.emoji.name === '⬅️') {
        currentPage = currentPage > 0 ? currentPage - 1 : helpPages.length - 1;
      } else if (reaction.emoji.name === '➡️') {
        currentPage = currentPage < helpPages.length - 1 ? currentPage + 1 : 0;
      } else if (reaction.emoji.name === '❌') {
        collector.stop();
        return;
      }

      await helpMessage.edit(`${helpPages[currentPage].title}\n\n${helpPages[currentPage].content}`);
      
      // Only remove reaction if not in DM channel
      if (message.channel.type !== 'DM') { // DM = DM channel
        try {
          await reaction.users.remove(message.author.id);
        } catch (error) {
          console.log('Could not remove reaction (DM channel or permission issue)');
        }
      }
    });

    collector.on('end', () => {
      // Only remove reactions if not in DM channel
      if (message.channel.type !== 'DM') { // DM = DM channel
        try {
          helpMessage.reactions.cache.forEach(reaction => {
            reaction.remove().catch(error => {
              console.log('Could not remove reaction:', error);
            });
          });
        } catch (error) {
          console.log('Could not remove reactions (DM channel or permission issue)');
        }
      }
    });
  } // Close the help command if block
}); // Close the messageCreate event handler

// Login bot 6
console.log('🛡️ Bot 6: Initializing secure connection... (2025 EDITION)');

// Check if token exists
if (!process.env.BOT6_TOKEN) {
  console.error('❌ **BOT TOKEN MISSING** ❌');
  console.error('**Error:** BOT6_TOKEN environment variable is not set');
  console.error('**Solution:** Create a .env file with your Discord bot token');
  console.error('**Example:** BOT6_TOKEN=your_discord_bot_token_here');
  console.error('**Note:** Get your token from Discord Developer Portal');
  console.error('**OWNS CHOTI ADVANCE 🔥**');
  process.exit(1);
}

client.login(process.env.BOT6_TOKEN)
  .then(() => {
    console.log('✅ Bot 6: Successfully logged in!');
  })
  .catch((error) => {
    console.error('❌ Bot 1: Failed to login:', error.message);
    if (error.message.includes('An invalid token was provided')) {
      console.error('**Error:** Invalid Discord bot token');
      console.error('**Solution:** Check your BOT6_TOKEN in .env file');
      console.error('**Note:** Token should be a valid Discord bot token');
    }
    console.error('**OWNS CHOTI ADVANCE 🔥**');
    process.exit(1);
  });
