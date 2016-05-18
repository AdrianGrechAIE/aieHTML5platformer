<<<<<<< HEAD
var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();

var tileset = document.createElement("img");
tileset.src = "tileset.png";

function getDeltaTime()
{
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();

	var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
	
	if(deltaTime > 1)
		deltaTime = 1;
		
	return deltaTime;
}



var fps = 1;
var fpsCount = 1;
var fpsTime = 1;

var ENEMY_MAXDX = METER * 5
var ENEMY_ACCEL = ENEMY_MAXDX *2;

var enemies = [];

var LAYER_COUNT = 3;
var LAYER_BACKGOUND = 0;
var LAYER_PLATFORMS = 1;
var LAYER_LADDERS = 2;

var LAYER_OBJECT_ENEMIES = 3;
var LAYER_OBJECT_TRIGGERS = 4;

var MAP = { tw:60 , th: 15};
var TILE = 35;
var TILESET_TILE = TILE * 2;
var TILESET_PADDING = 2;
var TILESET_SPACING = 2;
var TILESET_COUNT_X = 14;
var TILESET_COUNT_Y = 14;

var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;

var METER = TILE;						// abitrary choice for 1m
var GRAVITY = METER * 9.8 * 6;			// very exaggerated gravity (6x)
var MAXDX = METER * 10;					// max horizontal speed (10 tiles per second)
var MAXDY = METER * 15;					// max vertical speed (15 tiles per second)
var ACCEL = MAXDX * 2;					// horizontal acceleration - take 1/2 second to reach maxdx
var FRICTION = MAXDX * 6;				// horizontal friction - take 1/6 second to stop from maxdx
var JUMP = METER * 1500; 				// (a large) instantaneous jump impulse

var player = new Player();
var keyboard = new Keyboard();

var music = new Howl(
{
	urls: ["background.ogg"],
	loop: true,
	buffer: true,
	volume: 0.15
});
music.play();

var sfx = new Howl(
{
	urls: ["fireEffect.ogg"],
	buffer: true,
	volume: 0.5,
});

var cells = []; 
function initialize() {
	for (var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) { // initialize the collision map
		cells[layerIdx] = [];
		var idx = 0;
		for (var y = 0; y < level1.layers[layerIdx].height; y++) {
			cells[layerIdx][y] = [];
			for (var x = 0; x < level1.layers[layerIdx].width; x++) {
				if (level1.layers[layerIdx].data[idx] != 0) {
					cells[layerIdx][y][x] = 1;
					cells[layerIdx][y - 1][x] = 1;
					cells[layerIdx][y - 1][x + 1] = 1;
					cells[layerIdx][y][x + 1] = 1;
				}
				else if (cells[layerIdx][y][x] != 1) {
					cells[layerIdx][y][x] = 0;
				}
				idx++;
				//idx = 0;
				/*for (var y = 0; y < level1.layers[LAYER_OBJECT_ENEMIES].height; y++) {
					for (var x = 0; x < level1.layers[LAYER_OBJECT_ENEMIES].width; x++) {
						if (level1.layers[LAYER_OBJECT_ENEMIES].data[idx] != 0) {
							var px = tileToPixel(x);
							var py = tileToPixel(y);
							var e = new Enemy(px, py);
							enemies.push(e);
						}
						idx++;
					}
				}*/
			}
		}
	}
}

function cellAtPixelCoord(layer, x, y) {
    if (x < 0 || x > SCREEN_WIDTH) 
        return 1;
    if (y > SCREEN_HEIGHT)
        return 0;
    return cellAtTileCoord(layer, p2t(x), p2t(y)); 
};

function cellAtTileCoord(layer, tx, ty) {
    if (tx < 0 || tx >= MAP.tw)
        return 1;
    if (ty >= MAP.th)
        return 0;
    return cells[layer][ty][tx];
};

function tileToPixel(tile) {
    return tile * TILE;
};

function pixelToTile(pixel) {
    return Math.floor(pixel / TILE);
};

function bound(value, min, max) {
    if (value < min)
        return min;
    if (value > max)
        return max;
    return value;
}

