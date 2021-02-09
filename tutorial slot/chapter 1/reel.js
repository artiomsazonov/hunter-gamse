function Reel(strip) {
	PIXI.Container.call(this);
	this.reelstrip = strip;
	this.init();
}
Reel.prototype = Object.create(PIXI.Container.prototype);
Reel.prototype.constructor = Reel;

Reel.prototype.init = function () {
	var seven = new PIXI.Sprite(resources.seven.texture);
	var bar = new PIXI.Sprite(resources.bar.texture);
	var melon = new PIXI.Sprite(resources.melon.texture);
	var grapes = new PIXI.Sprite(resources.grapes.texture);
	var plum = new PIXI.Sprite(resources.plum.texture);
	var orange = new PIXI.Sprite(resources.orange.texture);
	var lemon = new PIXI.Sprite(resources.lemon.texture);
	var cherry = new PIXI.Sprite(resources.cherry.texture);


	var elements = [seven, bar, melon, grapes, plum, orange, lemon, cherry];
	for (var i = 0; i < 4; i++) {
		var element = elements[this.reelstrip[i]];

		element.position.y = 168 * i - 168
		this.addChild(element);


	};

	let rectangle = new PIXI.Graphics();
	rectangle.drawRect(0, 0, 198, 504);
	this.mask = rectangle;
	this.addChild(rectangle);


	/*
	 * TODO add all necessary elements of the reel (sprites, mask) here
	 *
	 * Add 4 symbols (sprites) and position them on the reel 
	 * The first symbol is positioned outside of the reel
	 * The second symbol is the first visible symbol followed by the other symbols
	 * The mask is covering the visible part of the reel
	 */
};

Reel.prototype.spin = function () {
	/*
	 * TODO implement the spin functionality here
	 * 
	 * Move all symbols downwards 
	 * If a symbol is out of the reel
	 * position it above the reel (where first symbol is positioned at the start) 
	 * and change the symbol according to the reelstrip
	 */
};

//TODO add additional used functions of the reel element here