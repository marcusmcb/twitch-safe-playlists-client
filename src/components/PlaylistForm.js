// src/components/PlaylistForm.js
import React from 'react'
import './style/PlaylistForm.css' // We'll create this file for styling

const PlaylistForm = () => {
	return (
		<div className='playlist-form'>
			<div className='form-row'>
				<p>Paste your original Spotify link into the field below</p>
			</div>
			<div className='form-row'>
				<input
					type='text'
					placeholder='enter your Spotify link here'
					className='playlist-input'
				/>
			</div>
			<div className='form-row'>
				<button className='submit-button'>Submit</button>
			</div>
		</div>
	)
}

export default PlaylistForm
