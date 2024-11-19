// General System Config
// 
import { useStorage } from '@/libs/storage'
// import { dropboxStorage } from '@/libs/storage/dropbox'
import { testStorage } from '@/libs/storage/test'

export const VERSION = '0.0.1'

// storage
// TODO - make this work with Dropbox
// const storage = useStorage(dropboxStorage)
// 

export const storage = await useStorage(testStorage)

