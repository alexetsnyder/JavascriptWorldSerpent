//controller.mjs
import { Tabs } from './system.mjs';
import { Camera } from './camera.mjs';
import { Point } from './drawing.mjs';
import { Dungeon } from './map.mjs';
import { Player } from './player.mjs';
import { Game } from './game.mjs';

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

	pause() {
		this.#shape.pause();
	}

	unPause() {
		this.#shape.unPause();
	}

	update() {
		this.#shape.update();
	}

	draw(ctx) {
		this.#shape.draw(ctx);
	}

	onSwitchTo(switchTabsEventArgs) {
		this.#shape.onSwitchTo(switchTabsEventArgs);
	}
}

class Controller {
	#objects = []
	#dungeon = null
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

		var dungeonCamera = new Camera(origin, size, max);

		this.#dungeon = new Dungeon(dungeonCamera, rows, cols, tileSize, tilesPerCell, minRooms, maxRooms);
		var dungeonObject = new Object(this.#dungeon, [Tabs.TAB_01, Tabs.TAB_02]);
		var player = new Player(dungeonCamera, 100);
		var playerObject = new Object(player, [Tabs.TAB_02]);
		var game = new Game(player);

		this.#objects = [playerObject, dungeonObject];
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

	pauseAll() {
		for (var obj of this.#objects) {
			obj.pause();
		} 
	}

	unPause() {
		for (var obj of this.#objects) {
			if (obj.isDraw(this.#currentTab)) {
				obj.unPause();
			}
		}
	}

	switchTo(fromTab, toTab) {
		for (var obj of this.#objects) {
			if (obj.isDraw(this.#currentTab)) {
				obj.onSwitchTo({ from: fromTab, to: toTab, entrance: this.#dungeon.getEntrance() })
			}
		}
	}

	showTab(btnTab) {
		this.pauseAll();
		var btnTabHTML = document.getElementById(btnTab);
		var previousTab = this.#currentTab;

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
		this.unPause(); 
		this.switchTo(previousTab, this.#currentTab);
	}

	onTabClicked(tabEventArgs) {
		this.showTab(tabEventArgs.srcElement.id);
	}

	getTabNameFromBtnName(btnName) {
		return btnName.slice(3).toLowerCase();
	}
}

export { Controller };