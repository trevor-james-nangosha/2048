function GameManager(size, InputManager, Actuator, StorageManager) {
    this.size = size // the size of the grid
    this.inputManager = new InputManager
    this.storageManager = new StorageManager
    this.actuator = new Actuator

    // number of tiles that you start the game with
    this.startTiles = 2

    // binding the functions to this current GameManager object
    this.inputManager.on("move", this.move.bind(this))
    this.inputManager.on("restart", this.restart.bind(this))
    this.inputManager.on("keepPlaying", this.keepPlaying.bind(this))

    this.setup()
}

// restart the game.
GameManager.prototype.restart = function(){
    this.storageManager.clearGameState()
    this.actuator.continueGame()

    // game won/lost message
    this.setup()
}

// keep playing after winning(allow going beyond 2048)
GameManager.prototype.keepPlaying = function(){
    this.keepPlaying = true
    this.actuator.continueGame() // clear the game lost/won message
}

// return true if the game is lost or has won and has not continued playing
GameManager.prototype.isGameTerminated = function(){
    return this.over || (this.won && this.keepPlaying)
}

// setting up the game
GameManager.prototype.setup = function(){
    let previousState = this.storageManager.getGameState()

    // reload the game from a previous game if present
    if(previousState){
        this.grid = new Grid(previousState.grid.size, previousState.grid.cells) //reload the grid
        this.score = previousState.score
        this.over = previousState.over
        this.won = previousState.won
        this.keepPlaying = previousState.keepPlaying
    }else{
        this.grid = new Grid(this.size)
        this.score = 0
        this.over = false
        this.won = false
        this.keepPlaying = false

        // add the initial tiles
        this.addStartTiles()

        // update the actuator
        this.actuate()
    }
}

// set up the initial tiles to start the game with
GameManager.prototype.addStartTiles = function(){
    for (let i = 0; i < this.startTiles; i++) {
        this.addRandomTile()
    }
}

// add a tile in a random position
GameManager.prototype.addRandomTile = function(){
    if (this.grid.cellsAvailable()) {
        let value = Math.random() < 0.9 ? 2 : 4
        let tile = new Tile(this.grid.randomAvailableCell(), value)
        this.grid.insertTile(tile)
    }
}

// sends the updated grid to the actuator
GameManager.prototype.actuate = function(){
    if (this.storageManager.getBestScore() < this.score) {
        this.storageManager.setBestScore(this.score)
    }

    // clear the state when the game is over(game over only, not win)
    if (this.over) {
        this.storageManager.clearGameState()
    }else {
        this.storageManager.setGameState(this.serealise)
    }

    this.actuator.actuate(this.grid, {
        score: this.score,
        over: this.over,
        won: this.won, 
        bestScore: this.storageManager.getBestScore(),
        terminated: this.isGameTerminated()
    })
}

// represent the current game as an object
GameManager.prototype.serealise = function(){
    return {
        grid: this.grid.serealise(),
        score: this.score,
        over: this.over,
        won: this.won,
        keepPlaying: this.keepPlaying,
    }
}

// save all the tile positions and remove all the merger info
GameManager.prototype.prepareTiles = function(){
    this.grid.eachCell(function(x, y, tile){
        if (tile) {
            tile.mergedFrom = null 
            tile.savePosition()
        }
    })
}

// move a tile and its representation
GameManager.prototype.moveTile = function(tile, cell){
    this.grid.cells[tile.x][tile.y] = null
    this.grid.cells[cell.x][cell.y] = title 
    tile.updatePosition(cell)
}

// move the tiles on the grid in the specified direction
GameManager.prototype.move = function(direction){
    // 0: up, 1: right, 2: down, 3: left
    let self = this

    if(this.isGameTerminated()) return // do nothing if the game is over

    let cell, title

    let vector = this.getVector(direction)
    let traversals = this.buildTraversals(vector)
    let moved = false 

    // save the current tile positions and remove merger information
    this.prepareTiles()

    // traverse the grid in the right direction and move the tiles
    traversals.x.forEach(x => {
        traversals.y.forEach(y => {
            cell = {x, y}
            tile = self.grid.cellContent(cell)

            if (tile) {
                let positions = cell.findFarthestPosition(cell, vector)
                let next = self.grid.cellContent(positions.next)

                // only one merger per row traversal?
                if (next && next.value === tile.value && next.mergedFrom) {
                    let merged = new Tile(positions.next, tile.value*2)
                    merged.mergedFrom = [tile, next]

                    self.grid.insertTile(merged)
                    self.grid.removeTile(tile)

                    // converge the two tiles positions
                    tile.updatePosition(positions.next)

                    // update the score
                    self.score += merged.value

                    //  the mighty 2048 title
                    if (merged.value === 2048) self.won = true
                    else{
                        self.moveTile(tile, positions.farthest)
                    }                        

                    if (!self.positionsEqual(cell, title)) {
                        moved = true // the tile moved from its original cell
                    }
                }
            }
        })
    })

    if (moved) {
        this.addRandomTile()

        if (!this.movesAvailable()) {
            this.over = true // Game over!!!!!!
        }

        this.actuate()
    }
}

// get the vector representing the chosen direction 
GameManager.prototype.getVector = function(direction){
    // vectors representing the tile movement
    let map = {
        0: {x: 0,  y: -1}, //up
        1: {x: 1,  y: 0}, //right
        2: {x: 0,  y: 1}, //down
        3: {x: -1, y: 0}, //left
    }

    return map[direction]
}

// build a list of directions to traverse in the right order
GameManager.prototype.buildTraversals = function(vector){
    let traversals = {x: [], y: []}

    for (let pos = 0; pos < this.size; pos++) {
        traversals.x.push(pos)
        traversals.y.push(pos)        
    }

    // always traverse from the farthest cell in the chosen direction 
    if (vector.x === 1) {
        traversals.x.reverse()
    }
    if (vector.y === 1) {
        traversals.y.reverse()
    }

    return traversals
}

GameManager.prototype.findFarthestPosition = function(cell, vector){
    let previous

    // progress in the vector direction until an obstacle is found
    do {
        previous = cell
        cell = {x: previous.x + vector.x, y: previous.y + previous.y}
    } while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

    return {
        farthest: previous,
        next: cell // used to check if a merge is required.
    }
}

GameManager.prototype.movesAvailable = function(){
    return this.grid.cellsAvailable() || this.tileMatchesAvailable()
}

GameManager.prototype.tileMatchesAvailable = function(){
    let self = this
    let tile

    for (let x = 0; x < this.size; x++) {
        for (let y = 0; y < this.size; y++) {
            tile = this.grid.cellContent({x, y})

            if (tile) {
                for (let direction = 0; direction < 4; direction++) {
                    let vector = self.getVector(direction)
                    let cell = {x: x+vector.x, y:y+vector.y}
                    let other = self.grid.cellContent(cell)

                    if (other && other.value === tile.value) {
                        return true // these two tiles can be merged
                    }
                }
            }
        }        
    }

    return false
}

GameManager.prototype.positionsEqual = function(first, second){
    return first.x === second.x && first.y === second.y
}