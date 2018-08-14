let nav = (function() {
    var started = false;
    var gameInterval;
    var cubeWidth = 0;
    var width = 0;
    var keys = {
        l: false,
        r: false,
        u: false
    };
    var isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };
    var goTo = "";
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

    let floorImg = new Image();
    floorImg.src = './nav/floor.png';
    let skyImg = new Image();
    skyImg.src = './nav/sky.png';

    var blocksImg = new Array();

    blocksImg[0] = new Image();
    blocksImg[0].src = './nav/about.png';

    blocksImg[1] = new Image();
    blocksImg[1].src = './nav/skills.png';

    blocksImg[2] = new Image();
    blocksImg[2].src = './nav/projects.png';

    blocksImg[3] = new Image();
    blocksImg[3].src = './nav/contact.png';

    blocksImg[4] = new Image();
    blocksImg[4].src = './nav/blog.png';

    function Block (xVal, t) {
        this.xMult = xVal;
        this.x = background.x + background.size.x * xVal - cubeWidth/2;
        this.y = background.y + background.size.y * 0.8 - background.size.y * 0.255 - cubeWidth*2.5;
        this.size = cubeWidth;
        this.type = t
        this.yv = 0.0;
        this.syv = 0.0;
    };
    var player = {
        curImg: new Image(),
        curImgPosition: {
            x:0,
            y:0
        },
        img: new Image(),
        lastSpriteChange: 0,
        sprite: new Image(),
        size: {
            x: 0,
            y: 0
        },
        x: 0,
        y: 0,
        animating: false,
        jumping: false,
        blockY: 0,
        act: function ()
        {
            player.setVelocity();
            player.jump();
            player.move();
            player.animate();
            navCtx.drawImage(player.curImg, player.curImgPosition.x, player.curImgPosition.y, player.img.width, player.img.height,
                player.x, player.y, player.size.x, player.size.y);
        },
        jump: function ()
        {
            if(player.jumping == false && keys.u == true){
                player.jumping = true;
                player.yv = -1;
            }
            if(player.jumping == true)
            {
                player.y += background.size.y * 0.015 * player.yv
                player.yv += 0.03
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
                            goTo = blocks[i].type;
                            warpPipe.readyToWarp = true;
                        }
                        else {
                            //blocks[i].y = player.blockY - blocks[i].size
                        }
                    }
                }
            }
        },
        setVelocity: function()
        {
                player.xv = 0;
                xvel = false
                if (keys.l){player.xv -= 1; xvel = true;}
                if (keys.r){player.xv += 1; xvel = true;}
            //}
        },
        animate: function ()
        {
            if (player.xv == 0)
            {
                player.curImg = player.img;
                player.curImgPosition.x = 0;
                player.curImgPosition.y = 0;
                player.animating = false;
            }
            else if (player.jumping == false){
                var time = new Date().getTime()
                if (player.lastSpriteChange + 75 <= time)
                {
                    if (player.animating == false)
                    {
                        player.animating = true;
                    }
                    else
                    {
                        player.curImgPosition.x = (player.curImgPosition.x+player.img.width)%(6*player.img.width);
                    }
                    player.curImg=player.sprite;
                    player.lastSpriteChange = time;
                }
            }
            else {
                player.curImg=player.sprite;
                player.curImgPosition.x = 6*player.img.width
            }
            if (player.xv == -1)
            {
                player.curImgPosition.y = player.img.height;
            }
            else if (player.xv == 1)
            {
                player.curImgPosition.y = 0;
            }
        },
        move : function()
        {
            let pBlockLoc = player.hitBlock()
            if(player.y >= background.y + background.size.y * 0.8 - cubeWidth*2)
            {
                player.y = background.y + background.size.y * 0.8- cubeWidth*2;
                player.jumping = false;
                if(warpPipe.readyToWarp == true)
                {
                    warpPipe.warping = true;
                }
            }
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
        },
        hitBlock: function()
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

    };
    var canvNav;
    var navCtx;
    canvNav = document.getElementById("mfnav");
    navCtx = canvNav.getContext("2d");
    player.img.src = 'nav/brendan.png';
    player.sprite.src = 'nav/player_sprite.png';
    player.curImg = player.img;
    player.xv = 0
    blocks.push(new Block(0.5, "About"));
    blocks.push(new Block(0.35, "Skills"));
    blocks.push(new Block(0.65, "Projects"));
    blocks.push(new Block(0.2, "Contact"));
    blocks.push(new Block(0.8, "Blog"));
    background.img.src = 'nav/background.jpg';
    background.img.onload = function() {
            resizeCanvas()
            window.addEventListener('resize', resizeCanvas, false);
            document.addEventListener("keydown",keyPush);
            started = true;
            document.addEventListener("keyup",keyUp);
            document.onmousedown = function(e){
                var canvasOffset=$("#mfnav").offset();
                var offsetX=canvasOffset.left;
                var offsetY=canvasOffset.top; // relationship bitmap vs. element for Y
                let mouse = {
                    x : e.pageX - offsetX,
                    y : e.pageY - offsetY
                };
                checkForBlockClick(mouse);
            };
            document.onmouseup = function(e){
                var canvasOffset=$("#mfnav").offset();
                var offsetX=canvasOffset.left;
                var offsetY=canvasOffset.top;
                let mouse = {
                    x : e.pageX - offsetX,
                    y : e.pageY - offsetY
                };
                mouseStopMoving(mouse);
            };
            document.ontouchstart = function(e){
                var canvasOffset=$("#mfnav").offset();
                var offsetX=canvasOffset.left;
                var offsetY=canvasOffset.top; // relationship bitmap vs. element for Y
                let mouse = {
                    x : e.pageX - offsetX,
                    y : e.pageY - offsetY
                };
                checkForBlockClick(mouse);
            };
            document.ontouchend = function(e){
                var canvasOffset=$("#mfnav").offset();
                var offsetX=canvasOffset.left;
                var offsetY=canvasOffset.top;
                let mouse = {
                    x : e.pageX - offsetX,
                    y : e.pageY - offsetY
                };
                mouseStopMoving(mouse);
            };
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
    var warpPipe = {
        x : 0,
        y : 0,
        size: {
            x : 0,
            y : 0
        },
        setUp: false,
        pic : new Image(),
        growing : true,
        jumping : false,
        playerHeightMod: 1,
        warping: false,
        readyToWarp: false,
        moveMod: 1,
        entering: false,
        risingMult: 0
    };
    warpPipe.pic.src = 'nav/warppipe.png';
    function checkForBlockClick(m)
    {
        for(var i = 0; i < blocks.length; i++)
        {
            let b = blocks[i];
            if (m.x>b.x && m.x<b.x+b.size && b.y<m.y && m.y<b.y+b.size)
            {
                goTo = b.type;
                warpPipe.readyToWarp = true;
            }
        }
        if (started == true && warpPipe.readyToWarp == false
        && m.y < background.y + background.size.y && m.y > background.y
        && m.x < background.x + background.size.x * 0.99 && m.x > background.x + background.size.x * 0.01 ){
            if (m.x < player.x)
            {
                keys.l = true;
                keys.r = false;
            }
            else if (m.x > player.size.x + player.x)
            {
                keys.r = true;
                keys.l = false;
            }
            if (m.y < player.y) {
                keys.u = true;
            }
        }
    }
    function mouseStopMoving(m)
    {
        keys.r = false;
        keys.l = false;
        keys.u = false;
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
    function resizeCanvas() {
        // let width = window.innerWidth
        //     || document.documentElement.clientWidth
        //     || document.body.clientWidth;
        width = $("#nav_canvas").width();
        canvNav.width = width;
        canvNav.height = width * 0.20;
        if (width < 600) {
             canvNav.height = width * 0.4;
        }
        if (width < 500) {
             canvNav.height = width * 0.5;
        }
        if (width < 400) {
             canvNav.height = width * 0.6;
        }
        background.x = 0;
        background.y = 0;
        let oldBGsize = {
            x: background.size.x,
            y: background.size.y
        }
        background.size.x = width;
        background.size.y = canvNav.height;
        cubeWidth = background.size.y * 0.15;
        if (player.x != 0)
        {
            let backgroundMultx = (player.x - background.x)/oldBGsize.x
            let backgroundMulty = (player.y - background.y)/oldBGsize.y
            player.x = background.x + background.size.x *backgroundMultx;
            player.y = background.y + background.size.y *backgroundMulty;
        }
        else {
            player.x = background.x + background.size.x * 0.5 - cubeWidth/2;
            player.y = background.y + background.size.y * 0.8 - cubeWidth * 2;
        }
        if (warpPipe.setUp == true)
        {
            warpPipe.size.x = player.size.x * 2;
            warpPipe.size.y = player.size.y * warpPipe.risingMult
            warpPipe.y = background.y + background.size.y * 0.8 - player.size.y * warpPipe.risingMult;
            warpPipe.x = background.x + background.size.x *(warpPipe.x - background.x)/oldBGsize.x;
        }
        player.size.x = cubeWidth
        player.size.y = cubeWidth * 2
        let f = cubeWidth/3;
        navCtx.font = f + "px Comic Sans MS";
        for (var i = 0; i < blocks.length; i++)
        {
            blocks[i].x = background.x + background.size.x * blocks[i].xMult - cubeWidth/2;
            blocks[i].y = background.y + background.size.y * 0.8 - background.size.y * 0.255 - cubeWidth*2.75;
            blocks[i].size = cubeWidth;
        }
        player.blockY = background.y + background.size.y * 0.8 - background.size.y * 0.255 - cubeWidth*1.75;
        //navCtx.drawImage(background.img, 0, 0, background.img.width, background.img.height,
        //    background.x, background.y, background.size.x, background.size.y)
        drawBackground();
        navCtx.drawImage(player.curImg, player.curImgPosition.x, player.curImgPosition.y, player.img.width, player.img.height,
            player.x, player.y, player.size.x, player.size.y);
        navCtx.textAlign = "left";
        navCtx.fillStyle="#ffffff";
        drawTutorial()
    }
    function drawTutorial() {
        navCtx.fillStyle="#ffffff";
        navCtx.textAlign = "left";
        if (isMobile.any())
        {
            navCtx.fillText("Hit a block to go to that section!", background.x + background.size.x * 0.05, background.x + background.size.y * 0.5);
            navCtx.fillText("Touch the screen to move around and jump", background.x + background.size.x * 0.05, background.x + background.size.y * 0.575);
            navCtx.fillText("or just tap on a block!", background.x + background.size.x * 0.05, background.x + background.size.y * 0.65);

        }
        else {
            navCtx.fillText("Hit a block to go to that section!", background.x + background.size.x * 0.05, background.x + background.size.y * 0.5);
            navCtx.fillText("Use the arrow keys to move", background.x + background.size.x * 0.05, background.x + background.size.y * 0.575);
            navCtx.fillText("and the space bar to jump", background.x + background.size.x * 0.05, background.x + background.size.y * 0.65);
            navCtx.fillText("or just click a block with the mouse!", background.x + background.size.x * 0.05, background.x + background.size.y * 0.725);
        }
    }
    function run()
    {
        if ($(document).scrollTop()<background.y+background.size.y)
        {
            drawBackground();
            drawTutorial();
            // navCtx.fillStyle="#f4a941";
            // navCtx.fillRect(background.x, background.y+background.size.y*0.8, background.size.x, background.size.y*0.2);
            blockJump()
            drawBlocks()
            if (warpPipe.warping == false)
            {
                player.act()
            }
            else {
                moveWarpPipe();
            }
        }
        else if (warpPipe.warping == true)
        {
            moveWarpPipe();
        }
    }

    function drawBackground()
    {
        let skyMult = (width * 0.2) / background.size.y;
        if (skyMult < 0.95) {
            navCtx.fillStyle="#42b3f4";
            navCtx.fillRect(background.x, background.y, background.size.x, background.size.y*0.15);
            navCtx.fillStyle="#1f96db";
            navCtx.fillRect(background.x, background.y + background.size.y*0.15, background.size.x, background.size.y*0.65);
            navCtx.drawImage(skyImg, 0, 0, skyImg.width, skyImg.height,
            background.x, background.y + background.size.y * 0.1, background.size.x, background.size.y*0.8 * skyMult);

        }
        else {
            navCtx.drawImage(skyImg, 0, 0, skyImg.width, skyImg.height,
            background.x, background.y, background.size.x, background.size.y*0.8);
        }
        navCtx.drawImage(floorImg, 0, 0, floorImg.width, floorImg.height,
        background.x, background.y+background.size.y*0.8, background.size.x, background.size.y*0.2);

    }
    function drawBlocks()
    {
        navCtx.textAlign = "center";
        for (var i = 0; i < blocks.length; i++)
        {
            let b = blocks[i];
            navCtx.fillStyle="#f4a941";
            navCtx.drawImage(blocksImg[i], 0, 0, blocksImg[i].width, blocksImg[i].height,
                b.x,b.y,b.size,b.size);
            //navCtx.fillRect(b.x,b.y,b.size,b.size);
            navCtx.fillStyle = "white";
            navCtx.fillText(b.type, b.x+b.size/2, player.blockY + b.size * 0.4)

        }
    }
    function keyPush(evt) {
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
    function setUpWarpPipe ()
    {
        warpPipe.size.x = player.size.x * 2;
        warpPipe.y = player.y + player.size.y;
        warpPipe.x = player.x + player.size.x + background.size.x * 0.025 * warpPipe.moveMod;
        warpPipe.moveMod = 1;
        warpPipe.playerHeightMod = 1;
        warpPipe.risingMult = 0;
        if (player.x > background.x + background.size.x/2)
        {
            warpPipe.moveMod = -1;
        }
        warpPipe.x = player.x + background.size.x * 0.025 * warpPipe.moveMod;
        if (warpPipe.moveMod == 1)
        {
            warpPipe.x += player.size.x;
            player.curImgPosition.y = 0;
        }
        else {
            warpPipe.x -= warpPipe.size.x;
            player.curImgPosition.y = player.img.height;
        }
        player.curImg = player.sprite;
        player.curImgPosition.x = 7*player.img.width;
    }

    function moveWarpPipe ()
    {
        //window.removeEventListener('resize', resizeCanvas, false);
        if (warpPipe.setUp == false)
        {
            setUpWarpPipe()
            warpPipe.size.y = 0;
            warpPipe.setUp = true;
        }
        if (warpPipe.growing == true && warpPipe.size.y + player.size.y * 0.02 < player.size.y/2)
        {
            warpPipe.risingMult += 0.02
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
            player.curImgPosition.x = 6*player.img.width;
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
            var $container = $('html,body');
            var to = "#" + goTo.toLowerCase();
            var $scrollTo = $(to);
            //$("html,body").animate({ scrollTop: 500 }, "slow");
            // console.log($scrollTo.offset().top -
            //     $container.offset().top + $container.scrollTop());
            $container.animate({scrollTop: $scrollTo.offset().top -
               $container.offset().top + $container.scrollTop(), scrollLeft: 0},700);
            //window.addEventListener('resize', resizeCanvas, false);
        }
        navCtx.drawImage(warpPipe.pic, 0, 0, warpPipe.pic.width, warpPipe.pic.height * warpPipe.risingMult,
            warpPipe.x, warpPipe.y, warpPipe.size.x, warpPipe.size.y);
        if (warpPipe.playerHeightMod != 1)
        {
            navCtx.drawImage(player.img, 0, 0, player.img.width, player.img.height * warpPipe.playerHeightMod,
                player.x, player.y + player.size.y*(1-warpPipe.playerHeightMod), player.size.x, player.size.y* warpPipe.playerHeightMod);
        }
        else
        {
            // console.log(player.curImgPosition.x + " " + player.curImgPosition.y)
            navCtx.drawImage(player.curImg, player.curImgPosition.x, player.curImgPosition.y, player.img.width, player.img.height,
                player.x, player.y, player.size.x, player.size.y);
        }
    }
})()
window.onload = nav;
