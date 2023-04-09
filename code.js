createCanvas("id", 320, 200);
setActiveCanvas("id");
setPosition("id", 0, 128);


var tog = {
    w: 0,
    a: 0,
    s: 0,
    d: 0,
    up: 0,
    down: 0,
    sl: 0,
    sr: 0
};
var p = {
    xp: 0,
    yp: 0,
    zp: 0,
    a: 0,
    h: 5,
    turn: 0.17,
    speed: 5,
    lastsect: 1,
    cl: {
        x1: 0,
        y1: 0,
        x2: -1,
        y2: 0
    },
    cr: {
        x1: 1,
        y1: 0,
        x2: 0,
        y2: 0
    }

};
var maxsects = Infinity;
var fov = 90;
var PI = 3.1415;
var w, h;
var scale = 1;
var framescale = 150;
var fps = 10;
var map = [];
var wire = false;
var queue = [];

var ocArr = [];


function resetoc() {
    var tmp = [];
    for (var x = 0; x < Math.ceil(w / scale) + 1; x++) {
        appendItem(tmp, [0, 200, false, p.lastsect]);
    }
    return tmp;
}

function init() {
    var v = (fov * (PI / 180)) / 2;
    p.cr.x1 = Math.sin(v);
    p.cr.y1 = Math.cos(v);
    p.cl.x2 = Math.sin(-v);
    p.cl.y2 = Math.cos(-v);
    w = 320;
    h = 200;
    map = loadmap();
    ocArr = resetoc();
    console.log(map);
    console.log(ocArr);
    clearCanvas();
    color(10, 10, 50);
    rect(0, 0, w, h);

    for (var sect = 0; sect < map.length; sect++) {

        if (insect(p, map[sect])) {
            p.lastsect = map[sect].id;
            break;
        }
    }

    timedLoop(1000 / fps, function() {
        ocArr = resetoc();
        movePlayer();
        draw();
        //clearCanvas()

    });

}
function findsect(){
	 if (insect(p, map[p.lastsect])) {
		 return p.lastsect;
	 }
	 var current = p.lastsect
	 for (var w = 0; w < map[current].walls.length; w++) {
		if(map[current].walls[w].p>=0){
	 if (insect(p, map[map[current].walls[w].p])) {
		 return map[current].walls[w].p;
	 }
			
			
		}
    }
	  for (var sect = 0; sect < map.length; sect++) {
        //draw3d(sect);
        if (insect(p, map[sect])) {
			return sect;
        }
    }
	return p.lastsect;
}
function draw() {

    var rangel = clone(p.cl);
    var ranger = clone(p.cr);
    if (wire) {
        clearCanvas();
        color(10, 10, 10);
        rect(0, 0, w, h);
    }
    queue = [];
    var hit = false;
	var nsect = findsect();
            p.lastsect = nsect;
            p.zp = map[nsect].floor + p.h;
            appendItem(queue, [nsect, rangel, ranger]);

  


    for (var i = 0; i < queue.length; i++) {

        //  p.cl = queue[i][1];
        //  p.cr = queue[i][2];

        draw3d(queue[i][0]);
        //--


    }
    p.cl = rangel;
    p.cr = ranger;
    //console.log(ocArr)




}

