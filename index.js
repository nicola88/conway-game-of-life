'use strict'

/**
 * A cell
 * @typedef  {Object} Cell
 * @property {number} x X-axis coordinate (-n, ..., -1, 1, ..., n)
 * @property {number} y Y-axis coordinate (-n, ..., -1, 1, ..., n)
 */

/**
 * Two-dimensional world (a grid of cells)
 * @typedef {Map<string, boolean>} World
 */

/**
 * Cell state
 * @readonly
 * @enum {boolean}
 */
var CELL_STATE = {
  POPULATED: true,
  NOT_POPULATED: false,
};

/**
 * Return if the cell with given coordinates is populated or not
 * @param {World} world 
 * @param {number} x X-axis coordinate
 * @param {number} y Y-axis coordinate 
 * @returns {CELL_STATE} If the cell is populated or not
 */
const getCell = (world, x, y) => {
  return world.get(`{${x},${y}}`) || false
}

/**
 * Create a world with the given populated cells
 * @param {Cell[]} populatedCells List of populated cells 
 * @returns {World} World at generation zero
 */
const buildWorld = (populatedCells) => {
  const mapInit = populatedCells.map(({ x, y }) => [`{${x},${y}}`, true])
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
const countPopulatedCells = (cells) => cells.reduce((acc, { x, y }) => acc + (getCell(world, x, y) ? 1 : 0), 0)

/**
 * Return the cell state in the following generation
 * @param {World} world 
 * @param {Cell} cell
 * @returns {CELL_STATE} Cell state in the following generation
 */
const computeNextCellState = (world, cell) => {
  const isPopulated = getCell(world, cell.x, cell.y)
  const neighbours = getCellNeighbours(cell)
  const numPopulatedNeighbours = countPopulatedCells(neighbours)
  if (isPopulated) {
    if (numPopulatedNeighbours < 2) { return CELL_STATE.NOT_POPULATED }
    if (numPopulatedNeighbours <= 3) { return CELL_STATE.POPULATED }
    return CELL_STATE.NOT_POPULATED
  } else {
    if (numPopulatedNeighbours === 3) { return CELL_STATE.POPULATED }
    return CELL_STATE.NOT_POPULATED
  }
}

module.exports = {
  buildWorld,
  countPopulatedCells,
  getCell,
  getCellNeighbours,
  computeNextCellState
}