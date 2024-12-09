// functions for dealing with storage providers (which are in ./storage)

/**
 * Set up and return a storage provider
 *
 * @param      {Object}  provider  The provider
 * @return     {Object}  The provider, ready to be used
 */
export const useStorage = async provider => {
	if (!provider.ready) await provider.setup()
	if (!provider.ready) throw new Error(`Storage provider '${provider.name}' is not ready`)
	return provider
}