import React from 'react'
import './style/Footer.css'

const Footer = () => {
	const currentYear = new Date().getFullYear()

	return (
		<div className='footer'>
			<p>
				<a
					href='https://www.mcbportfolio.com'
					target='_blank'
					rel='noopener noreferrer'
				>
					Built by MCB, {currentYear}.{' '}
				</a>
			</p>
		</div>
	)
}

export default Footer
