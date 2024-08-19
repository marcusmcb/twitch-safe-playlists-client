import React from 'react'
import './style/PlaylistForm.css'

const PlaylistForm = ({
	spotifyUrl,
	onUrlChange,
	onSubmit,
	isValidUrl,
	isComplete,
}) => {
	return (
		<div className='playlist-form'>
			<h1>Twitch<sup>&copy;</sup> Safe Playlists</h1>
			<div className='line'></div>
			{isValidUrl === true ? (
				<p>
					Enter in your Spotify<sup>&copy;</sup> playlist link below to return a new playlist
					link that's free of <a href='https://www.twitch.tv/dj-signup#dj-music-catalog' target='_blank' rel='noopener noreferrer'>restricted artists</a> and safe for use in your next Twitch<sup>&copy;</sup> live-stream.
				</p>
			) : (
				<p>
					Please enter in a valid Spotify playlist link below in order to return
					your Twitch-safe playlist link.
				</p>
			)}

			<input
				type='text'
				value={spotifyUrl}
				onChange={(e) => onUrlChange(e.target.value)}
				placeholder='enter your Spotify playlist url here'
				className={!isValidUrl ? 'invalid' : ''}
			/>
			<button
				onClick={onSubmit}
				disabled={!isComplete}
				className={!isComplete ? 'disabled-button' : ''}
			>
				Get Safe Playlist
			</button>
		</div>
	)
}

export default PlaylistForm
