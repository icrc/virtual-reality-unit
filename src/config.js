// General System Config
// 
// import { useStorage } from '@/libs/storage'
// import { dropboxStorage } from '@/libs/dropboxStorage'

export const VERSION = '0.0.1'

// storage
// TODO - make this work with Dropbox
// const storage = useStorage(dropboxStorage)
export const storage = {
	ready: false,
	load(filename) {

	},
	save(filename, data) {

	},
	pick() {

	}
}