var worldOffsetX = 0;
function drawMap() {
    var startX = -1;
    var maxTiles = Math.floor(SCREEN_WIDTH / TILE) + 2;
    var tileX = pixelToTile(player.position.x);
    var offsetX = TILE + Math.floor(player.position.x % TILE);

    startX = tileX - Math.floor(maxTiles / 2);

    if (startX < -1) {
        startX = 0;
        offsetX = 0;
    }
    if (startX > MAP.tw - maxTiles) {
        startX = MAP.tw - maxTiles + 1;
        offsetX = TILE;
    }
    worldOffsetX = startX * TILE + offsetX;

    for (var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) {
		for (var y = 0; y < level1.layers[layerIdx].height; y++) {
			var idx = y * level1.layers[layerIdx].width + startX;
			for (var x = startX; x < startX + maxTiles; x++) {
				if (level1.layers[layerIdx].data[idx] != 0) {
					var tileIndex = level1.layers[layerIdx].data[idx] - 1;
					var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) *
						(TILESET_TILE + TILESET_SPACING);
					var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y)) *
						(TILESET_TILE + TILESET_SPACING);
					context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE,
					(x - startX) * TILE - offsetX, (y - 1) * TILE, TILESET_TILE, TILESET_TILE);
				}
				idx++;
			}
		}
	}
}

function run() 
{
    context.fillStyle = "#ccc";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    var deltaTime = getDeltaTime();
    
    drawMap();
    
    player.update(deltaTime);
    player.draw();

    for (var i = 0; i < enemies.length; i++) {
        enemies[i].update(deltaTime);
    }
    for (var i = 0; i < enemies.length; i++) {
        enemy.draw();
    }
}

initialize();


(function() {
  var onEachFrame;
  if (window.requestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.requestAnimationFrame(_cb); }
      _cb();
    };
  } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.mozRequestAnimationFrame(_cb); }
      _cb();
    };
  } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1000 / 60);
    }
  }
  
  window.onEachFrame = onEachFrame;
})();

=======
var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();

var tileset = document.createElement("img");
tileset.src = "tileset.png";

function getDeltaTime()
{
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();

	var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
	
	if(deltaTime > 1)
		deltaTime = 1;
		
	return deltaTime;
}



var fps = 1;
var fpsCount = 1;
var fpsTime = 1;

var ENEMY_MAXDX = METER * 5
var ENEMY_ACCEL = ENEMY_MAXDX *2;

var enemies = [];

var LAYER_COUNT = 3;
var LAYER_BACKGOUND = 0;
var LAYER_PLATFORMS = 1;
var LAYER_LADDERS = 2;

var LAYER_OBJECT_ENEMIES = 3;
var LAYER_OBJECT_TRIGGERS = 4;

var MAP = { tw:60 , th: 15};
var TILE = 35;
var TILESET_TILE = TILE * 2;
var TILESET_PADDING = 2;
var TILESET_SPACING = 2;
var TILESET_COUNT_X = 14;
var TILESET_COUNT_Y = 14;

var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;

var METER = TILE;						// abitrary choice for 1m
var GRAVITY = METER * 9.8 * 6;			// very exaggerated gravity (6x)
var MAXDX = METER * 10;					// max horizontal speed (10 tiles per second)
var MAXDY = METER * 15;					// max vertical speed (15 tiles per second)
var ACCEL = MAXDX * 2;					// horizontal acceleration - take 1/2 second to reach maxdx
var FRICTION = MAXDX * 6;				// horizontal friction - take 1/6 second to stop from maxdx
var JUMP = METER * 1500; 				// (a large) instantaneous jump impulse

var player = new Player();
var keyboard = new Keyboard();

var music = new Howl(
{
	urls: ["background.ogg"],
	loop: true,
	buffer: true,
	volume: 0.15
});
music.play();

var sfx = new Howl(
{
	urls: ["fireEffect.ogg"],
	buffer: true,
	volume: 0.5,
});

