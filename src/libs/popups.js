// popup forms/modals

// for showing info, getting info, confirming actions

import AlertBoxManager from '@/libs/alertBox'

/**
 * Show an alert message
 *
 * @param      {String}         [message=undefined]  Message to show
 * @return     {Promise<void>}  Returns nothing
 */
export const alert = async (message = undefined) => {
	return await AlertBoxManager.alert(message)
}

/**
 * Prompts user for an input value (string)
 *
 * @param      {String}                  [message=undefined]       Message to show
 * @param      {String}                  [defaultValue=undefined]  Default value
 * @return     {Promise<(String|null)>}  Entered value or null if cancelled
 */
export const prompt = async (message = undefined, defaultValue = undefined) => {
	//return window.prompt(message, defaultValue)
	return await AlertBoxManager.prompt(message, defaultValue)
}

/**
 * Show a confirmation prompt (with OK/Cancel)
 *
 * @param      {String}   [message=undefined]  Message to show
 * @return     {Promise<Boolean>}  true - OK, false - Cancel
 */
export const confirm = async (message = undefined) => {
	return await AlertBoxManager.confirm(message)
}

