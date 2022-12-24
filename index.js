'use strict'

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

module.exports = {
  CELL_STATE,
  buildWorld,
  computeCellNextState,
  countPopulatedCells,
  getCell,
  getCellNeighbours,
  getNextState,
  getNextGeneration,
}