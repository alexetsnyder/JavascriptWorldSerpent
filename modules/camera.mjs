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
	}

	centerCameraOn(point) {
		this.setPos(new Point(point.x - this.width / 2, Math.min(point.y - this.height / 2)));
	}

	reset() {
		this.setPos(this.#origin);
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
}

export { Camera };