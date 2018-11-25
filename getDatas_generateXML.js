i2b2.TimelineD3.Init = function (loadedDiv) {

    // prevent requerying the Hive for results if the input dataset has not changed
	i2b2.TimelineD3.model.dirtyResultsData = true;

    // this function is called after the HTML is loaded into the viewer DIV
    i2b2.TimelineD3.view.containerDiv = loadedDiv; // save reference for later use
	
	// register the drop target DIVs
	var op_trgt = {dropTarget:true};

	i2b2.sdx.Master.AttachType("timelineD3-dropTarget", "CONCPT", op_trgt);
	i2b2.sdx.Master.AttachType("timelineD3-dropTarget", "PRS", op_trgt);

	// drop event handlers used by this plugin
	i2b2.sdx.Master.setHandlerCustom("timelineD3-dropTarget", "PRS", "DropHandler", i2b2.TimelineD3.patientSetDropped);
	i2b2.sdx.Master.setHandlerCustom("timelineD3-dropTarget", "CONCPT", "DropHandler", i2b2.TimelineD3.conceptDropped);

	// set initial pagination values
	i2b2.TimelineD3.model.pgstart = 1;
	i2b2.TimelineD3.model.pgsize = 1;

	// set to null the search value in the foreignObject of the graph and the search in Blob
	i2b2.TimelineD3.model.searchValue = "";

	// set to false the boolean representing the opening/closing of the lightboxSettings
	i2b2.TimelineD3.model.lightboxSettingsOpened = false;

	// set initial variables and objects
	i2b2.TimelineD3.model.msgFilter = "";
	i2b2.TimelineD3.model.scopedCallback = {};
	i2b2.TimelineD3.model.patientsDatas = {};

	// array to store panels concepts
	i2b2.TimelineD3.model.panelsConceptsDropped = [];
	i2b2.TimelineD3.model.conceptDropped = [];

	// boolean to check if the webservice "semanticRepository" (get labels from concept_cds) is online and working well
	i2b2.TimelineD3.model.isWebserviceRunning = true;

	// object to store labels of all concept_cd
	i2b2.TimelineD3.model.observationsConcepts = {};
}


i2b2.TimelineD3.patientSetDropped = function (sdxData) {

	$$("#timelineD3-mainDiv .timelineD3-mainContentPad p")[0].hide();

	if (i2b2.TimelineD3.model.lightboxSettingsOpened) {
		i2b2.TimelineD3.closeSettings();
	}

	sdxData = sdxData[0]; // only interested in first record

	// save the info to our local data model
	i2b2.TimelineD3.model.prsRecord = sdxData;

	// delete patientIdRecord if there is one, because we will use prsRecord
	if (!Object.isUndefined(i2b2.TimelineD3.model.patientIdRecord)) {
		delete i2b2.TimelineD3.model.patientIdRecord;
	}

	// let user know the drop was successful by displaying name of the patient set
	$$("#timelineD3-displayPatientSetDropped p")[0].innerHTML = i2b2.h.Escape(sdxData.sdxInfo.sdxDisplayName);
	$$("#timelineD3-displayPatientSetDropped p")[0].addClassName("used");
	$("timelineD3-inputPatientId").value = "";
	$$("#timelineD3-displayPatientSetDropped label")[0].removeClassName("used");
	
	$("timelineD3-displayPatientSetDropped").addClassName('visible');

	// change background temporarily to give feedback of a successful drop
	$("timelineD3-dropTarget").style.background = "#CFB";
	setTimeout("$('timelineD3-dropTarget').style.background = '#fff'", 250);

	if (i2b2.TimelineD3.model.panelsConceptsDropped.length) {

		if (i2b2.TimelineD3.model.dirtyResultsData) {
			// recalculate the results only if the input data has changed			
			i2b2.TimelineD3.model.dirtyResultsData = false;
		}

		i2b2.TimelineD3.resetPgGo();
		i2b2.TimelineD3.model.patientsDatas = {}; // reset Patient Datas
		i2b2.TimelineD3.displayResults(true);
	}

}

i2b2.TimelineD3.patientIdTyped = function () {

	var idPatient = $("timelineD3-inputPatientId").value;

	if (idPatient.toString().length==10 && idPatient!==i2b2.TimelineD3.model.patientIdRecord) {

		$$("#timelineD3-mainDiv .timelineD3-mainContentPad p")[0].hide();

		i2b2.TimelineD3.model.patientIdRecord = idPatient;
		
		// delete prsRecord if there is one, because we will use patientIdRecord
		if (!Object.isUndefined(i2b2.TimelineD3.model.prsRecord)) {
			$$("#timelineD3-displayPatientSetDropped p")[0].innerHTML = "No Patient Set dropped.";
			delete i2b2.TimelineD3.model.prsRecord;
		}

		$$("#timelineD3-displayPatientSetDropped label")[0].addClassName("used");
		$$("#timelineD3-displayPatientSetDropped p")[0].removeClassName("used");
		
		if (i2b2.TimelineD3.model.panelsConceptsDropped.length) {
			i2b2.TimelineD3.model.patientsDatas = {}; // reset Patient Datas
			i2b2.TimelineD3.displayResults(true);
		}

	}

}


