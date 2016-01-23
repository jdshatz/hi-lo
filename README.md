# Hi - Lo
## About
Hi-Lo is a simple web app built using the [Deck of Cards API](http://deckofcardsapi.com/). You can play it [here](http://3blitz.com/hi-lo).

## Installation

Pull down all dependencies via npm. This app uses [jQuery](https://jquery.com/), [Sass](http://sass-lang.com/), [vex-js](https://github.com/hubspot/vex), [preach](https://github.com/zeusdeux/preach), and [font-awesome](https://fortawesome.github.io/Font-Awesome/). It's written in ES6, and runs in the browser with the help of [babel](https://babeljs.io/) and [browserify](http://browserify.org/) (using [babelify](https://github.com/babel/babelify)).

```sh
$ npm install
```

## Tooling

All tooling is done through [Grunt](http://gruntjs.com/). A few Grunt tasks are setup for development.


* Watch all CSS/JS files and rebuild as necessary:
```sh
$ grunt w
```

* Will run the (small) suite of JS unit tests:
```sh
$ grunt test
```

* Lint JS files:
```sh
$ grunt lint
```

## The Rules
Play consists of a dealer and a player.

1. The dealer draws a card from the top of the deck and places it face up.
2. The player must guess whether the next card drawn from the deck will be higher or lower than the face up card.
3. Once the player guesses, the dealer draws the next card and places it face up on top of the previous card.
4. If the player is correct, go back to step 2.
5. If the player is wrong, the player receives a point for each card in the face up pile, and the face up pile is discarded. Then play begins at step 1 again.

When the player has made three correct guesses in a row, s/he may make another guess, or choose to pass and the roles are reversed with the face up pile continuing to build. The player may choose to continue if there is a high likelihood that their next guess would be correct. If they are wrong, play starts over at step 1 and the player must again make three correct guesses before being allowed to pass. If they are correct, they can continue or pass.

The goal is to end the game with as few points as possible.