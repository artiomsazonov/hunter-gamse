var width = 1280,
	height = 720,
	loader = PIXI.loader,
	resources = loader.resources,
	renderer = new PIXI.autoDetectRenderer(width, height, {
		view: document.getElementById("canvas")
	});
stage = new PIXI.Container();
ticker = null,
	reelPanel = null,
	reel1 = null,
	reelPaneltrip1 = [
		0, //Seven
		1, //Bar
		2, //Melon
		3, //Grapes
		4, //Plum
		5, //Orange
		6, //Lemon
		7, //Cherry
		0, //Seven
		2, //Melon
		4, //Plum
		6, //Lemon
		1, //Bar
		3, //Grapes
		5, //Orange
		7 //Cherry
	];

loader
	.add('bgr', 'images/bgr.jpg')
	.add('reelPanel', 'images/reels.png')
	.add('seven', 'images/gsym_0.png')
	.add('bar', 'images/gsym_1.png')
	.add('melon', 'images/gsym_2.png')
	.add('grapes', 'images/gsym_3.png')
	.add('plum', 'images/gsym_4.png')
	.add('orange', 'images/gsym_5.png')
	.add('lemon', 'images/gsym_6.png')
	.add('cherry', 'images/gsym_7.png')
	.load(onAssetsLoaded);

function onAssetsLoaded() {
	init();
}

function init() {
	var bgr = new PIXI.Sprite(resources.bgr.texture);

	stage.addChild(bgr);

	reelPanel = new PIXI.Sprite(resources.reelPanel.texture)
	reelPanel.position.set(renderer.width / 2 - reelPanel.width / 2, renderer.height / 2 - reelPanel.height / 2)
	stage.addChild(reelPanel)


	reel1 = new Reel(reelPaneltrip1);
	reel1.position.set(reelPanel.width / 2 - reel1.width / 2, 10);
	reelPanel.addChild(reel1);

	//TODO init the reelPanel (Sprite) and add it at the center of the stage

	//TODO init the reel1 (see reel.js) and position it at the center of the stage

	ticker = PIXI.ticker.shared;
	ticker.add(render);
}

function render() {
	//TODO call the spin function of the reel

	renderer.render(stage);
};