function draw3d(sect) {
    for (var i = 0; i < map[sect].walls.length; i++) {
        var cwall = (map[sect].walls[i]);
        var zfloor = p.zp - map[sect].floor;
        var zceil = p.zp - map[sect].ceil;

        var twall = rotatewall(p.a, {
            x1: cwall.x1 - p.xp,
            x2: cwall.x2 - p.xp,
            y1: cwall.y1 - p.yp,
            y2: cwall.y2 - p.yp
        });

        var temp = twall;

        color(128, 0, 0);
        var clipped = false;
        twall = clipwall(twall, p.cr);
        if (twall == null) {
            color(0, 128, 0);
            twall = temp;
            clipped = true;
        }
        twall = clipwall(twall, p.cl);
        if (twall == null) {
            color(0, 128, 0);
            twall = temp;
            clipped = true;
        }

        if (!clipped) {

            // line(2*twall.x1+(w/2),2*twall.y1+(h/2),2*twall.x2+(w/2),2*twall.y2+(h/2));

            // line(2*p.cr.x1+(w/2),2*p.cr.y1+(h/2),2*p.cr.x2+(w/2),2*p.cr.y2+(h/2));
            //         line(200*p.cl.x1+(w/2),200*p.cl.y1+(h/2),200*p.cl.x2+(w/2),200*p.cl.y2+(h/2));

            var sc = map[sect].bright / 255;


            var floor = {
                x1: (framescale * twall.x1 / twall.y1) + (w / 2),
                y1: (framescale * zfloor / twall.y1) + (h / 2),
                x2: (framescale * twall.x2 / twall.y2) + (w / 2),
                y2: (framescale * zfloor / twall.y2) + (h / 2)
            };
            var ceil = {
                x1: (framescale * twall.x1 / twall.y1) + (w / 2),
                y1: (framescale * zceil / twall.y1) + (h / 2),
                x2: (framescale * twall.x2 / twall.y2) + (w / 2),
                y2: (framescale * zceil / twall.y2) + (h / 2)
            };
            if (map[sect].walls[i].p >= 0) {
                var owall = {
                    f: floor,
                    c: ceil
                };
                var next = map[map[sect].walls[i].p];


                if (next.floor > map[sect].floor) {
                    floor = {
                        x1: (framescale * twall.x1 / twall.y1) + (w / 2),
                        y1: (framescale * (p.zp - next.floor) / twall.y1) + (h / 2),
                        x2: (framescale * twall.x2 / twall.y2) + (w / 2),
                        y2: (framescale * (p.zp - next.floor) / twall.y2) + (h / 2)
                    };

                    solid(floor, owall.f, map[sect].walls[i].col1, map[sect].floorcol, null, sc, false, map[sect].walls[i], sect);
                } else {
                    solid(floor, owall.f, map[sect].walls[i].col1, map[sect].floorcol, null, sc, false, map[sect].walls[i], sect);
                }
                if (next.ceil < map[sect].ceil) {
                    ceil = {
                        x1: (framescale * twall.x1 / twall.y1) + (w / 2),
                        y1: (framescale * (p.zp - next.ceil) / twall.y1) + (h / 2),
                        x2: (framescale * twall.x2 / twall.y2) + (w / 2),
                        y2: (framescale * (p.zp - next.ceil) / twall.y2) + (h / 2)
                    };

                    solid(owall.c, ceil, map[sect].walls[i].col2, null, map[sect].ceilcol, sc, false, map[sect].walls[i], sect);
                } else {
                    solid(owall.c, ceil, map[sect].walls[i].col2, null, map[sect].ceilcol, sc, false, map[sect].walls[i], sect);
                }
                solid(ceil, floor, [50, 0, 50], null, null, sc, true, map[sect].walls[i], sect);



                //console.log(owall);
                if (owall.f.x1 > owall.f.x2 && queue.length < maxsects) {
                    //console.log(twall.x1)
                    appendItem(queue, [map[sect].walls[i].p, {
                        x2: 0,
                        y2: 0,
                        x1: twall.x1 + 5,
                        y1: twall.y1
                    }, {
                        x2: twall.x2 - 5,
                        y2: twall.y2,
                        x1: 0,
                        y1: 0
                    }]);


                }

            } else {
                color(128, 0, 0);

                solid(ceil, floor, map[sect].walls[i].col1, map[sect].floorcol, map[sect].ceilcol, sc, false, null, sect);


            }

        }



    }
}

function clone(wall) {
    return {
        x1: wall.x1,
        y1: wall.y1,
        x2: wall.x2,
        y2: wall.y2
    };
}

