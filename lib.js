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

function Box(center, width, height, depth, color, mass, velocity, log) {
  this.center = center;
  this.width = width;
  this.height = height;
  this.depth = depth;
  this.color = color;
  this.mass = mass;
  this.velocity = velocity;
  this.log = log;
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
    if (this.log) {
      console.log(depths);
    }
    var normals = [
      NORTHWARD_NORMAL, EASTWARD_NORMAL, SOUTHWARD_NORMAL, WESTWARD_NORMAL
    ];

    // a normal force should only kick in, if enough of the other object is on this object, else the surface area is too small to cause a normal force
    var PERCENTAGE_OBJECT_FOR_NORMAL = 0.1;
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

module.exports = {
  Vector: Vector,
  Box: Box
}
