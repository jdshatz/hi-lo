import $ from 'jquery';
const API_URL = 'http://deckofcardsapi.com/';
const CREATE_URL = API_URL + 'api/deck/new/shuffle/?deck_count=1';

class Deck {
	constructor(opts) {
		this.vent = opts.vent;
		if (opts.id) {
			this.get(opts.id);
		} else {
			this.create();
		}
	}
	get(id) {
		//TODO
	}
	create() {
		var self = this;
		$.when($.ajax(CREATE_URL))
			.then(function(data, textStatus, jqXHR) {
				if (data.success) {
					self.setId(data.deck_id);
					self.setRemaining(data.remaining);
				} else {
					//TODO
				}
			});
	}
	update(deck) {
		this.remaining = deck.remaining;
		this.id = deck.deck_id;
	}
	setRemaining(num) {
		this.remaining = num;
	}
	setId(id) {
		this.id = id;
		return this;
	}
};
module.exports = Deck;