function solid(top, bottom, wc, bc, tc, sc, portal, wall, ne) {
    //console.log(ne)
    if (wire) {
        color(0, 0, 0);
        line(top.x1, top.y1, top.x2, top.y2);
        line(bottom.x1, bottom.y1, bottom.x2, bottom.y2);
        line(bottom.x1, bottom.y1, top.x1, top.y1);
        line(top.x2, top.y2, bottom.x2, bottom.y2);

        return;
    }

    var t1 = walltoline(top);
    var t2 = walltoline(bottom);

    for (var i = Math.max(top.x2, 0); i < Math.min(top.x1, 320); i += scale) {
        var y = (i * t1.m) + t1.b;
        var y2 = (i * t2.m) + t2.b;
        if (portal == undefined) {
            portal = false;
        }

        if (ocArr[Math.floor(i / scale)][3] == ne) {
            if (portal) {
                if (!ocArr[Math.floor(i / scale)][2]) {
                    color(wc[0] * sc, wc[1] * sc, wc[2] * sc);
                    //console.log(Math.floor(i/scale))
                    ocArr = replace(ocArr, Math.floor(i / scale), [Math.max(ocArr[Math.floor(i / scale)][0], togrid(y)), Math.min(ocArr[Math.floor(i / scale)][1], togrid(y2)), false, wall.p]);
                }
                //console.log(Math.floor(i/scale))
                // rect(togrid(i),togrid(y),scale,togrid(y2)-togrid(y));


            } else {


                if (!ocArr[Math.floor(i / scale)][2]) {
                    var max = [0, 0]; //ocArr[Math.floor(i / scale)];

                    if (tc != null) {

                        color(tc[0] * sc, tc[1] * sc, tc[2] * sc);
                        max[0] = tt;
                        var tt = Math.max(0, ocArr[Math.floor(i / scale)][0]);
                        var bt = Math.min(togrid(y), ocArr[Math.floor(i / scale)][1]);
                        max[0] = tt;
                        var h = bt - tt;
						if(h>0){
                        rect(togrid(i), tt, scale, h);
						}
                    }
                    if (bc != null) {
                        color(bc[0] * sc, bc[1] * sc, bc[2] * sc);
                        var tt = Math.min(togrid(y2), ocArr[Math.floor(i / scale)][1]);
                        var bt = ocArr[Math.floor(i / scale)][1];
                        max[1] = bt;
                        var h = bt - tt;

                        rect(togrid(i), tt, scale, h);


                    }
                    color(wc[0] * sc, wc[1] * sc, wc[2] * sc);
                    var tt = Math.max(togrid(y), ocArr[Math.floor(i / scale)][0]);
                    var bt = Math.min(togrid(y2), ocArr[Math.floor(i / scale)][1]);

                    var h = bt - tt;
                    if (h >= 0) {

                        max[0] = Math.min(max[0], bt);
                        max[1] = Math.max(max[1], tt);
                        rect(togrid(i), tt, scale, h);
                    }
                    if (tc != null && bc != null) {
                        ocArr[Math.floor(i / scale)][2] = true;
                        ocArr[Math.floor(i / scale)][3] = null;

                    }

                }
            }
        }
    }

    color(wc[0] / 1.5, wc[1] / 1.5, wc[2] / 1.5);


}

function togrid(n) {
    return Math.floor(n / scale) * scale;
}

function clipwall(wall, clip) {
    var p1 = infront(wall.x1, wall.y1, clip);
    var p2 = infront(wall.x2, wall.y2, clip);
    //console.log(p1,p2)
    if (p1 && p2) {
        return wall;
    }
    var wln = walltoline(wall);
    var cln = walltoline(clip);
    var nx = (wln.b - cln.b) / (cln.m - wln.m);
    var ny = (wln.m * nx) + wln.b;

    if (p1 && !p2) {
        return {
            x1: wall.x1,
            y1: wall.y1,
            x2: nx,
            y2: ny
        };
    } else if (!p1 && p2) {
        return {
            x1: nx,
            y1: ny,
            x2: wall.x2,
            y2: wall.y2
        };
    } else {
        return null;
    }

}

function infront(x, y, w) {

    var ax = w.x2 - w.x1;
    var ay = w.y2 - w.y1;
    var bx = x - w.x1;
    var by = y - w.y1;

    if (((ay * bx) - (ax * by)) > 0) {
        return true;
    } else {
        return false;
    }


}

