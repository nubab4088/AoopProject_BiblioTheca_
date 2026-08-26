import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import BookGrid from '../components/BookGrid';
import DungeonPlatform from '../components/DungeonPlatform';

const Dashboard = () => {
  const { user, updateKP, unlockBook } = useUser();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch books on component mount
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate user stats from context
  const displayName = user?.name || 'Unknown Agent';
  const totalKP = user?.kp || 0;
  const unlockedBooksCount = user?.unlockedBooks?.length || 0;
  const level = Math.floor(totalKP / 100) + 1;
  const nextLevelKP = level * 100;
  const progressPercent = ((totalKP % 100) / 100) * 100;

  const handleBookClick = (book) => {
    // Handle book click logic here
    console.log('Book clicked:', book);
  };

  return (
    <div style={styles.container}>
      {/* ID CARD HEADER */}
      <div style={styles.idCard}>
        <div style={{ position: 'relative' }}>
          <div style={{
            ...styles.avatar,
            background: `url(https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName})`,
            backgroundSize: 'cover'
          }}></div>
          <div style={styles.levelBadge}>Lvl {level}</div>
        </div>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <h4 style={styles.roleLabel}>
            LICENSED DATA EXORCIST
          </h4>
          <h1 style={styles.userName}>{displayName}</h1>
          <p style={styles.userInfo}>
            ID: {String(displayName).substring(0, 5).toUpperCase()}123 • Status: <span style={{color: '#00ff88'}}>ONLINE</span>
          </p>
          
          <div style={styles.progressContainer}>
            <div style={styles.progressBarTrack}>
              <div style={{ 
                ...styles.progressBarFill,
                width: `${progressPercent}%`
              }}></div>
            </div>
            <span style={styles.progressText}>{totalKP} / {nextLevelKP} KP</span>
          </div>
        </div>
      </div>

      {/* AGENT NAME CARD */}
      <div style={styles.agentCard}>
        <div style={styles.cardLabel}>AGENT_NAME</div>
        <div style={styles.agentName}>{displayName}</div>
      </div>

      {/* STATS CARDS */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📚</div>
          <div style={styles.statValue}>{unlockedBooksCount}</div>
          <div style={styles.statLabel}>Books Restored</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⚡</div>
          <div style={styles.statValue}>{totalKP}</div>
          <div style={styles.statLabel}>Knowledge Points</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🎮</div>
          <div style={styles.statValue}>{user?.completedGames?.length || 0}</div>
          <div style={styles.statLabel}>Games Completed</div>
        </div>
      </div>

      {/* DUNGEON PLATFORM */}
      <DungeonPlatform />

      {/* BOOKS GRID */}
      <div style={styles.booksSection}>
        <h2 style={styles.sectionTitle}>📖 Corrupted Archives</h2>
        {loading ? (
          <div style={styles.loading}>Loading books...</div>
        ) : (
          <BookGrid books={books} handleBookClick={handleBookClick} showSearch={false} />
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    padding: '100px 40px 40px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  idCard: {
    background: 'linear-gradient(145deg, rgba(20,20,40,0.9), rgba(40,20,60,0.9))',
    borderRadius: '20px',
    padding: '30px',
    border: '1px solid #924EFF',
    boxShadow: '0 0 30px rgba(146, 78, 255, 0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  avatar: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '4px solid #00C6FF',
    boxShadow: '0 0 20px #00C6FF',
  },
  levelBadge: {
    position: 'absolute',
    bottom: '-10px',
    right: '10px',
    background: '#FFD700',
    color: 'black',
    fontWeight: 'bold',
    padding: '5px 10px',
    borderRadius: '10px',
    fontSize: '0.9rem',
  },
  roleLabel: {
    color: '#aaa',
    margin: 0,
    fontSize: '0.9rem',
    letterSpacing: '2px',
  },
  userName: {
    margin: '5px 0',
    fontSize: '2.5rem',
    color: 'white',
    fontWeight: 'bold',
  },
  userInfo: {
    color: '#888',
    margin: 0,
  },
  progressContainer: {
    marginTop: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  progressBarTrack: {
    flex: 1,
    height: '8px',
    background: '#333',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #924EFF, #00C6FF)',
    transition: 'width 0.5s ease',
  },
  progressText: {
    fontSize: '0.8rem',
    color: '#ccc',
  },
  agentCard: {
    background: 'linear-gradient(135deg, rgba(91, 114, 238, 0.15) 0%, rgba(180, 100, 232, 0.15) 100%)',
    border: '2px solid rgba(91, 114, 238, 0.4)',
    borderRadius: '20px',
    padding: '20px 30px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 4px 20px rgba(91, 114, 238, 0.3), 0 0 40px rgba(180, 100, 232, 0.2)',
    marginBottom: '30px',
  },
  cardLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  agentName: {
    color: '#00ff88',
    fontSize: '1.5rem',
    fontWeight: 800,
    fontFamily: 'Ginto, monospace',
    textShadow: '0 0 20px rgba(0, 255, 136, 0.6)',
    letterSpacing: '1px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    padding: '25px',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
  },
  statIcon: {
    fontSize: '2.5rem',
    marginBottom: '10px',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#00C6FF',
    marginBottom: '5px',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  booksSection: {
    marginTop: '40px',
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '30px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #00C6FF, #924EFF)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '1.2rem',
    color: '#aaa',
  },
};

export default Dashboard;