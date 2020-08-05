//camera.mjs
import { BaseClass, Point, Vector } from './drawing.mjs';

class Camera extends BaseClass {
	#max = null
	#cameraSpeed = 2
	#isDragging = false
	#previousPosition = null

	get max() {
		return this.#max;
	}

	set max(value) {
		this.#max = value;
	}

	constructor(leftTop, size, max) {
		super(leftTop, size);
		this.max = new Point(max.x - size.width, max.y - size.height);
		this.reWireEvents();
	}

	reWireEvents(canvas) {
		var canvas = document.getElementById('drawingArea');
		canvas.onmousedown = (mouseDownEventArgs) => this.onMouseDown(mouseDownEventArgs);
		canvas.onmouseup = (mouseUpEventArgs) => this.onMouseUp(mouseUpEventArgs);
		canvas.onmousemove = (mouseMoveEventArgs) => this.onMouseMove(mouseMoveEventArgs);
		canvas.onmouseleave = (mouseLeaveEventArgs) => this.onMouseLeave(mouseLeaveEventArgs);
	}

	centerCameraOn(point) {
		var left = Math.max(0, Math.min(point.x - this.width / 2, this.max.x));
		var top = Math.max(0, Math.min(point.y - this.height / 2, this.max.y));
		this.setPos(new Point(left, top));
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
			this.move(new Point(delta.x * 1.2, delta.y * 1.2));
		}
	}

	onMouseLeave(mouseLeaveEventArgs) {
		this.#isDragging = false;
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