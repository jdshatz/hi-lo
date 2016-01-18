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
		var self = this;
		$.when($.ajax(this.buildShuffleUrl(id)))
			.then(function(data, textStatus, jqXHR) {
				if (data.success) {
					console.log(data);
					self.update(data);
				} else {
					//TODO
				}
			});
	}

	/**
	 * Shuffle url also for simply getting an existing deck
	 * atm since no obvious simple get url.
	 * @param  {string} id
	 * @return {string}
	 */
	buildShuffleUrl(id) {
		return API_URL + 'api/deck/' + id + '/shuffle/';
	}

	create() {
		var self = this;
		$.when($.ajax(CREATE_URL))
			.then(function(data, textStatus, jqXHR) {
				if (data.success) {
					self.update(data);
					//save deck_id if we've just created a new deck.
					self.vent.pub('save');
				} else {
					//TODO
				}
			});
	}

	update(deck) {
		this.remaining = deck.remaining;
		this.id = deck.deck_id;
		return this;
	}
};
module.exports = Deck;