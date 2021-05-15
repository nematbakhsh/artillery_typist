var game;
window.onload = function()
{
    var config = {
        type: Phaser.AUTO,       // can be either Phaser.CANVAS, Phaser.WEBGL or Phaser.AUTO
        width: window.innerWidth,
        height: window.innerHeight,
        parent: 'phaser-game',   // <div> tag name
        scene: [                 // game scenes array, if there is only one scene, [] can be omitted
            SceneTitle, SceneMain
        ],
        physics: {               // set physics object
            default: 'arcade',
            arcade: {
                gravity: {
                    //y: 100
                },
                //debug: true      // change it to false in production mode
            }
        }
    };
    game = new Phaser.Game(config);
    isMobile = navigator.userAgent.indexOf("Mobile") == -1 ? false : true;
}