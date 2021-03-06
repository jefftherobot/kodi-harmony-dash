const DashButton = require('dash-button');
const harmony = require('harmonyhubjs-client');
const kodi = require('kodi-ws');
const exec = require('child_process').exec;
const filter = require("lodash.filter");


const DASH_BUTTON_MAC_ADDRESS_GREEN = '40:b4:cd:ba:25:f3';
const DASH_BUTTON_MAC_ADDRESS_RED = '18:74:2e:dd:0d:ed';
const HARMONY_IP_ADDRESS = '192.168.0.242';
const KODI_IP_ADDRESS = '192.168.0.205';

//const HARMONY_IP_ADDRESS = '192.168.0.118'; //Rec Room
//const KODI_IP_ADDRESS = '192.168.0.128'; //Rec Room

let button_green = new DashButton(DASH_BUTTON_MAC_ADDRESS_GREEN);
let button_red= new DashButton(DASH_BUTTON_MAC_ADDRESS_RED);

button_green.addListener(async () => {
	playTvShow('Teen Titans Go!');
});

button_red.addListener(async () => {
	playTvShow('Blaze and the Monster Machines');
});

function playTvShow(tvshowTitle){
	//First turn kodi activity on and start pinging it
	tvOnOff();
	pingKodi(()=>{
		console.log('====> Kodi is alive!!')
		buildPlaylist(tvshowTitle)
	});
}

function buildPlaylist(tvshowTitle){

	kodi(KODI_IP_ADDRESS, 9090).then(function (connection) {
		//First get tvshowid of lable
		return connection.VideoLibrary.GetTVShows()
			.then(function(data) {
				let tvshow = filter(data.tvshows, function(item) { return item.label===tvshowTitle })

				return tvshow[0].tvshowid;

			}).then(function(id){
				return connection.VideoLibrary.GetEpisodes({ 
					'tvshowid': id, //teen titans go! 
					'limits': { 
						'start' : 0, 
						'end': 10 }, 
					'sort': { 
						'order': 'ascending', 
						'method': 'random'} 
					})
				})
				.then(function(data) {

					console.log(data.episodes)

					return stopAllActivePlayers(connection).then(function() {

						return connection.Playlist.Clear({playlistid:1}).then(function(){
							return Promise.all(data.episodes.map(function(episode) { console.log(episode)
								return connection.Playlist.Add({playlistid:1, item:{episodeid:episode.episodeid}})
								}))
							.then(function(e){ 
									return connection.Player.Open({item: { playlistid: 1 }})
								/*return connection.Playlist.GetItems({playlistid:1}).then(function(items){
									console.log(items)
								})*/
							})

						})

					})

			})

		

	}).catch(function(e) {
		/* Handle errors */
		if(e.stack) {
			console.error(e.stack);
		} else {
			console.error(e);
		}
	}).then(function() {
		/* Finally exit this process */
		//process.exit();
	});

}


function tvOnOff(){
	harmony(HARMONY_IP_ADDRESS)
		.then(function(harmonyClient) {
			harmonyClient.isOff()
				.then(function(off) {
					if(off) {
						console.log('Currently off. Turning TV on.')

						harmonyClient.getActivities()
							.then(function(activities) {
								activities.some(function(activity) {
									if(activity.label === 'Watch Kodi') {
										var id = activity.id
										harmonyClient.startActivity(id)
										harmonyClient.end()
										return true
									}
									return false
								})
							})
					} else {
						harmonyClient.end()
						return true
						//console.log('Currently on. Turning TV off')
						//harmonyClient.turnOff()
						//harmonyClient.end()
					}
				})
		})
}

/* Utility function to stop all active players of a kodi instance */
function stopAllActivePlayers(connection) {
	return connection.Player.GetActivePlayers().then(function(players) {
		/* Stop everything thats playing */
		return Promise.all(players.map(function(player) {
			return connection.Player.Stop(player.playerid);
		}));
	});
}


function pingKodi(cb){
	new ping(KODI_IP_ADDRESS,(e)=>{
		if(e){
			return console.log('====> Fail');
		}
		return cb();
	})
}


function ping (host,cb){
	(function pinghost(host){exec('ping -c 1 -n '+host,(e,stdOut,stdErr)=>{
		if(e) {
			pinghost(host);
			return cb(e);
		}
		
		if(stdErr) {
			pinghost(host);
			return cb(stdErr)
		}
		
		//pinghost(host);
		return cb(null);
	})})(host)
}