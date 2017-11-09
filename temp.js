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
