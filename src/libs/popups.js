// popup forms/modals

// for showing info, getting info, confirming actions

// for now just wrapping browser equivalents, but can move to something nicer later

/**
 * Show an alert message
 *
 * @param      {String}     [message=undefined]  Message to show
 * @return     {undefined}  Returns nothing
 */
export const alert = async (message = undefined) => {
	return window.alert(message)
}

/**
 * Prompts user for an input value (string)
 *
 * @param      {String}         [message=undefined]       Message to show
 * @param      {String}         [defaultValue=undefined]  Default value
 * @return     {(String|Null)}  Entered value or null if cancelled
 */
export const prompt = async (message = undefined, defaultValue = undefined) => {
	return window.prompt(message, defaultValue)
}

/**
 * Show a confirmation prompt (with OK/Cancel)
 *
 * @param      {String}   [message=undefined]  Message to show
 * @return     {Boolean}  true - OK, false - Cancel
 */
export const confirm = async (message = undefined) => {
	return window.confirm(message)
}

