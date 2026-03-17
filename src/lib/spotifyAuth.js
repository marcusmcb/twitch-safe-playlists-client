const STORAGE_KEYS = {
	verifier: 'tsp_spotify_pkce_verifier',
	state: 'tsp_spotify_oauth_state',
	accessToken: 'tsp_spotify_access_token',
	expiresAt: 'tsp_spotify_expires_at_ms',
}

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'

export const SPOTIFY_SCOPES = [
	'playlist-read-private',
	'playlist-read-collaborative',
	'playlist-modify-public',
	'playlist-modify-private',
]

export const getSpotifyClientId = () => {
	const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID
	return clientId && clientId.trim() ? clientId.trim() : null
}

const base64UrlEncode = (arrayBuffer) => {
	const bytes = new Uint8Array(arrayBuffer)
	let binary = ''
	for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

const sha256 = async (plain) => {
	const encoder = new TextEncoder()
	const data = encoder.encode(plain)
	return crypto.subtle.digest('SHA-256', data)
}

const randomString = (length) => {
	const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
	const randomValues = crypto.getRandomValues(new Uint8Array(length))
	let result = ''
	for (let i = 0; i < randomValues.length; i++) {
		result += charset[randomValues[i] % charset.length]
	}
	return result
}

export const getStoredAccessToken = () => {
	const accessToken = sessionStorage.getItem(STORAGE_KEYS.accessToken)
	const expiresAtRaw = sessionStorage.getItem(STORAGE_KEYS.expiresAt)
	const expiresAt = expiresAtRaw ? Number(expiresAtRaw) : null
	if (!accessToken || !expiresAt) return null
	// small skew to avoid edge-of-expiry failures
	if (Date.now() > expiresAt - 10_000) return null
	return accessToken
}

export const clearStoredAuth = () => {
	sessionStorage.removeItem(STORAGE_KEYS.accessToken)
	sessionStorage.removeItem(STORAGE_KEYS.expiresAt)
	sessionStorage.removeItem(STORAGE_KEYS.verifier)
	sessionStorage.removeItem(STORAGE_KEYS.state)
}

export const startSpotifyLogin = async ({ redirectUri }) => {
	const clientId = getSpotifyClientId()
	if (!clientId) {
		throw new Error(
			'Missing REACT_APP_SPOTIFY_CLIENT_ID. Add it to your build environment and redeploy the client.'
		)
	}

	const state = randomString(32)
	const verifier = randomString(64)
	const challenge = base64UrlEncode(await sha256(verifier))

	sessionStorage.setItem(STORAGE_KEYS.state, state)
	sessionStorage.setItem(STORAGE_KEYS.verifier, verifier)

	const params = new URLSearchParams({
		response_type: 'code',
		client_id: clientId,
		redirect_uri: redirectUri,
		scope: SPOTIFY_SCOPES.join(' '),
		state,
		code_challenge_method: 'S256',
		code_challenge: challenge,
	})

	window.location.assign(`${SPOTIFY_AUTH_URL}?${params.toString()}`)
}

export const handleSpotifyOAuthCallback = async ({ redirectUri }) => {
	const url = new URL(window.location.href)
	const code = url.searchParams.get('code')
	const returnedState = url.searchParams.get('state')
	const error = url.searchParams.get('error')

	if (error) {
		clearStoredAuth()
		throw new Error(`Spotify authorization failed: ${error}`)
	}

	if (!code) return null

	const expectedState = sessionStorage.getItem(STORAGE_KEYS.state)
	const verifier = sessionStorage.getItem(STORAGE_KEYS.verifier)
	if (!expectedState || !verifier || !returnedState || expectedState !== returnedState) {
		clearStoredAuth()
		throw new Error('Spotify authorization state mismatch. Please try connecting again.')
	}

	const clientId = getSpotifyClientId()
	if (!clientId) {
		clearStoredAuth()
		throw new Error(
			'Missing REACT_APP_SPOTIFY_CLIENT_ID. Add it to your build environment and redeploy the client.'
		)
	}

	const body = new URLSearchParams({
		grant_type: 'authorization_code',
		code,
		redirect_uri: redirectUri,
		client_id: clientId,
		code_verifier: verifier,
	})

	const resp = await fetch(SPOTIFY_TOKEN_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: body.toString(),
	})

	const data = await resp.json().catch(() => ({}))
	if (!resp.ok) {
		clearStoredAuth()
		const message = data?.error_description || data?.error || 'Token exchange failed.'
		throw new Error(`Spotify token exchange failed: ${message}`)
	}

	const accessToken = data?.access_token
	const expiresIn = data?.expires_in
	if (!accessToken || !expiresIn) {
		clearStoredAuth()
		throw new Error('Spotify token exchange succeeded but returned no access token.')
	}

	const expiresAt = Date.now() + Number(expiresIn) * 1000
	sessionStorage.setItem(STORAGE_KEYS.accessToken, accessToken)
	sessionStorage.setItem(STORAGE_KEYS.expiresAt, String(expiresAt))

	// cleanup OAuth transient state and remove code/state from the URL
	sessionStorage.removeItem(STORAGE_KEYS.state)
	sessionStorage.removeItem(STORAGE_KEYS.verifier)
	url.searchParams.delete('code')
	url.searchParams.delete('state')
	url.searchParams.delete('error')
	window.history.replaceState({}, document.title, url.toString())

	return accessToken
}
