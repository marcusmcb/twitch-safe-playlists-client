// src/App.js
import React, { useEffect, useMemo, useState } from 'react'
import PlaylistForm from './components/PlaylistForm'
import DisplayPanel from './components/DisplayPanel'
import RemovedTracks from './components/RemovedTracks'
import AdditionalInfo from './components/AdditionalInfo'
import {
	clearStoredAuth,
	getStoredAccessToken,
	handleSpotifyOAuthCallback,
	startSpotifyLogin,
} from './lib/spotifyAuth'
import './App.css'

const App = () => {
	const [spotifyUrl, setSpotifyUrl] = useState('')
	const [newSpotifyUrl, setNewSpotifyUrl] = useState('')
	const [isValidUrl, setIsValidUrl] = useState(true)
	const [isProcessing, setIsProcessing] = useState(false)
	const [hasError, setHasError] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [isComplete, setIsComplete] = useState(true)
	const [removedTracks, setRemovedTracks] = useState([])
	const [invalidTracks, setInvalidTracks] = useState([])
	const [viewInfoPanel, setViewInfoPanel] = useState(false)
	const [accessToken, setAccessToken] = useState(() => getStoredAccessToken())

	const redirectUri = useMemo(() => {
		// Use the same page as redirect target to avoid adding routes.
		return `${window.location.origin}${window.location.pathname}`
	}, [])

	const backendUrl = useMemo(() => {
		const url = process.env.REACT_APP_BACKEND_URL
		return url && url.trim() ? url.trim() : null
	}, [])

	const validateUrl = (url) => {
		const spotifyUrlPattern =
			/^https:\/\/open.spotify.com\/playlist\/[a-zA-Z0-9]+(\?.*)?$/
		return spotifyUrlPattern.test(url)
	}

	const handleUrlChange = (url) => {
		setSpotifyUrl(url)
	}

	useEffect(() => {
		// If we just returned from Spotify OAuth, exchange the code for an access token.
		const run = async () => {
			try {
				const token = await handleSpotifyOAuthCallback({ redirectUri })
				if (token) {
					setAccessToken(token)
				}
			} catch (err) {
				console.error('Spotify OAuth callback failed:', err)
				setHasError(true)
				setErrorMessage(err?.message || 'Spotify sign-in failed. Please try again.')
			}
		}
		run()
	}, [redirectUri])

	const connectSpotify = async () => {
		setHasError(false)
		setErrorMessage('')
		await startSpotifyLogin({ redirectUri })
	}

	const disconnectSpotify = () => {
		clearStoredAuth()
		setAccessToken(null)
	}

	const getSafePlaylistLink = async (spotifyUrl) => {
		if (!backendUrl) {
			throw new Error(
				'Missing REACT_APP_BACKEND_URL. Set it to your API Gateway/Lambda endpoint and redeploy.'
			)
		}

		try {
			const headers = {
				'Content-Type': 'application/json',
			}
			if (accessToken) {
				headers.Authorization = `Bearer ${accessToken}`
				headers['X-Spotify-Access-Token'] = `Bearer ${accessToken}`
			}

			const resp = await fetch(backendUrl, {
				method: 'POST',
				headers,
				body: JSON.stringify({ playlistUrl: spotifyUrl }),
			})

			const data = await resp.json().catch(() => ({}))
			if (!resp.ok) {
				const message = data?.message || 'Failed to create safe playlist.'
				const err = new Error(message)
				err.status = resp.status
				err.code = data?.code
				throw err
			}

			setRemovedTracks(Array.isArray(data?.removed_tracks) ? data.removed_tracks : [])
			setInvalidTracks(Array.isArray(data?.invalid_tracks) ? data.invalid_tracks : [])
			if (!data?.url) {
				throw new Error('Backend succeeded but returned no playlist URL.')
			}
			return data.url
		} catch (err) {
			if (err?.status === 401 && accessToken) {
				disconnectSpotify()
				throw new Error('Your Spotify session expired. Please connect Spotify again.')
			}
			throw err
		}
	}

	const handleSubmit = async () => {
		setHasError(false)
		setErrorMessage('')
		setIsProcessing(false)
		setIsComplete(false)
		setRemovedTracks([])
		setInvalidTracks([])
		setNewSpotifyUrl('')
		const isValidUrl = validateUrl(spotifyUrl)
		if (!isValidUrl) {
			setIsValidUrl(false)
			setIsComplete(true)
			return
		} else {
			setIsValidUrl(true)
			setIsProcessing(true)
			try {
				const newUrl = await getSafePlaylistLink(spotifyUrl)
				setNewSpotifyUrl(newUrl)
				setSpotifyUrl('')
			} catch (err) {
				console.error('Error creating safe playlist:', err)
				setHasError(true)
				setErrorMessage(
					err?.message ||
					'It appears something went wrong. Try it again with another playlist link.'
				)
			} finally {
				setIsProcessing(false)
				setIsComplete(true)
			}
		}
	}

	return (
		<div className='app'>
			<div className='main-container'>
				<div className='left-panel'>
					<PlaylistForm
						spotifyUrl={spotifyUrl}
						onUrlChange={handleUrlChange}
						onSubmit={handleSubmit}
						isAuthed={Boolean(accessToken)}
						onConnect={connectSpotify}
						onDisconnect={disconnectSpotify}
						isValidUrl={isValidUrl}
						isComplete={isComplete}
						setViewInfoPanel={setViewInfoPanel}
					/>
					<DisplayPanel
						isProcessing={isProcessing}
						newSpotifyUrl={newSpotifyUrl}
						removedTracks={removedTracks}
						invalidTracks={invalidTracks}
						hasError={hasError}
						errorMessage={errorMessage}
					/>
				</div>
				{viewInfoPanel ? (
					<div className='right-panel'>
						<AdditionalInfo />
					</div>
				) : (
					<div className='right-panel'>
						<RemovedTracks
							removedTracks={removedTracks}
							invalidTracks={invalidTracks}
							newSpotifyUrl={newSpotifyUrl}
						/>
					</div>
				)}
			</div>
			<div>
				<div className='footer'>
					Built by{' '}
					<a
						href='https://www.mcbportfolio.com/#/contact'
						target='_blank'
						rel='noopener noreferrer'
					>
						MCB
					</a>
				</div>
			</div>
		</div>
	)
}

export default App
