(function() {
  window.HYPERCUBE_DEFAULT_OPTIONS = window.HYPERCUBE_DEFAULT_OPTIONS || { 'edges': true, 'indices': false, 'perspective': false };
  window.HYPERCUBE_DEFAULT_WIDTH = window.HYPERCUBE_DEFAULT_WIDTH || 480;
  window.HYPERCUBE_DEFAULT_HEIGHT = window.HYPERCUBE_DEFAULT_HEIGHT || 480;
  window.HYPERCUBE_DEFAULT_MAX_NORM = window.HYPERCUBE_DEFAULT_MAX_NORM || 2; // sqrt(4): euclidean distance from origin to hypercube corner

  var hypercube = {};
  var canvas;
  var options;
  var checkboxes;

  hypercube.vertices = // Begin with an unrotated unit hypercube
  [
    { x:  1, y:  1, z:  1, w:  1 },
    { x:  1, y:  1, z:  1, w: -1 },
    { x:  1, y:  1, z: -1, w:  1 },
    { x:  1, y:  1, z: -1, w: -1 },
    { x:  1, y: -1, z:  1, w:  1 },
    { x:  1, y: -1, z:  1, w: -1 },
    { x:  1, y: -1, z: -1, w:  1 },
    { x:  1, y: -1, z: -1, w: -1 },
    { x: -1, y:  1, z:  1, w:  1 },
    { x: -1, y:  1, z:  1, w: -1 },
    { x: -1, y:  1, z: -1, w:  1 },
    { x: -1, y:  1, z: -1, w: -1 },
    { x: -1, y: -1, z:  1, w:  1 },
    { x: -1, y: -1, z:  1, w: -1 },
    { x: -1, y: -1, z: -1, w:  1 },
    { x: -1, y: -1, z: -1, w: -1 }
  ];

  hypercube.edges = // Repeated connections have been removed
  [
    [ 0,  1], [ 0,  2], [ 0,  4], [ 0,  8],
              [ 1,  3], [ 1,  5], [ 1,  9],
              [ 2,  3], [ 2,  6], [ 2, 10],
                        [ 3,  7], [ 3, 11],
              [ 4,  5], [ 4,  6], [ 4, 12],
                        [ 5,  7], [ 5, 13],
                        [ 6,  7], [ 6, 14],
                                  [ 7, 15],
              [ 8,  9], [ 8, 10], [ 8, 12],
                        [ 9, 11], [ 9, 13],
                        [10, 11], [10, 14],
                                  [11, 15],
                        [12, 13], [12, 14],
                                  [13, 15],
                                  [14, 15]

  ];

  hypercube.faces = // Repeated 4-cycles have been removed
  [
    [ 0,  1,  9,  8], [ 0,  2,  3,  1], [ 0,  4,  6,  2], [ 0,  8, 12,  4],
                                        [ 1,  5,  7,  3], [ 1,  9, 13,  5],
    [ 2,  0,  8, 10],                   [ 2,  6,  7,  3], [ 2, 10, 14,  6],
    [ 3,  1,  9, 11],                                     [ 3, 11, 15,  7],
                      [ 4,  5,  1,  0], [ 4,  6,  7,  5], [ 4, 12, 14,  6],
                                                          [ 5, 13, 15,  7],
                                                          [ 6, 14, 15,  7],

                                        [ 8, 10, 11,  9], [ 8, 12, 14, 10],
                                                          [ 9, 13, 15, 11],
                                                          [10, 14, 15, 11],
    [11,  3,  7, 15],
                                        [12, 13,  9,  8], [12, 14, 15, 13],
                      [13,  9,  1,  5]


  ]; // Unused (some useful data for those that want it though)

  hypercube.rotate = function(axis, theta) // sin and cos precomputed for efficiency
  {
    var s = Math.sin(theta);
    var c = Math.cos(theta);
    for (var i in this.vertices)
    {
      this.rotateVertex[axis](this.vertices[i], s, c);
    }
  };

  hypercube.rotateVertex = // Multiplication by vector rotation matrices of dimension 4
  {
    xy: function(v, s, c)
    {
      tmp = c * v.x + s * v.y;
      v.y = -s * v.x + c * v.y;
      v.x = tmp;
    },
    xz: function(v, s, c)
    {
      tmp = c * v.x + s * v.z;
      v.z = -s * v.x + c * v.z;
      v.x = tmp;
    },
    xw: function(v, s, c)
    {
      tmp = c * v.x + s * v.w;
      v.w = -s * v.x + c * v.w;
      v.x = tmp;
    },
    yz: function(v, s, c)
    {
      tmp = c * v.y + s * v.z;
      v.z = -s * v.y + c * v.z;
      v.y = tmp;
    },
    yw: function(v, s, c)
    {
      tmp = c * v.y - s * v.w;
      v.w = s * v.y + c * v.w;
      v.y = tmp;
    },
    zw: function(v, s, c)
    {
      tmp = c * v.z - s * v.w;
      v.w = s * v.z + c * v.w;
      v.z = tmp;
    }
  };

  function init()
  {
    /* Begin retrieved variables. */

    canvas = document.getElementById('hypercube-canvas');
    options = document.getElementById('hypercube-options');
    if (options)
    {
      checkboxes = options.getElementsByTagName('input');
    }
    else
    {
      checkboxes = [];
      options = {}
      for (var name in HYPERCUBE_DEFAULT_OPTIONS)
      {
        options[name] = { 'checked': false };
      }
    }
    var context = canvas.getContext('2d');

    /* End retrieved variables. */

    /* Begin declared variables. */

    canvas.width = HYPERCUBE_DEFAULT_WIDTH;
    canvas.height = HYPERCUBE_DEFAULT_HEIGHT;
    hypercube.maxNorm = HYPERCUBE_DEFAULT_MAX_NORM; // This value can be spoofed to affect scaling

    /* End declared variables. */

    /* Begin painting routines. */

    hypercube.draw = function()
    {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.lineWidth = 4;
      context.lineJoin = 'round';
      var adjusted = [];
      for (var i in this.vertices)
      {
        if (options.perspective.checked)
        {
          var zratio = this.vertices[i].z / this.maxNorm;
          adjusted[i] =
          {
            x: Math.floor(canvas.width / 2 + (0.90 + zratio * 0.30) * this.bound * (this.vertices[i].x / this.maxNorm)) + 0.5,
            y: Math.floor(canvas.height / 2 - (0.90 + zratio * 0.30) * this.bound * (this.vertices[i].y / this.maxNorm)) + 0.5,
            z: 0.60 + 0.40 * zratio,
            w: 96 + Math.floor(96 * this.vertices[i].w / this.maxNorm)
          };
        }
        else
        {
          adjusted[i] =
          {
            x: Math.floor(canvas.width / 2 + this.bound * (this.vertices[i].x / this.maxNorm)) + 0.5,
            y: Math.floor(canvas.height / 2 - this.bound * (this.vertices[i].y / this.maxNorm)) + 0.5,
            z: 0.60 + 0.40 * this.vertices[i].z / this.maxNorm,
            w: 191 + Math.floor(64 * this.vertices[i].w / this.maxNorm)
          };
        }
      }
      if (options.edges.checked)
      {
        for (var i in this.edges)
        {
          var x = [adjusted[this.edges[i][0]].x, adjusted[this.edges[i][1]].x];
          var y = [adjusted[this.edges[i][0]].y, adjusted[this.edges[i][1]].y];
          var z = [adjusted[this.edges[i][0]].z, adjusted[this.edges[i][1]].z];
          var w = [adjusted[this.edges[i][0]].w, adjusted[this.edges[i][1]].w];
          context.beginPath();
          context.moveTo(x[0], y[0]);
          context.lineTo(x[1], y[1]);
          context.closePath();
          var gradient = context.createLinearGradient(x[0], y[0], x[1], y[1]); // Distance fade effect
          gradient.addColorStop(0, 'rgba(255, ' + w[0] + ', 0, ' + z[0] + ')');
          gradient.addColorStop(1, 'rgba(255, ' + w[1] + ', 0, ' + z[1] + ')');
          context.strokeStyle = gradient;
          context.stroke();
        }
      }
      if (options.indices.checked)
      {
        context.font = 'italic 10px sans-serif';
        context.textBaseline = 'top';
        context.fillStyle = '#000';
        for (var i in adjusted)
        {
          context.fillText(i.toString(), adjusted[i].x, adjusted[i].y);
        }
      }
    };

    /* End painting routines. */

    /* Begin mouse handling routines. */

    hypercube.clicked = false;
    hypercube.bound = Math.min(canvas.width, canvas.height) / 2;

    canvas.onmousedown = function(e)
    { 
      hypercube.startCoords = mouseCoords(e);
      hypercube.startCoords.x -= Math.floor(this.width / 2);
      hypercube.startCoords.y = Math.floor(this.height / 2) - hypercube.startCoords.y;
      hypercube.clicked = true;
    };

    document.onmousemove = function(e)
    {
      if (!hypercube.clicked)
      {
        return true;
      }

      var currCoords = mouseCoords(e);
      currCoords.x -= Math.floor(canvas.width / 2);
      currCoords.y = Math.floor(canvas.height / 2) - currCoords.y;
      var motion = { 'x': currCoords.x - hypercube.startCoords.x, 'y': currCoords.y - hypercube.startCoords.y };

      if (e.shiftKey && (e.altKey || e.ctrlKey))
      {
        hypercube.rotate('xy', Math.PI * motion.x / hypercube.bound); // Full canvas drag ~ 2*PI
        hypercube.rotate('zw', Math.PI * motion.y / hypercube.bound);
      }
      else if (e.shiftKey)
      {
        // Interpretation of this rotation varies between left- and right- brained users
        hypercube.rotate('xw', Math.PI * motion.x / hypercube.bound);
        hypercube.rotate('yw', Math.PI * motion.y / hypercube.bound);
      }
      else
      {
        hypercube.rotate('xz', Math.PI * motion.x / hypercube.bound);
        hypercube.rotate('yz', Math.PI * motion.y / hypercube.bound);
      }

      hypercube.startCoords = currCoords;

      hypercube.draw();
    };

    document.onmouseup = function()
    {
      hypercube.clicked = false;
    };

    /* End mouse handling routines. */

    /* Begin initial actions. */

    for (var i in checkboxes)
    {
      checkboxes[i].onclick = function() { hypercube.draw(); };
    }

    hypercube.rotate('zw', Math.PI/4);
    hypercube.rotate('yw', Math.PI/4);
    hypercube.rotate('xz', Math.PI/4);
    hypercube.rotate('yz', Math.PI/4);
    hypercube.rotate('zw', Math.PI/4);

    for (var name in HYPERCUBE_DEFAULT_OPTIONS)
    {
      options[name].checked = HYPERCUBE_DEFAULT_OPTIONS[name]
    }

    hypercube.draw();

    /* End initial actions. */
  }

  /* Begin helper routines. */

  function mouseCoords(e) // http://answers.oreilly.com/topic/1929-how-to-use-the-canvas-and-draw-elements-in-html5/
  {
    var x;
    var y;
    if (e.pageX || e.pageY)
    { 
      x = e.pageX;
      y = e.pageY;
    }
    else
    { 
      x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
      y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
    } 
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    return { 'x': x, 'y': y };
  }

  function maxIndex(comp, arr)
  {
    var arrLen = arr.length;
    if (arrLen == 0)
      return -Infinity;
    else if (arrLen == 1)
      return 0;
    var maxIndex = 0;
    var max = comp(arr[0]);
    for (var i = 1; i < arrLen; i++)
    {
      var curr = comp(arr[i]);
      if (curr > max)
      {
        max = curr;
        maxInd = i;
      }
    }
    return maxInd;
  }

  /* End helper routines. */

  init();
})();