i2b2.TimelineD3.conceptDropped = function(sdxData, showDialog) {

	$$("#timelineD3-mainDiv .timelineD3-mainContentPad p")[0].hide();
	$("timelineD3-displayPatientSetDropped").addClassName('visible');

	if (i2b2.TimelineD3.model.lightboxSettingsOpened) {
		i2b2.TimelineD3.closeSettings();
	}

	showDialog = typeof showDialog !== 'undefined' ? showDialog : true;
	sdxData = sdxData[0];	// only interested in first record
	
	if(sdxData.sdxInfo.sdxType == "QM"){ // item is a previous query
		if(showDialog)
			alert("Previous query item being dropped is not supported.");
		return false;
	}
	
	if (sdxData.origData.isModifier) {
		if(showDialog)
			alert("Modifier item being dropped is not supported.");
		return false;	
	}
	
	if (typeof sdxData.origData.table_name == 'undefined'){ // BUG FIX: WEBCLIENT-138
		var results = i2b2.ONT.ajax.GetTermInfo("ONT", {ont_max_records:'max="1"', ont_synonym_records:'false', ont_hidden_records: 'false', concept_key_value: sdxData.origData.key}).parse();
		if(results.model.length > 0){
			sdxData = results.model[0];
		}
 	}
	if (sdxData.origData.table_name.toUpperCase() == "PATIENT_DIMENSION"){
		if(showDialog)
			alert("Patient dimension item being dropped is not supported.");
		return false;
	}
    
    $("timelineD3-dropTarget").style.background = "#CFB";
    setTimeout("$('timelineD3-dropTarget').style.background = '#fff'", 250);

	// save the info to our local data model if the current conceptDropped has not been dropped before
    var continuing = true;

    for (var i = i2b2.TimelineD3.model.panelsConceptsDropped.length - 1; i >= 0; i--) {
    	
    	var sdxOld = i2b2.TimelineD3.model.panelsConceptsDropped[i];
    	
    	if (!Object.isUndefined(sdxOld.origData)) {
			if (sdxData.origData.key == sdxOld.origData.key) {
				continuing = false;
			}
		}
    }

	if (continuing) {

		i2b2.TimelineD3.model.panelsConceptsDropped.push(sdxData);
		i2b2.TimelineD3.model.conceptDropped = sdxData;

		var cdetails = i2b2.ONT.ajax.GetTermInfo("CRC:QueryTool", {concept_key_value:sdxData.origData.key, ont_synonym_records: true, ont_hidden_records: true} );
		
		try { new ActiveXObject ("MSXML2.DOMDocument.6.0"); isActiveXSupported =  true; } catch (e) { isActiveXSupported =  false; }

		if (isActiveXSupported) {
			// Internet Explorer
			xmlDocRet = new ActiveXObject("Microsoft.XMLDOM");
			xmlDocRet.async = "false";
			xmlDocRet.loadXML(cdetails.msgResponse);
			xmlDocRet.setProperty("SelectionLanguage", "XPath");
			var c = i2b2.h.XPath(xmlDocRet, 'descendant::concept');
		} else {										
			var c = i2b2.h.XPath(cdetails.refXML, 'descendant::concept');
		}
		if (c.length > 0) {
				sdxData.origData.xmlOrig = c[0];					
		}	
		
		 var sdxDataNode = i2b2.sdx.Master.EncapsulateData('CONCPT',sdxData.origData);	
		// var sdxRenderData = i2b2.sdx.Master.RenderHTML(tvTree.id, sdxDataNode, renderOptions);
		
		var lvMetaDatas1 = i2b2.h.XPath(sdxData.origData.xmlOrig, 'metadataxml/ValueMetadata[string-length(Version)>0]');
		if ( (lvMetaDatas1.length > 0) && (i2b2.TimelineD3.model.showMetadataDialog)) {
			// bring up popup
			i2b2.TimelineD3.view.modalLabValues.show(this, sdxData.origData.key, sdxData, false);
		// this.showModValues(sdxConcept.origData.key, sdxRenderData);			
		}	

		// sort and display the concept list
		i2b2.TimelineD3.conceptsRender();

		$$("#timelineD3-displayPanelConceptDropped div")[0].addClassName("used");

		// optimization to prevent requerying the hive for new results if the input dataset has not changed
		i2b2.TimelineD3.model.dirtyResultsData = true;

		if (!Object.isUndefined(i2b2.TimelineD3.model.prsRecord) || !Object.isUndefined(i2b2.TimelineD3.model.patientIdRecord)) {
		// if (typeof i2b2.TimelineD3.model.prsRecord !== 'undefined') {

		    if (i2b2.TimelineD3.model.dirtyResultsData) {
				// recalculate the results only if the input data has changed
				i2b2.TimelineD3.model.dirtyResultsData = false;
			}

			i2b2.TimelineD3.displayResults(false);
		}
	}

}


