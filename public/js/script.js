const renderContainer = document.querySelector('.content');

const app = {};

let timeoutHandler = null;
let paramObj = '';


app.route = (function () {
	const params = location.pathname.split('/');
	return params;

}());

app.init = function () {
	let root = this.route.length;

	if (root >= 3) {
		//deep link
		paramObj = {
			state: this.route[this.route.length - 2],
			id: this.route[this.route.length - 1]
		}

	} else {
		paramObj = {
			state: this.route[this.route.length - 1]
		}
	}


	if (paramObj.state === '') {
		this.setView('');
	} else {
		if (paramObj.state === 'about') {
			this.setActiveLink(document.querySelector('.nav a[data-href="about"]'));
			this.setView('about');
		} else {
			[...document.querySelectorAll('.nav a')].forEach(i => {
				i.classList.remove('active');
			});

			//deep linking TODO
			this.setView(paramObj.state, paramObj.id);

		}
	}
};

app.currentState = {};

app.pipe = {
	msMinute: function(millseconds) {
		var seconds = Math.floor(millseconds / 1000);
		var days = Math.floor(seconds / 86400);
		var hours = Math.floor((seconds % 86400) / 3600);
		var minutes = Math.floor(((seconds % 86400) % 3600) / 60);
		var timeString = '';


		if(days > 0) timeString += (days > 1) ? (days + " days ") : (days + " day ");
		if(hours > 0) timeString += (hours > 1) ? (hours + " hours ") : (hours + " hour ");
		if(minutes >= 0) timeString += (minutes > 1) ? (minutes + " minutes ") : (minutes + " minute ");
		return timeString;

	}
}

