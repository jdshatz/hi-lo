import $ from 'jquery';
import Player from '../player';
import Deck from '../deck';

const defaultPlayerCount = 2;
const ROLE_DEALER = 'dealer';
const ROLE_GUESSER = 'guesser';

class Game {
	constructor(vent, opts) {
		this.vent = vent;
		this.pointsOnTheLine = opts.pointsOnTheLine || 0;
		this.deck = this.getDeck(opts.deckId);
		this.players = this.getPlayers(opts.existingPlayers);
		this.activePlayer = opts.activePlayer || this.players[0].id;
	}
	getDeck(deckId) {
		return new Deck({
			vent: this.vent,
			deckId: deckId
		});
	}
	getPlayers(existingPlayers) {
		let players = [];
		if (existingPlayers) {
			//TODO
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
	render() {
		console.log('rendering...');
	}
};
module.exports = Game;