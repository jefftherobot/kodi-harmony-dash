const DashButton = require('dash-button');
const harmony = require('harmonyhubjs-client');
const kodi = require('kodi-ws');
const DASH_BUTTON_MAC_ADDRESS = '40:b4:cd:ba:25:f3';
//const HARMONY_IP_ADDRESS = '192.168.0.242';
const HARMONY_IP_ADDRESS = '192.168.0.118';
const KODI_IP_ADDRESS = '192.168.0.128';

let button = new DashButton(DASH_BUTTON_MAC_ADDRESS);

let subscription = button.addListener(async () => {
  tvOnOff();
});

function playTvShow(){
	kodi(KODI_IP_ADDRESS, 9090).then(function (connection) {
		return connection.VideoLibrary.GetEpisodes({ 
			'tvshowid': 48, //teen titans go! 
			'limits': { 
				'start' : 0, 
				'end': 10 }, 
			'sort': { 
				'order': 'ascending', 
				'method': 'random'} 
			})
		.then(function(data) {

			//console.log(data.episodes)

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
	                  
	                  setTimeout(function(){
	                  	playTvShow();
	                  },10000)


	                  return true
	                }
	                return false
	              })
	            })
	        } else {
	          console.log('Currently on. Turning TV off')
	          harmonyClient.turnOff()
	          harmonyClient.end()
	        }
	      })
  	})
}