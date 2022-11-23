// wait until the browser is ready to render the game(this avoid glitches)

window.requestAnimationFrame(() => {
    new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager)
})