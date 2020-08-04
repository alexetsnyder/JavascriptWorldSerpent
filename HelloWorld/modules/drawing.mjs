//drawing.mjs

class Point {
	#x = 0
	#y = 0

	get x() {
		return this.#x;
	}

	set x(value) {
		this.#x = value;
	}

	get h() {
		return this.x; 
	}

	set h(value) {
		this.x = value;
	}

	get item1() {
		return this.x; 
	}

	set item1(value) {
		this.x = value;
	}

	get y() {
		return this.#y;
	}

	set y(value) {
		this.#y = value;
	}

	get k() {
		return this.y; 
	}

	set k(value) {
		this.y = value;
	}

	get item2() {
		return this.y; 
	}

	set item2(value) {
		this.y = value;
	}

	get width() {
		return this.x;
	}

	set width(value) {
		this.x = value;
	}

	get height() {
		return this.y;
	}

	set height(value) {
		this.y = value;
	}

	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

class BaseClass {
	#size = null
	#left = 0
	#right = 0
	#top = 0
	#bottom = 0
	#leftTop = null
	#leftBottom = null
	#rightTop = null
	#rightBottom = null
	#center = null
	#cx = 0
	#cy = 0
	#width = 0 
	#height = 0

	set size(val) {
		this.#size = val;
	}

	get size() {
		return this.#size;
	}

	set width(val) {
		this.#width = val;
	}

	get width() {
		return this.#width;
	}

	set height(val) {
		this.#height = val;
	}

	get height() {
		return this.#height;
	}

	set left(val) {
		this.#left = val;
	}

	get left() {
		return this.#left;
	}

	set right(val) {
		this.#right = val;
	}

	get right() {
		return this.#right;
	}

	set top(val) {
		this.#top = val;
	}

	get top() {
		return this.#top;
	}

	set bottom(val) {
		this.#bottom = val;
	}

	get bottom() {
		return this.#bottom;
	}

	set cx(val) {
		this.#cx = val;
	}

	get cx() {
		return this.#cx;
	}

	set cy(val) {
		this.#cy = val;
	}

	get cy() {
		return this.#cy;
	}

	get center() {
		return this.#center;
	}

	set center(val) {
		this.#center = val;
	}

	set leftTop(val) {
		this.#leftTop = val;
	}

	get leftTop() {
		return this.#leftTop;
	}

	set leftBottom(val) {
		this.#leftBottom = val;
	}

	get leftBottom() {
		return this.#leftBottom;
	}

	set rightTop(val) {
		this.#rightTop = val;
	}

	get rightTop() {
		return this.#rightTop;
	}

	set rightBottom(val) {
		this.#rightBottom = val;
	}

	get rightBottom() {
		return this.#rightBottom;
	}

	constructor(leftTop, size) {
		this.setSize(size);
		this.setPos(leftTop);
	}

	setSize(size) {
		this.size = size;
		this.width = this.size.width;
		this.height = this.size.height;
	}

	setPos(leftTop) {
		this.leftTop = leftTop;
		this.left = leftTop.x;
		this.right = leftTop.x + this.width;
		this.top = leftTop.y;
		this.rightTop = new Point(this.right, this.top);
		this.bottom = this.top + this.height;
		this.leftBottom = new Point(this.left, this.bottom);
		this.rightBottom = new Point(this.right, this.bottom);
		this.cx = this.left + this.width / 2;
		this.cy = this.top + this.height / 2;
		this.center = new Point(this.cx, this.cy);
	}
}

class Rect extends BaseClass {
	#color = null

	get color() {
		return this.#color;
	}

	set color(value) {
		this.#color = value;
	}

	constructor(left, top, width, height, color) {
		super(new Point(left, top), new Point(width, height));
		this.color = color;
	}

	draw(ctx) {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.left, this.top, this.width, this.height)
	}
}

class Sprite extends BaseClass {
	#isLoaded = false
	#src = ''
	#image = null

	constructor(src, left, top, width, height) {
		super(left, top, width, height);
		this.#src = src;
		this.load_image();
	}

	load_image() {
		this.#image = new Image();
		this.#image.onload = () => { this.#isLoaded = true; };
		this.#image.onerror = () => {
			this.#image.onerror = null;
			console.log('Image was not found.');	
			this.#image.onload = () => { this.#isLoaded = true; };
			this.#image.src = 'sprites/error.png'
		};
		this.#image.src = this.#src;		
	}

	draw(ctx) {
		if (this.#isLoaded) {
			ctx.drawImage(this.#image, this.left, this.top, this.width, this.height);
		}
	}
}

class Text {
	#string = ''
	#center = null
	#cx = 0
	#cy = 0
	#font = ''

	get string() {
		return this.#string;
	}

	set string(val) {
		this.#string = val;
	}

	constructor(string, center, font='20px Arial') {
		this.#center = center;
		this.#cx = center.x;
		this.#cy = center.y;
		this.#string = string;
		this.#font = font;
	}

	draw(ctx) {
		ctx.fillStyle = 'white';
		ctx.font = this.#font;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(this.#string, this.#cx, this.#cy);
	}
}

export { Rect, Text, Sprite, Point };