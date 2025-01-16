// simple library for using URL compression sites

/**
 * API for the is.gd url shortener
 *
 * @type       {Object}
 */
export const IS_GD = {
	name: "is.gd",
	async shorten(url) {
		let res
		try {
			res = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`)
			if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
			res = await res.json()
			return res.errorcode ? [null, res.errormessage] : [res.shorturl]
		} catch (error) {
			return [null, error.message]
		}
	},
}

/**
 * Create a URL shortener function
 *
 * @param      {Object}    helper  The helper API
 * @return     {Function}  { description_of_the_return_value }
 */
export const urlShortener = helper => async url => {
	const [shortenedURL, error] = await helper.shorten(url)
	if (!shortenedURL) console.log(`Error whilst shortening URL with '${helper.name}':`, error)
	return shortenedURL
}

export default urlShortener(IS_GD)
