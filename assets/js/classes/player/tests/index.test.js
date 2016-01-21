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
});