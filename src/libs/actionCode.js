// functions for dealing with actionCode (parsing and running)

const getBaseCommands = state => ({
  setStateValue: (key, val) => state[key] = val,
  deleteStateValue: key => delete state[key],
})


export const runCode = (actionCode, initialState, commandLibrary = {}) => {
  const state = structuredClone(initialState)
  const commands = { ...getBaseCommands(state),...commandLibrary }
  let bailed = false
  console.log(actionCode)
  for (const { command, args } of parser(actionCode, state)) {
    if (!commands[command]) throw new Error(`Unknown actionCode command: ${command}`)
    const result = commands[command](...args)
    if (result === null) {
      bailed = true
      break
    }
  }
  return { newState: state, bailed }
}

export function* parser(code, state) {
  const c = code.trim()
  if (!c) return

  const lines = c.split("\n").map(line => line.trim())

  for (let line of lines) {
    const [command, argString] = line.split(":").map(part => part.trim())
    const args = splitArgs(argString)
    yield { command, args: args.map(arg => getArgValue(arg, state)) }
  }

}

function getArgValue(expression, state) {
  window.__tmpActionCode__ = structuredClone(state)
  const xp = expression.replace(/@([a-zA-Z]*)/g, 'window.__tmpActionCode__["$1"]')
  return eval(xp)
}

function splitArgs(allArgsStr) {
  return allArgsStr
    .split(/,(.*)/)
    .map(x => x.trim())
    .filter(x => x)
}




// TODO - getArgValue above is potentially VERY unsage - consider mobing to a safeEval function
// See - https://stackoverflow.com/a/37154736

