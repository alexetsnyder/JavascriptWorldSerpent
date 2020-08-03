//map.mjs
//import Rand, {PRNG} from 'rand-seed';
import { Camera } from './camera.mjs';
import { BaseClass, BorderedRect, Vector, Point, Rect, Color } from './drawing.mjs';

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

const ROOM_COLOR = Color.YELLOW;
const LEFT_PASSAGE_COLOR = Color.NEON_BLUE;
const DOWN_PASSAGE_COLOR = Color.NEON_PINK;
const BENT_PASSAGE_COLOR = Color.RED;

class Cell extends BaseClass {
	room = null
	#hasRoom = false;
	#isConnected = false;

	get hasRoom() {
		return this.#hasRoom;
	}

	set hasRoom(value) {
		this.#hasRoom = value;
	}

	get isConnected() {
		return this.#isConnected;
	}

	set isConnected(value) {
		this.#isConnected = value;
	}

	connect(cell2) {
		this.isConnected = true;
		cell2.isConnected = true;
	}

	generateRoom() {
		this.hasRoom = true;
		var roomWidth = Random(this.width / 4, this.width - 10);
		var roomHeight = Random(this.height / 4, this.height - 10);
		var size = new Point(roomWidth, roomHeight);

		this.room = new Rect(this.leftTop, size, ROOM_COLOR, false);
	}

	setPos(leftTop) {
		super.setPos(leftTop);
		if (!IsNullOrUndefined(this.room)) {
			this.room.setPos(leftTop);
		}
	}

	update() {

	}

