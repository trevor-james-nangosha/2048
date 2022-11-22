function Tile(position, value){
    this.x =        position.x
    this.y =        position.y
    this.value =    value || 2

    this.previousPosition = null 
    this.mergedFrom = null // tracks tiles that can be merged together
}

Tile.prototype.savePosition = function(){
    this.previousPosition = {x: this.x, y: this.y}
}

Tile.prototype.updatePostion = function(position){
    this.x = position.x
    this.y = position.y 
}

Tile.prototype.serialise = function(){
    return {
        position: {
            x: this.x, 
            y: this.y,
        },
        value: this.value
    }
}