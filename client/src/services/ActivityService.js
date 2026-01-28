/**
 * 🎮 ACTIVITY SERVICE - Global Game Event Feed
 * ============================================
 * Generates and manages real-time activity logs for the Live Typewriter Terminal
 * 
 * Features:
 * - Mock global player activities (book unlocks, KP gains, dungeon completions)
 * - Realistic timing patterns
 * - Agent ID generation
 * - Event type categorization
 * 
 * @author Senior Frontend Developer
 * @version 2.0
 */

class ActivityService {
  constructor() {
    this.logs = [];
    this.maxLogs = 20; // Keep last 20 events
    this.isActive = false;
    this.intervalId = null;
    
    // Event templates with color coding
    this.eventTemplates = [
      { 
        type: 'UNLOCK', 
        template: (agent, book) => `> AGENT_${agent} SECURED '${book.toUpperCase()}'`,
        color: '#00ff88'
      },
      { 
        type: 'KP_GAIN', 
        template: (agent, amount) => `> AGENT_${agent} MINED +${amount} KP FROM DATA BROKER`,
        color: '#ffd700'
      },
      { 
        type: 'DUNGEON', 
        template: (agent) => `> AGENT_${agent} NEUTRALIZED CORRUPTED NODE`,
        color: '#ff4444'
      },
      { 
        type: 'LOGIN', 
        template: (agent) => `> AGENT_${agent} CONNECTED TO BIBLIOTHECA NETWORK`,
        color: '#0096ff'
      },
      { 
        type: 'CLEARANCE', 
        template: (agent, level) => `> AGENT_${agent} PROMOTED TO CLEARANCE LEVEL-${level}`,
        color: '#924eff'
      },
      {
        type: 'SYSTEM',
        template: () => `> SYSTEM INTEGRITY CHECK... [${Math.random() > 0.5 ? 'STABLE' : 'UNSTABLE'}]`,
        color: '#ff4444'
      }
    ];

    // Mock book titles for realistic activity
    this.bookTitles = [
      'CLEAN CODE',
      'DESIGN PATTERNS',
      'THE NECRONOMICON',
      'CODEX FRAGMENTUM',
      'QUANTUM PARADOXES',
      'INTRO TO ALGORITHMS',
      'PRAGMATIC PROGRAMMER',
      'MYTHICAL MAN-MONTH'
    ];
  }

  /**
   * Generate random agent ID (3-4 digits)
   */
  generateAgentId() {
    return String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0');
  }

  /**
   * Generate a random activity log
   */
  generateRandomLog() {
    const eventType = this.eventTemplates[Math.floor(Math.random() * this.eventTemplates.length)];
    const agentId = this.generateAgentId();
    let message = '';

    switch (eventType.type) {
      case 'UNLOCK':
        const book = this.bookTitles[Math.floor(Math.random() * this.bookTitles.length)];
        message = eventType.template(agentId, book);
        break;
      case 'KP_GAIN':
        const kpAmount = [10, 25, 50, 100][Math.floor(Math.random() * 4)];
        message = eventType.template(agentId, kpAmount);
        break;
      case 'CLEARANCE':
        const level = Math.floor(Math.random() * 5) + 1;
        message = eventType.template(agentId, level);
        break;
      case 'DUNGEON':
      case 'LOGIN':
      case 'SYSTEM':
        message = eventType.template(agentId);
        break;
    }

    return {
      id: Date.now() + Math.random(),
      message,
      color: eventType.color,
      timestamp: new Date().toISOString(),
      type: eventType.type
    };
  }

  /**
   * Add a custom log (for user-specific events)
   */
  addLog(message, color = '#00ff88', type = 'CUSTOM') {
    const log = {
      id: Date.now() + Math.random(),
      message,
      color,
      timestamp: new Date().toISOString(),
      type
    };

    this.logs.unshift(log);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    return log;
  }

  /**
   * Start generating random activity
   */
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    
    // Generate initial logs
    for (let i = 0; i < 5; i++) {
      this.logs.push(this.generateRandomLog());
    }

    // Generate new logs every 8-15 seconds
    this.intervalId = setInterval(() => {
      const log = this.generateRandomLog();
      this.logs.unshift(log);
      
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(0, this.maxLogs);
      }
    }, Math.random() * 7000 + 8000); // 8-15 seconds
  }

  /**
   * Stop generating activity
   */
  stop() {
    this.isActive = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Get all current logs
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Get the most recent log
   */
  getLatestLog() {
    return this.logs[0] || null;
  }

  /**
   * Clear all logs
   */
  clear() {
    this.logs = [];
  }
}

// Singleton instance
const activityService = new ActivityService();

export default activityService;
