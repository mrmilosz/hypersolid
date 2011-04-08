const DEFAULT_WIDTH = 480;
const DEFAULT_HEIGHT = 480;
const DEFAULT_SCALE = Math.sqrt(4);

hypercube = {};

hypercube.vertices =
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

hypercube.edges = 
[
  [  0,  1 ], [  0,  2 ], [  0,  4 ], [  0,  8 ],
              [  1,  3 ], [  1,  5 ], [  1,  9 ],
              [  2,  3 ], [  2,  6 ], [  2, 10 ],
                          [  3,  7 ], [  3, 11 ],
              [  4,  5 ], [  4,  6 ], [  4, 12 ],
                          [  5,  7 ], [  5, 13 ],
                          [  6,  7 ], [  6, 14 ],
                                      [  7, 15 ],
              [  8,  9 ], [  8, 10 ], [  8, 12 ],
                          [  9, 11 ], [  9, 13 ],
                          [ 10, 11 ], [ 10, 14 ],
                                      [ 11, 15 ],
                          [ 12, 13 ], [ 12, 14 ],
                                      [ 13, 15 ],
                                      [ 14, 15 ]
];

hypercube.rotate = function(axis, theta)
{
  var s = Math.sin(theta);
  var c = Math.cos(theta);
  for (i in this.vertices)
  {
    this.rotateVertex[axis](i, s, c);
  }
}

hypercube.rotateVertex =
{
  xy: function(i, s, c)
  {
    tmp = c * hypercube.vertices[i].x + s * hypercube.vertices[i].y;
    hypercube.vertices[i].y = -s * hypercube.vertices[i].x + c * hypercube.vertices[i].y;
    hypercube.vertices[i].x = tmp;
  },
  xz: function(i, s, c)
  {
    tmp = c * hypercube.vertices[i].x + s * hypercube.vertices[i].z;
    hypercube.vertices[i].z = -s * hypercube.vertices[i].x + c * hypercube.vertices[i].z;
    hypercube.vertices[i].x = tmp;
  },
  xw: function(i, s, c)
  {
    tmp = c * hypercube.vertices[i].x + s * hypercube.vertices[i].w;
    hypercube.vertices[i].w = -s * hypercube.vertices[i].x + c * hypercube.vertices[i].w;
    hypercube.vertices[i].x = tmp;
  },
  yz: function(i, s, c)
  {
    tmp = c * hypercube.vertices[i].y + s * hypercube.vertices[i].z;
    hypercube.vertices[i].z = -s * hypercube.vertices[i].y + c * hypercube.vertices[i].z;
    hypercube.vertices[i].y = tmp;
  },
  yw: function(i, s, c)
  {
    tmp = c * hypercube.vertices[i].y - s * hypercube.vertices[i].w;
    hypercube.vertices[i].w = s * hypercube.vertices[i].y + c * hypercube.vertices[i].w;
    hypercube.vertices[i].y = tmp;
  },
  zw: function(i, s, c)
  {
    tmp = c * hypercube.vertices[i].z - s * hypercube.vertices[i].w;
    hypercube.vertices[i].w = s * hypercube.vertices[i].z + c * hypercube.vertices[i].w;
    hypercube.vertices[i].z = tmp;
  }
};

function init()
{
  /* Begin retrieved variables. */

  window.canvas = document.getElementById('canvas');
  canvas.context = canvas.getContext('2d');

  /* End retrieved variables. */

  /* Begin declared variables. */

  canvas.width = DEFAULT_WIDTH;
  canvas.height = DEFAULT_HEIGHT;
  canvas.scale = DEFAULT_SCALE;

  /* End declared variables. */

  /* Begin painting routines. */

  canvas.draw = function()
  {
    var context = this.context;
    context.clearRect(0, 0, canvas.width, canvas.height);
    var bound = Math.min(canvas.width, canvas.height) / 2;
    for (i in hypercube.edges)
    {
      var x1 = Math.floor(canvas.width / 2 + bound * (hypercube.vertices[hypercube.edges[i][0]].x / this.scale)) + 0.5;
      var x2 = Math.floor(canvas.width / 2 + bound * (hypercube.vertices[hypercube.edges[i][1]].x / this.scale)) + 0.5;
      var y1 = Math.floor(canvas.height / 2 - bound * (hypercube.vertices[hypercube.edges[i][0]].y / this.scale)) + 0.5;
      var y2 = Math.floor(canvas.height / 2 - bound * (hypercube.vertices[hypercube.edges[i][1]].y / this.scale)) + 0.5;
      var z1 = 0.60 + .40 * hypercube.vertices[hypercube.edges[i][0]].z / this.scale;
      var z2 = 0.60 + .40 * hypercube.vertices[hypercube.edges[i][1]].z / this.scale;
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.closePath();
      var gradient = context.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, 'rgba(0, 172, 255, ' + z1 + ')');
      gradient.addColorStop(1, 'rgba(0, 172, 255, ' + z2 + ')');
      context.lineWidth = 3;
      context.strokeStyle = gradient;
      context.stroke();
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

    if (e.shiftKey && e.altKey)
    {
      hypercube.rotate('xy', Math.PI * motion.x / bound);
      hypercube.rotate('zw', Math.PI * motion.y / bound);
    }
    else if (e.shiftKey)
    {
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

  hypercube.rotate('zw', Math.PI/4); // weird bug with gradients doesn't allow lines to be stacked...
  hypercube.rotate('yw', Math.PI/4); // weird bug with gradients doesn't allow lines to be stacked...
  hypercube.rotate('xz', Math.PI/4); // weird bug with gradients doesn't allow lines to be stacked...


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
