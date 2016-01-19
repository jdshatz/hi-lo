import $ from 'jquery';
import vex from '../../plugins/vex';
import store from '../store';

/**
 * Module to handle anything nav related.
 * @type {Object}
 */
var nav = {
	init: function() {
		$('.new-game').on('click', function(event) {
			event.preventDefault();
			vex.dialog.confirm({
				message: 'Are you sure you want to start a new game? This will erase your current game.',
				callback: function(value) {
					if (value) {
						store.clearGame();
						window.location.reload();
					}
				}
			});
		});
	}
};

module.exports = nav;