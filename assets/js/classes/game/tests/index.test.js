import Game from '../index.js';
import Preach from 'preach';
import sinon from 'sinon';

suite('Game', function() {
	var game, vent;
	suiteSetup(function() {
		vent = new Preach();
		game = new Game({
			vent: vent
		});
	});

	suite('constructor', function() {
		test('should assign vent', function() {
			assert.deepEqual(game.vent, vent);
		});
	});
});