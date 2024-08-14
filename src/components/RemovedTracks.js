// src/components/RemovedTracks.js
import React from 'react'
import './style/RemovedTracks.css'

const RemovedTracks = ({ removedTracks }) => {
	return (
		<div className='removed-tracks'>
			<h2>Removed Tracks</h2>
			{removedTracks.length > 0 ? (
				<ul>
					{removedTracks.map((track, index) => (
						<li key={index}>
							{track.title} by {track.artist}
						</li>
					))}
				</ul>
			) : (
				<></>
			)}
		</div>
	)
}

export default RemovedTracks
