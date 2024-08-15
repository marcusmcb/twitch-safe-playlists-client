import React from 'react'
import './style/DisplayPanel.css'

// add animated elipsis or other loading element
// to run while isProcessing is true

// add horizontal lines throughout the UI
// as planned

// add footer with link to portfolio at bottom of App.js

// add logic to store original Spotify URL 
// as originalUrlDisplay

// add option to keep or remove invalid tracks

// add explainer pop-ups on hover for how
// the site functionality works

// add error response handler for the UI
// when API Gateway or Lambda function times out or fails

const DisplayPanel = ({
	isProcessing,
	newSpotifyUrl,
	removedTracks,
	invalidTracks,
}) => {
	return (
		<div className='display-panel'>
			<h3>Your new playlist link:</h3>
			{/* <div className='line'></div> */}
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
				<p>Creating your Twitch safe playlist...</p>
			) : (
				<p>Your new playlist link will appear here when ready.</p>
			)}
		</div>
	)
}

export default DisplayPanel