i2b2.TimelineD3.conceptsRender = function() {

	var htmlDisplay = '';
	// are there any concepts in the list
	if (i2b2.TimelineD3.model.panelsConceptsDropped.length) {
		// sort the concepts in alphabetical order
		// i2b2.TimelineD3.model.panelsConceptsDropped.sort(function() {return arguments[0].sdxInfo.sdxDisplayName > arguments[1].sdxInfo.sdxDisplayName});

		// draw the list of concepts
		htmlDisplay += '<ul class="panelsConceptsDroppedList" id="panelsConceptsDroppedList">';
		for (var i1 = 0; i1 < i2b2.TimelineD3.model.panelsConceptsDropped.length; i1++) {
			
			var values = i2b2.TimelineD3.model.panelsConceptsDropped[i1].LabValues;	
			var tt = "";
			if (undefined  != values) {
				switch(values.MatchBy) {
					case "FLAG":
						tt =  ' = '+i2b2.h.Escape(values.ValueFlag);
						break;
					case "VALUE":
						if (values.GeneralValueType=="ENUM") {
							var sEnum = [];
							for (var i2=0;i2<values.ValueEnum.length;i2++) {
								sEnum.push(i2b2.h.Escape(values.NameEnum[i2].text));
							}
							sEnum = sEnum.join("\", \"");
							sEnum = ' =  ("'+sEnum+'")';
							tt = sEnum;
						} else if (values.GeneralValueType=="LARGESTRING") {
							tt = ' [contains "' + i2b2.h.Escape(values.ValueString) + '"]';
						} else if (values.GeneralValueType=="STRING")  {
							if (values.StringOp == undefined )
							{
								var stringOp = "";
							} else {
							switch(values.StringOp) {
								case "LIKE[exact]":
									var  stringOp = "Exact: ";
									break;
								case "LIKE[begin]":
									var  stringOp = "Starts With: ";
									break;
								case "LIKE[end]":
									var  stringOp = "Ends With: ";
									break;
								case "LIKE[contains]":
									var  stringOp = "Contains: ";
									break;
								default:
									var stringOp = "";
									break;
							}
							}
							tt = ' ['+stringOp + i2b2.h.Escape(values.ValueString) + "]";
						} else {
							if (!Object.isUndefined(values.UnitsCtrl))
							{
								tt = values.UnitsCtrl;				
							}
							
							if (values.NumericOp == 'BETWEEN') {
								tt = i2b2.h.Escape(values.ValueLow)+' - '+i2b2.h.Escape(values.ValueHigh);
							} else {
								switch(values.NumericOp) {
								case "LT":
									var numericOp = " < ";
									break;
								case "LE":
									var numericOp = " <= ";
									break;
								case "EQ":
									var numericOp = " = ";
									break;
								case "GT":
									var numericOp = " > ";
									break;
								case "GE":
									var numericOp = " >= ";
									break;
									
								case "":
									break;	
								}
								tt = numericOp +i2b2.h.Escape(values.Value) ;
							}
						}
						break;
					case "":
						break;
				}
			}
			
			htmlDisplay += '<li class="panelConceptDropped">' + i2b2.h.Escape(i2b2.h.HideBreak(i2b2.TimelineD3.model.panelsConceptsDropped[i1].sdxInfo.sdxDisplayName)) + tt;

			htmlDisplay += '<i class="fa fa-trash-o fa-lg delete" aria-hidden="true" onclick="i2b2.TimelineD3.deleteConcept('+i1+');"></i>';

			htmlDisplay + '</li>';
		}

		htmlDisplay += '</ul>';

		// update html
		var divDisplayed = $$("#timelineD3-displayPanelConceptDropped div")[0];

		divDisplayed.innerHTML = htmlDisplay;
		$("timelineD3-displayPanelConceptDropped").addClassName("visible");
		$("timelineD3-mainSettings").addClassName("visible");

		if ($$("#timelineD3-displayPanelConceptDropped div ul")[0].childElements().length > 2) {
			divDisplayed.addClassName("scrollAuto");
		} else {
			divDisplayed.removeClassName("scrollAuto");
		}

		// change background temporarily to give feedback of a successful drop
	    $("timelineD3-dropTarget").style.background = "#CFB";
	    setTimeout("$('timelineD3-dropTarget').style.background = '#fff'", 250);

	} else {
		$("panelsConceptsDroppedList").remove();
	}

}


i2b2.TimelineD3.deleteConcept = function(conceptIndex) {

	// remove the selected concept
	for (patientID in i2b2.TimelineD3.model.patientsDatas) {
		delete i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[i2b2.TimelineD3.model.panelsConceptsDropped[conceptIndex].origData.key];
	}

	i2b2.TimelineD3.model.panelsConceptsDropped.splice(conceptIndex,1);

	// sort and display the concept list in #lightboxContent (if opened) and in .displayContentDropped 
	if (i2b2.TimelineD3.model.lightboxSettingsOpened) {
		i2b2.TimelineD3.displaySettings();
	}

	i2b2.TimelineD3.conceptsRender();

	if (!Object.isUndefined(i2b2.TimelineD3.model.prsRecord) || !Object.isUndefined(i2b2.TimelineD3.model.patientIdRecord)) {
	// if (typeof i2b2.TimelineD3.model.prsRecord !== 'undefined') {
		i2b2.TimelineD3.generateTimeline();
	}

	if (!i2b2.TimelineD3.model.panelsConceptsDropped.length) {
		$$("#timelineD3-displayPanelConceptDropped div")[0].innerHTML = "No panel concept dropped yet.";
		$$("#timelineD3-displayPanelConceptDropped div")[0].removeClassName("used");
	}

}


i2b2.TimelineD3.moveConceptDown = function(conceptIndex) {

	// move down the selected concept
	var currentConcept = i2b2.TimelineD3.model.panelsConceptsDropped[conceptIndex];
	var nextConcept = i2b2.TimelineD3.model.panelsConceptsDropped[conceptIndex + 1];

	i2b2.TimelineD3.model.panelsConceptsDropped[conceptIndex] = nextConcept;
	i2b2.TimelineD3.model.panelsConceptsDropped[conceptIndex + 1] = currentConcept;

	// sort and display the concept list in #lightboxContent and in .displayContentDropped 
	i2b2.TimelineD3.displaySettings();
	i2b2.TimelineD3.conceptsRender();

	i2b2.TimelineD3.generateTimeline();

}


i2b2.TimelineD3.moveConceptUp = function(conceptIndex) {

	// move up the selected concept
	var currentConcept = i2b2.TimelineD3.model.panelsConceptsDropped[conceptIndex];
	var previousConcept = i2b2.TimelineD3.model.panelsConceptsDropped[conceptIndex - 1];

	i2b2.TimelineD3.model.panelsConceptsDropped[conceptIndex] = previousConcept;
	i2b2.TimelineD3.model.panelsConceptsDropped[conceptIndex - 1] = currentConcept;

	// sort and display the concept list in #lightboxContent and in .displayContentDropped 
	i2b2.TimelineD3.displaySettings();
	i2b2.TimelineD3.conceptsRender();

	i2b2.TimelineD3.generateTimeline();

}


