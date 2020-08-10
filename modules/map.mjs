//map.mjs
import { Random, Range, DrawWithOffset, IsNullOrUndefined, Tabs } from './system.mjs';
import { BaseClass, Vector, Point, Rect, Color, Text } from './drawing.mjs';

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
const ROOM_COLOR = Color.YELLOW;
const LEFT_PASSAGE_COLOR = Color.NEON_BLUE;
const DOWN_PASSAGE_COLOR = Color.NEON_PINK;

class Cell extends BaseClass {
	room = null
	cellRect = null
	entranceText = null
	#showCells = false
	#hasRoom = false
	#hasPassage = false
	#passages = []
	#isEntrance = false;
	#visited = false;

	get visited() {
		return this.#visited;
	}

	set visited(value) {
		this.#visited = value;
	}

	get passages() {
		return this.#passages;
	}

	set passages(value) {
		this.#passages = value;
	}

	get showCells() {
		return this.#showCells;
	}

	set showCells(value) {
		this.#showCells = value;
	}

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

	get isEntrance() {
		return this.#isEntrance;
	}

	set isEntrance(value) {
		this.#isEntrance = value;
	}

	constructor(leftTop, size, showCells) {
		super(leftTop, size);
		this.showCells = showCells;
		this.cellRect = new Rect(this.leftTop, this.size, Color.RED, false);
	}

	connect(cell2, passage) {
		this.hasPassage = true;
		cell2.hasPassage = true;
		this.passages.push(passage);
		cell2.passages.push(passage);
	}

	generateRoom() {
		this.hasRoom = true;
		var roomWidth = random.from(this.width / 4, this.width - 10);
		var roomHeight = random.from(this.height / 4, this.height - 10);
		var size = new Point(roomWidth, roomHeight);
		var leftTop = new Point(this.cx - roomWidth / 2, this.cy - roomHeight / 2);

		this.entranceText = new Text('E', this.center);
		this.room = new Rect(leftTop, size, ROOM_COLOR, false);
	}

	toggleShowCells() {
		this.showCells = !this.showCells;
	}

	setPos(leftTop) {
		super.setPos(leftTop);
		if (!IsNullOrUndefined(this.cellRect)) {
			this.cellRect.setPos(this.leftTop);
		}
		if (!IsNullOrUndefined(this.room)) {
			this.room.setPos(new Point(this.cx - this.room.width / 2, this.cy - this.room.height / 2));
		}
		if (!IsNullOrUndefined(this.entranceText)) {
			this.entranceText.setPos(this.center);
		}
	}

	update() {

	}

	draw(ctx) {
		if (this.showCells) {
			this.cellRect.draw(ctx);
		}
		if (!IsNullOrUndefined(this.room)) {
			this.room.draw(ctx);
		}
		if (this.isEntrance) {
			this.entranceText.draw(ctx);
		}
	}
}

class Passage extends BaseClass {
	#cell1 = null 
	#cell2 = null 
	mainRect = null;
	bendRect = null;

	get cell1() {
		return this.#cell1;
	}

	set cell1(value) {
		this.$cell1 = value;
	}

	get cell2() {
		return this.#cell2;
	}

	set cell2(value) {
		this.#cell2 = value;
	}

	constructor(cell1, cell2) {
		super(new Point(0, 0), new Point(0, 0));
		this.#cell1 = cell1;
		this.#cell2 = cell2;
		this.connectCells(cell1, cell2);
		super.setPos(this.mainRect.leftTop);
	}

