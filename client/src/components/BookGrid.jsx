import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import useUiSound from '../hooks/useUiSound';
import { useNavigate } from 'react-router-dom';

const BookGrid = ({ books, handleBookClick, showSearch = true }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const navigate = useNavigate();
  
  // 🔥 CONNECT TO USER CONTEXT
  const { user } = useUser();
  const unlockedBooks = user.unlockedBooks || [];
  
  // 🎵 UI SOUNDS HOOK
  const { playClick, playHover } = useUiSound();

  const isBookUnlocked = (bookId) => {
    return unlockedBooks.some(id => 
      String(id) === String(bookId) || parseInt(id) === parseInt(bookId)
    );
  };

  const filteredBooks = searchQuery.trim() 
    ? books.filter(book => {
        const query = searchQuery.toLowerCase();
        if (searchType === 'title') return book.title.toLowerCase().includes(query);
        if (searchType === 'author') return book.author.toLowerCase().includes(query);
        if (searchType === 'category') return book.category.toLowerCase().includes(query);
        return true;
      })
    : books;

  const handleBookClickWithEffects = (book) => {
    playClick();
    
    // 🔥 SECURITY CHECK FIX: Check the exact guest name
    if (user.name === 'Guest Agent' && (book.isCorrupted || book.corrupted)) {
      setShowAuthAlert(true);
      return; 
    }
    
    if (book.isCorrupted || book.corrupted) {
      const appContainer = document.querySelector('.app-container');
      if (appContainer) {
        appContainer.classList.add('shake-screen');
        setTimeout(() => {
          appContainer.classList.remove('shake-screen');
        }, 500);
      }
    }
    
    handleBookClick(book);
  };

  return (
    <>
      {showSearch && (
        <section className="search-section">
          <div className="container">
            <h2>Search Your Learning Content</h2>
            <div className="search-box">
              <select 
                className="search-type"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                onMouseEnter={playHover}
              >
                <option value="title">By Title</option>
                <option value="author">By Author</option>
                <option value="category">By Category</option>
              </select>
              <input 
                type="text" 
                placeholder="Search by Keyword" 
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                className="search-btn"
                onMouseEnter={playHover}
                onClick={playClick}
              >
                <i className="fas fa-search"></i> SEARCH
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="books-section" id="books">
        <div className="container">
          <h2>FIND BOOKS</h2>
          
          {searchQuery && (
            <div style={{
              textAlign: 'center',
              marginBottom: '1rem',
              color: '#00e5ff',
              fontSize: '0.9rem'
            }}>
              Found {filteredBooks.length} result{filteredBooks.length !== 1 ? 's' : ''}
            </div>
          )}

          <div className="books-grid" id="booksGrid">
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book) => {
                const isUnlocked = isBookUnlocked(book.id);
                const isCorrupted = book.isCorrupted || book.corrupted;
                const displayCorrupted = isCorrupted && !isUnlocked;
                
                return (
                  <div 
                    key={book.id} 
                    className={`book-card ${displayCorrupted ? 'corrupted-book' : ''} ${isUnlocked && isCorrupted ? 'unlocked-book' : ''}`}
                    onClick={() => handleBookClickWithEffects(book)}
                    onMouseEnter={playHover}
                    style={displayCorrupted ? {
                      border: '2px solid rgba(56, 189, 248, 0.6)',
                      boxShadow: '0 0 30px rgba(56, 189, 248, 0.4)',
                      background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(56, 189, 248, 0.1))'
                    } : (isUnlocked && isCorrupted) ? {
                      border: '2px solid rgba(16, 185, 129, 0.6)',
                      boxShadow: '0 0 30px rgba(16, 185, 129, 0.5)',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.1))'
                    } : {}}
                  >
                    <div className="book-image">
                      <img 
                        src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`} 
                        alt={book.title}
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = 'https://placehold.co/200x300/2C2F48/FFF?text=No+Cover';
                        }}
                      />
                      <span className="badge" style={{
                        background: (isUnlocked && isCorrupted) 
                          ? 'linear-gradient(135deg, #10b981, #34d399)' 
                          : displayCorrupted 
                          ? 'linear-gradient(135deg, #38bdf8, #7c3aed)' 
                          : '#924EFF',
                        color: '#000',
                        fontWeight: 'bold',
                        boxShadow: displayCorrupted 
                          ? '0 0 15px rgba(56, 189, 248, 0.6)' 
                          : (isUnlocked && isCorrupted) 
                          ? '0 0 20px rgba(16, 185, 129, 0.7)' 
                          : 'none'
                      }}>
                        {isUnlocked && isCorrupted ? '✅ RESTORED' : displayCorrupted ? '🔒 CORRUPTED' : book.category}
                      </span>
                    </div>
                    <div className="book-info">
                      <h4>{book.title}</h4>
                      <p className="author">by {book.author}</p>
                      <button 
                        className="read-more" 
                        style={{
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          padding: 0,
                          color: isUnlocked && isCorrupted ? '#10b981' : displayCorrupted ? '#38bdf8' : '#00d4ff',
                          fontWeight: displayCorrupted || (isUnlocked && isCorrupted) ? 'bold' : 'normal'
                        }}
                      >
                        {isUnlocked && isCorrupted ? 'READ' : displayCorrupted ? 'PURIFY' : 'EXPLORE'} <i className="fas fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '3rem',
                color: '#aaa'
              }}>
                <i className="fas fa-search" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
                <h3>No books found</h3>
                <p>Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 🔥 THEMED ACCESS DENIED MODAL */}
      {showAuthAlert && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(10, 11, 26, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          {/* Internal stylesheet for the floating animation */}
          <style>
            {`
              @keyframes floatGhost {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
                100% { transform: translateY(0px); }
              }
            `}
          </style>

          <div style={{
            background: '#151729',
            border: '1px solid #7c3aed',
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            maxWidth: '450px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 0 30px rgba(124, 58, 237, 0.25)',
            position: 'relative',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => setShowAuthAlert(false)}
              onMouseEnter={playHover}
              style={{
                position: 'absolute', top: '15px', right: '15px',
                background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#a0a5cc',
                width: '30px', height: '30px', borderRadius: '50%',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <i className="fas fa-times"></i>
            </button>

            {/* Glowing Floating Ghost Icon */}
            <div style={{ 
              fontSize: '4.5rem', 
              color: '#a855f7', 
              textShadow: '0 0 25px rgba(168, 85, 247, 0.7)', 
              marginBottom: '1rem',
              animation: 'floatGhost 3s ease-in-out infinite'
            }}>
              <i className="fas fa-ghost"></i>
            </div>
            
            <h2 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.4rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              ACCESS DENIED 🚨
            </h2>
            
            {/* Inner Dark Box */}
            <div style={{
              background: '#1e213a',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{ color: '#a0a5cc', lineHeight: '1.6', fontSize: '0.95rem', margin: 0 }}>
                Agent clearance is required to initiate purification sequences. Please sign in to access full library facilities and save your progress.
              </p>
            </div>
            
            {/* Warning Strip */}
            <div style={{
              background: 'rgba(255, 68, 68, 0.1)',
              border: '1px solid rgba(255, 68, 68, 0.2)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              color: '#ff4444',
              fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
            }}>
              <i className="fas fa-exclamation-triangle"></i>
              Guest Profile Detected
            </div>
            
            {/* 🔥 SIDE-BY-SIDE BUTTONS MATCHING YOUR UI */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '15px' }}>
              <button
                onClick={() => setShowAuthAlert(false)}
                onMouseEnter={playHover}
                style={{
                  flex: 1,
                  padding: '0.9rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  transition: 'background 0.2s',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                }}
              >
                <i className="fas fa-shield-alt"></i> ABORT
              </button>

              <button
                onClick={() => navigate('/login')}
                onMouseEnter={playHover}
                style={{
                  flex: 1,
                  padding: '0.9rem',
                  background: '#8b5cf6',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  transition: 'background 0.2s',
                  textTransform: 'uppercase',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                }}
              >
                SIGN IN <i className="fas fa-sign-in-alt"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookGrid;