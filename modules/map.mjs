//map.mjs
import { Camera } from './camera.mjs';
import { BorderedRect, Point } from './drawing.mjs';

function Random(start, end) {
	return Math.floor((Math.random() * end) + start);
}

class Dungeon {
	#grid = []
	#cols = 0
	#rows = 0
	#tileSize = 0
	#camera = null

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
		this.tileSize = tileSize
		this.generateGrid();
		var boundingRect = document.getElementById('drawingArea').getBoundingClientRect();
		var origin = new Point(0, 0);
		var size = new Point(boundingRect.width, boundingRect.height);
		var max = new Point(this.cols * this.tileSize - this.tileSize, this.rows * this.tileSize - this.tileSize);
		this.#camera = new Camera(origin, size, max);
	}

	convertToHex(colorPart) {
		var hex = colorPart.toString(16);
		if (hex.length == 1) {
			hex = '0' + hex;
		}
		return hex;
	}

	randomColor() {
		var red = Random(0, 255);
		var green = Random(0, 255);
		var blue = Random(0, 255);
		return `#${this.convertToHex(red)}${this.convertToHex(green)}${this.convertToHex(blue)}`;
	}

	generateGrid() {
		var x = 0;
		var y = 0;
		for (var i = 0; i < this.rows; i++) {
			for (var j = 0; j < this.cols; j++) {
				var color = this.randomColor();
				var leftTop = new Point(x, y);
				var size = new Point(this.tileSize, this.tileSize);
				this.#grid.push(new BorderedRect(leftTop, size, color, 2));
				y = j * this.tileSize;
			}
			x = i * this.tileSize;
			y = 0;
		}
	}

	getTile(i, j) {
		return this.#grid[i * this.rows + j]
	}

	update() {
		this.#camera.update();
	}

	draw(ctx) {
		var offset = this.#camera.getOffset(new Point(0, 0), this.tileSize);
		for (var i = 0; i < this.rows; i++) {
			for (var j = 0; j < this.cols; j++) {
				var tile = this.#grid[i * this.rows + j];
				var savedPos = tile.leftTop;
				var newPos = new Point(savedPos.x + offset.x, savedPos.y + offset.y);
				tile.setPos(newPos);
				tile.draw(ctx);
				tile.setPos(savedPos);
			}
		}
	}
}

export { Dungeon };