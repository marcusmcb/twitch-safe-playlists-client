// src/App.js
import React from 'react'
import Navbar from './components/Navbar'
import PlaylistForm from './components/PlaylistForm'
import DisplayPanel from './components/DisplayPanel'
import RemovedTracks from './components/RemovedTracks'
import Footer from './components/Footer'
import './App.css'

const App = () => {
	return (
		<div className='app'>
			<Navbar />
			<PlaylistForm />
			<DisplayPanel />
			<RemovedTracks />
			<Footer />
		</div>
	)
}

export default App
