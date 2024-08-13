// src/App.js
import React, { useState } from 'react'
import axios from 'axios'

import Navbar from './components/Navbar'
import PlaylistForm from './components/PlaylistForm'
import DisplayPanel from './components/DisplayPanel'
import RemovedTracks from './components/RemovedTracks'
import Footer from './components/Footer'

import './App.css'

const App = () => {
	const [spotifyUrl, setSpotifyUrl] = useState('')
	const [isValidUrl, setIsValidUrl] = useState(true)
	const [isProcessing, setIsProcessing] = useState(false)
	const [isComplete, setIsComplete] = useState(false)
	const [newSpotifyUrl, setNewSpotifyUrl] = useState('')
	const [removedTracks, setRemovedTracks] = useState([])

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
		const response = await axios.post(playlistLambdaUrl, {
			playlistUrl: spotifyUrl,
		})
	}

	const handleSubmit = () => {
		const isValidUrl = validateUrl(spotifyUrl)
		if (!isValidUrl) {
			console.log('Invalid URL submitted:', spotifyUrl)
			setIsValidUrl(false)
			return
		} else {
			setIsValidUrl(true)
			setIsProcessing(true)
			console.log('Valid URL submitted:', spotifyUrl)
			getSafePlaylistLink(spotifyUrl)
			// Placeholder for further processing logic
		}
	}

	return (
		<div className='app'>
			<Navbar />
			<PlaylistForm
				spotifyUrl={spotifyUrl}
				onUrlChange={handleUrlChange}
				onSubmit={handleSubmit}
				isValidUrl={isValidUrl}
			/>
			<DisplayPanel isProcessing={isProcessing} newSpotifyUrl={newSpotifyUrl} />
			<RemovedTracks />
			<Footer />
		</div>
	)
}

export default App
