export const extractPlaylistId = (url) => {
	if (typeof url !== 'string') return null
	const regex = /playlist\/([a-zA-Z0-9]+)/
	const match = url.match(regex)
	return match ? match[1] : null
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
