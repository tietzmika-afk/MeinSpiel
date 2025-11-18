// sprites.js
// Programmgenerierte Sprites & Texturen (Pixel-art)

const IMAGES = {};
const SPRITES = {};

function makeCanvas(w,h,draw){
    const c = document.createElement('canvas');
    c.width = w; 
    c.height = h;
    const ctx = c.getContext('2d');
    draw(ctx,w,h);
    return c;
}

function drawGrassTile(ctx,w,h){
    ctx.fillStyle = '#7a4f28';
    ctx.fillRect(0,0,w,h);

    ctx.fillStyle = '#6b3f1a';
    for(let i=0;i<8;i++){
        ctx.fillRect(Math.random()*(w-4), Math.random()*(h-6)+6, 2,2);
    }

    ctx.fillStyle = '#2ecc40';
    ctx.fillRect(0,0,w,10);

    ctx.fillStyle = '#28b233';
    for(let x=0;x<w;x+=4){
        ctx.fillRect(x,8,2,2);
    }
}

function drawStoneTile(ctx,w,h){
    ctx.fillStyle = '#7b7b7b';
    ctx.fillRect(0,0,w,h);

    ctx.fillStyle = '#8b8b8b';
    for(let y=2;y<h;y+=6){
        for(let x=1;x<w;x+=7){
            ctx.fillRect(x,y,3,3);
        }
    }
}

function drawFlag(ctx,w,h){
    ctx.clearRect(0,0,w,h);

    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(6,4,4,h-10);

    ctx.fillStyle = '#ff0000';
    ctx.fillRect(10,6,14,10);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12,8,6,6);
}

function drawPlayer(ctx,w,h){
    ctx.clearRect(0,0,w,h);

    ctx.fillStyle = '#ffd1a9';
    ctx.fillRect(6,2,12,8);

    ctx.fillStyle = '#ff3b3b';
    ctx.fillRect(4,10,16,10);

    ctx.fillStyle = '#2b6cff';
    ctx.fillRect(4,20,7,8);
    ctx.fillRect(13,20,7,8);

    ctx.fillStyle = '#000';
    ctx.fillRect(15,6,2,2);
}

function drawTurretFrame(ctx,w,h,theta){
    ctx.clearRect(0,0,w,h);

    ctx.fillStyle = '#403030';
    ctx.beginPath();
    ctx.ellipse(w/2, h-10, 14,8,0,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(w/2-8, h-26, 16,12);

    ctx.fillStyle = '#ffdd55';
    ctx.beginPath();
    ctx.arc(w/2, h-30, 4, 0, Math.PI*2);
    ctx.fill();

    ctx.save();
    ctx.translate(w/2, h-24);
    ctx.rotate(theta);
    ctx.fillStyle = '#222';
    ctx.fillRect(4, -3, 18, 6);
    ctx.restore();

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(w/2-10, h-28, 6,2);
}

async function loadSprites(){
    IMAGES.tileGrass = makeCanvas(32,32,drawGrassTile);
    IMAGES.tileStone = makeCanvas(32,32,drawStoneTile);

    IMAGES.player = makeCanvas(24,32,drawPlayer);
    IMAGES.flag   = makeCanvas(32,48,drawFlag);

    for(let i=0;i<4;i++){
        const theta = (i/4)*Math.PI*2*0.2;
        IMAGES["turret"+i] = makeCanvas(40,40,(ctx,w,h)=>drawTurretFrame(ctx,w,h,theta));
    }

    IMAGES.bullet = makeCanvas(12,6,(ctx,w,h)=>{
        ctx.fillStyle = '#ffdf55';
        ctx.fillRect(0,0,w,h);
        ctx.fillStyle = '#fff';
        ctx.fillRect(2,1,w-4,h-2);
    });

    // === SPRITE MAP ===
    SPRITES.player = { img: IMAGES.player, x:0, y:0, w:24, h:32 };
    SPRITES.flag   = { img: IMAGES.flag,   x:0, y:0, w:32, h:48 };

    for(let i=0;i<4;i++){
        SPRITES["turret"+i] = { img: IMAGES["turret"+i], x:0,y:0, w:40, h:40 };
    }

    console.log("Programmatische Sprites & Tiles erstellt");
}

// ======================================
// DRAW SPRITE – WICHTIG! (FEHLTE BEI DIR)
// ======================================
function drawSprite(name, x, y) {
    const s = SPRITES[name];
    if (!s) return;
    ctx.drawImage(s.img, s.x, s.y, s.w, s.h, x, y, s.w, s.h);
}
