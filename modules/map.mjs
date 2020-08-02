//map.mjs
import { Camera } from './camera.mjs';
import { BaseClass, BorderedRect, Vector, Point, Rect } from './drawing.mjs';

function Random(start, end) {
	return Math.floor((Math.random() * (end - start)) + start);
}

function Choice(list) {
	return list[Random(0, list.length)];
}

function DrawWithOffset(ctx, tile, offset) {
	var savedPos = tile.leftTop;
	var newPos = new Point(savedPos.x + offset.x, savedPos.y + offset.y);
	tile.setPos(newPos);
	tile.draw(ctx);
	tile.setPos(savedPos);
}

function IsNullOrUndefined(object) {
	return object === undefined || object === null;
}

class List {
	#array = []

	append(element) {
		this.#array.push(element);
	}

	constructor(array = []) {
		this.#array = array;
	}

	remove(index) {
		if (index >= 0 && index < this.#array.length) {
			this.#array = this.#array.slice(0, index).concat(this.#array.slice(index + 1));
		}
	}

	choice() {
		var index = Random(0, this.#array.length);
		var element = this.#array[index];
		this.remove(index);
		return element;
	}
}

function Range(startOrEnd, end = 0, step = 1) {
	var list = new List();
	var start = (end > 0) ? startOrEnd : 0;
	end = (end > 0) ? end : startOrEnd;
	for (var i = start; i < end; i += step) {
		list.append(i);
	}
	return list;
}

class Cell extends BaseClass {
	box = null
	#hasRoom = false;

	get hasRoom() {
		return this.#hasRoom;
	}

	set hasRoom(value) {
		this.#hasRoom = value;
	}

	generateRoom() {
		this.hasRoom = true;
		var roomWidth = Random(this.width / 4, this.width - 10);
		var roomHeight = Random(this.height / 4, this.height - 10);
		var size = new Point(roomWidth, roomHeight);

		this.box = new Rect(this.leftTop, size, '#FF0000', false);
	}

	setPos(leftTop) {
		super.setPos(leftTop);
		if (!IsNullOrUndefined(this.box)) {
			this.box.setPos(leftTop);
		}
	}

	update() {

	}

	draw(ctx) {
		if (!IsNullOrUndefined(this.box)) {
			this.box.draw(ctx);
		}
	}
}

class Passage extends BaseClass {
	#cell1 = null 
	#cell2 = null 
	mainRect = null;
	bendRect = null;

	constructor(cell1, cell2) {
		super(new Point(0, 0), new Point(0, 0));
		this.#cell1 = cell1;
		this.#cell2 = cell2;
		this.connectCells(cell1, cell2);
		super.setPos(this.mainRect.leftTop);
	}

	connectCells(cell1, cell2) {
		if (cell1.box.left == cell2.box.left) {
			var leftTop = new Point(cell1.box.left, cell1.box.bottom);
			var v1 = new Vector(leftTop.x, leftTop.y);
			var v2 = new Vector(cell2.box.left, cell2.box.top);
			var height = v1.minus(v2).magnitude();
			var size = new Point(10, height);
			this.mainRect = new Rect(leftTop, size, '#00FF00', false);
		}
		else if (cell1.box.top == cell2.box.top) {
			var leftTop = new Point(cell1.box.right, cell1.box.top);
			var v1 = new Vector(leftTop.x, leftTop.y);
			var v2 = new Vector(cell2.box.left, cell2.box.top);
			var size = new Point(v1.minus(v2).magnitude(), 10);
			this.mainRect = new Rect(leftTop, size, '#0000FF', false);
		}
		else {
			var leftTop = new Point(cell1.box.left, cell1.box.bottom);
			var v1 = new Vector(leftTop.x, leftTop.y);
			var v2 = new Vector(cell1.box.left, cell2.box.top);
			var size = new Point(10, v1.minus(v2).magnitude());
			this.mainRect = new Rect(leftTop, size, '#000000', false);
		}
	}

