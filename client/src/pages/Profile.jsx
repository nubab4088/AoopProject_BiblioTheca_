import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer 
} from 'recharts';
import { Trophy, Clock, Zap, BookOpen, Shield, Download, Gift } from 'lucide-react';
import useDailyReward from '../hooks/useDailyReward';
import useUiSound from '../hooks/useUiSound';

const Profile = ({ user, unlockedBooks }) => {
  // 🎁 DAILY SUPPLY DROP HOOK
  const { 
    isReady, 
    timeLeft, 
    collectReward, 
    isLoading, 
    error, 
    rewardAmount 
  } = useDailyReward(user.id);

  // 🎵 SOUND EFFECTS
  const { playWin, playClick } = useUiSound();

  // Handle claiming daily reward
  const handleClaimReward = async () => {
    playClick();
    const success = await collectReward();
    
    if (success) {
      playWin(); // 🎉 Play win sound on successful claim
      // Optionally refresh the page or show a toast notification
      setTimeout(() => {
        window.location.reload(); // Refresh to update KP display
      }, 1500);
    }
  };

  // Calculate stats from user data
  const booksPurged = unlockedBooks ? unlockedBooks.length : 0;
  const totalKP = user.kp || 0;

  // Calculate Level (Every 100 KP = 1 Level)
  const level = Math.floor(totalKP / 100) + 1;
  const nextLevelKP = level * 100;
  const progressPercent = ((totalKP % 100) / 100) * 100;

  // Agent Stats for Radar Chart
  const statsData = [
    { subject: 'Logic', A: 80 + (booksPurged * 5), fullMark: 100 },
    { subject: 'Speed', A: Math.min(65 + (totalKP / 10), 100), fullMark: 100 },
    { subject: 'Syntax', A: 90, fullMark: 100 },
    { subject: 'Defense', A: 70, fullMark: 100 },
    { subject: 'Lore', A: Math.min(50 + (booksPurged * 10), 100), fullMark: 100 },
  ];

  return (
    <div className="page-container" style={{ 
      paddingTop: '80px', 
      color: 'white', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      paddingBottom: '50px',
      padding: '80px 20px 50px'
    }}>

      {/* --- ID CARD HEADER --- */}
      <div style={{ 
        background: 'linear-gradient(145deg, rgba(20,20,40,0.9), rgba(40,20,60,0.9))', 
        borderRadius: '20px', 
        padding: '30px', 
        border: '1px solid #924EFF',
        boxShadow: '0 0 30px rgba(146, 78, 255, 0.15)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '30px', 
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        {/* Dynamic Avatar */}
        <div style={{ position: 'relative' }}>
          <div style={{ 
            width: '120px', 
            height: '120px', 
            borderRadius: '50%', 
            background: `url(https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'Agent'})`, 
            backgroundSize: 'cover', 
            border: '4px solid #00C6FF', 
            boxShadow: '0 0 20px #00C6FF'
          }}></div>
          <div style={{
            position: 'absolute', 
            bottom: '-10px', 
            right: '10px', 
            background: '#FFD700', 
            color: 'black', 
            fontWeight: 'bold', 
            padding: '5px 10px', 
            borderRadius: '10px', 
            fontSize: '0.9rem'
          }}>Lvl {level}</div>
        </div>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <h4 style={{ color: '#aaa', margin: 0, fontSize: '0.9rem', letterSpacing: '2px' }}>
            LICENSED DATA EXORCIST
          </h4>
          <h1 style={{ margin: '5px 0', fontSize: '2.5rem' }}>{user.name || "Agent_01"}</h1>
          <p style={{ color: '#888' }}>
            ID: {String(user.name || 'Agent').substring(0, 5).toUpperCase()}123 • Status: <span style={{color: '#00ff88'}}>ONLINE</span>
          </p>
          
          <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1, height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${progressPercent}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #924EFF, #00C6FF)',
                transition: 'width 0.5s ease'
              }}></div>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#ccc' }}>{totalKP} / {nextLevelKP} KP</span>
          </div>
        </div>
      </div>

      {/* 🎁 DAILY SUPPLY DROP SECTION */}
      <div style={{
        background: isReady 
          ? 'linear-gradient(145deg, rgba(255, 215, 0, 0.1), rgba(255, 140, 0, 0.1))'
          : 'linear-gradient(145deg, rgba(40, 40, 60, 0.5), rgba(60, 40, 80, 0.5))',
        borderRadius: '20px',
        padding: '30px',
        border: isReady ? '2px solid #FFD700' : '2px solid #444',
        boxShadow: isReady ? '0 0 40px rgba(255, 215, 0, 0.3)' : '0 0 20px rgba(0, 0, 0, 0.5)',
        marginBottom: '30px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}>
        {/* Animated Background Effect */}
        {isReady && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.1), transparent)',
            animation: 'pulse 2s infinite',
            pointerEvents: 'none'
          }}></div>
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: isReady ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: isReady ? 'bounce 1s infinite' : 'none',
                boxShadow: isReady ? '0 0 20px rgba(255, 215, 0, 0.5)' : 'none'
              }}>
                <Gift size={32} color={isReady ? '#000' : '#888'} />
              </div>
              <div>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '1.8rem',
                  color: isReady ? '#FFD700' : '#ccc',
                  textShadow: isReady ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none'
                }}>
                  DAILY SUPPLY DROP
                </h2>
                <p style={{ margin: '5px 0 0 0', color: '#aaa', fontSize: '0.9rem' }}>
                  {isReady ? 'Reward Ready to Claim!' : `Next Drop: ${timeLeft}`}
                </p>
              </div>
            </div>

            {/* Reward Amount Badge */}
            <div style={{
              background: isReady ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: isReady ? '2px solid #FFD700' : '2px solid #555',
              borderRadius: '15px',
              padding: '15px 25px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '5px' }}>
                REWARD
              </div>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold',
                color: isReady ? '#FFD700' : '#888',
                textShadow: isReady ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none'
              }}>
                +{rewardAmount} KP
              </div>
            </div>
          </div>

          {/* Claim Button or Countdown */}
          {isReady ? (
            <button
              onClick={handleClaimReward}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '20px',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                color: '#000',
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                border: 'none',
                borderRadius: '12px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                boxShadow: '0 5px 20px rgba(255, 215, 0, 0.4)',
                transition: 'all 0.3s ease',
                opacity: isLoading ? 0.6 : 1,
                animation: 'pulse 1.5s infinite'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 215, 0, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 5px 20px rgba(255, 215, 0, 0.4)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <span style={{ marginRight: '10px' }}>⏳</span>
                  PROCESSING...
                </>
              ) : (
                <>
                  <span style={{ marginRight: '10px' }}>🎁</span>
                  COLLECT +{rewardAmount} KP
                </>
              )}
            </button>
          ) : (
            <div style={{
              width: '100%',
              padding: '20px',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              color: '#666',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '2px dashed #555',
              borderRadius: '12px',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '15px'
            }}>
              <Clock size={24} />
              <span>NEXT DROP IN: {timeLeft}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              marginTop: '15px',
              padding: '12px',
              background: 'rgba(255, 68, 68, 0.1)',
              border: '1px solid #ff4444',
              borderRadius: '8px',
              color: '#ff4444',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>

      {/* --- GRID LAYOUT --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        
        {/* LEFT: RADAR CHART */}
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '25px' }}>
          <h3 style={{ 
            borderBottom: '1px solid #444', 
            paddingBottom: '15px', 
            marginBottom: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px' 
          }}>
            <Zap size={20} color="#FFD700" /> Capabilities
          </h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={statsData}>
                <PolarGrid stroke="#444" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#ccc', fontSize: 12 }} />
                <Radar name="Agent" dataKey="A" stroke="#924EFF" fill="#924EFF" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: BADGES & LOGS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '25px' }}>
            <h3 style={{ 
              borderBottom: '1px solid #444', 
              paddingBottom: '15px', 
              marginBottom: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px' 
            }}>
              <Trophy size={20} color="#00C6FF" /> Achievements
            </h3>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <Badge icon={<BookOpen size={18}/>} title="Reader" color="#FF5733" />
              {booksPurged > 0 && <Badge icon={<Shield size={18}/>} title="Purifier" color="#00C6FF" />}
              {level > 2 && <Badge icon={<Zap size={18}/>} title="Elite" color="#FFD700" />}
              {totalKP > 200 && <Badge icon={<Trophy size={18}/>} title="Master" color="#924EFF" />}
            </div>
          </div>

          <div style={{ 
            background: 'black', 
            borderRadius: '20px', 
            padding: '25px', 
            flex: 1, 
            fontFamily: 'monospace', 
            border: '1px solid #333',
            minHeight: '200px'
          }}>
            <h3 style={{ color: '#00ff88', marginBottom: '15px', fontSize: '1rem' }}>
              &gt; SYSTEM_LOGS.exe
            </h3>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              color: '#aaa', 
              fontSize: '0.9rem', 
              lineHeight: '1.8' 
            }}>
              <li><span style={{color: '#555'}}>[SYS_INIT]</span> Neural Net Connected...</li>
              {booksPurged > 0 ? (
                <li style={{color: '#00C6FF'}}>
                  <span style={{color: '#555'}}>[EVENT]</span> PURGE COMPLETE: {booksPurged} Book(s) Repaired.
                </li>
              ) : (
                <li style={{color: '#ff4444'}}>
                  <span style={{color: '#555'}}>[WARN]</span> Corrupted entities detected.
                </li>
              )}
              <li><span style={{color: '#555'}}>[UPDATE]</span> KP Total: {totalKP}</li>
              <li><span style={{color: '#555'}}>[STATUS]</span> Agent Level: {level}</li>
              {isReady && (
                <li style={{color: '#FFD700'}}>
                  <span style={{color: '#555'}}>[ALERT]</span> Daily Supply Drop ready for collection!
                </li>
              )}
              {totalKP === 0 && (
                <li style={{color: '#ff8844'}}>
                  <span style={{color: '#555'}}>[ALERT]</span> Energy depleted. Regeneration required.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const Badge = ({ icon, title, color }) => (
  <div style={{ 
    background: 'rgba(255,255,255,0.1)', 
    padding: '10px 15px', 
    borderRadius: '12px', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    gap: '5px', 
    border: `1px solid ${color}`,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-5px)';
    e.currentTarget.style.boxShadow = `0 5px 20px ${color}50`;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  }}>
    <div style={{ color: color }}>{icon}</div>
    <span style={{ fontSize: '0.7rem', color: '#ddd' }}>{title}</span>
  </div>
);

export default Profile;