# Discord Bot Quick Reference
# डिस्कॉर्ड बॉट क्विक रेफरेंस

## 🎯 सबसे Important Commands

### Voice Channel (आवाज़ वाले कमांड)
```
!join [channel_id]     → Voice channel में join होना
!leave                 → Voice channel छोड़ना
!play [filename]       → गाना/आवाज़ चलाना
!maxvolume            → आवाज़ तेज़ करना
!stop                 → आवाज़ बंद करना
```

### Fun Commands (मज़ेदार कमांड)
```
!hflirt @user         → Hindi में flirt करना
!hroast @user         → Hindi में roast करना
!flirt @user          → English में flirt करना  
!roast @user          → English में roast करना
```

### Owner Commands (मालिक के कमांड)
```
!addowner [user_id]   → नया owner बनाना
!removeowner [user_id] → Owner हटाना
!listowners           → सभी owners देखना
```

### Message Commands (मैसेज कमांड)
```
!repeat [count] [msg] → मैसेज repeat करना
!delete [count]       → मैसेज delete करना
!purge [count]        → मैसेज साफ़ करना
```

## 🔊 Volume Commands (आवाज़ के कमांड)

**Normal से Extreme तक:**
```
!volume [1-100]       → Normal volume
!maxvolume           → Max volume
!superloud           → बहुत तेज़
!ultraloud           → और भी तेज़
!megaloud            → बहुत ही तेज़
!extremeloud         → Extreme तेज़
!ultimateloud        → सबसे तेज़ (कानों का ख्याल रखें!)
```

## 🎛️ Audio Effects (आवाज़ के इफेक्ट्स)

```
!robot               → Robot जैसी आवाज़
!helium              → पतली आवाज़ (हीलियम गैस जैसी)
!deep                → गहरी आवाज़
!echo [level]        → Echo इफेक्ट
!reverb [level]      → Reverb इफेक्ट
!chorus              → Chorus इफेक्ट
```

## 🎵 Music/Audio Management

```
!sounds              → सभी audio files देखना
!queue [filename]    → Song को queue में डालना
!showqueue           → Queue देखना
!clearqueue          → Queue साफ़ करना
!skip                → अगला song
!loop                → Repeat mode on/off
!randomsound         → Random song चलाना
```

## 🤖 Bot Settings

```
!botstatus           → Bot की जानकारी
!ping                → Bot की speed check
!help                → Help menu
!stealth             → Stealth mode (छुपने का mode)
!changename [name]   → Bot का नाम change करना
!status [text]       → Bot की status change करना
```

## ⚡ Quick Tips (जल्दी टिप्स)

### Basic Setup:
1. **Voice join करना**: `!join` + voice channel ID
2. **Music चलाना**: `!play filename.mp3`
3. **Volume बढ़ाना**: `!maxvolume` या `!superloud`

### Owner बनना:
1. Super owner से पूछें कि आपको add करें
2. Command: `!addowner [आपकी user ID]`

### Safe Usage:
- ज्यादा commands एक साथ न भेजें (spam न करें)
- Volume commands सावधानी से use करें
- Bot stealth mode में है, detection से बचने के लिए

## 🚨 Emergency Commands

```
!stop                → सब कुछ रोकना
!leave               → Voice channel छोड़ना
!clearqueue          → Queue साफ़ करना
!resetvoice          → Voice effects हटाना
!volume 50           → Normal volume पर वापस जाना
```

## 💡 Pro Tips

1. **File Names**: Audio files के लिए `.mp3` extension use करें
2. **User IDs**: Commands में @ mention के बजाय user ID use करें  
3. **Channel IDs**: Voice channel join करने के लिए channel ID चाहिए
4. **Volume Warning**: Ultra loud commands से पहले headphones निकाल लें!
5. **Owner Access**: सभी commands केवल owners use कर सकते हैं

## 📞 Example Usage (उदाहरण)

```bash
# Voice channel में जाना
!join 1234567890123456789

# Hindi flirt line भेजना
!hflirt @username

# Music चलाना
!play party_song.mp3

# Volume maximum करना
!maxvolume

# नया owner add करना
!addowner 9876543210987654321

# Messages delete करना  
!delete 10

# Bot status change करना
!status "गाने सुन रहा हूँ 🎵"
```

---
**Quick Help**: `!help` command use करें detailed help के लिए  
**Emergency**: कुछ गलत हो तो `!stop` और `!leave` use करें