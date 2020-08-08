//controller.mjs
import { Camera } from './camera.mjs';
import { ColorGrid } from './grid.mjs';
import { Point } from './drawing.mjs';

var ID = 0;

class Object {
	#id = ID
	#shape = null

	constructor(shape) {
		this.#id = ID;
		ID += 1;
		this.#shape = shape;
	}

	isDraw() {
		return true;
	}

	update() {
		this.#shape.update();
	}

	draw(ctx) {
		this.#shape.draw(ctx);
	}
}

class Controller {
	#objects = [];

	constructor() {
		var rows = 40;
		var cols = 40;
		var tileSize = 20;
		var boundingRect = document.getElementById('drawingArea').getBoundingClientRect();
		var origin = new Point(0, 0);
		var size = new Point(boundingRect.width, boundingRect.height);
		var max = new Point(cols * tileSize, rows * tileSize);
		var camera = new Camera(origin, size, max);
		var colorGridObject = new Object(new ColorGrid(camera, rows, cols, tileSize));

		this.#objects = [colorGridObject];
	} 

	draw(ctx) {
		for (var obj of this.#objects) {
			if (obj.isDraw()) {
				obj.draw(ctx);
			}
		}
	}

	update() {
		for (var obj of this.#objects) {
			if (obj.isDraw()) {
				obj.update();
			}
		}
	}
}

export { Controller };