app.view = {
	search: function () {
		let optionsMarkup = (() => {
			let m = '';
			app.currentState.types.forEach(i => {
				m += `<option>${i}</option>`;
			});
			return m;
		})();

		let markup = `
			<div class="container">
				<h1>Need Music?</h1>
				<div class="lead">Use Spotify to listen music!</div>
				<form>
					<div class="form-group">
						<input type="text" class="form-control" placeholder="Search Music..." id="searchStr" name="searchStr">
					</div>
					<select class="query-select">${optionsMarkup}</select>
				</form>
				<div id="render"></div>
			</div>`;

		//render to view
		renderContainer.innerHTML = markup;

	},
	about: function () {
		let markup = `<div class="container">
		    ${app.currentState.title}
	    </div>`;

		//render to view

		renderContainer.innerHTML = markup;
	},
	track: function(data, eventLink) {

		const artistsMarkup = function (o) {
			if (o.artists) {
				let markup = `<h4>`;
				o.artists.forEach(function (i) {
					markup += `<span class="spacer"><a class="deep-link" href="/artist/${i.id}">${i.name}</a></span>`;
				});
				markup += '</h4>';
				return markup;
			}

			return '';
		};

		const albumImageMarkup = function (o) {
			if (o.album) {
				let markup = `<div><img class="album-thumb" src="${o.album.images[0].url}" alt=""></div>`;
				return markup;
			}
			return '';
		};


		let markup = `<div class="container">
			<div id="single" v-if="track">
				<header class="album-header">
					<div class="row">
						<div class="col-md-4">
						
							${albumImageMarkup(data)}
							
						</div>
						<div class="col-md-8">
						
							${artistsMarkup(data)}
							
							
							<h2>${data.name}</h2>
							<h5>Album Name: <a class="deep-link" href="/album/${data.album.id}">${data.album.name}</a></h5>
							<a href="${data.external_urls.spotify}" target="_blank" class="btn btn-primary">View In Spotify</a>
						</div>
					</div>
				</header>
			</div>
		</div>`;


		//render to view

		renderContainer.innerHTML = markup;
		eventLink();
	},
	artist: function(artist, album, eventLink) {
		const artistAlbum = function(j) {
			if(j.images.length) {
				return `<span><img src="${j.images[0].url}" class="artist-thumb img-circle" alt=""></span>`;
			}
			return '';
		};

		const artistGernes = function(l) {
			if (l.genres.length) {
				let markup = '<p>Genres: ';
				l.genres.forEach(function(gerne) {
					markup += `<span class="spacer">${gerne}</span>`
				});

				markup += '</p>';
				return markup;
			}

			return '';
		}

		const albumMarkup = function (o) {
			if (o) {
				let markup = '';
				o.forEach(function(album) {
					markup += `<div class="col-md-3 well">
						<div class="album">
							<img src="${album.images[0].url}" class="album-thumb img-thumbnail" alt="">
							<h4>${album.name}</h4>
							<a href="/album/${album.id}" class="deep-link btn btn-default btn-block">Album Details</a>
						</div>
					</div>`;



				});

				return markup;

			}
			return '';
		};

		let markup = `<div class="container">
			<div id="artist">
				<header class="artist-header clearfix">
					<h1>
						${artistAlbum(artist)}
						${artist.name}
					</h1>
					
					${artistGernes(artist)}
					
					<div class="col-md-3">
						<a href="/top-tracks/${artist.id}" class="deep-link btn btn-success">View all Tracks</a>
					</div>
				</header>
				
				<form id="albumFilter">
					<div class="form-group">
						<label class="control-label" for="inputDefault">Filter Album</label>
						<input type="text"name="albumFilter" class="form-control" id="inputDefault">
					</div>
				</form>
				
				<div class="artist-albums">
					<div class="row flexy">
						${albumMarkup(album.items)}
					</div>
				</div>
				
				
			</div>
		</div>`;


		//render to view

		renderContainer.innerHTML = markup;
		eventLink();
	},
	album: function(album, eventLink) {

		const artistsMarkup = function (o) {
			if (o.artists) {
				let markup = `<h4>`;
				o.artists.forEach(function (i) {
					markup += `<span class="spacer">${i.name}</span>`;
				});
				markup += '</h4>';
				return markup;
			}

			return '';
		};

		const forArtist = function(artists) {
			let markup = '';
			artists.forEach(artist => {
				markup += `<a href="/artist/${artist.id}"><span class="spacer">${artist.name}</span></a>`;
			});

			return markup;
		};

		const tracksMarkup = function(i) {
			let markup = '';
			i.forEach(track => {
				markup += `<div class="well">
						<h5>${track.track_number} - <a href="/track/${track.id}" class="deep-link">${track.name}</a></h5>
						<div>Artist: 
							${forArtist(track.artists)}
						</div>
						<a href="${track.preview_url}" target="_blank">Preview Track</a>

					</div>`;
			});

			return markup;
		}

		const albumImageMarkup = function (o) {
			if (o) {
				let markup = `<div><img class="album-thumb" src="${o.images[0].url}" alt=""></div>`;
				return markup;
			}
			return '';
		};

		let markup = `<div class="container">
			<div id="album">
				<header class="album-header">
					<div class="row">
						<div class="col-md-4">
							${albumImageMarkup(album)}
						</div>
						
						<div class="col-md-8">
							${artistsMarkup(album)}
							
							<h2>${album.name}</h2>
							<h5>Release Date: ${album.release_date}</h5>
							<a href="${album.external_urls.spotify}" target="_blank" class="btn btn-primary">View in Spotify</a>
						</div>
					</div>
				</header>
				
				<div class="album-tracks">
					<h2>Album Tracks</h2>
						<div>	
							${tracksMarkup(album.tracks.items)}
						</div>
				
				</div>
				
			</div>
		</div>`;


		//render to view

		renderContainer.innerHTML = markup;
		eventLink();
	},
	'top-tracks': function(track, artist, eventLink) {
		const artistAlbum = function(j) {
			if(j.images.length) {
				return `<div><img src="${j.images[0].url}" class="album-thumb" alt=""></div>`;
			}
			return '';
		};

		const tracksMarkup = function(i) {
			let markup = '';
			i.forEach(track => {
				markup += `<div class="well">
						<div class="row">
							<div class="col-md-2">
								<img src="${track.album.images[0].url}" class="album-thumb" alt="">
								<span>${track.album.name}</span>
								<br>
								<a href="/album/${track.album.id}" class="deep-link">View Album</a>
							</div>
							
							<div class="col-md-10">
								<h4>${track.name}</h4>
								<a href="${track.preview_url}" target="_blank" class="btn btn-primary">Preview Track</a>
								<div>${app.pipe.msMinute(track.duration_ms)} - Popularity: ${track.popularity}</div>
							</div>
						</div>
					</div>`;
			});

			return markup;
		}

		let markup = `<div class="container">
			<div id="track">
				<header class="album-header">
					<div class="row">
						<div class="col-md-4">
							${artistAlbum(artist)}
						</div>
						<div class="col-md-8">
							<h2>${artist.name}</h2>
							<h4>Follower: ${artist.followers.total}</h4>
							<h5>Popularity: ${artist.popularity}</h5>
							<a href="${artist.external_urls.spotify}" target="_blank" class="btn btn-primary">View Artist In Spotify</a>
						</div>
					</div>
				</header>
				
				
				<div class="album-tracks">
					<h2>Album Tracks</h2>
					<div>
						${tracksMarkup(track.tracks)}	
					</div>
				
				</div>
			</div>
			
		</div>`;


		//render to view

		renderContainer.innerHTML = markup;
		eventLink();
	}
}

app.setActiveLink = target => {
	[...document.querySelectorAll('.nav a')].forEach(i => {
		i.classList.remove('active');
	});
	target.classList.add('active');
};

