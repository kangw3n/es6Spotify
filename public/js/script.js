/* eslint-disable no-console */
/* eslint-disable no-undef */
const renderContainer = document.querySelector('.content');

const app = {};

let timeoutHandler = null;

app.paramObj = '';

app.routeConfig = [
	{path: '', component: 'search', routeIndex: true},
	{path: '/about', component: 'about'},
	{path: '/track/:id', component: 'track'},
	{path: '/album/:id', component: 'album'},
	{path: '/artist/:id', component: 'artist'},
	{path: '/top-tracks/:id', component: 'top-tracks'}
];

app.route = () => location.pathname.split('/');

app.routeFn = {
	routeAvailableCheck(val) {
		let checking = false;
		app.routeConfig.forEach(e => {
			if (e.component === val) {
				checking = true;
			}
		});
		return checking;
	},
	isDeepLink() {
		return app.routeConfig.filter(e => {
			return e.path.indexOf('/:') > 0;
		});
	},
	filterProp(val, prop) {
		return app.routeConfig.filter(e => {
			return e[prop].indexOf(val) > 0;
		});
	},
	findIndexRoute() {
		let obj = null;
		app.routeConfig.forEach(e => {
			if (e.hasOwnProperty('routeIndex') && e.routeIndex) {
				obj = e;
			}
		});
		return obj;
	},
	checkDeepLink(val) { //check if deep link
		let deepLinkCheck = app.routeFn.isDeepLink();
		let status = false;

		deepLinkCheck.forEach(e => {
			if (e.component === val) status = true;
		});
		return status;
	},
	checkHome(val) {
		return val === '' ? app.routeFn.findIndexRoute().component : val;
	},
	getRouteUrl(val) {
		let value = null;

		app.routeConfig.forEach(e => {
			if (val === e.component) {
				value = e.path.split('/')[1];
			}
		});

		return value;
	}
};

app.init = function() {
	let root = this.route();
	console.log('new request made!');

	if (root.length >= 3) {
		//deep link
		this.paramObj = {
			state: root[1],
			id: root.slice(2)
		}

	} else {
		this.paramObj = {
			state: app.routeFn.checkHome(root[1])
		}
	}

	//check exists or return false
	if (!app.routeFn.routeAvailableCheck(app.paramObj.state)) {
		this.setView('404');
		return;
	}

	if (!app.routeFn.checkDeepLink(app.paramObj.state)) { //exitst??
		this.event.setActiveLink(document.querySelector('.nav a[data-href="' + app.paramObj.state + '"]'));
		this.setView(app.paramObj.state);
	} else {
		[...document.querySelectorAll('.nav a')].forEach(i => {
			i.classList.remove('active');
		});

		//deep linking TODO
		this.setView(app.paramObj.state, app.paramObj.id);

	}
};

app.currentState = {};

