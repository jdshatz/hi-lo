import $ from 'jquery';
import Player from '../player';
import Deck from '../deck';
import store from '../../modules/store';

const defaultPlayerCount = 2;
const ROLE_DEALER = 'dealer';
const ROLE_GUESSER = 'guesser';

class Game {
	constructor(opts) {
		this.vent = opts.vent;
		this.pointsOnTheLine = opts.pointsOnTheLine || 0;
		this.deck = this.getDeck(opts.deck ? opts.deck.id : null);
		this.players = this.getPlayers(opts.players);
		this.activePlayer = opts.activePlayer || this.players[0].id;
		this.bindEventHandlers();
	}

	/**
	 * The Game object is the only place that will subscribe to and handle
	 * events triggered via the global vent object.
	 */
	bindEventHandlers() {
		this.vent.sub('save', this.save.bind(this));
	}

	render() {
		console.log('rendering...');
	}

	save() {
		store.saveGame(JSON.stringify(this));
	}

	getDeck(id) {
		return new Deck({
			vent: this.vent,
			id: id
		});
	}

	getPlayers(existingPlayers) {
		let players = [];
		if (existingPlayers) {
			var self = this;
			existingPlayers.forEach(function(playerData){
				Object.assign(playerData, {vent: self.vent});
				players.push(new Player(playerData));
			});
		} else {
			var i;
			for (i = 1; i <= defaultPlayerCount; i++) {
				players.push(new Player({
					vent: this.vent,
					id: 'player' + i,
					name: 'Player ' + i,
					role: i == 1 ? ROLE_DEALER : ROLE_GUESSER
				}));
			}
		}
		return players;
	}

	switchPlayer() {

	}
};
module.exports = Game;