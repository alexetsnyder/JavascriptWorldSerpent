//events.mjs
import { Keys, List } from './system.mjs';

const EventTypes = {
	NO_EVENT    : 'no_event',
	MOUSE_DOWN  : 'mouse_down',
	MOUSE_UP    : 'mouse_up',
	MOUSE_MOVE  : 'mouse_move',
	MOUSE_LEAVE : 'mouse_leave',
	KEY_UP      : 'key_up',
	KEY_DOWN    : 'key_down',
	KEY_PRESS   : 'key_press'
}

class Delegate {
	#funcs = new List();

	add(func) {
		this.#funcs.append(func);
	}

	remove(func) {
		this.#funcs.removeElement(func);
		console.log(this.#funcs);
	}

	invoke(eventArgs) {
		for (var func of this.#funcs.toArray()) {
			func(eventArgs);
		}
	}
}

class Event {
	#eventType = EventTypes.NO_EVENT;

	constructor(eventType) {
		this.#eventType = eventType;
	}

	createEvent(func) {
		var delegate = new Delegate();
		delegate.add(func);
		return { type: this.#eventType, delegate: delegate }
	}
}

class EventSystem {
	#delegates = {}

	constructor() {
		for (var type in EventTypes) {
			this.#delegates[EventTypes[type]] = [];
		}
		this.wireEvents();
	}

	wireEvents() {
		document.onkeyup = (keyUpEventArgs) => this.onKeyUp(keyUpEventArgs);
		document.onkeydown = (keyDownEventArgs) => this.onKeyDown(keyDownEventArgs);
		document.onkeypress = (keyPressEventArgs) => this.onKeyPress(keyPressEventArgs);
		this.wireCanvasEvents();
	}

	wireCanvasEvents() {
		var canvas = document.getElementById('drawingArea');
		canvas.onmousedown = (mouseDownEventArgs) => this.onMouseDown(mouseDownEventArgs);
		canvas.onmouseup = (mouseUpEventArgs) => this.onMouseUp(mouseUpEventArgs);
		canvas.onmousemove = (mouseMoveEventArgs) => this.onMouseMove(mouseMoveEventArgs);
		canvas.onmouseleave = (mouseLeaveEventArgs) => this.onMouseLeave(mouseLeaveEventArgs);
	}

	add_listener(event) {
		this.#delegates[event.type].push(event.delegate);
	}

	callAllDelegateOfType(eventType, eventArgs) {
		for (var delegate of this.#delegates[eventType]) {
			delegate.invoke(eventArgs);
		}
	}

	onMouseDown(mouseDownEventArgs) {
		this.callAllDelegateOfType(EventTypes.MOUSE_DOWN, mouseDownEventArgs);
	}

	onMouseUp(mouseUpEventArgs) {
		this.callAllDelegateOfType(EventTypes.MOUSE_UP, mouseUpEventArgs);
	}

	onMouseMove(mouseMoveEventArgs) {
		this.callAllDelegateOfType(EventTypes.MOUSE_MOVE, mouseMoveEventArgs);
	}

	onMouseLeave(mouseLeaveEventArgs) {
		this.callAllDelegateOfType(EventTypes.MOUSE_LEAVE, mouseLeaveEventArgs);
	}

	onKeyUp(keyUpEventArgs) {
		this.callAllDelegateOfType(EventTypes.KEY_UP, keyUpEventArgs);
	}

	onKeyDown(keyDownEventArgs) {
		this.callAllDelegateOfType(EventTypes.KEY_DOWN, keyDownEventArgs);	
	}

	onKeyPress(keyPressEventArgs) {
		this.callAllDelegateOfType(EventTypes.KEY_PRESS, keyPressEventArgs);		
	}
}

const eventSystem = new EventSystem();

export { EventTypes, Event, eventSystem }