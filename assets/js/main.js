import $ from 'jquery';
import Game from './classes/game';
import store from './modules/store';
import Preach from 'preach';
import nav from './modules/nav';

//setup game options.
//create a single vent object to share around app for event management.
let vent = new Preach();
let gameOptions = store.loadGame();
Object.assign(gameOptions, {
	vent
});

//create game
let game = new Game(gameOptions);
game.render();

//debug info:
if (window.location.href.indexOf('debug') !== -1) {
	window.DEBUG_HILO = game;
}

$(function() {
	nav.init();
});