
let alertBoxComponent

function setComponent(component) {
	alertBoxComponent = component
}

function alert(message) {
	return alertBoxComponent.alert(message)
}

function confirm(message) {
	return alertBoxComponent.confirm(message)
}

function prompt(message, defaultValue = undefined) {
	return alertBoxComponent.prompt(message, defaultValue)
}

export default {
	setComponent,
	alert,
	confirm,
	prompt
}