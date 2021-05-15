class SceneMain extends Phaser.Scene {
    constructor() {
        super('SceneMain');
    }

    preload()
    {
        // create grid for alignment
        //
        this.grid = new AlignGrid({
            scene: this,
            cols:15,
            rows:9
        });
        //this.grid.showNumbers(); // remove this in production
        
        // game settings
        this.level = 1;
        this.lives = 3;
        this.maxBombs = 5;
        this.isPausedPhysics = false;
        this.initialSpeed = 50;

        this.bombNumber = 0;
        this.isBombDropped = true;
    }

    create ()
    {
        // add sprites sky, ground, airplane and life hearts
        //
        this.sky = this.add.graphics();
        this.sky.fillGradientStyle(0x3333ff, 0x3333ff, 0xffffff, 0xffffff);
        this.sky.fillRect(0,0,  this.grid.width, this.grid.height)
        //
        this.ground = this.add.tileSprite(0, this.grid.height - 2 * this.grid.cellHeight, this.grid.width, 2 * this.grid.cellHeight, 'ground').setOrigin(0, 0);
        this.ground.setScale(1, 2*this.grid.cellHeight/128);
        this.ground.depth = 1;
        this.physics.add.existing(this.ground, true);
        this.ground.body.setOffset(0, this.grid.cellHeight * .4);
        this.ground.body.setSize(this.grid.width, 20, false);
        //
        this.life1 = this.add.image(0,0,'heart').setScale(Math.min((this.grid.cellWidth)/32, (this.grid.cellHeight)/32));
        this.life2 = this.add.image(0,0,'heart').setScale(Math.min((this.grid.cellWidth)/32, (this.grid.cellHeight)/32));
        this.life3 = this.add.image(0,0,'heart').setScale(Math.min((this.grid.cellWidth)/32, (this.grid.cellHeight)/32));
        this.grid.placeAtIndex(12, this.life1);
        this.grid.placeAtIndex(13, this.life2);
        this.grid.placeAtIndex(14, this.life3);
        //
        this.aircraft = this.physics.add.image(this.grid.width+200, this.grid.cellHeight, 'aircraft');
        if (isMobile) {
            this.aircraft.setScale(Math.max((this.grid.cellWidth)/800, (this.grid.cellHeight)/469)/2);
        } else {
            this.aircraft.setScale(Math.min((this.grid.cellWidth)/800, (this.grid.cellHeight)/469));
        }
        
        //v
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
        this.switchLevel = false;
        this.level_initiate(this.level);
        //
        // keyboard inputs to destroy bombs
        this.input.keyboard.on('keydown', function(event) {
            if (!this.isPausedPhysics) {
                for (let i = 0; i < bombs.length; i++) {
                    if (bombs[i][0].letter == event.key) {
                        bombs[i][0].destroy();
                        bombs[i][1].destroy();
                        bombs.splice(i, 1);
                        this.winSound.play();
                    }
                }
            }
        }, this);

        // pause functionality
        //
        let txtPause = this.add.text(0,0, 'PAUSED', {
            fontSize: this.grid.cellHeight/2,
            color: '#fff'
        }).setOrigin(0.5, 0.5).setDepth(1).setVisible(false);
        this.grid.placeAtIndex(22, txtPause);
        this.input.on('pointerdown', function() {
            if (!this.isPausedPhysics) {
                this.isPausedPhysics = true;
                txtPause.setVisible(true);
                this.physics.pause();
            } else {
                this.isPausedPhysics = false;
                txtPause.setVisible(false);
                this.physics.resume();
            }
        }, this);
    }
    
    update ()
    {
        // play again button for the game ending
        const btnPlayAgain = this.add.text(0,0,'Play Again', {
            fontSize: Math.min(this.grid.cellHeight, this.grid.cellWidth)/2
        }).setOrigin(.5,.5).setInteractive().setVisible(false);
        this.grid.placeAtIndex(67, btnPlayAgain);
        btnPlayAgain.on('pointerdown', function() {
            this.scene.restart();
        }, this);
    
        // aircraft movement + dropping bombs
        //
        if (!this.isBombDropped && this.bombNumber == this.maxBombs) {
            this.aircraft.setVelocityX(0);
        } else {
            this.aircraft.setVelocityX(this.level * 50 + this.initialSpeed);
            if (!this.isBombDropped && this.aircraft.x >= this.bombCoords[this.bombNumber][0]) {
                this.isBombDropped = true;
                this.dropBomb(this.bombCoords[this.bombNumber][0], this.bombCoords[this.bombNumber][1], this.bombNumber);
                this.bombNumber++;
            }
        }
        //
        if (this.aircraft.x >= this.grid.width + 100) {
            if (this.switchLevel) {
                this.aircraft.x = -100;
                this.isBombDropped = false;
            }
        }
        // 
        if (this.bombNumber == this.maxBombs && bombs.length == 0) {
            if (this.level == 10) {
                // Player Won!
                const txtYouWon = this.add.text(0,0,'You Won!', {
                    fontSize: Math.min(this.grid.cellHeight, this.grid.cellWidth)
                }).setOrigin(.5,.5);
                this.grid.placeAtIndex(22, txtYouWon);
                btnPlayAgain.setVisible(true);
                this.physics.pause();
            } else {
                this.level++;
                this.bombNumber = 0;
                this.level_initiate(this.level);
            }
        }
        //
        if (this.lives == 2) {
             this.life1.destroy();
        } else if (this.lives == 1) {
            this.life2.destroy();
        } else if (this.lives == 0) {
            this.life3.destroy();
            // Player Lost!
            const txtGameOver = this.add.text(0,0,'Game Over', {
                fontSize: Math.min(this.grid.cellHeight, this.grid.cellWidth)
            }).setOrigin(.5,.5);
            this.grid.placeAtIndex(22, txtGameOver);
            btnPlayAgain.setVisible(true);
            this.physics.pause();
        }
    }

    level_initiate(level) {
        this.switchLevel = false;
        this.textLevel = this.add.text(0,0,'Level ' + level, {
            fontSize: Math.min(this.grid.width * 0.1, this.grid.height * 0.1)
        }).setOrigin(.5, .5);
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
        this.switchLevel = true;
        this.bombCoords = [];
        for (let i = 0; i < this.maxBombs; i++) {
            let x = Phaser.Math.RND.integerInRange(50 , this.grid.width - 50);
            let y = this.grid.cellHeight * 3/2;
            this.bombCoords.push([x,y]);
        }
    }

    dropBomb(x, y, index) {
        let x_coord = x;
        let y_coord = y;
        let letter = random_char();
        letters.push(letter);
        const bomb = game.scene.scenes[1].physics.add.image(x_coord, y_coord, 'bomb');
        bomb.setScale((this.grid.cellWidth/2)/32, (this.grid.cellHeight/2)/32).setAngle(180);
        bomb.setOrigin(0.5, .5);
        bomb.letter = letter;
        bomb.index = index;
        //        
        const textObj = game.scene.scenes[1].add.text(x_coord, this.grid.cellHeight , letter, {
            fontSize: bomb.displayWidth
        }).setOrigin(.5, .5);
        
        bombs.push([bomb, textObj]);
        bomb.setGravity(0, 50);
        game.scene.scenes[1].physics.add.existing(textObj);
        textObj.body.setGravity(0, 50);
    
        game.scene.scenes[1].physics.add.collider(bomb, game.scene.scenes[1].ground, this.explode);
    }
    
    explode(bomb, ground) {
        const explosion = game.scene.scenes[1].physics.add.sprite(bomb.x, bomb.y, 'exploion');
        explosion.setGravity(0, 50);
        explosion.anims.play('explode');
        game.scene.scenes[1].explosionSound.play();
        for (let i = 0; i < bombs.length; i++) {
            if (bombs[i][0].index == bomb.index) {
                bombs[i][1].destroy();
                bombs.splice(i, 1);
            }
        }
        bomb.destroy();
        game.scene.scenes[1].lives--;
        explosion.on('animationcomplete', function() {
            this.destroy();
        })
    }
}

var letters = [];
var bombs = [];



function random_char() {
    let characterString = 'abcdefghijklmnopqrstuvwxyz';
    let randomNum = Math.floor(Math.random() * characterString.length);
    return characterString.charAt(randomNum);
}