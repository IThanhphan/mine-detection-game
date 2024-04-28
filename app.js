const canvas = document.querySelector('#game-area');
const ctx = canvas.getContext('2d');
const play_btn = document.querySelector('.play-btn');
const headerText = document.querySelector('.text-game');
const timer = document.querySelector('.display-time h1');
const counter = document.querySelector('.display-count h1');
const BLOCK_SIZE = 25;
const BOARD_SIZE_ROW = 20;
const BOARD_SIZE_COL = 40;
const DIFFICULT = 120;
const MAPPING_ITEM = [
    {
        content: ' ',
        background_color: 'white',
        text_color: null
    },
    {
        content: '1',
        background_color: 'white',
        text_color: 'rgb(10, 0, 255)'
    },
    {
        content: '2',
        background_color: 'white',
        text_color: 'rgb(0, 107, 0)'
    },
    {
        content: '3',
        background_color: 'white',
        text_color: 'rgb(231, 0, 0)'
    },
    {
        content: '4',
        background_color: 'white',
        text_color: 'rgb(3, 3, 135)'
    },
    {
        content: '5',
        background_color: 'white',
        text_color: 'rgb(124, 0, 16)'
    },
    {
        content: '6',
        background_color: 'white',
        text_color: 'rgb(0, 123, 124)'
    },
    {
        content: '7',
        background_color: 'white',
        text_color: 'rgb(0, 0, 0)'
    },
    {
        content: '8',
        background_color: 'white',
        text_color: 'rgb(123, 123, 123)'
    },
    {
        content: 'b',
        background_color: 'black',
        text_color: 'white'
    },
    {
        content: '',
        background_color: 'rgb(190, 190, 190)',
        text_color: null
    }
];
const FLAT = {
    content: 'f',
    background_color: 'red',
    text_color: 'white'
}
const whiteID = 0;
const bombID = 9;
const coverID = 10;
const FONT_SIZE = 16;

let playing = 0;
let numberOfFlat = DIFFICULT;
let blockToWin = BOARD_SIZE_COL*BOARD_SIZE_ROW-DIFFICULT;
let ArrayFlat;
let ArrayTemp
let minute;
let second;
let timerInterval;

function updateTime() {
    let extraSecond = '0';
    if (second<60) {
        second++;
    } else {
        second = 0;
        minute++;
    }
    if (second>=10) {
        extraSecond = '';
    }
    timer.innerText = `${minute}:${extraSecond}${second}`;
}

function updateCount() {
    let extraCount = '';
    if (numberOfFlat<100 && numberOfFlat>=10) {
        extraCount = '0';
    } else if (numberOfFlat<10) {
        extraCount = '00';
    }
    counter.innerText = `${extraCount}${numberOfFlat}`;
}

class Board {
    constructor(ctx) {
        this.ctx = ctx;
        this.ctx.canvas.width = BLOCK_SIZE*BOARD_SIZE_COL;
        this.ctx.canvas.height = BLOCK_SIZE*BOARD_SIZE_ROW;
        this.grid = this.generateWhiteBoard();
    }

    reset() {
        this.ctx.clearRect(0, 0, BOARD_SIZE_COL*BLOCK_SIZE, BOARD_SIZE_ROW*BLOCK_SIZE);
        this.grid = this.generateWhiteBoard();
        this.drawBoard();
        this.generateRandomBomb();
        this.generateNumber();
    }

    generateWhiteBoard() {
        return Array.from({length: BOARD_SIZE_ROW}, () => Array(BOARD_SIZE_COL).fill(whiteID));
    }

