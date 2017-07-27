var started = false;
var gameInterval;
var cubeWidth = 0;
var keys = {
    l: false,
    r: false,
    u: false
}

var blocks = [];
var background = {
    img: new Image(),
    size: {
        x: 0,
        y: 0
    },
    x: 0,
    y: 0
};
function Block (xVal, t) {
    this.xMult = xVal;
    this.x = background.x + background.size.x * xVal - cubeWidth/2;
    this.y = background.y + background.size.y * 0.8 - background.size.y * 0.255 - cubeWidth*2.5;
    this.size = cubeWidth;
    this.type = t
    this.yv = 0.0;
    this.syv = 0.0;
}
var player = {
    img: new Image(),
    size: {
        x: 0,
        y: 0
    },
    x: 0,
    y: 0,
    jumping: false,
    blockY: 0,
    act: function ()
    {
        playerSetVelocity()
        playerMove()
        playerJump()
        ctx.drawImage(player.img, 0, 0, player.img.width, player.img.height,
            player.x, player.y, player.size.x, player.size.y);
    }
};
window.onload=function() {
    canv=document.getElementById("mf");
    ctx = canv.getContext("2d");
    player.img.src = 'nav/brendan.png'
    player.xv = 0
    blocks.push(new Block(0.5, "About"));
    blocks.push(new Block(0.35, "Projects"));
    blocks.push(new Block(0.65, "Experience"));
    blocks.push(new Block(0.2, "Skills"));
    blocks.push(new Block(0.8, "Contact"));
    background.img.src = 'nav/background.jpg';
    background.img.onload = function(){
            resizeCanvas()
            window.addEventListener('resize', resizeCanvas, false);
            document.addEventListener("keydown",keyPush);
            started = true;
            document.addEventListener("keyup",keyUp);
            window.addEventListener("keydown", function(e) {
                if (started == true)
                {
                    if([32, 37, 38, 39].indexOf(e.keyCode) > -1) {
                        e.preventDefault();
                    }
                }
            }, false);
            appInterval = setInterval(run,10);
    }
}
function playerSetVelocity()
{
    player.xv = 0;
    xvel = false
    yvel = false
    if (keys.l){player.xv -= 1; xvel = true;}
    if (keys.r){player.xv += 1; xvel = true;}
}
function playerHitBlock()
{
    let newXleft = player.x + background.size.y * 0.0075 * player.xv;
    let newXright = newXleft + player.size.x;
    if (player.y < player.blockY)
    {
        for (var i = 0; i < blocks.length; i++)
        {
            let b = blocks[i];
            if(newXleft <= b.x+b.size && player.x >= b.x+b.size)
            {
                return b.x+b.size;
            }
            else if (newXright >= b.x && player.x + player.size.x <= b.x)
            {
                return b.x-player.size.x;
            }
        }
    }
    return -1;
}
function playerMove()
{
    let pBlockLoc = playerHitBlock()
    if (pBlockLoc != -1)
    {
        player.x = pBlockLoc;
    }
    else if (player.x + background.size.y * 0.0075 * player.xv + player.size.x < background.x + background.size.x &&
        player.x + background.size.y * 0.0075 * player.xv > background.x)
    {
        player.x += background.size.y * 0.0075 * player.xv;
    }
    else if (player.x + background.size.y * 0.0075 * player.xv + player.size.x < background.x + background.size.x){
        player.x = background.x
    }
    else {
        player.x = background.x + background.size.x - player.size.x
    }
}
function blockJump ()
{
    for(var i = 0; i < blocks.length; i++)
    {
        if (blocks[i].yv != 0 || blocks[i].y < player.blockY - blocks[i].size)
        {
            if (Math.round(-100*blocks[i].syv) > Math.round(100*blocks[i].yv))
            {
                blocks[i].y = blocks[i].y + background.size.y * 0.02 * blocks[i].yv;
                blocks[i].yv += 0.03;
            }
            else {
                blocks[i].yv = 0;
                blocks[i].syv = 0;
                blocks[i].y = player.blockY-blocks[i].size;
            }
        }
        else {
            blocks[i].y = player.blockY-blocks[i].size;
            blocks[i].yv = 0;
            blocks[i].syv = 0;
        }
    }
}
function playerJump ()
{
    if(player.jumping == false && keys.u == true){
        player.jumping = true;
        player.yv = -1;
    }
    if(player.jumping == true)
    {
        player.y += background.size.y * 0.015 * player.yv
        player.yv += 0.03
        if(player.y >= background.y + background.size.y * 0.8 - cubeWidth*2)
        {
            player.y = background.y + background.size.y * 0.8- cubeWidth*2;
            player.jumping = false;
            if(warpPipe.readyToWarp == true)
            {
                warpPipe.warping = true;
            }

        }
        if (player.y < player.blockY)
        {
            for (var i = 0; i < blocks.length; i++)
            {
                let px = player.x + player.size.x/2;
                let bx = blocks[i].x + blocks[i].size/2;
                if(Math.abs(px-bx) < player.size.x/2 + blocks[i].size/2 -1 && player.y < blocks[i].y + blocks[i].size && blocks[i].syv == 0)
                {
                    //blocks[i].y = player.y - blocks[i].size
                    blocks[i].yv = player.yv - 0.08;
                    blocks[i].syv = player.yv - 0.08;
                    warpPipe.readyToWarp = true;
                }
                else {
                    //blocks[i].y = player.blockY - blocks[i].size
                }
            }
        }
    }
}
function resizeCanvas() {
    let width = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;//$("#nav_canvas").width();
    canv.width = width;
    canv.height = width * 0.25;
    background.x = width * 0.05;
    background.y = 0;
    background.size.x = width * 0.9;
    background.size.y = background.size.x * 0.25;
    cubeWidth = background.size.y * 0.15;
    player.x = background.x + background.size.x * 0.5 - cubeWidth/2;
    player.y = background.y + background.size.y * 0.8 - cubeWidth * 2;
    player.size.x = cubeWidth
    player.size.y = cubeWidth * 2
    let f = cubeWidth/4;
    ctx.font = f + "px Comic Sans MS";
    for (var i = 0; i < blocks.length; i++)
    {
        blocks[i].x = background.x + background.size.x * blocks[i].xMult - cubeWidth/2;
        blocks[i].y = background.y + background.size.y * 0.8 - background.size.y * 0.255 - cubeWidth*2.75;
        blocks[i].size = cubeWidth;
    }
    player.blockY = background.y + background.size.y * 0.8 - background.size.y * 0.255 - cubeWidth*1.75;
    //ctx.drawImage(background.img, 0, 0, background.img.width, background.img.height,
    //    background.x, background.y, background.size.x, background.size.y);
    ctx.fillStyle="#42c5f4";
    ctx.fillRect(background.x, background.y, background.size.x, background.size.y);
    ctx.fillStyle="#f4a941";
    ctx.fillRect(background.x, background.y+background.size.y*0.8, background.size.x, background.size.y*0.2);
    drawBlocks()
    ctx.drawImage(player.img, 0, 0, player.img.width, player.img.height,
        player.x, player.y, player.size.x, player.size.y);
}
function run()
{
    ctx.fillStyle="#42c5f4";
    ctx.fillRect(background.x, background.y, background.size.x, background.size.y);
    ctx.fillStyle="#f4a941";
    ctx.fillRect(background.x, background.y+background.size.y*0.8, background.size.x, background.size.y*0.2);
    blockJump()
    drawBlocks()
    if (warpPipe.warping == false)
    {
        console.log(1);
        player.act()
    }
    else {
        moveWarpPipe();
    }
}
function drawBlocks()
{
    ctx.textAlign = "center";
    for (var i = 0; i < blocks.length; i++)
    {
        let b = blocks[i];
        ctx.fillStyle="#f4a941";
        ctx.fillRect(b.x,b.y,b.size,b.size);
        ctx.fillStyle = "white";
        ctx.fillText(b.type, b.x+b.size/2, player.blockY + b.size * 0.4)

    }
}
function keyPush(evt) {
    player.xv = 0
    if (started == true)
    {
        switch(evt.keyCode) {
            case 37:
                keys.l = true;
                break;
            case 38:
                keys.u = true;
                break;
            case 32:
                keys.u = true;
                break;
            case 39:
                keys.r = true;
                break;
            case 87:
                keys.u = true;
                break;
            case 68:
                keys.r = true;
                break;
            case 65:
                keys.l = true;
                break;
        }
    }
    else {
        if (evt.keyCode == 32)
        {
            startGame()
        }
    }

}
function keyUp(evt) {
    switch(evt.keyCode) {
        case 37:
            keys.l = false;
            break;
        case 38:
            keys.u = false;
            break;
        case 32:
            keys.u = false;
            break;
        case 39:
            keys.r = false;
            break;
        case 87:
            keys.u = false;
            break;
        case 68:
            keys.r = false;
            break;
        case 65:
            keys.l = false;
            break;
    }
}