var cells = []; 
function initialize() {
	for (var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) { // initialize the collision map
		cells[layerIdx] = [];
		var idx = 0;
		for (var y = 0; y < level1.layers[layerIdx].height; y++) {
			cells[layerIdx][y] = [];
			for (var x = 0; x < level1.layers[layerIdx].width; x++) {
				if (level1.layers[layerIdx].data[idx] != 0) {
					cells[layerIdx][y][x] = 1;
					cells[layerIdx][y - 1][x] = 1;
					cells[layerIdx][y - 1][x + 1] = 1;
					cells[layerIdx][y][x + 1] = 1;
				}
				else if (cells[layerIdx][y][x] != 1) {
					cells[layerIdx][y][x] = 0;
				}
				idx = 0;
				for (var y = 0; y < level1.layers[LAYER_OBJECT_ENEMIES].height; y++) {
					for (var x = 0; x < level1.layers[LAYER_OBJECT_ENEMIES].width; x++) {
						if (level1.layers[LAYER_OBJECT_ENEMIES].data[idx] != 0) {
							var px = tileToPixel(x);
							var py = tileToPixel(y);
							var e = new Enemy(px, py);
							enemies.push(e);
						}
						idx++;
					}
				}
			}
		}
	}
}

function cellAtPixelCoord(layer, x, y) {
    if (x < 0 || x > SCREEN_WIDTH) 
        return 1;
    if (y > SCREEN_HEIGHT)
        return 0;
    return cellAtTileCoord(layer, p2t(x), p2t(y)); 
};

function cellAtTileCoord(layer, tx, ty) {
    if (tx < 0 || tx >= MAP.tw)
        return 1;
    if (ty >= MAP.th)
        return 0;
    return cells[layer][ty][tx];
};

function tileToPixel(tile) {
    return tile * TILE;
};

function pixelToTile(pixel) {
    return Math.floor(pixel / TILE);
};

function bound(value, min, max) {
    if (value < min)
        return min;
    if (value > max)
        return max;
    return value;
}

var worldOffsetX = 0;
function drawMap() {
    var startX = -1;
    var maxTiles = Math.floor(SCREEN_WIDTH / TILE) + 2;
    var tileX = pixelToTile(player.position.x);
    var offsetX = TILE + Math.floor(player.position.x % TILE);

    startX = tileX - Math.floor(maxTiles / 2);

    if (startX < -1) {
        startX = 0;
        offsetX = 0;
    }
    if (startX > MAP.tw - maxTiles) {
        startX = MAP.tw - maxTiles + 1;
        offsetX = TILE;
    }
    worldOffsetX = startX * TILE + offsetX;

    for (var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) {
		for (var y = 0; y < level1.layers[layerIdx].height; y++) {
			var idx = y * level1.layers[layerIdx].width + startX;
			for (var x = startX; x < startX + maxTiles; x++) {
				if (level1.layers[layerIdx].data[idx] != 0) {
					var tileIndex = level1.layers[layerIdx].data[idx] - 1;
					var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) *
						(TILESET_TILE + TILESET_SPACING);
					var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y)) *
						(TILESET_TILE + TILESET_SPACING);
					context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE,
					(x - startX) * TILE - offsetX, (y - 1) * TILE, TILESET_TILE, TILESET_TILE);
				}
				idx++;
			}
		}
	}
}

function run() 
{
    context.fillStyle = "#ccc";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    var deltaTime = getDeltaTime();
    
    drawMap();
    
    player.update(deltaTime);
    player.draw();

    for (var i = 0; i < enemies.length; i++) {
        enemies[i].update(deltaTime);
    }
    for (var i = 0; i < enemies.length; i++) {
        enemy.draw();
    }
}

initialize();


(function() {
  var onEachFrame;
  if (window.requestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.requestAnimationFrame(_cb); }
      _cb();
    };
  } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.mozRequestAnimationFrame(_cb); }
      _cb();
    };
  } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1000 / 60);
    }
  }
  
  window.onEachFrame = onEachFrame;
})();

>>>>>>> origin/master
window.onEachFrame(run);