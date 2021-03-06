var INF = Number.MAX_VALUE;
var ACTIONS = require('./actions').ACTIONS;

function Vector(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
}

Vector.prototype.equals = function(other) {
  return (this.x === other.x &&
          this.y === other.y &&
          this.z === other.z);
}

Vector.prototype.add = function(other) {
  return new Vector(
    this.x + other.x,
    this.y + other.y,
    this.z + other.z
  );
}

Vector.prototype.scalarMultiply = function(factor) {
  return new Vector(
    this.x * factor,
    this.y * factor,
    this.z * factor
  );
}

Vector.prototype.dotProduct = function(other) {
  return (
    (this.x * other.x) +
    (this.y * other.y) +
    (this.z * other.z)
  )
}

Vector.prototype.getMagnitude = function() {
  return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
}

Vector.prototype.getUnitVector = function() {
  var magnitude = Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
  return new Vector(
    (this.x) / (magnitude),
    (this.y) / (magnitude),
    (this.z) / (magnitude)
  );
}

var SOUTHWARD_NORMAL = new Vector(0, 1, 0);
var NORTHWARD_NORMAL = new Vector(0, -1, 0);
var WESTWARD_NORMAL = new Vector(-1, 0, 0);
var EASTWARD_NORMAL = new Vector(1, 0, 0);

function Box(center, width, height, depth, color, mass, velocity) {
  this.center = center;
  this.width = width;
  this.height = height;
  this.depth = depth;
  this.color = color;
  this.mass = mass;
  this.velocity = velocity;
}

Box.prototype.hasFiniteMass = function() {
  return Number.isInteger(this.mass) && this.mass != INF;
}

Box.prototype.hasNonZeroMass = function() {
  return Number.isInteger(this.mass) && this.mass > 0;
}

Box.prototype.isIntersect = function(other) {
  var xIntersect = this._isIntersect(
    this.center.x,
    this.width,
    other.center.x,
    other.width
  );
  var yIntersect = this._isIntersect(
    this.center.y,
    this.height,
    other.center.y,
    other.height
  );
  var zIntersect = this._isIntersect(
    this.center.z,
    this.depth,
    other.center.z,
    other.depth
  );
  return xIntersect && yIntersect && zIntersect;
}

Box.prototype.getNormalForIntersection = function(other) {
  if (this.isIntersect(other)) {
    var LEFT_PENETRATION_DEPTH = other.center.x + other.width - this.center.x;
    var RIGHT_PENETRATION_DEPTH =  this.center.x + this.width - other.center.x;
    var TOP_PENETRATION_DEPTH = other.center.y + other.height - this.center.y;
    var BOTTOM_PENETRATION_DEPTH = this.center.y + this.height - other.center.y;
    var depths = [
      TOP_PENETRATION_DEPTH, RIGHT_PENETRATION_DEPTH, BOTTOM_PENETRATION_DEPTH, LEFT_PENETRATION_DEPTH
    ];
    var normals = [
      NORTHWARD_NORMAL, EASTWARD_NORMAL, SOUTHWARD_NORMAL, WESTWARD_NORMAL
    ];

    // a normal force should only kick in, if enough of the other object is on this object, else the surface area is too small to cause a normal force
    var PERCENTAGE_OBJECT_FOR_NORMAL = 0.05;
    var NORTH_SOUTH_CRITERIA = RIGHT_PENETRATION_DEPTH >= PERCENTAGE_OBJECT_FOR_NORMAL * other.width && LEFT_PENETRATION_DEPTH >= PERCENTAGE_OBJECT_FOR_NORMAL * other.width;
    var EAST_WEST_CRITERIA = TOP_PENETRATION_DEPTH >= PERCENTAGE_OBJECT_FOR_NORMAL * other.height && BOTTOM_PENETRATION_DEPTH >= PERCENTAGE_OBJECT_FOR_NORMAL * other.height;
    var criteria = [
      NORTH_SOUTH_CRITERIA, EAST_WEST_CRITERIA, NORTH_SOUTH_CRITERIA, EAST_WEST_CRITERIA
    ];
    var smallestIndex = -1;
    for (var i = 0; i < depths.length; i++) {
      if (depths[i] >= 0 && ((smallestIndex == -1) || (depths[i] < depths[smallestIndex]))) {
        smallestIndex = i;
      }
    }
    if (criteria[smallestIndex]) {
      return normals[smallestIndex];
    }
    return new Vector(0, 0, 0);
  }
  throw "Cant call getNormalForIntersection if there is no intersection";
}

Box.prototype._isIntersect = function(thisDim, thisSize, otherDim, otherSize) {
  var thisLeft = thisDim;
  var thisRight = thisDim + thisSize;
  var otherLeft = otherDim;
  var otherRight = otherDim + otherSize;
  return !((thisRight < otherLeft) || (thisLeft > otherRight));
}

function Game() {
  this.objects = [];
}

Game.prototype.addObject = function(object) {
  this.objects.push(object);
}

Game.prototype.getObjects = function() {
  return this.objects;
}

function Alien(box) {
  Box.call(this, box.center, box.width, box.height, box.depth, box.color, box.mass, box.velocity);
}
Alien.prototype = Object.create(Box.prototype);
Alien.prototype.constructor = Alien;

function Hero(box) {
  Box.call(this, box.center, box.width, box.height, box.depth, box.color, box.mass, box.velocity);
  this.hasFiredShot = false;
  this.previousHorizontalDirection = 1;
  this.direction = new Vector(1, 0, 0);
}
Hero.prototype = Object.create(Box.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.shouldShoot = function(isShootActionActive) {
  if (isShootActionActive && !this.hasFiredShot) {
    this.hasFiredShot = true;
    return true;
  }
  if (!isShootActionActive && this.hasFiredShot) {
    this.hasFiredShot = false;
  }
  return false;
}

Hero.prototype.updateDirection = function(leftRightAction, upDownAction) {
  var horizontal = null;
  var vertical = null;
  if (leftRightAction == ACTIONS.LEFT) {
    horizontal = -1;
  }
  if (leftRightAction == ACTIONS.RIGHT) {
    horizontal = 1;
  }
  if (upDownAction == ACTIONS.UP) {
    vertical = -1;
  }
  if (upDownAction == ACTIONS.DOWN) {
    vertical = 1;
  }
  if(horizontal && vertical) {
    this.direction.x = horizontal;
    this.direction.y = vertical;
  } else if (!horizontal && vertical) {
    if(this.direction.x != 0) {
      this.previousHorizontalDirection = this.direction.x;
    }
    this.direction.x = 0;
    this.direction.y = vertical;
  } else if (horizontal && !vertical) {
    this.direction.x = horizontal;
    this.direction.y = 0;
  } else {
    if (this.direction.x == 0) {
      this.direction.x = this.previousHorizontalDirection;
    }
    this.direction.y = 0;
  }
}

module.exports = {
  Vector: Vector,
  Box: Box,
  Game: Game,
  Alien: Alien,
  Hero: Hero,
  INF: INF
}
