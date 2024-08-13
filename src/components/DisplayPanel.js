import React from 'react'
import './style/DisplayPanel.css'

const DisplayPanel = ({ isProcessing, newSpotifyUrl }) => {
	return (
		<div className='display-panel'>
			{newSpotifyUrl !== '' ? (
				<a href={newSpotifyUrl} target='_blank' rel='noopener noreferrer'>
					{newSpotifyUrl}
				</a>
			) : isProcessing ? (
				<p>Creating your Twitch safe playlist...</p>
			) : (
				<p>Your new playlist link will appear here.</p>
			)}
		</div>
	)
}

export default DisplayPanel
