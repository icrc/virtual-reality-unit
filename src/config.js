// General System Config
//
import { useStorage } from "@/libs/storage"
// import { dropboxStorage } from '@/libs/storage/dropbox'
import { testStorage } from "@/libs/storage/test"

export const VERSION = "0.0.1"

export const VIDEO_SOURCE_TYPES = {
	vimeo: { id: "vimeo", name: "Vimeo", features: { getChapters: true } },
	mp4: { id: "mp4", name: "MP4", features: {} },
}
export const DEFAULT_VIDEO_SOURCE_TYPE = "vimeo"

// storage
// TODO - make this work with Dropbox
// const storage = useStorage(dropboxStorage)
//

export const storage = await useStorage(testStorage)
