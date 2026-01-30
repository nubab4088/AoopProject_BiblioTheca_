import { useState } from 'react';
import { useUser } from './context/UserContext';
import { books as booksData } from './data/books';
import './ChatBot.css';

/**
 * ChatBot - Wizard of Oz Mode (Mock AI) with Ghost Librarian Theme
 * 
 * This component simulates an AI assistant without requiring a backend API.
 * Perfect for demos, presentations, or offline testing.
 * 
 * Features:
 * - Scripted intelligent responses based on keywords
 * - REAL-TIME data from UserContext (unlocked books, KP)
 * - Realistic typing delay (1200ms) to simulate processing
 * - Spooky ghost librarian aesthetic
 * - No external dependencies
 */

function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ghost', text: '👻 Welcome, mortal... I am the Ghost Librarian. The archives whisper secrets to me. Ask, and I shall reveal what you seek...' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // 🔥 GET REAL-TIME USER DATA
  const { user } = useUser();

  /**
   * 🎭 MOCK AI INTELLIGENCE ENGINE
   * Generates scripted responses with spooky ghost librarian personality
   * NOW WITH REAL-TIME DATA FROM USER CONTEXT
   * 
   * @param {string} input - User's message
   * @returns {string} Ghost Librarian response
   */
  const generateMockResponse = (input) => {
    const lowerInput = input.toLowerCase().trim();

    // 📊 CALCULATE REAL-TIME STATISTICS
    const totalBooks = booksData.length;
    const corruptedBooks = booksData.filter(book => book.isCorrupted);
    const totalCorrupted = corruptedBooks.length;
    const unlockedBooks = user?.unlockedBooks || [];
    
    // Count how many corrupted books are restored
    const restoredCount = corruptedBooks.filter(book => 
      unlockedBooks.includes(book.id) || unlockedBooks.includes(String(book.id))
    ).length;
    
    const stillCorrupted = totalCorrupted - restoredCount;
    const userKP = user?.kp || 0;

    // 👋 GREETINGS
    if (lowerInput.match(/\b(hi|hello|hey|greetings|sup|yo)\b/)) {
      return "👻 Greetings, mortal... I sense your presence in the ethereal realm. The spirits have much to tell you. What knowledge do you seek?";
    }

    // 📊 BOOK COUNT / STATISTICS - REAL-TIME DATA
    if (lowerInput.match(/\b(how many|count|total|number of)\b/) || 
        lowerInput.includes('books')) {
      return `🕯️ *The candles flicker as I consult the spectral archives...*\n\n📚 The spirits whisper:\n• Total Volumes: ${totalBooks} ancient tomes\n• ✅ RESTORED: ${restoredCount} (freed from corruption)\n• 🔴 CORRUPTED: ${stillCorrupted} (still trapped in darkness)\n\n*${stillCorrupted === 0 ? 'All books have been liberated! The library is at peace... 🌟' : 'The books cry out for salvation, mortal...*'}`;
    }

    // 🖥️ SYSTEM STATUS - REAL-TIME DATA
    if (lowerInput.match(/\b(status|system|health|integrity|check)\b/)) {
      const corruptionPercentage = totalCorrupted > 0 
        ? Math.round((stillCorrupted / totalCorrupted) * 100)
        : 0;
      
      const statusMessage = corruptionPercentage === 0
        ? '✅ SYSTEM INTEGRITY: STABLE\n\n🔮 The spirits rejoice:\n• All corruption has been purged\n• Neural pathways: 100% restored\n• The library is whole once more\n\n*Peace has returned to the digital realm...*'
        : `💀 *The ethereal winds grow cold...*\n\n⚠️ SYSTEM INTEGRITY: UNSTABLE\n\n🔮 The spirits report:\n• Corruption spreads through ${corruptionPercentage}% of archives\n• ${stillCorrupted} dark force${stillCorrupted !== 1 ? 's' : ''} detected\n• Immediate exorcism protocols required\n\n*Only you can banish the digital demons, mortal...*`;
      
      return statusMessage;
    }

    // 💰 KNOWLEDGE POINTS - REAL-TIME DATA
    if (lowerInput.match(/\b(kp|knowledge|points|xp|experience|earn)\b/)) {
      const clearanceLevel = Math.floor(userKP / 100) + 1;
      return `💰 *Ancient runes glow with power...*\n\nYOUR SPIRITUAL ESSENCE:\n\n✨ Current KP: ${userKP}\n🎖️ Clearance Level: ${clearanceLevel}\n\nKNOWLEDGE POINTS (KP):\n\n✨ Harvest KP by:\n• Completing exorcism rituals\n• Mining spectral data\n\n📈 Powers granted:\n• Ascend to higher clearance levels\n• Unlock forbidden protocols\n• Track your restoration quest\n\n*The spirits reward those who serve the library...*`;
    }

    // 📖 BOOK HELP / PURIFICATION
    if (lowerInput.match(/\b(book|purify|corrupt|unlock|restore|access)\b/)) {
      return "📖 *An ancient scroll materializes before you...*\n\nBOOK EXORCISM RITUAL:\n\n1️⃣ Identify the CURSED tome (marked with virus sigil)\n2️⃣ Click 'PURIFY' to begin the ritual\n3️⃣ Choose the REQUIRED exorcism protocol\n4️⃣ Complete the spiritual challenge\n5️⃣ The book shall be LIBERATED!\n\n💡 *Whisper: Each cursed book requires a specific ritual...*";
    }

    // 🎮 GAMES / PROTOCOLS
    if (lowerInput.match(/\b(game|protocol|play|challenge|dungeon)\b/)) {
      return "🎮 *The spirits summon ancient challenges...*\n\nEXORCISM PROTOCOLS:\n\n• 🧠 Memory Matrix (Easy) - +30 KP\n• 📡 Signal Lock (Medium) - +45 KP\n• ⚡ Circuit Overload (Hard) - +60 KP\n• 🔑 Cipher Breaker (Hard) - +75 KP\n\n⚠️ *Beware: Failure feeds the darkness and drains your essence...*";
    }

    // ❓ HELP / COMMANDS
    if (lowerInput.match(/\b(help|command|what can|assist|guide)\b/)) {
      return "🕯️ *The Ghost Librarian's grimoire opens...*\n\nSUMMON MY WISDOM:\n\n💀 Try invoking:\n• 'System Status' - Diagnostic séance\n• 'Book Count' - Archive census\n• 'Protocols' - Ritual catalog\n• 'How to purify' - Exorcism guide\n• 'Knowledge Points' - Spiritual currency\n\n*I dwell between pages, waiting to guide you...*";
    }

    // 😊 THANKS
    if (lowerInput.match(/\b(thank|thanks|thx|appreciate)\b/)) {
      return "👻 *A spectral smile appears in the mist...*\n\nYou honor me, mortal. May the spirits guide your path through the corrupted archives. 🕯️";
    }

    // 👋 GOODBYE
    if (lowerInput.match(/\b(bye|goodbye|exit|quit|see you)\b/)) {
      return "💀 *The ghost fades into the shadows...*\n\nFarewell, brave soul. I shall wait here, among the dusty tomes, until you return. The library never forgets... 🌙";
    }

    // 🤔 DEFAULT RESPONSE (Unrecognized input)
    return "👻 *The ghost tilts its ethereal head in confusion...*\n\n⚡ Your words echo strangely through the void, mortal...\n\nPerhaps ask about:\n• 'System Status'\n• 'Book Count'\n• 'Protocols'\n• 'Help'\n\n*Speak clearly, and the spirits shall answer...*";
  };

  /**
   * 📤 SEND MESSAGE HANDLER
   * Simulates AI processing with realistic delay
   */
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message to chat
    const userMessage = { sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    // 🎭 SIMULATE AI PROCESSING DELAY (1200ms)
    // This creates the illusion of a real AI "thinking"
    setTimeout(() => {
      const ghostResponse = generateMockResponse(currentInput);
      const ghostMessage = { sender: 'ghost', text: ghostResponse };
      
      setMessages(prev => [...prev, ghostMessage]);
      setIsTyping(false);
    }, 1200); // Realistic latency for perceived intelligence
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isTyping) {
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button 
        className="chatbot-float-btn" 
        onClick={() => setIsOpen(!isOpen)}
        title="Summon the Ghost Librarian"
      >
        <i className="fas fa-ghost"></i>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <i className="fas fa-ghost" style={{marginRight: '10px'}}></i>
              <span>Ghost Librarian</span>
              <span style={{
                fontSize: '0.7rem', 
                marginLeft: '8px', 
                opacity: 0.6,
                background: 'rgba(138, 43, 226, 0.2)',
                padding: '2px 6px',
                borderRadius: '4px',
                color: '#a78bfa'
              }}>
                ETHEREAL
              </span>
            </div>
            <button 
              className="chatbot-close-btn" 
              onClick={handleClose}
            >
              &times;
            </button>
          </div>

          {/* Messages Area */}
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`chatbot-message ${msg.sender === 'user' ? 'user-message' : 'ghost-message'}`}
              >
                <div className="message-bubble" style={{
                  whiteSpace: 'pre-line', // Preserve line breaks in responses
                  textAlign: 'left'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="chatbot-message ghost-message">
                <div className="message-bubble typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="chatbot-input-area">
            <input 
              type="text" 
              placeholder="Whisper to the Ghost Librarian..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="chatbot-input"
              disabled={isTyping}
            />
            <button 
              className="chatbot-send-btn" 
              onClick={handleSendMessage}
              disabled={isTyping || !inputValue.trim()}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>

        </div>
      )}
    </>
  );
}

export default ChatBot;
