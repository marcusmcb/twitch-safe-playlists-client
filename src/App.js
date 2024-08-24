// src/App.js
import React, { useState } from 'react'
import axios from 'axios'
import PlaylistForm from './components/PlaylistForm'
import DisplayPanel from './components/DisplayPanel'
import RemovedTracks from './components/RemovedTracks'
import AdditionalInfo from './components/AdditionalInfo'
import './App.css'

const App = () => {
	const [spotifyUrl, setSpotifyUrl] = useState('')
	const [newSpotifyUrl, setNewSpotifyUrl] = useState('')
	const [isValidUrl, setIsValidUrl] = useState(true)
	const [isProcessing, setIsProcessing] = useState(false)
	const [hasError, setHasError] = useState(false)
	const [isComplete, setIsComplete] = useState(true)
	const [removedTracks, setRemovedTracks] = useState([])
	const [invalidTracks, setInvalidTracks] = useState([])
	const [viewInfoPanel, setViewInfoPanel] = useState(false)

	const playlistLambdaUrl =
		'https://z0mo4en8c9.execute-api.us-west-2.amazonaws.com/production/playlist'

	const validateUrl = (url) => {
		const spotifyUrlPattern =
			/^https:\/\/open.spotify.com\/playlist\/[a-zA-Z0-9]+$/
		return spotifyUrlPattern.test(url)
	}

	const handleUrlChange = (url) => {
		setSpotifyUrl(url)
	}

	const getSafePlaylistLink = async (spotifyUrl) => {
		try {
			const response = await axios.post(
				playlistLambdaUrl,
				{ playlistUrl: spotifyUrl },
				{ headers: { 'Content-Type': 'application/json' } }
			)

			if (response) {
				console.log('Response:', response.data)
				setNewSpotifyUrl(response.data.url)
				setRemovedTracks(response.data.removed_tracks)
				setInvalidTracks(response.data.invalid_tracks)
			}
		} catch (error) {
			console.error('Error getting safe playlist link:', error)
			setIsProcessing(false)
			setHasError(true)
		}
	}

	const handleSubmit = async () => {
		setHasError(false)
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
			await getSafePlaylistLink(spotifyUrl).then(() => {
				setSpotifyUrl('')
				setIsComplete(true)
			})
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