	draw(ctx) {
		if (!IsNullOrUndefined(this.room)) {
			this.room.draw(ctx);
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
		cell1.connect(cell2);
		if (cell1.room.left == cell2.room.left) {
			var leftTop = new Point(cell1.room.left, cell1.room.bottom);
			var v1 = new Vector(leftTop.x, leftTop.y);
			var v2 = new Vector(cell2.room.left, cell2.room.top);
			var height = v1.minus(v2).magnitude();
			var size = new Point(10, height);
			this.mainRect = new Rect(leftTop, size, DOWN_PASSAGE_COLOR, false);
		}
		else if (cell1.room.top == cell2.room.top) {
			var leftTop = new Point(cell1.room.right, cell1.room.top);
			var v1 = new Vector(leftTop.x, leftTop.y);
			var v2 = new Vector(cell2.room.left, cell2.room.top);
			var size = new Point(v1.minus(v2).magnitude(), 10);
			this.mainRect = new Rect(leftTop, size, LEFT_PASSAGE_COLOR, false);
		}
		else {
			this.bentCases(cell1, cell2);
		}
	}

	bentCases(cell1, cell2) {
		if (cell1.room.left > cell2.room.right && cell1.room.top > cell2.room.bottom) {
			//console.log('To the right and below');
			var v1 = new Vector(cell2.room.left, cell2.room.bottom);
			var v2 = new Vector(cell2.room.left, cell1.room.top);
			var size = new Point(10, v1.minus(v2).magnitude());
			this.mainRect = new Rect(v1.toPoint(), size, BENT_PASSAGE_COLOR, false);

			v1 = new Vector(cell2.room.left, cell1.room.top);
			v2 = new Vector(cell1.room.left, cell1.room.top);
			size = new Point(v1.minus(v2).magnitude(), 10);
			this.bendRect = new Rect(v1.toPoint(), size, BENT_PASSAGE_COLOR, false);
		}
		else if (cell1.room.right < cell2.room.left && cell1.room.top > cell2.room.bottom) {
			//console.log('To the left and below');
			var v1 = new Vector(cell1.room.right, cell1.room.top);
			var v2 = new Vector(cell2.room.left, cell1.room.top);
			var size = new Point(v1.minus(v2).magnitude() + 10, 10);
			this.mainRect = new Rect(v1.toPoint(), size, BENT_PASSAGE_COLOR, false);

			v1 = new Vector(cell2.room.left, cell2.room.bottom);
			v2 = new Vector(cell2.room.left, cell1.room.top);
			size = new Point(10, v1.minus(v2).magnitude());
			this.bendRect = new Rect(v1.toPoint(), size, BENT_PASSAGE_COLOR, false);
		}
		else if (cell1.room.left > cell2.room.right && cell1.room.bottom < cell2.room.top) {
			//console.log('To the right and above');
			var v1 = new Vector(cell1.room.left, cell1.room.bottom);
			var v2 = new Vector(cell1.room.left, cell2.room.top);
			var size = new Point(10, v1.minus(v2).magnitude() + 10);
			this.mainRect = new Rect(v1.toPoint(), size, BENT_PASSAGE_COLOR, false);

			var v3 = new Vector(cell2.room.right, cell2.room.top);
			var v4 = new Vector(cell1.room.left, cell2.room.top);
			size = new Point(v3.minus(v4).magnitude(), 10);
			this.bendRect = new Rect(v3.toPoint(), size, BENT_PASSAGE_COLOR, false);
		}
		else {
			//console.log('To the left and above');
			var v1 = new Vector(cell1.room.left, cell1.room.bottom);
			var v2 = new Vector(cell1.room.left, cell2.room.top);
			var size = new Point(10, v1.minus(v2).magnitude());
			this.mainRect = new Rect(v1.toPoint(), size, BENT_PASSAGE_COLOR, false);

			v1 = new Vector(cell1.room.left, cell2.room.top);
			v2 = new Vector(cell2.room.left, cell2.room.top);
			size = new Point(v1.minus(v2).magnitude(), 10);
			this.bendRect = new Rect(v1.toPoint(), size, BENT_PASSAGE_COLOR, false);
		}
	}

	setBentRectPos(leftTop) {
		if (this.#cell1.room.left > this.#cell2.room.right && this.#cell1.room.top > this.#cell2.room.bottom) {
			//To the right and below
			var leftBottom = this.mainRect.leftBottom;
			this.bendRect.setPos(leftBottom);
		}
		else if (this.#cell1.room.right < this.#cell2.room.left && this.#cell1.room.top > this.#cell2.room.bottom) {
			//To the left and below
			var rightBottom = this.mainRect.rightBottom;
			this.bendRect.setPos(new Point(rightBottom.x - this.mainRect.height, rightBottom.y - this.bendRect.height - this.mainRect.height));
		}
		else if (this.#cell1.room.left > this.#cell2.room.right && this.#cell1.room.bottom < this.#cell2.room.top) {
			//To the right and above
			var rightBottom = this.mainRect.rightBottom;
			this.bendRect.setPos(new Point(rightBottom.x - this.bendRect.width - this.mainRect.width, rightBottom.y - this.mainRect.width));
		}
		else {
			//To the left and above
			var leftBottom = this.mainRect.leftBottom;
			this.bendRect.setPos(leftBottom);
		}
	}

	setPos(leftTop) {
		if (!IsNullOrUndefined(this.mainRect))
		{
			this.mainRect.setPos(leftTop);
			if (!IsNullOrUndefined(this.bendRect)) {
				this.setBentRectPos(leftTop);
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
	#hasBentPassage = false;

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

	get hasBentPassage() {
		return this.#hasBentPassage;
	}

	set hasBentPassage(value) {
		this.#hasBentPassage = value;
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
		var max = new Point(this.cols * this.tileSize, this.rows * this.tileSize);
		this.#camera = new Camera(origin, size, max);
		this.wire_events();
	}

	wire_events() {
		var btnRegenerate = document.getElementById('btnRegenerateDungeon');
		btnRegenerate.onclick = (btnEventArgs) => this.onRegenerateDungeon(btnEventArgs);
		var btnRegenerateUntilBent = document.getElementById('btnRegenerateUntilBent');
		btnRegenerateUntilBent.onclick = (btnEventArgs) => this.onRegenerateUntilBent(btnEventArgs);
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
					var hasLeftConnection = this.generatePassageLeft(cell1, i, j);
					var hasDownConnection = this.generatePassageDown(cell1, i, j);
					if (!hasLeftConnection && !hasDownConnection && !cell1.isConnected) {
						this.generatePassageBent(cell1, i, j);
					}
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
				return true;
			}
		}
		return false;
	}

	generatePassageLeft(cell1, i, j) {
		var cellSize = 8;
		var cellRows = this.rows / cellSize;
		var cellCols = this.cols / cellSize;
		for (var h = i + 1; h < cellRows; h++) {
			var cell2 = this.#cells[h * cellRows + j];
			if (this.checkAddPassage(cell1, cell2)) {
				return true;
			}
		}
		return false;
	}

	generatePassageBent(cell1, i, j) {
		this.hasBentPassage = true;
		var cellSize = 8;
		var cellRows = this.rows / cellSize;
		var cellCols = this.cols / cellSize;
		var cell2 = null;
		var minDistance = cellRows * cellSize * this.tileSize;
		for (var h = 0; h < cellRows; h++) {
			for (var k = 0; k < cellCols; k++) {
				if (h !== i || k !== j) {
					var tempCell = this.#cells[h * cellRows + k];
					if (tempCell.hasRoom) {
						var v1 = new Vector(cell1.room.cx, cell1.room.cy);
						var v2 = new Vector(tempCell.room.cx, tempCell.room.cy);
						var distance = v1.minus(v2).magnitude();
						if (distance < minDistance) {
							minDistance = distance;
							cell2 = tempCell;
						}
					}
				}
			}
		}

		if (!IsNullOrUndefined(cell2)) {
			this.#passages.push(new Passage(cell1, cell2));
		}
	}

	checkAddPassage(cell1, cell2) {
		if (cell2.hasRoom) {
			this.#passages.push(new Passage(cell1, cell2));
			return true;
		}
		return false;
	}

	clear() {
		this.#cells.length = 0;
		this.#passages.length = 0;
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

	onRegenerateDungeon(btnEventArgs) {
		this.clear();
		this.generateCells();
	}

	onRegenerateUntilBent(btnEventArgs) {
		while (this.hasBentPassage === false) {
			this.clear();
			this.generateCells();
		}
		this.hasBentPassage = false;
	}
}

export { Dungeon };