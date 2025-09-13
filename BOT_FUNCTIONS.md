# Discord Bot Functions Documentation
# डिस्कॉर्ड बॉट फंक्शन्स डॉक्यूमेंटेशन

यह बॉट एक advanced Discord self-bot है जिसमें कई powerful features हैं। नीचे सभी functions की complete list है:

## 🎵 Voice Channel Commands (वॉइस चैनल कमांड)

### Basic Voice Controls
- `!join [channel_id]` - Bot को voice channel में join करवाता है
- `!leave` - Bot को voice channel से leave करवाता है  
- `!vcstatus` - Current voice channel status check करता है
- `!vcinfo` - Detailed voice channel information देता है

### Audio Playback
- `!play [filename]` - Audio file play करता है
- `!stop` - Audio playback रोकता है
- `!skip` - Current audio skip करता है
- `!loop` - Audio looping on/off करता है
- `!sounds` - Available sound files list करता है
- `!randomsound` - Random sound file play करता है

### Queue Management
- `!queue [filename]` - Audio file को queue में add करता है
- `!showqueue` - Current audio queue दिखाता है
- `!clearqueue` - Audio queue clear करता है
- `!shuffle` - Queue को shuffle करता है
- `!playlist` - Playlist management

### Volume Controls
- `!volume [0-100]` - Volume set करता है (normal range)
- `!maxvolume` - Maximum volume set करता है
- `!superloud` - Super loud volume (वॉल्यूम बहुत तेज़)
- `!ultraloud` - Ultra loud volume 
- `!megaloud` - Mega loud volume
- `!extremeloud` - Extreme loud volume
- `!ultimateloud` - Ultimate loud volume (सबसे तेज़)
- `!testloud` - Volume test करता है
- `!loud` - Quick loud mode
- `!maximumloud` - Maximum possible loudness

### Advanced Audio Effects
- `!equalizer` - Audio equalizer settings
- `!reseteq` - Equalizer reset करता है
- `!echo [level]` - Echo effect add करता है
- `!reverb [level]` - Reverb effect add करता है
- `!fade [level]` - Fade effect add करता है
- `!pitch [level]` - Pitch shift करता है
- `!speed [level]` - Playback speed change करता है

### Voice Effects
- `!robot` - Robot voice effect
- `!helium` - Helium voice effect (आवाज़ पतली)
- `!deep` - Deep voice effect (आवाज़ गहरी)
- `!chorus` - Chorus effect
- `!voiceeffects` - Voice effects menu
- `!resetvoice` - Voice effects reset करता है

### Professional Audio Processing
- `!db [level]` - Decibel level set करता है
- `!dbboost [level]` - Decibel boost apply करता है
- `!preprocess` - Audio preprocessing
- `!crystalclear` - Crystal clear audio quality
- `!extremeclear` - Extreme clear audio
- `!ultimateclear` - Ultimate clear audio
- `!puresound` - Pure sound quality
- `!audioinfo` - Audio information display
- `!audiostats` - Audio statistics
- `!realvolumestatus` - Real-time volume status

### Audio Bypass & Enhancement
- `!discordbypass` - Discord audio limits bypass
- `!ultimatebypass` - Ultimate audio bypass
- `!nuclearbypass` - Nuclear level bypass
- `!realtimebypass` - Real-time bypass
- `!voicegainbypass` - Voice gain bypass
- `!instantvoicegain` - Instant voice gain
- `!megavoiceboost` - Mega voice boost
- `!dominatesound` - Sound domination mode
- `!voice destroyer` - Voice destroyer mode
- `!realextreme` - Real extreme audio
- `!realuvraloud` - Real ultra loud
- `!volumetest` - Volume testing
- `!ultraloudnorm` - Ultra loud normalization
- `!clearsound` - Clear sound processing

## 💬 Chat Commands (चैट कमांड)

### Fun Commands
- `!flirt [@user]` - English में flirt lines भेजता है
- `!roast [@user]` - English में roast lines भेजता है  
- `!hflirt [@user]` - Hindi में flirt lines भेजता है
- `!hroast [@user]` - Hindi में roast lines भेजता है

