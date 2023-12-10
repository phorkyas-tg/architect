const TILE_WIDTH = 64;
const TILE_HEIGHT = 64;

const NUM_TILES = 8;

const BLACK = "0x000000"
const WHITE = "0xffffff"
const GREY = "0x63666a"
const ORANGE = "0xed8b00"
const PETROL = "0x208ca3"

const WHITE_HASH = "#ffffff"
const GREY_HASH = "#63666a"
const ORANGE_HASH = "#ed8b00"
const MINT_HASH = "#aaf0d1"

const SCALE = 1;
const FLOOR_TILE = 37;
const WALL_TILE = 44;
const BOSS = 0
const DRONE = 10


class Level extends Phaser.Scene
{
    constructor (key)
    {
        super({ "key": key });

        
    }

    init (data)
    {
        this.gameOver = false
        this.maxRounds = 12

        this.column = [1, 4, 2, 7, 0, 4, 4, 4]
        this.row = [3, 2, 5, 3, 4, 1, 4, 4]
        // list of strings x_y
        this.bosses = ["1_5"];
        this.drones = ["7_1", "2_2", "7_3", "7_5", "7_7"];

        this.board = []

        this.selected = []
        this.isSelectedWall = false
        this.seletRow = false

        this.rowText = []
        this.columnText = []

        this.styleDefault = { color: WHITE_HASH, fontSize: "60px", stroke: GREY_HASH, strokeThickness: 8}
        this.styleCorrect = { color: MINT_HASH, fontSize: "60px", stroke: GREY_HASH, strokeThickness: 8}
        this.styleFalse = { color: GREY_HASH, fontSize: "60px", stroke: GREY_HASH, strokeThickness: 8}
    }

    preload ()
    {
        this.load.image('bg', 'assets/sprites/headquarter.png')
        this.load.spritesheet('tileSprite', 'assets/tiles/match3.png', { frameWidth: TILE_WIDTH, frameHeight: TILE_HEIGHT });
    }

    create ()
    {
        let padX = (CANVAS_WIDTH - (NUM_TILES + 1) * TILE_WIDTH) / 2
        let padY = (CANVAS_HEIGHT - (NUM_TILES + 1) * TILE_HEIGHT) / 2
        

        for (let y=0; y < NUM_TILES + 1; y++) {
            let boardRow = []

            for (let x=0; x < NUM_TILES + 1; x++) {
                if (y == 0 && x == 0) {
                    continue
                }
                if (y == 0) {
                    let columnText = this.add.text(padX + x * TILE_WIDTH, padY + y * TILE_HEIGHT, this.column[x - 1], this.styleDefault)
                        .setOrigin(0.5)
                    this.columnText.push(columnText)
                    continue;
                }
                if (x == 0) {
                    let rowText = this.add.text(padX + x * TILE_WIDTH, padY + y * TILE_HEIGHT, this.row[y - 1], this.styleDefault)
                        .setOrigin(0.5)
                    this.rowText.push(rowText)
                    continue;
                }


                let tile = null
                if (this.bosses.includes(this.getPosAsString(x-1, y-1))) {
                    tile = this.physics.add.sprite(padX + SCALE * x * TILE_WIDTH, padY + SCALE * y * TILE_HEIGHT, 'tileSprite', BOSS)
                    tile.tileType = BOSS
                }
                else if (this.drones.includes(this.getPosAsString(x-1, y-1))) {
                    tile = this.physics.add.sprite(padX + SCALE * x * TILE_WIDTH, padY + SCALE * y * TILE_HEIGHT, 'tileSprite', DRONE)
                    tile.tileType = DRONE
                }
                else {
                    tile = this.physics.add.sprite(padX + SCALE * x * TILE_WIDTH, padY + SCALE * y * TILE_HEIGHT, 'tileSprite', FLOOR_TILE)
                    tile.tileType = FLOOR_TILE
                    tile.setInteractive()
                }

                tile.setScale(SCALE)
                tile.setOrigin(0.5)
                tile.xPos = x - 1
                tile.yPos = y - 1
                
                tile.on('pointerover', function (pointer)
                {
                    tile.setTintFill(PETROL)

                    if (pointer.isDown && tile.tileType == FLOOR_TILE){
                        if (this.selected.length == 1) {
                            this.selected.push(tile)
                            this.drawWall(tile)
                            return
                        }
                        
                        let secondLastTile = this.selected[this.selected.length - 2]
                        if (secondLastTile === tile) {
                            let lastTile = this.selected.pop()
                            this.revertDrawWall(lastTile)
                        }
                        else {
                            this.selected.push(tile)
                            this.drawWall(tile)
                        }
                    }
                    
                }, this);
                tile.on('pointerout', function (pointer)
                {
                    tile.clearTint()
                }, this);
                tile.on('pointerdown', function (pointer)
                {
                    this.selected = [tile]
                    this.isSelectedWall = tile.frame.name == WALL_TILE
                    
                    this.drawWall(tile)
                }, this);

                boardRow.push(tile)
            }

            if (y == 0) {continue}

            this.board.push(boardRow)
        }

        this.updateNumbers()

    }

