{
	files:[
		"d3.min.js",
		"getDatas_generateXML.js",
		"generateTimeline.js"
	],
	css:[
		"font-awesome-4.7.0/css/font-awesome.min.css",
		"timelineD3.css"
	],
	config: {
		// Additional configuration variables that are set by the system
		short_name: "TimelineD3",
		name: "TimelineD3", 
		description: "This plugin using D3JS allows to display temporal data with a very fast, intuitive and interactive timeline.",
		category: ["celless","plugin","examples"],
		plugin: {
			isolateHtml: false,
			standardTabs: false,
			html: {
				source: 'injected_screens.html',
				mainDivId: 'timelineD3-mainDiv'
			}
		}
	}
}