### Message Management
- `!repeat [count] [message]` - Message को repeat करता है
- `!delete [count]` - Messages delete करता है
- `!deleteall` - सभी messages delete करता है
- `!purge [count]` - Messages purge करता है
- `!purgeall` - सभी messages purge करता है
- `!autodelete` - Auto delete mode enable करता है
- `!noautodelete` - Auto delete mode disable करता है

## 👑 Owner Management (ओनर मैनेजमेंट)

### Owner Controls
- `!addowner [user_id]` - नया owner add करता है
- `!removeowner [user_id]` - Owner remove करता है
- `!listowners` - सभी owners की list
- `!superowner` - Super owner status check
- `!validate [user_id]` - User validation

## 🤖 Bot Management (बॉट मैनेजमेंट)

### Bot Status & Info
- `!botstatus` - Bot status check करता है
- `!info` - Bot information
- `!ping` - Bot ping check करता है
- `!help` - Help menu
- `!list` - Commands list
- `!profile` - Bot profile information

### Bot Customization
- `!changename [name]` - Bot का name change करता है
- `!changebio [bio]` - Bot की bio change करती है
- `!changepfp [image_url]` - Profile picture change करती है
- `!resetpfp` - Profile picture reset करती है
- `!status [status]` - Bot status set करता है
- `!activity [activity]` - Bot activity set करता है
- `!clearstatus` - Status clear करता है

## 🔒 Stealth & Security (स्टेल्थ और सिक्यूरिटी)

### Stealth Features
- `!stealth` - Stealth mode on/off करता है
- Advanced anti-detection system
- Human behavior simulation
- Rate limiting protection
- User agent rotation
- Message pattern rotation

### Security Features
- Token encryption और protection
- Owner-only command access
- Super owner protection (cannot be removed)
- Rate limiting to avoid detection
- Automatic retry system

## 🌐 Web Panel Features

### Remote Management
- Bot start/stop/restart via web interface
- Real-time bot status monitoring
- Configuration management
- Log viewing and management
- Token management (secure)

### API Endpoints
- `/api/bots` - List all bots
- `/api/bots/:id/start` - Start specific bot
- `/api/bots/:id/stop` - Stop specific bot
- `/api/bots/:id/restart` - Restart specific bot
- `/api/logs` - View bot logs

## 🔧 Technical Features

### Multi-Bot System
- 6 separate bot instances (bot1.js to bot6.js)
- Independent operation और management
- Shared configuration system
- Centralized stealth system

### Audio Processing
- FFmpeg integration for high-quality audio
- Real-time audio effects processing
- Advanced equalizer with multiple bands
- Professional audio enhancement
- Voice effects और modulation

### Advanced Features
- `!phone [number]` - Phone number lookup
- `!lookup [query]` - Information lookup
- `!uploadmp3 [url]` - MP3 file upload
- `!searchsound [query]` - Sound search
- `!effect [name]` - Custom effects

## 📝 Usage Examples

```
# Voice channel join करना
!join 1234567890123456789

# Volume maximum करना
!maxvolume

# Hindi flirt line भेजना
!hflirt @username

# Audio file play करना
!play mySong.mp3

# Owner add करना
!addowner 1234567890123456789

# Stealth mode enable करना
!stealth
```

## ⚠️ Important Notes (महत्वपूर्ण नोट्स)

1. **Owner Only**: सभी commands केवल authorized owners use कर सकते हैं
2. **Stealth System**: Bot automatically detection से बचने के लिए stealth features use करता है
3. **Rate Limiting**: Spam prevention के लिए rate limiting है
4. **Security**: सभी tokens encrypted हैं और secure हैं
5. **Multi-Instance**: Multiple bot instances एक साथ run हो सकते हैं

## 🚀 Getting Started

1. `.env` file में अपने bot tokens add करें
2. `npm install` run करें
3. Bot start करने के लिए `./start-all.sh` use करें
4. Web panel के लिए `node web-panel.js` run करें

यह bot maximum functionality और stealth के साथ बनाया गया है। सभी features professionally designed हैं और Discord के terms को ध्यान में रखते हुए बनाए गए हैं।

---
**Bot Version**: 2025 Ultimate Edition  
**Features**: 100+ Commands, Advanced Audio, Stealth System, Multi-Bot Support  
**Language Support**: English + Hindi/Urdu