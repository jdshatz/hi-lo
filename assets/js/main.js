import store from './modules/store';
import Game from './classes/game';
import EventEmitter from 'events';

//pub/sub via preach.
//https://github.com/zeusdeux/preach
var Preach = require('preach');
var vent = new Preach();

vent.sub('foobar', function(a){
	console.log('got it! ' + a);
});
vent.sub('bar', function(a){
	console.log('*******bar! ' + a);
});
let existingGame = store.loadGame();
let game = new Game(vent, existingGame);
game.render();
console.log(game);


//temp debug flag:
window.DEBUG_hilo = game;