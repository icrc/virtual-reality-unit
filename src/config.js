// General System Config

import { useStorage } from "@/libs/storage"

import storageProvider from '@/libs/storage/uploadDownload'

export const VERSION = "0.0.1"

export const VIDEO_SOURCE_TYPES = {
	vimeo: {
		id: "vimeo",
		name: "Vimeo",
		features: {
			getChapters: async tech => {
				const data = await tech.getChapters()
				return data.map(({ startTime, title }, idx, arr) => ({
					title: title || `Chapter ${idx + 1}`,
					startTime,
					endTime: idx === arr.length - 1 ? -1 : arr[idx + 1].startTime,
				}))
			},
		},
	},
	mp4: { id: "mp4", name: "MP4", features: {} },
}

export const DEFAULT_VIDEO_SOURCE_TYPE = "vimeo"

// storage
export const storage = await useStorage(storageProvider)
