"use strict";

// =====================================================
// CONSTANTS
// =====================================================
const TILE = 32;
const GRAVITY = 450;
const MOVE_SPEED = 160;
const JUMP_SPEED = 500;


// =====================================================
// GLOBAL VARS
// =====================================================
let canvas, ctx;

let levelIndex = 0;

let tiles = [];
let width = 0;
let height = 0;

let turrets = [];
let bullets = [];
let flag = null;
let coins = [];
let score = 0;

// CAMERA
const camera = { x: 0, y: 0, w: 900, h: 500 };

// PLAYER
const player = {
    x: 0, y: 0,
    w: 24, h: 30,
    vx: 0, vy: 0,
    onGround: false,
    lives: 3
};

// INPUT
const keys = { left:false, right:false, jump:false };


// =====================================================
// UTILS
// =====================================================
function clamp(v, min, max){
    return v < min ? min : (v > max ? max : v);
}


// =====================================================
// INIT
// =====================================================
window.onload = () => {
    canvas = document.getElementById("game");
    ctx = canvas.getContext("2d");

    document.getElementById("startBtn").onclick = () => {
        document.getElementById("startScreen").style.display = "none";
        startGame();
    };

    loadSprites().then(() => {
        console.log("Sprites geladen.");
    });
};


// =====================================================
// START GAME
// =====================================================
function startGame(){
    score = 0;
    loadLevel(levelIndex);
    last = performance.now();
    requestAnimationFrame(loop);
}


// =====================================================
// INPUT
// =====================================================
window.addEventListener("keydown", e=>{
    if(e.key === "ArrowLeft") keys.left = true;
    if(e.key === "ArrowRight") keys.right = true;
    if(e.key === "ArrowUp") keys.jump = true;
});
window.addEventListener("keyup", e=>{
    if(e.key === "ArrowLeft") keys.left = false;
    if(e.key === "ArrowRight") keys.right = false;
    if(e.key === "ArrowUp") keys.jump = false;
});


// =====================================================
// LOAD LEVEL (MIT SICHEREM FIX!!!!)
// =====================================================
function loadLevel(i){
    const L = LEVELS[i];
    width = L.w;
    height = L.h;

    tiles = [];
    turrets = [];
    bullets = [];
    coins = [];
    flag = null;

    for(let r=0; r<height; r++){
        const row = L.map[r] || "";
        tiles[r] = [];

        for(let c=0; c<width; c++){
            const ch = row[c] || "0";

            tiles[r][c] = (ch === "1" ? 1 : 0);

            // ----------------------------
            // SAFEST TURRET FIX EVER
            // ----------------------------
            if(ch === "t"){
                turrets.push({
                    x: c*TILE + TILE/2,
                    y: r*TILE + TILE - 10,
                    timer: 0,
                    alive: true
                });

                // FALLS DARUNTER NICHT EXISTIERT
                if (r + 1 < height) {
                    if (!tiles[r+1]) tiles[r+1] = Array(width).fill(0);
                    tiles[r+1][c] = 1;
                }
            }

            if(ch === "f"){
                flag = { x:c*TILE + TILE/2, y:r*TILE + TILE - 16 };
            }

            if(ch === "c"){
                coins.push({
                    x: c*TILE + TILE/2,
                    y: r*TILE + TILE/2,
                    taken: false
                });
            }
        }
    }

    player.x = L.spawn.x*TILE;
    player.y = L.spawn.y*TILE;
    player.vx = 0;
    player.vy = 0;
    player.onGround = false;
}


// =====================================================
// PLAYER UPDATE
// =====================================================
function updatePlayer(dt){

    const ACCEL = 900;
    const FRICTION = 1200;
    const MAX_SPEED = 180;

    if(keys.left){
        player.vx -= ACCEL * dt;
    } 
    else if(keys.right){
        player.vx += ACCEL * dt;
    }
    else {
        if(player.vx > 0){
            player.vx = Math.max(0, player.vx - FRICTION*dt);
        } else if(player.vx < 0){
            player.vx = Math.min(0, player.vx + FRICTION*dt);
        }
    }

    player.vx = clamp(player.vx, -MAX_SPEED, MAX_SPEED);

    if(keys.jump && player.onGround){
        player.vy = -300;
        player.onGround = false;
    }

    player.vy += GRAVITY * dt;

    player.x += player.vx * dt;
    collideX();

    player.y += player.vy * dt;
    collideY();

    if(flag && rect(player,{x:flag.x-16,y:flag.y-32,w:32,h:48})){
        levelIndex = (levelIndex+1) % LEVELS.length;
        alert("Level geschafft!");
        loadLevel(levelIndex);
        return;
    }

    for(const c of coins){
        if(c.taken) continue;
        if(rect(player,{x:c.x-12,y:c.y-12,w:24,h:24})){
            c.taken = true;
            score += 1;
        }
    }
}


