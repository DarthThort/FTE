# CombatManager Refactoring - Strategy Decision

## Current Analysis

**CombatManager.js**: 767 lines - VERY COMPLEX

Contains:
- Combat orchestration and state management
- AI decision making and targeting  
- Weapon firing and damage calculations (~200 lines of complex logic)
- Shield/armor penetration, evasion, burn effects
- Hull breach creation
- Escape mechanics
- Combat end and rewards
- Enemy AI

## Options

### Option A: Simple Refactoring (~20-30 min)
Extract ONLY damage calculation logic to reduce size modestly

**Create:**
- `DamageCalculator.js` (~150 lines)

**Result:** CombatManager: 767 → ~620 lines

### Option B: Full Refactoring (~60-90 min)  
Complete modularization as originally planned

**Create:**
- `DamageCalculator.js`
- `TargetingSystem.js`
- `CombatAI.js`
- `CombatRewards.js`

**Result:** Combat Manager: 767 → ~300 lines

### Option C: Skip for Now
- CombatManager works fine as-is
- Focus energy on what's already done
- Can revisit in future session 

## Recommendation

**Option A** - Extract damage calculator only
- Meaningful size reduction
- Lower risk
- Reasonable time investment
- Still a win

What do you prefer?
