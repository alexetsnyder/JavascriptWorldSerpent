//events.mjs
import { Point } from './drawing.mjs';

const EventTypes = {
	MOUSE_DOWN : 'mouse_down',
	MOUSE_UP   : 'mouse_up',
	MOUSE_MOVE : 'mouse_move',
	DRAG_OVER  : 'drag_over',
	DROP       : 'drop'
}

class EventSystem {
	#canvasLeft = 0
	#canvasTop = 0 
	#delegates = {}

	get delegates() {
		return this.#delegates;
	}

	constructor() {
		for (var type in EventTypes) {
			this.delegates[EventTypes[type]] = []
		}
	}

	wire_events(canvas) {
		var rect = canvas.getBoundingClientRect();
		this.#canvasLeft = rect.left;
		this.#canvasTop = rect.top;
		canvas.onmousedown = (mouseEventArgs) => this.onMouseDown(mouseEventArgs);
		canvas.onmouseup = (mouseEventArgs) => this.onMouseUp(mouseEventArgs);
		canvas.onmousemove = (mouseEventArgs) => this.onMouseMove(mouseEventArgs);
		canvas.ondragover = (dragEventArgs) => this.onDragOver(dragEventArgs);
		canvas.ondrop = (dragEventArgs) => this.onDrop(dragEventArgs);
	}

	add_listener(eventType, func) {
		this.delegates[eventType].push(func);
	}

	convertScreenToCanvasPoint(eventArgs) {
		var canvasX = eventArgs.clientX - this.#canvasLeft;
		var canvasY = eventArgs.clientY - this.#canvasTop;
		eventArgs.mousePos = new Point(canvasX, canvasY);
	}

	callAllDelegateOfType(eventType, eventArgs) {
		for (var func of this.delegates[eventType]) {
			func(eventArgs);
		}
	}

	onMouseDown(mouseEventArgs) {
		this.convertScreenToCanvasPoint(mouseEventArgs);
		this.callAllDelegateOfType(EventTypes.MOUSE_DOWN, mouseEventArgs);
	}

	onMouseUp(mouseEventArgs) {
		this.convertScreenToCanvasPoint(mouseEventArgs);
		this.callAllDelegateOfType(EventTypes.MOUSE_UP, mouseEventArgs);
	}

	onMouseMove(mouseEventArgs) {
		this.convertScreenToCanvasPoint(mouseEventArgs);
		this.callAllDelegateOfType(EventTypes.MOUSE_MOVE, mouseEventArgs);
	}

	onDragOver(dragEventArgs) {
		dragEventArgs.preventDefault();
		this.convertScreenToCanvasPoint(dragEventArgs);
		this.callAllDelegateOfType(EventTypes.DRAG_OVER, dragEventArgs);
	}

	onDrop(dragEventArgs) {
		dragEventArgs.preventDefault();
		this.convertScreenToCanvasPoint(dragEventArgs);
		this.callAllDelegateOfType(EventTypes.DROP, dragEventArgs);
	}
}

let Events = new EventSystem();

export { EventTypes, EventSystem, Events };
