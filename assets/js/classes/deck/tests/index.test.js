import Deck from '../index.js';
import Preach from 'preach';

suite('Deck', function() {
	var deck;
	suiteSetup(function(){
		deck = new Deck({
			vent: new Preach()
		});
	});
    test('- getShuffleUrl - should return correct url', function() {
        assert.equal(deck.getShuffleUrl('foo'), 'http://deckofcardsapi.com/api/deck/foo/shuffle/');
    });
});