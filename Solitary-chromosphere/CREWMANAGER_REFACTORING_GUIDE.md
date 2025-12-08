# CrewManager Refactoring Guide - Manual Instructions

## Status
⚠️ **Automated refactoring FAILED** - Tool corrupted the file
✅ **Reverted to safe state** - File restored
✅ **Pathfinding.js created** - Ready to use

---

## What We Have
- ✅ `js/crew/Pathfinding.js` created (149 lines) - Contains all pathfinding methods

## What You Need to Do

### STEP 1: Update CrewManager Constructor

**Location**: `js/game/CrewManager.js`, lines 1-4

**FIND:**
```javascript
class CrewManager {
    constructor(gameState) {
        this.state = gameState;
    }
```

**REPLACE WITH:**
```javascript
class CrewManager {
    constructor(gameState) {
        this.state = gameState;
        this.pathfinding = new Pathfinding(gameState);
    }
```

---

### STEP 2: Update findPath and smoothPath Calls

**Location**: `js/game/CrewManager.js`, lines 141-142 (in `updateCrewAI` method)

**FIND:**
```javascript
                let path = this.findPath(startX, startY, targetX, targetY);
                path = this.smoothPath(path);
```

**REPLACE WITH:**
```javascript
                let path = this.pathfinding.findPath(startX, startY, targetX, targetY);
                path = this.pathfinding.smoothPath(path);
```

---

### STEP 3: Update isWalkable Call

**Location**: `js/game/CrewManager.js`, line 309 (in `getRandomWalkablePosition` method)

**FIND:**
```javascript
                if (this.isWalkable(x, y)) {
```

**REPLACE WITH:**
```javascript
                if (this.pathfinding.isWalkable(x, y)) {
```

---

### STEP 4: Delete Old Pathfinding Methods

**DELETE lines 320-437** (entire pathfinding section):

Methods to delete:
- `smoothPath()` (lines 320-346)
- `findPath()` (lines 348-413)
- `heuristic()` (lines 415-417)
- `isWalkable()` (lines 419-425)
- `reconstructPath()` (lines 427-437)

**TOTAL**: 118 lines deleted

---

### STEP 5: Update index.html

**Location**: `index.html`, find where CrewManager.js is loaded

**FIND:**
```html
<script src="js/game/CrewManager.js"></script>
```

**ADD BEFORE IT:**
```html
<!-- Crew Modules -->
<script src="js/crew/Pathfinding.js"></script>
```

**Final result:**
```html
<!-- Crew Modules -->
<script src="js/crew/Pathfinding.js"></script>
<script src="js/game/CrewManager.js"></script>
```

---

## Expected Result

**Before:**
- CrewManager.js: 439 lines

**After:**
- CrewManager.js: ~321 lines (118 lines removed)
- Pathfinding.js: 149 lines (NEW)

---

## Testing Checklist

1. ✅ Game loads without errors
2. ✅ Crew pathfinding works (crew moves around ship)
3. ✅ Crew can navigate through doors
4. ✅ Crew can be assigned to systems
5. ✅ Crew wander behavior works
6. ✅ Crew breach repair works

---

## After Testing

Once everything works:
```bash
git add -A
git commit -m "Refactor CrewManager - extract Pathfinding module (439 → 321 lines)"
```

---

## Next Steps

After CrewManager is complete:
1. CombatManager refactoring (766 lines → 4 files)
2. GameState refactoring (1152 lines → 5 files) - LAST, most complex
