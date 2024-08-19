const AdditionalInfo = () => {
	return (
		<div className='additional-info'>
			{/* <h3>About This Site</h3>			 */}
			<div className="additional-info-line">
				<hr />
			</div>

			<p>
				Twitch<sup>&copy;</sup> recently unveiled its DJ program, which includes
				a list of "restricted artists" that DJs on the platform are prevented
				from playing in future live streams.
			</p>
			<p>
				DJs on the platform also often curate playlists via Spotify
				<sup>&copy;</sup> to use in their live streams.
			</p>
			<p>
				For DJs who do, this app will remove any artists found in the submitted
				playlist link that match against the "restricted artist" list provided
				by Twitch<sup>&copy;</sup>{' '}
				<a
					href='https://www.twitch.tv/dj-signup#dj-music-catalog'
					target='_blank'
					rel='noopener noreferrer'
				>
					here
				</a>
				.
			</p>
			<p>
				The app also removes anything not classified by Spotify<sup>&copy;</sup>{' '}
				as an individual song (podcast episodes, etc).
			</p>
			<p>
				The resulting playlist will be free of any "restricted artists" and
				non-music tracks for use in your next Twitch<sup>&copy;</sup> live
				stream.
			</p>
		</div>
	)
}

export default AdditionalInfo
