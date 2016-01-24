import $ from 'jquery';
import Player from '../player';
import Deck from '../deck';
import store from '../../modules/store';
import vex from '../../plugins/vex';
import roles from '../../modules/roles';
import flash from '../../modules/flash';
import exporter from '../../modules/exporter';

const playerCount = 2;
const GUESS_HI = 'hi';
const GUESS_LO = 'lo';
const GAME_OVER_CLASS = 'body--game-over';
const TURN_IN_PROGRESS_CLASS = 'body--turn-in-progress';
const DIALOG_CONFIRM_MESSAGE = 'Ok';


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
		this.$body = $('body');
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
		this.vent.sub('player:nameChanged', () => {
			this.render();
			this.save();
		});
		this.vent.sub('render', () => this.render());
		this.vent.sub('drawCardComplete', () => this.onDrawCardComplete());
		this.vent.sub('error', (error) => this.error(error));

		this.vent.sub('startTurn', () => this.startTurn());
		this.vent.sub('endTurn', () => this.endTurn());

		var self = this;
		this.$body.on('keydown', (event) => {
			this.processKeydownEvent(event);
			return;
		});

		$('.deck__card--draw-pile').on('click', function(event) {
			event.preventDefault();
			var $this = $(this);
			//prevent rapid fire clicks from triggering multiple draws, and ignore if game is over or turn in progress.
			if (!$this.hasClass('clicked') && !self.$body.hasClass(GAME_OVER_CLASS) && !self.$body.hasClass(TURN_IN_PROGRESS_CLASS)) {
				self.onDrawPileClick();
			}
			$this.addClass('clicked');
			setTimeout(() => {
				$this.removeClass('clicked');
			}, 1500);
		});

		$('.guess__buttons .button').on('click', function(event) {
			event.preventDefault();
			var $this = $(this);
			if ($this.hasClass('button-pass')) {
				self.pass();
			} else {
				self.submitGuess($this.hasClass('button-lower') ? GUESS_LO : GUESS_HI);
			}
		});

		$(document).on('click', '.modal-link--alert', function(event) {
			event.preventDefault();
			vex.dialog.alert($(this).attr('data-alert-content'));
		});
	}

	/**
	 * We get here on all keydown events, but
	 * we only care about a few. Handle them here, ignore 
	 * the rest. We'll bypass all this if we have a modal open, or if the game is over.
	 * 
	 * @param  {object} event jQuery bound keydown
	 */
	processKeydownEvent(event) {
		let listenForKeycodes = [13, 38, 40, 39];
		if (listenForKeycodes.indexOf(event.which) === -1 || $('.vex').is(':visible') || this.$body.hasClass(GAME_OVER_CLASS)) {
			return;
		}

		//prevent rapid clicks from triggering multiple turns.
		if (this.turnInProgress()) {
			return false;
		}


		let activePlayer = this.getActivePlayer();
		if (activePlayer.role === roles.ROLE_DEALER) {
			if (event.which === 13) { //enter
				this.drawCard();
			}
		} else if (event.which === 38) { //up arrow
			this.submitGuess(GUESS_HI);
		} else if (event.which === 40) { //down arrow
			this.submitGuess(GUESS_LO);
		} else if (event.which === 39 && activePlayer.guessCount >= 3) { //right arrow
			this.pass();
		}
	}

	/**
	 * Submit a guess for the active player and then switch players.
	 * @param  {string} guess GUESS_LO|GUESS_HI
	 */
	submitGuess(guess) {
		this.startTurn();
		this.getActivePlayer().setGuess(guess);
		this.switchPlayers();
		this.endTurn();
	}

	/**
	 * When the currently active player chooses to pass.
	 */
	pass() {
		this.startTurn();
		this.getActivePlayer().clearGuess();
		this.switchRoles();
		this.switchPlayers();
		this.endTurn();
	}

	/**
	 * Draw a card.
	 */
	drawCard() {
		this.startTurn();
		this.deck.draw();
	}

	/**
	 * Handle race conditions triggered by use of keyboard by setting flag for turn in progress.
	 */
	startTurn() {
		this.$body.addClass(TURN_IN_PROGRESS_CLASS);
	}

	/**
	 * Triggered when we're "done" with a turn and will begin accepting inputs
	 * for another turn.
	 */
	endTurn() {
		this.$body.removeClass(TURN_IN_PROGRESS_CLASS);
	}

	/**
	 * Check if a turn is currently in progress. Used to bypass handling events
	 * for starting another play if the previous one isn't finished. 
	 */
	turnInProgress() {
		return this.$body.hasClass(TURN_IN_PROGRESS_CLASS);
	}

	/**
	 * Handle clicks on the draw pile.
	 */
	onDrawPileClick() {
		var activePlayer = this.getActivePlayer();
		if (activePlayer.role === roles.ROLE_DEALER) {
			this.drawCard();
		} else {
			vex.dialog.alert(activePlayer.name + ", it's not your turn to draw yet. Take a guess instead.");
		}
	}


	/**
	 * Triggered when we've drawn a new card: we're either just going to switch
	 * turns if there's no previous guess, or we need to validate prev guess
	 * against new card.
	 */
	onDrawCardComplete() {
		let inactivePlayer = this.getInactivePlayer();

		if (this.deck.remaining === 0) {
			this.handleLastGuess(inactivePlayer);
		} else if (inactivePlayer.guess) {
			this.handleGuess(inactivePlayer);
		} else {
			this.pointsOnTheLine += 1;
			this.switchPlayers();
			this.endTurn();
		}
	}

	/**
	 * Handle guesses; used for all but the very last play.
	 * @param  {Player} inactivePlayer
	 */
	handleGuess(inactivePlayer) {
		if (this.isGuessCorrect(inactivePlayer)) {
			this.onCorrectGuess(inactivePlayer);
			setTimeout(() => {
				this.pointsOnTheLine += 1;
				this.switchPlayers();
				this.endTurn();
			}, flash.DISPLAY_DURATION);
		} else {
			this.onIncorrectGuess(inactivePlayer);
		}
	}

	/**
	 * The last guess is handled slightly differently than the others, because
	 * the game is over.
	 * 
	 * @param  {Player} inactivePlayer
	 */
	handleLastGuess(inactivePlayer) {
		let isCorrect = this.isGuessCorrect(inactivePlayer);

		if (isCorrect) {
			this.onCorrectGuess(inactivePlayer);
		} else {
			this.onIncorrectGuess(inactivePlayer);
		}

		setTimeout(() => {
			this.gameOver();
		}, flash.DISPLAY_DURATION);
	}

	/**
	 * When the game is over, show the winner, add link
	 * to start again, and clear existing game.
	 */
	gameOver() {
		store.clearGame();

		let winner = this.getWinner();
		this.$body.addClass(GAME_OVER_CLASS);
		$('.player').removeClass('player--active');

		let $headline = $('.headline');
		$headline.find('.headline__player').html('Game Over! ');
		$headline.find('.headline__instruction').html(winner.name + ' wins with a low score of ' + winner.score + '.');

		let $subtitle = $('.guess__info--dealer');
		$subtitle.find('h2').html('...looks like it\'s time to <a href="#" class="game-over-new-game">play again</a>!');
		$subtitle.show();
	}

	/**
	 * Show intro message when starting a new game.
	 */
	showIntro() {
		let message = '<h2>Welcome to Hi-Lo!</h2><p>The goal of this two person game is to <b>end the game with as few points as possible.</b></p>';
		message += '<ul>';
		message += '<li>The first player starts as the Dealer, the second player is the Guesser.</li>';
		message += '<li>An incorrect guess will cause all the points on the line to go to the Guesser.</li>';
		message += '<li>After the Guesser gets three correct guesses in a row, they will be allowed to pass, and the roles reverse.</li>';
		message += '</ul>';
		vex.dialog.alert({
			message: message,
			buttons: [{
				text: 'Start Game',
				type: 'submit',
				className: 'vex-dialog-button-primary'
			}]
		});
	}

	/**
	 * @param  {Player} inactivePlayer
	 * @return {Boolean}
	 */
	isGuessCorrect(inactivePlayer) {
		if (this.deck.isActiveCardHigherThanPrev()) {
			return inactivePlayer.guess === GUESS_HI;
		}
		return inactivePlayer.guess === GUESS_LO;
	}

	/**
	 * Handle a correct guess.
	 *
	 * @param {Player} inactivePlayer
	 */
	onCorrectGuess(inactivePlayer) {
		this.deck.render(this.pointsOnTheLine);
		this.showGuessResult(true);
		inactivePlayer.setGuessCount(inactivePlayer.guessCount + 1);
	}

	/**
	 * Handle an incorrect guess.
	 * Update the inactivePlayer(the Guesser) score, show the results of the guess 
	 * onscreen for a moment, and then clear results
	 * 
	 * @param  {Player} inactivePlayer
	 */
	onIncorrectGuess(inactivePlayer) {
		this.render();
		this.showGuessResult(false);
		inactivePlayer
			.incrementScore(this.pointsOnTheLine)
			.clearGuess()
			.render();

		//clear this slightly before we clear the pile. We've
		//already added the score to the player hand so it needs
		//to be cleared in the UI.
		this.clearPointsOnTheLine();

		setTimeout(() => {
			this.clearDiscardPile();
			this.endTurn();
		}, flash.DISPLAY_DURATION);
	}

	/**
	 * Clear the points on the line, resetting to 0.
	 */
	clearPointsOnTheLine() {
		this.pointsOnTheLine = 0;
		this.deck.renderPointsOnTheLine(this.pointsOnTheLine);
	}

	/**
	 * When a guess is incorrect, we clear the pile.
	 */
	clearDiscardPile() {
		this.deck.clearActiveCard();
		this.render();
		this.save();
	}

	/**
	 * Flash a quick message on screen to show guess result.
	 * @param  {Boolean} isCorrect
	 */
	showGuessResult(isCorrect) {
		let message = isCorrect ? 'Correct!' : 'Wrong!';
		let type = isCorrect ? flash.TYPE_SUCCESS : flash.TYPE_ERROR;
		flash.show(message, type);
	}

	/**
	 * Save current game state. Uses localStorage.
	 * Currently just saves everything, DOM refs and all, which
	 * could(should) at some point be removed.
	 */
	save() {
		store.saveGame(JSON.stringify(this.export()));
	}

	/**
	 * Remove the stuff we don't want to save
	 * to local storage like DOM elements and vent object.
	 * We'll save everything else.
	 * 
	 * @return {object} game
	 */
	export () {
		let game = exporter.exportObj(this, ['deck', 'players', 'vent', '$body']);
		game.deck = this.deck.export();
		game.players = this.exportPlayers();
		return game;
	}

	/**
	 * Export players.
	 * @return {array}
	 */
	exportPlayers() {
		var players = [];
		this.players.forEach((player) => {
			players.push(player.export());
		});
		return players;
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
					vent: this.vent,
					gameOverClass: GAME_OVER_CLASS
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
					active: i === 1,
					gameOverClass: GAME_OVER_CLASS
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
	 * Get player by id
	 
	 * @return {Player|undefined}
	 */
	getPlayerById(id) {
		return this.players.find((player) => {
			if (player.id === id) {
				return player;
			}
		});
	}

	/**
	 * Get the winning player.
	 * @return {Player}
	 */
	getWinner() {
		let player1 = this.getPlayerById('player1');
		let player2 = this.getPlayerById('player2');

		if (player1.score < player2.score) {
			return player1;
		}
		return player2;
	}

	/**
	 * Change the active player. This assumes that we have
	 * 2 players in a game.
	 * 
	 * We'll always save game state each time this happens.
	 */
	switchPlayers() {
		this.players.forEach((player) => player.toggle().render());
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
	 * Fills in UI based on state of the game.
	 * @return {self}
	 */
	render() {
		var activePlayer = this.getActivePlayer();
		this.renderHeadline(activePlayer);
		this.renderGuess(activePlayer);
		this.deck.render(this.pointsOnTheLine);
		return this;
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
			this.togglePassPrivileges(activePlayer.guessCount < 3);
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
		$headline.find('.headline__player').html(activePlayer.getHeadlineHtml());
		$headline.find('.headline__instruction').html(activePlayer.getSecondaryHeadlineHtml());
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