// =====================================================
// COLLISION
// =====================================================
function tileAt(x,y){
    let c = Math.floor(x/TILE);
    let r = Math.floor(y/TILE);
    if(r < 0 || c < 0 || r >= height || c >= width) return 1;
    return tiles[r][c];
}

function collideX(){
    if(player.vx > 0){
        if(tileAt(player.x+player.w, player.y) || tileAt(player.x+player.w, player.y+player.h-1)){
            player.x = Math.floor((player.x+player.w)/TILE)*TILE - player.w -1;
        }
    } else if(player.vx < 0){
        if(tileAt(player.x, player.y) || tileAt(player.x, player.y+player.h-1)){
            player.x = Math.floor(player.x/TILE)*TILE + TILE;
        }
    }
}

function collideY(){
    if(player.vy > 0){
        if(tileAt(player.x, player.y+player.h) || tileAt(player.x+player.w-1, player.y+player.h)){
            player.y = Math.floor((player.y+player.h)/TILE)*TILE - player.h -1;
            player.vy = 0;
            player.onGround = true;
        }
    } else if(player.vy < 0){
        if(tileAt(player.x, player.y) || tileAt(player.x+player.w-1, player.y)){
            player.y = Math.floor(player.y/TILE)*TILE + TILE;
            player.vy = 0;
        }
    }
}


// =====================================================
// TURRETS
// =====================================================
function updateTurrets(dt){
    for(const t of turrets){
        if(!t.alive) continue;

        t.timer += dt;
        if(t.timer >= 1.4){
            t.timer = 0;

            bullets.push({
                x: t.x,
                y: t.y - 10,
                vx: (player.x < t.x ? -150 : 150),
                vy: 0
            });
        }
    }
}


// =====================================================
// BULLETS
// =====================================================
function updateBullets(dt){
    for(let i=bullets.length-1; i>=0; i--){
        const b = bullets[i];
        b.x += b.vx * dt;

        if(b.x < camera.x - 200 || b.x > camera.x + camera.w + 200){
            bullets.splice(i,1);
            continue;
        }

        if(rect(player, {x:b.x-6, y:b.y-6, w:12, h:12})){
            bullets.splice(i,1);
            player.lives--;

            if(player.lives <= 0){
                alert("Game Over!");
                player.lives = 3;
                score = 0;
                loadLevel(levelIndex);
                return;
            }

            player.vx = -Math.sign(b.vx)*200;
            player.vy = -250;
        }
    }
}


// =====================================================
// TURRET STOMP
// =====================================================
function checkTurretStomp(){
    for(const t of turrets){
        if(!t.alive) continue;

        let hit = rect(player, {
            x:t.x-14, y:t.y-20, w:28, h:40
        });

        if(hit && player.vy > 0){
            t.alive = false;
            player.vy = -300;
        }
    }
}


// =====================================================
// DRAW SPRITES
// =====================================================
function drawSprite(name, x, y){
    const img = name.startsWith("turret")
        ? IMAGES["turret0"]
        : IMAGES[name];
    if(!img) return;
    ctx.drawImage(img, x, y);
}


// =====================================================
// DRAW
// =====================================================
function draw(){
    ctx.clearRect(0,0,canvas.width, canvas.height);

    // ground (stone tiles)
    for(let r=0; r<height; r++){
        for(let c=0; c<width; c++){
            if(tiles[r][c] === 1){
                ctx.drawImage(IMAGES.tileGrass, c*TILE - camera.x, r*TILE - camera.y);
            }
        }
    }

    // coins
    for(const c of coins){
        if(c.taken) continue;
        ctx.fillStyle = "gold";
        ctx.beginPath();
        ctx.arc(c.x - camera.x, c.y - camera.y, 10, 0, Math.PI*2);
        ctx.fill();
    }

    // turrets
    for(const t of turrets){
        if(!t.alive) continue;
        drawSprite("turret0", t.x - camera.x - 16, t.y - camera.y - 32);
    }

    // bullets
    ctx.fillStyle = "yellow";
    for(const b of bullets){
        ctx.fillRect(b.x - camera.x - 4, b.y - camera.y - 4, 8, 8);
    }

    // flag
    if(flag){
        drawSprite("flag", flag.x - camera.x - 16, flag.y - camera.y - 32);
    }

    // player
    drawSprite("player", player.x - camera.x, player.y - camera.y);

    // HUD
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Leben: " + player.lives, 10, 20);
    ctx.fillText("Score: " + score, 10, 45);
}


// =====================================================
// LOOP
// =====================================================
let last = 0;

function loop(ts){
    let dt = (ts - last) / 1000;
    last = ts;

    updatePlayer(dt);
    updateTurrets(dt);
    updateBullets(dt);
    checkTurretStomp();

    camera.x = clamp(player.x - camera.w/2, 0, width*TILE - camera.w);

    draw();
    requestAnimationFrame(loop);
}


// =====================================================
// RECT COLLISION
// =====================================================
function rect(a,b){
    return !( a.x+a.w < b.x ||
              a.x > b.x+b.w ||
              a.y+a.h < b.y ||
              a.y > b.y+b.h );
}
