const storageKey = '3bl.hilo';
/**
 * Handles communication to and from local storage.
 */
let store = {

	/**
	 * Load game from local storage: expects game to be valid JSON
	 * @return {object}
	 */
	loadGame: function() {
		let game = window.localStorage.getItem(storageKey);
		return JSON.parse(game) || {};
	},

	/**
	 * Save entire game state to local storage.
	 * @param  {JSON} data
	 */
	saveGame: function(data) {
		window.localStorage.setItem(storageKey, data);
	},

	/**
	 * Kill all saved game data.
	 */
	clearGame: function() {
		window.localStorage.removeItem(storageKey);
	}
};
module.exports = store;