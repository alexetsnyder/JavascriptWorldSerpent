//camera.mjs
import { BaseClass, Point, Vector } from './drawing.mjs';

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

class Camera extends BaseClass {
	#keys = {}
	#max = null
	#cameraSpeed = 2
	#isDragging = false
	#previousPosition = null

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

	constructor(leftTop, size, max) {
		super(leftTop, size);
		this.max = new Point(max.x - size.width, max.y - size.height);
		this.wireEvents();
	}

	wireEvents(canvas) {
		var canvas = document.getElementById('drawingArea');
		canvas.onmousedown = (mouseDownEventArgs) => this.onMouseDown(mouseDownEventArgs);
		canvas.onmouseup = (mouseUpEventArgs) => this.onMouseUp(mouseUpEventArgs);
		canvas.onmousemove = (mouseMoveEventArgs) => this.onMouseMove(mouseMoveEventArgs);
		document.onkeydown = (keyDownEventArgs) => this.onKeyDown(keyDownEventArgs);
		document.onkeyup = (keyUpEventArgs) => this.onKeyUp(keyUpEventArgs);
	}

	move(delta) {
		this.left += this.#cameraSpeed * delta.x;
		this.top += this.#cameraSpeed * delta.y;
		this.left = Math.max(0, Math.min(this.left, this.max.x));
		this.top = Math.max(0, Math.min(this.top, this.max.y));
		this.setPos(new Point(this.left, this.top));
	}

	getOffset(origin, tileSize) {
		return new Point(origin.x * tileSize - this.left, origin.y * tileSize - this.top);
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
	}

	onMouseDown(mouseDownEventArgs) {
		this.#isDragging = true;
		this.#previousPosition = new Vector(mouseDownEventArgs.clientX, mouseDownEventArgs.clientY);
	}

	onMouseUp(mouseUpEventArgs) {
		this.#isDragging = false;
	}

	onMouseMove(mouseMoveEventArgs) {
		if (this.#isDragging) {
			var newPosition = this.#previousPosition.minus(new Vector(mouseMoveEventArgs.clientX, mouseMoveEventArgs.clientY));
			var delta = newPosition.normalize();
			this.move(delta.toPoint());
		}
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

export { Camera };