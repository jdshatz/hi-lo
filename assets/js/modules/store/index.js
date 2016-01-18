const storageKey = '3bl.hilo';
let store = {
	loadGame: function() {
		console.log('loadGame');
		let game = window.localStorage.getItem(storageKey);
		return game || {};
	},
	saveGame: function(data) {
		console.log('save game...');
	}
};
module.exports = store;