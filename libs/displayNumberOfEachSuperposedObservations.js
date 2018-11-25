////////// THINGS TO DO TO MAKE IT WORKING WELL //////////
//
// 1- copy/paste in generateTimeline.js at the end of the function "displayMain(visItems)" the code below :


// display the numbers of each superposed observations
var superposedItems = mainItems.selectAll("text")
        .data(aggregatesVisItems, function(d) { return d.key; }) //function(d) { return d.key; } maybe useless ??
		.attr("x", function(d) {
			// var datum = new Date(d.values[0].start).getTime();
			// return x1(datum);
			var datumStart = new Date(d.values[0].start).getTime();
			var datumEnd = new Date(d.values[0].end).getTime();
			if ((datumEnd - datumStart) < 86400000) { // 86400000 = 1 day in ms
				datumEnd = datumStart + 86400000;
			}
			return x1(datumStart + (datumEnd-datumStart)/2);
		})
		.attr("y", function(d) {return  y1(d.values[0].lane)+ 0.7*y1(1);})
		.attr("superpositionNb", function(d){return d.values.length;})
		.attr("text-anchor", "middle")
		.attr("fill", "white")
		.text(function(d){return d.values.length;});
superposedItems.enter().append("text");
superposedItems.exit().remove();