'use strict'

const { buildWorld, getCell, getCellNeighbours, computeCellNextState, countPopulatedCells, getNextState, CELL_STATE, getNextGeneration, getNextGenerationWithoutRecursion, getMinimumGridSize, printWorld } = require('./index')

describe("Game of Life", () => {
  const populatedCells = [
    {x: 1, y: 1},
    {x: 2, y: 1},
    {x: 2, y: 3},
    {x: 3, y: 1},
    {x: 3, y: 2},
  ]
  const unpopulatedCells = [
    {x: 1, y: 2},
    {x: 1, y: 3},
    {x: 2, y: 2},
    {x: 3, y: 3},
  ]
  const world = buildWorld(populatedCells)

  test.each([
    [{x: 1, y: 1}, CELL_STATE.POPULATED],
    [{x: 1, y: 2}, CELL_STATE.NOT_POPULATED],
    [{x: 1, y: 3}, CELL_STATE.NOT_POPULATED],
    [{x: 2, y: 1}, CELL_STATE.POPULATED],
    [{x: 2, y: 2}, CELL_STATE.NOT_POPULATED],
    [{x: 2, y: 3}, CELL_STATE.POPULATED],
    [{x: 3, y: 1}, CELL_STATE.POPULATED],
    [{x: 3, y: 2}, CELL_STATE.POPULATED],
    [{x: 3, y: 3}, CELL_STATE.NOT_POPULATED],
  ])('should get the correct state of cell %s', (cell, isPopulated) => {
    expect(getCell(world, cell)).toStrictEqual(isPopulated)
  })

  it("should get the correct state of a cell far far away", () => {
      expect(getCell(world, {x: 25, y: 67})).toBeFalsy()
      expect(getCell(world, {x: 40, y: 83})).toBeFalsy()
  })

  it('should return the correct neighbours', () => {
    const cell = {x: 1, y: 1}
    const neighbours = getCellNeighbours(cell)
    expect(neighbours[0]).toEqual({x: -1, y: 2})
    expect(neighbours[1]).toEqual({x: 1, y: 2})
    expect(neighbours[2]).toEqual({x: 2, y: 2})
    expect(neighbours[3]).toEqual({x: 2, y: 1})
    expect(neighbours[4]).toEqual({x: 2, y: -1})
    expect(neighbours[5]).toEqual({x: 1, y: -1})
    expect(neighbours[6]).toEqual({x: -1, y: -1})
    expect(neighbours[7]).toEqual({x: -1, y: 1})
  })

  it('should count the populated cells', () => {
    expect(countPopulatedCells(world, [])).toEqual(0)
    expect(countPopulatedCells(world, unpopulatedCells)).toEqual(0)
    expect(countPopulatedCells(world, populatedCells)).toEqual(populatedCells.length)
    expect(countPopulatedCells(world, [...populatedCells, ...unpopulatedCells])).toEqual(populatedCells.length)
  })

  test.each([
    [CELL_STATE.POPULATED, 0, CELL_STATE.NOT_POPULATED],
    [CELL_STATE.POPULATED, 1, CELL_STATE.NOT_POPULATED],
    [CELL_STATE.POPULATED, 2, CELL_STATE.POPULATED],
    [CELL_STATE.POPULATED, 3, CELL_STATE.POPULATED],
    [CELL_STATE.POPULATED, 4, CELL_STATE.NOT_POPULATED],
    [CELL_STATE.NOT_POPULATED, 0, CELL_STATE.NOT_POPULATED],
    [CELL_STATE.NOT_POPULATED, 1, CELL_STATE.NOT_POPULATED],
    [CELL_STATE.NOT_POPULATED, 2, CELL_STATE.NOT_POPULATED],
    [CELL_STATE.NOT_POPULATED, 3, CELL_STATE.POPULATED],
    [CELL_STATE.NOT_POPULATED, 4, CELL_STATE.NOT_POPULATED],
  ])('should compute the next state -- getNextState(%s, %s)', (isPopulated, numPopulatedNeighbours, willBePopulated) => {
    expect(getNextState(isPopulated, numPopulatedNeighbours)).toStrictEqual(willBePopulated)
  })

  test.each([
    [{x: 1, y: -1}, CELL_STATE.NOT_POPULATED],
    [{x: 1, y: 1}, CELL_STATE.NOT_POPULATED],
    [{x: 1, y: 2}, CELL_STATE.POPULATED],
    [{x: 1, y: 3}, CELL_STATE.NOT_POPULATED],
    [{x: 2, y: -1}, CELL_STATE.POPULATED],
    [{x: 2, y: 1}, CELL_STATE.POPULATED],
    [{x: 2, y: 2}, CELL_STATE.NOT_POPULATED],
    [{x: 2, y: 3}, CELL_STATE.NOT_POPULATED],
    [{x: 3, y: -1}, CELL_STATE.NOT_POPULATED],
    [{x: 3, y: 1}, CELL_STATE.POPULATED],
    [{x: 3, y: 2}, CELL_STATE.POPULATED],
    [{x: 3, y: 3}, CELL_STATE.NOT_POPULATED],
  ])('should compute the next state of the cell -- computeCellNextState(world, %s)', (cell, nextState) => {
    expect(computeCellNextState(world, cell)).toStrictEqual(nextState)
  })

  it("should compute the next generation of the world (with recursion)", () => {
    const nextWorld = getNextGeneration(world)
    expect(nextWorld.size).toEqual(5)

    expect(getCell(nextWorld, {x: 1, y: -1})).toBeFalsy()
    expect(getCell(nextWorld, {x: 1, y: 1})).toBeFalsy()
    expect(getCell(nextWorld, {x: 1, y: 2})).toBeTruthy()
    expect(getCell(nextWorld, {x: 1, y: 3})).toBeFalsy()

    expect(getCell(nextWorld, {x: 2, y: -1})).toBeTruthy()
    expect(getCell(nextWorld, {x: 2, y: 1})).toBeTruthy()
    expect(getCell(nextWorld, {x: 2, y: 2})).toBeFalsy()
    expect(getCell(nextWorld, {x: 2, y: 3})).toBeFalsy()

    expect(getCell(nextWorld, {x: 3, y: -1})).toBeFalsy()
    expect(getCell(nextWorld, {x: 3, y: 1})).toBeTruthy()
    expect(getCell(nextWorld, {x: 3, y: 2})).toBeTruthy()
    expect(getCell(nextWorld, {x: 3, y: 3})).toBeFalsy()
  })

  it("should compute the next generation of the world (without recursion)", () => {
    const nextWorld = getNextGenerationWithoutRecursion(world)
    expect(nextWorld.size).toEqual(5)

    expect(getCell(nextWorld, {x: 1, y: -1})).toBeFalsy()
    expect(getCell(nextWorld, {x: 1, y: 1})).toBeFalsy()
    expect(getCell(nextWorld, {x: 1, y: 2})).toBeTruthy()
    expect(getCell(nextWorld, {x: 1, y: 3})).toBeFalsy()

    expect(getCell(nextWorld, {x: 2, y: -1})).toBeTruthy()
    expect(getCell(nextWorld, {x: 2, y: 1})).toBeTruthy()
    expect(getCell(nextWorld, {x: 2, y: 2})).toBeFalsy()
    expect(getCell(nextWorld, {x: 2, y: 3})).toBeFalsy()

    expect(getCell(nextWorld, {x: 3, y: -1})).toBeFalsy()
    expect(getCell(nextWorld, {x: 3, y: 1})).toBeTruthy()
    expect(getCell(nextWorld, {x: 3, y: 2})).toBeTruthy()
    expect(getCell(nextWorld, {x: 3, y: 3})).toBeFalsy()
  })

  it('should compute the minimum grid size containing all populated cells', () => {
    const gridSize = getMinimumGridSize(world)
    expect(gridSize).toEqual({
      x: { min: 1, max: 3 },
      y: { min: 1, max: 3 },
    })
  })

  it('should print the world to a string', () => {
    // Generation zero
    const worldStr = printWorld(world)
    expect(worldStr).toEqual(' |X| \n | |X\nX|X|X')
    // First generation
    let nextWorld = getNextGenerationWithoutRecursion(world)
    let nextWorldStr = printWorld(nextWorld)
    expect(nextWorldStr).toEqual('X| |X\n |X|X\n |X| ')
    // Second generation
    nextWorld = getNextGenerationWithoutRecursion(nextWorld)
    nextWorldStr = printWorld(nextWorld)
    expect(nextWorldStr).toEqual(' | |X\nX| |X\n |X|X')
  })
})
