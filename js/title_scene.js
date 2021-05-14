class SceneTitle extends Phaser.Scene {
    constructor() {
        super('SceneTitle');
    }

    preload()
    {
        // loading ... screen
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width * .25 , height * .4, width * .5, height * .2);

        
        var loadingText = this.make.text({
            x: width * .5,
            y: height * .3,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        var percentText = this.make.text({
            x: width / 2,
            y: height / 2 ,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        this.load.on('progress', function (value) {
            //console.log(value);
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width * .25 + 10, height * .4 + 10, (width * .5 - 20) * value, height * .2 -20);
            percentText.setText(parseInt(value * 100) + '%');
        });
                    
        this.load.on('fileprogress', function (file) {
            //console.log(file.src);
        });
         
        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();

            // show title scene
            this.cameras.main.setBackgroundColor("rgba(150, 30, 0, 1)");
            this.add.text(width * .5, height * .33, 'Artillery Typist', {
                fontSize: height * .1,
            }).setOrigin(.5, .5);
            this.titleMusic = this.sound.add('title_music', {
                volume: 0.5,
                loop: true
            });
            //this.titleMusic.play();
            let buttonStart = this.add.text(width * .33, height * .5, 'START').setOrigin(.5, .5).setInteractive();
            let buttonCredits = this.add.text(width * .66, height * .5, 'CREDITS').setOrigin(.5, .5).setInteractive()
            buttonStart.on('pointerdown', function() {
                this.scene.start('SceneMain');
                this.titleMusic.stop();
            }, this)
        //console.log(this.scene);
        }, this);

        // load your game assets here
        this.load.setPath('assets');
        //for (let i = 1; i <= 200; i++) {
        //    this.load.image('logo'+i, 'sky.png');
        //}
        this.load.image('sky', 'sky.png');
        this.load.image('ground', 'ground.png');
        this.load.image('aircraft', 'airship.png');
        this.load.image('bomb', 'missile.png');
        this.load.image('heart', 'corazon.png');
        this.load.spritesheet('explosion', 
            'explosion.png',
            { frameWidth: 96, frameHeight: 96 }
        );
        this.load.audio('explosion_sound', 'Chunky_Explosion.mp3');
        this.load.audio('win_sound', 'Picked_Coin_Echo_2.wav');
        this.load.audio('title_music', 'POL-strategic-war-short.wav');
    }

    create() {
        
    }

    update() {}
}