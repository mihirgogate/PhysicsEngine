var Vector = require("./lib.js").Vector;
var Box = require("./lib.js").Box;
var Game = require("./lib.js").Game;
var util = require("util");

var GAME_LOOP_SPEED_IN_MS = 1;
var NUM_LOOPS_IN_FRAME = 4;
var COLORS = {
  WHITE: "#FFF",
  BLACK:  "#000",
  GREEN: "#008000",
  GREY: "#808080"
};

var GRAVITY_ACCELERATION = new Vector(0, 9800, 0);

var GAME = new Game();

function generateRandom(start, end) {
  if (start == end) {
    return start;
  }
  var range = (end - start);
  var factor = parseInt(Math.random() * range * 10) % (range + 1);
  return start + factor;
}

function generateRandomColor() {
    var colors = [COLORS.BLACK, COLORS.GREEN, COLORS.GREY];
    var colorIndex = generateRandom(0, colors.length - 1);
    return colors[colorIndex];
}

$("#myCanvas").click(function(e){
    window.setInterval(function(){
      var x = e.clientX + generateRandom(0, 300);
      var y = e.clientY + generateRandom(0, 300);
      var width = generateRandom(35, 75);
      var height = generateRandom(35, 75);
      var vx = generateRandom(0, 2500);
      var vy = generateRandom(0, 2500);
      GAME.addObject(createDummy(x, y, generateRandomColor(), vx, vy, width, height, 10));
  }, 500);
});


function createDummy(x, y, color, vx, vy, width, height, mass) {
  var DUMMY_DEPTH = 0;
  var DUMMY_VELOCITY = new Vector(vx, vy, 0);
  return new Box(
    new Vector(x, y, 0), width, height, DUMMY_DEPTH, color, mass, DUMMY_VELOCITY);
}


