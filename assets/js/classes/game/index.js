import $ from 'jquery';
import Player from '../player';
import Deck from '../deck';
import store from '../../modules/store';
import vex from '../../plugins/vex';

const defaultPlayerCount = 2; //other places in this app assume this number so this isn't really helpful...
const ROLE_DEALER = 'Dealer';
const ROLE_GUESSER = 'Guesser';
const GUESS_HI = 'hi';
const GUESS_LO = 'lo';

class Game {
	/**
	 * Create a new game
	 * @param  {object} opts - includes vent and optionally includes existing game info
	 
	 */
	constructor(opts) {
		this.vent = opts.vent;
		this.pointsOnTheLine = opts.pointsOnTheLine || 0;
		this.deck = this.initDeck(opts.deck);
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

		var self = this;
		$('.guess__buttons .button').on('click', function(event) {
			event.preventDefault();
			var $this = $(this);
			if ($this.hasClass('button-pass')) {
				self.pass();
			} else {
				self.submitGuess($this.hasClass('button-lower') ? GUESS_LO : GUESS_HI);
			}
		});
	}

	submitGuess(guess) {
		var activePlayer = this.getActivePlayer();
		activePlayer.updateGuess(guess);
		this.switchPlayers();
	}

	pass() {
		console.log('pass!');
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
	 * Triggered when we've drawn a new card: we're either just going to switch
	 * turns if there's no previous guess, or we need to validate prev guess
	 * against new card.
	 */
	onDrawCard() {
		let inactivePlayer = this.getInactivePlayer();
		if (inactivePlayer.guess) {
			this.checkGuess(inactivePlayer)
		} else {
			this.pointsOnTheLine += 1;
			this.switchPlayers();
		}
	}

	checkGuess(inactivePlayer) {
		console.log('check the guess');
		console.log(this);
		var isHigher = this.deck.isActiveCardHigherThanPrev();
		console.log(isHigher);
	}

	/**
	 * Fills in UI based on state of the game.
	 */
	render() {
		var activePlayer = this.getActivePlayer();
		this.updateHeadlineUi(activePlayer);
		this.updateGuessUi(activePlayer);
		this.updateDeckUi();
	}

	/**
	 * Save current game state. Uses localStorage.
	 */
	save() {
		store.saveGame(JSON.stringify(this));
	}

	/**
	 * Create a new deck object.
	 * @param  {object|null}
	 * @return {Deck}
	 */
	initDeck(existingDeck) {
		return new Deck({
			vent: this.vent,
			deck: existingDeck
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
			existingPlayers.forEach((playerData) => {
				Object.assign(playerData, {
					vent: this.vent
				});
				players.push(this.createPlayer(playerData));
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
		return this.players.find((player) => {
			if (player.active) {
				return player;
			}
		});
	}

	/**
	 * Get inactive player
	 
	 * @return {Player|undefined}
	 */
	getInactivePlayer() {
		return this.players.find((player) => {
			if (!player.active) {
				return player;
			}
		});
	}

	/**
	 * Change the active player. This assumes that we have
	 * 2 players in a game.
	 * 
	 * We'll always save game state each time this happens.
	 */
	switchPlayers() {
		this.players.forEach((player) => player.toggle());
		this.render();
		this.save();
	}

	/**
	 * Toggles visibility and updates relevant details for guess ui: hi/lo btns, pass, 
	 * info text, etc.
	 * 
	 * @param  {Player} activePlayer
	 */
	updateGuessUi(activePlayer) {
		var $guess = $('.guess');
		console.log(this);
		$guess.find('.guess__info').hide();
		$guess.find('.active-card-value').html(this.deck.activeCard ? this.deck.activeCard.value.toLowerCase() : '');
		$guess.find('.active-card-suit').html(this.deck.activeCard ? this.deck.activeCard.suit.toLowerCase(): '');


		//there are 3 possible cases here that require 3 different UIs.
		// a - guesser. b - dealer, no guess has been made. c - dealer - with active guess.
		if (activePlayer.role === ROLE_GUESSER) {
			$guess.find('.remaining-guesses-to-pass').html(this.getRemainingGuessesText(activePlayer.guessCount));
			$guess.find('.guess__info--guesser').show();
		} else if(this.deck.activeCard) {
			let inactivePlayer = this.getInactivePlayer();
			$guess.find('.guesser-name').html(inactivePlayer.name);
			$guess.find('.guess-value').html(inactivePlayer.guess === GUESS_LO ? 'lower' : 'higher');
			$guess.find('.guess__info--dealer').show();
		}
	}

	getRemainingGuessesText(guessCount) {
		if (guessCount === 0) {
			return 3;
		}
		return (3 - guessCount) + ' more';
	}

	/**
	 * Triggered on initial render and when values change: update
	 * the headline showing active player and instructions.
	 *
	 * @param {Player} activePlayer
	 */
	updateHeadlineUi(activePlayer) {
		var $headline = $('.headline');
		$headline.find('.headline__player').html(this.getHeadlinePlayer(activePlayer));
		$headline.find('.headline__instruction').html(this.getHeadlineInstruction(activePlayer));
	}

	/**
	 * Updates deck area of the UI:
	 * -cards left
	 * -renders new card
	 * -points on the line
	 */
	updateDeckUi() {
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
			$('.deck__card--discard-pile').html($cardImg).addClass('deck__card--discard-pile--has-card');
		}

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
};
module.exports = Game;