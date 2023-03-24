const wait = require('../src/wait')
const process = require('process')
const cp = require('child_process')
const path = require('path')

test('throws invalid number', async () => {
  await expect(wait('foo')).rejects.toThrow('milliseconds not a number')
})

test('wait 500 ms', async () => {
  const start = new Date()
  await wait(500)
  const end = new Date()
  const delta = Math.abs(end - start)
  expect(delta).toBeGreaterThanOrEqual(500)
})

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env.INPUT_MILLISECONDS = 100
  const ip = path.join(process.cwd(), './src/index.js')
  const result = cp.execSync(`node ${ip}`, { env: process.env }).toString()
  console.log(result)
})
