// simple library for using URL compression sites

/**
 * API for the is.gd url shortener
 *
 * @type       {Object}
 */
const IS_GD = {
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
 * API for the v.gd url shortener
 *
 * @type       {Object}
 */
const V_GD = {
	name: "v.gd",
	async shorten(url) {
		let res
		try {
			res = await fetch(`https://v.gd/create.php?format=json&url=${encodeURIComponent(url)}`)
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
 * @param      {Object}    helpers  The helper APIs to try
 * @return     {Function}  { description_of_the_return_value }
 */
export const urlShortener = (...helpers) => async url => {
	let shortenedURL, error
	for (const helper of helpers) {
		console.log(`Attempting to shorten URL with '${helper.name}`)
		;[shortenedURL, error] = await helper.shorten(url)
		if (shortenedURL) break
	}
	if (!shortenedURL) console.log(`Error whilst shortening URL`)
	return shortenedURL
}

export default urlShortener(V_GD, IS_GD)
