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

		$(document).on('click', '.rules--active .page-mask, .close-rules', (event) => {
			this.toggleRules(false);
		});
	}
};

module.exports = nav;