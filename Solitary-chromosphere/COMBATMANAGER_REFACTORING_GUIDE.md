# CombatManager Refactoring Guide - Complete Manual Instructions

## ✅ Completed
- ✅ `js/combat/DamageCalculator.js` created (184 lines)
- ✅ `js/combat/CombatRewards.js` created (88 lines)
- ✅ `js/combat/CombatAI.js` created (144 lines)

**Total extracted**: ~416 lines

---

## 📝 Manual Steps Required

### STEP 1: Update CombatManager Constructor

**Location**: `js/game/CombatManager.js`, lines 8-33

**FIND:**
```javascript
class CombatManager {
    constructor(gameState, enemyShip) {
        this.state = gameState;
        this.enemy = enemyShip;

        // Combat state
        this.active = false;
        this.paused = false;
        this.started = false;

        // Targeting
        this.playerTarget = null; // Enemy system being targeted
        this.enemyTarget = null; // Player system being targeted

        // AI
        this.aiDecisionCooldown = 0;
        this.aiDecisionInterval = 2.0; // AI makes decisions every 2 seconds

        // Combat results
        this.victor = null;
        this.rewards = null;

        // Escape cooldown
        this.lastEscapeAttempt = 0;
        this.escapeCooldownBase = 10.0; // 10 seconds base
    }
```

**REPLACE WITH:**
```javascript
class CombatManager {
    constructor(gameState, enemyShip) {
        this.state = gameState;
        this.enemy = enemyShip;

        // Combat modules
        this.damageCalculator = new DamageCalculator(gameState);
        this.combatAI = new CombatAI(gameState, enemyShip);
        this.combatRewards = new CombatRewards(gameState);

        // Combat state
        this.active = false;
        this.paused = false;
        this.started = false;

        // Targeting
        this.playerTarget = null; // Enemy system being targeted
        this.enemyTarget = null; // Player system being targeted

        // Combat results
        this.victor = null;
        this.rewards = null;

        // Escape cooldown
        this.lastEscapeAttempt = 0;
        this.escapeCooldownBase = 10.0; // 10 seconds base
    }
```

---

### STEP 2: Update tickEnemyAI Method

**Location**: Lines ~110-117

**FIND:**
```javascript
    tickEnemyAI(dt) {
        this.aiDecisionCooldown -= dt;

        if (this.aiDecisionCooldown <= 0) {
            this.aiDecisionCooldown = this.aiDecisionInterval;
            this.makeAIDecision();
        }
    }
```

**REPLACE WITH:**
```javascript
    tickEnemyAI(dt) {
        this.combatAI.update(dt);
        
        const decision = this.combatAI.makeDecision();
        
        if (decision.flee) {
            this.attemptEnemyFlee();
        } else if (decision.surrender) {
            this.enemySurrender();
        } else if (decision.target) {
            this.enemyTarget = decision.target;
        }
    }
```

---

### STEP 3: Delete Old AI Methods

**DELETE these methods entirely:**

1. **makeAIDecision()** (lines ~122-146)
2. **selectEnemyTarget()** (lines ~148-200+)

**TOTAL**: ~80 lines deleted

---

### STEP 4: Update Damage Application

**Location**: In `firePlayerWeapon` and `fireEnemyWeapon` methods

**Find all instances of damage calculation code** (lines ~250-395 in firePlayerWeapon)

**This is the COMPLEX part** - Replace the massive damage calculation block with:

```javascript
// Apply damage using damage calculator
const result = this.damageCalculator.applyWeaponDamage(
    weapon,
    weaponModule,
    target,
    this.state.ship
);
```

**IMPORTANT**: The original code is ~150 lines of complex damage logic. Replace ALL of it with the single call above.

**Location hints:**
- Look for the comment "// Check if shields block (for player ship)"
- Starts around line 258
- Ends around line 395
- Contains shield damage, hull damage, evasion, breach creation, etc.

---

### STEP 5: Update Rewards Calculation

**Location**: Line ~661 (calculateRewards method)

