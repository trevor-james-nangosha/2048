function Grid(size, previousState){
    this.size = size
    this.cells = previousState ? this.fromState(previousState) : this.empty()
}

// build a grid of the specified state
Grid.prototype.empty = function(){
    let cells = []
    for (let x = 0; x < this.size; x++) {
        let row = cells[x] = []

        for (let y = 0; y < this.size; y++) {
            row.push(null)
        }  
    }

    return cells;
}

Grid.prototype.fromState = function(state){
    let cells = []
    for (let x = 0; x < this.size; x++) {
        let row = cells[x] = []

        for (let y = 0; y < this.size; y++) {
            let tile = state[x][y]
            row.push(tile ? new Tile(tile.position, tile.value) : null)
        }  
    }
    return cells
}

// find the first available random position
Grid.prototype.randomAvailableCell = function(){
    let cells = this.availableCells()
    
    if (cells.length) {
        return cells[Math.floor(Math.random() * cells.length)]
    }
}

Grid.prototype.availableCells = function(){
    let cells = []
    this.eachCell((x, y, tile) => {
        if (!tile) {
            cells.push({x, y,})
        }
    })
    return cells
}

// call the specified callback for every cell
Grid.prototype.eachCell = function(callback){
    for (let x = 0; x < this.size; x++) {
        for (let y = 0; y < this.size; y++) {
            callback(x, y, this.cells[x][y])            
        }
    }
}

// check if there are any cells available
Grid.prototype.cellsAvailable = function(){
    return !!this.availableCells().length
}

// check if the specified cell is available/taken
Grid.prototype.cellAvailable = function(cell){
    return !this.cellOccupied(cell)
}

Grid.prototype.cellOccupied = function(cell){
    return !!this.cellContent(cell)
}

Grid.prototype.cellContent = function(cell){
    if (this.withinBounds(cell)) {
        return this.cells[cell.x][cell.y]
    }else{
        return null
    }
}

// insert a tile at its position
Grid.prototype.insertTile = function(tile){
    this.cells[tile.x][tile.y] = tile
}

Grid.prototype.removeTile = function(tile){
    this.cells[tile.x][tile.y] = null 
}

Grid.prototype.withinBounds = function(position){
    return position.x >= 0 && position.x < this.size &&
           position.y >= 0 && position.y < this.size 
}

Grid.prototype.serialise = function(){
    let cellState = []
    for (let x = 0; x < this.size; x++) {
        let row = cellState[x] = []

        for (let y = 0; y < this.size; y++) {
            row.push(this.cells[x][y] ? this.cells[x][y].serialise() : null)
        } 
    }

    return {
        size: this.size,
        cells: this.cellState,
    }
}