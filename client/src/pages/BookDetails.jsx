import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import '../index.css'; // Reuse your global styles

const BookDetails = ({ books, onEnterDungeon }) => {
  const { id } = useParams(); // Get the ID from the URL (e.g., /book/4)
  const navigate = useNavigate();
  const location = useLocation();
  
  // 🔥 CONNECT TO USER CONTEXT for unlockedBooks
  const { user } = useUser();
  const unlockedBooks = user.unlockedBooks || [];
  
  const [book, setBook] = useState(null);
  const [pdfAvailable, setPdfAvailable] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // Find the book from your existing list (or fetch from API later)
    const foundBook = books.find(b => b.id === parseInt(id));
    setBook(foundBook);
    
    // Check if PDF exists
    if (foundBook) {
      checkPdfAvailability(foundBook.id);
    }

    // Check if returning from successful dungeon completion
    if (location.state?.purgeSuccess) {
      setShowSuccessMessage(true);
      // Clear the success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
      
      // Clear the navigation state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
    }
  }, [id, books, location]);

  const checkPdfAvailability = async (bookId) => {
    try {
      const response = await fetch(`/books/${bookId}.pdf`, { method: 'HEAD' });
      setPdfAvailable(response.ok);
    } catch {
      setPdfAvailable(false);
    }
  };

  const handleDownload = () => {
    if (!pdfAvailable) {
      alert('PDF not available yet. Please check back later!');
      return;
    }

    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = `/books/${book.id}.pdf`;
    link.download = `${book.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBorrowClick = () => {
    // Check using isCorrupted property (from backend)
    if (book.isCorrupted && !isUnlocked) {
      setShowAIModal(true);
    } else {
      // Normal borrow flow for unlocked or non-corrupted books
      alert('Book Borrowed Successfully!');
    }
  };

  const handleEnterDungeon = () => {
    setShowAIModal(false);
    // Navigate to dungeon platform for this specific book
    navigate(`/dungeon-platform/${book.id}`);
  };

  if (!book) return <div className="p-5 text-white">Loading Tome...</div>;

  // 🔍 CRITICAL: Robust unlock detection - check both string and number formats
  const isUnlocked = unlockedBooks.includes(parseInt(id)) || unlockedBooks.includes(String(id));
  const isCorruptedButUnlocked = book.isCorrupted && isUnlocked;

  console.log('📖 BookDetails Unlock Status:', {
    bookId: id,
    unlockedBooks,
    isUnlocked,
    isCorruptedButUnlocked
  });

  return (
    <div className="page-container" style={{ paddingTop: '100px', color: 'white', minHeight: '80vh' }}>
      <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ marginBottom: '20px' }}>
        ← Back to Library
      </button>

      {/* ✅ SUCCESS MESSAGE BANNER - Only show if corrupted AND unlocked */}
      {showSuccessMessage && isCorruptedButUnlocked && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '20px', 
          background: 'linear-gradient(135deg, rgba(0, 255, 0, 0.2), rgba(0, 200, 0, 0.2))', 
          border: '2px solid #00ff00', 
          borderRadius: '12px',
          textAlign: 'center',
          animation: 'slideDown 0.5s ease-out'
        }}>
          <p style={{ color: '#00ff00', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '10px' }}>
            🎉 CORRUPTION PURGED SUCCESSFULLY! 🎉
          </p>
          <p style={{ color: '#aaa', fontSize: '1rem' }}>
            You've earned <span style={{ color: '#ffdd00', fontWeight: 'bold' }}>+50 KP</span> and unlocked "{book.title}" for download!
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {/* Left: Cover */}
        <div style={{ flex: '0 0 300px' }}>
            <img 
              src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`} 
              alt={book.title} 
              style={{ width: '100%', borderRadius: '15px', boxShadow: '0 0 20px rgba(146, 78, 255, 0.4)' }}
            />
            
            {/* ✅ SYSTEM RESTORED BADGE - Show if corrupted but UNLOCKED */}
            {isCorruptedButUnlocked && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    background: 'rgba(0, 255, 0, 0.1)', 
                    border: '1px solid #00ff00', 
                    borderRadius: '10px',
                    textAlign: 'center',
                    animation: 'pulse 2s ease-in-out infinite'
                }}>
                    <p style={{ color: '#00ff00', fontSize: '1.1rem', fontWeight: 'bold' }}>
                        ✅ SYSTEM RESTORED
                    </p>
                    <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '5px' }}>
                        Download unlocked
                    </p>
                </div>
            )}
        </div>

        {/* Right: Details */}
        <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{book.title}</h1>
            <h3 style={{ color: '#924EFF', marginBottom: '20px' }}>by {book.author}</h3>
            
            <div style={{ background: '#1a1a2e', padding: '20px', borderRadius: '15px', marginBottom: '20px' }}>
                <h4 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>Synopsis</h4>
                <p style={{ lineHeight: '1.6', marginTop: '10px', color: '#ccc', whiteSpace: 'pre-line' }}>
                    {book.description || "The pages of this book are shrouded in mystery..."}
                </p>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
                <span className="badge">{book.category}</span>
                <span className="badge">ISBN: {book.isbn}</span>
                {isCorruptedButUnlocked && (
                  <span className="badge" style={{ background: '#00ff00', color: '#000' }}>
                    <i className="fas fa-unlock"></i> UNLOCKED
                  </span>
                )}
            </div>

            <div style={{ marginTop: '40px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                {/* ✅ CONDITIONAL RENDERING: If unlocked, show Borrow + Play Anyway */}
                {isCorruptedButUnlocked ? (
                  <>
                    <button className="btn-primary" onClick={handleBorrowClick}>
                        📖 Borrow This Book
                    </button>
                    <button 
                      className="btn-secondary" 
                      onClick={() => navigate(`/dungeon-platform/${book.id}`)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        background: 'linear-gradient(135deg, #ff4444, #ff8844)'
                      }}
                    >
                      <i className="fas fa-gamepad"></i>
                      Play Game Anyway
                    </button>
                  </>
                ) : (
                  <button className="btn-primary" onClick={handleBorrowClick}>
                      📖 Borrow This Book
                  </button>
                )}
                
                {/* ✅ DOWNLOAD BUTTON - Show if unlocked OR non-corrupted */}
                {(isUnlocked || !book.isCorrupted) && (
                    <button 
                        className="btn-secondary" 
                        onClick={handleDownload}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            opacity: pdfAvailable ? 1 : 0.6
                        }}
                    >
                        <i className="fas fa-download"></i>
                        {pdfAvailable ? 'Download PDF' : 'PDF Not Available'}
                    </button>
                )}
            </div>

            {(isUnlocked || !book.isCorrupted) && pdfAvailable && (
                <p style={{ marginTop: '15px', fontSize: '0.9rem', color: '#aaa' }}>
                    <i className="fas fa-check-circle" style={{ color: '#00ff00' }}></i> PDF ready for download
                </p>
            )}
        </div>
      </div>

      {/* ❌ AI INTERCEPTION MODAL - Only show if NOT unlocked */}
      {showAIModal && !isUnlocked && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <button style={modalStyles.closeButton} onClick={() => setShowAIModal(false)}>
              <i className="fas fa-times"></i>
            </button>

            <div style={modalStyles.iconContainer}>
              <i className="fas fa-ghost" style={modalStyles.ghostIcon}></i>
            </div>

            <h2 style={modalStyles.title}>👻 GHOST LIBRARIAN ALERT</h2>
            
            <div style={modalStyles.messageBox}>
              <p style={modalStyles.message}>
                <strong style={{ color: '#924EFF' }}>STOP, MORTAL!</strong>
              </p>
              <p style={modalStyles.message}>
                This tome is corrupted by digital anomalies. The knowledge within is trapped behind layers of malicious code.
              </p>
              <p style={modalStyles.message}>
                Do you have the <span style={{ color: '#ff4444' }}>courage</span> and <span style={{ color: '#00ddff' }}>skill</span> to purge it?
              </p>
            </div>

            <div style={modalStyles.warningBox}>
              <i className="fas fa-exclamation-triangle"></i>
              <span>Failure may result in temporary Knowledge Point loss</span>
            </div>

            <div style={modalStyles.buttonGroup}>
              <button style={modalStyles.enterButton} onClick={handleEnterDungeon}>
                <i className="fas fa-skull"></i>
                <span>Yes, Enter Dungeon</span>
              </button>
              <button style={modalStyles.cancelButton} onClick={() => setShowAIModal(false)}>
                <i className="fas fa-shield-alt"></i>
                <span>No, Stay Safe</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    animation: 'fadeIn 0.3s ease-out'
  },
  modal: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    border: '2px solid #924EFF',
    borderRadius: '20px',
    padding: '3rem',
    maxWidth: '600px',
    width: '90%',
    boxShadow: '0 0 40px rgba(146, 78, 255, 0.5)',
    position: 'relative',
    animation: 'slideUp 0.4s ease-out'
  },
  closeButton: {
    position: 'absolute',
    top: '1.5rem',
    right: '1.5rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    color: '#fff',
    fontSize: '1.2rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  iconContainer: {
    textAlign: 'center',
    marginBottom: '1.5rem'
  },
  ghostIcon: {
    fontSize: '5rem',
    color: '#924EFF',
    filter: 'drop-shadow(0 0 20px rgba(146, 78, 255, 0.8))',
    animation: 'float 3s ease-in-out infinite'
  },
  title: {
    fontSize: '2rem',
    textAlign: 'center',
    color: '#fff',
    marginBottom: '2rem',
    textTransform: 'uppercase',
    letterSpacing: '2px'
  },
  messageBox: {
    background: 'rgba(146, 78, 255, 0.1)',
    border: '1px solid rgba(146, 78, 255, 0.3)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem'
  },
  message: {
    color: '#ccc',
    fontSize: '1.1rem',
    lineHeight: '1.6',
    marginBottom: '1rem',
    textAlign: 'center'
  },
  warningBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    background: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid rgba(255, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '2rem',
    color: '#ff4444',
    fontSize: '0.9rem'
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    flexDirection: 'column'
  },
  enterButton: {
    background: 'linear-gradient(135deg, #924EFF 0%, #6c5ce7 100%)',
    border: 'none',
    padding: '1.25rem 2rem',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  cancelButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    padding: '1rem 2rem',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    transition: 'all 0.3s ease'
  }
};

export default BookDetails;