**FIND:**
```javascript
    calculateRewards(fullRewards) {
        const base = {
            credits: this.enemy.creditReward,
            scrap: this.enemy.scrapValue,
            systems: []
        };

        if (!fullRewards) {
            // Partial rewards for flee
            base.credits = Math.floor(base.credits * 0.3);
            base.scrap = Math.floor(base.scrap * 0.3);
        } else {
            // Chance for system salvage (10%)
            if (Math.random() < 0.1) {
                const salvageableSystem = this.enemy.systems.find(s => !s.offline);
                if (salvageableSystem) {
                    base.systems.push({
                        type: salvageableSystem.type,
                        name: `Salvaged ${salvageableSystem.name}`,
                        level: salvageableSystem.level
                    });
                }
            }
        }

        return base;
    }
```

**REPLACE WITH:**
```javascript
    calculateRewards(fullRewards) {
        return this.combatRewards.calculateRewards(this.enemy, fullRewards);
    }
```

---

### STEP 6: Update Apply Rewards

**Location**: Line ~712 (applyRewards method)

**FIND entire method** (lines ~712-745, ~34 lines)

**REPLACE WITH:**
```javascript
    applyRewards() {
        this.combatRewards.applyRewards(this.rewards);
    }
```

---

### STEP 7: Update Flee/Surrender Methods

**attemptEnemyFlee()** - Line ~614

**FIND:**
```javascript
    attemptEnemyFlee() {
        const fleeChance = 0.6; // 60% base chance

        if (Math.random() < fleeChance) {
            console.log(`${this.enemy.name} has fled!`);
            this.victor = 'player';
            this.rewards = this.calculateRewards(false); // Partial rewards for flee
            this.endCombat();
        } else {
            console.log(`${this.enemy.name} failed to flee!`);
            this.enemy.aiState = 'defensive';
        }
    }
```

**REPLACE WITH:**
```javascript
    attemptEnemyFlee() {
        if (this.combatAI.attemptFlee()) {
            this.victor = 'player';
            this.rewards = this.calculateRewards(false);
            this.endCombat();
        }
    }
```

**enemySurrender()** - Line ~631

**FIND:**
```javascript
    enemySurrender() {
        console.log(`${this.enemy.name} surrenders!`);
        this.victor = 'player';
        this.rewards = this.calculateRewards(true); // Full rewards + bonus
        this.endCombat();
    }
```

**REPLACE WITH:**
```javascript
    enemySurrender() {
        this.combatAI.surrender();
        this.victor = 'player';
        this.rewards = this.calculateRewards(true);
        this.endCombat();
    }
```

---

### STEP 8: Update index.html

**Location**: `index.html`, before CombatManager.js

**FIND:**
```html
<script src="js/game/CombatManager.js"></script>
```

**ADD BEFORE IT:**
```html
<!-- Combat Modules -->
<script src="js/combat/DamageCalculator.js"></script>
<script src="js/combat/CombatAI.js"></script>
<script src="js/combat/CombatRewards.js"></script>
```

---

## 📊 Expected Result

**Before**: 767 lines

**After**: ~320 lines (447 lines removed!)

**New Modules**:
- DamageCalculator.js: 184 lines
- CombatAI.js: 144 lines
- CombatRewards.js: 88 lines

---

## 🧪 Testing Checklist

1. ✅ Game loads without errors
2. ✅ Combat starts correctly
3. ✅ Player weapons fire and deal damage
4. ✅ Enemy weapons fire and deal damage
5. ✅ Shields absorb damage correctly
6. ✅ Evasion works
7. ✅ Breaches created on damage
8. ✅ Enemy AI targets systems
9. ✅ Enemy can flee/surrender
10. ✅ Rewards applied correctly
11. ✅ Combat ends properly

---

## ⚠️ CRITICAL NOTES

- **Step 4 is the most complex** - You're replacing ~150 lines of damage code
- **Take your time** - This is intricate logic
- **Test after each major change** - Don't do everything at once
- **Git commit frequently** - So you can revert if needed

---

## 🚨 If Something Breaks

```bash
# Revert to last good state
git checkout js/game/CombatManager.js
git checkout index.html

# Then follow steps more carefully
```

---

## ✅ After Successful Testing

```bash
git add -A
git commit -m "REFACTOR: Split CombatManager into modules (767 → 320 lines)"
```
