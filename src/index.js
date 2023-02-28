/**!
 * @file Uni the vegan unicorn  
 * @version 1.1.0.0  
 * @copyright Iuri Guilherme 2023  
 * @license GNU AGPLv3  
 * @author Iuri Guilherme <https://iuri.neocities.org/>  
 * @author Ben Hur Michel <https://www.linkedin.com/in/benhurmichel/>  
 * 
 * This program is free software: you can redistribute it and/or modify it 
 * under the terms of the GNU Affero General Public License as published by the 
 * Free Software Foundation, either version 3 of the License, or (at your 
 * option) any later version.  
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT 
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or 
 * FITNESS FOR A PARTICULAR PURPOSE.  
 * See the GNU Affero General Public License for more details.  
 * 
 * You should have received a copy of the GNU Affero General Public License 
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.  
 * 
 */

//~ import p5 from 'p5';
import { create as mcreate, all } from 'mathjs';
const math = mcreate(all, {})
//~ const phaser = require("phaser")
import Phaser from 'phaser';

const sleep = ms => new Promise(r => setTimeout(r, ms));
// https://github.com/fxhash/fxhash-webpack-boilerplate/issues/20
const properAlphabet = 
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
const variantFactor = 3.904e-87; // This number is magic
const fxhashDecimal = base58toDecimal(fxhashTrunc);
const featureVariant = fxHashToVariant(fxhashDecimal, 1);
//~ const featureVariant = -1;

const config = {
  "type": Phaser.AUTO,
  "width": 800,
  "height": 600,
  "parent": "canvas",
  "physics": {
    "default": "arcade",
    "arcade": {
      "gravity": { y: 300 },
      "debug": false
    }
  },
  "scene": {
    "preload": preload,
    "create": create,
    "update": update
  }
};

let game = new Phaser.Game(config);

let bombs;
let cursors;
let platforms;
let player;
let stars;

let animaisText;
let vegcoinsText;
let introText;
let over1Text;
let over2Text;

let vegcoins = 0;
let gameOver = false;
let lastMove = "right";

function preload () {
  this.load.image("sky", "sky.png");
  this.load.image("ground", "platform.png");
  this.load.image("ground2", "platform2.png");
  this.load.image("star", "star.png");
  this.load.image("bomb", "bomb.png");
  this.load.image("camiseta", "camiseta.png");
  //~ this.load.spritesheet(
    //~ "dude",
    //~ "dude.png",
    //~ {
      //~ "frameWidth": 178,
      //~ "frameHeight": 198
    //~ }
  //~ );
  this.load.spritesheet(
    "dude",
    "dude2.png",
    {
      "frameWidth": 178,
      "frameHeight": 198
    }
  );
}

