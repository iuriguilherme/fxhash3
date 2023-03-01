/**!
 * @file Uni the vegan unicorn  
 * @version 2.3.0.0  
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

import { create as mcreate, all as mall } from 'mathjs';
const math = mcreate(mall, {})
import Phaser from 'phaser';
//~ import { SVG } from 'css.gg';
//~ import { 'icons/svg/arrow_up_r.svg' as arrow_up } from 'css.gg';

const version = "2.3.0";
const sleep = ms => new Promise(r => setTimeout(r, ms));
// https://github.com/fxhash/fxhash-webpack-boilerplate/issues/20
const properAlphabet = 
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
const variantFactor = 3.904e-87; // This number is magic
const fxhashDecimal = base58toDecimal(fxhashTrunc);

let scm = 0.45;

let config = {
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
  },
  "scale": {
    "mode": Phaser.Scale.NONE,
    "zoom": Phaser.Scale.MAX_ZOOM
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
let introVegcoinsText;
let introUpText;
let introDownText;
let introLeftText;
let introRightText;
let introShadow;
let introSmallShadow;
let over1Text;
let over2Text;
let arrowUp;
let arrowDown;
let arrowLeft;
let arrowRight;

let level = 1;
let vegcoins = 0;
let gameOver = false;
let lastMove = "right";

function preload () {
  this.load.image("sky", "sky.png");
  this.load.image("ground", "platform.png");
  this.load.image("ground2", "platform2.png");
  this.load.image("star", "star.png");
  this.load.image("bomb", "bomb.png");
  this.load.image("over", "over.png");
  this.load.image("over2", "over2.png");
  this.load.spritesheet(
    "dude",
    "dude.png",
    {
      "frameWidth": 178,
      "frameHeight": 198
    }
  );
  this.load.svg("arrow_up", "arrow-up-r.svg");
  this.load.svg("arrow_down", "arrow-down-r.svg");
  this.load.svg("arrow_left", "arrow-left-r.svg");
  this.load.svg("arrow_right", "arrow-right-r.svg");
}

function create() {
  console.log("featureVariant: " + featureVariant);
  console.log("level: " + platformsMap[featureVariant][0]);
  console.log("version: " + version);
  console.log("platforms:");
  let info = Object.keys(this.sys.game.device.os).filter(
      key => this.sys.game.device.os[key] && key !== 'pixelRatio');
  for (let i = 0; i < info.length; i++) {
    console.log(info[i]);
  }
  this.add.image(400, 300, "sky").setScale(0.4);
  platforms = this.physics.add.staticGroup();
  platforms.create(400, 568, "ground2").setScale(1).refreshBody();
  for (let i = 1; i < platformsMap[featureVariant].length; i++) {
    platforms.create(
      platformsMap[featureVariant][i][0],
      platformsMap[featureVariant][i][1],
      "ground"
    );
  }
  player = this.physics.add.sprite(100, 450, "dude").setScale(0.5 * scm);
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
  stars = this.physics.add.group({
    "key": "star",
    "repeat": 14,
    "setXY": {
      "x": 12,
      "y": 0,
      "stepX": 54,
      "stepY": 30
    },
  });
  stars.children.iterate(function (child) {
    child.setBounceY(fxrand());
    child.setScale(0.2 * scm);
  });
  bombs = this.physics.add.group();
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
    584,
    8,
    "Animals killed: 0",
    {
      "fontSize": "20px",
      "fill": "#fafafa"
    }
  );
  introShadow = this.add.image(400, 300, "over").setScale(0.6);
  introSmallShadow = this.add.image(400, 420, "over2").setScale(0.05);
  introVegcoinsText = this.add.text(
    215,
    250,
    "Collect the VegCoins!",
    {
      "fontSize": "32px",
      "fill": "#fafafa",
      "align": "center"
    }
  );
  introUpText = this.add.text(
    370,
    360,
    "Jump",
    {
      "fontSize": "24px",
      "fill": "#fafafa",
      "align": "center"
    }
  );
  introDownText = this.add.text(
    265,
    450,
    "Reset\n(when game is over)",
    {
      "fontSize": "24px",
      "fill": "#fafafa",
      "align": "center"
    }
  );
  introLeftText = this.add.text(
    220,
    400,
    "Move left",
    {
      "fontSize": "24px",
      "fill": "#fafafa",
      "align": "center"
    }
  );
  introRightText = this.add.text(
    450,
    400,
    "Move right",
    {
      "fontSize": "24px",
      "fill": "#fafafa",
      "align": "center"
    }
  );
  arrowUp = this.add.image(400, 400, 'arrow_up');
  arrowDown = this.add.image(400, 430, 'arrow_down');
  arrowLeft = this.add.image(370, 430, 'arrow_left');
  arrowRight = this.add.image(430, 430, 'arrow_right');
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(bombs, platforms);
  this.physics.add.overlap(player, stars, collectStar, null, this);
  this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update () {
  if (gameOver) {
    if (cursors.down.isDown) {
      this.registry.destroy();
      this.events.off();﻿
      this.scene.restart();﻿﻿﻿﻿
      level = 1;
      vegcoins = 0;
      gameOver = false;
    } else {
      return;
    }
  }
  if (player.body.touching.down) {
    if (cursors.up.isDown) {
      player.setVelocityY(-330 * (scm * 1.5));
      player.anims.play("jump_" + lastMove, true);
    } else if (cursors.left.isDown) {
      player.setVelocityX(-160 * (scm * 1.5));
      player.anims.play("left", true);
      lastMove = "left";
    } else if (cursors.right.isDown) {
      player.setVelocityX(160 * (scm * 1.5));
      player.anims.play("right", true);
      lastMove = "right";
    } else {
      player.setVelocityX(0);
      player.anims.play("stand_" + lastMove);
    }
  } else {
    if (cursors.left.isDown) {
      player.setVelocityX(-160 * (scm * 1.5));
      lastMove = "left";
      player.anims.play("jump_" + lastMove, true);
    } else if (cursors.right.isDown) {
      player.setVelocityX(160 * (scm * 1.5));
      lastMove = "right";
      player.anims.play("jump_" + lastMove, true);
    } else {
      player.anims.play("jump_" + lastMove, true);
    }
  }
}

function collectStar (player, star) {
  introShadow.destroy();
  introSmallShadow.destroy();
  introVegcoinsText.destroy();
  introUpText.destroy();
  introDownText.destroy();
  introLeftText.destroy();
  introRightText.destroy();
  arrowUp.destroy();
  arrowDown.destroy();
  arrowLeft.destroy();
  arrowRight.destroy();
  star.disableBody(true, true);
  vegcoins += level;
  vegcoinsText.setText("VegCoins: " + vegcoins + "(x" + level + ")");
  if (stars.countActive(true) === 0) {
    stars.children.iterate(function (child) {
      child.enableBody(
        true,
        child.x,
        math.round(fxrand() * 450),
        true,
        true
      );
    });
    let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : 
      Phaser.Math.Between(0, 400);
    let bomb = bombs.create(x, 16, "bomb").setScale(0.36 * scm);
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(fxrand() * 400 - 200, 20);
    bomb.allowGravity = false;
    level += 1;
    vegcoinsText.setText("VegCoins: " + vegcoins + "(x" + level + ")");
  }
}

function hitBomb (player, bomb) {
  this.add.image(400, 300, "over").setScale(0.6);
  this.add.text(
    100,
    240,
    "Unicorns don't eat meat!",
    {
      "fontSize": "42px",
      "fill": "#e8e8e8",
      "align": "center"
    }
  );
  this.add.text(
    90,
    330,
    "press DOWN key to restart",
    {
      "fontSize": "42px",
      "fill": "#e8e8e8",
      "align": "center"
    }
  );
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.play("jump_" + lastMove);
  gameOver = true;
}

const platformsMap = [
  [
    "Zero",
    [100, 470],
    [600, 390],
    [700, 310],
    [100, 230],
    [750, 230],
    [400, 150],
  ],
  [
    "Meet in the Middle",
    [400, 470],
    [100, 390],
    [700, 390],
    [400, 310],
    [100, 230],
    [700, 230],
    [400, 150],
  ],
  [
    "Stairway",
    [470, 470],
    [390, 390],
    [310, 310],
    [230, 230],
    [150, 150],
    [70, 70],
  ],
  [
    "Ladder",
    [720, 470],
    [60, 470],
    [735, 390],
    [45, 390],
    [750, 310],
    [30, 310],
    [765, 230],
    [15, 230],
    [780, 150],
    [0, 150],
    [400, 70],
  ],
];

const featureVariant = fxHashToVariant(fxhashDecimal, platformsMap.length - 1);
//~ const featureVariant = 3;

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

window.addEventListener(
  "resize",
  game.scale.setMaxZoom()
);

window.$fxhashFeatures = {
  "Level": platformsMap[featureVariant][0]
}
