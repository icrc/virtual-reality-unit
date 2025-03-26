export default ({ getCurrentScene, announceDone }) => ({

	gotoScene(id) {
		announceDone({ nextSceneId: id })
		return null // bail on any more commands
	},

	setNextScene(id) {
		const scene = getCurrentScene()
		scene.nextSceneId = id
	},

	gotoNextScene() {
		const scene = getCurrentScene()
		if (scene.nextSceneId === -1) return // do nothing if no next scene
		announceDone({ nextSceneId: scene.nextSceneId })
		return null // bail on any more commands
	},

})
