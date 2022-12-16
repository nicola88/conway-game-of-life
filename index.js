'use strict'

const getCell = (world, x, y) => {
    return world.get(`{${x},${y}}`) || false
}

const buildWorld = (populatedCells) => {
    const mapInit = populatedCells.map(({x, y}) => [`{${x},${y}}`, true])
    const cellsMap = new Map(mapInit);
    return cellsMap
}

// const updateWorld = (world) => {
    
// }

const getNeighbours = (cell) => {
    const {x, y} = cell
    const left = x - 1 || -1
    const right = x + 1 || 1
    const top = y + 1 || 1
    const bottom = y - 1 || -1
    const neighbours = [
        {x: left, y: top},
        {x, y: top},
        {x: right, y: top},
        {x: right, y},
        {x: right, y: bottom},
        {x, y: bottom},
        {x: left, y: bottom},
        {x: left, y},
    ]
    return neighbours
}

const computeCellStatus = (world, cell) => {
    const neighbours = getNeighbours(cell)
    const neighboursStatus = neighbours.map(({x, y}) => getCell(world, x, y))
    const populatedCount = neighboursStatus.filter(true).length
}

module.exports = {
    buildWorld,
    getCell,
    getNeighbours,
    computeCellStatus
}