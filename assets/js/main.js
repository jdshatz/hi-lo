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

//temp debug flag:
window.DEBUG_hilo = game;

$(function() {
	nav.init();
});