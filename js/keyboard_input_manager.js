function KeyBoardInputManager(){
    this.events = {}

    if (window.navigator.msPointerEnabled) {
        // internet explorer 10 style

        this.eventTouchstart = "MSPointerDown"
        this.eventTouchmove = "MSPointerMove"
        this.eventTouchend = "MSPointerUp"
    } else{
        this.eventTouchstart = "touchstart"
        this.eventTouchmove = "touchmove"
        this.eventTouchend = "touchend"
    }

    this.listen();
}

KeyBoardInputManager.prototype.on = function (event, callback) {
    if(!this.events[event]){
        this.events[event] = []
    }
    this.events[event].push(callback)
}

KeyBoardInputManager.prototype.emit = function(event, data){
    let callbacks = this.events[event]
    if (callbacks) {
        callbacks.forEach(callback => {
            callback(data)
        })
    }
}

KeyBoardInputManager.prototype.listen = function(){
    let self = this
    let map = {
        38: 0, // Up
        39: 1, // Right
        40: 2, // Down
        37: 3, // Left
        75: 0, // Vim down
        76: 1, // Vim right
        74: 2, // Vim down
        72: 3, // Vim left
        87: 0, // W
        68: 1, // D
        83: 2, // S
        65: 3, // A
    }

    // respond to the direction keys
    document.addEventListener("keydown", (event) => {
        let modifiers = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
        let mapped = map[event.which]

        if (!modifiers) {
            if (mapped !== undefined) {
                event.preventDefault()
                self.emit("move", mapped)
            }
        }

        // R key restarts the game
        if (!modifiers && event.which === 82) {
            self.restart.call(self, event)
        }
    })

    // respond to button presses
    this.bindButtonPress(".retry-button", this.restart)
    this.bindButtonPress(".restart-button", this.restart)
    this.bindButtonPress(".keep-playing-button", this.keepPlaying)  

    // respond to swipe events 
    let touchStartClientX, touchStartClientY
    let gameContainer = document.getElementsByClassName("game-container")[0]

    gameContainer.addEventListener(this.eventTouchstart, (event) => {
        if ((!window.navigator.msPointerEnabled && event.touches.length > 1) || event.touches.length > 1) {
            return // ignore if touching with more than one finger
            // i am yet to find out whether this even works
        }

        if (window.navigator.msPointerEnabled) {
            touchStartClientX = event.pageX
            touchStartClientY = event.pageY
        }else{
            touchStartClientX = event.touches[0].clientX
            touchStartClientY = event.touches[0].clientY
        }

        event.preventDefault()
    })

    gameContainer.addEventListener("this.eventTouchmove", (event) => {
        event.preventDefault()
    })

    gameContainer.addEventListener("this.eventTouchend", (event) => {
        if ((!window.navigator.msPointerEnabled && event.touches.length > 0) || event.touches.length > 0) {
            return // ignore if still touching with more than one finger
        }

        let touchEndClientX, touchEndClientY

        if (window.navigator.msPointerEnabled) {
            touchEndClientX = event.pageX
            touchEndClientY = event.pageY
        }else{
            touchEndClientX = event.touches[0].clientX
            touchEndClientY = event.touches[0].clientY
        }

        let dx = touchEndClientX - touchStartClientX
        let absDx = Math.abs(dx)

        let dy = touchEndClientY - touchStartClientY
        let absDy = Math.abs(dy)

        if (Math.max(absDx, absDy > 10)) {
            // (right : left) : (down : up)
            self.emit("move", absDx > absDx ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0))
        }

    })

}

KeyBoardInputManager.prototype.restart = function(event){
    event.preventDefault()
    this.emit("restart")
}

KeyBoardInputManager.prototype.keepPlaying = function(event){
    event.preventDefault()
    this.emit("keepPlaying")
}

KeyBoardInputManager.prototype.bindButtonPress = function(selector, fn){
    let button = document.querySelector(selector)
    button.addEventListener("click", fn.bind(this))
    button.addEventListener(this.eventTouchend, fn.bind(this))
}