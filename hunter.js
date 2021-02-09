var b = new Bump(PIXI);
var su = new SpriteUtilities(PIXI);
var d = new Dust(PIXI);

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
    ParticleContainer = PIXI.ParticleContainer;

// Containers
var app = autoDetectRenderer(512, 512);
document.body.appendChild(app.view);
var stage = new Container();

loader
    .add("images/dungeon.png")
    .add("images/treasureHunter.json")
    .add("images/explorers.png")
    .add("images/star.png")
    .add("images/blob.png")
    .load(setup);

var gameScene, healthBar, innerBar, outerBar, gameOverScene, message, id, dungeon, door, treasure, explorer, blobs, blob, state, collision, explorerHit, stars, blobOff;

function setup() {
    gameScene = new Container();
    stage.addChild(gameScene);
    gameOverScene = new Container();
    stage.addChild(gameOverScene);
    gameOverScene.visible = false;

    //метод с картинкой
    dungeon = new Sprite(TextureCache["images/dungeon.png"]);
    gameScene.addChild(dungeon);

    //метод со спрайтом
    id = resources["images/treasureHunter.json"].textures;

    //door
    door = new Sprite(id["door.png"]);
    door.position.set(32, 0);
    gameScene.addChild(door);

    //explorer
    frames = su.filmstrip("images/explorers.png", 32, 32);
    explorer = su.sprite(frames);
    explorer.position.set(68, gameScene.height / 2 - explorer.height / 2);
    explorer.vx = 0;
    explorer.vy = 0;
    explorer.fps = 12;
    explorer.states = {
        down: 0,
        left: 3,
        right: 6,
        up: 9,
        walkDown: [0, 2],
        walkLeft: [3, 5],
        walkRight: [6, 8],
        walkUp: [9, 11]
    };
    gameScene.addChild(explorer);

    //treasure
    treasure = new Sprite(id["treasure.png"]);
    treasure.position.set(gameScene.width - treasure.width - 48, gameScene.height / 2 - treasure.height / 2);
    gameScene.addChild(treasure);

    //blobs
    var numberOfBlobs = 6,
        spacing = 48,
        xOffset = 150,
        speed = 2,
        direction = 1;

    blobs = [];
    for (var i = 0; i < numberOfBlobs; i++) {
        blob = new Sprite(id["blob.png"]);
        blob.position.set(spacing * i + xOffset, randomInt(0, stage.height - blob.height));
        blob.vy = speed * direction;
        direction *= -1;
        blobs.push(blob);
        gameScene.addChild(blob);
    };

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    healthBar = new Container();
    healthBar.position.set(stage.width - 170, 4);
    gameScene.addChild(healthBar);
    innerBar = new Graphics();
    innerBar.beginFill(0x000000);
    innerBar.drawRect(0, 0, 128, 8);
    innerBar.endFill();
    healthBar.addChild(innerBar);
    outerBar = new Graphics();
    outerBar.beginFill(0xFF3300);
    outerBar.drawRect(0, 0, 128, 8);
    outerBar.endFill();
    healthBar.addChild(outerBar);
    healthBar.outer = outerBar;
    message = new Text(
        "The End!", {
            fontFamily: "Futura",
            fontSize: "48px",
            fill: "white"
        }
    );
    message.position.set(150, stage.height / 2 - 32);
    gameOverScene.addChild(message);

    stars = d.emitter(
        1000,
        function () {
            d.create(
                256,
                256,
                () =>
                su.sprite("images/star.png"),
                gameOverScene,
                50,
                0,
                true,
                0, 6.28,
                12, 24,
                2, 5,
                0.005, 0.01,
                0.005, 0.01,
                0.05, 0.1

            )
        }

    );
    blobOff = d.emitter(
        1000,
        function () {
            d.create(
                256,
                256,
                () =>
                su.sprite("images/blob.png"),
                gameOverScene,
                50,
                0,
                true,
                0, 6.28,
                24, 36,
                2, 5,
                0.005, 0.01,
                0.005, 0.01,
                0.05, 0.1
            )
        }
    );

    //keyboard
    var left = keyboard(37),
        up = keyboard(38),
        right = keyboard(39),
        down = keyboard(40);

    left.press = function () {
        explorer.playAnimation(explorer.states.walkLeft);
        explorer.vx = -5;
        explorer.vy = 0;
    };
    left.release = function () {
        if (!right.isDown && explorer.vy === 0) {
            explorer.vx = 0;
            explorer.show(explorer.states.left);
        };
    };
    up.press = function () {
        explorer.playAnimation(explorer.states.walkUp);
        explorer.vy = -5;
        explorer.vx = 0;
    };
    up.release = function () {
        if (!down.isDown && explorer.vx === 0) {
            explorer.vy = 0;
            explorer.show(explorer.states.up);
        };
    };
    right.press = function () {
        explorer.playAnimation(explorer.states.walkRight);
        explorer.vx = 5;
        explorer.vy = 0;
    };
    right.release = function () {
        if (!left.isDown && explorer.vy === 0) {
            explorer.vx = 0;
            explorer.show(explorer.states.right);
        };
    };
    down.press = function () {
        explorer.playAnimation(explorer.states.walkDown);
        explorer.vy = 5;
        explorer.vx = 0;
    };
    down.release = function () {
        if (!up.isDown && explorer.vx === 0) {
            explorer.vy = 0;
            explorer.show(explorer.states.down);
        };
    };

    state = play;

    gameLoop();
};

function gameLoop() {
    requestAnimationFrame(gameLoop);
    state();
    d.update();
    app.render(stage);
};

function play() {
    explorer.x += explorer.vx;
    explorer.y += explorer.vy;
    contain(explorer, {
        x: 28,
        y: 10,
        width: 488,
        height: 480
    });
    explorerHit = false;

    blobs.forEach(function (blob) {
        blob.y += blob.vy;
        var blobHitsWall = contain(blob, {
            x: 28,
            y: 10,
            width: 488,
            height: 480
        });
        if (blobHitsWall) {
            if (blobHitsWall === "top" || blobHitsWall === "bottom") {
                blob.vy *= -1;
            }
        };
        if (b.hitTestRectangle(explorer, blob)) {
            explorerHit = true
        };
    });
    if (explorerHit) {
        explorer.alpha = 0.5;
        healthBar.outer.width -= 1;
    } else {
        explorer.alpha = 1;
    };
    if (b.hitTestRectangle(explorer, treasure)) {
        treasure.x = explorer.x + 13;
        treasure.y = explorer.y + 8;
    };
    if (b.hitTestRectangle(treasure, door)) {
        state = end;
        message.text = "You won!";
        stars.play();
    };
    if (healthBar.outer.width < 0) {
        state = end;
        message.text = "You lost!";
        blobOff.play();
    };
};

function end() {
    gameScene.visible = false;
    gameOverScene.visible = true;
};

function contain(sprite, container) {
    collision = undefined;
    //Left
    if (sprite.x < container.x) {
        sprite.x = container.x;
        collision = "left";
    }
    //Top
    if (sprite.y < container.y) {
        sprite.y = container.y;
        collision = "top";
    }
    //Right
    if (sprite.x + sprite.width > container.width) {
        sprite.x = container.width - sprite.width;
        collision = "right";
    }
    //Bottom
    if (sprite.y + sprite.height > container.height) {
        sprite.y = container.height - sprite.height;
        collision = "bottom";
    }
    return collision;
};