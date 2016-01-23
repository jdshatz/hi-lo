import $ from 'jquery';
import vex from '../../plugins/vex';
import store from '../store';

/**
 * Module to handle anything nav related.
 * @type {Object}
 */
var nav = {
	ACTIVE_RULE_CLASS: 'rules--active',

	/**
	 * Show/hide rules.
	 * @param  {Boolean} showRules
	 */
	toggleRules: function(showRules) {
		$('body').toggleClass(this.ACTIVE_RULE_CLASS, showRules);
	},

	/**
	 * Bind a few event handlers for nav links, handle rules panel.
	 */
	init: function() {
		var $doc = $(document);

		$('.new-game').on('click', (event) => {
			event.preventDefault();
			vex.dialog.confirm({
				message: 'Are you sure you want to start a new game? This will erase your current game.',
				callback: (value) => {
					if (value) {
						store.clearGame();
						window.location.reload();
					}
				}
			});
		});

		$('.show-rules').on('click', (event) => {
			event.preventDefault();
			this.toggleRules(true);
		});

		$doc.on('click', '.rules--active .page-mask, .close-rules', (event) => {
			event.preventDefault();
			this.toggleRules(false);
		});

		$doc.on('click', '.game-over-new-game', (event) => {
			event.preventDefault();
			window.location.reload();
		});
	}
};

$(function() {
	nav.init();
});
module.exports = nav;