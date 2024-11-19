// functions for dealing with storage providers (which are in ./storage)

export const useStorage = async provider => {
	if (!provider.ready) await provider.setup()
	if (!provider.ready) throw new Error(`Storage provider '${provider.name}' is not ready`)
	return provider
}