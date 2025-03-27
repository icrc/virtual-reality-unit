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
    if (!commands[command]) throw new Error(`Unknown actionCode command: ${command}`)
    let result
    if (isAsyncFunction(commands[command])) {
      result = await commands[command](...args)
    } else {
      result = commands[command](...args)
    }
    if (result === null) {
      bailed = true
      break
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
  const c = typeof code=="string" ? code.trim() : ''
  if (!c) return

  const lines = c.split("\n").map(line => line.trim())

  for (let line of lines) {
    const [command, argString] = line.split(":").map(part => part.trim())
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
  const xp = expression.replace(/@([a-zA-Z]*)/g, `window.${TEMP_VAR_NAME}["$1"]`)
  try {
    return eval(xp)
  } catch (e) {
    return `Error in expression: ${expression}`
  }
}

/**
 * Splits and trims arguments from string (comma separated, trimming too).
 *
 * @param      {String}    allArgsStr  All arguments string
 * @return     {String[]}  array of arguments (strings ready to be evaluated)
 */
function splitArgs(allArgsStr) {
  // BEWARE - we will have issues with commas inside args - so this should be avoided
  return allArgsStr
    .split(/,(.*)/)
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

// TODO - getArgValue above is potentially VERY unsage - consider mobing to a safeEval function
// See - https://stackoverflow.com/a/37154736
