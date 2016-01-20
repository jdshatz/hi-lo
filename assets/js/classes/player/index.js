import $ from 'jquery';
import roles from '../../modules/roles';

const ACTIVE_CLASS = 'player--active';

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
	}

	/**
	 * Toggle between active and inactive. If active, it's this player's turn.
	 */
	toggle() {
		this.active = !this.active;
		this.$el.toggleClass(ACTIVE_CLASS, this.active);
		this.cleanThisUpWhenNotTired();
	}

	cleanThisUpWhenNotTired() {
		//clean this up.
		if (this.active && this.id === 'player2') {
			$('body').addClass('body--player2-active');
		} else {
			$('body').removeClass('body--player2-active');
		}
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
	 * All wrapper els existing in the DOM: this will fill in required vals.
	 */
	render() {
		this.cleanThisUpWhenNotTired();
		if (this.active) {
			this.$el.addClass(ACTIVE_CLASS);
		}

		let $points = this.$el.find('.player__points');
		$points.find('span').html(this.score);
		$points.find('em').html(this.score === 1 ? 'point' : 'points');

		this.$el.find('.role').html(this.role);
		this.$el.find('.name').html(this.name);
	}

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
		//TODO: should throw if string and invalid.
		this.guess = guess;
		return this;
	}

	setGuessCount(num) {
		this.guessCount = num;
		return this;
	}

	setScore(num) {
		this.score = num;
		return this;
	}

	/**
	 * Show a headline specific to the player and current role, name.
	 * @return {string}
	 */
	getHeadline() {
		return this.role + ' (' + this.name + '):';
	}

	/**
	 * Show a secondary headline specific to the player's current role
	 * @return {string}
	 */
	getSecondaryHeadline() {
		if (this.role === roles.ROLE_GUESSER) {
			return 'take a guess...';
		}
		return 'draw a card...';
	}
};
module.exports = Player;