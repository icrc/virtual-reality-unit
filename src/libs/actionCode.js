// functions for dealing with actionCode (parsing and running)

const TEMP_VAR_NAME = "__tmpActionCode__"

/**
 * Gets the base commands.
 *
 * @param      {Object}  state   The state - passed in so commands have access.
 */
const getBaseCommands = state => ({
  setStateValue: (key, val) => (state[key] = val),
  deleteStateValue: key => delete state[key],
})

/**
 * Runs some action code - command by command.
 *
 * @param      {String}  actionCode           The action code - commands (separated by \n)
 * @param      {Object}  initialState         The initial system state
 * @param      {Object}  [commandLibrary={}]  Command library of additional available ({ commandName: Function })
 * @return     {Promise<(Object)>}  { newState: final state after running commands, bailed: boolean to determine if any terminating
 *                       commands ran - ones that return null}
 */
export const runCode = async (actionCode, initialState, commandLibrary = {}) => {
  const state = structuredClone(initialState)
  const commands = { ...getBaseCommands(state), ...commandLibrary }
  let bailed = false
  for (const { command, args } of parser(actionCode, state)) {
    const parsedCommand = parseCommandProbability(command)
    if (!commands[parsedCommand.command]) throw new Error(`Unknown actionCode command: ${parsedCommand.command}`)
    let result
    // probablistically run command
    let c = Math.random()
    if (c < parsedCommand.probability) {
      if (isAsyncFunction(commands[parsedCommand.command])) {
        result = await commands[parsedCommand.command](...args)
      } else {
        result = commands[parsedCommand.command](...args)
      }
      if (result === null) {
        bailed = true
        break
      }
    }
  }
  return { newState: state, bailed }
}

/**
 * Parses passed actionCode, yields parsed commands with their arguments.
 *
 * @param      {String}  code    The code to parse
 * @param      {Object}  state   The current state (needed so we can reference state values in expressions)
 * @return     {Object}  Yields objects: { command: 'commandName', args: [] }
 */
export function* parser(code, state) {
  const c = typeof code == "string" ? code.trim() : ""
  if (!c) return

  const lines = c
    .split("\n")
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("//"))

  for (let line of lines) {
    const [command, argString] = splitCommandAndArgs(line).map(part => part.trim())
    const args = argString && splitArgs(argString)
    yield { command, args: args ? args.map(arg => getArgValue(arg, state)) : [] }
  }
}

/**
 * Gets the value of an argument.
 *
 * @param      {String}  expression  The expression to evaluate
 * @param      {Object}  state       The current state (so we can retrieve values)
 * @return     {any}     The argument value
 */
function getArgValue(expression, state) {
  window[TEMP_VAR_NAME] = structuredClone(state)
  const expr = "" + expression
  const xp = expr.replace(/@([a-zA-Z]*)/g, `window.${TEMP_VAR_NAME}["$1"]`)
  try {
    return eval(xp)
  } catch (e) {
    return `Error in expression: ${expression}`
  }
}

// TODO - getArgValue above is potentially VERY unsage - consider mobing to a safeEval function
// See - https://stackoverflow.com/a/37154736

/**
 * Splits and trims arguments from string (comma separated, trimming too).
 *
 * @param      {String}    allArgsStr  All arguments string
 * @return     {String[]}  array of arguments (strings ready to be evaluated)
 */
function splitArgs(allArgsStr) {
  return allArgsStr
    .split(/,([^,]*)/g)
    .map(x => x.trim())
    .filter(x => x)
}

/**
 * Determines whether the specified function is asynchronous function.
 *
 * @param      {Function}  func    The function
 * @return     {boolean}   True if the specified function is asynchronous function, False otherwise.
 */
function isAsyncFunction(func) {
  return func.constructor.name === "AsyncFunction"
}

/**
 * Parse a command name with a probability
 *
 * @param      {string}  input   The input command string (may or may not have a probability in square brackets after it)
 * @return     {Object}  { command, probaility }
 */
function parseCommandProbability(input) {
  // This pattern has two parts:
  // 1. Capturing the command before any brackets
  // 2. Optionally capturing any probability value inside brackets
  const pattern = /^([^\[\]]+)(?:\[([0-1](?:\.\d+)?|)\])?$/
  const match = input.match(pattern)

  if (!match) {
    throw new Error("Invalid format. Expected 'command' or 'command[probability]' or 'command[]'")
  }

  const command = match[1].trim()

  // If there's no second match group or it's an empty string, default to 1
  const probability = match[2] && match[2] !== "" ? parseFloat(match[2]) : 1

  return { command, probability }
}

/**
 * Splits command and arguments.
 *
 * @param      {string}   input   The input
 * @return     {array}  [command, args]
 */
const splitCommandAndArgs = input => {
  const colonIndex = input.indexOf(":")
  return colonIndex === -1 ? [input, ""] : [input.substring(0, colonIndex), input.substring(colonIndex + 1)]
}