function create () {
  // Fundo
  this.add.image(400, 300, "sky").setScale(0.4);

  platforms = this.physics.add.staticGroup();
  // Chão
  platforms.create(400, 568, "ground2").setScale(1).refreshBody();
  //~ platforms.create(400, 568, "ground2").setScale(2).refreshBody();
  // Plataformas
  platforms.create(600, 400, "ground").setScale(1);
  platforms.create(50, 250, "ground").setScale(1);
  platforms.create(750, 220, "ground").setScale(1);

  // Uni
  player = this.physics.add.sprite(100, 450, "dude").setScale(0.5);
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  this.anims.create({
    "key": "left",
    "frames": this.anims.generateFrameNumbers(
      "dude",
      {
        "start": 0,
        "end": 3
      }
    ),
    "frameRate": 10,
    "repeat": -1
  });
  this.anims.create({
    "key": "stand_left",
    "frames": [
      {
        "key": "dude",
        "frame": 0
      }
    ],
    "frameRate": 20
  });
  this.anims.create({
    "key": "jump_left",
    "frames": [
      {
        "key": "dude",
        "frame": 4
      }
    ],
    "frameRate": 20,
    "repeat": -1
  });
  this.anims.create({
    "key": "jump_right",
    "frames": [
      {
        "key": "dude",
        "frame": 5
      }
    ],
    "frameRate": 20,
    "repeat": -1
  });
  this.anims.create({
    "key": "right",
    "frames": this.anims.generateFrameNumbers(
      "dude",
      {
        "start": 6,
        "end": 9
      }
    ),
    "frameRate": 10,
    "repeat": -1
  });
  this.anims.create({
    "key": "stand_right",
    "frames": [
      {
        "key": "dude",
        "frame": 6
      }
    ],
    "frameRate": 20
  });

  cursors = this.input.keyboard.createCursorKeys();

  // Vegcoins
  stars = this.physics.add.group({
    "key": "star",
    "repeat": 11,
    "setXY": {
      "x": 12,
      "y": 0,
      "stepX": 70
    },
  });
  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    child.setScale(0.2);
  });

  bombs = this.physics.add.group();

  // Contagem de Vegcoins
  vegcoinsText = this.add.text(
    8,
    8,
    "VegCoins: 0",
    {
      "fontSize": "20px",
      "fill": "#fafafa"
    }
  );
  animaisText = this.add.text(
    512,
    8,
    "Animais prejudicados: 0",
    {
      "fontSize": "20px",
      "fill": "#fafafa"
    }
  );
  introText = this.add.text(
    90,
    160,
    "Use as setas do teclado para mover\npule com seta para cima!",
    {
      "font": "24px Arial",
      "fill": "#fafafa",
      "align": "center"
    }
  );

  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(bombs, platforms);

  this.physics.add.overlap(player, stars, collectStar, null, this);
  this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update () {
  if (gameOver) {
    return;
  }
  if (player.body.touching.down) {
    if (cursors.up.isDown) {
      player.setVelocityY(-330);
      player.anims.play("jump_" + lastMove, true);
    } else if (cursors.left.isDown) {
      player.setVelocityX(-160);
      player.anims.play("left", true);
      lastMove = "left";
    } else if (cursors.right.isDown) {
      player.setVelocityX(160);
      player.anims.play("right", true);
      lastMove = "right";
    } else {
      player.setVelocityX(0);
      player.anims.play("stand_" + lastMove);
    }
  } else {
    if (cursors.left.isDown) {
      player.setVelocityX(-160);
      lastMove = "left";
      player.anims.play("jump_" + lastMove, true);
    } else if (cursors.right.isDown) {
      player.setVelocityX(160);
      lastMove = "right";
      player.anims.play("jump_" + lastMove, true);
    } else {
      player.anims.play("jump_" + lastMove, true);
    }
  }
}

function collectStar (player, star) {
  introText.destroy();

  star.disableBody(true, true);
  //  Add and update the score
  vegcoins += 1;
  vegcoinsText.setText("VegCoins: " + vegcoins);

  if (stars.countActive(true) === 0) {
    //  A new batch of stars to collect
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });
    let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    let bomb = bombs.create(x, 16, "bomb").setScale(0.36);
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    bomb.allowGravity = false;
  }
}

function hitBomb (player, bomb) {
  over1Text = this.add.text(200, 300, "Unicórnios", { font: "64px Monospace", fill: "#e8e8e8", align: "center" });
  over2Text = this.add.text(100, 430, "não comem carne!", { font: "64px Monospace", fill: "#e8e8e8", align: "center" });
  //~ this.add.image(400, 300, "camiseta").setScale(0.6);
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.play("jump_" + lastMove);
  gameOver = true;
}

/**
 * @param {String} hash: unique fxhash string (or xtz transaction hash)
 * @returns {float} decimal representation of the number in base58 
 */
function base58toDecimal(hash = fxhashTrunc) {
    let decimal = 0;
    let iterArray = Array.from(hash).reverse();
    while (iterArray.length > 0) {
        decimal += properAlphabet.indexOf(iterArray.slice(-1)) * (math.pow(58,
            iterArray.length - 1));
        iterArray = iterArray.slice(0, -1);
    }
    return decimal;
}

/**
 * @param {float} decimalHash: output from base58toDecimal(fxhash)
 * @param {int} maxVariants: the inclusive n from the desired range 
 *      of (0, n) for the return value
 * @param {boolean} inverse: transforms range into (n, 0)
 * @returns {int} one random integer defined by fxhash and a threshold
 *      defined by maxVariants * variantFactor
 */
function fxHashToVariant(decimalHash, maxVariants = 0, inverse = false) {
    let variant = math.round(decimalHash * maxVariants * variantFactor);
    if (inverse) {
        return math.abs(maxVariants - variant);
    }
    return variant;
}

window.$fxhashFeatures = {
  "fx(variant)": featureVariant
}
