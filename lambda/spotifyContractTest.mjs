import axios from 'axios'

const fail = (message) => {
	console.error(message)
	process.exitCode = 1
}

const skip = (message) => {
	console.log(message)
	process.exitCode = 0
}

const accessToken = process.env.SPOTIFY_CONTRACT_TEST_ACCESS_TOKEN
const playlistId = process.env.SPOTIFY_CONTRACT_TEST_PLAYLIST_ID

if (!accessToken || !playlistId) {
	skip(
		'SKIP: Set SPOTIFY_CONTRACT_TEST_ACCESS_TOKEN and SPOTIFY_CONTRACT_TEST_PLAYLIST_ID to run this Spotify response-format contract test.'
	)
} else {
	try {
		const url = `https://api.spotify.com/v1/playlists/${playlistId}/items?limit=1`
		const resp = await axios.get(url, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		})

		const data = resp?.data
		if (!data || typeof data !== 'object') fail('Expected JSON object response')
		if (!Array.isArray(data.items)) fail('Expected response.items to be an array')

		if (data.items.length === 0) {
			console.log('PASS: items array exists (empty)')
			process.exitCode = 0
		} else {
			const first = data.items[0]
			if (!first || typeof first !== 'object') fail('Expected first item to be an object')

			// Feb 2026: playlist item payload uses `item` (legacy may still include `track`).
			const payload = first.item ?? first.track
			if (!payload) fail('Expected item to include `.item` or legacy `.track`')
			if (typeof payload !== 'object') fail('Expected `.item`/`.track` payload to be an object')

			console.log('PASS: playlist items response format looks compatible')
			process.exitCode = 0
		}
	} catch (err) {
		const status = err?.response?.status
		const msg = err?.response?.data?.error?.message || err?.message
		fail(`FAIL: Spotify contract test request failed (${status || 'unknown status'}): ${msg}`)
	}
}
