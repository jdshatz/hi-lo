import $ from 'jquery';
import roles from '../../modules/roles';
import exporter from '../../modules/exporter';
import vex from '../../plugins/vex';

const ACTIVE_CLASS = 'player--active';
const SECOND_PLAYER_ACTIVE = 'body--player2-active';
const HIGHLIGHT_SCORE_CLASS = 'player--highlight-score';
const MAX_LENGTH_NAME = 16;
/**
 * Each game has players.
 */
class Player {
	/**
	 * Create a new player
	 * @param {object} opts
	 */
	constructor(opts) {
		this.vent = opts.vent;
		this.id = opts.id;
		this.name = opts.name;
		this.role = opts.role;
		this.active = opts.active;
		this.score = opts.score || 0;
		this.guessCount = opts.guessCount || 0;
		this.guess = opts.guess || null;
		this.$el = $('#' + this.id);
		this.$body = $('body');
		//TODO: gameOverClass should probably live elsewhere, in shared meta, not on player
		this.gameOverClass = opts.gameOverClass;
		this.bindEventHandlers();
	}

	/**
	 * Bind event handlers for this player.
	 */
	bindEventHandlers() {
		this.$el.on('click', '.player__name', (event) => {
			event.preventDefault();
			if (!this.$body.hasClass(this.gameOverClass)) {
				this.showChangeNamePrompt();
			}
		});
	}

	/**
	 * Show modal to change name
	 */
	showChangeNamePrompt() {
		let input = "<input name='vex' type='text' class='vex-dialog-prompt-input' placeholder='Enter new name' maxlength='" + MAX_LENGTH_NAME +"' />";
		vex.dialog.prompt({
			message: 'Change your name, ' + this.name + ':',
			input: input,
			callback: (value) => {
				//escape html entities with use of .text()
				value = $('<div>').html($.trim(value)).text();
				//false is returned on hitting esc and it's tranformed to a string above.
				//this has caveat of preventing user from setting their username to 'false' but...oh well. improve if ever needed.
				if (value && value !== 'false') {
					this.setName(value);
				}
			}
		});
	}

	/**
	 * Toggle between active and inactive. If active, it's this player's turn.
	 */
	toggle() {
		this.active = !this.active;
		this.toggleActiveClasses();
		return this;
	}

	/**
	 * Switch between dealer and player.
	 * @return {self}
	 */
	switchRole() {
		if (this.role === roles.ROLE_GUESSER) {
			this.role = roles.ROLE_DEALER;
		} else {
			this.role = roles.ROLE_GUESSER;
		}
		return this;
	}

	/**
	 * Toggle active class on element, and
	 * if second player is active, add body class.
	 */
	toggleActiveClasses() {
		this.$el.toggleClass(ACTIVE_CLASS, this.active);
		if (this.id === 'player2') {
			$('body').toggleClass(SECOND_PLAYER_ACTIVE, this.active);
		}
	}

	/**
	 * All wrapper els existing in the DOM: this will fill in required vals.
	 */
	render() {
		this.toggleActiveClasses();

		let $points = this.$el.find('.player__points');
		$points.find('span').html(this.score);
		$points.find('em').html(this.score === 1 ? 'point' : 'points');

		this.$el.find('.player__role').html(this.getRoleHtml());
		this.$el.find('.player__name a').html(this.name);
		return this;
	}

	/**
	 * @return {self}
	 */
	clearGuess() {
		this.setGuessCount(0);
		this.setGuess(null);
		return this;
	}

	/**
	 * Set guess
	 * @param {string|null}
	 */
	setGuess(guess) {
		this.guess = guess;
		return this;
	}

	/**
	 * Set name
	 * @param {string}
	 */
	setName(name) {
		if (name.length > MAX_LENGTH_NAME) {
			name = name.substr(0, MAX_LENGTH_NAME);
		}
		this.name = name;
		this.render();
		this.vent.pub('player:nameChanged');
		return this;
	}

	/**
	 * @param {number} num
	 */
	setGuessCount(num) {
		this.guessCount = num;
		return this;
	}

	/**
	 * @param {number} num
	 */
	incrementScore(num) {
		this.score += num;
		this.highlightScore();
		return this;
	}

	/**
	 * Toggle class to highlight change to score.
	 */
	highlightScore() {
		this.$el.addClass(HIGHLIGHT_SCORE_CLASS);
		setTimeout(() => {
			this.$el.removeClass(HIGHLIGHT_SCORE_CLASS);
		}, 1500);
	}

	/**
	 * Show a headline specific to the player and current role, name.
	 * @return {string}
	 */
	getHeadlineHtml() {
		return this.role + ' (' + this.name + '):';
	}

	/**
	 * Show a secondary headline specific to the player's current role
	 * @return {string}
	 */
	getSecondaryHeadlineHtml() {
		if (this.role === roles.ROLE_DEALER) {
			return 'draw a card...';
		} else if (this.guessCount === 3) {
			return 'take a guess or pass...';
		}
		return 'take a guess...';
	}

	/**
	 * Returns string to use for the role panel.
	 * In the case of the dealer, it's simple; in the case of the
	 * guesser, we show some info about guesses required to pass.
	 * 
	 * @return {string}
	 */
	getRoleHtml() {
		if (this.role === roles.ROLE_DEALER) {
			return 'Dealer';
		}

		if (this.guessCount >= 3) {
			return 'Guesser';
		}

		let html = 'Guesser - needs <b>' + (3 - this.guessCount) + '</b> ';
		let guessText = 'correct guesses';
		if (this.guessCount == 2) {
			guessText = 'more correct guess';
		} else if (this.guessCount == 1) {
			guessText = 'more correct guesses';
		}
		return html + this.buildAlertHintLink(guessText + ' to pass') + '.';
	}

	/**
	 * The hint link text is slightly different based on guess count.
	 * @param  {string} linkText
	 * @return {string}
	 */
	buildAlertHintLink(linkText) {
		let alert = "When you have three correct guesses in a row, you will be allowed to pass.";
		alert += " It is to your advantage to pass, so you can avoid gaining points.";
		return "<a href='#' class='modal-link modal-link--alert' data-alert-content='" + alert + "'>" + linkText + "</a>";
	}

	/**
	 * Export player
	 * @return {object}
	 */
	export () {
		return exporter.exportObj(this, ['$el', 'vent', '$body']);
	}
};
module.exports = Player;