    drawCell(x, y, itemId) {
        let text = MAPPING_ITEM[itemId].content;
        this.ctx.fillStyle = MAPPING_ITEM[itemId].background_color;
        this.ctx.fillRect(x*BLOCK_SIZE, y*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        this.ctx.font = `${FONT_SIZE}px Arial`;
        this.ctx.fillStyle = MAPPING_ITEM[itemId].text_color;
        this.ctx.fillText(text, (x*BLOCK_SIZE)+(BLOCK_SIZE/2), (y*BLOCK_SIZE)+FONT_SIZE);
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = 'black';
        this.ctx.strokeRect(x*BLOCK_SIZE, y*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }

    drawBoard() {
        for (let row=0; row<BOARD_SIZE_ROW; row++) {
            for (let col=0; col<BOARD_SIZE_COL; col++) {
                this.drawCell(col, row, coverID);
            }
        }
    }

    generateRandomBomb() {
        for (let i=1; i<=DIFFICULT; i++) {
            let randomRow;
            let randomCol;
            do {
                randomRow = Math.floor(Math.random() * BOARD_SIZE_ROW);
                randomCol = Math.floor(Math.random() * BOARD_SIZE_COL);
            } while (this.grid[randomRow][randomCol] === bombID);
            this.grid[randomRow][randomCol] = bombID;
        }
    }

    scanBomb(x, y) {
        let scan = [
            { //top
                x: x,
                y: y-1
            },
            { //bottom
                x: x,
                y: y+1
            },
            { //right
                x: x+1,
                y: y
            },
            { //left
                x: x-1,
                y: y
            },
            { //top_left
                x: x-1,
                y: y-1
            },
            { //top_right
                x: x+1,
                y: y-1
            },
            { //bottom_left
                x: x-1,
                y: y+1
            },
            { //bottom_right
                x: x+1, 
                y: y+1
            }
        ]
        let count = 0;
        for (let position of scan) {
            if (position.x<0 || position.x>=BOARD_SIZE_COL || 
                position.y<0 || position.y>=BOARD_SIZE_ROW) {
                    continue;
            } else {
                if (board.grid[position.y][position.x] === bombID) {
                    count++;
                }
            }
        }
        return count;
    }

    generateNumber() {
        for (let row=0; row<BOARD_SIZE_ROW; row++) {
            for (let col=0; col<BOARD_SIZE_COL; col++) {
                if (this.grid[row][col]===bombID) {
                    continue;
                }
                let numberOfBomb = this.scanBomb(col, row);
                this.grid[row][col] = numberOfBomb;
            }
        }
    }

    spread(x, y) {
        if (x<0 || x>=BOARD_SIZE_COL || y<0 || y>=BOARD_SIZE_ROW || ArrayFlat[y][x]) {
            return;
        }
        if (this.grid[y][x]!==bombID && this.grid[y][x]!==whiteID) {
            ArrayFlat[y][x] = 2;
            this.drawCell(x, y, this.grid[y][x]);
            return;
        }
        if (ArrayTemp[y][x]===0) {
            ArrayTemp[y][x] = 1;
            ArrayFlat[y][x] = 2;
            this.drawCell(x, y, this.grid[y][x]);
            this.spread(x+1, y);
            this.spread(x, y+1);
            this.spread(x-1, y);
            this.spread(x, y-1);
        }
    }

    drawFlat(x, y) {
        let text = FLAT.content;
        this.ctx.fillStyle = FLAT.background_color;
        this.ctx.fillRect(x*BLOCK_SIZE, y*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        this.ctx.font = `${FONT_SIZE}px Arial`;
        this.ctx.fillStyle = FLAT.text_color;
        this.ctx.fillText(text, (x*BLOCK_SIZE)+(BLOCK_SIZE/2), (y*BLOCK_SIZE)+FONT_SIZE);
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = 'black';
        this.ctx.strokeRect(x*BLOCK_SIZE, y*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }
}

let board = new Board(ctx);

play_btn.addEventListener('click', function(e) {
    minute = 0;
    second = 0;
    numberOfFlat = DIFFICULT;
    playing = 1;
    headerText.innerText = 'Dò mìn';
    timer.innerText = `${minute}:0${second}`;
    updateCount();
    board.reset();
    ArrayFlat = board.generateWhiteBoard();
    clearInterval(timerInterval);
    timerInterval = setInterval(() => updateTime(), 1000);
})

canvas.addEventListener('click', function(e) {
    if (playing) {
        let xPos, yPos;
        for (let row=0; row<BOARD_SIZE_ROW; row++) {
            for (let col=0; col<BOARD_SIZE_COL; col++) {
                if (e.pageX>=this.offsetLeft+(BLOCK_SIZE*col) && e.pageX<=this.offsetLeft+(BLOCK_SIZE*(col+1)) &&
                    e.pageY>=this.offsetTop+(BLOCK_SIZE*row) && e.pageY<=this.offsetTop+(BLOCK_SIZE*(row+1))) {
                    xPos = col;
                    yPos = row;
                }
            }
        }
        if (board.grid[yPos][xPos]===bombID) {
            for (let row=0; row<BOARD_SIZE_ROW; row++) {
                for (let col=0; col<BOARD_SIZE_COL; col++) {
                    if (ArrayFlat[row][col]===1 && board.grid[row][col]===bombID) {
                        continue;
                    }
                    board.drawCell(col, row, board.grid[row][col]);
                }
            }
            headerText.innerText = 'Game Over!!!';
            clearInterval(timerInterval);
            playing = 0;
        } else {
            blockToWin--;
            ArrayTemp = board.generateWhiteBoard();
            board.spread(xPos, yPos);
        }
        if (blockToWin===0) {
            headerText.innerText = 'You Win!!!';
            clearInterval(timerInterval);
            playing = 0;
        }
    }
})

canvas.addEventListener('contextmenu', function(e) {
    if (playing) {
        e.preventDefault(); 
        let xPos, yPos;
        for (let row=0; row<BOARD_SIZE_ROW; row++) {
            for (let col=0; col<BOARD_SIZE_COL; col++) {
                if (e.pageX>=this.offsetLeft+(BLOCK_SIZE*col) && e.pageX<=this.offsetLeft+(BLOCK_SIZE*(col+1)) &&
                    e.pageY>=this.offsetTop+(BLOCK_SIZE*row) && e.pageY<=this.offsetTop+(BLOCK_SIZE*(row+1))) {
                    xPos = col;
                    yPos = row;
                }
            }
        }
        if (ArrayFlat[yPos][xPos]===0) {
            if (numberOfFlat>0) {
                numberOfFlat--;
                updateCount();
                ArrayFlat[yPos][xPos] = 1;
                board.drawFlat(xPos, yPos);
            }
        } else if (ArrayFlat[yPos][xPos]===1) {
            numberOfFlat++;
            updateCount();
            ArrayFlat[yPos][xPos] = 0;
            board.drawCell(xPos, yPos, coverID);
        }
    }
});