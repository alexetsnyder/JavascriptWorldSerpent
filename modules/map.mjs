//map.mjs
import { Camera } from './camera.mjs';
import { Random, Range, DrawWithOffset, IsNullOrUndefined } from './system.mjs';
import { BaseClass, BorderedRect, Vector, Point, Rect, Color } from './drawing.mjs';

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

	constructor(rows, cols, tileSize) {
		super(rows, cols, tileSize);
		this.generateGrid();
		this.setUpCamera();
	}

	setUpCamera() {
		var boundingRect = document.getElementById('drawingArea').getBoundingClientRect();
		var origin = new Point(0, 0);
		var size = new Point(boundingRect.width, boundingRect.height);
		var max = new Point(this.cols * this.tileSize, this.rows * this.tileSize);
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

	update() {
		this.#camera.update();
	}

	draw(ctx) {
		var offset = this.#camera.getOffset(new Point(0, 0), this.tileSize);
		for (var i = 0; i < this.rows; i++) {
			for (var j = 0; j < this.cols; j++) {
				DrawWithOffset(ctx, this.grid[i * this.rows + j], offset);
			}
		}
	}

	onSwitchTo() {
		this.#camera.reWireEvents();
	}
}

const ROOM_COLOR = Color.YELLOW;
const LEFT_PASSAGE_COLOR = Color.NEON_BLUE;
const DOWN_PASSAGE_COLOR = Color.NEON_PINK;

class Cell extends BaseClass {
	room = null
	#hasRoom = false;
	#hasPassage = false;

	get hasRoom() {
		return this.#hasRoom;
	}

	set hasRoom(value) {
		this.#hasRoom = value;
	}

	get hasPassage() {
		return this.#hasPassage;
	}

	set hasPassage(value) {
		this.#hasPassage = value;
	}

	connect(cell2) {
		this.hasPassage = true;
		cell2.hasPassage = true;
	}

