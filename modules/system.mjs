//system.mjs
import { Point } from './drawing.mjs';

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

	toArray() {
		return this.#array;
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

class Random {
	#seed = 0
	#rng = null

	get seed() {
		return this.#seed;
	}

	set seed(value) {
		if (this.#seed !== value) {
			this.#seed = value;
			this.#rng = new Math.seedrandom(this.seed);
		}
	}

	constructor(seed=null) {
		if (!IsNullOrUndefined(seed)) {
			this.#seed = seed;
		}
		else {
			this.#seed = (new Date()).getTime().toString();
		}
		this.#rng = new Math.seedrandom(this.seed);
	}

	from(start, end) {
		var rngNumber = this.#rng()
		return Math.floor((rngNumber * (end - start)) + start);
	}

	choice(list) {
		return list[this.from(0, list.length)];
	}
}

function DrawWithOffset(ctx, object, offset) {
	var savedPos = object.leftTop;
	var newPos = new Point(savedPos.x + offset.x, savedPos.y + offset.y);
	object.setPos(newPos);
	object.draw(ctx);
	object.setPos(savedPos);
}

function IsNullOrUndefined(object) {
	return object === undefined || object === null;
}

export { List, IsNullOrUndefined, DrawWithOffset, Random, Range }