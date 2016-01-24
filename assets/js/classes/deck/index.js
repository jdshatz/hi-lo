import $ from 'jquery';
import exporter from '../../modules/exporter';

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
		this.$el = $('.deck');
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
					this.vent.pub('appReady');
				} else {
					this.vent.pub('error');
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
					this.vent.pub('drawCardComplete');
				} else {
					this.vent.pub('error', 'Unable to draw a new card.');
				}
			});
	}

	/**
	 * How many cards to draw at a time. With the right flags enabled, you
	 * might just be able to speed up the game. A lot.
	 * 
	 * @return {number}
	 */
	getDrawCount() {
		if (window.location.href.indexOf('debug') === -1 || window.location.href.indexOf('drawCount') === -1) {
			return 1;
		}

		let count = window.location.search.split('drawCount=');
		count = count[1] || 1;
		if (this.remaining < count || isNaN(count)) {
			return 1;
		}
		return count;
	}

	/**
	 * Draw a card
	 * @param  {string} id
	 * @return {string}
	 */
	getDrawUrl(id) {
		return API_URL + 'api/deck/' + id + '/draw/?count=' + this.getDrawCount();
	}

	/**
	 * Render out the deck based on contents.
	 * The deck area includes draw pile, discard pile, and points on the line.
	 *
	 * @param {number} pointsOnTheLine
	 */
	render(pointsOnTheLine) {
		this.renderPointsOnTheLine(pointsOnTheLine);
		this.renderCardsLeft();
		this.renderDiscardPile();
	}

	/**
	 * Render details about points on the line.
	 *
	 * @param {number} pointsOnTheLine
	 */
	renderPointsOnTheLine(pointsOnTheLine) {
		var $pointsOnTheLineWrapper = this.$el.find('.points-otl');
		$pointsOnTheLineWrapper.find('.points-otl__point-value').html(pointsOnTheLine);
		$pointsOnTheLineWrapper.find('.points-otl__text').text(pointsOnTheLine === 1 ? 'point' : 'points');
	}

	/**
	 * Render the number of cards left.
	 */
	renderCardsLeft() {
		let html = this.remaining;
		html += (this.remaining === 1) ? ' card left' : ' cards left';
		$('.cards-left').html(html);
	}

	/**
	 * Render out the active card if one is set, or clear discard pile.
	 */
	renderDiscardPile() {
		//this won't always be set if nothing in discard pile.
		var $pile = $('.deck__card--discard-pile');
		if (this.activeCard) {
			let card = this.activeCard;
			let altText = card.value.toLowerCase() + ' of ' + card.suit.toLowerCase();
			let $cardImg = $('<img>').prop('src', card.images.png).prop('alt', altText);
			$cardImg.addClass('deck__card-img');
			$pile.addClass('deck__card--discard-pile--has-card').find('.card').html($cardImg);
		} else {
			$pile.removeClass('deck__card--discard-pile--has-card').find('.card').html('');
		}
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

		//if it's a face card, it'll be NaN
		if (isNaN(converted)) {
			return this.convertFaceValue(val.toLowerCase());
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
	 * The game ranks suits in ascending alphabetical order.
	 * Spades > hearts > diamonds > clubs
	 * 
	 * @param  {string} suit
	 * @return {number}
	 */
	convertSuitToNumber(suit) {
		suit = suit.toLowerCase();
		if (suit === 'clubs') {
			return 0;
		} else if (suit === 'diamonds') {
			return 1;
		} else if (suit === 'hearts') {
			return 2;
		}
		return 3; //spades
	}

	/**
	 * @return {Boolean}
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

		//compare suits if needed.
		if (currVal === prevVal) {
			var currSuit = this.convertSuitToNumber(this.activeCard.suit);
			var prevSuit = this.convertSuitToNumber(this.prevActiveCard.suit);
			return currSuit > prevSuit;
		}

		return currVal > prevVal;
	}

	/**
	 * When the discard pile is discarded.
	 */
	clearActiveCard() {
		this.activeCard = null;
	}

	/**
	 * Export deck
	 * @return {object}
	 */
	export() {
		return exporter.exportObj(this, ['$el', 'vent']);
	}
};
module.exports = Deck;