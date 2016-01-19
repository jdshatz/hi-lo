import $ from 'jquery';
const API_URL = 'http://deckofcardsapi.com/';
const CREATE_URL = API_URL + 'api/deck/new/shuffle/?deck_count=1';

/**
 * Handles all interactions with deckofcards api: drawing cards, creating
 * decks, etc.
 */
class Deck {
	/**
	 * Create a new deck.
	 * @param  {object} opts {vent: {object}, id: string||null}
	 */
	constructor(opts) {
		this.vent = opts.vent;
		if (opts.id) {
			this.load(opts.id);
		} else {
			this.create();
		}
	}

	/**
	 * Loads an existing deck by id
	 * 
	 * @param  {string} id [description]
	 * @return {[type]}    [description]
	 */
	load(id) {
		var self = this;
		$.when($.ajax(this.getShuffleUrl(id)))
			.then(function(data, textStatus, jqXHR) {
				if (data.success) {
					self.update(data);
					return data;
				} else {
					//TODO
				}
			});
	}

	/**
	 * Create a new deck.
	 */
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

	/**
	 * When deck changes, update with any new values here.
	 * 
	 * @param  {object} deck response from api
	 * @return {object}
	 */
	update(deck) {
		this.remaining = deck.remaining;
		this.id = deck.deck_id;
		this.activeCard = deck.cards ? deck.cards[0] : null;
		return this;
	}

	/**
	 * Draw a new card.
	 */
	draw() {
		var self = this;
		$.when($.ajax(this.getDrawUrl(this.id)))
			.then(function(data, textStatus, jqXHR) {
				if (data.success) {
					self.update(data);
					self.vent.pub('drawCard');
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
	getShuffleUrl(id) {
		return API_URL + 'api/deck/' + id + '/shuffle/';
	}

	/**
	 * Draw a card
	 * @param  {string} id
	 * @return {string}
	 */
	getDrawUrl(id) {
		return API_URL + 'api/deck/' + id + '/draw/?count=1';
	}

};
module.exports = Deck;