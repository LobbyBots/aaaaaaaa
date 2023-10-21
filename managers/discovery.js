
const Default = require("../discovery/discoveryMenu.json");
const NeoLog = require("../structs/NeoLog");
const {discoveryResponses} = require("../discovery/events")

module.exports = (app) => {

	const seasonData = {
		"22.40": discoveryResponses.ver2240,
		"20.40": discoveryResponses.ver2040,
		"18.40": discoveryResponses.ver1840,
		"17.50": discoveryResponses.ver1750,
	  };
	
	function getSeasonInfo(req) {
	const userAgent = req.headers["user-agent"];
	const season = userAgent.split('-')[1];
	const seasonglobal = season.split('.')[0];
	return { season, seasonglobal };
	}


	app.post('*/discovery/surface/*', (req, res) => {
		const { season, seasonglobal } = getSeasonInfo(req);
		if (seasonData[season]) {
		  return res.json(seasonData[season]);
		}
		if (seasonglobal === "19") {
		  return res.json(discoveryResponses.ver19);
		}
		if(season >= 23.50){
			return res.json({
				"panels": [
					{
						"PanelName": "ByEpicNoBigBattle6Col",
						"Pages": [
							{
								"results": [
									{
										"lastVisited": null,
										"linkCode": "set_br_playlists", //there is habanero but why load into a comp playlist anyway.
										"isFavorite": false,
										"globalCCU": 0
                            		},
									{
										"lastVisited": null,
										"linkCode": "playlist_papaya",
										"isFavorite": false,
										"globalCCU": 0
									}
                       			],
                        		"hasMore": false
                    		}
                		]
            		}
       			 ],
        		"testCohorts": [
            		"testing"
				]
			})}
		else{
			return res.json(Default);
		}
});
	  
	  
	  app.post('/links/api/fn/mnemonic/', (req, res) => {
		const { season, seasonglobal } = getSeasonInfo(req);
		if (seasonData[season]) {
		  const eventBuilds = seasonData[season].Panels[0].Pages[0].results.map(result => result.linkData);
		  return res.json(eventBuilds);
		}
		if (seasonglobal === "19") {
		  const s19 = discoveryResponses.ver19.Panels[0].Pages[0].results.map(result => result.linkData);
		  return res.json(s19);
		}
		if(season >= 23.50){
			return res.json(require("../discovery/latest/discoveryMenu.json"))
		}
		else{
			const defaultResponse = Default.Panels[0].Pages[0].results.map(result => result.linkData);
			return res.json(defaultResponse);
		}
	  });

	
	app.get('/links/api/fn/mnemonic/:playlistId/related', (req, res) => {
		return res.json({
				"parentLinks": [],
				"links": {
				 [req.params.playlistId]: {
					"namespace": "fn",
					"accountId": "epic",
					"creatorName": "Epic",
					"mnemonic": req.params.playlistId,
					"linkType": "BR:Playlist",
					"metadata": {
					  "image_url": "",
					  "image_urls": {
						"url_s": "",
						"url_xs": "",
						"url_m": "",
						"url": "" 
					  },
					  "matchmaking": {
						"override_playlist": req.params.playlistId
					  }
					},
					"version": 95,
					"active": true,
					"disabled": false,
					"created": "2021-10-01T00:56:45.010Z",
					"published": "2021-08-03T15:27:20.251Z",
					"descriptionTags": [],
					"moderationStatus": "Unmoderated"
				  }
				}
			}) //fixes the play button being disabled
	});
	
	app.get('/links/api/fn/mnemonic/:playlistId', (req, res) => {
		const { season, seasonglobal } = getSeasonInfo(req);
		if (seasonData[season]) {
		  for (const result of seasonData[season].Panels[0].Pages[0].results) {
			if (result.linkData.mnemonic === req.params.playlistId) {
			  return res.json(result.linkData);
			}
		  }
		}
		if (seasonglobal == "19") {
		  for (const result of discoveryResponses.ver19.Panels[0].Pages[0].results) {
			if (result.linkData.mnemonic === req.params.playlistId) {
			  return res.json(result.linkData);
			}
		  }
		}
		if(season >= 23.50){
			if(req.params.playlistId == "set_br_playlists")
			{
				return res.json(require("../discovery/latest/setbrplaylist.json"))
			}
			else{
				try{
					return res.json(require(`../discovery/latest/coreLtms/${req.params.playlistId}.json`))
				}
				catch{}
			}
		}
		 else {
		  for (const result of Default.Panels[0].Pages[0].results) {
			if (result.linkData.mnemonic === req.params.playlistId) {
			  return res.json(result.linkData); 
			}
		  }
		}
	  });

}