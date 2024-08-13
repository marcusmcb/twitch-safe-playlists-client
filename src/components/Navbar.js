import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import { faSpotify } from '@fortawesome/free-brands-svg-icons'
import './style/Navbar.css'

const Navbar = () => {
	return (
		<div className='navbar'>
			<div className='navbar-item'>
				<FontAwesomeIcon className='navbar-icon' icon={faQuestionCircle} />
			</div>
			<div className='navbar-item'>
				<h1>Twitch Safe Playlists</h1>
			</div>
			<div className='navbar-item'>
				<FontAwesomeIcon className='navbar-icon' icon={faSpotify} />
			</div>
		</div>
	)
}

export default Navbar
