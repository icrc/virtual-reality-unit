// 'test' storage provider

let ready = false

import { alert, prompt } from "@/libs/popups"

import blastVimeo from "@/testdata/data-blast.json5"
import multiMP4 from "@/testdata/data-multi-mp4.json5"
import playthru from "@/testdata/data-playthru.json5"
import actionEvents from "@/testdata/data-actionevents.json5"
import layoutTest from "@/testdata/data-layouttest.json5"

const testData = {
	blastVimeo,
	multiMP4,
	playthru,
	actionEvents,
	layoutTest
}

const testStorage = {
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
		const fname = filename.trim()
		console.log(`Loading test data: ${fname}`)
		if (!testData[fname]) console.log("Data does not exist!")
		console.log(testData[fname])
		return structuredClone(testData[fname]) || null
	},
	save: async function save(filename, data) {
		console.log("saving data", filename)
		console.log(data)
		testData[filename] = { ...data }
		const msg = `Saved data from '${filename}':\n\n${JSON.stringify(data, null, 2)}`
		await alert(msg)
		return filename
	},
	pick: async function pick() {
		const fname = await prompt(`Which test data would you like to load?\n\n${Object.keys(testData).join("\n")}\n `)
		return typeof fname === "string" ? fname.trim() : null
	},
	chooseSaveFilename: async function chooseSaveFilename(suggestedFilename = "") {
		return await prompt("Enter a filename to save the data to:", suggestedFilename)
	},
}

export default testStorage
