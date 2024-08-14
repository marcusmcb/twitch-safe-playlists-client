import React from 'react'
import './style/PlaylistForm.css'

const PlaylistForm = ({ spotifyUrl, onUrlChange, onSubmit, isValidUrl, isComplete }) => {
	return (
		<div className='playlist-form'>
			<div className='form-row'>
				{isValidUrl === true ? (
					<p>Paste your original Spotify link into the field below</p>
				) : (
					<p>Please enter a valid Spotify URL</p>
				)}
			</div>
			<div className='form-row'>
				<input
					type='text'
					placeholder='enter your Spotify link here'
					className='playlist-input'
					value={spotifyUrl}
					onChange={(e) => onUrlChange(e.target.value)}
				/>
			</div>
			<div className='form-row'>
				<button className='submit-button' onClick={onSubmit} disabled={!isComplete}>
					Submit
				</button>
			</div>
		</div>
	)
}

export default PlaylistForm
