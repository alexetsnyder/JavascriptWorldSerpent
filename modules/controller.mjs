//controller.mjs
import { Player } from './player.mjs';
import { Camera } from './camera.mjs';
import { Dungeon, ColorGrid } from './map.mjs'
import { Point, Rect, Text } from './drawing.mjs';

const Tabs = {
	NO_TAB : 'no tab',
	TAB_01 : 'btnTab01',
	TAB_02 : 'btnTab02',
	TAB_03 : 'btnTab03'
}

const STARTING_TAB = Tabs.TAB_01;

var ID = 0;

class Object {
	#id = ID
	#shape = null
	#tabs = []

	get shape() {
		return this.#shape;
	}

	set shape(value) {
		this.#shape = value;
	}

	constructor(shape, tabs) {
		this.#id = ID;
		ID += 1;
		this.#shape = shape;
		this.#tabs = this.#tabs.concat(tabs);
	}

	isDraw(tab) {
		return this.#tabs.includes(tab);
	}

	update() {
		this.#shape.update();
	}

	draw(ctx) {
		this.#shape.draw(ctx);
	}
}

class Controller {
	#mapIndex = -1
	#objects = []
	#currentTab = Tabs.NO_TAB

	constructor() {
		var cols = 40;
		var rows = 40;
		var tileSize = 20;
		var tilesPerCell = 8;
		var minRooms = 10;
		var maxRooms = 20;
		var boundingRect = document.getElementById('drawingArea').getBoundingClientRect();
		var origin = new Point(0, 0);
		var size = new Point(boundingRect.width, boundingRect.height);
		var max = new Point(cols * tileSize + 14, rows * tileSize + 14);
		var camera = new Camera(origin, size, max);
		var player = new Player(camera, new Point(200, 200), new Point(10, 10), size);
		var playerObject = new Object(player, [Tabs.TAB_02])
		var dungeonObject = new Object(new Dungeon(camera, rows, cols, tileSize, tilesPerCell, minRooms, maxRooms), [Tabs.TAB_01, Tabs.TAB_02]);
		var colorGridObject = new Object(new ColorGrid(camera, rows, cols, tileSize), [Tabs.TAB_03]);
		this.#objects = [playerObject, dungeonObject, colorGridObject];
		this.#mapIndex = 0;
		this.wireTabEvents();
		this.showTab(STARTING_TAB);
	} 

	wireTabEvents() {
		for (var tab of document.getElementsByClassName('tabLinks')) {
			tab.onclick = (tabEventArgs) => this.onTabClicked(tabEventArgs);
		}
	}

	draw(ctx) {
		for (var obj of this.#objects) {
			if (obj.isDraw(this.#currentTab)) {
				obj.draw(ctx);
			}
		}
	}

	update() {
		for (var obj of this.#objects) {
			if (obj.isDraw(this.#currentTab)) {
				obj.update();
			}
		}
	}

	showTab(btnTab) {
		var btnTabHTML = document.getElementById(btnTab);

		for (var tabLink of document.getElementsByClassName('tabLinks')) {
			tabLink.className = tabLink.className.replace(' active', '');
		}
		btnTabHTML.className += ' active';
		for (var tabContent of document.getElementsByClassName('tabContent')) {
			tabContent.style.display = 'none';
		}

		this.#currentTab = btnTab;
	
		var tabName = this.getTabNameFromBtnName(btnTab);
		document.getElementById(tabName).style.display = 'block'; 
	}

	onTabClicked(tabEventArgs) {
		this.showTab(tabEventArgs.srcElement.id);
	}

	getTabNameFromBtnName(btnName) {
		return btnName.slice(3).toLowerCase();
	}
}

export { Controller };