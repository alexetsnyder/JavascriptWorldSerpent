//player.mjs
import { IsNullOrUndefined } from './system.mjs';
import { Rect, Point, Color } from './drawing.mjs';

class Player {
	#camera = null
	#currentRoom = null
	#health = 100
	#model = null

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
		this.health = health;
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

	draw(ctx) {
		this.#model.draw(ctx);
	}

	onSwitchTo(switchTabEventArgs) {
		this.#currentRoom = switchTabEventArgs.entrance;
	}
}

export { Player };