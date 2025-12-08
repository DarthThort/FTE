# ShipRenderer Refactoring - Manual Guide

## Overview
This guide will help you safely split ShipRenderer.js (1210 lines) into 6 smaller, focused modules.

**IMPORTANT**: This is a manual process to avoid file corruption. Follow steps carefully.

---

## Step 1: Analyze Current Structure

First, let's understand what ShipRenderer does:

```javascript
// Current ShipRenderer.js structure (~1210 lines)
class ShipRenderer {
    constructor()           // Lines ~1-19
    initFog()              // Lines ~21-31
    computeVisibility()    // Lines ~33-52
    hasLineOfSight()       // Lines ~54-75
    render()               // Main render loop ~77-200+
    
    // Tile rendering methods (scattered throughout)
    // Crew rendering methods  
    // System rendering methods
    // Effects rendering
    // UI overlays (health bars, tooltips)
}
```

---

## Step 2: Create New Module Files

Create these 6 new files in `js/rendering/`:

### Files to Create:
1. `TileRenderer.js` - Tile, wall, floor, door rendering
2. `CrewRenderer.js` - Crew visualization
3. `SystemRenderer.js` - System/module rendering
4. `EffectsRenderer.js` - Weapon effects, particles
5. `UIOverlayRenderer.js` - Health bars, tooltips, overlays
6. `ShipRenderer.js` (refactored) - Main coordinator

---

## Step 3: Extract Methods - Manual Process

I'm analyzing the file now to identify which methods go where.

**NEXT STEPS** (wait for my analysis):
1. I'll provide the exact code for each new file
2. You copy-paste into new files
3. I'll provide updated ShipRenderer.js coordinator code
4. You update index.html with new script tags
5. Test thoroughly

**Status**: Analyzing ShipRenderer.js structure...
