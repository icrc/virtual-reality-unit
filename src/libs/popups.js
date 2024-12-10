// popup forms/modals

// for showing info, getting info, confirming actions

// for now just wrapping browser equivalents, but can move to something nicer later

export const alert = async (message = undefined) => {
	return window.alert(message)
}

export const prompt = async (message = undefined, defaultValue = undefined) => {
	return window.prompt(message, defaultValue)
}

export const confirm = async (message = undefined) => {
	return window.confirm(message)
}

