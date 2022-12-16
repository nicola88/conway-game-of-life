'use strict'

const { buildWorld, getCell, getCellNeighbours, computeNextCellState } = require('./index')

describe("Game of Life", () => {
  it("should build the world from a input", () => {
      const populatedCells = [
        {x: 1, y: 1},
        {x: 2, y: 1},
        {x: 3, y: 1},
        {x: 3, y: 2},
        {x: 2, y: 3}
      ]
      const world = buildWorld(populatedCells)
      expect(getCell(world, 1, 1)).toBeTruthy()
      expect(getCell(world, 2, 1)).toBeTruthy()
      expect(getCell(world, 3, 1)).toBeTruthy()
      expect(getCell(world, 3, 2)).toBeTruthy()
      expect(getCell(world, 2, 3)).toBeTruthy()
      expect(getCell(world, 1, 2)).toBeFalsy()
      expect(getCell(world, 2, 2)).toBeFalsy()
      expect(getCell(world, 1, 3)).toBeFalsy()
      expect(getCell(world, 3, 3)).toBeFalsy()
      expect(getCell(world, 25, 67)).toBeFalsy()
      expect(getCell(world, 40, 83)).toBeFalsy()
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

  it('should compute the cell status', () => {
    const populatedCells = [
      {x: 1, y: 1},
      {x: 2, y: 1},
      {x: 3, y: 1},
      {x: 3, y: 2},
      {x: 2, y: 3}
    ]
    const world = buildWorld(populatedCells)
    expect(computeNextCellState(world, populatedCells[0])).toBeFalsy()
  })

  // it("change generation", () => {
  //   const populatedCells = [
  //       {x: 1, y: 1},
  //       {x: 2, y: 1},
  //       {x: 3, y: 1},
  //       {x: 3, y: 2},
  //       {x: 2, y: 3}
  //   ]
  //   const world = buildWorld(populatedCells)
  //   const newWorld = updateWorld(world)
  //   expect(getCell(newWorld, 1,2).toBeTruthy())
  //   expect(getCell(newWorld, 2,-1).toBeTruthy())
  //   expect(getCell(newWorld, 2,1).toBeTruthy())
  //   expect(getCell(newWorld, 3,1).toBeTruthy())
  //   expect(getCell(newWorld, 3,2).toBeTruthy())
  //   expect(newWorld.size).toEqual(5)


  // })
})
