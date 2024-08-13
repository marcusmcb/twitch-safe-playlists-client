// src/components/DisplayPanel.js
import React from 'react'
import './style/DisplayPanel.css' 

const DisplayPanel = ({ url }) => {
	return (
		<div className='display-panel'>
			{url ? (
				<a href={url} target='_blank' rel='noopener noreferrer'>
					{url}
				</a>
			) : (
				<p>Creating your Twitch safe playlist...</p>
			)}
		</div>
	)
}

export default DisplayPanel
