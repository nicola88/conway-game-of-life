'use strict'

const fs = require('fs')

/**
 * A cell
 * @typedef  {Object} Cell
 * @property {number} x X-axis coordinate (-n, ..., -1, 1, ..., n)
 * @property {number} y Y-axis coordinate (-n, ..., -1, 1, ..., n)
 */

/**
 * Two-dimensional world (a grid of cells)
 * @typedef {Map<string, CELL_STATE>} World
 */

/**
 * Cell state
 * @readonly
 * @enum {boolean}
 */
var CELL_STATE = {
  POPULATED: true,
  NOT_POPULATED: false,
}

/**
 * @param {Cell} cell
 * @returns {string} Cell ID
 */
const getCellId = (cell) => `{${cell.x},${cell.y}}`

/**
 * @param {string} cellId Cell ID 
 * @returns {Cell} Cell object
 */
const parseCellId = (cellId) => {
  const fields = cellId.split(',')
  const x = parseInt(fields[0].slice(1))
  const y = parseInt(fields[1].slice(0,-1))
  return {x, y}
}

/**
 * Return if the cell with given coordinates is populated or not
 * @param {World} world 
 * @param {Cell} cell
 * @returns {CELL_STATE} If the cell is populated or not
 */
const getCell = (world, cell) => world.get(getCellId(cell)) || CELL_STATE.NOT_POPULATED

/**
 * @param {World} world 
 * @param {Cell} cell 
 * @param {CELL_STATE} isPopulated If the cell is populated
 * @returns {World} Updated world
 */
const setCell = (world, cell, isPopulated) => world.set(getCellId(cell), isPopulated)

/**
 * Create a world with the given populated cells
 * @param {Cell[]} populatedCells List of populated cells 
 * @returns {World} World at generation zero
 */
const buildWorld = (populatedCells) => {
  const mapInit = populatedCells.map((cell) => [getCellId(cell), true])
  return new Map(mapInit)
}

/**
 * Return all the cells around a given cell
 * @param {Cell} cell A world cell
 * @returns {Cell[]} List of surrounding cells
 */
const getCellNeighbours = (cell) => {
  const { x, y } = cell
  const left = x - 1 || -1
  const right = x + 1 || 1
  const top = y + 1 || 1
  const bottom = y - 1 || -1
  const neighbours = [
    { x: left, y: top },
    { x, y: top },
    { x: right, y: top },
    { x: right, y },
    { x: right, y: bottom },
    { x, y: bottom },
    { x: left, y: bottom },
    { x: left, y },
  ]
  return neighbours
}

/**
 * Count the number of populated cells
 * @param {Cell[]} cells List of cells 
 * @returns {number} Number of populated cells
 */
const countPopulatedCells = (world, cells) => cells.reduce(
  (acc, cell) => acc + (getCell(world, cell) ? 1 : 0),
  0
)

/**
 * Return the state of a cell in the next generation
 * @param {boolean} isPopulated If a cell is populated 
 * @param {number} numPopulatedNeighbours Number of populated neighbours of the cell
 * @returns {CELL_STATE} The state of the cell in the next generation
 */
const getNextState = (isPopulated, numPopulatedNeighbours) => {
  if (isPopulated) {
    if (numPopulatedNeighbours < 2) { return CELL_STATE.NOT_POPULATED }
    if (numPopulatedNeighbours <= 3) { return CELL_STATE.POPULATED }
    return CELL_STATE.NOT_POPULATED
  } else {
    if (numPopulatedNeighbours === 3) { return CELL_STATE.POPULATED }
    return CELL_STATE.NOT_POPULATED
  }
}

/**
 * Return the cell state in the following generation
 * @param {World} world 
 * @param {Cell} cell
 * @returns {CELL_STATE} Cell state in the following generation
 */
const computeCellNextState = (world, cell) => {
  const isPopulated = getCell(world, cell)
  const neighbours = getCellNeighbours(cell)
  const numPopulatedNeighbours = countPopulatedCells(world, neighbours)
  return getNextState(isPopulated, numPopulatedNeighbours)
}

/**
 * @param {World} world 
 * @param {Cell} cell
 * @param {World} nextWorld 
 * @param {Set<string>} visitedCells 
 */
const updateNextCellStateRecursively = (world, cell, nextWorld, visitedCells) => {
  const cellId = getCellId(cell)
  if (visitedCells.has(cellId)) { return }
  const neighbours = getCellNeighbours(cell)
  const numPopulatedNeighbours = countPopulatedCells(world, neighbours)
  const isPopulated = getCell(world, cell)
  if (!isPopulated && numPopulatedNeighbours === 0) { return }
  const willBePopulated = getNextState(isPopulated, numPopulatedNeighbours)
  if (willBePopulated) { setCell(nextWorld, cell, true) }
  visitedCells.add(cellId)
  neighbours.forEach(neighbour => {
    updateNextCellStateRecursively(world, neighbour, nextWorld, visitedCells)
  })
}

