import Game from './classes/game';
import store from './modules/store';
import Preach from 'preach';
import './modules/nav';

/**
 * Create a single global event object that we'll share throughout the app.
 */
let vent = new Preach();

/**
 * Builds game options: loads game if one is set from storage
 * and creates a single global event management object to share
 * for the app.
 * 
 * @return {object} gameOptions
 */
var buildGameOptions = () => {
	return Object.assign(store.loadGame(), {
		vent
	});
};

/**
 * Setup the game
 */
var initGame = () => {
	let opts = buildGameOptions();
	let game = new Game(opts);

	//if we have a stored deck, render. Otherwise, wait until we've
	//created and loaded a new deck before rendering.
	if (opts.deck) {
		game.render();
	}
	vent.sub('appReady', () => game.render().showIntro());
};

initGame();