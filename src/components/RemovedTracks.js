// src/components/RemovedTracks.js
import React from 'react'
import './style/RemovedTracks.css'

const RemovedTracks = ({ removedTracks }) => {
	return (
		<div className='removed-tracks'>
			<div className='songs-removed-title'>Songs Removed: </div>
			<div className='line'></div>
			<h3>Restricted Artists:</h3>
			<ul>
				{removedTracks.map((track, index) => (
					<li key={index}>
						{index + 1}. {track.title} - {track.artist}
					</li>
				))}
			</ul>
			<h3 className='invalid-tracks'>Invalid Tracks:</h3>
			<ul>{/* Map over invalid tracks in the same way */}</ul>
		</div>
	)
}

export default RemovedTracks
