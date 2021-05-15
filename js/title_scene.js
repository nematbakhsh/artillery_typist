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
        progressBox.fillStyle(0x220000, 0.8);
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

        // progress bar
        this.load.on('progress', function (value) {
            progressBar.clear();
            progressBar.fillStyle(0xff0000, 1);
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
            //
            // title name
            this.cameras.main.setBackgroundColor("rgba(50, 0, 0, 1)");
            const txtTitle = this.add.text(width * .5, height * .33, 'Artillery Typist', {
                fontSize: Math.min(height * .1, width * .1),
                fontFamily: 'Times New Roman',
                fontStyle: 'bold',
            }).setOrigin(.5, .5);
            txtTitle.setShadow(-2, 2, 'rgba(0,0,0,0.5)', 0);
            var grd = txtTitle.context.createLinearGradient(0,0,txtTitle.displayWidth,0);
            grd.addColorStop(0, '#777'); grd.addColorStop(0.4, '#fff');grd.addColorStop(1, '#777');
            txtTitle.setFill(grd);
            //
            // title scene buttons
            let buttonStart = this.add.text(width * .33, height * .5, 'START').setOrigin(.5, .5).setInteractive();
            let buttonCredits = this.add.text(width * .66, height * .5, 'CREDITS').setOrigin(.5, .5).setInteractive()
            buttonStart.setFontSize(Math.min(height * .05, width * .05));
            buttonCredits.setFontSize(Math.min(height * .05, width * .05));
            buttonStart.on('pointerdown', function() {
                this.scene.start('SceneMain');
                this.titleMusic.stop();
            }, this)
        }, this);

        // load your game assets here
        this.load.setPath('assets');
        //
        // for testing loading screen ... remove in production
        //for (let i = 1; i <= 200; i++) {
        //    this.load.image('logo'+i, 'sky.png');
        //}
        //
        // all game assets
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
        // title music
        this.titleMusic = this.sound.add('title_music', {
            volume: 0.5,
            loop: true
        });
        this.titleMusic.play();
    }

    update() {}
}