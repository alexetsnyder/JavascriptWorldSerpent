//controller.mjs
import { Dungeon } from './map.mjs'
import { Point, Rect, Text } from './drawing.mjs';

const Tabs = {
	NO_TAB : 'no tab',
	TAB_01 : 'btnTab01',
	TAB_02 : 'btnTab02'
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
		var mapObject = new Object(new Dungeon(40, 40, 20), [Tabs.TAB_01, Tabs.TAB_02]);
		this.#objects = [mapObject];
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
		if (btnTab == Tabs.TAB_01) {
			this.#objects[this.#mapIndex].shape.isGrid = false;
		}
		else {
			this.#objects[this.#mapIndex].shape.isGrid = true;
		}
	}

	onTabClicked(tabEventArgs) {
		this.showTab(tabEventArgs.srcElement.id);
	}

	getTabNameFromBtnName(btnName) {
		return btnName.slice(3).toLowerCase();
	}
}

export { Controller };