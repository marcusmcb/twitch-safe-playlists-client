// src/components/Footer.js
import React from 'react'
import './style/Footer.css' // We'll create this file for styling

const Footer = () => {
	const currentYear = new Date().getFullYear()

	return (
		<div className='footer'>
			<p>
				Built by MCB, {currentYear}.{' '}
				<a
					href='https://www.mcbportfolio.com'
					target='_blank'
					rel='noopener noreferrer'
				>
					Visit my portfolio
				</a>
			</p>
		</div>
	)
}

export default Footer
