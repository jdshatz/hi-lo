const storageKey = '3bl.hilo';
/**
 * Handles communication to and from local storage.
 */
let store = {
	loadGame: function() {
		let game = window.localStorage.getItem(storageKey);
		return JSON.parse(game) || {};
	},
	saveGame: function(data) {
		window.localStorage.setItem(storageKey, data);
	},
	clearGame: function() {
		window.localStorage.removeItem(storageKey);
	}
};
module.exports = store;