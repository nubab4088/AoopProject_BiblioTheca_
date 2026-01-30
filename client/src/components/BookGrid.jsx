import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import useUiSound from '../hooks/useUiSound';

const BookGrid = ({ books, handleBookClick, showSearch = true }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('title');
  
  // 🔥 CONNECT TO USER CONTEXT FOR REAL-TIME UNLOCK STATUS
  const { user } = useUser();
  const unlockedBooks = user.unlockedBooks || [];
  
  // 🎵 UI SOUNDS HOOK
  const { playClick, playHover } = useUiSound();

  // 📚 Helper function to check if a book is unlocked
  const isBookUnlocked = (bookId) => {
    return unlockedBooks.some(id => 
      String(id) === String(bookId) || parseInt(id) === parseInt(bookId)
    );
  };

  // Filter books based on search
  const filteredBooks = searchQuery.trim() 
    ? books.filter(book => {
        const query = searchQuery.toLowerCase();
        if (searchType === 'title') return book.title.toLowerCase().includes(query);
        if (searchType === 'author') return book.author.toLowerCase().includes(query);
        if (searchType === 'category') return book.category.toLowerCase().includes(query);
        return true;
      })
    : books;

  /**
   * Handle book click with sound effects and screen shake for corrupted books
   */
  const handleBookClickWithEffects = (book) => {
    playClick();
    
    // 💥 SCREEN SHAKE for corrupted books
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
      {/* Search Section */}
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

      {/* Books Grid */}
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
                // 🔍 CRITICAL: Check unlock status using BOTH formats (string & number)
                const isUnlocked = isBookUnlocked(book.id);
                const isCorrupted = book.isCorrupted || book.corrupted;
                
                // If unlocked, override corrupted status
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
                      border: '2px solid rgba(0, 255, 65, 0.5)',
                      boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)'
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
                          ? 'linear-gradient(135deg, #00ff41, #00cc33)' 
                          : displayCorrupted 
                          ? 'linear-gradient(135deg, #38bdf8, #7c3aed)' 
                          : '#924EFF',
                        color: '#fff',
                        fontWeight: 'bold',
                        boxShadow: displayCorrupted 
                          ? '0 0 15px rgba(56, 189, 248, 0.6)' 
                          : (isUnlocked && isCorrupted) 
                          ? '0 0 15px rgba(0, 255, 65, 0.6)' 
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
                          color: isUnlocked && isCorrupted ? '#00ff41' : displayCorrupted ? '#38bdf8' : '#00d4ff',
                          fontWeight: displayCorrupted ? 'bold' : 'normal'
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
    </>
  );
};

export default BookGrid;