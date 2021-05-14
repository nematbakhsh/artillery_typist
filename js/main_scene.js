class SceneMain extends Phaser.Scene {
    constructor() {
        super('SceneMain');
    }

    preload()
    {
        this.level = 1;
        this.lives = 3;
        this.maxBombs = 2;
        this.groupBombs = this.physics.add.group();
        this.switchPhysics = true;
    }

    create ()
    {
        this.input.on('pointerdown', function() {
            if (this.switchPhysics) {
                this.switchPhysics = false;
                this.physics.pause();
            } else {
                this.switchPhysics = true;
                this.physics.resume();
            }
            
        }, this);
        let width = this.cameras.main.width;
        let height = this.cameras.main.height;

        // create grid for alignment
        this.grid = new AlignGrid({
            scene: this,
            cols:15,
            rows:9
        });
        this.grid.showNumbers(); // remove this in production

        // add sprites sky, ground, airplane and life hearts
        this.sky = this.add.image(width/2, height/2, 'sky');
        this.ground = this.add.tileSprite(0, this.grid.height - this.grid.cellHeight, this.grid.width, this.grid.cellHeight, 'ground').setOrigin(0, 0);
        this.ground.depth = 1;
        this.physics.add.existing(this.ground, true);
        this.ground.body.setSize(this.grid.width, 10, this.grid.cellHeight, 0);
        console.log(this.grid.width, this.grid.height);

        this.life1 = this.add.image(0,0,'heart');
        this.life2 = this.add.image(0,0,'heart');
        this.life3 = this.add.image(0,0,'heart');
        this.grid.placeAtIndex(12, this.life1);
        this.grid.placeAtIndex(13, this.life2);
        this.grid.placeAtIndex(14, this.life3);
  
        this.aircraft = this.physics.add.image(this.grid.width+200, this.grid.cellHeight, 'aircraft').setScale(0.1, 0.1);
    
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 11 }),
            frameRate: 10,
        });

        // add sounds
        this.explosionSound = this.sound.add('explosion_sound', {
            volume: 0.5,
            //loop: true
        });
        this.winSound = this.sound.add('win_sound', {
            volume: 0.5,
            //loop: true
        });
            
        // start level
        //
        //
        this.switchLevel = false;
        this.level_initiate(this.level);
            
        
    
        this.input.keyboard.on('keyup', function(event) {
            for (let i = 0; i < bombs.length; i++) {
                if (bombs[i][0].letter == event.key) {
                    bombs[i][0].destroy();
                    bombs[i][1].destroy();
                    bombs.splice(i, 1);
                    this.winSound.play();
                }
            }
        }, this);

        this.events.on('pause', function() {
            //this.buttonPlayAgain =  this.add.text(-100,-100,'Play Again').setInteractive().setVisible(true);
            //this.grid.placeAtIndex(67, this.buttonPlayAgain);
            //console.log(this.buttonPlayAgain);
            //this.buttonPlayAgain.on('pointerdown', function() {
            //    console.log('clicked');
            //    this.scene.start('SceneMain');
            //    this.scene.run('SceneMain');
            //    }, this);
            //}, this)  
            //this.scene.resume();
            this.scene.stop('SceneMain');
            this.scene.restart('SceneTitle');
            this.scene.resume();
            this.time.addEvent({
                callback: function() {this.scene.resume();this.scene.start('SceneTitle');},
                callbackScope: this,
                loop: false,
                delay: 2000
            }, this);
        }, this);

        this.bombNumber = 0;
        this.switchDropped = true;
    }
    
    update ()
    {
        
        //if (this.switchLevel) {
            if (!this.switchDropped && this.bombNumber == this.maxBombs) {
                this.aircraft.setVelocityX(0);
            } else {
                this.aircraft.setVelocityX(this.level * 50);
                if (!this.switchDropped && this.aircraft.x >= this.bombCoords[this.bombNumber][0]) {
                    this.switchDropped = true;
                    dropBomb(this.bombCoords[this.bombNumber][0], this.bombCoords[this.bombNumber][1], this.bombNumber);
                    this.bombNumber++;
                }
            }
            
            if (this.aircraft.x >= this.grid.width + 100) {
                if (this.switchLevel) {
                    this.aircraft.x = -100;
                    this.switchDropped = false;
                    
                }
            }
            
        //}

        if (this.bombNumber == this.maxBombs && bombs.length == 0) {
            this.level++;
            this.bombNumber = 0;
            this.level_initiate(this.level);
        }

        // if (this.lives == 2) {
        //     this.life1.destroy();
        // } else if (this.lives == 1) {
        //     this.life2.destroy();
        // } else if (this.lives == 0) {
        //     this.life3.destroy();
        //     console.log('Game Over!');
        //     this.grid.placeAtIndex(37, this.add.text(0,0,'Game Over'));
        //     //this.buttonPlayAgain.setVisible(true);
        //     //this.lives=3;
        //     //this.scene.pause('SceneMain');
        //     this.scene.stop('SceneMain');
        //     this.scene.restart('SceneTitle');
            
        // }
    }

    level_initiate(level) {
        this.switchLevel = false;
        this.textLevel = this.add.text(0,0,'Level ' + level).setOrigin(.5, .5);
        this.grid.placeAtIndex(37, this.textLevel);
        this.physics.pause();

        this.time.addEvent({
            callback: this.level_run,
            callbackScope: this,
            delay: 2000, // 1000 = 1 second
            loop: false
        });
    }

    level_run() {
        this.physics.resume();
        this.textLevel.destroy();
        //this.aircraft.x = -100;
        this.switchLevel = true;
        this.bombCoords = [];
        for (let i = 0; i < this.maxBombs; i++) {
            let x = Phaser.Math.RND.integerInRange(50,750);
            let y = 60;
            this.bombCoords.push([x,y]);
        }
        //console.log(this.bombCoords);
    }

    
}



var letters = [];
var bombs = [];

function dropBomb(x, y, index) {
    let x_coord = x;
    let y_coord = y;
    let letter = random_char();
    letters.push(letter);
    let bomb = game.scene.scenes[1].physics.add.image(x_coord, y_coord, 'bomb').setAngle(180);
    bomb.letter = letter;
    bomb.index = index;
    
    
    let textObj = game.scene.scenes[1].add.text(x_coord-5, 22, letter, {
        font:"20px"
    });
    
    //let letteredBomb = game.scene.scenes[1].physics.add.group();
    //letteredBomb.add(bomb);
    //letteredBomb.add(textObj);
    //game.scene.scenes[1].groupBombs.add(letteredBomb);
    bombs.push([bomb, textObj]);
    bomb.setGravity(0, 50);
    game.scene.scenes[1].physics.add.existing(textObj);
    textObj.body.setGravity(0, 50);

    //bomb.setBounce(0.8);
    game.scene.scenes[1].physics.add.collider(bomb, game.scene.scenes[1].ground, explode);
    console.log(bombs);
}

function explode(bomb, ground) {
    explosion = game.scene.scenes[1].physics.add.sprite(bomb.x, bomb.y, 'exploion');
    explosion.anims.play('explode');
    game.scene.scenes[1].explosionSound.play();
    for (let i = 0; i < bombs.length; i++) {
        if (bombs[i][0].index == bomb.index) {
            bombs.splice(i, 1);
        }
    }
    bomb.destroy();
    game.scene.scenes[1].lives--;
    console.log(bombs);
}

function random_char() {
    let characterString = 'abcdefghijklmnopqrstuvwxyz';
    let randomNum = Math.floor(Math.random() * characterString.length);
    return characterString.charAt(randomNum);
}