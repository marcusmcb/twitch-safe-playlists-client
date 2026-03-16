import axios from 'axios'
import restrictedArtists from './artistList.js'

const clientId = process.env.SPOTIFY_CLIENT_ID
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

export const handler = async (event) => {
	const body = JSON.parse(event.body)
	console.log('EVENT: ', event.body)
	console.log('PLAYLIST URL: ', body.playlistUrl)

	let fullTrackArray = []
	let restrictedTracks = []
	let trackUris = []
	let invalidTracks = []

	const getAccessToken = async () => {
		if (!clientId || !clientSecret || !refreshToken) {
			const err = new Error(
				'Missing Spotify credentials (SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET / SPOTIFY_REFRESH_TOKEN).'
			)
			err.statusCode = 500
			err.code = 'SPOTIFY_CONFIG_MISSING'
			throw err
		}

		try {
			const form = new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: refreshToken,
			})

			const response = await axios.post(
				'https://accounts.spotify.com/api/token',
				form.toString(),
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					auth: {
						username: clientId,
						password: clientSecret,
					},
				}
			)

			if (!response?.data?.access_token) {
				const err = new Error('Spotify token refresh succeeded but no access_token was returned.')
				err.statusCode = 502
				err.code = 'SPOTIFY_TOKEN_MISSING'
				throw err
			}

			return response.data.access_token
		} catch (error) {
			const spotifyError = error?.response?.data
			console.error('Error refreshing access token:', spotifyError || error)
			const err = new Error(
				spotifyError?.error_description ||
					spotifyError?.error?.message ||
					'Failed to refresh Spotify access token.'
			)
			err.statusCode = error?.response?.status || 502
			err.code = 'SPOTIFY_TOKEN_REFRESH_FAILED'
			throw err
		}
	}

	const extractPlaylistId = (url) => {
		const regex = /playlist\/([a-zA-Z0-9]+)/
		const match = url.match(regex)
		return match ? match[1] : null
	}

	const getSpotifyPlaylistTitle = async (accessToken, playlistId) => {
		try {
			const response = await axios.get(
				`https://api.spotify.com/v1/playlists/${playlistId}`,
				{
					headers: { Authorization: `Bearer ${accessToken}` },
				}
			)
			return response.data.name
		} catch (error) {
			console.error('Error fetching playlist title:', error)
			return 'playlist title unavailable'
		}
	}

	const getAllPlaylistTracks = async (accessToken, playlistId) => {
		let tracks = []
		// Feb 2026 change: playlist track endpoints renamed from /tracks to /items.
		// Also note: in Dev Mode, this endpoint is only available for playlists the user owns/collaborates on.
		// Limit max is 50.
		let next = `https://api.spotify.com/v1/playlists/${playlistId}/items?limit=50`

		while (next) {
			try {
				const response = await axios.get(next, {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				})
				tracks = tracks.concat(response.data.items)
				next = response.data.next
			} catch (error) {
				const status = error?.response?.status
				const spotifyMessage =
					error?.response?.data?.error?.message ||
					error?.response?.data?.error_description
				if (status === 403) {
					const err = new Error(
						spotifyMessage ||
							'Spotify denied access to playlist items. As of Feb 2026 (Dev Mode), playlist contents are only available for playlists the authorized user owns or collaborates on.'
					)
					err.statusCode = 403
					err.code = 'SPOTIFY_PLAYLIST_ITEMS_FORBIDDEN'
					throw err
				}
				const err = new Error(
					spotifyMessage || 'Failed to fetch playlist items from Spotify.'
				)
				err.statusCode = status || 502
				err.code = 'SPOTIFY_PLAYLIST_ITEMS_FETCH_FAILED'
				throw err
			}
		}
		return tracks
	}

	const createNewPlaylist = async (accessToken, playlistName) => {
		try {
			const response = await axios.post(
				// Feb 2026 change: POST /users/{user_id}/playlists removed; use POST /me/playlists
				`https://api.spotify.com/v1/me/playlists`,
				{
					name: playlistName,
					description: 'A playlist free of restricted artists',
					public: true,
				},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
						'Content-Type': 'application/json',
					},
				}
			)
			if (response.data.id) {
				console.log('New playlist created successfully!')
				console.log('-----------------------')
				console.log(response.data.external_urls.spotify)
				console.log('-----------------------')
			}
			return {
				playlistId: response.data.id,
				playlistUrl: response.data.external_urls.spotify,
			}
		} catch (error) {
			console.error('Error creating new playlist:', error)
			const err = new Error(
				error?.response?.data?.error?.message ||
					'Failed to create a new playlist on Spotify.'
			)
			err.statusCode = error?.response?.status || 502
			err.code = 'SPOTIFY_PLAYLIST_CREATE_FAILED'
			throw err
		}
	}

	const addTracksToPlaylist = async (accessToken, playlistId, trackUris) => {
		const batchSize = 50 // Spotify supports up to 100 per request; keep conservative to reduce request size.
		for (let i = 0; i < trackUris.length; i += batchSize) {
			const batch = trackUris.slice(i, i + batchSize)
			try {
				await axios.post(
					// Feb 2026 change: POST /playlists/{id}/tracks removed; use POST /playlists/{id}/items
					`https://api.spotify.com/v1/playlists/${playlistId}/items`,
					{
						uris: batch,
					},
					{
						headers: {
							Authorization: `Bearer ${accessToken}`,
							'Content-Type': 'application/json',
						},
					}
				)
				console.log(`Batch ${i / batchSize + 1} added successfully!`)
			} catch (error) {
				console.error(
					`Error adding batch ${i / batchSize + 1}:`,
					error.response?.data || error
				)
				const err = new Error(
					error?.response?.data?.error?.message ||
						'Failed to add items to the new Spotify playlist.'
				)
				err.statusCode = error?.response?.status || 502
				err.code = 'SPOTIFY_PLAYLIST_ADD_ITEMS_FAILED'
				throw err
			}
			await delay(1000)
		}
	}

	const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

	const getSafePlaylist = async (playlistUrl) => {
		const playlistId = extractPlaylistId(playlistUrl)
		if (!playlistId) {
			const err = new Error('Invalid Spotify playlist URL: could not extract playlist ID.')
			err.statusCode = 400
			err.code = 'PLAYLIST_ID_INVALID'
			throw err
		}

		console.log('Playlist ID:', playlistId)
		console.log('Fetching Spotify playlist items...')
		const accessToken = await getAccessToken()
		const playlistTitle = await getSpotifyPlaylistTitle(accessToken, playlistId)
		setTimeout(() => console.log('Playlist Title: ', playlistTitle), 1000)
		const items = await getAllPlaylistTracks(accessToken, playlistId)

		for (const playlistItem of items) {
			// Feb 2026 field rename: playlist items now use `item` (track/episode). Some responses may still include legacy `track`.
			const item = playlistItem?.item ?? playlistItem?.track
			if (!item) {
				invalidTracks.push({
					title: 'Unavailable item',
					artist: '',
					uri: null,
				})
				continue
			}

			// Treat non-track types as invalid for this app’s use-case (episodes, etc.)
			if (item.type && item.type !== 'track') {
				invalidTracks.push({
					title: item.name || 'Non-track item',
					artist: '',
					uri: item.uri || null,
				})
				continue
			}

			const originalArtistNames = (item.artists || []).map((artist) =>
				artist?.name !== null && artist?.name !== undefined ? artist.name : null
			)
			const artistNames = (item.artists || []).map((artist) =>
				artist?.name !== null && artist?.name !== undefined
					? artist.name.toLowerCase()
					: null
			)
			const isRestricted = artistNames
				.filter(Boolean)
				.some((artist) =>
					restrictedArtists.map((ra) => ra.toLowerCase()).includes(artist)
				)

			if (isRestricted) {
				const trackEntry = {
					title: item.name,
					artist: originalArtistNames.filter(Boolean).join(', '),
				}
				restrictedTracks.push(trackEntry)
				console.log(
					'Restricted Track:',
					item.name,
					'by',
					artistNames.filter(Boolean).join(', ')
				)
				console.log('-----------------------')
				continue
			}

			// validate URI and log invalid ones
			const uri = item.uri
			if (typeof uri === 'string' && uri.startsWith('spotify:track:')) {
				const trackEntry = {
					title: item.name,
					artist: artistNames.filter(Boolean).join(', '),
					spotify_url: item.external_urls?.spotify,
				}
				fullTrackArray.push(trackEntry)
				trackUris.push(uri)
			} else {
				console.log('Invalid URI:', uri)
				invalidTracks.push({
					title: item.name,
					artist: artistNames.filter(Boolean).join(', '),
					uri: uri,
				})
			}

			// delay before the next request
			await delay(1)
		}

		if (invalidTracks.length > 0) {
			console.log('Found invalid URIs:')
			console.log('-----------------------')
			invalidTracks.forEach((track) => {
				console.log(`Track: ${track.title} by ${track.artist}, URI: ${track.uri}`)
			})
		}

		if (restrictedTracks.length === 0 && invalidTracks.length === 0) {
			console.log('No restricted tracks found!')
			// return response
		} else {
			// createNewPlaylist
			// addTracksToPlaylist
			// return response
		}

		// create a new playlist
		const newPlaylistData = await createNewPlaylist(
			accessToken,
			'(SAFE) ' + playlistTitle
		)

		// add the safe tracks to the new playlist
		await addTracksToPlaylist(
			accessToken,
			newPlaylistData.playlistId,
			trackUris
		)

		console.log('Original Playlist Length: ', items.length)
		console.log('Clean Track Array: ', fullTrackArray.length)
		console.log('Restricted Track Array: ', restrictedTracks.length)
		console.log('Invalid Track Array: ', invalidTracks.length)
		console.log('New Playlist URL:', newPlaylistData.playlistUrl)
		return newPlaylistData.playlistUrl
	}

	try {
		const newUrl = await getSafePlaylist(body.playlistUrl)
		return {
			statusCode: 200,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'Content-Type',
				'Access-Control-Allow-Methods': 'OPTIONS,POST',
			},
			body: JSON.stringify({
				url: newUrl,
				removed_tracks: restrictedTracks,
				invalid_tracks: invalidTracks,
			}),
		}
	} catch (error) {
		console.error('Lambda handler error:', error)
		return {
			statusCode: error?.statusCode || 500,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'Content-Type',
				'Access-Control-Allow-Methods': 'OPTIONS,POST',
			},
			body: JSON.stringify({
				code: error?.code || 'UNKNOWN_ERROR',
				message:
					error?.message ||
					'An unexpected error occurred while processing the playlist.',
				removed_tracks: restrictedTracks,
				invalid_tracks: invalidTracks,
			}),
		}
	}
}