app.setView = function (state, existence) {
	console.log('currentState: ' + state + ', id: ' + existence);
	// clear renderContainer
	renderContainer.innerHTML = '';

	//set view
	if (state === '') {

		// setFreshState to currentView
		this.currentState = this.state['search'];

		//setViewMarkup
		this.view.search();

		//clearEvent and setEvent
		this.event['search']();

		this.setTitle('ES6Spotify', 'Vanila JS');

	} else {

		//setFrestState to currentView
		this.currentState = this.state[state];

		//clearEvent and SetEvent - do ajax and callback as rerender - LIFECYCLE EMMITION?
		this.event[state](this.view[state],	this.event.routerLink, existence);

		//setTitle
		this.setTitle(state);

	}
};

app.setTitle = function (state, value = '') {
	document.querySelector('title').text = state + value;
};

app.pushHistory = function (state, page, url) {
	console.log(state, page, url);
	history.pushState(state, '', url);

	paramObj = state;

	//do navigation and set content
	this.setView(history.state.state);

}

app.ajax = ((url, cb) => {
	fetch(url)
		.then(res => res.json())
		.then(j => cb(j))
		.catch((err) => {

		})
	;
})

//app controller here
app.event = {
	routerLink() {
		[...document.querySelectorAll('.deep-link')].forEach(e=> {
			e.addEventListener('click', deepLinkBinder);
		})

	},
	reEnableRouterLink() {
		[...document.querySelectorAll('.deep-link')].forEach(e=> {
			e.removeEventListener('click', deepLinkBinder);
		});

		this.routerLink();
	},
	search: function () {
		//offevent

		function ajaxCalling(r) {
			//returned promised!!
			app.currentState.songs = r[app.currentState.queryType + 's'].items;

			//emit event
			let renderMarkup = '';

			app.currentState.songs.forEach(i => {
				let currentMark = app.render.search(i);
				renderMarkup += currentMark;
			});

			document.getElementById('render').innerHTML = renderMarkup;

			app.event.routerLink();


		}

		//event
		document.querySelector('#searchStr').addEventListener('keyup', (e) => {
			app.currentState.searchStr = e.target.value;
			timeoutHandler = setTimeout(() => {
				let url = `https://api.spotify.com/v1/search?query=${app.currentState.searchStr}&offset=0&limit=20&type=${app.currentState.queryType}&market=TW`;
				if (timeoutHandler !== null) clearTimeout(timeoutHandler);
				app.ajax(url, ajaxCalling);
			}, 1000)
		});

		document.querySelector('.query-select').addEventListener('change', (e)=> {
			app.currentState.queryType = e.target.value;
			let url = `https://api.spotify.com/v1/search?query=${app.currentState.searchStr}&offset=0&limit=20&type=${app.currentState.queryType}&market=TW`;
			app.ajax(url, ajaxCalling);
		})
	},
	about(cb, eventLink) {
		console.log('hit about event');
		cb();
		eventLink();
	},
	track(cb, eventLink, ex) {
		let id = '';
		(typeof ex !== 'undefined') ?  id = ex : 	id = history.state.id || '';

		console.log('hit track event');

		let url = `https://api.spotify.com/v1/tracks/${id}`;
		app.ajax(url, function(e) {
			if(e.error) {
				app.render.checkAjaxError(e.error.message);
				return false;
			};
			cb(e, eventLink);
		})

	},
	artist(cb, eventLink, ex)  {
		let id = '';
		(typeof ex !== 'undefined') ?  id = ex : 	id = history.state.id || '';

		console.log('hit artist event');

		let artistUrl = `https://api.spotify.com/v1/artists/${id}`;
		let albumsUrl = `https://api.spotify.com/v1/artists/${id}/albums`;
		let data = '';

		app.ajax(artistUrl, function(artist) {

			//errorCheck
			if(artist.error) {
				app.render.checkAjaxError(artist.error.message);
				return false;
			};

			app.ajax(albumsUrl, function(albums) {
				//fuck you callback hell
				data = albums.items;
				cb(artist, albums, eventLink);
			})

		});


		let markupFn = function(i) {
			return `<div class="col-md-3 well">
								<div class="album">
									<img class="album-thumb img-thumbnail" src="${i.images[0].url}" alt="">
									<h4>${i.name}</h4>
									<a href="/album/${i.id}" class="deep-link btn btn-default btn-block">Album Details</a>
								</div>
							</div>`;
		}
		let markupModel = '';

		renderContainer.addEventListener('keyup', function(e) {
			if (e.target && e.target.matches("#inputDefault")) {
				let value = e.target.value.trim();
				//clear items
				markupModel = '';

				//filtering
				if (value !== '') {
					data.forEach(function(item) {
						if(item.name.indexOf(value) > -1) {
							markupModel += markupFn(item);
						}
					});
				} else {
					data.forEach(function(item) {
						markupModel += markupFn(item);
					})
				}


				//append items
				document.querySelector('.flexy').innerHTML = markupModel;

				app.event.reEnableRouterLink();
			}

		});

	},
	album(cb, eventLink, ex) {
		let id = '';
		(typeof ex !== 'undefined') ?  id = ex : 	id = history.state.id || '';

		let albumsUrl = `https://api.spotify.com/v1/albums/${id}`;

		app.ajax(albumsUrl, function(album) {
				//fuck you callback hell

				//errorCheck
				if(album.error) {
					app.render.checkAjaxError(album.error.message);
					return false;
				};
				cb(album, eventLink);

		});
	},
	'top-tracks'(cb, eventLink, ex) {
		let id = '';
		(typeof ex !== 'undefined') ?  id = ex : 	id = history.state.id || '';

		console.log('hit top-tracks event');

		let artistUrl = `https://api.spotify.com/v1/artists/${id}`;
		let trackUrl = `https://api.spotify.com/v1/artists/${id}/top-tracks?country=TW`;

		app.ajax(artistUrl, function(artist) {
			//errorCheck
			if(artist.error) {
				app.render.checkAjaxError(artist.error.message);
				return false;
			};

			app.ajax(trackUrl, function(tracks) {
				//fuck you callback hell

				cb(tracks, artist, eventLink);
			});

		});


	},

};

