import $ from 'jquery';
import Player from '../player';
import Deck from '../deck';
import store from '../../modules/store';
import vex from '../../plugins/vex';
import roles from '../../modules/roles';
import flash from '../../modules/flash';

const playerCount = 2;
const GUESS_HI = 'hi';
const GUESS_LO = 'lo';


/**
 * A game controls the entire app. All other objects are children of a Game.
 */
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
		this.vent.sub('save', () => this.save());
		this.vent.sub('render', () => this.render());
		this.vent.sub('drawCard', () => this.onDrawCard());
		this.vent.sub('error', (error) => this.error(error));

		$('.deck__card--draw-pile').on('click', (event) => {
			event.preventDefault();
			this.onDrawPileClick();
		});


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

	/**
	 * Submit a guess for the active player and then switch players.
	 * @param  {string} guess GUESS_LO|GUESS_HI
	 */
	submitGuess(guess) {
		let activePlayer = this.getActivePlayer();
		activePlayer
			.setGuess(guess)
			.setGuessCount(activePlayer.guessCount + 1);
		this.switchPlayers();
	}

	pass() {
		console.log('pass!');
		this.getActivePlayer().clearGuess();
		this.switchRoles();
		this.switchPlayers();
	}

	/**
	 * Handle clicks on the draw pile.
	 */
	onDrawPileClick() {
		var activePlayer = this.getActivePlayer();
		if (activePlayer.role === roles.ROLE_DEALER) {
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
		if (this.deck.remaining === 1) {
			this.onLastCardDraw();
		} else if (inactivePlayer.guess) {
			this.checkGuess(inactivePlayer);
		} else {
			this.pointsOnTheLine += 1;
			this.switchPlayers();
		}
	}

	onLastCardDraw() {
		//TODO.
		//the game is over at this point, show some
		//indication of this.
		console.log(this);
	}

	checkGuess(inactivePlayer) {
		let isHigher = this.deck.isActiveCardHigherThanPrev();
		let isCorrect = isHigher ? inactivePlayer.guess === GUESS_HI : inactivePlayer.guess === GUESS_LO;
		if (isCorrect) {
			this.onCorrectGuess();
		} else {
			this.onIncorrectGuess(inactivePlayer);
		}
	}

	onCorrectGuess() {
		this.renderDeck();
		this.showGuessResult(true);

		setTimeout(() => {
			this.pointsOnTheLine += 1;
			this.switchPlayers();
		}, flash.DISPLAY_DURATION);
	}

	onIncorrectGuess(inactivePlayer) {
		this.render();
		this.showGuessResult(false);
		inactivePlayer
			.setScore(inactivePlayer.score + this.pointsOnTheLine)
			.clearGuess()
			.render();
		this.clearDiscardPile();
	}

	clearDiscardPile() {
		setTimeout(() => {
			this.pointsOnTheLine = 0;
			this.deck.clearActiveCard();
			this.render();
		}, flash.DISPLAY_DURATION);
	}

	showGuessResult(isCorrect) {
		let message = isCorrect ? 'Correct!' : 'Wrong!';
		let type = isCorrect ? flash.TYPE_SUCCESS : flash.TYPE_ERROR;
		flash.show(message, type);
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
			for (i = 1; i <= playerCount; i++) {
				players.push(this.createPlayer({
					vent: this.vent,
					id: 'player' + i,
					name: 'Player ' + i,
					role: i === 1 ? roles.ROLE_DEALER : roles.ROLE_GUESSER,
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
	 * Switch roles: dealer becomes player, and vice versa.
	 */
	switchRoles() {
		this.players.forEach((player) => player.switchRole().render());
	}

	/**
	 * Enable/disable the pass btn
	 * @param  {Boolean} disable
	 */
	togglePassPrivileges(disable) {
		$('.button-pass').attr('disabled', disable);
		$('.pass-label').toggleClass('pass-label--disabled', disable);
	}

	/**
	 * Returns pass hint text; slightly different depending on guess count.
	 * @param  {number} guessCount
	 * @return {string}
	 */
	getPassHint(guessCount) {
		if (guessCount == 0) {
			return '3 correct guesses in a row';
		} else if (guessCount == 1) {
			return '2 more correct guesses in a row';
		}
		return '1 more correct guess';
	}

	/**
	 * Fills in UI based on state of the game.
	 */
	render() {
		var activePlayer = this.getActivePlayer();
		this.renderHeadline(activePlayer);
		this.renderGuess(activePlayer);
		this.renderDeck();
	}

	/**
	 * Toggles visibility and updates relevant details for guess ui: hi/lo btns, pass, 
	 * info text, etc.
	 * 
	 * @param  {Player} activePlayer
	 */
	renderGuess(activePlayer) {
		var $guess = $('.guess');
		$guess.find('.guess__info').hide();
		$guess.find('.active-card-value').html(this.deck.activeCard ? this.deck.activeCard.value.toLowerCase() : '');
		$guess.find('.active-card-suit').html(this.deck.activeCard ? this.deck.activeCard.suit.toLowerCase() : '');


		//there are 3 possible cases here that require 3 different UIs.
		// a - guesser. b - dealer, no guess has been made. c - dealer - with active guess.
		if (activePlayer.role === roles.ROLE_GUESSER) {
			if (activePlayer.guessCount < 3) {
				$guess.find('.guess__hint').show();
				$guess.find('.remaining-guesses-to-pass').html(this.getPassHint(activePlayer.guessCount));
				this.togglePassPrivileges(true);
			} else {
				$guess.find('.guess__hint').hide();
				this.togglePassPrivileges(false);
			}
			$guess.find('.guess__info--guesser').show();
		} else if (this.deck.activeCard) {
			let inactivePlayer = this.getInactivePlayer();
			$guess.find('.guesser-name').html(inactivePlayer.name);
			$guess.find('.guess-value').html(inactivePlayer.guess === GUESS_LO ? 'lower' : 'higher');
			$guess.find('.guess__info--dealer').show();
		}
	}

	/**
	 * Triggered on initial render and when values change: update
	 * the headline showing active player and instructions.
	 *
	 * @param {Player} activePlayer
	 */
	renderHeadline(activePlayer) {
		var $headline = $('.headline');
		$headline.find('.headline__player').html(activePlayer.getHeadline());
		$headline.find('.headline__instruction').html(activePlayer.getSecondaryHeadline());
	}

	/**
	 * Updates deck area of the UI:
	 * -cards left
	 * -renders new card
	 * -points on the line
	 */
	renderDeck() {
		this.renderPointsOtl();
		let cardsLeft = this.deck.remaining || 52; //we don't always have a deck here...(so really, shoud move this.)
		cardsLeft += (cardsLeft === 1) ? ' card left' : ' cards left';
		$('.cards-left').html(cardsLeft);

		//this won't always be set if nothing in discard pile.
		//
		//TODO refactor
		if (this.deck.activeCard) {
			let card = this.deck.activeCard;
			let $cardImg = $('<img>').prop('src', card.images.png).prop('alt', card.value + ' ' + card.suit.toLowerCase());
			$cardImg.addClass('deck__card-img')
			$('.deck__card--discard-pile').html($cardImg).addClass('deck__card--discard-pile--has-card');
		} else {
			$('.deck__card--discard-pile').html('').removeClass('deck__card--discard-pile--has-card');
		}
	}

	/**
	 * Render details about points on the line.
	 */
	renderPointsOtl() {
		var $pointsOnTheLineWrapper = $('.points-otl');
		var suffix = 'points on the line';
		if (this.pointsOnTheLine === 1) {
			suffix = 'point on the line';
		}
		$pointsOnTheLineWrapper.find('.points-otl__point-value').html(this.pointsOnTheLine);
		$pointsOnTheLineWrapper.find('.points-otl__suffix').text(suffix);
	}

	/**
	 * Handle errors that will break the UI by offering to reset the game.
	 *
	 * API stores deck for 2 weeks. Theoretically a person
	 * could have a game saved in localStorage longer than that, we'd fail
	 * when attempting to reload it, for example.
	 *
	 * This is a catch-all for misc API errors/etc.
	 *
	 * @param {string=} messageDetails - if set, use this.
	 * 
	 */
	error(messageDetails) {
		let errorMessage = 'Uh oh! There was a problem with your game. Start a new game?';
		if (messageDetails) {
			errorMessage = messageDetails + ' Start a new game?';
		}
		vex.dialog.confirm({
			message: errorMessage,
			callback: function(value) {
				if (value) {
					store.clearGame();
					window.location.reload();
				}
			}
		});
	}
};
module.exports = Game;