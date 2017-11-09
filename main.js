window.onload = function() {
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    c.width = window.innerWidth;
    c.height = window.innerHeight;

    const vector = function(x=0, y=0, z=0) {
      return {
        x:x,
        y:y,
        z:z,
        times(scalar) {
          return vector(
            this.x * scalar,
            this.y * scalar,
            this.z * scalar
          );
        },
        plus(otherVector) {
          return vector(
            this.x + otherVector.x,
            this.y + otherVector.y,
            this.z + otherVector.z
          );
        },
        minus(otherVector) {
          return vector(
            this.x - otherVector.x,
            this.y - otherVector.y,
            this.z - otherVector.z
          );
        },
      }
    }

    const box = function(position=vector(), velocity=vector(), width=100, height=100, depth=100, mass=1) {
      return {
        pos: position,
        width: width,
        height: height,
        depth: depth,
        velocity: velocity,
        mass: mass,
        updatePosition(dt) {
          this.pos = this.pos.plus(this.velocity.times(dt));
        }
      };
    }

    const circularQueue = function(size=100) {
      if (size <= 0) {
        throw "circularQueue size must be positive";
      }
      let elems = [];
      for(let i = 0; i < size; i++) {
        elems.push(null);
      }
      return {
        size: size,
        elements: elems,
        head:-1,
        tail:-1,
        append(elem) {
          if (this.head === -1) {
            this.head = 0;
            this.tail = 0;
          } else {
            if (this.head === 0 && this.tail < this.size - 1) {
              this.tail += 1;
            } else {
              this.head = (this.head + 1) % this.size;
              this.tail = (this.tail + 1) % this.size;
            }
          }
          this.elements[this.tail] = elem;
        },
        getElement(index) {
          if (this.head === -1) {
            return null;
          }
          if (this.head === 0) {
            if (index > this.tail) {
              return null;
            }
            return this.elements[index];
          }
          if (index >= this.size) {
            return null;
          }
          let firstHalfSize = this.size - this.head;
          let secondHalfSize = this.tail + 1;
          if (index < firstHalfSize) {
            return this.elements[index + this.head];
          }
          return this.elements[index - firstHalfSize];
        },
        getSize() {
          if (this.head === -1) {
            return 0;
          }
          if (this.tail < this.head) {
            return this.size;
          }
          return this.tail + 1;
          let firstHalfSize = this.size - this.head;
          let secondHalfSize = this.tail + 1;
          if (index < firstHalfSize) {
            return this.elements[index + this.head];
          }
          return this.elements[index - firstHalfSize];
        }
      }
    }

    const random = function(start, end) {
      return start + parseInt((end - start + 1) * Math.random());
    }

    /* Returns true if box1 collides with box2 */
    const collidesWith = function(box1, box2) {
      return !(
        (box2.pos.x + box2.width < box1.pos.x || box2.pos.x > box1.pos.x + box1.width) ||
        (box2.pos.y + box2.height < box1.pos.y || box2.pos.y > box1.pos.y + box1.height) ||
        (box2.pos.z + box2.depth < box1.pos.z || box2.pos.z > box1.pos.z + box1.depth)
      );
    }

    /* box1 will apply impulse on box2 */
    const applyImpulse = function(box1, box2, dt) {
      if (box2.mass === 0) {
        return;
      }
      const difference = box2.pos.minus(box1.pos);
      box2.velocity = box2.velocity.plus(difference.times(dt).times(0.00005));
    }

    let state = "boxes";
    let boxes = [];

    $("#canvas").click(function(e){
        var x = e.clientX;
        var y = e.clientY;
        if (state === "boxes") {
          var vel = vector(random(0, 0.1), 0.1);
          var w = random(50, 100), h = random(50, 100), d = 0;
          let newBox = box(vector(x, y, 0), vel, w, h, d);
          boxes.push(newBox);
        } else {
          let newBox = box(vector(x, y, 0), vector(), 50, 50, 0, 0);
          boxes.push(newBox);
        }
    });

    let history = circularQueue(30);
    $('#timeline').on('input', function () {
      let timeVal = parseInt($(this).val());
      boxes = history.getElement(timeVal);
    });

    let timeline = $('#timeline');

    $("#toggleLand").click(function(e){
      if(state === "boxes") {
        state = "land";
      } else {
        state = "boxes";
      }
    });

    let currentTimestamp = window.performance.now();
    let numFrames = 0;

    let isStopped = false;

    function step(timestamp) {
      numFrames += 1;

      // clear previous frame
      ctx.clearRect(0, 0, c.width, c.height);

      const dt = timestamp - currentTimestamp;
      currentTimestamp = timestamp;

      // simulate
      for(var box of boxes) {
        box.updatePosition(dt);
      }

      // resolve collision
      for(var box1 of boxes) {
        for(var box2 of boxes) {
          if (box1 != box2) {
            if (collidesWith(box1, box2)) {
              applyImpulse(box1, box2, dt);
            }
          }
        }
      }

      if (numFrames % 60 === 0) {
        // record this frame
        history.append(boxes.slice());

        // update the scoller
        timeline.val(parseInt(timeline.val()) + 1);
      }

      // redraw scene
      for(var box of boxes) {
        if (box.pos.x < c.width && box.pos.y < c.height) {
          ctx.fillRect(box.pos.x, box.pos.y, box.width, box.height);
        }
      }

      // request the next frame
      if (isStopped === false) {
        window.requestAnimationFrame(step);
      }
    }

    function play() {
      isStopped = false;
      currentTimestamp = window.performance.now();
      window.requestAnimationFrame(step);
    }

    function pause() {
        isStopped = true;
    }

    $("#togglePause").click(function(e){
        var text = $(this).text();
        if (text === "Pause") {
            pause();
            $(this).text("Play");
        } else {
            play();
            $(this).text("Pause");
        }

    });

    play();
};
