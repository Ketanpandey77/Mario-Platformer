let config = {
    type: Phaser.AUTO,

    scale: {
        mode: Phaser.Scale.FIT,   //the canvas will fit the screen
        width: 800,
        height: 600,
    },

    // backgroundColor:0x00FF00,

    // adding physics engine in our game
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 1000,
            },
            // debug property is useful when we are building a game
            // once we have build a game,we can declare debug property as false
            // debug: true,   //for specifying the borders around objects
            debug: false,
        }

    },

    scene: {
        preload: preload,
        create: create,
        update: update,
    },
}

let game_config = {
    velocity: 100,
    jumpspeed: -580,
}
let game = new Phaser.Game(config);

function preload() {
    this.load.image('btm', "Assets/btm.png");
    this.load.image('back', "Assets/background.png");
    this.load.image('fruit', "Assets/apple.png");
    this.load.image('ray', "Assets/ray.png");
    this.load.spritesheet('dude', 'Assets/dude.png', { frameWidth: 32, frameHeight: 48 });
 
}

function create() {
    let W = game.config.width;
    let H = game.config.height;

   

    let sky = this.add.sprite(0, 0, 'back');
    sky.setOrigin(0, 0);
    sky.displayWidth = W;

    let ground = this.add.tileSprite(0, 470, W, H, 'btm');
    ground.setOrigin(0, 0);
    ground.depth = 2;

    // adding a group of images
    let fruits = this.physics.add.group({
        key: "fruit",
        repeat: 8,
        setScale: { x: 0.2, y: 0.2 },
        setXY: { x: 20, y: 0, stepX: 100 },
    })

    fruits.children.iterate(function (f) {
        f.setBounce(Phaser.Math.FloatBetween(0.4, 0.7));
    });

    this.physics.add.existing(ground, false);
    ground.body.allowGravity = false;
    ground.body.immovable = true;

    this.player = this.physics.add.sprite(200, 200, 'dude', 4);
    this.player.setBounce(0.5);

    // player will not move outside the game
    this.player.setCollideWorldBounds(true);

    // creating animations for player movement
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1,
    })
    this.anims.create({
        key: 'center',
        frames: this.anims.generateFrameNumbers('dude', { start: 4, end: 4 }),
        frameRate: 10,
    })
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1,
    })

    // giving keyboard movement to player
    this.cursors = this.input.keyboard.createCursorKeys();

    // creating ray
    let rays = [];

    for (let i = -10; i <= 10; i++) {
        let ray = this.add.sprite(W / 2, H - 112, 'ray');
        ray.setOrigin(0.5, 1);
        ray.displayHeight = 2 * H;
        ray.alpha = 0.2;
        ray.angle = i * 15;
        rays.push(ray);
    }
    // moving the rays
    this.tweens.add({
        targets: rays,
        props: {
            angle: {
                value: "+=20",
            },
        },
        duration: 6000,
        repeat: -1,
    });



    let platforms = this.physics.add.staticGroup();
    platforms.create(600, 350, 'btm').setScale(2, 0.5).refreshBody();
    platforms.create(240, 250, 'btm').setScale(2, 0.5).refreshBody();
    platforms.create(600, 150, 'btm').setScale(2, 0.5).refreshBody();



    this.physics.add.collider(ground, this.player);
    this.physics.add.collider(ground, fruits);
    this.physics.add.collider(platforms, fruits);
    this.physics.add.collider(this.player, platforms);
    this.physics.add.overlap(this.player, fruits, eatFruit, null, this);

    // adding cameras effects to game
    this.cameras.main.setBounds(0, 0, W, H);
    this.physics.world.setBounds(0, 0, W, H);

    this.cameras.main.startFollow(this.player, true, true);
    this.cameras.main.setZoom(1.5);

}


function eatFruit(player, fruit) {
    fruit.disableBody(true, true);
}

function update() {
    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-1 * game_config.velocity);
        this.player.anims.play('left', true);
    }
    else if (this.cursors.right.isDown) {
        this.player.setVelocityX(game_config.velocity);
        this.player.anims.play('right', true);
    }
    else {
        this.player.setVelocityX(0);
        this.player.anims.play('center', true);
    }

    // adding jumping ability and stoping the player when not in air
    if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(game_config.jumpspeed);
    }

}