i2b2.TimelineD3.displaySettings = function() {

	d3.select("#lightboxSettingsContent").remove();

	i2b2.TimelineD3.model.lightboxSettingsOpened = true;

	d3.select("#lightboxSettings").attr("class", "lightboxing")
		.append("div")
		.attr("class", "lightboxContent")
		.attr("id", "lightboxSettingsContent")
			.append("h3")
			.text("Settings : click on the arrows to move the concepts down or up");
	d3.select("#lightboxSettingsContent").append("div")
		.attr("class", "lightboxContentSub");

	var htmlDisplay = '';
	// are there any concepts in the list
	if (i2b2.TimelineD3.model.panelsConceptsDropped.length) {
		// sort the concepts in alphabetical order
		// i2b2.TimelineD3.model.panelsConceptsDropped.sort(function() {return arguments[0].sdxInfo.sdxDisplayName > arguments[1].sdxInfo.sdxDisplayName});

		// draw the list of concepts
		htmlDisplay += '<ul class="panelsConceptsDroppedList">';
		for (var i1 = 0; i1 < i2b2.TimelineD3.model.panelsConceptsDropped.length; i1++) {
			
			var values = i2b2.TimelineD3.model.panelsConceptsDropped[i1].LabValues;	
			var tt = "";
			if (undefined  != values) {
				switch(values.MatchBy) {
					case "FLAG":
						tt =  ' = '+i2b2.h.Escape(values.ValueFlag);
						break;
					case "VALUE":
						if (values.GeneralValueType=="ENUM") {
							var sEnum = [];
							for (var i2=0;i2<values.ValueEnum.length;i2++) {
								sEnum.push(i2b2.h.Escape(values.NameEnum[i2].text));
							}
							sEnum = sEnum.join("\", \"");
							sEnum = ' =  ("'+sEnum+'")';
							tt = sEnum;
						} else if (values.GeneralValueType=="LARGESTRING") {
							tt = ' [contains "' + i2b2.h.Escape(values.ValueString) + '"]';
						} else if (values.GeneralValueType=="STRING")  {
							if (values.StringOp == undefined )
							{
								var stringOp = "";
							} else {
							switch(values.StringOp) {
								case "LIKE[exact]":
									var  stringOp = "Exact: ";
									break;
								case "LIKE[begin]":
									var  stringOp = "Starts With: ";
									break;
								case "LIKE[end]":
									var  stringOp = "Ends With: ";
									break;
								case "LIKE[contains]":
									var  stringOp = "Contains: ";
									break;
								default:
									var stringOp = "";
									break;
							}
							}
							tt = ' ['+stringOp + i2b2.h.Escape(values.ValueString) + "]";
						} else {
							if (!Object.isUndefined(values.UnitsCtrl))
							{
								tt = values.UnitsCtrl;				
							}
							
							if (values.NumericOp == 'BETWEEN') {
								tt = i2b2.h.Escape(values.ValueLow)+' - '+i2b2.h.Escape(values.ValueHigh);
							} else {
								switch(values.NumericOp) {
								case "LT":
									var numericOp = " < ";
									break;
								case "LE":
									var numericOp = " <= ";
									break;
								case "EQ":
									var numericOp = " = ";
									break;
								case "GT":
									var numericOp = " > ";
									break;
								case "GE":
									var numericOp = " >= ";
									break;
									
								case "":
									break;	
								}
								tt = numericOp +i2b2.h.Escape(values.Value) ;
							}
						}
						break;
					case "":
						break;
				}
			}
			
			htmlDisplay += '<li class="panelConceptDropped">';

			if (i2b2.TimelineD3.model.panelsConceptsDropped.length > 1 ) {
				if (i1 == 0) {
					htmlDisplay += '<i class="fa fa-long-arrow-down moveConcept" onclick="i2b2.TimelineD3.moveConceptDown('+i1+');"></i>';
					htmlDisplay += '<i class="fa fa-long-arrow-up moveConcept unclickable"></i>';
				} else if (i1+1 == i2b2.TimelineD3.model.panelsConceptsDropped.length) {
					htmlDisplay += '<i class="fa fa-long-arrow-down moveConcept unclickable"></i>';
					htmlDisplay += '<i class="fa fa-long-arrow-up moveConcept" onclick="i2b2.TimelineD3.moveConceptUp('+i1+');"></i>';
				} else {
					htmlDisplay += '<i class="fa fa-long-arrow-down moveConcept" onclick="i2b2.TimelineD3.moveConceptDown('+i1+');"></i>';
					htmlDisplay += '<i class="fa fa-long-arrow-up moveConcept" onclick="i2b2.TimelineD3.moveConceptUp('+i1+');"></i>';
				}
			}

			htmlDisplay += i2b2.h.Escape(i2b2.h.HideBreak(i2b2.TimelineD3.model.panelsConceptsDropped[i1].sdxInfo.sdxDisplayName)) + tt;

			htmlDisplay += '<i class="fa fa-trash-o fa-lg delete" aria-hidden="true" onclick="i2b2.TimelineD3.deleteConcept('+i1+');"></i>';

			htmlDisplay + '</li>';
		}

		htmlDisplay += '</ul>';

	// update html
	var divDisplayed = $$("#timelineD3-mainSettings .lightboxContentSub")[0];

	divDisplayed.innerHTML = htmlDisplay;

	}

}


i2b2.TimelineD3.closeSettings = function() {

	i2b2.TimelineD3.model.lightboxSettingsOpened = false;
	d3.select(".lightboxContent").remove();
	d3.select("#lightboxSettings").classed("lightboxing", false);

}


// function that allows to switch to previous or to next patient (with "pagination values")
i2b2.TimelineD3.pgGo = function(dir) {

	var formStart = parseInt($('timelineD3-pgstart').value);
	// var formSize = parseInt($('timelineD3-pgsize').value);
	var formSize = i2b2.TimelineD3.model.pgsize;

	if (!formStart) {formStart = 1;}
	if (!formSize) {formSize = 1;}
	if (formSize<1) {formSize = 1;}
	formStart = formStart + formSize * dir;
	if (formStart<1) {formStart = 1;}

	i2b2.TimelineD3.model.pgstart = formStart;
	i2b2.TimelineD3.model.pgsize = formSize;
	$('timelineD3-pgstart').value = formStart;
	// $('timelineD3-pgsize').value = formSize;

	// remove old results
	d3.select("svg").remove();
	d3.select("#foreignObject").remove();
	i2b2.TimelineD3.model.patientsDatas = {}; // reset Patient Datas

	$$("#timelineD3-mainDiv .results-finished")[0].show();

	// give a brief pause for the GUI to catch up
	setTimeout('i2b2.TimelineD3.displayResults(true);', 50);

}


i2b2.TimelineD3.resetPgGo = function() {

	// reset pagination values
	i2b2.TimelineD3.model.pgstart = 1;
	i2b2.TimelineD3.model.pgsize = 1;

	$('timelineD3-pgstart').value = i2b2.TimelineD3.model.pgstart;
	// $('timelineD3-pgsize').value = i2b2.TimelineD3.model.pgsize ;

}


