// functions for dealing with actionCode (mainly parsing)

export function* parser(code, state) {
  const c = code.trim()
  if (!c) return

  const lines = c.split("\n").map(line => line.trim())

  for (let line of lines) {
    const [action, argString] = line.split(":").map(part => part.trim())
    const args = splitArgs(argString)
    yield { action, args: args.map(arg => getArgValue(arg, state)) }
  }

  // yield {action: 'test1', args: [1, 2]}
  // yield {action: 'test2', args: [3, 4, 5]}
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

// export async function* parser(code, state) {
//  const c = code.trim()
//  if (!c) return

//  const lines = c.split("\n").map(line => line.trim())

//  for (let line of lines) {
//    const [action, argString] = line.split(":").map(part => part.trim())
//    const args = await Promise.all(splitArgs(argString).map(async arg => await getArgValue(arg, state)))
//    yield { action, args }
//  }

//  // yield {action: 'test1', args: [1, 2]}
//  // yield {action: 'test2', args: [3, 4, 5]}
// }

// async function getArgValue(expression, state) {

// }

// function splitArgs(allArgsStr) {
//  return allArgsStr
//    .split(/,(.*)/)
//    .map(x => x.trim())
//    .filter(x => x)
// }
