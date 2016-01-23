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


	suite('convertValue', function() {
		let data;
		suiteSetup(function() {
			data = [{
				input: "JACK",
				result: 11
			}, {
				input: "2",
				result: 2
			}, {
				input: "aCe",
				result: 14
			}];
		});

		test('should return correct values for inputs', function() {
			data.forEach(function(item) {
				assert.equal(deck.convertValue(item.input), item.result);
			});
		});
	});

	suite('convertSuitToNumber', function() {
		let data;
		suiteSetup(function() {
			data = [{
				input: "hearts",
				result: 2
			}, {
				input: "SPades",
				result: 3
			}, {
				input: "clubs",
				result: 0
			}, {
				input: "diamoNds",
				result: 1
			}, {
				input: "foo",
				result: 3
			}];
		});

		test('should return correct values for inputs', function() {
			data.forEach(function(item) {
				assert.equal(deck.convertSuitToNumber(item.input), item.result);
			});
		});
	});

	suite('unpack', function() {
		var deck2, dummyVals;
		suiteSetup(function() {
			dummyVals = {
				remaining: 17,
				id: 123, 
				activeCard: 'foo'
			};
			deck2 = new Deck({
				vent: new Preach()
			});
			deck2.unpack(dummyVals);
		});
		test('should correctly set remaining', function() {
			assert.equal(deck2.remaining, dummyVals.remaining);
		});
		test('should correctly set id', function() {
			assert.equal(deck2.id, dummyVals.id);
		});
		test('should correctly set activeCard', function() {
			assert.equal(deck2.activeCard, dummyVals.activeCard);
		});
	});

	suite('export', function() {
		var exported;
		suiteSetup(function() {
			exported = deck.export();
		});
		test('should return an object without key for $el', function() {
			assert.isUndefined(exported['$el']);
		});
		test('should return an object without key for vent', function() {
			assert.isUndefined(exported['vent']);
		});
		test('should return an object', function() {
			assert.isObject(exported);
		});
	});
});