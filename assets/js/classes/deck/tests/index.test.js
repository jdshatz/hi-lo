import Deck from '../index.js';
import Preach from 'preach';

suite('Deck', function() {
	var deck;
	suiteSetup(function() {
		deck = new Deck({
			vent: new Preach()
		});
	});
	suite('getDrawUrl', function() {
		test('should return correct url', function() {
			assert.equal(deck.getDrawUrl('foo'), 'http://deckofcardsapi.com/api/deck/foo/draw/?count=1');
		});
	});
});