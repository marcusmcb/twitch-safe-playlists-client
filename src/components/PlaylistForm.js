import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import './style/PlaylistForm.css'

const PlaylistForm = ({
	spotifyUrl,
	onUrlChange,
	onSubmit,
	isAuthed,
	onConnect,
	onDisconnect,
	isValidUrl,
	isComplete,
	setViewInfoPanel,
}) => {

	const handleIconClick = () => {		
		setViewInfoPanel(prevState => !prevState)
	}

	return (
		<div className='playlist-form'>
			<div className='playlist-form-title'>
				<h1>
					Twitch<sup>&copy;</sup> Safe Playlists
					<FontAwesomeIcon
					icon={faQuestionCircle}
					className="info-icon"
					onClick={handleIconClick}
				/>
				</h1>				
			</div>

			{isValidUrl === true ? (
				<div>
					<p>
						Enter in your Spotify<sup>&copy;</sup> playlist link below to return
						a new playlist link that's free of{' '}
						<a
							href='https://www.twitch.tv/dj-signup#dj-music-catalog'
							target='_blank'
							rel='noopener noreferrer'
						>
							restricted artists
						</a>{' '}
						and safe for use in your next Twitch<sup>&copy;</sup> live-stream.
					</p>
				</div>
			) : (
				<p>
					Please enter in a valid Spotify<sup>&copy;</sup> playlist link below
					in order to return your Twitch<sup>&copy;</sup> safe playlist link.
				</p>
			)}

			<input
				type='text'
				value={spotifyUrl}
				onChange={(e) => onUrlChange(e.target.value)}
				placeholder='enter your Spotify playlist url'
				className={!isValidUrl ? 'invalid' : ''}
			/>
			<div style={{ marginTop: '12px' }}>
				<p style={{ marginBottom: '6px' }}>
					To use a playlist you don’t own without connecting Spotify, make the
					 playlist <strong>collaborative</strong> and invite{' '}
					<strong>TwitchSafePlaylists</strong> as a collaborator.
				</p>
				<p style={{ marginTop: 0 }}>
					If your playlist is private or not collaborative, click “Connect
					 Spotify” first.
				</p>
			</div>
			<div style={{ marginTop: '10px' }}>
				{isAuthed ? (
					<button type='button' onClick={onDisconnect}>
						Disconnect Spotify
					</button>
				) : (
					<button type='button' onClick={onConnect}>
						Connect Spotify (optional)
					</button>
				)}
			</div>
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
