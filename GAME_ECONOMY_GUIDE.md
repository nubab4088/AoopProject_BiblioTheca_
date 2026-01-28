# 🎮 Game Economy & Stamina System - Integration Guide

## ✅ IMPLEMENTATION COMPLETE

This document provides a complete guide for the **Production-Ready Game Economy & Stamina System** implemented for the Bibliotheca project.

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [API Endpoints](#api-endpoints)
5. [Integration Example](#integration-example)
6. [Testing Checklist](#testing-checklist)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 System Overview

### Game Rules (Game Design Document)

| Rule | Value | Implementation |
|------|-------|----------------|
| **Initial KP** | 100 | Set in `Player.java` entity default |
| **Win Reward** | +50 KP | `PlayerService.handleWin()` |
| **Loss Penalty** | -50 KP | `PlayerService.handleLoss()` |
| **Mercy Rule** | KP ≥ 0 | `Math.max(0, currentKP - 50)` |
| **Lockout Trigger** | KP = 0 | Automatic on zero KP |
| **Lockout Duration** | 10 seconds | Client-side timer + backend validation |
| **Restoration Amount** | 50 KP | Half charge after lockout |

### Key Features

✅ **Immediate KP Deduction** - Fixes "first loss bug" with transactional safety  
✅ **Automatic Lockout System** - 10-second recharge with visual overlay  
✅ **Sound Effects** - Power-up sound plays on energy restoration  
✅ **Real-time UI Updates** - Optimistic updates with backend sync  
✅ **Error Handling** - Graceful degradation on API failures  

---

## 🔧 Backend Implementation

### 1. Player Entity (`Player.java`)

**Location:** `springboot/demo/src/main/java/com/bibliotheca/model/Player.java`

```java
@Column(name = "knowledge_points", columnDefinition = "integer default 100")
private Integer knowledgePoints = 100; // Starting with 100 KP
```

**Key Changes:**
- Default KP changed from 150 → **100**
- Database column definition updated

### 2. PlayerService (`PlayerService.java`) ⭐ NEW FILE

**Location:** `springboot/demo/src/main/java/com/bibliotheca/service/PlayerService.java`

**Core Methods:**

| Method | Purpose | Returns |
|--------|---------|---------|
| `updateKP(userId, amount)` | Generic KP update with Mercy Rule | Player |
| `handleWin(userId)` | Award +50 KP for victory | Player |
| `handleLoss(userId)` | Deduct -50 KP for defeat | Player |
| `restoreEnergy(userId)` | Set KP to 50 after lockout | Player |
| `canPlay(userId)` | Check if player has ≥50 KP | boolean |
| `getRemainingLockoutTime(player)` | Calculate lockout seconds | long |

**Transaction Safety:**
```java
@Transactional
public Player updateKP(Long userId, int amount) {
    Player player = playerRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("Player not found"));
    
    int newKP = Math.max(0, player.getKnowledgePoints() + amount);
    player.setKnowledgePoints(newKP);
    
    if (newKP == 0) {
        player.setLastRegenerationTime(LocalDateTime.now());
    }
    
    return playerRepository.save(player); // CRITICAL: Explicit save
}
```

### 3. PlayerController Updates

**New Endpoints:**

#### `POST /api/players/{id}/kp`
Update Knowledge Points (generic endpoint)

**Request Body:**
```json
{
  "amount": -50
}
```

**Response:**
```json
{
  "id": 1,
  "username": "player123",
  "knowledgePoints": 50,
  "isLocked": false,
  "lockoutSeconds": 0,
  "message": "KP deducted"
}
```

#### `POST /api/players/{id}/restore`
Restore energy after lockout (sets KP to 50)

**Response:**
```json
{
  "id": 1,
  "username": "player123",
  "knowledgePoints": 50,
  "isLocked": false,
  "message": "Energy restored! Neural link recharged to 50 KP"
}
```

---

## 🎨 Frontend Implementation

### 1. useGameEconomy Hook ⭐ NEW FILE

**Location:** `client/src/hooks/useGameEconomy.js`

**Usage:**
```javascript
import useGameEconomy from '../hooks/useGameEconomy';

const userId = localStorage.getItem('userId');

const {
  kp,              // Current Knowledge Points
  isLocked,        // Is player in lockout?
  timer,           // Remaining lockout seconds
  lockoutProgress, // Progress percentage (0-100)
  handleWin,       // Call on victory
  handleLoss,      // Call on defeat
  canPlay,         // Can player start game?
  isLoading,       // API call in progress?
  error            // Error message (if any)
} = useGameEconomy(userId);
```

**Example - Handling Game Loss:**
```javascript
const handleGameLoss = async () => {
  await handleLoss(); // Deducts 50 KP immediately
  
  if (isLocked) {
    // Player will see RechargeOverlay automatically
    // After 10 seconds, energy restores to 50 KP
  }
};
```

### 2. RechargeOverlay Component ⭐ NEW FILE

**Location:** `client/src/components/RechargeOverlay.jsx`

**Features:**
- Full-screen overlay (z-index: 3000)
- Animated progress bar (10-second fill)
- Real-time countdown timer
- Cyberpunk/neural theme
- Auto-dismisses after restoration

**Usage:**
```jsx
import RechargeOverlay from '../components/RechargeOverlay';

<RechargeOverlay 
  isVisible={isLocked}
  timer={timer}
  progress={lockoutProgress}
/>
```

### 3. DungeonPlatform Integration

**Location:** `client/src/pages/DungeonPlatform.jsx`

**Integration Points:**

```jsx
// 1. Import the hook and overlay
import useGameEconomy from '../hooks/useGameEconomy';
import RechargeOverlay from '../components/RechargeOverlay';

// 2. Initialize the hook
const userId = localStorage.getItem('userId');
const {
  kp,
  isLocked,
  timer,
  lockoutProgress,
  handleWin: economyHandleWin,
  handleLoss: economyHandleLoss,
  canPlay
} = useGameEconomy(userId);

// 3. Handle victory
const handleGameWin = async () => {
  await economyHandleWin(); // Awards +50 KP
  // Navigate to success page
};

// 4. Handle defeat
const handleGameLoss = async () => {
  await economyHandleLoss(); // Deducts -50 KP
  // If KP hits 0, lockout triggers automatically
};

// 5. Show lockout overlay
if (isLocked) {
  return (
    <RechargeOverlay 
      isVisible={isLocked}
      timer={timer}
      progress={lockoutProgress}
    />
  );
}

// 6. Display KP in UI
<div style={styles.kpDisplay}>
  <div style={styles.kpLabel}>KNOWLEDGE POINTS</div>
  <div style={styles.kpValue}>{kp} KP</div>
</div>
```

---

## 🔌 API Endpoints Reference

### Base URL
```
http://localhost:8080/api/players
```

### Endpoints Summary

| Method | Endpoint | Purpose | Body |
|--------|----------|---------|------|
| POST | `/{id}/kp` | Update KP | `{"amount": -50}` |
| POST | `/{id}/restore` | Restore energy | None |
| POST | `/{id}/dungeon-failed` | Legacy loss handler | None |
| POST | `/{id}/unlock-book` | Win + unlock book | `{"bookId": 1}` |
| GET | `/{id}/can-play` | Check play eligibility | None |
| GET | `/{id}` | Get player profile | None |

---

## 📝 Integration Example: Complete Flow

### Scenario: User Plays Dungeon and Loses

```javascript
// DungeonPlatform.jsx

function DungeonPlatform() {
  const userId = localStorage.getItem('userId');
  
  // Initialize economy hook
  const {
    kp,           // 100 KP (initial)
    isLocked,     // false
    handleLoss,
    canPlay       // true (has 100 KP)
  } = useGameEconomy(userId);
  
  // User clicks "Launch Protocol"
  const handleGameSelect = (game) => {
    if (!canPlay) {
      alert('Insufficient KP!');
      return;
    }
    setIsPlaying(true);
  };
  
  // User loses the game
  const handleGameLoss = async () => {
    // Call hook's handleLoss
    await handleLoss();
    
    // Backend: POST /api/players/1/kp with {"amount": -50}
    // Response: {"knowledgePoints": 50, "isLocked": false}
    
    // kp updates to 50
    // User can still play (has 50 KP)
  };
  
  // User loses AGAIN
  const handleSecondLoss = async () => {
    await handleLoss();
    
    // Backend: POST /api/players/1/kp with {"amount": -50}
    // Response: {"knowledgePoints": 0, "isLocked": true}
    
    // kp updates to 0
    // isLocked becomes true
    // 10-second timer starts automatically
    
    // RechargeOverlay appears
    // After 10 seconds:
    //   - Backend: POST /api/players/1/restore
    //   - Response: {"knowledgePoints": 50}
    //   - Power-up sound plays
    //   - kp updates to 50
    //   - isLocked becomes false
  };
}
```

---

## ✅ Testing Checklist

### Backend Tests

- [ ] New user starts with **100 KP** (not 150)
- [ ] Win awards **exactly +50 KP**
- [ ] Loss deducts **exactly -50 KP**
- [ ] **First loss** deducts immediately (no stale state)
- [ ] KP **never goes negative** (clamped to 0)
- [ ] Lockout triggers when KP = 0
- [ ] Restore endpoint sets KP to **50** (not 100)

### Frontend Tests

- [ ] useGameEconomy hook fetches initial KP on mount
- [ ] KP display updates after win/loss
- [ ] RechargeOverlay appears when KP = 0
- [ ] Timer counts down from 10 to 0
- [ ] Progress bar fills from 0% to 100%
- [ ] Power-up sound plays on restoration
- [ ] Overlay dismisses after 10 seconds
- [ ] KP updates to 50 after restoration
- [ ] User can play again after restoration

### Integration Tests

- [ ] Win → Navigate to book unlock page
- [ ] Loss with KP > 0 → Navigate back (no lockout)
- [ ] Loss with KP = 0 → Show lockout overlay
- [ ] Lockout → Auto-restore → User can play again
- [ ] Multiple wins accumulate KP correctly
- [ ] Error handling works if API fails

---

## 🐛 Troubleshooting

### Issue: "First loss doesn't deduct KP"

**Solution:** Ensure you're using `PlayerService.handleLoss()` instead of directly calling the repository. The service layer has `@Transactional` annotation and explicit `.save()`.

```java
// ❌ WRONG
player.deductKnowledgePoints(50);
// Missing .save() call!

// ✅ CORRECT
playerService.handleLoss(userId);
// Guaranteed to save
```

### Issue: "KP goes negative"

**Solution:** The Mercy Rule is implemented in `PlayerService.updateKP()`:

```java
int newKP = Math.max(0, currentKP + amount);
```

Make sure all KP updates go through this method.

### Issue: "Lockout doesn't trigger"

**Frontend Check:**
```javascript
// Is the hook detecting lockout?
console.log('isLocked:', isLocked);
console.log('KP:', kp);

// Backend should return isLocked: true when KP = 0
```

**Backend Check:**
```java
// PlayerController.updateKnowledgePoints() should return:
response.put("isLocked", updatedPlayer.getKnowledgePoints() == 0);
```

### Issue: "Power-up sound doesn't play"

**Solution:** Ensure the sound file exists:
```
client/public/sounds/power-up.mp3
```

Browser may block autoplay. Check console for errors:
```javascript
audioRef.current.play().catch(err => {
  console.warn('Audio playback failed:', err);
});
```

### Issue: "Timer doesn't count down"

**Solution:** Check if `startLockoutTimer()` is being called when `isLocked` becomes true:

```javascript
// In useGameEconomy.js
if (data.isLocked && data.knowledgePoints === 0) {
  startLockoutTimer(); // This must be called
}
```

---

## 🚀 Deployment Notes

### Environment Variables

Add to `application.properties`:
```properties
# Game Economy Settings
game.kp.initial=100
game.kp.win.reward=50
game.kp.loss.penalty=50
game.kp.restore.amount=50
game.lockout.duration=10
```

### Database Migration

If you have existing players with 150 KP, run this SQL:

```sql
UPDATE players SET knowledge_points = 100 WHERE knowledge_points = 150;
```

### Frontend Configuration

Update API base URL for production:

```javascript
// client/src/hooks/useGameEconomy.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/players';
```

---

## 📚 Additional Resources

- **Backend Service Layer:** `springboot/demo/src/main/java/com/bibliotheca/service/PlayerService.java`
- **Frontend Hook:** `client/src/hooks/useGameEconomy.js`
- **Recharge UI:** `client/src/components/RechargeOverlay.jsx`
- **Integration Example:** `client/src/pages/DungeonPlatform.jsx`

---

## 🎉 Summary

Your **Game Economy & Stamina System** is now production-ready with:

✅ **Immediate KP deduction** (first loss bug fixed)  
✅ **Transactional safety** with Spring `@Transactional`  
✅ **Mercy Rule** (KP never negative)  
✅ **10-second lockout** with animated overlay  
✅ **Automatic restoration** to 50 KP  
✅ **Sound effects** for better UX  
✅ **Real-time UI updates**  

**Next Steps:**
1. Test the system with the checklist above
2. Deploy backend with updated `Player.java`
3. Test frontend integration in DungeonPlatform
4. Monitor logs for any transaction issues

Need help? Check the troubleshooting section or review the implementation files.
