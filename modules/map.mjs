//map.mjs
import { Camera } from './camera.mjs';
import { BaseClass, BorderedRect, Point, Rect } from './drawing.mjs';

function Random(start, end) {
	return Math.floor((Math.random() * (end - start)) + start);
}

function DrawWithOffset(ctx, tile, offset) {
	var savedPos = tile.leftTop;
	var newPos = new Point(savedPos.x + offset.x, savedPos.y + offset.y);
	tile.setPos(newPos);
	tile.draw(ctx);
	tile.setPos(savedPos);
}

class Cell extends BaseClass {
	box = null

	generateRoom() {
		var roomWidth = Random(this.width / 4, this.width - 10);
		var roomHeight = Random(this.height / 4, this.height - 10);
		var size = new Point(roomWidth, roomHeight);

		this.box = new Rect(this.leftTop, size, '#FF0000', false);
	}

	setPos(leftTop) {
		super.setPos(leftTop);
		if (this.box !== undefined) {
			this.box.setPos(leftTop);
		}
	}

	update() {

	}

	draw(ctx) {
		if (this.box !== null) {
			this.box.draw(ctx);
		}
	}
}

class Dungeon {
	#isGrid = true
	#grid = []
	#cells = []
	#cols = 0
	#rows = 0
	#tileSize = 0
	#camera = null

	get isGrid() {
		return this.#isGrid;
	}

	set isGrid(value) {
		this.#isGrid = value;
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

	constructor(rows, cols, tileSize, isGrid = true) {
		this.isGrid = isGrid;
		this.rows = rows;
		this.cols = cols;
		this.tileSize = tileSize;
		this.generateGrid();
		this.generateCells();
		var boundingRect = document.getElementById('drawingArea').getBoundingClientRect();
		var origin = new Point(0, 0);
		var size = new Point(boundingRect.width, boundingRect.height);
		var max = new Point(this.cols * this.tileSize - this.tileSize + 2, this.rows * this.tileSize - this.tileSize + 2);
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
		var x = 4;
		var y = 4;
		for (var i = 0; i < this.rows; i++) {
			for (var j = 0; j < this.cols; j++) {
				var color = this.randomColor();
				var leftTop = new Point(x, y);
				var size = new Point(this.tileSize, this.tileSize);
				this.#grid.push(new BorderedRect(leftTop, size, color, 1));
				y = j * this.tileSize;
			}
			x = i * this.tileSize;
			y = 4;
		}
	}

	generateCells() {
		var cellSize = 8;
		var roomSize = cellSize * this.tileSize;
		var x = 4;
		var y = 4;
		for (var i = 0; i < this.rows / cellSize; i++) {
			for (var j = 0; j < this.cols / cellSize; j++) {
				var nextCell = new Cell(new Point(x, y), new Point(roomSize, roomSize));
				nextCell.generateRoom();
				this.#cells.push(nextCell);
				y += roomSize;
			}
			y = 4;
			x += roomSize;
		}
	}

	update() {
		this.#camera.update();
	}

	draw(ctx) {
		if (this.isGrid) {
			var offset = this.#camera.getOffset(new Point(0, 0), this.tileSize);
			for (var i = 0; i < this.rows; i++) {
				for (var j = 0; j < this.cols; j++) {
					var tile = this.#grid[i * this.rows + j];
					DrawWithOffset(ctx, tile, offset);
				}
			}
		}
		else {
			var offset = this.#camera.getOffset(new Point(0, 0), this.tileSize);
			var cellSize = 8;
			for (var i = 0; i < this.rows / cellSize; i++) {
				for (var j = 0; j < this.cols / cellSize; j++) {
					var tile = this.#cells[i * (this.rows / cellSize) + j];
					DrawWithOffset(ctx, tile, offset);
				}
			}
		}
	}
}

export { Dungeon };