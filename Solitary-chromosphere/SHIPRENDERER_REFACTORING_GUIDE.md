# ShipRenderer Refactoring Guide - Complete Instructions

## ✅ Completed
- ✅ `js/rendering/TileRenderer.js` created (214 lines)
- ✅ `js/rendering/CrewUIRenderer.js` created (135 lines)

## 📝 Manual Steps Required

### STEP 1: Update ShipRenderer.js Constructor

**Location**: `js/game/ShipRenderer.js`, after line 18 (after `this.hazardRenderer = null;`)

**ADD these two lines:**
```javascript
        // Rendering modules
        this.tileRenderer = new TileRenderer(gameEngine);
        this.crewUIRenderer = new CrewUIRenderer(gameEngine);
```

**Result**: Constructor should now initialize the new renderer modules.

---

### STEP 2: Update render() Method Calls

**Location**: `js/game/ShipRenderer.js`, in the `render()` method

#### Change 1 - Line 104
**FIND:**
```javascript
        this.drawGrid(ctx, layout, ship.systems);
```

**REPLACE WITH:**
```javascript
        this.tileRenderer.render(ctx, layout, ship.systems);
```

#### Change 2 - Line 108
**FIND:**
```javascript
        this.drawCrew(ctx, ship);
```

**REPLACE WITH:**
```javascript
        this.crewUIRenderer.drawCrew(ctx, ship, this.visible);
```

#### Change 3 - Line 130
**FIND:**
```javascript
        this.drawFog(ctx, layout);
```

**REPLACE WITH:**
```javascript
        this.crewUIRenderer.drawFog(ctx, layout, this.visible);
```

---

### STEP 3: Delete Old Methods from ShipRenderer.js

**These methods are now in the new modules and should be DELETED from ShipRenderer.js:**

#### Delete Method 1: drawGrid()
**Location**: Lines 139-269 (approximately 130 lines)
**START**: `drawGrid(ctx, layout, systems) {`
**END**: Closing `}` of the method (after the systems loop)

#### Delete Method 2: drawCrew()
**Location**: Lines 271-331 (approximately 60 lines)
**START**: `drawCrew(ctx, ship) {`
**END**: Closing `}` of the method

#### Delete Method 3: getCrewColor()
**Location**: Lines 333-341 (approximately 9 lines)
**START**: `getCrewColor(role) {`
**END**: Closing `}` of the method

#### Delete Method 4: drawFog()
**Location**: Lines 343-361 (approximately 19 lines)
**START**: `drawFog(ctx, layout) {`
**END**: Closing `}` of the method

**TOTAL DELETED**: ~218 lines

**RESULT**: ShipRenderer.js should go from 1211 lines → ~993 lines

---

### STEP 4: Update index.html

**Location**: `index.html`, in the `<script>` section

**FIND** the line that loads ShipRenderer.js (should be around line 35-40):
```html
<script src="js/game/ShipRenderer.js"></script>
```

**ADD BEFORE IT** (these must load FIRST):
```html
<!-- Rendering Modules -->
<script src="js/rendering/TileRenderer.js"></script>
<script src="js/rendering/CrewUIRenderer.js"></script>
```

**Final result should look like:**
```html
<!-- Rendering Modules -->
<script src="js/rendering/TileRenderer.js"></script>
<script src="js/rendering/CrewUIRenderer.js"></script>
<script src="js/game/ShipRenderer.js"></script>
```

---

## 🧪 Testing Checklist

After making all changes:

1. ✅ **Game loads without errors** - Check browser console (F12)
2. ✅ **Ship tiles render correctly** - Walls, floors, doors visible
3. ✅ **Systems render correctly** - Weapon, shield, engine slots visible
4. ✅ **Crew render correctly** - Colored circles with names
5. ✅ **Fog of war works** - Non-visible areas are dark
6. ✅ **Repair indicators work** - "REPAIRING" text + progress bar shows

---

## 🚨 Common Issues

### Issue: "TileRenderer is not defined"
**Solution**: Make sure TileRenderer.js is loaded BEFORE ShipRenderer.js in index.html

### Issue: "CrewUIRenderer is not defined"  
**Solution**: Make sure CrewUIRenderer.js is loaded BEFORE ShipRenderer.js in index.html

### Issue: Crew not rendering
**Solution**: Make sure you're passing `this.visible` as the 3rd parameter: 
```javascript
this.crewUIRenderer.drawCrew(ctx, ship, this.visible);
```

### Issue: Tiles not rendering
**Solution**: Make sure you're passing `ship.systems` as the 3rd parameter:
```javascript
this.tileRenderer.render(ctx, layout, ship.systems);
```

---

## 📊 File Size Comparison

**Before Refactoring:**
- ShipRenderer.js: 1211 lines

**After Refactoring:**
- ShipRenderer.js: ~993 lines ✅ (218 lines removed)
- TileRenderer.js: 214 lines (NEW)
- CrewUIRenderer.js: 135 lines (NEW)

**Total**: Same functionality, better organized, smaller individual files!

---

## ✅ After Successful Testing

Once everything works:
```bash
git add -A
git commit -m "Refactor ShipRenderer - split into TileRenderer and CrewUIRenderer modules"
```

---

## 🎯 Next Steps

After this refactoring is complete and tested:
1. CrewManager refactoring (split into 3 files)
2. CombatManager refactoring (split into 4 files)
3. GameState refactoring (split into 5 files) - LAST, most complex

Each will be smaller files (~150-300 lines) that the tool can edit without corruption!
