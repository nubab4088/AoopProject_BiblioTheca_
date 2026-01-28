import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';
import BookGrid from '../components/BookGrid';
import ServicesSection from '../components/ServicesSection';
import NewsSection from '../components/NewsSection';

function LandingPage({ books, handleBookClick, servicesData, newsData, isLoggedIn }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Add glitch animation interval
    const glitchInterval = setInterval(() => {
      const title = document.querySelector('.glitch-title');
      if (title) {
        title.classList.add('glitching');
        setTimeout(() => {
          title.classList.remove('glitching');
        }, 200);
      }
    }, 3000);

    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <>
      {/* HERO SECTION - PRESERVED EXACTLY AS IS */}
      <div className="landing-container" id="home">
        {/* Animated Background Particles */}
        <div className="particles">
          {[...Array(50)].map((_, i) => (
            <div 
              key={i} 
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="landing-content">
          {/* Glitch Title */}
          <h1 className="glitch-title" data-text="BIBLIOTHECA">
            BIBLIOTHECA
          </h1>

          {/* Subtitle */}
          <div className="landing-subtitle">
            <div className="subtitle-line"></div>
            <h2>THE CURSED ARCHIVES</h2>
            <div className="subtitle-line"></div>
          </div>

          {/* Description */}
          <p className="landing-description">
            A digital twin library corrupted by dark data.<br />
            Only the brave can restore knowledge.
          </p>

          {/* Warning Box */}
          <div className="warning-box">
            <div className="warning-header">
              <i className="fas fa-exclamation-triangle"></i>
              <span>SYSTEM ALERT</span>
            </div>
            <p>⚠️ Neural pathways unstable. Corruption detected in 47% of archives.</p>
            <p>🔐 Clearance required. Proceed with caution.</p>
          </div>

          {/* CONDITIONAL ENTER SYSTEM BUTTON - Only shows after login */}
          {isLoggedIn && (
            <button 
              className="enter-button"
              onClick={() => navigate('/dashboard')}
              style={{
                animation: 'slideInFromBottom 0.8s ease-out, glow-pulse 2s infinite'
              }}
            >
              <span className="button-glitch" data-text="ENTER SYSTEM">ENTER SYSTEM</span>
              <div className="button-glow"></div>
              {/* Access Granted Badge */}
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                background: 'linear-gradient(135deg, #00ff88, #00cc66)',
                color: '#000',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                boxShadow: '0 0 20px rgba(0, 255, 136, 0.8)',
                animation: 'bounce 1s infinite'
              }}>
                ✓ ACCESS GRANTED
              </div>
            </button>
          )}

          {/* Footer Info */}
          <div className="landing-footer">
            <p>
              <i className="fas fa-shield-alt"></i> 
              {isLoggedIn ? 'AGENT AUTHENTICATED' : 'SECURE CONNECTION ESTABLISHED'}
            </p>
            <p className="footer-code">
              [SYSTEM_ID: BT-2026] [BUILD: ALPHA-0.7.3] [STATUS: {isLoggedIn ? 'AGENT_ACTIVE' : 'OPERATIONAL'}]
            </p>
          </div>
        </div>

        {/* Scanlines Effect */}
        <div className="scanlines"></div>
        
        {/* Vignette Effect */}
        <div className="vignette"></div>
      </div>

      {/* ONLY SHOW CONTENT SECTIONS BEFORE LOGIN */}
      {!isLoggedIn && (
        <>
          {/* Services Section */}
          <ServicesSection servicesData={servicesData} />

          {/* Search + Books */}
          <BookGrid 
            books={books}
            handleBookClick={handleBookClick}
            showSearch={true}
          />

          {/* News Section */}
          <NewsSection newsData={newsData} />
        </>
      )}
    </>
  );
}

export default LandingPage;