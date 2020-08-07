//camera.mjs
import { Keys } from './system.mjs';
import { EventTypes, Event, eventSystem} from './events.mjs';
import { BaseClass, Point, Vector } from './drawing.mjs';

class Camera extends BaseClass {
	#keys = {}
	#origin = null
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

	get cameraSpeed() {
		return this.#cameraSpeed;
	}

	set cameraSpeed(value) {
		this.#cameraSpeed = value;
	}

	constructor(leftTop, size, max) {
		super(leftTop, size);
		this.#origin = leftTop;
		this.max = new Point(max.x - size.width, max.y - size.height);
		this.wireEvents();
	}

	wireEvents(canvas) {
		var canvas = document.getElementById('drawingArea');
		eventSystem.add_listener(new Event(EventTypes.MOUSE_DOWN).createEvent((eventArgs) => this.onMouseDown(eventArgs)));
		eventSystem.add_listener(new Event(EventTypes.MOUSE_UP).createEvent((eventArgs) => this.onMouseUp(eventArgs)));
		eventSystem.add_listener(new Event(EventTypes.MOUSE_MOVE).createEvent((eventArgs) => this.onMouseMove(eventArgs)));
		eventSystem.add_listener(new Event(EventTypes.MOUSE_LEAVE).createEvent((eventArgs) => this.onMouseLeave(eventArgs)));
		eventSystem.add_listener(new Event(EventTypes.KEY_DOWN).createEvent((eventArgs) => this.onKeyDown(eventArgs)));
		eventSystem.add_listener(new Event(EventTypes.KEY_UP).createEvent((eventArgs) => this.onKeyUp(eventArgs)));
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

	getOffset() {
		return new Point(this.#origin.x - this.left, this.#origin.y - this.top);
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

		if (!this.#isDragging) {
			this.move(new Point(dirX, dirY));
		}
	}

	onMouseDown(mouseDownEventArgs) {
		if (!this.isPaused) {
			this.#isDragging = true;
			this.#previousPosition = new Vector(mouseDownEventArgs.clientX, mouseDownEventArgs.clientY);
		}
	}

	onMouseUp(mouseUpEventArgs) {
		if (!this.isPaused) {
			this.#isDragging = false;
		}
	}

	onMouseMove(mouseMoveEventArgs) {
		if (!this.isPaused && this.#isDragging) {
			var currentPosition = new Vector(mouseMoveEventArgs.clientX, mouseMoveEventArgs.clientY);
			var delta = this.#previousPosition.minus(currentPosition);
			this.move(delta.toPoint());
			this.#previousPosition = currentPosition;
		}
	}

	onMouseLeave(mouseLeaveEventArgs) {
		if (!this.isPaused) {
			this.#isDragging = false;
		}
	}

	onKeyDown(keyDownEventArgs) { 
		if (!this.isPaused) {
			var keyboardKey = keyDownEventArgs.key;
			this.keys[keyboardKey] = keyboardKey;
		}
	}

	onKeyUp(keyUpEventArgs) {
		if (!this.isPaused) {
			var keyboardKey = keyUpEventArgs.key;
			if (keyboardKey in this.keys) {
				delete this.keys[keyboardKey];
			}
		}
	}
}

export { Camera };