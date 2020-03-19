var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

const STONE_SIZE = 40;
const STAGE_SIZE = 8;
const PLAYER_COLOR = 1;
const COM_COLOR = 2;
var COLOR = 0.0;

window.onload = function(){var opinion =document.getElementById("bottom").value = ""};


class Stone{
    constructor(x,y,side){
        this.x = x;
        this.y = y;
        this.side = side;
    }
    draw(){
        if(this.side == 0) return;
        ctx.beginPath();
        ctx.arc(this.x,this.y,STONE_SIZE,0,Math.PI*2);
        var gradient = ctx.createLinearGradient(0,0,800,800);
        if(this.side == 1){
            gradient.addColorStop((COLOR+0)%1,'rgb(255,0,0)')
            gradient.addColorStop((COLOR+1/6)%1,'rgb(255,255,0)')
            gradient.addColorStop((COLOR+2/6)%1,'rgb(0,255,0)')
            gradient.addColorStop((COLOR+3/6)%1,'rgb(0,255,255)')
            gradient.addColorStop((COLOR+4/6)%1,'rgb(0,0,255)')
            gradient.addColorStop((COLOR+5/6)%1,'rgb(0,255,255)')
        }else{
            gradient.addColorStop((COLOR+0)%1,'rgb(0,255,255)')
            gradient.addColorStop((COLOR+1/6)%1,'rgb(0,0,255)')
            gradient.addColorStop((COLOR+2/6)%1,'rgb(255,0,255)')
            gradient.addColorStop((COLOR+3/6)%1,'rgb(255,0,0)')
            gradient.addColorStop((COLOR+4/6)%1,'rgb(255,255,0)')
            gradient.addColorStop((COLOR+5/6)%1,'rgb(255,0,0)')
        }
        ctx.fillStyle = gradient
        ctx.fill();
    }
}



class Board{
    constructor(){
        this.turn = 1;
        this.stones = []
        // 全部に石置く
        for(var i=0; i<STAGE_SIZE;i++){
            this.stones[i] = [];
            for(var j=0;j<STAGE_SIZE;j++){
                this.stones[i][j] = new Stone(100*i+50,100*j+50,0);
            }
        }
        // 初期位置に色付け
        for(var i=3; i<=4;i++){
            for(var j=3;j<=4;j++){
                this.stones[i][j].side = (i+j+1)%2+1;
            }
        }

    }

    getboard(){
        var tmp = []
        for(var i=0; i<STAGE_SIZE; i++){
            tmp[i] = []
            for(var j=0; j<STAGE_SIZE; j++){
                tmp[i][j] = this.stones[i][j].side;
            }
        }
        return tmp;
    }

    // 次の人のターンに変わるよ
    nextturn(){
        this.turn = this.turn%2+1;
        if(!canput(this.turn,this.getboard())){
            this.turn = this.turn%2+1;
            if(!canput(this.turn,this.getboard())){
                this.gameend();
                this.turn = 0;
                return;
            }
        }
        document.getElementById("top").innerHTML = ["GAME OVER","Your turn!","Com's turn!"][this.turn];
    }

    // ガメオベラ

    gameend(){
        var player=0;
        var com=0;
        for(var i=0; i<STAGE_SIZE;i++)for(var j=0;j<STAGE_SIZE;j++){
            if(this.stones[i][j].side == PLAYER_COLOR) player++;
            if(this.stones[i][j].side == COM_COLOR)    com++;
        }
        document.getElementById("top").innerHTML =  "GAME OVER" + "<div>" +
                                                    "Player = "+player.toString()+ "<div>" +
                                                    "COM = "+com.toString();
    }

    // 石を置くよ
    put(x,y,side){
        console.log("put",x,y,side)
        var rev = reverce(x,y,side,this.getboard());
        // 置けないならおしまい
        if(rev.length == 0) return false;

        // ログ出すよ
        document.getElementById("bottom").value += (x+1).toString()+String.fromCharCode("a".charCodeAt(0)+y) + ",";
        // ひっくり返すよー
        for(var p of rev){
            this.stones[p[0]][p[1]].side = side;
        }
        // 最後に石を置きます
        this.stones[x][y].side = side;
        return true;
    }

    draw(){
        // 盤の背景塗りつぶし
        ctx.beginPath();
        ctx.rect(0,0,800,800);
        var gradient = ctx.createLinearGradient(400,-200,400,1000);
        ctx.fillStyle = gradient
        gradient.addColorStop((COLOR+0/6)%1,'rgb(255,0,0)')
        gradient.addColorStop((COLOR+2/6)%1,'rgb(0,255,0)')
        gradient.addColorStop((COLOR+4/6)%1,'rgb(0,0,255)')
        ctx.fill()
        // 石の描画
        for(var i=0; i<STAGE_SIZE;i++){
            for(var j=0;j<STAGE_SIZE;j++){
                this.stones[i][j].draw();
            }
        }
        // 線の描画
        for(var i = 0; i < 9; i++){
            ctx.beginPath();
            ctx.moveTo(0,i*100);
            ctx.lineTo(800,i*100);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(i*100,0);
            ctx.lineTo(i*100,800);
            ctx.stroke();
        }
    }
}