i2b2.TimelineD3.displayResults = function(usePanelsConceptsDropped) {

	$$("#timelineD3-mainDiv .results-finished")[0].hide();
	$$("#timelineD3-mainDiv .results-working")[0].show();
	
	$("progressing").style.transition = "width 0s";
	$("progressing").style.width = "0%";

	$("progress-informations").innerHTML = "<p>Retrieving datas...</p>";

	$("progressing").style.transitionTimingFunction = "cubic-bezier(0.1, 0.7, 1.0, 0.1)";
	setTimeout('$("progressing").style.transition = "width 40s";', 10);
	setTimeout('$("progressing").style.width = "65%";', 10);

	// generate XML then generate Timeline
	i2b2.TimelineD3.generateMessageFilter(usePanelsConceptsDropped);
	
	i2b2.TimelineD3.generateScopedCallback(usePanelsConceptsDropped);

	// AJAX CALL USING THE EXISTING CRC CELL COMMUNICATOR
	var msg_vals = {patient_limit: 0, PDO_Request: i2b2.TimelineD3.model.msgFilter};
	
	i2b2.CRC.ajax.getPDO_fromInputList("Plugin:TimelineD3", msg_vals, i2b2.TimelineD3.model.scopedCallback);

}


i2b2.TimelineD3.generateMessageFilter = function(usePanelsConceptsDropped) {

	// translate the concept XML for injection as PDO item XML
	var filterList = '';

	if (usePanelsConceptsDropped) {
		for (var i=0; i<i2b2.TimelineD3.model.panelsConceptsDropped.length; i++) {
			var xmlOrig = i2b2.TimelineD3.model.panelsConceptsDropped[i].origData.xmlOrig;
			filterList += i2b2.TimelineD3.initFilterList(xmlOrig);
		}
	} else {
		var xmlOrig = i2b2.TimelineD3.model.conceptDropped.origData.xmlOrig;
		filterList += i2b2.TimelineD3.initFilterList(xmlOrig);
	}

	if (!Object.isUndefined(i2b2.TimelineD3.model.prsRecord)) {

		var pgstart = i2b2.TimelineD3.model.pgstart;
		var pgend = pgstart + i2b2.TimelineD3.model.pgsize - 1;
		
		// nps (test privilege) - not used for now
		if (i2b2.PM.model.userRoles.indexOf("DATA_DEID") == -1) {
			var blob ="false";
		} else {
			var blob ="true";
		}

		i2b2.TimelineD3.model.msgFilter = '<input_list>\n' +
			'	<patient_list max="'+pgend+'" min="'+pgstart+'">\n'+
			'		<patient_set_coll_id>'+i2b2.TimelineD3.model.prsRecord.sdxInfo.sdxKeyValue+'</patient_set_coll_id>\n'+
			'	</patient_list>\n'+
			'</input_list>\n'+
			'<filter_list>\n'+
				filterList+
			'</filter_list>\n'+
			'<output_option>\n'+
			'	<patient_set select="using_input_list" onlykeys="false"/>\n'+
			'	<observation_set blob="true" onlykeys="false"/>\n'+
			'</output_option>\n';
	
	} else {

		i2b2.TimelineD3.model.msgFilter = '<input_list>\n' +
		'	<patient_list max="1" min="0">\n'+  // or <patient_list max="1000000" min="0">\n'+
				// patient_id to get directly THE patient xml from his id = the "i2b2.TimelineD3.model.patientIdRecord" var
		'		<patient_id index="0">'+i2b2.TimelineD3.model.patientIdRecord+'</patient_id>\n'+
		'	</patient_list>\n'+
		'</input_list>\n'+
		'<filter_list>\n'+
			filterList+
		'</filter_list>\n'+
		'<output_option>\n'+
		'	<patient_set select="using_input_list" onlykeys="false"/>\n'+
		'	<observation_set blob="true" onlykeys="false"/>\n'+
		'</output_option>\n';

	}

}


i2b2.TimelineD3.initFilterList = function (xmlOrig) {

		var filterList = '';
		var panelConceptDroppedData = {};

		panelConceptDroppedData.level = i2b2.h.getXNodeVal(xmlOrig, "level");
		panelConceptDroppedData.key = i2b2.h.getXNodeVal(xmlOrig, "key");
		panelConceptDroppedData.tablename = i2b2.h.getXNodeVal(xmlOrig, "tablename");
		panelConceptDroppedData.dimcode = i2b2.h.getXNodeVal(xmlOrig, "dimcode");
		panelConceptDroppedData.synonym_cd = i2b2.h.getXNodeVal(xmlOrig, "synonym_cd");

		filterList +=
		'	<panel name="'+panelConceptDroppedData.key+'">\n'+
		'		<panel_number>0</panel_number>\n'+
		'		<panel_accuracy_scale>0</panel_accuracy_scale>\n'+
		'		<invert>0</invert>\n'+
		'		<item>\n'+
		'			<hlevel>'+panelConceptDroppedData.level+'</hlevel>\n'+
		'			<item_key>'+panelConceptDroppedData.key+'</item_key>\n'+
		'			<dim_tablename>'+panelConceptDroppedData.tablename+'</dim_tablename>\n'+
		'			<dim_dimcode>'+panelConceptDroppedData.dimcode+'</dim_dimcode>\n'+
		'			<item_is_synonym>'+panelConceptDroppedData.synonym_cd+'</item_is_synonym>\n';

		filterList +='</item>\n'+
		'	</panel>\n';

		return filterList;

}