/**
 * Compute the next generation of the world
 * @param {World} world 
 * @returns {World} Next generation world
 */
const getNextGeneration = (world) => {
  const nextWorld = new Map()
  const visitedCells = new Set()
  world.forEach((_, cellId) => {
    updateNextCellStateRecursively(world, parseCellId(cellId), nextWorld, visitedCells)
  })
  return nextWorld
}

/**
 * @param {World} world 
 */
const getNextGenerationWithoutRecursion = (world) => {
  const nextWorld = new Map()
  const visitedCells = new Set()
  const cellsToVisit = Array.from(world.keys())
  while (cellsToVisit.length > 0) {
    const cellId = cellsToVisit.pop()
    const cell = parseCellId(cellId)
    if (!visitedCells.has(cellId)) {
      const neighbours = getCellNeighbours(cell)
      const numPopulatedNeighbours = countPopulatedCells(world, neighbours)
      const isPopulated = getCell(world, cell)
      if (isPopulated || numPopulatedNeighbours > 0) {
        const willBePopulated = getNextState(isPopulated, numPopulatedNeighbours)
        if (willBePopulated) { setCell(nextWorld, cell, true) }
        visitedCells.add(cellId)
        neighbours.forEach(neighbour => cellsToVisit.push(getCellId(neighbour)))
      }
    }
  }
  return nextWorld
}

/**
 * Return the smallest grid containing all the populated cells of the world
 * @param {World} world
 * @returns {{x: {max: number, min: number}, y: {max: number, min: number}}}
 */
const getMinimumGridSize = (world) => {
  const cells = Array.from(world.keys()).map(parseCellId)
  const minX = Math.min(...cells.map(cell => cell.x))
  const maxX = Math.max(...cells.map(cell => cell.x))
  const minY = Math.min(...cells.map(cell => cell.y))
  const maxY = Math.max(...cells.map(cell => cell.y))
  return {
    x: { min: minX, max: maxX},
    y: { min: minY, max: maxY},
  }
}

/**
 * Return a string representing the smalles world grid containing all the populated cells
 * @param {World} world World to print to a string 
 * @param {string} columnSeparator String to use as separator between cells on the same grid row (default: '|')
 * @param {string} rowSeparator String to use as separator between different rows (default: '\n')
 * @param {string} populatedChar Single character to print inside a populated cell (default: 'X')
 * @param {string} notPopulatedChar Single character to print inside a cell not populated (default: ' ')
 * @returns {string} A string representing the smallest world grid containing all the populated cells
 */
const printWorld = (world, columnSeparator = '|', rowSeparator = '\n', populatedChar = 'X', notPopulatedChar = ' ') => {
  const worldStr = []
  const gridSize = getMinimumGridSize(world)
  for (let row = gridSize.y.max; row >= gridSize.y.min; row--) {
    if (row != 0) {
      const rowCells = []
      for (let column = gridSize.x.min; column <= gridSize.x.max; column++) {
        if (column != 0) {
          const isPopulated = getCell(world, {x: column, y: row})
          rowCells.push(isPopulated ? populatedChar : notPopulatedChar)
        }
      }
      worldStr.push(rowCells.join(columnSeparator))
    }
  }
  return worldStr.join(rowSeparator)
}

/**
 * Read the world initial state from a file
 * 
 * The file is expected to contain the list of the populated cells, one for each line.
 * Each line should contain the X coordinate followed by the Y coordinate,
 * separated by a delimiter character.
 * @param {string} path File patch
 * @param {string} encoding File encoding (default: UTF-8)
 * @param {string} delimiter Fields delimiter (default: comma)
 * @returns {World} The world containing the given populated cells
 */
const readWorldFromFile = (path, encoding = 'UTF-8', delimiter = ',') => {
  const worldData = fs.readFileSync(path, encoding)
  const lines = worldData.split(/\r?\n/)
  const populatedCells = lines.map(line => {
    const [x, y] = line.split(delimiter).map(coordinate => parseInt(coordinate))
    return {x, y}
  })
  return buildWorld(populatedCells)
}

module.exports = {
  CELL_STATE,
  buildWorld,
  computeCellNextState,
  countPopulatedCells,
  getCell,
  getCellNeighbours,
  getMinimumGridSize,
  getNextState,
  getNextGeneration,
  getNextGenerationWithoutRecursion,
  printWorld,
  readWorldFromFile,
}