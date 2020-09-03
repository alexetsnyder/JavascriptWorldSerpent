//game.mjs
import { Point } from './drawing.mjs';
import { addElement, random } from './system.mjs';

const EnemyTypes = {
	NO_TYPE  : 'no_type',
	TREE_IMP : 'tree_imp'
}

const EnemyDiscriptions = {
	'tree_imp' : `From the spirits of trees that have <br>
		          died as saplings, and brought back by <br>
		          tree demons to defend the trees, and their <br>
		          seeds. Looks like a sapling, but makes quick <br>
		          work of any who wonder too near.`
}

const EnemyHealthRanges = {
	'tree_imp' : new Point(5, 10)
}

const ENTRANCE_DESCRIPTION = `You enter the forest, and find a door <br>
						 	  Runes circle the edge, and glow with an  <br>
						 	  eerie light. You touch it and the runes  <br>
						 	  shine bright with green light. The door  <br>
						 	  opens, and with only a moments hesitation, <br>
						 	  you enter. You find yourself in a room with <br>
						 	  smooth rocky walls.`

const roomDescriptions = [
	`The walls are smooth. The geod like swirls <br>
	 of crystals seem to move and shine with a <br>
	 inner light of pale green.`,

	`Thick roots hang from the ceiling. Twisted <br>
	 in odly human like shapes. You hope it is  <br>
	 some illusion that they look like they are <br>
	 screaming, writhing in agony.`,

	`Stalactites twist down from the cieling like <br>
	 roots. A milky white drop of water forms on one <br>
	 and drips down to the stalagmite reaching <br> 
	 up from the floor. You try not to think of a <br>
	 mouth with razor teath, saliva dripping down,<br>
	 and of the mouth suddenly snapping shut. `,

	`The walls are rough unlike the unervingly <br>
	 smooth ones you have seen before. At first, <br>
	 it is a comfort that these must have been <br>
	 made. But then you think of eyeless monsters <br>
	 eating up the stone. No human has ever <br>
	 been here before.`
]

class Enemy {
	#health = 0
	#type = null
	#description = null

	get health() {
		return this.#health;
	}

	set health(value) {
		this.#health = value;
	}

	get type() {
		return this.#type;
	}

	set type(value) {
		this.#type = value;
	}

	get description() {
		return this.#description;
	}

	set description(value) {
		this.#description = value;
	}

	constructor(type) {
		this.type = type;
		this.health = 5;
		this.description = EnemyDiscriptions[type];
	}

}

const EnemyNames = {
	'tree_imp' : 'TREE IMP'
}

const Turn = {
	PLAYER : 'player',
	ENEMY  : 'enemy'
}

class Game {
	#player = null
	#enemies = []
	#currentTurn = Turn.PLAYER;

	get player() {
		return this.#player;
	}

	set player(value) {
		this.#player = value;
	}

	 constructor(player) {
	 	this.#player = player;
	 	this.initialGameInfo();
	 	this.spawnEnemies();
	 }

	 addGameText(id, description) {
	 	addElement('divGameFeed', 'p', id, description);
	 }

	 initialGameInfo() {
	 	this.addGameText('gameFeedID', ENTRANCE_DESCRIPTION);
	 	this.addGameText('roomDescriptionID', random.choice(roomDescriptions));
	 }

	 spawnEnemies(n=1) {
	 	for (var i = 0; i < n; i++) {
	 		var enemy = new Enemy(EnemyTypes.TREE_IMP)
	 		this.#enemies.push(enemy);
	 		this.addGameText(`Enemy${i}`, `${EnemyNames[enemy.type]}: <br> ${enemy.description}`);
	 	}
	 }

	 update() {

	 }

	 draw(ctx) {

	 }
}

export { Game };