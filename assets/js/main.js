import Game from './classes/game';
import store from './modules/store';
import Preach from 'preach';

//setup game options
let vent = new Preach();
let gameOptions = store.loadGame();
Object.assign(gameOptions, {vent});

//create game
let game = new Game(gameOptions);
game.render();
console.log(game);

//temp debug flag:
window.DEBUG_hilo = game;