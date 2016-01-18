import Deck from '../index.js';
import Preach from 'preach';

suite('Deck', function() {
	var deck;
	suiteSetup(function(){
		deck = new Deck({
			vent: new Preach()
		});
	});
    test('- buildShuffleUrl - should return correct url', function() {
        assert.equal(deck.buildShuffleUrl('foo'), 'http://deckofcardsapi.com/api/deck/foo/shuffle/');
    });
});