import React from 'react'
import './style/DisplayPanel.css'

// add horizontal lines throughout the UI
// as planned

// add footer with link to portfolio at bottom of App.js

// add logic to store original Spotify URL
// as originalUrlDisplay

// add option to keep or remove invalid tracks

// add explainer pop-ups on hover for how
// the site functionality works

const DisplayPanel = ({
	isProcessing,
	newSpotifyUrl,
	removedTracks,
	invalidTracks,
	hasError,
}) => {
	return (
		<div className='display-panel'>
			<h3>Your new playlist link:</h3>
			{newSpotifyUrl !== '' ? (
				<div className='new-spotify-url'>
					{removedTracks.length + invalidTracks.length > 0 ? (
						<a href={newSpotifyUrl} target='_blank' rel='noopener noreferrer'>
							{newSpotifyUrl}
						</a>
					) : (
						<>
							Your original playlist link contains no restricted artists or
							invalid tracks.
						</>
					)}
				</div>
			) : isProcessing ? (
				<p>
					Creating your Twitch<sup>&copy;</sup> safe playlist
					<span className='dots'>
						<span>.</span>
						<span>.</span>
						<span>.</span>
					</span>
				</p>
			) : hasError ? (
				<>It appears something went wrong. Try it again with another playlist link.</>
			) : (
				<p>Your new playlist link will appear here when ready.</p>
			)}
		</div>
	)
}

export default DisplayPanel
