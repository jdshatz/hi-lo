import Player from '../index.js';
import Preach from 'preach';
import sinon from 'sinon';

suite('Player', function() {
	var player, vent;
	suiteSetup(function() {
		vent = new Preach();
		player = new Player({
			vent: vent
		});
	});

	suite('constructor', function() {
		test('should assign vent', function() {
			assert.deepEqual(player.vent, vent);
		});
	});

	suite('toggle', function() {
		var initialActiveState;
		suiteSetup(function() {
			initialActiveState = player.active;
			sinon.spy(player, 'toggleActiveClasses');
			player.toggle();
		});

		test('should reverse "active" value', function() {
			assert.isTrue(player.active === !initialActiveState);
		});
		test('should call toggleActiveClasses once', function() {
			assert.isTrue(player.toggleActiveClasses.calledOnce);
		});

		suiteTeardown(function() {
			player.toggleActiveClasses.restore();
		});
	});

	suite('switchRole', function() {
		var initialRole;
		suiteSetup(function() {
			initialRole = player.role;
			player.switchRole();
		});

		test('should change "role" value', function() {
			assert.isTrue(player.role !== initialRole);
		});

		suiteTeardown(function() {
			player.switchRole();
		});
	});

	suite('export', function() {
		var exported;
		suiteSetup(function() {
			exported = player.export();
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
		test('should return a score of 0', function() {
			assert.equal(exported.score, 0);
		});
		test('should return a guessCount of 0', function() {
			assert.equal(exported.guessCount, 0);
		});
	});
});