//player.mjs
import { Camera } from './camera.mjs';
import { IsNullOrUndefined } from './system.mjs';
import { Color, Point, BaseClass, Rect } from './drawing.mjs';

const Keys = {
	W_KEY       : 'w',
	A_KEY       : 'a',
	S_KEY       : 's', 
	D_KEY       : 'd',
	ARROW_UP    : 'ArrowUp',
	ARROW_DOWN  : 'ArrowDown',
	ARROW_LEFT  : 'ArrowLeft', 
	ARROW_RIGHT : 'ArrowRight'
}

class Player extends BaseClass {
	#keys = {}
	shape = null
	#camera = null
	#max = null

	get keys() {
		return this.#keys;
	}

	set keys(value) {
		this.#keys = value;
	}

	get max() {
		return this.#max;
	}

	set max(value) {
		this.#max = value;
	}

	constructor(camera, leftTop, size, max) {
		super(leftTop, size);
		this.shape = new Rect(leftTop, size, Color.RED);
		this.#camera = camera;
		this.max = max;
		this.wireEvents();
	}

	wireEvents() {
		document.onkeydown = (keyDownEventArgs) => this.onKeyDown(keyDownEventArgs);
		document.onkeyup = (keyUpEventArgs) => this.onKeyUp(keyUpEventArgs);
	}

	setPos(leftTop) {
		super.setPos(leftTop);
		if (!IsNullOrUndefined(this.shape)) {
			this.shape.setPos(leftTop);
		}
	}

	move(delta) {
		var left = Math.max(0, Math.min(this.left + delta.x, this.max.x - this.width));
		var top = Math.max(0, Math.min(this.top + delta.y, this.max.y - this.height));
		this.setPos(new Point(left, top));
	}

	update() {
		var dirX = 0;
		var dirY = 0;
		if (Keys.W_KEY in this.keys || Keys.ARROW_UP in this.keys) {
			dirY = -1;
		}
		if (Keys.S_KEY in this.keys || Keys.ARROW_DOWN in this.keys) {
			dirY = 1;
		}

		if (Keys.A_KEY in this.keys || Keys.ARROW_LEFT in this.keys) {
			dirX = -1;
		}
		if (Keys.D_KEY in this.keys || Keys.ARROW_RIGHT in this.keys) {
			dirX = 1;
		}

		this.move(new Point(dirX, dirY));
		this.#camera.centerCameraOn(this.center);
	}

	draw(ctx) {
		this.shape.draw(ctx);
	}

	onKeyDown(keyDownEventArgs) { 
		var keyboardKey = keyDownEventArgs.key;
		this.keys[keyboardKey] = keyboardKey;
	}

	onKeyUp(keyUpEventArgs) {
		var keyboardKey = keyUpEventArgs.key;
		if (keyboardKey in this.keys) {
			delete this.keys[keyboardKey];
		}
	}
}

export { Player };