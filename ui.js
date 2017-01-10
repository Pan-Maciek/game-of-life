const canvas = document.createElement('canvas')
document.body.appendChild(canvas)
const menu = document.createElement('div')

window.addEventListener('keydown', (e) => {
    console.log(e.which)
    switch (e.which) {
        case 82: // R
            state = randomState(size)
            if (!running) {
                renderState(state, c, gSettings)
            }
            break
        case 32: // SPACE
            if (running) {
                running = false
                renderState(state, c, gSettings)
            } else {
                running = true
                requestAnimationFrame(run)
            }
            break
        case 67: // C
            if (e.ctrlKey) {
                createSeedFromState(state)
            }
            break
        case 107:
            gSettings.skipFrames += 2
            break
        case 109:
            gSettings.skipFrames = Math.max(gSettings.skipFrames - 2, 1)
            break
        default:
            state = nextStep(state)
            renderState(state, c, gSettings)
    }
})

canvas.addEventListener('click', e => {
    let x = Math.round((e.clientX - 1) / gSettings.cellSize),
        y = Math.round((e.clientY - 1) / gSettings.cellSize)
    state[y][x] = state[y][x] == 0 ? 1 : 0
    if (!running) {
        renderState(state, c, gSettings)
    }
})