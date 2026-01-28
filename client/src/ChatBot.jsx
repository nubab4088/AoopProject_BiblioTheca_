import { useState } from 'react';
import './ChatBot.css';

function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ghost', text: '👻 Welcome, mortal... I am the Ghost Librarian. Ask me anything about the library... if you dare.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]); // Track conversation

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = { sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Add to conversation history
    const newHistory = [...conversationHistory, { role: 'user', content: currentInput }];
    setConversationHistory(newHistory);

    try {
      // Build context from conversation history
      const contextMessages = newHistory.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Ghost Librarian'}: ${msg.content}`
      ).join('\n');

      // Call backend AI endpoint with conversation context
      const response = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: currentInput,
          conversationHistory: contextMessages // Send full conversation
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const ghostMessage = { sender: 'ghost', text: data.response };
        setMessages(prev => [...prev, ghostMessage]);
        
        // Add AI response to history
        setConversationHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        const errorMessage = { sender: 'ghost', text: '👻 The ethereal connection failed... Try again, mortal.' };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat API Error:', error);
      // Fallback to simulated response if backend is down
      const fallbackResponses = [
        "👻 The spirits are silent... my connection to the realm is weak.",
        "🕯️ I sense disturbances in the digital ether... try again soon.",
        "💀 The backend realm is unreachable... I am weakened."
      ];
      const fallbackMessage = { 
        sender: 'ghost', 
        text: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Clear conversation when closing
  const handleClose = () => {
    setIsOpen(false);
    // Optionally reset conversation when closing
    // setConversationHistory([]);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button 
        className="chatbot-float-btn" 
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with Ghost Librarian"
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
              <span style={{fontSize: '0.7rem', marginLeft: '8px', opacity: 0.6}}>
                (AI-Powered)
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
                <div className="message-bubble">
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
              placeholder="Ask the Ghost Librarian..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="chatbot-input"
              disabled={isTyping}
            />
            <button 
              className="chatbot-send-btn" 
              onClick={handleSendMessage}
              disabled={isTyping}
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
