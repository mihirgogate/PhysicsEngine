var test = require('tape');
var Vector = require("./lib.js").Vector;
var Box = require("./lib.js").Box;
var RigidBody = require("./lib.js").RigidBody;

test('test Vector construction', function(assert){
  var v = new Vector(1, 2, 3);
  assert.equals(1, v.x);
  assert.equals(2, v.y);
  assert.equals(3, v.z);
  assert.end();
});

test('test Box isIntersect', function(assert){
  var first = new Box(
    new Vector(0, 0, 0),
    100, 100, 0, null, null, null
  );
  var second = new Box(
    new Vector(50, 0, 0),
    100, 100, 0, null, null, null
  );
  assert.equals(true, first.isIntersect(second));
  assert.end();
});

test('test Box isIntersect if first box surrounds the second', function(assert){
  var first = new Box(
    new Vector(-10, -10, 0),
    500, 500, 0, null, null, null
  );
  var second = new Box(
    new Vector(0, 0, 0),
    100, 100, 0, null, null, null
  );
  assert.equals(true, first.isIntersect(second));
  assert.end();
});
