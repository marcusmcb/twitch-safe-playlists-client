import { sleep } from './spotifyUtils'

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

class SpotifyApiError extends Error {
	constructor(message, { status, body, url }) {
		super(message)
		this.name = 'SpotifyApiError'
		this.status = status
		this.body = body
		this.url = url
	}
}

const spotifyFetch = async (accessToken, url, options = {}) => {
	const resp = await fetch(url, {
		...options,
		headers: {
			...(options.headers || {}),
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
		},
	})

	const text = await resp.text()
	let body
	try {
		body = text ? JSON.parse(text) : null
	} catch {
		body = text
	}

	if (!resp.ok) {
		const spotifyMessage = body?.error?.message || body?.error_description
		throw new SpotifyApiError(spotifyMessage || 'Spotify API request failed.', {
			status: resp.status,
			body,
			url,
		})
	}

	return body
}

export const getPlaylistTitle = async (accessToken, playlistId) => {
	const playlist = await spotifyFetch(
		accessToken,
		`${SPOTIFY_API_BASE}/playlists/${playlistId}`
	)
	return playlist?.name || 'playlist title unavailable'
}

export const getAllPlaylistItems = async (accessToken, playlistId) => {
	let items = []
	let nextUrl = `${SPOTIFY_API_BASE}/playlists/${playlistId}/items?limit=50`

	while (nextUrl) {
		const page = await spotifyFetch(accessToken, nextUrl)
		items = items.concat(page?.items || [])
		nextUrl = page?.next
	}

	return items
}

export const createPlaylist = async (accessToken, { name, description, isPublic }) => {
	const data = await spotifyFetch(accessToken, `${SPOTIFY_API_BASE}/me/playlists`, {
		method: 'POST',
		body: JSON.stringify({
			name,
			description,
			public: Boolean(isPublic),
		}),
	})

	return {
		id: data?.id,
		url: data?.external_urls?.spotify,
	}
}

export const addItemsToPlaylist = async (accessToken, playlistId, uris) => {
	const batchSize = 100
	for (let i = 0; i < uris.length; i += batchSize) {
		const batch = uris.slice(i, i + batchSize)
		await spotifyFetch(accessToken, `${SPOTIFY_API_BASE}/playlists/${playlistId}/items`, {
			method: 'POST',
			body: JSON.stringify({ uris: batch }),
		})
		await sleep(250)
	}
}

export const isSpotifyUnauthorized = (err) => {
	return err?.name === 'SpotifyApiError' && err?.status === 401
}

export const toUserFacingSpotifyError = (err) => {
	if (err?.name === 'SpotifyApiError') {
		if (err.status === 403) {
			return (
				err.message ||
				"Spotify denied access. If this is a playlist you don't own, ask the owner to make it collaborative or use a playlist you own."
			)
		}
		return err.message || 'Spotify API error.'
	}
	return err?.message || 'Unexpected error while calling Spotify.'
}