function walltoline(w) {
    ////console.log(w)
    var m = (w.y2 - w.y1) / (w.x2 - w.x1);
    var b = w.y2 - (m * w.x2);
    return {
        m: m,
        b: b
    };
}

function insect(point, sect) {
    for (var i = 0; i < sect.walls.length; i++) {
        var cw = (sect.walls[i]);
        var a1 = cw.x2 - cw.x1;
        var a2 = cw.y2 - cw.y1;
        var b1 = p.xp - cw.x1;
        var b2 = p.yp - cw.y1;
        if (((a2 * b1) - (a1 * b2)) > 0) {
            return false;
        }
    }
    return true;
}

function rotatewall(a, wall) {
    var s1 = Math.sin(a);
    var c1 = Math.cos(a);

    var x1 = (wall.x1 * c1) - (wall.y1 * s1);
    var y1 = (wall.x1 * s1) + (wall.y1 * c1);
    var x2 = (wall.x2 * c1) - (wall.y2 * s1);
    var y2 = (wall.x2 * s1) + (wall.y2 * c1);
    return {
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2
    };
}

function loadmap() {

    p.xp = mapfile[0];
    p.yp = mapfile[1];
    p.a = mapfile[2];
    p.h = mapfile[3];
    p.lastsect = mapfile[4];
    p.speed = mapfile[5];
    var sects = mapfile[6];
    var sectl = mapfile[7];
    var walll = mapfile[8];
	var ccount = mapfile[9];
	var colors = [];
	  for (var j = 10; j < (ccount*3)+10; j+=3) {
		appendItem(colors,[mapfile[j],mapfile[j+1],mapfile[j+2]]);
		  
	  }
	console.log(colors);
	
    var wallstart = ((ccount*3)+10) + (sects * sectl);
    var mp = [];
    for (var i = ((ccount*3)+10); i < ((ccount*3)+10)+(sects * sectl); i += sectl) {

        var start = mapfile[i + 1];
        var end = mapfile[i + 2] - 1;


        var cwall = [];
        for (var j = start; j <= start + end; j++) {
            var tempw = {
                x1: mapfile[wallstart + (j * walll) + 0],
                y1: mapfile[wallstart + (j * walll) + 1],
                x2: mapfile[wallstart + (j * walll) + 2],
                y2: mapfile[wallstart + (j * walll) + 3],
                p: mapfile[wallstart + (j * walll) + 4],
                col1: colors[mapfile[wallstart + (j * walll) + 5]],
                col2: colors[mapfile[wallstart + (j * walll) + 6]],

            };
            appendItem(cwall, tempw);
        }
        var tempsect = {
            id: mapfile[i],
            floor: mapfile[i + 3],
            ceil: mapfile[i + 4],
            walls: cwall,
            floorcol: colors[mapfile[i + 5]],
            ceilcol: colors[mapfile[i + 6]],
            bright: mapfile[i + 7],
        };
        appendItem(mp, tempsect);
    }
console.log(mp)
    return mp;
}




