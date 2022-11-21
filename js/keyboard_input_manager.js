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