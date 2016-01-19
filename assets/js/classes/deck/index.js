import $ from 'jquery';
const API_URL = 'http://deckofcardsapi.com/';
const CREATE_URL = API_URL + 'api/deck/new/shuffle/?deck_count=1';

/**
 * Handles all interactions with deckofcards api: drawing cards, creating
 * decks, etc.
 */
class Deck {
	/**
	 * Create a brand new deck, or load an existing one.
	 * @param  {object} opts {vent: {object}, deck: object|null}
	 */
	constructor(opts) {
		this.vent = opts.vent;
		if (!opts.deck) {
			this.create();
		} else {
			this.unpack(opts.deck);
		}
	}

	/**
	 * Create a new deck.
	 */
	create() {
		$.when($.ajax(CREATE_URL))
			.then((data, textStatus, jqXHR) => {
				if (data.success) {
					this.update(data);
					//save deck_id if we've just created a new deck.
					this.vent.pub('save');
				} else {
					//TODO
				}
			});
	}

	/**
	 * Unpack stored deck vals.
	 */
	unpack(deck) {
		this.remaining = deck.remaining;
		this.id = deck.id;
		this.activeCard = deck.activeCard;
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
		this.prevActiveCard = this.activeCard; //store the last active card for comparing down the line.
		this.activeCard = deck.cards ? deck.cards[0] : null;
		return this;
	}

	/**
	 * Draw a new card.
	 */
	draw() {
		$.when($.ajax(this.getDrawUrl(this.id)))
			.then((data, textStatus, jqXHR) => {
				if (data.success) {
					this.update(data);
					this.vent.pub('drawCard');
				} else {
					//TODO
				}
			});
	}

	/**
	 * Draw a card
	 * @param  {string} id
	 * @return {string}
	 */
	getDrawUrl(id) {
		return API_URL + 'api/deck/' + id + '/draw/?count=1';
	}

	/**
	 * Converts string representation of values to numbers.
	 * API returns strings in format "10", "2", "JACK", "ACE", etc.
	 * 
	 * @param  {string} val [description]
	 * @return {number}     [description]
	 */
	convertValue(val) {
		let converted = parseInt(val, 10);
		if (converted === NaN) {
			return convertFaceValue(val.toLowerCase());
		}
		return converted;
	}

	/**
	 * Convert face card values to numbers.
	 * Aces are high in this game.
	 * @param  {string} val
	 * @return {number}
	 */
	convertFaceValue(val) {
		if (val === 'jack') {
			return 11;
		} else if (val === 'queen') {
			return 12;
		} else if (val === 'king') {
			return 13;
		}
		return 14; //ace
	}

	/**
	 * TODO: better name.
	 * @return {Boolean} [description]
	 */
	isActiveCardHigherThanPrev() {
		if (!this.prevActiveCard) {
			return true;
		}
		if (!this.activeCard) {
			return false;
		}

		var currVal = this.convertValue(this.activeCard.value);
		var prevVal = this.convertValue(this.prevActiveCard.value);

		console.log('currVal: ' + currVal + ', preVal: ' + prevVal);
		
		if (currVal === prevVal) {
			//TODO. have to compare suits.
		}
		return currVal > prevVal;
	}

};
module.exports = Deck;