	generateRoom() {
		this.hasRoom = true;
		var roomWidth = random.from(this.width / 4, this.width - 10);
		var roomHeight = random.from(this.height / 4, this.height - 10);
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
			this.mainRect = new Rect(v1.toPoint(), size, DOWN_PASSAGE_COLOR, false);

			v1 = new Vector(cell2.room.left, cell1.room.top);
			v2 = new Vector(cell1.room.left, cell1.room.top);
			size = new Point(v1.minus(v2).magnitude(), 10);
			this.bendRect = new Rect(v1.toPoint(), size, LEFT_PASSAGE_COLOR, false);
		}
		else if (cell1.room.right < cell2.room.left && cell1.room.top > cell2.room.bottom) {
			//console.log('To the left and below');
			var v1 = new Vector(cell1.room.right, cell1.room.top);
			var v2 = new Vector(cell2.room.left, cell1.room.top);
			var size = new Point(v1.minus(v2).magnitude() + 10, 10);
			this.mainRect = new Rect(v1.toPoint(), size, LEFT_PASSAGE_COLOR, false);

			v1 = new Vector(cell2.room.left, cell2.room.bottom);
			v2 = new Vector(cell2.room.left, cell1.room.top);
			size = new Point(10, v1.minus(v2).magnitude());
			this.bendRect = new Rect(v1.toPoint(), size, DOWN_PASSAGE_COLOR, false);
		}
		else if (cell1.room.left > cell2.room.right && cell1.room.bottom < cell2.room.top) {
			//console.log('To the right and above');
			var v1 = new Vector(cell1.room.left, cell1.room.bottom);
			var v2 = new Vector(cell1.room.left, cell2.room.top);
			var size = new Point(10, v1.minus(v2).magnitude() + 10);
			this.mainRect = new Rect(v1.toPoint(), size, DOWN_PASSAGE_COLOR, false);

			var v3 = new Vector(cell2.room.right, cell2.room.top);
			var v4 = new Vector(cell1.room.left, cell2.room.top);
			size = new Point(v3.minus(v4).magnitude(), 10);
			this.bendRect = new Rect(v3.toPoint(), size, LEFT_PASSAGE_COLOR, false);
		}
		else {
			//console.log('To the left and above');
			var v1 = new Vector(cell1.room.left, cell1.room.bottom);
			var v2 = new Vector(cell1.room.left, cell2.room.top);
			var size = new Point(10, v1.minus(v2).magnitude());
			this.mainRect = new Rect(v1.toPoint(), size, DOWN_PASSAGE_COLOR, false);

			v1 = new Vector(cell1.room.left, cell2.room.top);
			v2 = new Vector(cell2.room.left, cell2.room.top);
			size = new Point(v1.minus(v2).magnitude(), 10);
			this.bendRect = new Rect(v1.toPoint(), size, LEFT_PASSAGE_COLOR, false);
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

class Dungeon extends Grid {
	#cells = []
	#passages = []
	#camera = null
	#cellSize = 0
	#tilesPerCell = 0
	#cellsPerRow = 0
	#cellsPerCol = 0
	#maxRooms = 0
	#minRooms = 0
	#hasBentPassage = false;

	get cellSize() {
		return this.#cellSize;
	}

	set cellSize(value) {
		this.#cellSize = value;
	}

	get tilesPerCell() {
		return this.#tilesPerCell;
	}

	set tilesPerCell(value) {
		this.#tilesPerCell = value;
	}

	get cellsPerRow() {
		return this.#cellsPerRow;
	}

	set cellsPerRow(value) {
		this.#cellsPerRow = value;
	}

	get cellsPerCol() {
		return this.#cellsPerCol;
	}

	set cellsPerCol(value) {
		this.#cellsPerCol = value;
	}

	get maxRooms() {
		return this.#maxRooms;
	}

	set maxRooms(value) {
		this.#maxRooms = value;
	}

	get minRooms() {
		return this.#minRooms;
	}

	set minRooms(value) {
		this.#minRooms = value;
	}

	get hasBentPassage() {
		return this.#hasBentPassage;
	}

	set hasBentPassage(value) {
		this.#hasBentPassage = value;
	}

	constructor(rows, cols, tileSize, tilesPerCell, minRooms=10, maxRooms=20) {
		super(rows, cols, tileSize);
		this.tilesPerCell = tilesPerCell;
		this.cellsPerRow = this.rows / tilesPerCell;
		this.cellsPerCol = this.cols / tilesPerCell;
		this.cellSize = tilesPerCell * this.tileSize;
		this.minRooms = minRooms;
		this.maxRooms = maxRooms;
		this.generateCells();
		this.setUpCamera();
		this.wireEvents();
	}

	setUpCamera() {
		var boundingRect = document.getElementById('drawingArea').getBoundingClientRect();
		var origin = new Point(0, 0);
		var size = new Point(boundingRect.width, boundingRect.height);
		var max = new Point(this.cols * this.tileSize, this.rows * this.tileSize);
		this.#camera = new Camera(origin, size, max);
	}

	wireEvents() {
		var btnRegenerate = document.getElementById('btnRegenerateDungeon');
		btnRegenerate.onclick = (btnEventArgs) => this.onRegenerateDungeon(btnEventArgs);
		var btnRegenerateUntilBent = document.getElementById('btnRegenerateUntilBent');
		btnRegenerateUntilBent.onclick = (btnEventArgs) => this.onRegenerateUntilBent(btnEventArgs);
	}

	initializeCells() {
		var x = 8;
		var y = 8;
		for (var i = 0; i < this.cellsPerRow; i++) {
			for (var j = 0; j < this.cellsPerCol; j++) {
				this.#cells.push(new Cell(new Point(x, y), new Point(this.cellSize, this.cellSize)));
				y += this.cellSize;
			}
			y = 8;
			x += this.cellSize;
		}
	}

	generateCells() {
		this.initializeCells();
		var roomNumber = random.from(this.minRooms, this.maxRooms);
		var cellList = Range(this.#cells.length);
		for (var i = 0; i < roomNumber; i++) {
			var nextRoomIndex = random.choice(cellList.toArray());
			var cell = this.#cells[nextRoomIndex];
			cell.generateRoom();
			cellList.remove(nextRoomIndex);
		}
		this.generatePassages();
	}

	generatePassages() {
		for (var i = 0; i < this.cellsPerRow; i++) {
			for (var j = 0; j < this.cellsPerRow; j++) {
				var cell1 = this.#cells[i * this.cellsPerRow + j];
				if (cell1.hasRoom) {
					var hasLeftConnection = this.generatePassageLeft(cell1, i, j);
					var hasDownConnection = this.generatePassageDown(cell1, i, j);
					if (!hasLeftConnection && !hasDownConnection && !cell1.hasPassage) {
						this.generatePassageBent(cell1, i, j);
					}
				}
			}
		}
	}

	generatePassageDown(cell1, i, j) {
		for (var h = j + 1; h < this.cellsPerCol; h++) {
			var cell2 = this.#cells[i * this.cellsPerRow + h];
			if (this.checkAddPassage(cell1, cell2)) {
				return true;
			}
		}
		return false;
	}

	generatePassageLeft(cell1, i, j) {
		for (var h = i + 1; h < this.cellsPerRow; h++) {
			var cell2 = this.#cells[h * this.cellsPerRow + j];
			if (this.checkAddPassage(cell1, cell2)) {
				return true;
			}
		}
		return false;
	}

	generatePassageBent(cell1, i, j) {
		this.hasBentPassage = true;
		var cell2 = null;
		var minDistance = this.cellSize * this.tileSize;
		for (var h = 0; h < this.cellsPerRow; h++) {
			for (var k = 0; k < this.cellsPerCol; k++) {
				if (h !== i || k !== j) {
					var tempCell = this.#cells[h * this.cellsPerRow + k];
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
		var offset = this.#camera.getOffset(new Point(0, 0), this.tileSize);
		for (var i = 0; i < this.#passages.length; i++) {
			DrawWithOffset(ctx, this.#passages[i], offset);
		}

		for (var i = 0; i < this.#cells.length; i++) {
			DrawWithOffset(ctx, this.#cells[i], offset);
		}
	}

	onRegenerateDungeon(btnEventArgs) {
		random.seed = document.getElementById("txtSeed").value;
		this.clear();
		this.generateCells();
	}

	onRegenerateUntilBent(btnEventArgs) {
		random.seed = document.getElementById("txtSeed").value;
		while (this.hasBentPassage === false) {
			this.clear();
			this.generateCells();
		}
		this.hasBentPassage = false;
	}

	onSwitchTo() {
		this.#camera.reWireEvents();
		document.getElementById("txtSeed").value = random.seed;
	}
}

export { Dungeon, ColorGrid };