window.onload = function() {
    var c = document.getElementById("myCanvas");
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    var ctx = c.getContext("2d");

    // create boxs(land)
    var boxs = [];
    var NUM_LANDS = 100;
    var LAND_WIDTH = 100;
    var LAND_HEIGHT = 100;
    var LAND_DEPTH = 0;
    var LAND_START = new Vector(0, c.height - LAND_HEIGHT, 0);
    var LAND_MASS = null;
    var LAND_VELOCITY = new Vector(0, 0 ,0);
    for (var i = 0; i < NUM_LANDS; i++) {
      var curX = LAND_START.x + (i * LAND_WIDTH);
      var landColor = i % 2 == 0 ? COLORS.BLACK : COLORS.GREY;
      var box = new Box(
        new Vector(curX, LAND_START.y, LAND_START.z),
        LAND_WIDTH, LAND_HEIGHT, LAND_DEPTH, landColor,
        LAND_MASS, LAND_VELOCITY
      );
      boxs.push(box);
    }
    boxs.push(
      new Box(
        new Vector(LAND_START.x + (10 * LAND_WIDTH), LAND_START.y - LAND_HEIGHT, LAND_START.z),
        LAND_WIDTH, LAND_HEIGHT, LAND_DEPTH, landColor,
        LAND_MASS, LAND_VELOCITY
      )
    )
    boxs.push(
      new Box(
        new Vector(LAND_START.x + (6 * LAND_WIDTH), LAND_START.y - LAND_HEIGHT, LAND_START.z),
        LAND_WIDTH, LAND_HEIGHT, LAND_DEPTH, landColor,
        LAND_MASS, LAND_VELOCITY
      )
    )


    // create hero
    var HERO_WIDTH = 20;
    var HERO_HEIGHT = 20;
    var HERO_DEPTH = 0;
    var HERO_VELOCITY = new Vector(0, 0, 0);
    var HERO_MASS = 10;
    var HERO_ELASTICITY = 1.2;
    var hero = new Box(
      new Vector(c.width / 2, c.height - LAND_HEIGHT - (3.1 * LAND_HEIGHT), 0), HERO_WIDTH, HERO_HEIGHT, HERO_DEPTH, COLORS.GREEN, HERO_MASS, HERO_VELOCITY);

    // add objects to a global list
    for (var i = 0; i < boxs.length; i++) {
      GAME.addObject(boxs[i]);
    }
    GAME.addObject(hero);

    // create viewport
    var viewport = new Box(
      new Vector(0, 0, 0), c.width, c.height, 0, null, 0, null
    )


    function  viewportDisplayBox(viewport, ctx, box) {
      if (box.color) {
        ctx.fillStyle = box.color;
      }
      if (viewport.isIntersect(box)) {
        ctx.fillRect(box.center.x - viewport.center.x, box.center.y - viewport.center.y, box.width, box.height);
      }
    }

    function viewportClear(viewport, ctx) {
      ctx.clearRect(0, 0, c.width, c.height);
    }

    function viewportCenter(viewport, hero) {
      viewport.center.x = hero.center.x - (c. width / 2) + (hero.width / 2);
      viewport.center.z = hero.center.z;
    }

    var numGameLoops = 0;

    window.setInterval(function(){
      var objects = GAME.getObjects();

      // set positions based on velocity
      for (var i = 0; i < objects.length; i++) {
        if (objects[i].mass) {
          objects[i].center = objects[i].center.add(objects[i].velocity.scalarMultiply(GAME_LOOP_SPEED_IN_MS / 1000));
        }
      }

      // calculate net force and final velocity of each object
      for (var i = 0; i < objects.length; i++) {
        var currentObject = objects[i];
        if (currentObject.mass) {
          // apply force due to gravity
          var totalExternalForce = GRAVITY_ACCELERATION.scalarMultiply(currentObject.mass);


          // apply normal forces due to collision
          var normalForcesThatOpposeForce = new Vector(0, 0, 0);
          var normalForcesThatOpposeVelocity = new Vector(0, 0, 0);
          for (var j = 0; j < objects.length; j++) {
            if (j != i) {
              var otherObject = objects[j];
              if (currentObject.isIntersect(otherObject)) {
                var otherObjectNormal = otherObject.getNormalForIntersection(currentObject);
                if (totalExternalForce.dotProduct(otherObjectNormal) < 0) {
                  normalForcesThatOpposeForce = normalForcesThatOpposeForce.add(otherObjectNormal);
                }
                if (currentObject.velocity.dotProduct(otherObjectNormal) < 0) {
                  normalForcesThatOpposeVelocity = normalForcesThatOpposeVelocity.add(otherObjectNormal);
                }
              }
            }
          }

          var totalNormalForce = new Vector(0, 0, 0);

          if (normalForcesThatOpposeForce.getMagnitude() > 0) {
            var unitVector = normalForcesThatOpposeForce.getUnitVector();
            var resolvedNormalForce = unitVector.scalarMultiply(
              Math.abs(totalExternalForce.dotProduct(unitVector))
            );
            totalNormalForce = totalNormalForce.add(resolvedNormalForce);
          }

          if (normalForcesThatOpposeVelocity.getMagnitude() > 0) {
            var unitVector = normalForcesThatOpposeVelocity.getUnitVector();
            var resolvedNormalForce = unitVector.scalarMultiply(
              Math.abs(currentObject.velocity.dotProduct(unitVector))
            ).scalarMultiply(HERO_ELASTICITY).scalarMultiply(currentObject.mass).scalarMultiply(1000 / GAME_LOOP_SPEED_IN_MS);
            totalNormalForce = totalNormalForce.add(resolvedNormalForce);
          }

          // calculate final force and new velocity
          var forces = [totalExternalForce, totalNormalForce];
          var finalForce = new Vector(0, 0, 0);
          for (var f = 0; f < forces.length; f++) {
            finalForce = finalForce.add(forces[f]);
          }
          var finalAcceleration = finalForce.scalarMultiply(1 / currentObject.mass);
          currentObject.velocity = currentObject.velocity.add(finalAcceleration.scalarMultiply(GAME_LOOP_SPEED_IN_MS / 1000));
        }
      }


      numGameLoops += 1;
      if (numGameLoops >= NUM_LOOPS_IN_FRAME) {
        viewportClear(viewport, ctx);
        viewportCenter(viewport, hero);
        for (var i = 0; i < objects.length; i++) {
          viewportDisplayBox(viewport, ctx, objects[i]);
        }
        numGameLoops = 0;
      }
    }, GAME_LOOP_SPEED_IN_MS);
}

    /*
    var img=document.getElementById("ball");
    var adam = new ContraHero(
      new RigidBody(
        new Vector(c.width / 2, 0),
        new Vector(0, 0)
      )
    );
    var State = function(sx, sy, width, height) {
      this.sx = sx;
      this.sy = sy;
      this.width = width;
      this.height = height;
    };
    var states = {
      'RIGHT': new State(29 *5, 17 * 1, 24, 35),
      'RIGHT_RUNNING1': new State(29 * 5, 132, 20, 36),
      'RIGHT_RUNNING2': new State(34 * 5, 132, 17, 36),
      'RIGHT_RUNNING3': new State(38 * 5, 132, 22, 36),
      'RIGHT_RUNNING4': new State(38 * 5, 132, 22, 36),
      'RIGHT_RUNNING5': new State(38 * 5, 132, 22, 36),
      'RIGHT_RUNNING6': new State((43 * 5) + 2, 132, 22, 36),
      'RIGHT_RUNNING7': new State((48 * 5) + 1, 132, 22, 36)
    }
    var curFrame = 0;
    var curState = 0;
    var x = c.width / 2;
    var y = c.height / 2;
    var MAX_NUM_STATES = 7;
    var INTERVAL_SIZE = 8;

    code below was in setInterval
      // x += 2;
      curFrame += 1;
      curState = (parseInt(curFrame / INTERVAL_SIZE) % MAX_NUM_STATES) + 1;
      var stateName = util.format("RIGHT_RUNNING%d", curState);
      var state = states[stateName];

      var scaleFactor = 5;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(img, state.sx, state.sy, state.width, state.height, x, y, state.width * scaleFactor, state.height * scaleFactor);
    */
