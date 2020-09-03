//player.mjs
import { IsNullOrUndefined } from './system.mjs';
import { Rect, Point, Color, Text } from './drawing.mjs';

class Player {
	#camera = null
	#currentRoom = null
	#health = 0
	#maxHealth = 0
	#model = null
	#ctxHealthBar = null
	#rectHealthBar = null 
	#txtHealthBar = null

	get health() {
		return this.#health;
	}

	set health(value) {
		this.#health = value;
	}

	get currentRoom() {
		return this.#currentRoom;
	}

	set currentRoom(value) {
		this.#currentRoom = value;
	}

	constructor(camera, health) {	
		this.#camera = camera;
		this.#maxHealth = health;
		this.health = health;
		this.#ctxHealthBar = document.getElementById('cnvHealthBar').getContext('2d');
		this.#rectHealthBar = new Rect(new Point(0, 0), new Point(this.#ctxHealthBar.canvas.width, this.#ctxHealthBar.canvas.height), Color.GREEN);
		this.#model = new Rect(new Point(0, 0), new Point(10, 10), Color.RED);
	}

	pause() {

	}

	unPause() {

	}

	update() {
		if (!IsNullOrUndefined(this.#currentRoom)) {
			this.#camera.centerCameraOn(this.#currentRoom.center);
			var offset = this.#camera.getOffset();
			this.#model.setPos(new Point(this.#currentRoom.cx + offset.x, this.#currentRoom.cy + offset.y));
		}
	}

	drawHealth() {
		this.#ctxHealthBar.fillStyle = Color.RED;
		this.#ctxHealthBar.fillRect(0, 0, this.#ctxHealthBar.canvas.width, this.#ctxHealthBar.canvas.height);
		this.#rectHealthBar.draw(this.#ctxHealthBar);
	}

	draw(ctx) {
		this.drawHealth();
		this.#model.draw(ctx);
	}

	onSwitchTo(switchTabEventArgs) {
		this.#currentRoom = switchTabEventArgs.entrance;
	}
}

export { Player };