import $ from 'jquery';
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
		this.lastGuess = opts.lastGuess || null;
		this.$el = $('#' + this.id);
	}

	/**
	 * Toggle between active and inactive. If active, it's this player's turn.
	 */
	toggle() {
		this.active = !this.active;
		this.$el.toggleClass(ACTIVE_CLASS, this.active);
	}

	/**
	 * The element exists in the DOM, this is technically
	 * just filling in required vals.
	 */
	render() {
		if (this.active) {
			this.$el.addClass(ACTIVE_CLASS);
		}
	}
};
module.exports = Player;