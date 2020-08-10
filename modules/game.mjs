//game.mjs
import { addElement } from './system.mjs';

class Game {
	#player = null

	get player() {
		return this.#player;
	}

	set player(value) {
		this.#player = value;
	}

	 constructor(player) {
	 	this.#player = player;
	 	this.initialGameInfo();
	 }

	 initialGameInfo() {
	 	var html = 'You enter the forest, and find a door <br>';
	 	html += 'Runes circle the edge, and glow with an  <br>';
	 	html += 'eerie light. You touch it and the runes  <br>';
	 	html += 'shine bright with green light. The door  <br>';
	 	html += 'opens, and with only a moments hesitation, <br>';
	 	html += 'you enter. You find yourself in a room with <br>';
	 	html += 'smooth rocky walls.';
	 	addElement('divGameFeed', 'p', 'gameFeedID', html);
	 }

	 update() {

	 }

	 draw(ctx) {

	 }
}

export { Game };