    drawWall(tile) {
        if (this.isSelectedWall) {
            tile.setFrame(FLOOR_TILE)
        }
        else {
            tile.setFrame(WALL_TILE)
        }
        tile.update()

        this.updateNumbers()
    }

    revertDrawWall(tile) {
        if (!this.isSelectedWall) {
            tile.setFrame(FLOOR_TILE)
        }
        else {
            tile.setFrame(WALL_TILE)
        }
        

        this.updateNumbers()
    }

    updateNumbers() {
        let row = new Array(NUM_TILES).fill(0);
        let col = new Array(NUM_TILES).fill(0);
        let correctWalls = 0

        for (let y=0; y < NUM_TILES; y++) {
            for (let x=0; x < NUM_TILES; x++) {
                if (this.board[x][y].frame.name == WALL_TILE) {
                    col[y]++
                    row[x]++
                }
            }
        }

        for (let i=0; i < NUM_TILES; i++) {
            if (col[i] == this.column[i]){
                this.columnText[i].setStyle(this.styleCorrect)
                correctWalls++
            }
            else if (col[i] > this.column[i]){
                this.columnText[i].setStyle(this.styleFalse)
            }
            else {
                this.columnText[i].setStyle(this.styleDefault)
            }

            if (row[i] == this.row[i]){
                this.rowText[i].setStyle(this.styleCorrect)
                correctWalls++
            }
            else if (row[i] > this.row[i]){
                this.rowText[i].setStyle(this.styleFalse)
            }
            else {
                this.rowText[i].setStyle(this.styleDefault)
            }
        }

        this.checkForWin(correctWalls)

    }

    checkForWin(correctWalls) {
        let isWallCorrect = correctWalls == 2 * NUM_TILES
        console.log("walls correct", isWallCorrect)
        // if (!isWallCorrect) {return false}
        
        // has every drone only one path?
        let isDroneCorrect = this.checkDrones()
        console.log("drones correct", isDroneCorrect)

        // are all paths connected?
        let isAllPathsConnected = this.checkAllPathsConnected()
        console.log("paths connected", isAllPathsConnected)

        // are all bosses in a 3x3 room?

        // no 2x2 square except room

        // has bosses room only one entry?
        
        if(isWallCorrect && isDroneCorrect){
            console.log("you win")
        }
    }

    checkAllPathsConnected() {
        let numberOfNonWalls = 0
        let paths = []
        let pathsAsString = []

        for (let y=0; y < NUM_TILES; y++) {
            for (let x=0; x < NUM_TILES; x++) {
                if (this.board[x][y].frame.name != WALL_TILE) {
                    numberOfNonWalls++
                    paths.push([this.board[x][y].xPos, this.board[x][y].yPos])
                    pathsAsString.push(this.getPosAsString(this.board[x][y].xPos, this.board[x][y].yPos))
                }
            }
        }

        let visited = []
        let toVisit = [this.getArrayPosAsString(paths[0])]
        
        while (toVisit.length > 0) {
            let next = toVisit.pop()
            let adj = this.getAdjacend(this.getStringAsPos(next))

            for (let j=0; j < adj.length; j++) {
                let adjPos = adj[j]
                let adjPosString = this.getArrayPosAsString(adjPos)
                let adjTile = this.board[adjPos[1]][adjPos[0]]

                if (adjTile.frame.name != WALL_TILE) {
                    if (visited.includes(adjPosString)) {
                        continue
                    }
                    else if (toVisit.includes(adjPosString)){
                        continue
                    }
                    else {
                        toVisit.push(adjPosString)
                    }
                }
            }

            visited.push(next)
        }

        return visited.length == paths.length
    }

    getPosAsString(x, y) {
        return x.toString() + "_" + y.toString()
    }

    getArrayPosAsString(xyArray) {
        return this.getPosAsString(xyArray[0], xyArray[1])
    }

    getStringAsPos(pos) {
        let words = pos.split('_')
        return [parseInt(words[0]), parseInt(words[1])]
    }

    getAdjacend(pos) {
        let adj = [[0, 1], [0, -1], [1, 0], [-1, 0]]
        let result = []
        
        for (let i=0; i < adj.length; i++) {
            let x = pos[0] + adj[i][0]
            let y = pos[1] + adj[i][1]

            if (x >= 0 && x < NUM_TILES && y >= 0 && y < NUM_TILES) {
                result.push([x, y])
            }
        }

        return result
    }

    checkDrones() {
        for (let i=0; i < this.drones.length; i++) {
            let pos = this.getStringAsPos(this.drones[i])
            let adj = this.getAdjacend(pos)

            let pathCount = 0
            for (let j=0; j < adj.length; j++) {
                let adjPos = adj[j]
                let adjTile = this.board[adjPos[1]][adjPos[0]]

                if (this.isPath(adjTile)) {
                    pathCount++
                }
            }

            if (pathCount != 1) {
                return false
            }
        }
        return true
    }

    isPath(tile) {
        if (tile.tileType == FLOOR_TILE && tile.frame.name == FLOOR_TILE) {
            return true
        }
        return false
    }


    // The maximum is inclusive and the minimum is inclusive
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min); 
    }


    update (time, delta)
    {

    }
}

