// PATCH: Add these 3 lines after line 36 in SceneManager.js
// Right after: } else if (this.currentScene === 'COMBAT') {
// And before: if (this.game.state.combatManager) {

// UPDATE CREW AI IN COMBAT TOO! Critical for repairs during combat
this.game.state.updateCrewAI();