function movePlayer() {
    //move up, down, left, right
    if (tog.a && !tog.m) {
        p.a -= p.turn;
        if (p.a < 0) {
            p.a += 2 * PI;
        }
    }
    if (tog.d) {
        p.a += p.turn;
        if (p.a > 2 * PI) {
            p.a -= 2 * PI;
        }
    }
    var dx = Math.sin(p.a) * p.speed;
    var dy = Math.cos(p.a) * p.speed;

    if (tog.w) {
        p.xp += dx;
        p.yp += dy;
    }
    if (tog.s) {
        p.xp -= dx;
        p.yp -= dy;
    }
    //strafe left, right
    if (tog.sr) {
        p.xp += dy;
        p.yp -= dx;
    }
    if (tog.sl) {
        p.xp -= dy;
        p.yp += dx;
    }
    //move up, down, loop up, look down
    if (tog.down) {
        p.zp -= 1; //p.speed/3;
    }
    if (tog.up) {
        p.zp += 1; //p.speed/3;
    }

    color(128, 10, 10);
    //line(p.xp, p.yp, p.xp + (dx * 3), p.yp + (dy * 3));

}
onEvent("screen1", "keydown", function(event) {
    if (event.key == "w") {
        tog.w = true;
    }
    if (event.key == "a") {
        tog.a = true;
    }
    if (event.key == "s") {
        tog.s = true;
    }
    if (event.key == "d") {
        tog.d = true;
    }
    if (event.key == "Up") {
        tog.up = true;
    }
    if (event.key == "Down") {
        tog.down = true;
    }
    if (event.key == ".") {
        tog.sr = true;
    }
    if (event.key == ",") {
        tog.sl = true;
    }

});
onEvent("screen1", "keyup", function(event) {

    if (event.key == "w") {
        tog.w = false;
    }
    if (event.key == "a") {
        tog.a = false;
    }
    if (event.key == "s") {
        tog.s = false;
    }
    if (event.key == "d") {
        tog.d = false;
    }
    if (event.key == "Up") {
        tog.up = false;
    }
    if (event.key == "Down") {
        tog.down = false;
    }
    if (event.key == ".") {
        tog.sr = false;
    }
    if (event.key == ",") {
        tog.sl = false;
    }
});
console.log(replace([0, 1, 2, 3, 4, 5, 6], 2, 0));

function replace(array, i, v) {

    removeItem(array, i);
    insertItem(array, i, v);

    return array;
}

function color(r, g, b) {

    setStrokeColor(rgb(r, g, b));
    setFillColor(rgb(r, g, b));

}