i2b2.TimelineD3.generateScopedCallback = function(usePanelsConceptsDropped) {

	// callback processor
	i2b2.TimelineD3.model.scopedCallback = new i2b2_scopedCallback();
	i2b2.TimelineD3.model.scopedCallback.scope = this;

	i2b2.TimelineD3.model.scopedCallback.callback = function(results) {
		// THIS function is used to process the AJAX results of the getChild call
		//		results data object contains the following attributes:
		//			refXML: xmlDomObject <--- for data processing
		//			msgRequest: xml (string)
		//			msgResponse: xml (string)
		//			error: boolean
		//			errorStatus: string [only with error=true]
		//			errorMsg: string [only with error=true]

		// check for errors
		if (results.error) {
			alert("The results from the server could not be understood.  Press F12 for more information ou fais l'appel à un ami.");
			console.error("Bad Results from Cell Communicator: ",results);
			alert("Bad Results from Cell Communicator: " + results.refXML + "//" + results.errorStatus + "//" + results.errorMsg + "//" + results.msgResponse);

			return false;
		}

		// the first i2b2.TimelineD3.generateTimeline is launched by i2b2.TimelineD3.displayTimeline,
		// which is triggered via i2b2.TimelineD3.getObservationsDatas
		i2b2.TimelineD3.getObservationsDatas(results, usePanelsConceptsDropped);

	}

}


i2b2.TimelineD3.getObservationsDatas = function(results, usePanelsConceptsDropped) {

	$("progress-informations").innerHTML = "<p>Getting observations...</p>";

	$("progressing").style.width = "70%";
	$("progressing").style.transition = "width .2s";
	$("progressing").style.transitionTimingFunction = "ease";

	// get all the patients records informations and their observations
	var patientsXML = i2b2.h.XPath(results.refXML, '//patient');

	var observationsDatas = i2b2.h.XPath(results.refXML, '//*[local-name() = "observation_set"]');
	var panelNames = i2b2.h.XPath(results.refXML, '//*[local-name() = "observation_set"]/@panel_name');

	for (var i=0; i<patientsXML.length; i++) {

		var patientID = i2b2.h.getXNodeVal(patientsXML[i], "patient_id");

		if (Object.isUndefined(i2b2.TimelineD3.model.patientsDatas[patientID])) {
			i2b2.TimelineD3.model.patientsDatas[patientID] = {};
			i2b2.TimelineD3.model.patientsDatas[patientID].id = patientID;
		}

		if (Object.isUndefined(i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts)) {
			i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts = {};
		}

		if (usePanelsConceptsDropped) {
			for (var i1=0; i1<i2b2.TimelineD3.model.panelsConceptsDropped.length; i1++) {
				var xmlOrig = i2b2.TimelineD3.model.panelsConceptsDropped[i1].origData.xmlOrig;
				i2b2.TimelineD3.initPanelsConcepts(patientID, xmlOrig);
			}
		} else {
			var xmlOrig = i2b2.TimelineD3.model.conceptDropped.origData.xmlOrig;
			i2b2.TimelineD3.initPanelsConcepts(patientID, xmlOrig);
		}

		for (var i1=0; i1<observationsDatas.length; i1++) {

			var observationData = i2b2.h.XPath(observationsDatas[i1], 'descendant::observation');
			
			for (var i2=0; i2<observationData.length; i2++) {
				var observation = {};
				observation.event_id = i2b2.h.getXNodeVal(observationData[i2], "event_id");
				observation.patient_id = i2b2.h.getXNodeVal(observationData[i2], "patient_id");
				observation.concept_cd = i2b2.h.getXNodeVal(observationData[i2], "concept_cd");
				observation.observer_cd = i2b2.h.getXNodeVal(observationData[i2], "observer_cd");
				observation.start_date_key = i2b2.h.getXNodeVal(observationData[i2], "start_date");
				observation.modifier_cd = i2b2.h.getXNodeVal(observationData[i2], "modifier_cd");
				observation.instance_num = i2b2.h.getXNodeVal(observationData[i2], "instance_num");
				observation.valuetype_cd = i2b2.h.getXNodeVal(observationData[i2], "valuetype_cd");
				observation.nval_num = i2b2.h.getXNodeVal(observationData[i2], "nval_num");
				observation.valueflag_cd = i2b2.h.getXNodeVal(observationData[i2], "valueflag_cd");
				observation.units_cd = i2b2.h.getXNodeVal(observationData[i2], "units_cd");
				observation.end_date = i2b2.h.getXNodeVal(observationData[i2], "end_date");
				observation.location_cd = i2b2.h.getXNodeVal(observationData[i2], "location_cd");
				observation.tval_char = i2b2.h.getXNodeVal(observationData[i2], "tval_char");
				observation.observation_blob = i2b2.h.getXNodeVal(observationData[i2], "observation_blob");
				var gotten = i2b2.h.XPath(observationData[i2], "descendant-or-self::concept_cd/@name");

				for (var i=0; i<gotten.length; i++) {
					observation.name=gotten[i].nodeValue;
				}

				i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelNames[i1].nodeValue].datas.push(observation);

			}
		}

		getAllLabels();

		async function getAllLabels() {

			var allConceptsCD = [];

			for (var i1 = 0; i1 < observationsDatas.length; i1++) {

				var datas = i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelNames[i1].nodeValue].datas;

				for (var i2 = 0; i2 < datas.length; i2++) {

					var currentConceptCD = datas[i2].concept_cd;

					// if the current concept_cd has not been added in observationsConcepts before,
					// it's pushed in the array allConceptsCD
					if (typeof i2b2.TimelineD3.model.observationsConcepts[currentConceptCD] == "undefined") {
						allConceptsCD.push(currentConceptCD);
					}
				}
			}

			if (i2b2.TimelineD3.model.isWebserviceRunning) {
				await i2b2.TimelineD3.getLabelsFromConceptsCD(allConceptsCD);
			}

			for (var i1 = 0; i1 < observationsDatas.length; i1++) {

				var datas = i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelNames[i1].nodeValue].datas;

				for (var i2 = 0; i2 < datas.length; i2++) {

					if (i2b2.TimelineD3.model.isWebserviceRunning) {
						datas[i2].concept_label = i2b2.TimelineD3.model.observationsConcepts[datas[i2].concept_cd];
					} else {
						datas[i2].concept_label = datas[i2].concept_cd;
					}

					// $("progressing").style.width = Math.round( (i2+1)/datas.length*(1/observationsDatas.length*100) + i1/observationsDatas.length*100 ) + "%";
					// $("progress-informations").innerHTML = "<p>Getting observations : " + Math.round( (i2+1)/datas.length*(1/observationsDatas.length*100) + i1/observationsDatas.length*100 ) + "% </p>";

				}
			}

			$("progressing").style.width = "100%";

			i2b2.TimelineD3.displayTimeline();

		}

	}

}