app.render = {
	search: function (obj) {
		const genresMarkup = function (o) {
			if (o.genres) {
				let markup = `<div><strong>Genres: </strong>`;
				o.genres.forEach(function (i) {
					markup += `<span class="spacer">${i}</span>`;
				});

				markup += '</div>';
				return markup;
			}

			return '';
		};
		const artistsMarkup = function (o) {
			if (o.artists) {
				let markup = `<div><strong>Artists: </strong>`;
				o.artists.forEach(function (i) {
					markup += `<span class="spacer"><a class="deep-link" href="/artist/${i.id}">${i.name}</a></span>`;
				});
				markup += '</div>';
				return markup;
			}

			return '';
		};
		const albumMarkup = function (o) {
			if (o.album) {
				let markup = `<div><strong>Album: </strong><span class="spacer"><a a class="deep-link" href="/album/${o.album.id}">${o.album.name}</a></span></div>`;
				return markup;
			}
			return '';
		};


		let markup = `<div class="row">
					<div class="col-md-12">
						<div class="search-res well">
							<h4>
								<a class="deep-link" href="/${app.currentState.queryType}/${obj.id}">${obj.name}</a>
							</h4>
							
							${genresMarkup(obj)}
							${artistsMarkup(obj)}
							${albumMarkup(obj)}

						</div>
					</div>
					</div>`

		return markup;
	},
	checkAjaxError(msg) {
		let markup = `<div class="container">
				<h1>Error Occurs: ${msg}</h1>
			</div>`;

		renderContainer.innerHTML = markup;

	},
}

// view STORE
app.state = {
	search: {
		types: ['track', 'album', 'artist'],
		searchStr: '',
		songs: [],
		errorMsg: '',
		guidance: '',
		queryType: 'track'
	},
	about: {
		title: 'This is somethings from state'
	},
	track: {
		id: '',
		track: '',
		errorMsg: ''
	}
};


app.init();

//event handler
function deepLinkBinder(e) {
	e.preventDefault();
	let href = e.target.attributes.href.textContent;
	//push state and route
	const params = href.split('/');
	console.log(params);

	//event emmiter??

	app.pushHistory({
		state: params[1],
		id: params[2]
	}, params[1], ('/'+ params[1] + '/' + params[2]));
}

// //active binder
// [...document.querySelectorAll('.nav a')].forEach(t => {
// 	t.addEventListener('click', e => {
// 	})
// });

[...document.querySelectorAll('.router-link')].forEach(i => {
	i.addEventListener('click', function (e) {
		e.preventDefault();
		let id = e.target.dataset.href;
		// if innerstate is same as prev return
		app.setActiveLink(e.target);

		app.pushHistory({
			state: id
		}, id, ('/' + id));
	});
});


//history state
window.onpopstate = function (e) {
	let currentState = e.state;
	app.setView(currentState.state);
	if (currentState.state === '') {
		app.setActiveLink(document.querySelector('.nav a[data-href=""]'))
	} else if (currentState.state === 'about') {
		app.setActiveLink(document.querySelector('.nav a[data-href="about"]'))
	} else {
		[...document.querySelectorAll('.nav a')].forEach(e => {
			e.classList.remove('active');
		});
	}
}