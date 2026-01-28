package com.bibliotheca.controller;

import com.bibliotheca.model.Player;
import com.bibliotheca.repository.PlayerRepository;
import com.bibliotheca.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/players")
@CrossOrigin(origins = "http://localhost:5173")
public class PlayerController {

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private PlayerService playerService;

    // Register a new player
    @PostMapping("/register")
    public ResponseEntity<?> registerPlayer(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (playerRepository.existsByUsername(username)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Username already exists"));
        }

        if (playerRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already exists"));
        }

        Player player = new Player(username, email, password);
        playerRepository.save(player);

        Map<String, Object> response = new HashMap<>();
        response.put("id", player.getId());
        response.put("username", player.getUsername());
        response.put("email", player.getEmail());
        response.put("knowledgePoints", player.getKnowledgePoints());
        response.put("unlockedBooks", player.getUnlockedBooks());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Login - Accept either email or username
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String usernameOrEmail = credentials.get("username");
        String password = credentials.get("password");

        // Try to find by username first, then by email
        Optional<Player> playerOpt = playerRepository.findByUsername(usernameOrEmail);
        
        if (playerOpt.isEmpty()) {
            // If not found by username, try email
            playerOpt = playerRepository.findByEmail(usernameOrEmail);
        }

        if (playerOpt.isEmpty() || !playerOpt.get().getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
        }

        Player player = playerOpt.get();
        Map<String, Object> response = new HashMap<>();
        response.put("id", player.getId());
        response.put("username", player.getUsername());
        response.put("email", player.getEmail());
        response.put("knowledgePoints", player.getKnowledgePoints());
        response.put("unlockedBooks", player.getUnlockedBooks());

        return ResponseEntity.ok(response);
    }

    // Get player profile
    @GetMapping("/{id}")
    public ResponseEntity<?> getPlayer(@PathVariable Long id) {
        Optional<Player> playerOpt = playerRepository.findById(id);

        if (playerOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Player not found"));
        }

        Player player = playerOpt.get();
        Map<String, Object> response = new HashMap<>();
        response.put("id", player.getId());
        response.put("username", player.getUsername());
        response.put("email", player.getEmail());
        response.put("knowledgePoints", player.getKnowledgePoints());
        response.put("unlockedBooks", player.getUnlockedBooks());

        return ResponseEntity.ok(response);
    }