i2b2.TimelineD3.initPanelsConcepts = function(patientID,xmlOrig) {

	i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[i2b2.h.getXNodeVal(xmlOrig, "key")] = {};
	i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[i2b2.h.getXNodeVal(xmlOrig, "key")].name = i2b2.h.getXNodeVal(xmlOrig, "name");
	i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[i2b2.h.getXNodeVal(xmlOrig, "key")].datas = [];

}


i2b2.TimelineD3.getLabelsFromConceptsCD = async function(allConceptsCD) {

	var urlRequest = "http://i2b2docker.chu-bordeaux.fr:8888/semanticRepository/api/value/list/byValueItem/";
	var response = await requestXHR(urlRequest);

	function requestXHR(url) {
		return new Promise(function(resolve, reject) {
			var xhr = new XMLHttpRequest();
		    
		    xhr.open('POST', url, true)
			//Send the proper header information along with the request
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onreadystatechange = function(e) {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						resolve(xhr.responseText)
					} else {
						resolve(xhr.status);
						i2b2.TimelineD3.model.isWebserviceRunning = false;
						// reject(xhr.status)
					}
				}
			}

			xhr.ontimeout = function () {
				reject('timeout')
			}

		    xhr.send(JSON.stringify(allConceptsCD))
	  })
	}

	if (i2b2.TimelineD3.model.isWebserviceRunning) {

		var currentConceptsJson = JSON.parse(response);
	
		for (var i = 0; i < currentConceptsJson.length; i++) {
			if (typeof currentConceptsJson[i].label !== 'undefined' && currentConceptsJson[i].label.length > 0) {
				// 
				i2b2.TimelineD3.model.observationsConcepts[currentConceptsJson[i].valueItem[0]] = currentConceptsJson[i].label[0];
			} else {
				i2b2.TimelineD3.model.observationsConcepts[currentConceptsJson[i].valueItem[0]] = currentConceptsJson[i].valueItem[0];
			}
		}
	}

}


i2b2.TimelineD3.displayTimeline = function() {

	// Remove the waiting status line and show results from AJAX call to Cell
	d3.timeout(function(){
		$$("#timelineD3-mainDiv .results-working")[0].hide();
		$$("#timelineD3-mainDiv .results-finished")[0].show();

		i2b2.TimelineD3.generateTimeline();
	}, 250)

	d3.select(window)
	  .on("resize", function() {
		i2b2.TimelineD3.generateTimeline();
	});

	d3.select("#plugviewZoomImg")
	  .on("click", function() {
	  	d3.timeout(function(){i2b2.TimelineD3.generateTimeline();}, 10);
	});

}