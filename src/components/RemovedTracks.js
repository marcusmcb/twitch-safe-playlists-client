import React from 'react'
import './style/RemovedTracks.css'

const RemovedTracks = ({ removedTracks, invalidTracks, newSpotifyUrl }) => {
	return (
		<div className='removed-tracks'>
			<div className='songs-removed-title'>
				{newSpotifyUrl !== '' ? (
					removedTracks.length + invalidTracks.length > 0 ? (
						<>Songs Removed ({removedTracks.length + invalidTracks.length}):</>
					) : (
						<>No Songs Removed</>
					)
				) : (
					<></>
				)}
			</div>
			<div className='line'></div>
			{newSpotifyUrl !== '' ? (
				<h3>
					{removedTracks.length > 0
						? 'Restricted Artists Found:'
						: 'No restricted artists found'}
				</h3>
			) : (
				<></>
			)}
			<ul>
				{removedTracks.map((track, index) => (
					<li key={index}>
						{index + 1}. {track.title} - {track.artist}
					</li>
				))}
			</ul>
			{newSpotifyUrl !== '' ? (
				<h3 className='invalid-tracks'>
					{invalidTracks.length > 0
						? 'Invalid Tracks Found:'
						: 'No invalid tracks detected'}
				</h3>
			) : (
				<></>
			)}
			<ul>
				{invalidTracks.map((track, index) => (
					<li key={index}>
						{index + 1}. {track.artist} - {track.title}
					</li>
				))}
			</ul>
		</div>
	)
}

export default RemovedTracks
