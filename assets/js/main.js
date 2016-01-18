import $ from 'jquery';
import Game from './classes/game';
import store from './modules/store';
import Preach from 'preach';
import vex from './plugins/vex';

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
console.log(game);

//temp debug flag:
window.DEBUG_hilo = game;

$(function() {
	$('.new-game').on('click', function(event) {
		event.preventDefault();
		vex.dialog.confirm({
			message: 'Are you sure you want to start a new game? This will erase your current game.',
			callback: function(value) {
				console.log(value);
			}
		});
	});
});