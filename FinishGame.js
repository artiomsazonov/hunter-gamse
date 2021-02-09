// Aliases
var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Rectangle = PIXI.Rectangle,
    Sprite = PIXI.Sprite,
    Graphics = PIXI.Graphics,
    Text = PIXI.Text,
    MovieClip = PIXI.extras.MovieClip,
    TilingSprite = PIXI.extras.TilingSprite,
    ParticleContainer = PIXI.ParticleContainer,
    Point = PIXI.Point,
    Rope = PIXI.mesh.Rope;

var stage = new Container();
var app = autoDetectRenderer(512, 512);
document.body.appendChild(app.view);

// var scale = scaleToWindow(app.view);
var b = new Bump(PIXI);
var su = new SpriteUtilities(PIXI);
var d = new Dust(PIXI);
var c = new Charm(PIXI);
var t = new Tink(PIXI, app.view);


loader
    .add("images/pixiePerilousness.json")
    .load(setup);

var id, block, clouds, particleStream, finish, butterfly, blocks, pointer, dustFrames, state;

function setup() {

    id = resources["images/pixiePerilousness.json"].textures;

    clouds = new TilingSprite(id["clouds.png"], app.width, app.height)
    stage.addChild(clouds)

    blocks = new Container();
    stage.addChild(blocks);

    var gapSize = 4,
        numberOfPillars = 15;
    for (var i = 0; i < numberOfPillars; i++) {
        var startGapNumber = randomInt(0, 8 - gapSize);
        if (i > 0 && i % 5 === 0) gapSize -= 1;
        for (var j = 0; j < 8; j++) {
            if (j < startGapNumber || j > startGapNumber + gapSize - 1) {
                block = su.sprite(id["greenBlock.png"]);
                blocks.addChild(block);
                block.x = (i * 384) + 512;
                block.y = j * 64;
            }
        }
        if (i === numberOfPillars - 1) {
            finish = su.sprite(id["finish.png"]);
            blocks.addChild(finish);
            finish.x = (i * 384) + 896;
            finish.y = 192;
        }
    }

    var pixiFrames = [id["0.png"], id["1.png"], id["2.png"]];
    butterfly = su.sprite(pixiFrames);
    stage.addChild(butterfly);
    butterfly.fps = 24;
    butterfly.position.set(232, 32);
    butterfly.vy = 0;
    butterfly.oldVy = 0;


    dustFrames = [id["pink.png"], id["yellow.png"], id["green.png"], id["violet.png"]]
    particleStream = d.emitter(
        300,
        () => d.create(
            butterfly.x + 8,
            butterfly.y + butterfly.height / 2,
            () => su.sprite(dustFrames),
            stage,
            3,
            0,
            true,
            2.4, 3.6,
            18, 24,
            2, 3,
            0.005, 0.01,
            0.005, 0.01,
            0.05, 0.1
        )
    );
    particleStream.play();

    pointer = t.makePointer();
    pointer.tap = function () {
        butterfly.vy += 1.5;
    };


    state = play
    gameLoop()
}

function gameLoop() {
    requestAnimationFrame(gameLoop);
    state()

    t.update();
    d.update();
    app.render(stage)
}

function play() {
    clouds.tilePosition.x -= 1;

    if (finish.getGlobalPosition().x > 256) {
        blocks.x -= 2;
    }

    butterfly.vy += -0.05;
    butterfly.y -= butterfly.vy;

    if (butterfly.vy > butterfly.oldVy) {
        if (!butterfly.animating) {
            butterfly.playAnimation();
            if (butterfly.visible && !particleStream.playing) {
                particleStream.play();
            }
        }
    }
    if (butterfly.vy < 0 && butterfly.oldVy > 0) {
        if (butterfly.animating) butterfly.stopAnimation();
        butterfly.show(0);
        if (particleStream.playing) particleStream.stop()
    }
    butterfly.oldVy = butterfly.vy

    var pixieVsCanvas = b.contain(butterfly, {
        x: 0,
        y: 0,
        width: app.width,
        height: app.height
    });
    if (pixieVsCanvas) {
        if (pixieVsCanvas.has("bottom") || pixieVsCanvas.has("top")) {
            butterfly.vy = 0;
        }
    }




    var pixieVsBlock = blocks.children.some(block => {
        return b.hitTestRectangle(butterfly, block, true)
    })

    if (pixieVsBlock && butterfly.visible) {

        butterfly.visible = false;

        d.create(butterfly.centerX, butterfly.centerY,
            function () {
                return su.sprite(dustFrames);
            },
            stage,
            20,
            0,
            false,
            0, 6.28,
            16, 32,
            1, 3
        );

        particleStream.stop();

        wait(3000).then(function () {
            return reset();
        });
    }
}

function reset() {
    butterfly.visible = true;
    butterfly.y = 32;
    particleStream.play();
    blocks.x = 0;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function wait() {
    var duration = arguments[0] === undefined ? 0 : arguments[0];

    return new Promise(function (resolve, reject) {
        setTimeout(resolve, duration);
    });
}