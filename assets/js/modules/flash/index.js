import $ from 'jquery';

/**
 * Flash a brief notification on the screen.
 * @type {Object}
 */
var flash = {
	DISPLAY_DURATION: 2000,
	TYPE_ERROR: 'error',
	TYPE_SUCCESS: 'success',
	ACTIVE_CLASS: 'body--has-flash',

	/**
	 * Show a flash of info onscreen for a brief period.
	 * @param {string} message
	 * @param {string} type
	 */
	show: function(message, type) {
		this.get()
			.toggleClass('flash--error', type === this.TYPE_ERROR)
			.find('.flash__content')
			.html(message);

		//set the active class on the wrapper because we hide a few things when it's visible.
		this.getWrapper().addClass(this.ACTIVE_CLASS);

		setTimeout(() => this.hide(), this.DISPLAY_DURATION);
	},

	/**
	 * Hide flash.
	 */
	hide: function() {
		this.getWrapper().removeClass(this.ACTIVE_CLASS);
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
	},

	/**
	 * Cache ref to wrapper el.
	 * 
	 * @return {object}
	 */
	getWrapper: function() {
		if (!this.$wrapper) {
			this.$wrapper = $('body');
		}
		return this.$wrapper;
	}
};

module.exports = flash;