// 置ける場所があるか探すよ
function canput(side,state){
    for(var x=0; x<STAGE_SIZE; x++)for(var y=0;y<STAGE_SIZE;y++){
        if(reverce(x,y,side,state).length > 0){
            return true;
        }
    }
    return false;
}

// 裏返せる石を返すよ
function reverce(x,y,side,state){
    // 盤の外には置けないし、無を置くことは出来ない。
    if(side <= 0 || side > 2 || 0 > x || x >= STAGE_SIZE || 0 > y || y >= STAGE_SIZE ){
        return [];
    }
    // 空き以外に置けない
    if(state[x][y] != 0){
        return [];
    }
    var rev = []; // 裏返す石を保存
    for(var dx=-1;dx <= 1;++dx)for(var dy=-1;dy <= 1;++dy){
        var hoge = []
        var i = 1;
        for(var i=1;true;i++){
            // 盤外で探索終了
            if (dx*i+x < 0 || dx*i+x >= STAGE_SIZE || dy*i+y < 0 || dy*i+y >= STAGE_SIZE){
                break;
            }
            // 石がないから探索終了
            if (state[x+dx*i][y+dy*i] == 0){
                break;
            }
            // 相手の石を覚えていけ
            if (state[x+dx*i][y+dy*i] == side%2+1){
                hoge.push([x+dx*i,y+dy*i]);
            }
            // 自分の石で挟めたね
            if(state[x+dx*i][y+dy*i] == side){
                for(var piyo of hoge){
                    rev.push(piyo)
                }
                break;
            }
        }
    }
    return rev;
}

// 一番裏返せるマスに石を置くよ
function comLv1(board){
    state = board.getboard();
    var score=0,x,y;
    for(var i=0; i<STAGE_SIZE; i++)for(var j=0; j<STAGE_SIZE; j++){
        var hoge = reverce(i,j,COM_COLOR,state).length
        if(hoge > score){
            score = hoge;
            x = i;
            y = j;
        }
    }
    board.put(x,y,COM_COLOR);
    board.nextturn();
}

function comLv2(board){
    state = board.getboard();
    var score=-64,x,y;
    for(var i=0; i<STAGE_SIZE; i++)for(var j=0; j<STAGE_SIZE; j++){
        if(reverce(i,j,COM_COLOR,state).length == 0){
            continue;
        }
        var hoge = minimax(i,j,0,state,-100,100,COM_COLOR);
        if(hoge > score){
            score = hoge;
            x = i;
            y = j;
        }
    }
    console.log("minimax",x,y,score)
    board.put(x,y,COM_COLOR);
    board.nextturn();
}

function max(a,b){
    return a > b ? a : b;
}

function min(a,b){
    return a < b ? a : b;
}
// mini-max法
function minimax(x,y,depth,state,a,b,side){
    if(depth == 5) return eval(state);
    // 盤上の更新
    var rev = reverce(x,y,side,state);
    var nstate = JSON.parse(JSON.stringify(state));
    for(var p of rev){
        nstate[p[0]][p[1]] = side;
    }
    if (rev.length > 0) nstate[x][y] = side;
    // scoreになんかいれとく
    var score = side == COM_COLOR ? -100 : 100;
    // 置けるところを探してdepth+1で再起する
    for(var i=0; i<STAGE_SIZE; i++)for(var j=0; j<STAGE_SIZE; j++){
        if(reverce(i,j,side%2+1,nstate).length > 0){
            var hoge = minimax(x,y,depth+1,nstate,x,y,side%2+1);
            if(side == COM_COLOR){
                score = max(score,hoge);
                a = max(a,hoge);
                if(score > b){
                    return score;
                }
            }else{
                score = min(score,hoge);
                b = min(b,hoge);
                if (score < a){
                    return score;
                }
            }
        }
    }
    return score;
}

// 評価関数
function eval(state){
    var score = 0;
    for(var i=0; i<STAGE_SIZE; i++)for(var j=0; j<STAGE_SIZE; j++){
        if(state[i][j] == COM_COLOR)    score++;
        if(state[i][j] == PLAYER_COLOR) score--;
    }
    return score;
}

var game = new Board();

function onClick(e){
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX-rect.left;
    var y = e.clientY-rect.top;
    if(game.put(~~(x/100),~~(y/100),game.turn)){
        game.nextturn();
    }
    if(game.turn == COM_COLOR){
        comLv2(game);
    }
}

function draw(){
    game.draw();
    COLOR += 0.01;
    COLOR %= 1;
}

canvas.addEventListener('click',onClick,false);
setInterval(draw,10);