var warpPipe = {
    x : 0,
    y : 0,
    size: {
        x : 0,
        y : 0
    },
    setUp: false,
    growing : true,
    jumping : false,
    playerHeightMod: 1,
    warping: false,
    readyToWarp: false,
    moveMod: 1,
    entering: false
};
function setUpWarpPipe ()
{
    warpPipe.size.x = player.size.x * 2;
    warpPipe.y = player.y + player.size.y;
    warpPipe.size.y = 0;
    warpPipe.x = player.x + player.size.x + background.size.x * 0.025 * warpPipe.moveMod;
    warpPipe.moveMod = 1;
    warpPipe.playerHeightMod = 1;
    if (player.x > background.x + background.size.x/2)
    {
        warpPipe.moveMod = -1;
    }
    warpPipe.x = player.x + background.size.x * 0.025 * warpPipe.moveMod;
    if (warpPipe.moveMod == 1)
    {
        warpPipe.x += player.size.x;
    }
    else {
        warpPipe.x -= warpPipe.size.x;
    }
}

function moveWarpPipe ()
{
    if (warpPipe.setUp == false)
    {
        setUpWarpPipe()
        warpPipe.setUp = true;
    }
    if (warpPipe.growing == true && warpPipe.size.y + player.size.y * 0.02 < player.size.y/2)
    {
        warpPipe.size.y = warpPipe.size.y + player.size.y * 0.02;
        warpPipe.y -= player.size.y * 0.02;

    }
    else if (warpPipe.growing == true && warpPipe.size.y != player.size.y/2)
    {
        warpPipe.size.y = player.size.y/2;
        warpPipe.y = player.y + player.size.y*2/4;
        warpPipe.growing = false;
        warpPipe.jumping = true;
        player.yv = -0.9;
    }
    else if(warpPipe.jumping == true)
    {
        player.y += background.size.y * 0.015 * player.yv
        player.yv += 0.03
        player.x += background.size.y * 0.007 * warpPipe.moveMod
        if(player.yv >= 0 && player.y >= warpPipe.y-player.size.y)
        {
            player.y = warpPipe.y-player.size.y;
            player.x = warpPipe.x+warpPipe.size.x/2-player.size.x/2
            warpPipe.jumping = false;
            warpPipe.entering = true;
        }
    }
    else if (warpPipe.entering == true)
    {
        if (warpPipe.playerHeightMod > 0)
        {
            warpPipe.playerHeightMod -= 0.02
        }
        else {
            warpPipe.entering = false;
        }
    }
    else {
        warpPipe.warping = false;
        warpPipe.readyToWarp = false;
        warpPipe.setUp = false;
        warpPipe.growing = true;
        warpPipe.jumping = false;
        warpPipe.entering = false;
        player.x = background.x + background.size.x * 0.5 - cubeWidth/2;
        player.y = background.y + background.size.y * 0.8 - cubeWidth * 2;
    }
    ctx.fillStyle="#333333";
    ctx.fillRect(warpPipe.x, warpPipe.y, warpPipe.size.x, warpPipe.size.y);
    if (warpPipe.playerHeightMod != 1)
    {
        ctx.drawImage(player.img, 0, 0, player.img.width, player.img.height * warpPipe.playerHeightMod,
            player.x, player.y + player.size.y*(1-warpPipe.playerHeightMod), player.size.x, player.size.y* warpPipe.playerHeightMod);
    }
    else
    {
        ctx.drawImage(player.img, 0, 0, player.img.width, player.img.height,
            player.x, player.y, player.size.x, player.size.y);
    }
}
