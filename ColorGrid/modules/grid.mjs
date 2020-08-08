//grid.mjs
import { Random, DrawWithOffset } from './system.mjs';
import { BorderedRect, Point } from './drawing.mjs';

class Grid {
	#grid = []
	#cols = 0
	#rows = 0
	#tileSize = 0

	get grid() {
		return this.#grid;
	}

	set grid(value) {
		this.#grid = value;
	}

	get rows() {
		return this.#rows;
	}

	set rows(value) {
		this.#rows = value;
	}

	get cols() {
		return this.#cols;
	}

	set cols(value) {
		this.#cols = value;
	}

	get tileSize() {
		return this.#tileSize;
	}

	set tileSize(value) {
		this.#tileSize = value;
	}

	constructor(rows, cols, tileSize) {
		this.rows = rows;
		this.cols = cols;
		this.tileSize = tileSize;
	}
}

const random = new Random();

class ColorGrid extends Grid {
	#seed = 0;
	#camera = null;
	#random = null;

	constructor(camera, rows, cols, tileSize) {
		super(rows, cols, tileSize);
		this.generateGrid();
		this.#camera = camera;
	}

	convertToHex(colorPart) {
		var hex = colorPart.toString(16);
		if (hex.length == 1) {
			hex = '0' + hex;
		}
		return hex;
	}

	randomColor() {
		var red = random.from(0, 255);
		var green = random.from(0, 255);
		var blue = random.from(0, 255);
		return `#${this.convertToHex(red)}${this.convertToHex(green)}${this.convertToHex(blue)}`;
	}

	generateGrid() {
		var x = 8;
		var y = 8;
		for (var i = 0; i < this.rows; i++) {
			for (var j = 0; j < this.cols; j++) {
				var color = this.randomColor();
				var leftTop = new Point(x, y);
				var size = new Point(this.tileSize, this.tileSize);
				this.grid.push(new BorderedRect(leftTop, size, color, 1));
				y = j * this.tileSize + 8;
			}
			x = i * this.tileSize + 8;
			y = 8;
		}
	}

	pause() {
		this.#camera.isPaused = true;
	}

	unPause() {
		this.#camera.isPaused = false;
	}

	update() {
		this.#camera.update();
	}

	draw(ctx) {
		var offset = this.#camera.getOffset();
		for (var i = 0; i < this.rows; i++) {
			for (var j = 0; j < this.cols; j++) {
				DrawWithOffset(ctx, this.grid[i * this.rows + j], offset);
			}
		}
	}
}

export { ColorGrid };