// 'Library' of actions that we can perform (other than the standard internal actionCode ones - setStateValue, deleteStateValue)

import { alert } from "@/libs/popups"
import { downloadCSV } from "@/libs/csv"

export default ({ getCurrentScene, announceDone, videoJS, blockChoiceActive, timedChoiceActive }) => ({

	// Go directly to a scene (specified by id)
	gotoScene(id) {
		announceDone({ nextSceneId: id })
		return null // bail on any more commands
	},

	// Set the id of the scene that will be moved to when the current scene ends
	setNextScene(id) {
		const scene = getCurrentScene()
		scene.nextSceneId = id
	},

	// Go directly to the scene currently specified as the current scene's "nextSceneId"
	gotoNextScene() {
		const scene = getCurrentScene()
		if (scene.nextSceneId === -1) return // do nothing if no next scene
		announceDone({ nextSceneId: scene.nextSceneId })
		return null // bail on any more commands
	},

	// Show a popup message (supports Markdown)
	async showMessage(message) {
		const needStopStart = !blockChoiceActive() && !timedChoiceActive() && !videoJS.paused()
		if (needStopStart) videoJS.pause()
		await alert(message)
		if (needStopStart) videoJS.play()
	},

	// download some data (CSV format)
	downloadData(...rowStrings) {
		const rows = rowStrings.map(row => row.split('|'))
		downloadCSV(rows, null, 'data.csv')
	}

})