var mapfile = [

//player:
//x,y,angle,height,speed,startsect
0,0,3.14,1.60,1,1,

//sectors:
34,
//sector arguments:
8,
//wall arguments:
7,
//colors
19,
0,0,0,
250,250,250,
180,180,180,
128,128,128,
100,100,100,
193,143,90,
128,0,0,
0,0,128,
110,110,110,
10,10,120,
138,161,123,
50,50,50,
138,131,133,
30,30,30,
111,115,87,
160,82,45,
19,35,11,
80,80,80,
120,120,120,

0,0,4,0,2.25,4,3,255,
1,4,10,0,2.25,4,3,144,
2,14,4,0,2.25,4,3,144,
3,18,10,0,2.25,4,3,144,
4,28,4,-0.5,3.75,9,3,192,
5,32,8,-1,6.25,9,3,224,
6,40,4,-1,6.25,9,3,224,
7,44,4,-1,6.25,9,3,224,
8,48,4,-0.5,3.75,9,3,192,
9,52,3,0,2.25,4,3,144,
10,55,4,-0.5,3.75,9,3,192,
11,59,8,0,2.25,4,3,144,
12,67,6,-0.5,3.75,4,3,128,
13,73,4,-0.5,3.75,4,3,128,
14,77,14,-0.5,7,4,14,128,
15,91,5,-0.5,7,4,14,128,
16,96,4,1.25,5.75,15,13,255,
17,100,4,-0.5,7,4,14,128,
18,104,9,-0.5,7,4,14,128,
19,113,8,3.25,6,4,14,176,
20,121,4,0.25,7,4,14,144,
21,125,4,0.75,7,4,14,144,
22,129,4,1.25,7,4,14,144,
23,133,4,1.75,7,4,14,144,
24,137,4,2.25,7,4,14,144,
25,141,4,2.75,7,4,14,144,
26,145,9,-0.5,7,4,14,128,
27,154,4,1.25,5.75,15,13,255,
28,158,4,-0.5,7,4,14,128,
29,162,5,-0.5,7,4,14,128,
30,167,10,3.25,8.25,4,14,192,
31,177,4,4.25,7.5,18,18,255,
32,181,4,4.25,7.5,18,18,255,
33,185,4,4.25,7.5,18,18,255,
-1,1,1,1,1,0,0,
1,1,1,2,-1,1,0,
1,2,-1,2,-1,2,0,
-1,2,-1,1,-1,1,0,
-5,-7,-4,-7,-1,5,0,
-4,-7,4,-7,4,0,0,
4,-7,5,-7,-1,5,0,
5,-7,7,-2,3,6,0,
7,-2,3,1,-1,5,0,
3,1,1,1,-1,5,0,
1,1,-1,1,0,0,0,
-1,1,-3,1,-1,5,0,
-3,1,-7,-2,-1,5,0,
-7,-2,-5,-7,2,7,0,
-9,-8,-5,-7,5,0,0,
-5,-7,-7,-2,1,0,0,
-7,-2,-9,-2,-1,5,0,
-9,-2,-9,-8,-1,5,0,
7,-21,11,-21,-1,5,0,
11,-21,11,-16,-1,5,0,
11,-16,11,-8,12,0,0,
11,-8,11,-2,-1,5,0,
11,-2,7,-2,-1,5,0,
7,-2,5,-7,1,0,0,
5,-7,5,-9,-1,5,0,
5,-9,5,-16,8,0,0,
5,-16,5,-17,-1,5,0,
5,-17,7,-21,11,0,0,
-4,-8,4,-8,7,0,0,
4,-8,4,-7,-1,5,0,
4,-7,-4,-7,1,5,8,
-4,-7,-4,-8,-1,5,0,
-9,-16,-5,-17,9,5,5,
-5,-17,-5,-16,-1,5,0,
-5,-16,-5,-8,6,0,0,
-5,-8,-5,-7,-1,5,0,
-5,-7,-9,-8,2,5,5,
-9,-8,-9,-11,-1,5,5,
-9,-11,-9,-13,-1,5,5,
-9,-13,-9,-16,-1,5,5,
-5,-16,-4,-16,-1,5,0,
-4,-16,-4,-8,7,0,0,
-4,-8,-5,-8,-1,5,0,
-5,-8,-5,-16,5,5,0,
-4,-16,4,-16,10,5,5,
4,-16,4,-8,8,5,5,
4,-8,-4,-8,4,5,5,
-4,-8,-4,-16,6,5,5,
4,-16,5,-16,-1,5,5,
5,-16,5,-8,3,5,8,
5,-8,4,-8,-1,5,5,
4,-8,4,-16,7,0,0,
-9,-23,-5,-17,11,0,0,
-5,-17,-9,-16,5,0,0,
-9,-16,-9,-23,-1,5,5,
-4,-17,4,-17,11,5,8,
4,-17,4,-16,-1,5,0,
4,-16,-4,-16,7,0,0,
-4,-16,-4,-17,-1,5,0,
-9,-23,-5,-23,-1,0,0,
-5,-23,3,-23,-1,5,0,
3,-23,7,-21,-1,5,0,
7,-21,5,-17,3,5,0,
5,-17,4,-17,-1,5,0,
4,-17,-4,-17,10,5,0,
-4,-17,-5,-17,-1,5,0,
-5,-17,-9,-23,9,5,0,
11,-16,17,-15,-1,5,0,
17,-15,17,-14,-1,5,0,
17,-14,17,-10,13,10,0,
17,-10,17,-9,-1,5,0,
17,-9,11,-8,-1,5,0,
11,-8,11,-16,3,5,5,
17,-14,18,-14,-1,11,0,
18,-14,18,-10,14,12,0,
18,-10,17,-10,-1,11,0,
17,-10,17,-14,12,0,0,
20,-19,24,-19,-1,12,0,
24,-19,24,-17,15,0,0,
24,-17,24,-15,16,13,13,
24,-15,24,-13,18,0,0,
24,-13,24,-11,20,5,5,
24,-11,24,-9,26,0,0,
24,-9,24,-7,27,13,13,
24,-7,24,-5,29,0,0,
24,-5,20,-5,-1,12,0,
20,-5,18,-9,-1,12,0,
18,-9,18,-10,-1,12,0,
18,-10,18,-14,13,12,12,
18,-14,18,-15,-1,12,12,
18,-15,20,-19,-1,12,12,
24,-19,30,-19,-1,12,0,
30,-19,32,-17,-1,12,0,
32,-17,26,-17,17,0,0,
26,-17,24,-17,16,13,13,
24,-17,24,-19,14,0,0,
24,-17,26,-17,15,0,0,
26,-17,26,-15,17,0,0,
26,-15,24,-15,18,0,0,
24,-15,24,-17,14,0,0,
26,-17,32,-17,15,0,0,
32,-17,30,-13,19,12,12,
30,-13,26,-15,18,0,0,
26,-15,26,-17,16,13,13,
24,-15,26,-15,16,13,13,
26,-15,30,-13,17,0,0,
30,-13,29,-13,25,16,0,
29,-13,28,-13,24,16,0,
28,-13,27,-13,23,16,0,
27,-13,26,-13,22,16,0,
26,-13,25,-13,21,16,0,
25,-13,24,-13,20,16,0,
24,-13,24,-15,14,0,0,
32,-17,33,-17,-1,4,0,
33,-17,36,-15,-1,12,0,
36,-15,36,-9,30,0,0,
36,-9,33,-7,-1,12,0,
33,-7,32,-7,-1,4,0,
32,-7,30,-11,28,12,12,
30,-11,30,-13,25,12,12,
30,-13,32,-17,17,12,12,
24,-13,25,-13,18,0,0,
25,-13,25,-11,21,5,5,
25,-11,24,-11,26,5,5,
24,-11,24,-13,14,5,5,
25,-13,26,-13,18,0,0,
26,-13,26,-11,22,5,5,
26,-11,25,-11,26,5,5,
25,-11,25,-13,20,5,5,
26,-13,27,-13,18,0,0,
27,-13,27,-11,23,5,5,
27,-11,26,-11,26,5,5,
26,-11,26,-13,21,5,5,
27,-13,28,-13,18,0,0,
28,-13,28,-11,24,5,5,
28,-11,27,-11,26,5,5,
27,-11,27,-13,22,5,5,
28,-13,29,-13,18,0,0,
29,-13,29,-11,25,5,5,
29,-11,28,-11,26,5,5,
28,-11,28,-13,23,5,5,
29,-13,30,-13,18,0,0,
30,-13,30,-11,19,5,12,
30,-11,29,-11,26,5,5,
29,-11,29,-13,24,5,5,
24,-11,25,-11,20,16,0,
25,-11,26,-11,21,16,0,
26,-11,27,-11,22,16,0,
27,-11,28,-11,23,16,0,
28,-11,29,-11,24,16,0,
29,-11,30,-11,25,16,0,
30,-11,26,-9,28,0,0,
26,-9,24,-9,27,13,13,
24,-9,24,-11,14,0,0,
24,-9,26,-9,26,0,0,
26,-9,26,-7,28,0,0,
26,-7,24,-7,29,0,0,
24,-7,24,-9,14,0,0,
26,-9,30,-11,26,0,0,
30,-11,32,-7,19,12,12,
32,-7,26,-7,29,0,0,
26,-7,26,-9,27,13,13,
24,-7,26,-7,27,13,13,
26,-7,32,-7,28,0,0,
32,-7,30,-5,-1,12,0,
30,-5,24,-5,-1,12,0,
24,-5,24,-7,14,0,0,
36,-15,37,-15,-1,13,13,
37,-15,38,-15,-1,5,5,
38,-15,42,-15,31,5,5,
42,-15,44,-14,-1,5,5,
44,-14,44,-10,32,5,5,
44,-10,42,-9,-1,5,5,
42,-9,38,-9,33,5,5,
38,-9,37,-9,-1,5,5,
37,-9,36,-9,-1,13,13,
36,-9,36,-15,19,12,12,
38,-16,42,-16,-34,0,0,
42,-16,42,-15,-1,17,17,
42,-15,38,-15,30,0,0,
38,-15,38,-16,-1,17,17,
44,-14,45,-14,-1,17,17,
45,-15,45,-10,-36,0,0,
45,-10,44,-10,-1,17,17,
44,-10,44,-14,30,17,17,
38,-9,42,-9,-30,0,0,
42,-9,42,-8,-1,17,17,
42,-8,38,-8,-38,0,0,
38,-8,38,-9,-1,17,17,



];
//init();
var begin = false;
onEvent("screen1", "click", function( ) {
  if(!begin){
  	init();
    begin = true;
  }
});