app.pipe = {
	msMinute: function (millseconds) {
		var seconds = Math.floor(millseconds / 1000);
		var days = Math.floor(seconds / 86400);
		var hours = Math.floor((seconds % 86400) / 3600);
		var minutes = Math.floor(((seconds % 86400) % 3600) / 60);
		var timeString = '';


		if (days > 0) timeString += (days > 1) ? (days + " days ") : (days + " day ");
		if (hours > 0) timeString += (hours > 1) ? (hours + " hours ") : (hours + " hour ");
		if (minutes >= 0) timeString += (minutes > 1) ? (minutes + " minutes ") : (minutes + " minute ");
		return timeString;

	},
	capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	},
	setTitle(value = '', optional = '') {
		return document.querySelector('title').text = 'ES6Spotify | ' + app.pipe.capitalizeFirstLetter(value) + ' ' + optional;
	}
};

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
          <div class="form-group">
            <label for="type">Select Type: </label>
            <select id="type" class="query-select form-control">${optionsMarkup}</select>
          </div>
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
	track: function (data, eventLink) {

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
              <figure>
                <figcaption>Listen to the ${data.name}:</figcaption>
                <audio
                    controls
                    src="${data.preview_url}">
                        Your browser does not support the
                        <code>audio</code> element.
                </audio>
              </figure>
						</div>
					</div>
				</header>
			</div>
		</div>`;


		//render to view

		renderContainer.innerHTML = markup;
		eventLink();
	},
	artist: function (artist, album, eventLink) {
		const artistAlbum = function (j) {
			if (j.images.length) {
				return `<span><img src="${j.images[0].url}" class="artist-thumb img-circle" alt=""></span>`;
			}
			return '';
		};

		const artistGernes = function (l) {
			if (l.genres.length) {
				let markup = '<p>Genres: ';
				l.genres.forEach(function (gerne) {
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
				o.forEach(function (album) {
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
	album: function (album, eventLink) {

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

		const forArtist = function (artists) {
			let markup = '';
			artists.forEach(artist => {
				markup += `<span class="spacer"><a href="/artist/${artist.id}" class="deep-link btn btn-link">${artist.name}</a></span>`;
			});

			return markup;
		};

		const tracksMarkup = function (i) {
			let markup = '';
			i.forEach(track => {
				markup += `<div class="card text-white bg-secondary mb-3">
            <h5 class="card-header">
              ${track.track_number} - <a href="/track/${track.id}" class="deep-link">${track.name}</a>
              ${forArtist(track.artists)}
            </h5>
            <div class="card-body">
              <figure class="flex">
                <figcaption>Listen to the ${track.name}:</figcaption>
                <audio
                    controls
                    src="${track.preview_url}">
                        Your browser does not support the
                        <code>audio</code> element.
                </audio>
              </figure>
            </div> 
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
	'top-tracks': function (track, artist, eventLink) {
		const artistAlbum = function (j) {
			if (j.images.length) {
				return `<div><img src="${j.images[0].url}" class="album-thumb" alt=""></div>`;
			}
			return '';
		};

		const tracksMarkup = function (i) {
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
	},
};

app.setView = function (state, existence) {
	console.log('currentView: ' + state + ', id: ' + existence);

	// clear renderContainer
	renderContainer.innerHTML = '';

	//try catch block to pass invalid view
	try {
		//setFrestState to currentView
		this.currentState = this.state[state];

		//clearEvent and SetEvent - do ajax and callback as rerender - LIFECYCLE EMMITION?
		this.event[state](this.view[state], this.event.routerLink, existence);

		//setTitle
		this.pipe.setTitle(state);

	} catch (err) {
		console.warn(err);
		this.currentState = parseInt(state);
		this.pipe.setTitle(state);
		this.render.checkAjaxError('404 Route Not Found!');

	}

};

app.pushHistory = function (state, page, url) {

  history.pushState(state, '', url);

  // if (state.component === history.state.component && !location.search) return; //TODO

  
  this.paramObj = state;

  if (location.search) return;

	//do navigation and set content
	this.setView(history.state.component);

};

app.ajax = ((url, cb) => {
	fetch(url, {
    headers: {
      'Authorization' :  'Bearer ' + window.accessToken
    }
  })
		.then(res => res.json())
		.then(j => cb(j))
});

//app controller here
app.event = {
	setActiveLink(target){
		[...document.querySelectorAll('.nav a')].forEach(i => {
			i.classList.remove('active');
		});
		if (target.dataset.href === '') {
			document.querySelector('.nav a[data-href=""]').classList.add('active');
			return;
		}
		target.classList.add('active');
	},
	routerLink() {
		[...document.querySelectorAll('.deep-link')].forEach(e => {
			e.addEventListener('click', deepLinkBinder);
		})

	},
	reEnableRouterLink() {
		[...document.querySelectorAll('.deep-link')].forEach(e => {
			e.removeEventListener('click', deepLinkBinder);
		});

		this.routerLink();
	},
	search(cb, eventLink) {
		//offevent
		cb();

		const ajaxCalling = r => {
			//emit event
			let renderMarkup = '';
			const render = document.getElementById('render');

			try {
				//returned promised!!
				app.currentState.songs = r[app.currentState.queryType + 's'].items;

				if (!app.currentState.songs.length) {
					render.innerHTML = `<h3>No Result Found </h3>`;
					return;
				}

				app.currentState.songs.forEach(i => {
					let currentMark = app.render.search(i);
					renderMarkup += currentMark;
				});

				render.innerHTML = renderMarkup;

				app.event.routerLink();

			} catch (err) {
				console.log(err);
				render.innerHTML = '';
			}


    };
    
    const ajaxHandler = () => {
      let url = `https://api.spotify.com/v1/search?query=${app.currentState.searchStr}&offset=0&limit=20&type=${app.currentState.queryType}&market=TW`;
      if (timeoutHandler !== null) clearTimeout(timeoutHandler);
      if (app.currentState.searchStr.trim() === '') {
        const render = document.getElementById('render');
        render.innerHTML = `<h3>No Query Value </h3>`;
        return;
      }
      app.ajax(url, ajaxCalling);
    };

    
    if (location.search) {
      const searchParams = new URLSearchParams(location.search);
      const searchValue = searchParams.get('search');
      document.getElementById('searchStr').value = searchValue;
      app.currentState.searchStr = searchValue;
      ajaxHandler();
    }

		//event
		document.querySelector('#searchStr').addEventListener('keyup', e => {
      app.currentState.searchStr = e.target.value;
			timeoutHandler = setTimeout(() => {
        app.pushHistory({
          component: 'search'
        }, 'Search', (`/?search=${app.currentState.searchStr}`));
        ajaxHandler();
			}, 1000);
		});

		document.querySelector('.query-select').addEventListener('change', e => {
      app.currentState.queryType = e.target.value;
      app.pushHistory({
        component: 'search'
      }, 'Search', (`/?search=${app.currentState.searchStr}`));
			ajaxHandler();
		});


    eventLink();
  
	},
	about(cb, eventLink) {
		cb();
		eventLink();
	},
	track(cb, eventLink, ex) {

		if (ex && ex.length > 1) {
			app.setView('404');
			return;
		}

		let id = '';
		(typeof ex !== 'undefined') ? id = ex[0] : id = history.state.id || '';

		app.currentState.id = id;

		let url = `https://api.spotify.com/v1/tracks/${id}`;
		app.ajax(url, function (e) {
			if (e.error) {
				app.render.checkAjaxError(e.error.message);
				app.currentState.errorMsg = e.error.message;
				return false;
			}
			;

			app.currentState.track = e;
			cb(e, eventLink);
		})

	},
	artist(cb, eventLink, ex)  {

		if (ex && ex.length > 1) {
			app.setView('404');
			return;
		}

		let id = '';
		(typeof ex !== 'undefined') ? id = ex[0] : id = history.state.id || '';

		let artistUrl = `https://api.spotify.com/v1/artists/${id}`;
		let albumsUrl = `https://api.spotify.com/v1/artists/${id}/albums`;
		let data = '';


		app.currentState.id = id;
		app.ajax(artistUrl, function (artist) {

			//errorCheck
			if (artist.error) {
				app.render.checkAjaxError(artist.error.message);
				app.currentState.errorMsg = artist.error.message;
				return false;
			}
			;

			app.currentState.artist = artist;

			app.ajax(albumsUrl, function (albums) {
				//fuck you callback hell
				data = albums.items;
				app.currentState.albums = albums.items;

				cb(artist, albums, eventLink);
			})

		});


		let markupFn = function (i) {
			return `<div class="col-md-3 well">
								<div class="album">
									<img class="album-thumb img-thumbnail" src="${i.images[0].url}" alt="">
									<h4>${i.name}</h4>
									<a href="/album/${i.id}" class="deep-link btn btn-default btn-block">Album Details</a>
								</div>
							</div>`;
		}
		let markupModel = '';

		renderContainer.addEventListener('keyup', function (e) {
			if (e.target && e.target.matches("#inputDefault")) {
				let value = e.target.value.trim();
				//clear items
				markupModel = '';

				app.currentState.term = value;

				//filtering
				if (value !== '') {
					data.forEach(function (item) {
						if (item.name.indexOf(value) > -1) {
							markupModel += markupFn(item);
						}
					});
				} else {
					data.forEach(function (item) {
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

		if (ex && ex.length > 1) {
			app.setView('404');
			return;
		}

		let id = '';
		(typeof ex !== 'undefined') ? id = ex[0] : id = history.state.id || '';

		let albumsUrl = `https://api.spotify.com/v1/albums/${id}`;

		app.ajax(albumsUrl, function (album) {
			//fuck you callback hell

			//errorCheck
			if (album.error) {
				app.render.checkAjaxError(album.error.message);
				return false;
			}
			;
			cb(album, eventLink);

		});
	},
	'top-tracks'(cb, eventLink, ex) {

		if (ex && ex.length > 1) {
			app.setView('404');
			return;
		}

		let id = '';
		(typeof ex !== 'undefined') ? id = ex[0] : id = history.state.id || '';

		app.currentState.id = id;

		let artistUrl = `https://api.spotify.com/v1/artists/${id}`;
		let trackUrl = `https://api.spotify.com/v1/artists/${id}/top-tracks?country=TW`;

		app.ajax(artistUrl, function (artist) {
			//errorCheck
			if (artist.error) {
				app.render.checkAjaxError(artist.error.message);
				app.currentState.errorMsg = artist.error.message;
				return false;
			}

			app.currentState.artist = artist;

			app.ajax(trackUrl, function (tracks) {
				//fuck you callback hell

				app.currentState.tracks = tracks;
				cb(tracks, artist, eventLink);
			});

		});


	},
};

app.render = {
	search(obj) {
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
						<div class="search-res card">
							<h4 class="card-header">
								<a class="deep-link" href="/${app.currentState.queryType}/${obj.id}">${obj.name}</a>
              </h4>
              
              <div class="card-body">
							
                ${genresMarkup(obj)}
                ${artistsMarkup(obj)}
                ${albumMarkup(obj)}
              </div>  

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
};

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
	},
	artist: {
		id: '',
		artist: '',
		albums: '',
		term: '',
		errorMsg: '',
	},
	album: {
		id: '',
		album: ''
	},
	'top-tracks': {
		id: '',
		tracks: '',
		artist: '',
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
	let ids = params.slice(2);
	let urlReturner = () => {
		let urlConcatenation = '';
		ids.forEach(e=>	urlConcatenation += ('/' + e));
		return '/' + params[1] + urlConcatenation;
	};

	app.pushHistory({
		component: params[1],
		id: params.slice(2)
	}, params[1], urlReturner());
}

[...document.querySelectorAll('.router-link')].forEach(i => {
	i.addEventListener('click', e => {
		e.preventDefault();
		let id = e.target.dataset.href;
		// if innerstate is same as prev return
		if (history.state && id === history.state.state) return false;

		app.event.setActiveLink(e.target);
		let url = app.routeFn.getRouteUrl(id) || '';

		app.pushHistory({
			component: id
		}, id, ('/' + url));
	});
});

//history state
window.onpopstate = e => {
  let currentState = e.state;

	if (currentState === null) { // if 1st time without any history
		let root = app.route();
		if (root.length >= 3) {
			//deep link
			currentState = {
				component: root[1],
				id: root.slice(2)
      };
			app.setView(currentState.component, currentState.id);

		} else {
			currentState = {
				component: app.routeFn.checkHome(root[1])
			};
			app.setView(currentState.component);
		}

	} else {
    app.setView(currentState.component);

	}

	if (!app.routeFn.checkDeepLink(currentState.component)) {
		app.event.setActiveLink(document.querySelector('.nav a[data-href="' + currentState.component + '"]'))
	} else {
		[...document.querySelectorAll('.nav a')].forEach(f => {
			f.classList.remove('active');
		});
	}
};

