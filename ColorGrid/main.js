//main.js
import { Point  } from './modules/drawing.mjs';
import { Controller } from './modules/controller.mjs';

const CANVAS_SIZE = new Point(400, 400);

class Runtime { 
	#ctx = null
	#isRunning = false
	#controller = null

	constructor(ctx) {
		this.#ctx = ctx;
		this.#isRunning = true;
		this.#controller = new Controller();
	}

	clear() {
		this.#ctx.fillStyle = 'black';
		this.#ctx.fillRect(0, 0, this.#ctx.canvas.width, this.#ctx.canvas.height);
	}

	update() {
		this.#controller.update();
	}

	draw() {
		this.clear();
		this.#controller.draw(this.#ctx)
	}

	run() {
		if (this.#isRunning) { 
			this.update();
			this.draw();
			window.requestAnimationFrame(() => { this.run(); });
		}
	}
}

function main() {
	var canvas = document.getElementsByTagName('canvas')[0];
	var ctx = canvas.getContext('2d');

	ctx.canvas.width = CANVAS_SIZE.width;
	ctx.canvas.height = CANVAS_SIZE.height;

	var runtime = new Runtime(ctx);
	runtime.run();
}

window.onload = main;