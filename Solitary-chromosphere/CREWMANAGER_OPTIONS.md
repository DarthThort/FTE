# CrewManager Refactoring Options

## Current State
- **CrewManager.js**: 359 lines (updated from 438 - already had some debug code removed)

## Proposed Split
1. **Pathfinding.js** (~100 lines) - A* algorithm, pathfinding utilities
2. **CrewAI.js** (~150 lines) - AI behavior, state machine
3. **CrewManager.js** (~110 lines) - Coordinator, hiring, management

## Options

### OPTION A: Automated
**Pros:**
- Fast
- Less work for you
- Files are small enough (~100-150 lines) that corruption risk is lower

**Cons:**
- Still some risk of file corruption
- If it fails, have to revert and go manual

### OPTION B: Manual (Same as ShipRenderer)
**Pros:**
- 100% safe, no corruption risk
- You have full control
- Proven approach (worked for ShipRenderer)

**Cons:**  
- More time consuming
- Manual copy-paste work

## Recommendation
Given that:
- ShipRenderer manual approach worked perfectly
- CrewManager is already smaller (359 lines vs 1211)
- Resulting files will be ~100-150 lines (very manageable)

**I recommend: OPTION B (Manual)** for consistency and safety.

What do you prefer?
