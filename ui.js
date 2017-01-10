const canvas = document.createElement('canvas')
document.body.appendChild(canvas)
const menu = document.createElement('div')

window.addEventListener('keydown', (e) => {
    switch (e.which) {
        case 82: // R
            state = randomState(size)
            if (!running) {
                renderState(state, c, gSettings)
            }
            break
        case 32: // SPACE
            if (running) running = false
            else {
                running = true
                requestAnimationFrame(run)
            }
            break
    }
})