import $ from 'jquery';
import Player from '../player';
import Deck from '../deck';
import store from '../../modules/store';
import vex from '../../plugins/vex';

const defaultPlayerCount = 2; //other places in this app assume this number so this isn't really helpful...
const ROLE_DEALER = 'Dealer';
const ROLE_GUESSER = 'Guesser';

class Game {
	constructor(opts) {
		this.vent = opts.vent;
		this.pointsOnTheLine = opts.pointsOnTheLine || 0;
		this.deck = this.initDeck(opts.deck ? opts.deck.id : null);
		this.players = this.initPlayers(opts.players);
		this.bindEventHandlers();
	}

	/**
	 * The Game object is the only place that will subscribe to and handle
	 * events triggered via the global vent object.
	 *
	 * DOM event handlers also bound here.
	 */
	bindEventHandlers() {
		this.vent.sub('save', this.save.bind(this));
		this.vent.sub('drawCard', this.onDrawCard.bind(this));
		$('.deck__card--draw-pile').on('click', this.onDrawPileClick.bind(this));
	}

	/**
	 * Handle clicks on the draw pile.
	 * @param  {object} event
	 */
	onDrawPileClick(event) {
		event.preventDefault();
		var activePlayer = this.getActivePlayer();
		if (activePlayer.role === ROLE_DEALER) {
			this.deck.draw();
		} else {
			vex.dialog.alert(activePlayer.name + ", it's not your turn to draw yet. Take a guess instead.");
		}
	}

	/**
	 * Triggered when we've drawn a new card.
	 */
	onDrawCard() {
		this.pointsOnTheLine += 1;
		this.switchPlayers();
		this.render();
	}

	/**
	 * Updates deck area of the UI:
	 * -cards left
	 * -renders new card
	 * -points on the line
	 */
	updateCards() {
		console.log('updateCards');
		console.log(this);
		let $pointsOnTheLineWrapper = $('.points-otl-wrapper');
		$pointsOnTheLineWrapper.find('.points-otl').html(this.pointsOnTheLine);

		//TODO: cleanup.
		if (this.pointsOnTheLine === 1) {
			$pointsOnTheLineWrapper.find('span').text('point on the line');
		} else {
			$pointsOnTheLineWrapper.find('span').text('points on the line');
		}

		$('.cards-left').html(this.deck.remaining);

		//this won't always be set if nothing in discard pile.
		if (this.deck.activeCard) {
			let card = this.deck.activeCard;
			let $cardImg = $('<img>').prop('src', card.images.png).prop('alt', card.value + ' ' + card.suit.toLowerCase());
			$cardImg.addClass('deck__card-img')
			$('.deck__card--discard-pile').html($cardImg);
		}

	}

	render() {
		this.updateHeadline();
		this.updateCards();
	}

	/**
	 * Save current game state. Uses localStorage.
	 */
	save() {
		store.saveGame(JSON.stringify(this));
	}

	/**
	 * Create a new deck object.
	 * @param  {string|null} id - will be set if loading existing game.
	 * @return {Deck}
	 */
	initDeck(id) {
		return new Deck({
			vent: this.vent,
			id: id
		});
	}

	/**
	 * Build player objects either from scratch or using
	 * existing player data from a previous game.
	 * 
	 * @param  {array|null} existingPlayers - if set, build players using this.
	 * @return {array}
	 */
	initPlayers(existingPlayers) {
		let players = [];
		if (existingPlayers) {
			var self = this;
			existingPlayers.forEach(function(playerData){
				Object.assign(playerData, {vent: self.vent});
				players.push(self.createPlayer(playerData));
			});
		} else {
			var i;
			for (i = 1; i <= defaultPlayerCount; i++) {
				players.push(this.createPlayer({
					vent: this.vent,
					id: 'player' + i,
					name: 'Player ' + i,
					role: i === 1 ? ROLE_DEALER : ROLE_GUESSER,
					active: i === 1
				}));
			}
		}
		return players;
	}

	/**
	 * Create a new player and render.
	 * @param {object} opts
	 */
	createPlayer(opts) {
		let player = new Player(opts);
		player.render();
		return player;
	}

	/**
	 * Get active player

	 * @return {Player|undefined}
	 */
	getActivePlayer() {
		return this.players.find(function(player){
			if (player.active) {
				return player;
			}
		});
	}

	/**
	 * Triggered on initial render and when values change: update
	 * the headline showing active player and instructions.
	 */
	updateHeadline() {
		var activePlayer = this.getActivePlayer();
		var $headline = $('.headline');
		$headline.find('.headline__player').html(this.getHeadlinePlayer(activePlayer));
		$headline.find('.headline__instruction').html(this.getHeadlineInstruction(activePlayer));
	}

	/**
	 * Get the HTML to show for the player details in the headline.
	 * 
	 * @param  {Player} activePlayer
	 * @return {string}
	 */
	getHeadlinePlayer(activePlayer) {
		return activePlayer.role + ' (' + activePlayer.name + '):';
	}

	/**
	 * Get the HTML to show for the instruction in the headline.
	 * 
	 * @param  {Player} activePlayer
	 * @return {string}
	 */
	getHeadlineInstruction(activePlayer) {
		if (activePlayer.role === ROLE_GUESSER) {
			return 'take a guess...';
		}
		return 'draw a card...';
	}

	/**
	 * Change the active player. This assumes that we have
	 * 2 players in a game.
	 * 
	 * We'll always save game state each time this happens.
	 */
	switchPlayers() {
		this.players.forEach(function(player){
			player.toggle();
		});
		this.save();
	}
};
module.exports = Game;