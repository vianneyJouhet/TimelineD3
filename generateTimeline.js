i2b2.TimelineD3.generateTimeline = function() {

	// init timeline
	d3.select("svg").remove();
	d3.select("#foreignObject").remove();
	$$("#timelineD3-mainDiv nav")[0].hide();
	d3.select("#h1PatientID").remove();
	d3.select("#graph").remove();

	if (!Object.isUndefined(i2b2.TimelineD3.model.prsRecord)) {
		$$("#timelineD3-mainDiv nav")[0].show();
	}

	// draw timeline
	if (i2b2.TimelineD3.model.panelsConceptsDropped.length > 0) {

		//i2b2.TimelineD3.model.patientsDatas is filled with i2b2.TimelineD3.getObservationsDatas in getDatas_generateXML.js
		for (patientID in i2b2.TimelineD3.model.patientsDatas) { 

			var htmlDisplay = '';
			
			htmlDisplay += "<h1 id='h1PatientID'>Patient #" + patientID + "</h1>";
			htmlDisplay += "<div id='graph'></div>"

			$$("#timelineD3-mainDiv #timelineD3-infoPDO #timelineD3-graph")[0].innerHTML = htmlDisplay;

			var lanes = [];

			for (var i=0; i<i2b2.TimelineD3.model.panelsConceptsDropped.length; i++) {

				var panelConcept = i2b2.TimelineD3.model.panelsConceptsDropped[i].origData.key;

				if (i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelConcept].datas.length > 0) {
					var oneLane = {};
					oneLane.path = panelConcept;
					oneLane.name = i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelConcept].name;

					lanes.push(oneLane);
				}
			}

			// for (panelConcept in i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts) {
			// 	if (i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelConcept].datas.length > 0) {
			// 		var oneLane = {};
			// 		oneLane.path = panelConcept;
			// 		oneLane.name = i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelConcept].name;

			// 		lanes.push(oneLane);
			// 	}
			// }

			var laneLength = lanes.length;

			var items = [];

			for (panelConcept in i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts) {

				for (var i=0; i<i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelConcept].datas.length; i++ ) {

					var laneNumber = "";
					var laneName = "";

					for (var i1=0; i1<laneLength; i1++) {
						if (lanes[i1].path == panelConcept) {
							laneNumber = i1;
							laneName = lanes[i1].path;
						}
					}

					var oneData = {};
					oneData.event_id = i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelConcept].datas[i].event_id;
					oneData.patient_id = i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelConcept].datas[i].patient_id;
					oneData.concept_cd = i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelConcept].datas[i].concept_cd;
					oneData.concept_label = i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelConcept].datas[i].concept_label;
					oneData.observer_cd = i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelConcept].datas[i].observer_cd;
					oneData.modifier_cd = i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelConcept].datas[i].modifier_cd;
					oneData.instance_num = i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelConcept].datas[i].instance_num;
					oneData.valuetype_cd = i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelConcept].datas[i].valuetype_cd;
					oneData.tval_char = i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelConcept].datas[i].tval_char;
					oneData.nval_num = i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelConcept].datas[i].nval_num;
					oneData.valueflag_cd = i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelConcept].datas[i].valueflag_cd;
					oneData.units_cd = i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelConcept].datas[i].units_cd;
					oneData.location_cd = i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelConcept].datas[i].location_cd;
					oneData.observation_blob = i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelConcept].datas[i].observation_blob;
					oneData.start = i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelConcept].datas[i].start_date_key;
					oneData.end = i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelConcept].datas[i].end_date;
					oneData.lane = laneNumber;
					oneData.laneName = laneName;

					items.push(oneData);
				}
			}

			// timeBegin and timeEnd are respectively the smallest and the biggest value, converted in ms with "new Date().getTime();"
			// notice : 86400000 = 1 day in ms, so 86400000 * 10 = 10 days in ms
			timeBegin = new Date(d3.min(items, function(d) { return d.start; })).getTime() - (86400000 * 10);
			timeEnd = new Date(d3.max(items, function(d) { return d.end; })).getTime() + (86400000 * 10);

			var widthGraph = d3.select('#graph').node().getBoundingClientRect().width;

			// set initial values
			var m = [20, 20, 20, 120]; // margin for top right bottom left
			var	w = widthGraph - m[3] - m[1]; // width
			if (laneLength < 2 ) {
				var h = laneLength*90 - m[0] - m[2]; // height
			} else {
				var h = laneLength*60 - m[0] - m[2]; // height
			}
			var miniHeight = h/5;
			var	mainHeight = h - miniHeight - m[0];

			// d3 scales
			var x = d3.scaleLinear()
					.domain([timeBegin, timeEnd])
					.range([0, w]);
			var invX = d3.scaleLinear()
					.domain([0, w])
					.range([timeBegin, timeEnd]);
			var x1 = d3.scaleTime()
					.range([0, w]);
			var x2 = d3.scaleTime()
					.domain([timeBegin, timeEnd])
					.range([0, w]);
			var y1 = d3.scaleLinear()
					.domain([0, laneLength])
					.range([0, mainHeight]);
			var y2 = d3.scaleLinear()
					.domain([0, laneLength])
					.range([0, miniHeight]);
			var color = d3.scaleLinear()
						.domain([0, laneLength/4, laneLength/2, (laneLength - laneLength/4),laneLength])
						.interpolate(d3.interpolateHcl)
						.range(["red", "orange", "yellow", "green"])

			var previewSearchedItemsOpened = false;

			////////// beginning of d3 serious shit //////////
			
			// foreignObject is a div created just before SVG to put html content in. So brilliant
			var foreignObject = d3.select("#graph")
				.append("div")
				.attr("id", "foreignObject");
			
			var searchDisplay = foreignObject.append("div");
			
			foreignObject.append("div")
				.attr("id", "nodeCard")
				.append("i")
				.attr("id", "closeNodeCard")
				.attr("class", "fa fa-window-close crossClose")
				.attr("aria-hidden", "true");

			var searchDisplayNodeCard = d3.select("#nodeCard").append("div");

			foreignObject.append("div")
				.attr("id", "lightbox")
				.append("i")
				.attr("id", "closeLightbox")
				.attr("class", "fa fa-window-close crossClose")
				.attr("aria-hidden", "true");

			// chart contains svg
			var chart = d3.select("#graph").append("div").attr("id", "graphScroll")
						.append("svg")
						.attr("width", w + m[3])
						.attr("height", h + m[0] + m[2])
						.attr("class", "chart");

			var defs = chart.append("defs");
			
			// main created first to allow mini to be on top when user scrolls the graph
			var main = chart.append("g")
			var mini = chart.append("g")

			chart.append("defs").append("clipPath")
				.attr("id", "clip")
				.append("rect")
				.attr("width", w)
				.attr("height", mainHeight);

			// mini is the preview of the timeline
			mini.attr("transform", "translate(" + m[3] + "," + m[0] + ")")
				.attr("width", w)
				.attr("height", miniHeight)
				.attr("class", "mini");

			var backgroundMini = mini.append("rect")
									.attr("width", w + m[3])
									.attr("height", miniHeight + m[0])
									.attr("x", -m[3])
									.attr("y", -m[0])
									.attr("fill", "url(#backgroundMiniGradient)")
									.attr("fill-opacity", "0")
									.style("transition", "fill-opacity .2s");

			var backgroundMiniGradient = defs.append("linearGradient")
			   .attr("id", "backgroundMiniGradient")
			   .attr("x1", "0%")
			   .attr("x2", "0%")
			   .attr("y1", "0%")
			   .attr("y2", "100%");

			backgroundMiniGradient.append("stop")
			   .attr('class', 'start')
			   .attr("offset", "0%")
			   .attr("stop-color", "#fff")
			   .attr("stop-opacity", 1);

			backgroundMiniGradient.append("stop")
			   .attr('class', 'end')
			   .attr("offset", "100%")
			   .attr("stop-color", "#f2f2f2")
			   .attr("stop-opacity", 1);

			d3.select("#graphScroll").on("scroll", function() {
				pixelsDistanceFromTop = this.scrollTop;
				mini.attr("transform", "translate(" + m[3] + "," + (pixelsDistanceFromTop + m[0]) + ")");
				if (pixelsDistanceFromTop > 20) {
					backgroundMini.attr("fill-opacity", "1");
				} else {
					backgroundMini.attr("fill-opacity", "0");
				}
			});

			// main is the timeline
			main.attr("transform", "translate(" + m[3] + "," + (miniHeight + m[2]*2) + ")")
				.attr("width", w)
				.attr("height", mainHeight)
				.attr("class", "main");

			//main lanes and texts
			main.append("g").attr("id", "mainLanesLines")
				.selectAll(".laneLine")
				.data(lanes)
				.enter().append("line")
				.attr("x1", 0)
				.attr("y1",  function(d, i) {return y1(i);})
				.attr("x2", w)
				.attr("y2",  function(d, i) {return y1(i);})
				.attr("stroke", "lightgray")
				.attr("class", "laneLine");

			main.append("g").attr("id", "mainLanesTexts")
				.selectAll(".laneText")
				.data(lanes)
				.enter().append("text")
				.text(function(d) {
				    if (d.name.length > 18) {
				    	return d.name.substr(0, 17) + "...";
				    } else {
				    	return d.name;
				    }
				})
				.attr("x", function(d) {
					if (d.name.length > 18) {
						return "-120";
					} else {
						return "-8";
					}
				})
				.attr("y", function(d, i) {return y1(i + .5);})
				.attr("dy", ".5ex")
				.attr("text-anchor", function(d) {
					if (d.name.length > 18) {
						return "start";
					} else {
						return "end";
					}
				})
				.attr("class", "laneText")
				// d3-effect that allows to see full laneText name on mouseover
		    	.on("mouseover", function(d) {
		    		if (d.name.length > 18) {
		    			d3.select(this).text(d.name);
				    }
		    	})
		    	.on("mouseout", function(d) {
					if (d.name.length > 18) {
		    			d3.select(this).text(d.name.substr(0, 17) + "...");
				    }
		    	});

		    // rect for zoom effect
			main.append("rect")
				.attr("class", "zoom")
				.attr("width", w)
				.attr("height", mainHeight);

			// x axis with dates 
			// var xAxis = d3.axisBottom(x1).ticks(5).tickFormat(d3.timeFormat("%d/%m/%Y"));
			var xAxis = d3.axisBottom(x1).ticks(5);

			main.append("g")
				.attr("class", "axis axis--x")
				.attr("transform", "translate(0," + mainHeight + ")")
				.call(xAxis);

			// x axis Top with years 
			var xAxisTop = d3.axisTop(x2);
			mini.append("g")
				.attr("class", "axis axis--x")
				.attr("transform", function() {
					if (laneLength < 2 ) {
						return "translate(0, -1)";
					} else {
						return "translate(0, 0)";
					}
				})
				.call(xAxisTop);

			//mini lanes and texts
			mini.append("g").attr("id","miniLanesLines")
				.selectAll(".laneLine")
				.data(lanes)
				.enter().append("line")
				.attr("x1", 0)
				.attr("y1", function(d, i) {return y2(i);})
				.attr("x2", w)
				.attr("y2", function(d, i) {return y2(i);})
				.attr("stroke", "lightgray")
				.attr("class", "laneLine");

			mini.select("#miniLanesLines").append("line")
				.attr("x1", 0)
				.attr("y1", function() {return y2(laneLength);})
				.attr("x2", w)
				.attr("y2", function() {return y2(laneLength);})
				.attr("stroke", "lightgray")
				.attr("id", "lastMiniLaneLine");

			mini.append("g").attr("id", "miniLanesTexts")
				.selectAll(".laneText")
				.data(lanes)
				.enter().append("text")
				.text(function(d) {
				    if (d.name.length > 21) {
				    	return d.name.substr(0, 20) + "...";
				    }
				    else {
				    	return d.name;
				    }
				})
				.attr("x", function(d) {
					if (d.name.length > 21) {
					 	return "-120";
					} else {
						return "-8";
					}
				})
				.attr("y", function(d, i) {return y2(i + .5);})
				.attr("dy", ".5ex")
				.attr("text-anchor", function(d) {
					if (d.name.length > 21) {
					 	return "start";
					} else {
						return "end";
					}
				})
				.attr("class", "laneText");

			var mainItems = main.append("g");

			// mini item rects
			var aggregatesMiniItems = d3.nest()
				.key(function(d) {return d.lane +"_" + d.start + "_" + d.end;} )
				.entries(items);

			mini.append("g").selectAll(".miniItems")
				// .data(aggregatesMiniItems)
				.data(aggregatesMiniItems, function(d) {return d.key;})
				.enter().append("rect")
				.attr("class", "miniItem")
				.attr("x", function(d) {
					var datum = new Date(d.values[0].start).getTime();
					return x(datum);
				})
				.attr("y", function(d) {return y2(d.values[0].lane);})
				.attr("width", function(d) {
					var datumStart = new Date(d.values[0].start).getTime();
					var datumEnd = new Date(d.values[0].end).getTime();
					return (x(datumEnd) - x(datumStart) + 1);
				})
				.attr("height", miniHeight/laneLength);

			// brush effect
			var brush = d3.brushX()
					.extent([[0, 0], [w, miniHeight]])
					.on("brush end", brushed);
			// zoom effect
			var zoom = d3.zoom()
			    .scaleExtent([1, 100]) // [1, Infinity] for allow zooming to infinity !
			    .translateExtent([[0, 0], [w, h]])
			    .extent([[0, 0], [w, h]])
			    .on("zoom", zoomed);

			mini.append("g")
				.attr("class", "x-brush")
				.call(brush)
				.call(brush.move, [w-w/6,w])
				.call(zoom);

			main.select(".zoom").call(zoom);

			// search effect
			searchDisplay.append("label")
				.attr("for", "search")
				.text("Search in all observations : ");
			searchDisplay.append("input")
				.attr("id", "search")
				.attr("type", "text")
				.attr("placeholder","Start typing...")
				.attr("value", function () {
					if (i2b2.TimelineD3.model.searchValue) {
						return i2b2.TimelineD3.model.searchValue;
					} else {
						return "";
					}
				});

			searchDisplayNodeCard.append("input")
				.attr("id", "searchNodeCard")
				.attr("type", "text")
				.attr("placeholder","Start typing...")
				.attr("value", function () {
					if (i2b2.TimelineD3.model.searchValue) {
						return i2b2.TimelineD3.model.searchValue;
					} else {
						return "";
					}
				});

			searchDisplayNodeCard.append("i")
				.attr("id", "openSearchNodeCard")
				.attr("class", "fa fa-search magnifyingGlassOpen opening")
				.attr("aria-hidden", "true");

			searchDisplayNodeCard.append("i")
				.attr("id", "closeSearchNodeCard")
				.attr("class", "fa fa-eye-slash crossClose")
				.attr("aria-hidden", "true");

			d3.select("#search").on("keyup", function() {
				i2b2.TimelineD3.model.searchValue = d3.select(this).node().value;
				d3.select("#searchNodeCard").property("value", i2b2.TimelineD3.model.searchValue);
				filtered();
				previewSearchedItems();
				filterSearchNodeCard();
				filterPreviewSearchedItems();
			});
			d3.select("#searchNodeCard").on("keyup", function() {
				i2b2.TimelineD3.model.searchValue = d3.select(this).node().value;
				d3.select("#search").property("value", i2b2.TimelineD3.model.searchValue);
				filtered();
				previewSearchedItems();
				filterSearchNodeCard();
				filterPreviewSearchedItems();
			});
			if (i2b2.TimelineD3.model.searchValue.length > 2) {
				previewSearchedItems();
				filterPreviewSearchedItems();
			}

			function brushed() {
				if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom

				if(d3.event.selection != null){
					var minExtent = d3.event.selection[0],
						maxExtent = d3.event.selection[1];

					x1.domain([invX(minExtent), invX(maxExtent)]);

					main.select(".axis--x").call(xAxis);

					var s = d3.event.selection || x.range();

					chart.select(".zoom").call(zoom.transform, d3.zoomIdentity
						.scale(w / (s[1] - s[0]))
						.translate(-s[0], 0));

					filtered();
				}
			}


			function zoomed() {
				if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
				
				var t = d3.event.transform;

				main.select(".zoom").node().__zoom = t; // allow synchronization bewteen actual brush and zoom
				mini.select(".x-brush").node().__zoom = t;
				// rects.node().__zoom = t;

				var minExtent = t.rescaleX(x).domain()[0];
				var maxExtent = t.rescaleX(x).domain()[1];

				x1.domain(t.rescaleX(x).domain());

				main.select(".axis--x").call(xAxis);

				mini.select(".x-brush").call(brush.move, x1.range().map(t.invertX, t));

				filtered();
			}


			function filtered() {

				// visItems are the items (rects) of the main which are present in the brush selection of the mini
				var visItems = items.filter(function(d) {
					var datumStart = new Date(d.start).getTime();
					var datumEnd = new Date(d.end).getTime();
					return datumStart < x1.domain()[1] && datumEnd > x1.domain()[0];
				});

				displayMain(visItems);

			}


			function filterDataWithSearchValue(d) {
				var filterBlob = false;
				var filterTvalChar = false;
				var filterConceptLabel = false;
				for (var i = d.values.length - 1; i >= 0; i--) {
					if (d.values[i].concept_label) {
						filterConceptLabel = d.values[i].concept_label.toUpperCase().indexOf(i2b2.TimelineD3.model.searchValue.toUpperCase()) > -1;
					}
					if (d.values[i].observation_blob ) {
						filterBlob = d.values[i].observation_blob.toUpperCase().indexOf(i2b2.TimelineD3.model.searchValue.toUpperCase()) > -1;
					}
					if (d.values[i].tval_char) {
						filterTvalChar = d.values[i].tval_char.toUpperCase().indexOf(i2b2.TimelineD3.model.searchValue.toUpperCase()) > -1;
					}
					if (filterConceptLabel || filterBlob || filterTvalChar) {break;}
				}
				return filterConceptLabel || filterBlob || filterTvalChar;
			}


			function displayMain(visItems) {

				// aggregate the visItems for displaying only one rect for the superposed items
				var aggregatesVisItems = d3.nest()
					.key(function(d) {return d.lane +"_" + d.start + "_" + d.end;} )
					.entries(visItems);

				// update main items rects with the last aggregatesVisItems
				var rects = mainItems.selectAll("rect")
				        .data(aggregatesVisItems, function(d) {return d.key; })
						.attr("x", function(d) {
							var datum = new Date(d.values[0].start).getTime();
							return x1(datum);
						})
						.attr("width", function(d) {
							var datumStart = new Date(d.values[0].start).getTime();
							var datumEnd = new Date(d.values[0].end).getTime();
							if ((datumEnd - datumStart) < 86400000) { // 86400000 = 1 day in ms
								datumEnd = datumStart + 86400000;
							}
							return (x1(datumEnd) - x1(datumStart));
						});

				rects.enter().append("rect").attr("class", "mainItem")
					.attr("id", function(d) {
						var datumStart = new Date(d.values[0].start).getTime();
						var datumEnd = new Date(d.values[0].end).getTime();
						return "aggregateKey-" + d.values[0].lane +"_" + datumStart + "_" + datumEnd; 
					})
					.attr("x", function(d) {
						var datum = new Date(d.values[0].start).getTime();
						return x1(datum);
					})
					.attr("y", function(d) {return y1(d.values[0].lane)+ 0.1*y1(1);})
					.attr("height", function(d) {return 0.8 * y1(1);})
					.attr("width", function(d) {
						var datumStart = new Date(d.values[0].start).getTime();
						var datumEnd = new Date(d.values[0].end).getTime();
						if ((datumEnd - datumStart) < 86400000) { // 86400000 = 1 day in ms
							datumEnd = datumStart + 86400000;
						}
						return (x1(datumEnd) - x1(datumStart));
					})
					// .style("fill", function(d) {return color(d.values[0].lane);})
					;

				rects.exit().remove();

				if (i2b2.TimelineD3.model.searchValue.length>0) {

					// update mini items rects if search is complete
					d3.selectAll(".miniItem").attr("fill", "lightgray")
					.attr("fill-opacity", ".5")
					.filter(function(d) {
						return filterDataWithSearchValue(d);
					})
					.attr("fill","black")
					.attr("fill-opacity", "1");

					d3.selectAll(".mainItem").classed("unclikable", true)
						.on("click", null)
						.filter(function(d) {
							return filterDataWithSearchValue(d);
						})
						.classed("unclikable", false)
						.attr("laneName", function(d) {return d.values[0].laneName;})
						.on("click", function(d) {
						
							displayNodeCard(d);

							d3.select(this).classed("opening", true);

						})
						// .call(zoom)
						;

				} else {

					d3.selectAll(".miniItem").attr("fill", "black").attr("fill-opacity", "1");

					d3.selectAll(".mainItem").classed("unclikable", false)
					.attr("laneName", function(d) {return d.values[0].laneName;})
					.on("click", function(d) {
					
						displayNodeCard(d);

						d3.select(this).classed("opening", true);

					})
					// .call(zoom)
					;

				}

			}


			function previewSearchedItems() {
				d3.select("#searchPreview").remove();
				d3.select("#buttonItemsPreviewedNumber").remove();
				d3.selectAll(".searchedItemPreview").remove();

				if (i2b2.TimelineD3.model.searchValue.length > 2) {

					var searchPreview = foreignObject.append("div")
						.attr("id", "searchPreview");

					foreignObject.append("span")
						.attr("id", "buttonItemsPreviewedNumber")
						.attr("class", "itemsPreviewedNumber");

					searchPreview.append("h3")
						.text("Search preview");

					searchPreview.append("i")
						.attr("id", "closePreview")
						.attr("class", "fa fa-window-close crossClose")
						.attr("aria-hidden", "true");

					searchPreview.append("i")
						.attr("id", "arrowScrollPreviewUp")
						.attr("class", "fa fa-chevron-circle-up fa-2x arrowScrollPreview")
						.attr("aria-hidden", "true");

					searchPreview.append("i")
						.attr("id", "arrowScrollPreviewDown")
						.attr("class", "fa fa-chevron-circle-down fa-2x arrowScrollPreview")
						.attr("aria-hidden", "true");

					aggregatesMiniItemsFilteredSorted = aggregatesMiniItems.filter(function(d) {
						return filterDataWithSearchValue(d);
					}).sort(function(a, b) {
						return new Date(a.values[0].start).getTime() - new Date(b.values[0].start).getTime();
					});

					var searchedItemPreview = searchPreview.append("div").attr("class", "searchPreviewContent").selectAll(".searchedItemPreview")
					    .data(aggregatesMiniItemsFilteredSorted, function(d) { return d.key; });

					searchedItemPreview.enter().append("div")
						.attr("class", "searchedItemPreview")
						.each(function(d) {
							var previewObservation = d3.select(this).selectAll(".previewObservation")
								.data(d.values, function(d){return d.concept_cd;});
							previewObservation.enter().append("div")
								.attr("class", "previewObservation");
							previewObservation.exit().remove();
						})
						.on("click", function(d) {

							// move brush
							var minExtent = x(new Date(d.values[0].start).getTime() - 86400000); // 86400000 = 1 day in ms
							var maxExtent = x(new Date(d.values[0].end).getTime() + 86400000*2); // 86400000*2 = 2 days in ms

							var s = [minExtent, maxExtent];
							chart.select(".zoom").transition().duration(1000).call(zoom.transform, d3.zoomIdentity
								.scale(w / (s[1] - s[0]))
								.translate(-s[0], 0));

							displayNodeCard(d);

							// select mainItem rect corresponding to the aggregate clicked and add .opening
							var aggregateKey = "aggregateKey-" + d.values[0].lane + "_" + new Date(d.values[0].start).getTime() + "_" + new Date(d.values[0].end).getTime();
							d3.select("#" + aggregateKey).classed("opening", true);

						});
					
					searchedItemPreview.exit().remove();

				}
			}


			function displayNodeCard(d) {
				d3.selectAll(".mainItem").classed("opening", false);
				d3.select(".nodeCardContent").remove();
				d3.select("#nodeCard").select("h3").remove();
				d3.select(".nodeCardDate").remove();

				if (i2b2.TimelineD3.model.panelsConceptsDropped.length < 3) {
					d3.select("#graph").style("margin-top", "105px");
				} else {
					d3.select("#graph").style("margin-top", "90px");
				}

				d3.select("#graphScroll").style("height", "calc(100% - 170px)")

				d3.select("#nodeCard").classed("opening", true)
					.append("h3")
					.text(function() {
						if (d.values.length == 1) {
							return "1 observation in this node";
						} else {
							return d.values.length + " observations in this node";
						}
					});

				d3.select("#nodeCard").append("span")
					.attr("class", "nodeCardDate")
					.text(d3.timeFormat("%d/%m/%Y")(new Date(d.values[0].start)));

				d3.select("#nodeCard").append("div")
					.attr("class", "nodeCardContent");

				var contentsSub = d3.select(".nodeCardContent").selectAll(".contentSub")
					.data(d.values, function(d){return d.concept_cd;})
					.enter()
					.append("div")
					.attr("class", "contentSub")
					.attr("id", function(d,i){return "contentSub-" + i});
				
				filterSearchNodeCard();

				contentsSub.exit().remove();
			}


			function filterSearchNodeCard() {
				d3.selectAll(".contentSub").style("display", "none")
					.filter(function(d) {
						var filterBlob = false;
						var filterTvalChar = false;
						var filterConceptLabel = false;

						if (i2b2.TimelineD3.model.searchValue.length==0) {
							filterBlob = true;
							filterTvalChar = true;
							filterConceptLabel = true;
						} else {
							if (d.concept_label) {
								filterConceptLabel = d.concept_label.toUpperCase().indexOf(i2b2.TimelineD3.model.searchValue.toUpperCase()) > -1;
							}
							if (d.observation_blob) {
								filterBlob = d.observation_blob.toUpperCase().indexOf(i2b2.TimelineD3.model.searchValue.toUpperCase()) > -1;
							}
							if (d.tval_char) {
								filterTvalChar = d.tval_char.toUpperCase().indexOf(i2b2.TimelineD3.model.searchValue.toUpperCase()) > -1;
							}
						}
						return filterConceptLabel || filterBlob || filterTvalChar;
					})
					.style("display", "inline-block").each(function(d, i) {

						var contentSub = d3.select(this);
						contentSub.html(null);
							
						var concept_labelDisplay = d.concept_label;
						var concept_labelTextIntro = "";
						if (i2b2.TimelineD3.model.searchValue.length > 0) {
							concept_labelDisplay = d.concept_label.replace(new RegExp(i2b2.TimelineD3.model.searchValue, "gi"), function(x){return "<mark>" + x + "</mark>"});
						}
						contentSub.append("span").attr("class", "concept_labelDisplay")
							.html(concept_labelTextIntro + concept_labelDisplay)
							.append("i").attr("class", "fa fa-file-code-o showLightboxCodeInfo")
							.attr("aria-hidden", "true");

						contentSub.append("span").attr("class", "contentInline first").text("Modifier CD : " + d.modifier_cd);
						contentSub.append("span").attr("class", "contentInline").text("Instance Num : " + d.instance_num);

						if (d.observation_blob) {

							var observation_blobDisplay = d.observation_blob;
							var observation_blobParsedStart = 0;
							var observation_blobTextIntro = "Obs Blob : ";

							if (i2b2.TimelineD3.model.searchValue.length > 0) {

								observation_blobDisplay = observation_blobDisplay.replace(new RegExp(i2b2.TimelineD3.model.searchValue, "gi"), function(x){return "<mark>" + x + "</mark>";});
								var positionFirstOccurence = d.observation_blob.toUpperCase().indexOf(i2b2.TimelineD3.model.searchValue.toUpperCase());
								
								if (positionFirstOccurence > 19 ) {
									observation_blobParsedStart = positionFirstOccurence - 20;
								}
							}
							
							if (observation_blobParsedStart > 0) {
								observation_blobTextIntro = "Obs Blob : [...] ";
							}

							if (d.observation_blob.length > 180) {

								contentSub.append("span").attr("class", "observation_blobDisplay")
									.html(observation_blobTextIntro + observation_blobDisplay.substr(observation_blobParsedStart, 180) + " ...")
									.append("button").text("Read more")
									.attr("class", "pgGo-btn showLightbox")
									.on("click", function(){
										d3.select("#lightbox").attr("class", "lightboxing")
											.append("div")
											.attr("class", "lightboxContent")
												.append("h3")
												.text("Blob for concept CD : " + d.concept_cd);
										d3.select(".lightboxContent").append("div")
											.attr("class", "lightboxContentSub")
												.append("pre")
												.html(observation_blobDisplay);
									});

						    } else {
						    	contentSub.append("span").attr("class", "observation_blobDisplay").html(observation_blobTextIntro + observation_blobDisplay);
						    }

						}

						if (d.tval_char) {
							
							var tval_charDisplay = d.tval_char;
							var tval_charParsedStart = 0;
							var tval_charTextIntro = "Tval Char : ";

							if (i2b2.TimelineD3.model.searchValue.length > 0) {

								tval_charDisplay = d.tval_char.replace(new RegExp(i2b2.TimelineD3.model.searchValue, "gi"), function(x){return "<mark>" + x + "</mark>"});
								var positionFirstOccurence = d.tval_char.toUpperCase().indexOf(i2b2.TimelineD3.model.searchValue.toUpperCase());
								
								if (positionFirstOccurence > 19 ) {
									tval_charParsedStart = positionFirstOccurence - 20;
								}
							}

							if (tval_charParsedStart > 0) {
								tval_charTextIntro = "Tval Char : [...] ";
							}

							if (d.tval_char.length > 180) {

								contentSub.append("span").attr("class", "tval_charDisplay")
									.html(tval_charTextIntro + tval_charDisplay.substr(tval_charParsedStart, 180) + " ...")
									.append("button").text("Read more")
									.attr("class", "pgGo-btn showLightbox")
									.on("click", function(){
										d3.select("#lightbox").attr("class", "lightboxing")
											.append("div")
											.attr("class", "lightboxContent")
												.append("h3")
												.text("Blob for concept CD : " + d.concept_cd);
										d3.select(".lightboxContent").append("div")
											.attr("class", "lightboxContentSub")
												.append("pre")
												.html(observation_blobDisplay);
									});

							} else {
								contentSub.append("span").attr("class", "tval_charDisplay").html(tval_charTextIntro + tval_charDisplay);
							}

						}

						contentSub.select("i.showLightboxCodeInfo").on("click", function(){
							d3.select("#lightbox").attr("class", "lightboxing")
								.append("div")
								.attr("class", "lightboxContent")
								.append("h3").text("Code info for event #" + d.event_id);

							var lightboxContentSub = d3.select(".lightboxContent").append("div")
								.attr("class", "lightboxContentSub");

							lightboxContentSub.append("span").text("Patient ID : " + d.patient_id);
							lightboxContentSub.append("span").text("Start date : " + d.start);
							lightboxContentSub.append("span").text("End date : " + d.end);
							lightboxContentSub.append("span").text("Concept CD : " + d.concept_cd);
							lightboxContentSub.append("span").text("Concept label : " + d.concept_label);
							if (d.observer_cd) {lightboxContentSub.append("span").text("Observer CD : " + d.observer_cd);}
							if (d.modifier_cd) {lightboxContentSub.append("span").text("Modifier CD : " + d.modifier_cd);}
							if (d.instance_num) {lightboxContentSub.append("span").text("Instance num : " + d.instance_num);}
							if (d.valuetype_cd) {lightboxContentSub.append("span").text("Valuetype CD : " + d.valuetype_cd);}
							if (d.nval_num) {lightboxContentSub.append("span").text("Nval num : " + d.nval_num);}
							if (d.valueflag_cd) {lightboxContentSub.append("span").text("Valueflag CD : " + d.valueflag_cd);}
							if (d.units_cd) {lightboxContentSub.append("span").text("Units CD : " + d.units_cd);}
							if (d.location_cd) {lightboxContentSub.append("span").text("Location CD : " + d.location_cd);}
						});

						// if there is nval_num, and at least two dates for the corresponding concept_cd, then draw a valuesChart
						if (d.nval_num) {
							var nval_numDisplay = contentSub.append("span")
								.attr("class", "nval_numDisplay")
								.html("Value : " + d.nval_num + " " + d.units_cd);

							var concept_cdFilterValue = d.concept_cd;

							// itemsFilteredForCurrentConceptCD is the dataset used to draw the valuesChart
							var itemsFilteredForCurrentConceptCD = items.filter(function(d) {
								var filter = false;
								filter = d.concept_cd.toUpperCase().indexOf(concept_cdFilterValue.toUpperCase()) > -1;
								return filter;
							}).sort(function(a, b) {
								return new Date(a.start).getTime() - new Date(b.start).getTime();
							});

							var startFirstValue;
							var drawValuesChart = false;

							for (var i1 = 0; i1 < itemsFilteredForCurrentConceptCD.length; i1++) {
								if (i1 == 0) {
									startFirstValue = itemsFilteredForCurrentConceptCD[i1].start;
								} else {
									if (startFirstValue !== itemsFilteredForCurrentConceptCD[i1].start) {
										drawValuesChart = true;
										break;
									}
								}
							}

							if (drawValuesChart) {

								// DO DRAW
								nval_numDisplay.append("i")
									.attr("class", "fa fa-area-chart showLightboxValuesChart")
									.attr("aria-hidden", "true")
									.on("click", function(){
										d3.select("#lightbox").attr("class", "lightboxing")
											.append("div")
											.attr("class", "lightboxContent")
											.append("h3").text("Values for : " + d.concept_label);
									
										var lightboxContentSub = d3.select(".lightboxContent").append("div")
											.attr("class", "lightboxContentSub");

										var svgHeight = "400";
										var svgWidth = d3.select('.lightboxContentSub').node().getBoundingClientRect().width;

										var svgLightbox = lightboxContentSub.append("svg")
																			.attr("height", svgHeight)
																			.attr("width", svgWidth);

										// VC is for ValuesChart
										var marginVC = {top: 60, right: 40, bottom: 30, left: 40};
										var widthVC = svgWidth - marginVC.left - marginVC.right;
										var heightVC = svgHeight - marginVC.top - marginVC.bottom;

										svgLightbox.append("defs")
													.append("clipPath")
													.attr("id", "clip")
													.append("rect")
													.attr("width", widthVC)
													.attr("height", heightVC);

										// initialization of functions
										var gVC = svgLightbox.append("g").attr("transform", "translate(" + marginVC.left + "," + marginVC.top + ")");

										var xVC = d3.scaleTime().range([0, widthVC]);
										var yVC = d3.scaleLinear().range([heightVC, 0]);

										var xAxisVC = d3.axisBottom(xVC);
										var yAxisVC = d3.axisLeft(yVC);

										var zoomVC = d3.zoom()
											// .scaleExtent([1, Infinity])
											.scaleExtent([1, 20])
										    .translateExtent([[0, 0], [widthVC, heightVC]])
										    .extent([[0, 0], [widthVC, heightVC]])
										    .on("zoom", zoomedVC);

										var lineVC = d3.line()
										    .x(function(d) {
										      var datum = new Date(d.start).getTime();
										      return xVC(datum); 
										    })
										    .y(function(d) {
										      return yVC(d.nval_num);
										    });


										// draw chart
										xVC.domain(d3.extent(itemsFilteredForCurrentConceptCD, function(d) {
											var datum = new Date(d.start).getTime();
											return datum; 
								        }));

										yVC.domain(
											[d3.min(itemsFilteredForCurrentConceptCD, function(d) {
												var value = parseFloat(d.nval_num);
												return value - (0.1*value); // -10% of the min value for the domain min
											}),
											d3.max(itemsFilteredForCurrentConceptCD, function(d) {
												var value = parseFloat(d.nval_num);
												return value + (0.1*value); // +10% of the max value for the domain max
											})]
										);

										gVC.append("path")
											.datum(itemsFilteredForCurrentConceptCD)
											.attr("class", "line")
											.attr("d", lineVC);

										gVC.selectAll(".dot")
											.data(itemsFilteredForCurrentConceptCD)
											.enter().append("circle")
											.attr("class", "dot")
											.attr("cx", lineVC.x())
											.attr("cy", lineVC.y())
											.attr("r", 6)
											.attr("fill", function(d) {
												if (d.valueflag_cd == "H" || d.valueflag_cd == "L") {
												  return "#ea2657";
												} else {
												  return "#fff";
												}
											})
											.attr("stroke", "#6677AA")
											.attr("stroke-width", "2")
											.on("mouseover", function(d) {
												var valueX = Number(d3.select(this).attr("cx")) ;
												var valueY = Number(d3.select(this).attr("cy")) - 10;

												gVC.append("path")
													.attr("id", "dotTooltip")
													.attr("transform", "translate(" + valueX + "," + valueY + ")")
													.attr("fill", "#6677AA")
													.attr("stroke", "#667788")
													.attr("stroke-width", "2")
													.attr("d", "M 0,0 L -5,-5 H -27 Q -30,-5 -30,-8 V -27 Q -30,-30 -27,-30 H 27 Q 30,-30 30,-27 V -8 Q 30,-5 27,-5 H 5 z");

												gVC.append("text").attr("id", "dotText")
													.attr("x", function() {
														var nval_numPunctuationLess = d.nval_num.replace(/\./g, "");
														if (nval_numPunctuationLess.length > 2) {
														  return valueX - 15;
														} else {
														  return valueX - 10;
														}
													})
													.attr("y", valueY - 11)
													.text(d.nval_num);
											})
											.on("mouseout", function(d) {
												d3.select("#dotTooltip").remove();
												d3.select("#dotText").remove();
											});

										gVC.append("rect")
											.attr("id", "marginLeftCamouflage")
											.attr("width", marginVC.left)
											.attr("height", heightVC)
											.attr("transform", "translate(-"+ marginVC.left +",0)")
											.attr("fill", "#f2f2f2");

										gVC.append("rect")
											.attr("id", "marginRightCamouflage")
											.attr("width", marginVC.right)
											.attr("height", heightVC)
											.attr("transform", "translate("+ widthVC +",0)")
											.attr("fill", "#f2f2f2");										

										gVC.append("g")
											.attr("class", "axis axis--x")
											.attr("transform", "translate(0," + heightVC + ")")
											.call(xAxisVC);

										gVC.append("g")
											.attr("class", "axis axis--y")
											.call(yAxisVC);

										gVC.append("text")
											.attr("id", "axis--yLabel")
											.attr("x", - marginVC.left/2)
											.attr("y", "-10")
											.text(d.units_cd);

										// when zoomVC is called, zoomedVC() is launched
										svgLightbox.call(zoomVC).call(zoomVC.transform, d3.zoomIdentity);

										function zoomedVC() {

											var t = d3.event.transform;
											var xt = t.rescaleX(xVC);

											// display cursor-move when user has zoomed
											if (t.k == 1 & t.x == 0 & t.y == 0) {
												svgLightbox.style("cursor", "default");
											} else {
												svgLightbox.style("cursor", "move");
											}

											// re-draw line, dots and axis--x
											gVC.select(".line").attr("d", lineVC.x(function(d) {
												return xt(new Date(d.start).getTime());
											}));
											gVC.selectAll(".dot").attr("cx", lineVC.x());
											gVC.select(".axis--x").call(xAxisVC.scale(xt));

										}

									});
							}

						} // end of the code for the valuesChart

						contentSub.exit().remove();

					});
			}


			function filterPreviewSearchedItems() {
				if (i2b2.TimelineD3.model.searchValue.length > 2) {

					d3.selectAll(".previewObservation").filter(function(d) {
							var filterBlob = false;
							var filterTvalChar = false;
							var filterConceptLabel = false;

							if (d.concept_label) {
								filterConceptLabel = d.concept_label.toUpperCase().indexOf(i2b2.TimelineD3.model.searchValue.toUpperCase()) > -1;
								d3.select(this).classed("isFilteringConceptLabel", filterConceptLabel);
							}
							if (d.observation_blob) {
								filterBlob = d.observation_blob.toUpperCase().indexOf(i2b2.TimelineD3.model.searchValue.toUpperCase()) > -1;
								d3.select(this).classed("isFilteringBlob", filterBlob);
							}
							if (d.tval_char) {
								filterTvalChar = d.tval_char.toUpperCase().indexOf(i2b2.TimelineD3.model.searchValue.toUpperCase()) > -1;
								d3.select(this).classed("isFilteringTvalChar", filterTvalChar);
							}

							return filterConceptLabel || filterBlob || filterTvalChar;
						})
						.each(function(d) {

							var previewObservation = d3.select(this);

							if ((previewObservation.classed("isFilteringConceptLabel") == true) && d.concept_label) {

								var concept_labelParsedStart = 0;
								var concept_labelTextIntro = "<strong>" + d3.timeFormat("%d/%m/%Y")(new Date(d.start)) + "</strong> - ";
								var concept_labelTextOutro = "";
								var concept_labelDisplay = d.concept_label.replace(new RegExp(i2b2.TimelineD3.model.searchValue, "gi"), function(x){return "<mark>" + x + "</mark>";});
								var positionFirstOccurence = d.concept_label.toUpperCase().indexOf(i2b2.TimelineD3.model.searchValue.toUpperCase());
								
								if (positionFirstOccurence > 19 ) {
									concept_labelParsedStart = positionFirstOccurence - 20;
								}
								
								if (concept_labelParsedStart > 0) {
									concept_labelTextIntro += "[...] ";
								}

								if (d.concept_label.length > 70) {
									concept_labelTextOutro = "...";
									concept_labelDisplay = concept_labelDisplay.substr(concept_labelParsedStart, 70);
							    }

								previewObservation.append("span")
									.attr("class", "concept_labelDisplay previewObservationContent")
									.html(concept_labelTextIntro + concept_labelDisplay + concept_labelTextOutro)
									.on("click", function(){
										d3.selectAll(".previewObservationContent").classed("opening", false);
										d3.select(this).classed("opening", true);
									});
							}

							if ((previewObservation.classed("isFilteringBlob") == true) && d.observation_blob) {

								var observation_blobParsedStart = 0;
								var observation_blobTextIntro = "<strong>" + d3.timeFormat("%d/%m/%Y")(new Date(d.start)) + "</strong> - ";
								var observation_blobTextOutro = "";
								var observation_blobDisplay = d.observation_blob.replace(new RegExp(i2b2.TimelineD3.model.searchValue, "gi"), function(x){return "<mark>" + x + "</mark>";});
								var positionFirstOccurence = d.observation_blob.toUpperCase().indexOf(i2b2.TimelineD3.model.searchValue.toUpperCase());
								
								if (positionFirstOccurence > 19 ) {
									observation_blobParsedStart = positionFirstOccurence - 20;
								}
								
								if (observation_blobParsedStart > 0) {
									observation_blobTextIntro += "[...] ";
								}

								if (d.observation_blob.length > 70) {
									observation_blobTextOutro = "...";
									observation_blobDisplay = observation_blobDisplay.substr(observation_blobParsedStart, 70);
							    }

								previewObservation.append("span")
									.attr("class", "observation_blobDisplay previewObservationContent")
									.html(observation_blobTextIntro + observation_blobDisplay + observation_blobTextOutro)
									.on("click", function(){
										d3.selectAll(".previewObservationContent").classed("opening", false);
										d3.select(this).classed("opening", true);
									});
							}

							if ((previewObservation.classed("isFilteringTvalChar") == true) && d.tval_char) {

								var tval_charParsedStart = 0;
								var tval_charTextIntro = "<strong>" + d3.timeFormat("%d/%m/%Y")(new Date(d.start)) + "</strong> - ";
								var tval_charTextOutro = "";
								var tval_charDisplay = d.tval_char.replace(new RegExp(i2b2.TimelineD3.model.searchValue, "gi"), function(x){return "<mark>" + x + "</mark>"});
								var positionFirstOccurence = d.tval_char.toUpperCase().indexOf(i2b2.TimelineD3.model.searchValue.toUpperCase());
								
								if (positionFirstOccurence > 19 ) {
									tval_charParsedStart = positionFirstOccurence - 20;
								}

								if (tval_charParsedStart > 0) {
									tval_charTextIntro += "[...] ";
								}

								if (d.tval_char.length > 70) {
									tval_charTextOutro = "...";
									tval_charDisplay = tval_charDisplay.substr(tval_charParsedStart, 70);
								}

								previewObservation.append("span")
									.attr("class", "tval_charDisplay previewObservationContent")
									.html(tval_charTextIntro + tval_charDisplay + tval_charTextOutro)
									.on("click", function(){
										d3.selectAll(".previewObservationContent").classed("opening", false);
										d3.select(this).classed("opening", true);
									});
							}
						});

					var itemsPreviewedNumber = d3.selectAll(".previewObservationContent").size();
					var slidesNumber = 0;
					if (itemsPreviewedNumber == 0) {
						previewSearchedItemsOpened = false;
					} else if (itemsPreviewedNumber >= 4) {
						slidesNumber = Math.ceil(itemsPreviewedNumber / 4);
					} 
					var slidePosition = 0;
					var arrowScrollPreviewUp = d3.select("#arrowScrollPreviewUp");
					var arrowScrollPreviewDown = d3.select("#arrowScrollPreviewDown");

					if (itemsPreviewedNumber > 0) {
						d3.select("#buttonItemsPreviewedNumber")
							.text(itemsPreviewedNumber)
							.on("click", function() {
								previewSearchedItemsOpened = true;
								displayPreview();
							});
					} else {
						d3.select("#buttonItemsPreviewedNumber").style("display", "none");
					}

					if (previewSearchedItemsOpened) {
						displayPreview();
					}

					function displayPreview() {
						d3.select("#buttonItemsPreviewedNumber").style("display", "none");

						d3.select("#closePreview").classed("opening", true);
						arrowScrollPreviewUp.classed("opening", false);
						if (itemsPreviewedNumber >= 4) {
							arrowScrollPreviewDown.classed("opening", true);
						}
						d3.select("#searchPreview").classed("opening", true);
					}

					function scrollPreviewDown() {
						arrowScrollPreviewUp.classed("opening", true);
						slidePosition ++;
						var translationValue = slidePosition * 130;

						d3.selectAll(".previewObservation").style("transform", "translate(0, -" + translationValue + "px)");

						if (slidePosition >= slidesNumber) {
							arrowScrollPreviewDown.classed("opening", false);
						}
					}

					function scrollPreviewUp() {
						arrowScrollPreviewDown.classed("opening", true);
						slidePosition --;
						var translationValue = slidePosition * 130;

						d3.selectAll(".previewObservation").style("transform", "translate(0, -" + translationValue + "px)");

						if (slidePosition == 0) {
							arrowScrollPreviewUp.classed("opening", false);
						}
					}

					arrowScrollPreviewDown.on("click", function(){
						scrollPreviewDown();
					});

					arrowScrollPreviewUp.on("click", function(){
						scrollPreviewUp();
					});


					d3.selectAll(".searchedItemPreview").on("wheel", function() {
						if ( d3.event.deltaY > 0) {

							if (slidePosition >= slidesNumber) {
								return;
							}

							scrollPreviewDown();
						}
						else {

							if (slidePosition == 0) {
								return;
							}

							scrollPreviewUp();
						}
					});

					d3.select("#closePreview").on("click", function() {
						previewSearchedItemsOpened = false;
						d3.select("#buttonItemsPreviewedNumber").style("display", "block");
						d3.select(this).classed("opening", false);
						arrowScrollPreviewUp.classed("opening", false);
						arrowScrollPreviewDown.classed("opening", false);
						d3.select("#searchPreview").classed("opening", false);
					});

				} else {
					previewSearchedItemsOpened = false;
				}
			}
		}


		d3.select("#closeLightbox").on("click", function() {
			d3.select(".lightboxContent").remove();
			d3.select("#lightbox").classed("lightboxing", false);
		});

		d3.select("#closeNodeCard").on("click", function() {
			d3.select("#nodeCard").classed("opening", false);
			d3.select("#openSearchNodeCard").classed("opening", true);
			d3.select("#closeSearchNodeCard").classed("closing", false);
			d3.select("#searchNodeCard").classed("searching", false);
			d3.select(".mainItem.opening").classed("opening", false)
			d3.select('#graph').style("margin-top", "0");
			d3.select("#graphScroll").style("height", "calc(100% - 100px)")
		});

		d3.select("#openSearchNodeCard").on("click", function() {
			d3.select("#openSearchNodeCard").classed("opening", false);
			d3.select("#closeSearchNodeCard").classed("closing", true);
			d3.select("#searchNodeCard").classed("searching", true).node().focus();
		});

		d3.select("#closeSearchNodeCard").on("click", function() {
			d3.select("#openSearchNodeCard").classed("opening", true);
			d3.select("#closeSearchNodeCard").classed("closing", false);
			d3.select("#searchNodeCard").classed("searching", false);
		});

	}

}

i2b2.TimelineD3.Unload = function () {

	// purge old data
	delete i2b2.TimelineD3.model.prsRecord;
	delete i2b2.TimelineD3.model.patientIdRecord;
	i2b2.TimelineD3.model.panelsConceptsDropped = false;
	i2b2.TimelineD3.model.dirtyResultsData = true;
	return true;
};