	connectCells(cell1, cell2) {
		cell1.connect(cell2, this);
		if (cell1.room.cx == cell2.room.cx) {
			var centerX = cell1.room.cx - 5;
			var v1 = new Vector(centerX, cell1.room.bottom);
			var v2 = new Vector(centerX, cell2.room.top);
			var size = new Point(10, v1.minus(v2).magnitude());
			this.mainRect = new Rect(v1.toPoint(), size, DOWN_PASSAGE_COLOR, false);
		}
		else if (cell1.room.cy == cell2.room.cy) {
			var centerY = cell1.room.cy - 5;
			var v1 = new Vector(cell1.room.right, centerY);
			var v2 = new Vector(cell2.room.left, centerY);
			var size = new Point(v1.minus(v2).magnitude(), 10);
			this.mainRect = new Rect(v1.toPoint(), size, LEFT_PASSAGE_COLOR, false);
		}
		else {
			this.bentCases(cell1, cell2);
		}
	}

	bentCases(cell1, cell2) {
		if (cell1.room.left > cell2.room.right && cell1.room.top > cell2.room.bottom) {
			//console.log('To the right and below');
			var centerX = cell2.room.cx - 5;
			var centerY = cell1.room.cy - 5;

			var v1 = new Vector(centerX, cell2.room.bottom);
			var v2 = new Vector(centerX, centerY);
			var size = new Point(10, v1.minus(v2).magnitude());
			this.mainRect = new Rect(v1.toPoint(), size, DOWN_PASSAGE_COLOR, false);

			v1 = new Vector(centerX, centerY);
			v2 = new Vector(cell1.room.left, centerY);
			size = new Point(v1.minus(v2).magnitude(), 10);
			this.bendRect = new Rect(v1.toPoint(), size, LEFT_PASSAGE_COLOR, false);
		}
		else if (cell1.room.right < cell2.room.left && cell1.room.top > cell2.room.bottom) {
			//console.log('To the left and below');
			var centerX = cell2.room.cx - 5;
			var centerY = cell1.room.cy - 5;

			var v1 = new Vector(cell1.room.right, centerY);
			var v2 = new Vector(centerX, centerY);
			var size = new Point(v1.minus(v2).magnitude() + 10, 10);
			this.mainRect = new Rect(v1.toPoint(), size, LEFT_PASSAGE_COLOR, false);

			v1 = new Vector(centerX, cell2.room.bottom);
			v2 = new Vector(centerX, centerY);
			size = new Point(10, v1.minus(v2).magnitude());
			this.bendRect = new Rect(v1.toPoint(), size, DOWN_PASSAGE_COLOR, false);
		}
		else if (cell1.room.left > cell2.room.right && cell1.room.bottom < cell2.room.top) {
			//console.log('To the right and above');
			var centerX = cell1.room.cx - 5;
			var centerY = cell2.room.cy - 5;

			var v1 = new Vector(centerX, cell1.room.bottom);
			var v2 = new Vector(centerX, centerY);
			var size = new Point(10, v1.minus(v2).magnitude() + 10);
			this.mainRect = new Rect(v1.toPoint(), size, DOWN_PASSAGE_COLOR, false);

			var v3 = new Vector(cell2.room.right, centerY);
			var v4 = new Vector(centerX, centerY);
			size = new Point(v3.minus(v4).magnitude(), 10);
			this.bendRect = new Rect(v3.toPoint(), size, LEFT_PASSAGE_COLOR, false);
		}
		else {
			//console.log('To the left and above');
			var centerX = cell1.room.cx - 5;
			var centerY = cell2.room.cy - 5;

			var v1 = new Vector(centerX, cell1.room.bottom);
			var v2 = new Vector(centerX, centerY);
			var size = new Point(10, v1.minus(v2).magnitude());
			this.mainRect = new Rect(v1.toPoint(), size, DOWN_PASSAGE_COLOR, false);

			v1 = new Vector(centerX, centerY);
			v2 = new Vector(cell2.room.left, centerY);
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
	#entrance = null
	#isShowingCells = false;
	#magnificationLevels = [-2, -1, 0, 1, 2]
	#currentLevel = 2

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

	constructor(camera, rows, cols, tileSize, tilesPerCell, minRooms, maxRooms) {
		super(rows, cols, tileSize);
		this.tilesPerCell = tilesPerCell;
		this.cellsPerRow = this.rows / tilesPerCell;
		this.cellsPerCol = this.cols / tilesPerCell;
		this.cellSize = tilesPerCell * this.tileSize;
		this.minRooms = minRooms;
		this.maxRooms = maxRooms;
		document.getElementById("txtSeed").value = random.seed;
		do {
			this.generateCells();
		} while (!this.isConnected());
		this.#camera = camera;
		this.wireEvents();
		this.updateDungeonInfo();
	}

	wireEvents() {
		var btnRegenerate = document.getElementById('btnRegenerateDungeon');
		btnRegenerate.onclick = (btnEventArgs) => this.onRegenerateDungeon(btnEventArgs);
		var btnRegenerateUntilBent = document.getElementById('btnRegenerateUntilBent');
		btnRegenerateUntilBent.onclick = (btnEventArgs) => this.onRegenerateUntilBent(btnEventArgs);
		var btnShowCells = document.getElementById('btnShowCells');
		btnShowCells.onclick = (btnEventArgs) => this.onShowCells(btnEventArgs);
		var btnUnconnected = document.getElementById("btnRegenerateUntilUnconnected");
		btnUnconnected.onclick = (btnEventArgs) => this.onRegenerateUntilUnconnected(btnEventArgs);
		var btnMagnifyx2 = document.getElementById("btnMagnifyx2");
		var btnMagnify2x = document.getElementById("btnMagnify2x");
		btnMagnifyx2.onclick = (btnEventArgs) => this.onMagnifyx2(btnEventArgs);
		btnMagnify2x.onclick = (btnEventArgs) => this.onMagnify2x(btnEventArgs);
	}

	updateDungeonInfo() {
		document.getElementById('txtRows').value = this.rows;
		document.getElementById('txtColumns').value = this.cols;
		document.getElementById('txtTileSize').value = this.tileSize;
		document.getElementById('txtTilesPerCell').value = this.tilesPerCell;
		document.getElementById('txtMinRooms').value = this.minRooms;
		document.getElementById('txtMaxRooms').value = this.maxRooms;
	}

	initializeCells() {
		var x = 8;
		var y = 8;
		for (var i = 0; i < this.cellsPerRow; i++) {
			for (var j = 0; j < this.cellsPerCol; j++) {
				this.#cells.push(new Cell(new Point(x, y), new Point(this.cellSize, this.cellSize), false));
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
		this.generateEntrance();
	}

	generateEntrance() {
		var entrance = null;
		var minPassages = 10;
		for (var i = 0; i < this.#cells.length; i++) {
			var cell = this.#cells[i];
			if (cell.hasRoom && cell.passages.length < minPassages) {
				minPassages = cell.passages.length;
				entrance = cell;
			}
		}
		entrance.isEntrance = true;
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

	countCellsRecursive(cell) {
		var roomNumber = 1;
		cell.visited = true;
		if (!IsNullOrUndefined(cell.passages)) {
			for (var i = 0; i < cell.passages.length; i++) {
				var passage = cell.passages[i];
					if (!passage.cell1.visited) {
						roomNumber += this.countCellsRecursive(passage.cell1);
					}
					if (!passage.cell2.visited) {
						roomNumber += this.countCellsRecursive(passage.cell2);
					}
			}
		}
		return roomNumber;
	}

	getEntrance() {
		for (var i = 0; i < this.#cells.length; i++) {
			var cell = this.#cells[i];
			if (cell.hasRoom) {
				if (cell.isEntrance) {
					return cell;
				}
			}
		}
		return null;
	}

	isConnected() {
		var entrance = null;
		var roomNumber = 0;
		for (var i = 0; i < this.#cells.length; i++) {
			var cell = this.#cells[i];
			if (cell.hasRoom) {
				roomNumber++;
				if (cell.isEntrance) {
					entrance = cell;
				}
			}
		}

		if (this.countCellsRecursive(entrance) === roomNumber) {
			return true;
		}
		return false;
	}

	pause() {
		this.#camera.isPaused = true;
	}

	unPause() {
		this.#camera.isPaused = false;
	}

	clear() {
		this.#cells.length = 0;
		this.#passages.length = 0;
	}

	showCells() {
		for (var i = 0; i < this.#cells.length; i++) {
			this.#cells[i].toggleShowCells();
		}
	}

	getMagnificationMultiplier() {
		var value = this.#magnificationLevels[this.#currentLevel];
		var multiplier = 1;
		switch (value) {
			case -2:
				multiplier = 1/4;
				break;
			case -1:
				multiplier = 1/2;
				break;
			case  1:
				multiplier = 2;
				break;
			case  2:
				multiplier = 4;
				break; 
		}
		return multiplier;
	}

	getGenerationInfo() {
		random.seed = document.getElementById("txtSeed").value;
		this.rows = parseInt(document.getElementById("txtRows").value);
		this.cols = parseInt(document.getElementById("txtColumns").value);
		var magnifyMultiplier = this.getMagnificationMultiplier();
		this.tileSize = parseInt(document.getElementById("txtTileSize").value) * magnifyMultiplier;
		this.tilesPerCell = parseInt(document.getElementById("txtTilesPerCell").value);
		this.minRooms = parseInt(document.getElementById("txtMinRooms").value);
		this.maxRooms = parseInt(document.getElementById("txtMaxRooms").value);
		this.cellsPerRow = parseInt(this.rows / this.tilesPerCell);
		this.cellsPerCol = parseInt(this.cols / this.tilesPerCell);
		this.cellSize = parseInt(this.tilesPerCell * this.tileSize);
	}

	regenerate() {
		this.clear();
		this.generateCells();
		if (this.#isShowingCells) {
			this.showCells();
		}
	}

	update() {
		this.#camera.update();
	}

	draw(ctx) {
		var offset = this.#camera.getOffset();
		for (var i = 0; i < this.#passages.length; i++) {
			DrawWithOffset(ctx, this.#passages[i], offset);
		}

		for (var i = 0; i < this.#cells.length; i++) {
			DrawWithOffset(ctx, this.#cells[i], offset);
		}
	}

	onRegenerateDungeon(btnEventArgs) {
		this.getGenerationInfo();
		do {
			this.regenerate();
		} while (!this.isConnected());
	}

	onRegenerateUntilBent(btnEventArgs) {
		this.getGenerationInfo();
		while (this.hasBentPassage === false) {
			this.regenerate();
		}
		this.hasBentPassage = false;
	}

	onRegenerateUntilUnconnected(btnEventArgs) {
		this.getGenerationInfo();
		do {
			this.regenerate();
		} while (this.isConnected());
	}

	onShowCells(btnEventArgs) {
		this.#isShowingCells = !this.#isShowingCells;
		this.showCells();
	}

	onMagnifyx2(btnEventArgs) {
		if (this.#currentLevel > 0)
		{
			random.reSeed();
			this.tileSize /= 2;
			this.cellSize = this.tilesPerCell * this.tileSize;
			var max = this.cellsPerRow * this.cellSize - this.#camera.width + 14;
			this.#camera.max = new Point(max, max);
			this.#camera.cameraSpeed /= 2;
			this.regenerate();
			this.#currentLevel--;
		}
	}

	onMagnify2x(btnEventArgs) {
		if (this.#currentLevel < this.#magnificationLevels.length - 1) {
			random.reSeed();
			this.tileSize *= 2;
			this.cellSize = this.tilesPerCell * this.tileSize;
			var max = this.cellsPerRow * this.cellSize - this.#camera.width + 14;
			this.#camera.max = new Point(max, max);
			this.#camera.cameraSpeed *= 2;
			this.regenerate();
			this.#currentLevel++;
		}
	}

	onSwitchTo(switchTabEventArgs) {
		if (switchTabEventArgs.to === Tabs.TAB_01) {
			this.#camera.reset();
		}
	}
}

export { Dungeon };