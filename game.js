const c = canvas.getContext('2d')
let running = true, size = 450
/**Game of file graphical settings */
let gSettings = {
    back: "#000",
    cell: "#fff",
    skipFrames: 1,
    cellSize: 5,
    cellPadding: 1
}

canvas.height = size * gSettings.cellSize
canvas.width = size * gSettings.cellSize

/** Creates new clean state of size.
 * @param {Number} size
 * @returns {Number[][]]}
 */
const cleanState = (size) => {
    let state = []
    for (let i = 0; i < size + 2; i++)
        state.push(new Array(size + 2).fill(0))
    return state
}

/** Creates new state of size with and randomly places life.
 * @param {Number} size
 * @returns {Number[][]}
 */
const randomState = (size) => {
    let state = []
    for (let i = 0; i < size + 2; i++)
        state.push(new Array(size + 2).fill(0))

    for (let y = 1; y < size + 1; y++) {
        for (let x = 1; x < size + 1; x++) {
            state[y][x] = Math.random() ** 2 - Math.random() ** 5 > Math.random() ? 1 : 0
        }
    }

    return state
}

/** Creates state form seed
 * @param {String} seed
 * @returns {Number[][]}
 */
const createStateFromSeed = (seed) => {
    // TODO
}

/** Creates seed form state
 * @param {Number[][]} state
 * @returns {String}
 */
const createSeedFromState = (state) => {
    // TODO
}

/** Creates new generation based on the state.
 * @param {Number[][]} state
 * @returns {Number[][]}
 */
const nextStep = (state) => {
    let newState = cleanState(size)

    for (let y = 1; y < size + 1; y++) {
        for (let x = 1; x < size + 1; x++) {
            /**{Number} check how many */
            let sum = state[y - 1][x - 1] + state[y - 1][x] + state[y - 1][x + 1]
                + state[y][x - 1] + state[y][x + 1]
                + state[y + 1][x - 1] + state[y + 1][x] + state[y + 1][x + 1]
            /* ALL GAME RULES implementation :P
             https://en.wikipedia.org/wiki/Conway's_Game_of_Life */
            if (state[y][x] == 0 && sum == 3) {
                newState[y][x] = 1
            } else if (state[y][x] == 1 && (sum == 2 || sum == 3)) {
                newState[y][x] = 1
            } else {
                newState[y][x] = 0
            }
        }
    }
    return newState
}

/** Renders state to canvas.
 * @param {Number[][]} state
 * @param {CanvasRenderingContext2D} c
 * @param {{ back: "#000", cell: "#fff" } settings
 * @returns {void}
 */
const renderState = (state, c, settings = { back: "#000", cell: "#fff" }) => {
    c.fillStyle = settings.back
    c.fillRect(0, 0, size * settings.cellSize, size * settings.cellSize)
    c.fillStyle = settings.cell
    const cellSize = settings.cellSize - settings.cellPadding
    for (let y = 1; y < size + 1; y++) {
        for (let x = 1; x < size + 1; x++) {
            if (state[y][x]) {
                c.fillRect(
                    (x - 1) * settings.cellSize + settings.cellPadding,
                    (y - 1) * settings.cellSize + settings.cellPadding,
                    cellSize,
                    cellSize)
            }
        }
    }
    c.stroke()
}

let state = randomState(size) // create initial state

const run = () => {
    if (running) {
        renderState(state, c, gSettings)
        for (let i = 0; i < gSettings.skipFrames; i++) {
            state = nextStep(state)
        }
        requestAnimationFrame(run)
    }
}
requestAnimationFrame(run)