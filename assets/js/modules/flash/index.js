import $ from 'jquery';

/**
 * Flash a brief notification on the screen.
 * @type {Object}
 */
var flash = {
	DISPLAY_DURATION: 1500,
	TYPE_ERROR: 'error',
	TYPE_SUCCESS: 'success',
	ACTIVE_CLASS: 'flash--active',

	/**
	 * Show a flash of info onscreen for a brief period.
	 * @param {string} message
	 * @param {string} type
	 */
	show: function(message, type) {
		let $flash = this.get();
		$flash.toggleClass('flash--error', type === this.TYPE_ERROR).find('.flash__content').html(message);
		$flash.addClass(this.ACTIVE_CLASS);
		setTimeout(() => this.hide(), this.DISPLAY_DURATION);
	},

	/**
	 * Hide flash.
	 */
	hide: function() {
		this.get().removeClass(this.ACTIVE_CLASS);
	},

	/**
	 * Cache ref to flash el.
	 * 
	 * @return {object}
	 */
	get: function() {
		if (!this.$el) {
			this.$el = $('.flash');
		}
		return this.$el;
	}
};

module.exports = flash;