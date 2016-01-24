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

	suite('export', function() {
		var exported;
		suiteSetup(function() {
			exported = game.export();
		});
		test('should return an object without key for $el', function() {
			assert.isUndefined(exported['$el']);
		});
		test('should return an object without key for $body', function() {
			assert.isUndefined(exported['$body']);
		});
		test('should return an object without key for vent', function() {
			assert.isUndefined(exported['vent']);
		});
		test('should return an object', function() {
			assert.isObject(exported);
		});
		test('should return an array with 2 players', function() {
			assert.equal(exported.players.length, 2);
		});
		test('should return an object for deck', function() {
			assert.isObject(exported.deck);
		});
		test('should return a value of 0 for pointsOnTheLine', function() {
			assert.equal(exported.pointsOnTheLine, 0);
		});
	});
});