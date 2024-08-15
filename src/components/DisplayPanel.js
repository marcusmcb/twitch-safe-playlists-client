// src/components/DisplayPanel.js
import React from 'react'
import './style/DisplayPanel.css'

const DisplayPanel = ({ isProcessing, newSpotifyUrl }) => {
	return (
		<div className='display-panel'>
			<h3>Your new playlist link:</h3>
			{/* <div className='line'></div> */}
			{isProcessing ? (
				<p>Creating your Twitch safe playlist...</p>
			) : (
				newSpotifyUrl && (
					<a href={newSpotifyUrl} target='_blank' rel='noopener noreferrer'>
						{newSpotifyUrl}
					</a>
				)
			)}
		</div>
	)
}

export default DisplayPanel
