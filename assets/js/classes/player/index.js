class Player {
	constructor(opts) {
		this.vent = opts.vent;
		this.id = opts.id;
		this.name = opts.name;
		this.role = opts.role;
		this.score = opts.score || 0;
		this.guessCount = opts.guessCount || 0;
		this.lastGuess = opts.lastGuess || null;
	}
};
module.exports = Player;