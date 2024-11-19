// 'test' storage provider

let ready = false

import blastVimeo from '@/testdata/data-blast.json'
import multiMP4 from '@/testdata/data-multi-mp4.json'

const testData = {
	blastVimeo,
	multiMP4
}

export const testStorage = {
	name: "Test Storage",
	get ready() {
		return ready
	},
	setup: async function setup() {
		console.log("Setting up test storage provider...")
		ready = true
		return true
	},
	load: async function load(filename) {
		console.log(`Loading test data: ${filename}`)
		if (!testData[filename]) console.log('Data does not exist!')
		console.log(testData[filename])
		return testData[filename] || null
	},
	save: async function save(filename, data) {},
	pick: async function pick() {
		return prompt(`Which test data would you like to load? (${Object.keys(testData).join(", ")})`)
	},
}
