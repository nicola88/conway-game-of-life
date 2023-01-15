'use strict'

const { Confirm, Select, NumberPrompt } = require('enquirer');
const { getCellId, CELL_STATE, printWorld, getNextGenerationWithoutRecursion } = require('.');

const DEFAULT_WORLD_SIZES = Object.freeze({
  'Small (5x5)': 5,
  'Medium (10x10)': 10,
  'Large (25x25)': 25,
  'Extra large (50x50)': 50,
})

const askGridSize = async() => {
  const customChoice = 'Custom'
  const worldSizePrompt = new Select({
    name: 'worldSize',
    message: 'Choose the initial size of the world',
    initial: 'Small (5x5)',
    choices: [
      ...Object.keys(DEFAULT_WORLD_SIZES),
      customChoice
    ]
  });
  const worldSize = await worldSizePrompt.run()
  if (worldSize === customChoice) {
    const gridSizeNumberPrompt = new NumberPrompt({
      name: 'number',
      message: 'Enter the custom size (as the number of cells on each size of the grid)',
      validate: (value) => value >= 1 && value <= Number.MAX_SAFE_INTEGER
    })
    return gridSizeNumberPrompt.run()
  } else {
    return DEFAULT_WORLD_SIZES[worldSize]
  }
}

const askPopulationSize = async() => {
  const populationSizePrompt = new NumberPrompt({
    name: 'populationSize',
    message: 'Choose the population size (as % of total cells):',
    initial: 25,
    validate: (value) => value > 0 && value <= 100,
  })
  return populationSizePrompt.run()
}

const generateWorld = (gridSize, populationSize) => {
  const minCoordinate = 1, maxCoordinate = gridSize
  const expectedPopulatedCells = Math.round(gridSize * gridSize * populationSize / 100)
  const populatedCells = new Set()
  for (let x = minCoordinate; x <= maxCoordinate && populatedCells.size < expectedPopulatedCells; x++) {
    for (let y = minCoordinate; y <= maxCoordinate && populatedCells.size < expectedPopulatedCells; y++) {
      const randomBoolean = Math.random() * 100 <= populationSize
      if (randomBoolean) {
        populatedCells.add(getCellId({x, y}))
      }
    }
  }
  const world = new Map()
  populatedCells.forEach(cellId => world.set(cellId, CELL_STATE.POPULATED))
  return world
}

const setupWorld = async() => {
  const gridSize = await askGridSize()
  const populationSize = await askPopulationSize()

  const world = generateWorld(gridSize, populationSize)
  console.log(`Generated random ${gridSize}x${gridSize} world with ${populationSize}% of populated cells!`)
  console.log(printWorld(world))
  return world
}

const runGame = async(world) => {
  let currentGeneration = world

  while ((await new Confirm({
    name: 'question',
    message: 'Continue to next generation?',
  }).run())) {
    const nextGeneration = getNextGenerationWithoutRecursion(currentGeneration)
    console.log(printWorld(nextGeneration))
    currentGeneration = nextGeneration
  }
}

console.log("=== Conway's Game of Life ===")
console.log("Welcome to Conway's Game of Life.")
console.log("Please answer a couple of questions so I can generate a random world and start the game.")

setupWorld()
  .then(runGame)
  .then(console.log('Goodbye!'))
  .catch(console.error)