    /**
     * NEW ENDPOINT: Update Knowledge Points (Production-Ready)
     * Handles both additions and deductions with transaction safety
     * POST /api/players/{id}/kp
     * Body: { "amount": 50 } or { "amount": -50 }
     */
    @PostMapping("/{id}/kp")
    public ResponseEntity<?> updateKnowledgePoints(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        try {
            Integer amount = request.get("amount");
            Player updatedPlayer = playerService.updateKP(id, amount);

            Map<String, Object> response = new HashMap<>();
            response.put("id", updatedPlayer.getId());
            response.put("username", updatedPlayer.getUsername());
            response.put("knowledgePoints", updatedPlayer.getKnowledgePoints());
            response.put("isLocked", updatedPlayer.getKnowledgePoints() == 0);
            response.put("lockoutSeconds", playerService.getRemainingLockoutTime(updatedPlayer));
            response.put("message", amount > 0 ? "KP increased" : "KP deducted");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * NEW ENDPOINT: Restore Energy After Lockout
     * Sets KP to 50 after the 10-second recharge period
     * POST /api/players/{id}/restore
     */
    @PostMapping("/{id}/restore")
    public ResponseEntity<?> restoreEnergy(@PathVariable Long id) {
        try {
            Player restoredPlayer = playerService.restoreEnergy(id);

            Map<String, Object> response = new HashMap<>();
            response.put("id", restoredPlayer.getId());
            response.put("username", restoredPlayer.getUsername());
            response.put("knowledgePoints", restoredPlayer.getKnowledgePoints());
            response.put("isLocked", false);
            response.put("message", "Energy restored! Neural link recharged to 50 KP");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Unlock a book (after dungeon win) - Award +50 KP
    @PostMapping("/{id}/unlock-book")
    public ResponseEntity<?> unlockBook(@PathVariable Long id, @RequestBody Map<String, Long> request) {
        Optional<Player> playerOpt = playerRepository.findById(id);

        if (playerOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Player not found"));
        }

        Player player = playerOpt.get();
        Long bookId = request.get("bookId");
        
        // Check if player has minimum KP to play
        if (!playerService.canPlay(id)) {
            long cooldown = playerService.getRemainingLockoutTime(player);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                        "error", "Insufficient Knowledge Points",
                        "message", "You need at least 50 KP to enter the dungeon",
                        "currentKP", player.getKnowledgePoints(),
                        "cooldownSeconds", cooldown
                    ));
        }
        
        player.addUnlockedBook(bookId);
        
        // Use service layer for KP transaction
        player = playerService.handleWin(id);

        Map<String, Object> response = new HashMap<>();
        response.put("id", player.getId());
        response.put("username", player.getUsername());
        response.put("knowledgePoints", player.getKnowledgePoints());
        response.put("unlockedBooks", player.getUnlockedBooks());
        response.put("message", "Book unlocked successfully! +50 KP");

        return ResponseEntity.ok(response);
    }

    // Dungeon failure - Deduct 50 KP (FIXED VERSION)
    @PostMapping("/{id}/dungeon-failed")
    public ResponseEntity<?> dungeonFailed(@PathVariable Long id) {
        try {
            // Use service layer to ensure immediate deduction
            Player player = playerService.handleLoss(id);

            Map<String, Object> response = new HashMap<>();
            response.put("id", player.getId());
            response.put("username", player.getUsername());
            response.put("knowledgePoints", player.getKnowledgePoints());
            response.put("isLocked", player.getKnowledgePoints() == 0);
            response.put("lockoutSeconds", playerService.getRemainingLockoutTime(player));
            response.put("message", "Dungeon failed! -50 KP");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Check if player can play and get status
    @GetMapping("/{id}/can-play")
    public ResponseEntity<?> canPlay(@PathVariable Long id) {
        try {
            Player player = playerService.getPlayerStatus(id);

            Map<String, Object> response = new HashMap<>();
            response.put("canPlay", playerService.canPlay(id));
            response.put("knowledgePoints", player.getKnowledgePoints());
            response.put("lockoutSeconds", playerService.getRemainingLockoutTime(player));
            response.put("minimumRequired", 50);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Update KP manually (for other actions) - DEPRECATED, use /kp endpoint
    @PostMapping("/{id}/add-kp")
    public ResponseEntity<?> addKnowledgePoints(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        Optional<Player> playerOpt = playerRepository.findById(id);

        if (playerOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Player not found"));
        }

        Player player = playerOpt.get();
        Integer points = request.get("points");
        
        player.addKnowledgePoints(points);
        playerRepository.save(player);

        Map<String, Object> response = new HashMap<>();
        response.put("knowledgePoints", player.getKnowledgePoints());
        response.put("message", "Added " + points + " KP");

        return ResponseEntity.ok(response);
    }
    
    // 🎁 ========================================
    // DAILY SUPPLY DROP ENDPOINTS (24-Hour Reward)
    // 🎁 ========================================
    
    /**
     * Get daily reward status
     * GET /api/players/{id}/daily-reward/status
     * Returns: { isReady, remainingSeconds, nextClaimTime, rewardAmount, lastClaimed }
     */
    @GetMapping("/{id}/daily-reward/status")
    public ResponseEntity<?> getDailyRewardStatus(@PathVariable Long id) {
        try {
            Map<String, Object> status = playerService.getDailyRewardStatus(id);
            return ResponseEntity.ok(status);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Claim daily reward (+100 KP)
     * POST /api/players/{id}/daily-reward/claim
     * Returns updated player data with new KP or error if on cooldown
     */
    @PostMapping("/{id}/daily-reward/claim")
    public ResponseEntity<?> claimDailyReward(@PathVariable Long id) {
        try {
            Player player = playerService.claimDailyReward(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", player.getId());
            response.put("username", player.getUsername());
            response.put("knowledgePoints", player.getKnowledgePoints());
            response.put("message", "Daily reward claimed! +100 KP");
            response.put("rewardAmount", 100);
            response.put("nextClaimTime", player.getLastDailyRewardClaimed().plusHours(24));
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            String errorMessage = e.getMessage();
            
            if (errorMessage.startsWith("COOLDOWN_ACTIVE")) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(Map.of(
                            "error", "COOLDOWN_ACTIVE",
                            "message", errorMessage.substring("COOLDOWN_ACTIVE: ".length())
                        ));
            }
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", errorMessage));
        }
    }
    
    // 📚 ========================================
    // PERSISTENT BOOK UNLOCK ENDPOINTS
    // 📚 ========================================
    
    /**
     * Complete a dungeon level - Awards KP and unlocks book on first-time win
     * POST /api/players/{id}/complete-level
     * Body: { "bookId": 1, "isWin": true }
     * Returns: { newKp, unlockedBookIds, firstTimeUnlock, kpChange, isLocked, remainingLockoutTime }
     */
    @PostMapping("/{id}/complete-level")
    public ResponseEntity<?> completeLevel(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Long bookId = Long.valueOf(request.get("bookId").toString());
            Boolean isWin = (Boolean) request.get("isWin");
            
            Map<String, Object> result = playerService.completeLevel(id, bookId, isWin);
            
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get all unlocked books for a player
     * GET /api/players/{id}/unlocked-books
     * Returns: [1, 3, 5, 7] (array of book IDs)
     */
    @GetMapping("/{id}/unlocked-books")
    public ResponseEntity<?> getUnlockedBooks(@PathVariable Long id) {
        try {
            java.util.Set<Long> unlockedBooks = playerService.getUnlockedBooks(id);
            return ResponseEntity.ok(unlockedBooks);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
