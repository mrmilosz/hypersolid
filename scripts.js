const DEFAULT_WIDTH = 480;
const DEFAULT_HEIGHT = 480;
const DEFAULT_MAX_NORM = 2; // sqrt(4): euclidean distance from origin to hypercube corner

hypercube = {};

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


];

hypercube.rotate = function(axis, theta) // sin and cos precomputed for efficiency
{
  var s = Math.sin(theta);
  var c = Math.cos(theta);
  for (i in this.vertices)
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

  window.canvas = document.getElementById('canvas');
  window.options = document.getElementById('options');
  canvas.context = canvas.getContext('2d');

  /* End retrieved variables. */

  /* Begin declared variables. */

  canvas.width = DEFAULT_WIDTH;
  canvas.height = DEFAULT_HEIGHT;
  canvas.maxNorm = DEFAULT_MAX_NORM; // This value can be spoofed to affect scaling

  /* End declared variables. */

  /* Begin painting routines. */

  canvas.draw = function()
  {
    var context = this.context;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 4;
    context.lineJoin = 'round';
    var bound = Math.min(canvas.width, canvas.height) / 2;
    var adjusted = [];
    for (i in hypercube.vertices)
    {
      if (options.perspective.checked)
      {
        var zratio = hypercube.vertices[i].z / this.maxNorm;
        adjusted[i] =
        {
          x: Math.floor(canvas.width / 2 + (0.90 + zratio * 0.30) * bound * (hypercube.vertices[i].x / this.maxNorm)) + 0.5,
          y: Math.floor(canvas.height / 2 - (0.90 + zratio * 0.30) * bound * (hypercube.vertices[i].y / this.maxNorm)) + 0.5,
          z: 0.60 + 0.40 * zratio,
          w: 191 + Math.floor(64 * hypercube.vertices[i].w / this.maxNorm)
        };
      }
      else
      {
        adjusted[i] =
        {
          x: Math.floor(canvas.width / 2 + bound * (hypercube.vertices[i].x / this.maxNorm)) + 0.5,
          y: Math.floor(canvas.height / 2 - bound * (hypercube.vertices[i].y / this.maxNorm)) + 0.5,
          z: 0.60 + 0.40 * hypercube.vertices[i].z / this.maxNorm,
          w: 191 + Math.floor(64 * hypercube.vertices[i].w / this.maxNorm)
        };
      }
    }
    if (options.edges.checked)
    {
      for (i in hypercube.edges)
      {
        var x = [adjusted[hypercube.edges[i][0]].x, adjusted[hypercube.edges[i][1]].x];
        var y = [adjusted[hypercube.edges[i][0]].y, adjusted[hypercube.edges[i][1]].y];
        var z = [adjusted[hypercube.edges[i][0]].z, adjusted[hypercube.edges[i][1]].z];
        var w = [adjusted[hypercube.edges[i][0]].w, adjusted[hypercube.edges[i][1]].w];
        context.beginPath();
        context.moveTo(x[0], y[0]);
        context.lineTo(x[1], y[1]);
        context.closePath();
        var gradient = context.createLinearGradient(x[0], y[0], x[1], y[1]); // Distance fade effect
        gradient.addColorStop(0, 'rgba(0, 191, ' + w[0] + ', ' + z[0] + ')');
        gradient.addColorStop(1, 'rgba(0, 191, ' + w[1] + ', ' + z[1] + ')');
        context.strokeStyle = gradient;
        context.stroke();
      }
    }
    if (options.faces.checked)
    {
      for (i in hypercube.faces)
      {
        var x =
        [
          adjusted[hypercube.faces[i][0]].x,
          adjusted[hypercube.faces[i][1]].x,
          adjusted[hypercube.faces[i][2]].x,
          adjusted[hypercube.faces[i][3]].x
        ];
        var y =
        [
          adjusted[hypercube.faces[i][0]].y,
          adjusted[hypercube.faces[i][1]].y,
          adjusted[hypercube.faces[i][2]].y,
          adjusted[hypercube.faces[i][3]].y
        ];
        var z =
        [
          adjusted[hypercube.faces[i][0]].z,
          adjusted[hypercube.faces[i][1]].z,
          adjusted[hypercube.faces[i][2]].z,
          adjusted[hypercube.faces[i][3]].z
        ];
        context.moveTo(x[0], y[0]);
        context.lineTo(x[1], y[1]);
        context.lineTo(x[2], y[2]);
        context.lineTo(x[3], y[3]);
        context.lineTo(x[0], y[0]);
        context.closePath();
/*        var closest = { 'z': -Infinity };
        var indexOfClosest;
        for (j in hypercube.faces[i])
        {
          if (hypercube.faces[i][j].z > closest.z)
          {
            closest = hypercube.faces[i][j];
            indexOfClosest = j;
          }
        }
        var furthest = hypercube.faces[i][(indexOfClosest + 2) % 4];
        var gradient = context.createLinearGradient(mx1, my1, mx2, my2); // Distance fade effect
        gradient.addColorStop(0, 'rgba(191, 191, 191, ' + z[0] + ')');
        gradient.addColorStop(1, 'rgba(191, 191, 191, ' + z[1] + ')');
        context.strokeStyle = gradient;
*/        context.fillStyle = 'rgba(191, 191, 191, 0.01)';
        context.fill();
      }
    }
    if (options.indices.checked)
    {
      context.font = 'italic 10px sans-serif';
      context.textBaseline = 'top';
      for (i in adjusted)
      {
        context.fillText(i.toString(), adjusted[i].x, adjusted[i].y);
      }
    }
  };

  /* End painting routines. */

  /* Begin mouse handling routines. */

  canvas.clicked = false;

  canvas.onmousedown = function(e)
  { 
    this.startCoords = mouseCoords(e);
    this.startCoords.x -= Math.floor(this.width / 2);
    this.startCoords.y = Math.floor(this.height / 2) - this.startCoords.y;
    this.clicked = true;
  };

  document.onmousemove = function(e)
  {
    if (!canvas.clicked)
    {
      return true;
    }
    var bound = Math.min(canvas.width, canvas.height) / 2;

    var currCoords = mouseCoords(e);
    currCoords.x -= Math.floor(canvas.width / 2);
    currCoords.y = Math.floor(canvas.height / 2) - currCoords.y;
    var motion = { 'x': currCoords.x - canvas.startCoords.x, 'y': currCoords.y - canvas.startCoords.y };

    if (e.shiftKey && (e.altKey || e.ctrlKey))
    {
      hypercube.rotate('xy', Math.PI * motion.x / bound); // Full canvas drag ~ 2*PI
      hypercube.rotate('zw', Math.PI * motion.y / bound);
    }
    else if (e.shiftKey)
    {
      // Interpretation of this rotation varies between left- and right- brained users
      hypercube.rotate('xw', Math.PI * motion.x / bound);
      hypercube.rotate('yw', Math.PI * motion.y / bound);
    }
    else
    {
      hypercube.rotate('xz', Math.PI * motion.x / bound);
      hypercube.rotate('yz', Math.PI * motion.y / bound);
    }

    canvas.startCoords = currCoords;

    canvas.draw();
  };

  document.onmouseup = function()
  {
    canvas.clicked = false;
  };

  /* End mouse handling routines. */

  /* Begin initial actions. */

  var checkboxes = options.getElementsByTagName('input');
  for (i in checkboxes)
  {
    checkboxes[i].onclick = function() { canvas.draw(); };
  }

  hypercube.rotate('zw', Math.PI/4);
  hypercube.rotate('yw', Math.PI/4);
  hypercube.rotate('xz', Math.PI/4);
  hypercube.rotate('yz', Math.PI/4);
  hypercube.rotate('zw', Math.PI/4);

  options.edges.checked = true;

  canvas.draw();

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

/* End helper routines. */
