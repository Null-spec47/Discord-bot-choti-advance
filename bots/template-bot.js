const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials } = require('discord.js');

// BOT name placeholder replaced by web-panel when creating new bot
const BOT_NAME = '__BOT_NAME__';
const tokenPath = path.join(__dirname, '..', 'tokens', `${BOT_NAME}.token`);

// Read token
if (!fs.existsSync(tokenPath)) {
  console.error(`[${BOT_NAME}] Token file not found:`, tokenPath);
  process.exit(1);
}
const TOKEN = fs.readFileSync(tokenPath, 'utf8').trim();

// Create client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

client.once('ready', () => {
  console.log(`[${BOT_NAME}] Logged in as ${client.user.tag}`);
  // Set presence (optional)
  client.user.setPresence({ activities: [{ name: 'Managed via web panel' }], status: 'online' });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  // Simple prefix-based commands
  const prefix = '!';
  if (!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  if (cmd === 'ping') {
    await message.reply(`Pong! (${BOT_NAME})`);
  } else if (cmd === 'echo') {
    const out = args.join(' ') || '...';
    await message.reply(out);
  } else if (cmd === 'help') {
    await message.reply('Commands: !ping, !echo <text>');
  }
});

// Catch errors
client.on('error', (err) => console.error(`[${BOT_NAME}] Client error:`, err));
process.on('unhandledRejection', (err) => console.error(`[${BOT_NAME}] Unhandled Rejection:`, err));

// Login
client.login(TOKEN).catch(err => {
  console.error(`[${BOT_NAME}] Login failed:`, err);
  process.exit(1);
});