	setPos(leftTop) {
		if (!IsNullOrUndefined(this.mainRect))
		{
			this.mainRect.setPos(leftTop);
			if (!IsNullOrUndefined(this.bendRect)) {
				this.bendRect.setPos(this.mainRect.leftBottom);
			}
			super.setPos(this.mainRect.leftTop);
		}
	}

	update() {

	}

	draw(ctx) {
		if (!IsNullOrUndefined(this.mainRect)) {
			this.mainRect.draw(ctx);
		}
		if (!IsNullOrUndefined(this.bendRect)) {
			this.bendRect.draw(ctx);
		}
	}
}

class Dungeon {
	#isGrid = true
	#grid = []
	#cells = []
	#passages = []
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

	constructor(rows, cols, tileSize, isGrid = false) {
		this.isGrid = isGrid;
		this.rows = rows;
		this.cols = cols;
		this.tileSize = tileSize;
		this.generateGrid();
		this.generateCells();
		var boundingRect = document.getElementById('drawingArea').getBoundingClientRect();
		var origin = new Point(0, 0);
		var size = new Point(boundingRect.width, boundingRect.height);
		var max = new Point(this.cols * this.tileSize - this.tileSize + 8, this.rows * this.tileSize - this.tileSize + 8);
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
		var x = 8;
		var y = 8;
		for (var i = 0; i < this.rows; i++) {
			for (var j = 0; j < this.cols; j++) {
				var color = this.randomColor();
				var leftTop = new Point(x, y);
				var size = new Point(this.tileSize, this.tileSize);
				this.#grid.push(new BorderedRect(leftTop, size, color, 1));
				y = j * this.tileSize + 8;
			}
			x = i * this.tileSize + 8;
			y = 8;
		}
	}

	initializeCells() {
		var cellSize = 8;
		var roomSize = cellSize * this.tileSize;
		var x = 8;
		var y = 8;
		for (var i = 0; i < this.rows / cellSize; i++) {
			for (var j = 0; j < this.cols / cellSize; j++) {
				this.#cells.push(new Cell(new Point(x, y), new Point(roomSize, roomSize)));
				y += roomSize;
			}
			y = 8;
			x += roomSize;
		}
	}

	generateCells() {
		this.initializeCells();
		var cellSize = 8;
		var maxRooms = 20;
		var minRooms = 10;
		var roomNumber = Random(minRooms, maxRooms);
		var cellList = Range(this.#cells.length);
		for (var i = 0; i < roomNumber; i++) {
			var nextRoomIndex = cellList.choice();
			var cell = this.#cells[nextRoomIndex];
			cell.generateRoom();
		}
		this.generatePassages();
	}

	generatePassages() {
		var cellSize = 8;
		var cellRows = this.rows / cellSize;
		var cellCols = this.cols / cellSize;
		for (var i = 0; i < cellRows; i++) {
			for (var j = 0; j < cellCols; j++) {
				var cell1 = this.#cells[i * cellRows + j];
				if (cell1.hasRoom) {
					this.generatePassageLeft(cell1, i, j);
					this.generatePassageDown(cell1, i, j);
				}
			}
		}
	}

	generatePassageDown(cell1, i, j) {
		var cellSize = 8;
		var cellRows = this.rows / cellSize;
		var cellCols = this.cols / cellSize;
		for (var h = j + 1; h < cellCols; h++) {
			var cell2 = this.#cells[i * cellRows + h];
			if (this.checkAddPassage(cell1, cell2)) {
				break;
			}
		}
	}

	generatePassageLeft(cell1, i, j) {
		var cellSize = 8;
		var cellRows = this.rows / cellSize;
		var cellCols = this.cols / cellSize;
		for (var h = i + 1; h < cellRows; h++) {
			var cell2 = this.#cells[h * cellRows + j];
			if (this.checkAddPassage(cell1, cell2)) {
				break;
			}
		}
	}

	checkAddPassage(cell1, cell2) {
		if (cell2.hasRoom) {
			this.#passages.push(new Passage(cell1, cell2));
			return true;
		}
		return false;
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


			for (var i = 0; i < this.#passages.length; i++) {
				DrawWithOffset(ctx, this.#passages[i], offset);
			}

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