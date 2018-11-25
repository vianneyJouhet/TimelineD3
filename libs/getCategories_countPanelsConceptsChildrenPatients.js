////////// THINGS TO DO TO MAKE IT WORKING WELL //////////
//
// 1- create array to store panels concepts in i2b2.TimelineD3.Init : i2b2.TimelineD3.model.panelsConcepts = [];
// 2- create variables and objects in i2b2.TimelineD3.Init : i2b2.TimelineD3.model.panelsConceptsChildren = []; i2b2.TimelineD3.model.msgFilterChild = "";
// 3- launch defaults categories (panels concepts) in i2b2.TimelineD3.Init : i2b2.TimelineD3.getCategories();
// 4- when user drop one patient set and (at least) one panel concept, it launches i2b2.TimelineD3.displayResults();
// 5- add a function in i2b2.TimelineD3.displayResults : i2b2.TimelineD3.countPanelsConceptsChildrenPatients();
// 6- purge old datas in i2b2.TimelineD3.Unload : i2b2.TimelineD3.model.panelsConcepts = false;
// 7- copy/paste in timelineD3.js all that wonderful code above :

i2b2.TimelineD3.getCategories = function () {

	var processXML = function(i2b2CellMsg) {
		
		console.group("CALLBACK Processing AJAX i2b2CellMsg");
		console.dir(i2b2CellMsg);
		// the THIS scope is already set to i2b2.TimelineD3.model.panelsConcepts
		//this.clear();
		i2b2.ONT.view.nav.queryResponse = i2b2CellMsg.msgResponse;
		i2b2.ONT.view.nav.queryRequest = i2b2CellMsg.msgRequest;
		if (!i2b2CellMsg.error) {
			var c = i2b2CellMsg.refXML.getElementsByTagName('concept');
			for(var i=0; i<1*c.length; i++) {
				var o = new Object;
				o.xmlOrig = c[i];
				o.name = i2b2.h.getXNodeVal(c[i],'name');
				o.hasChildren = i2b2.h.getXNodeVal(c[i],'visualattributes').substring(0,2);
				o.level = i2b2.h.getXNodeVal(c[i],'level');
				o.key = i2b2.h.getXNodeVal(c[i],'key');
				o.tooltip = i2b2.h.getXNodeVal(c[i],'tooltip');
				o.icd9 = '';
				o.table_name = i2b2.h.getXNodeVal(c[i],'tablename');
				o.column_name = i2b2.h.getXNodeVal(c[i],'columnname');
				o.operator = i2b2.h.getXNodeVal(c[i],'operator');
				o.dim_code = i2b2.h.getXNodeVal(c[i],'dimcode');
				// save the node to the ONT data model
				i2b2.TimelineD3.model.panelsConcepts.push(o);
			}
			
		} else {
			alert("An error has occurred in the Cell's AJAX library.\n Press F12 for more information");
		}
	};
		
	var options = {};
	options.ont_hidden_records = false;
	options.ont_synonym_records = false;	
	
	//var scopeCB = new i2b2_scopedCallback(processXML,i2b2.TimelineD3.model.panelsConcepts);
	var scopeCB = new i2b2_scopedCallback();
	scopeCB.scope=this;
    scopeCB.callback= function(i2b2CellMsg) {
		console.group("CALLBACK Processing AJAX i2b2CellMsg");
		console.dir(i2b2CellMsg);
		// the THIS scope is already set to i2b2.TimelineD3.model.panelsConcepts
		//this.clear();
		i2b2.ONT.view.nav.queryResponse = i2b2CellMsg.msgResponse;
		i2b2.ONT.view.nav.queryRequest = i2b2CellMsg.msgRequest;
		if (!i2b2CellMsg.error) {
			var c = i2b2CellMsg.refXML.getElementsByTagName('concept');
			for(var i=0; i<1*c.length; i++) {
				var o = new Object;
				o.xmlOrig = c[i];
				o.name = i2b2.h.getXNodeVal(c[i],'name');
				o.hasChildren = i2b2.h.getXNodeVal(c[i],'visualattributes').substring(0,2);
				o.level = i2b2.h.getXNodeVal(c[i],'level');
				o.key = i2b2.h.getXNodeVal(c[i],'key');
				o.tooltip = i2b2.h.getXNodeVal(c[i],'tooltip');
				o.icd9 = '';
				o.table_name = i2b2.h.getXNodeVal(c[i],'tablename');
				o.column_name = i2b2.h.getXNodeVal(c[i],'columnname');
				o.operator = i2b2.h.getXNodeVal(c[i],'operator');
				o.dim_code = i2b2.h.getXNodeVal(c[i],'dimcode');
				// save the node to the ONT data model
				i2b2.TimelineD3.model.panelsConcepts.push(o);
			}
			
		} else {
			alert("An error has occurred in the Cell's AJAX library.\n Press F12 for more information");
		}
	};
 		
	i2b2.ONT.ajax.GetCategories("",options,scopeCB );

}


i2b2.TimelineD3.countPanelsConceptsChildrenPatients = function() {

	i2b2.TimelineD3.generateMessageFilterChild();

	i2b2.TimelineD3.generateScopedCallback();

	// AJAX CALL USING THE EXISTING CRC CELL COMMUNICATOR
	var msg_vals = {patient_limit: 0, PDO_Request: i2b2.TimelineD3.model.msgFilterChild};
	i2b2.CRC.ajax.getPDO_fromInputList("Plugin:TimelineD3", msg_vals, i2b2.TimelineD3.model.scopedCallback);

};


i2b2.TimelineD3.generateMessageFilterChild = function() {

	i2b2.TimelineD3.getPanelsConceptsChildren();

	// translate the concept XML for injection as PDO item XML
	var filterList = '';


		for (i2=0; i2<i2b2.TimelineD3.model.panelsConceptsChildren.length; i2++) {

			filterList +=
			'	<panel name="'+i2b2.TimelineD3.model.panelsConceptsChildren[i2].key+'">\n'+
			'		<panel_number>0</panel_number>\n'+
			'		<panel_accuracy_scale>0</panel_accuracy_scale>\n'+
			'		<invert>0</invert>\n'+
			'		<item>\n'+
			'			<hlevel>'+i2b2.TimelineD3.model.panelsConceptsChildren[i2].level+'</hlevel>\n'+
			'			<item_key>'+i2b2.TimelineD3.model.panelsConceptsChildren[i2].key+'</item_key>\n'+
			'			<dim_tablename>'+i2b2.TimelineD3.model.panelsConceptsChildren[i2].tablename+'</dim_tablename>\n'+
			'			<dim_dimcode>'+i2b2.TimelineD3.model.panelsConceptsChildren[i2].dimcode+'</dim_dimcode>\n'+
			'			<item_is_synonym>'+i2b2.TimelineD3.model.panelsConceptsChildren[i2].synonym_cd+'</item_is_synonym>\n';

			filterList +='</item>\n'+
			'	</panel>\n';
		}

	var pgstart = i2b2.TimelineD3.model.pgstart;
	var pgend = pgstart + i2b2.TimelineD3.model.pgsize - 1;
	
	i2b2.TimelineD3.model.msgFilterChild = '<input_list>\n' +
		'	<patient_list max="'+pgend+'" min="'+pgstart+'">\n'+
		'		<patient_set_coll_id>'+i2b2.TimelineD3.model.prsRecord.sdxInfo.sdxKeyValue+'</patient_set_coll_id>\n'+
		'	</patient_list>\n'+
		'</input_list>\n'+
		'<filter_list>\n'+
			filterList+
		'</filter_list>\n'+
		'<output_option names="asattributes">\n'+
		'	<observation_set blob="false" onlykeys="false"/>\n'+
		'	<patient_set select="using_input_list" onlykeys="false"/>\n'+
		'</output_option>\n';
}


i2b2.TimelineD3.getPanelsConceptsChildren = function () {
		
	// reinitialization of the array panelsConceptsChildren
	i2b2.TimelineD3.model.panelsConceptsChildren = [];
	
	// translate the concept XML for injection as PDO item XML
	var msgFilter = [];

	for (var i1=0; i1<i2b2.TimelineD3.model.panelsConceptsDropped.length; i1++) {

		var xmlOrig = i2b2.TimelineD3.model.panelsConceptsDropped[i1].origData.xmlOrig;
		var panelConceptData = {};
		panelConceptData.key = i2b2.h.getXNodeVal(xmlOrig, "key");

		msgFilter.push(panelConceptData.key);
	}

	// AJAX CALL USING THE EXISTING CRC CELL COMMUNICATOR
	for (var i1=0; i1<i2b2.TimelineD3.model.panelsConceptsDropped.length; i1++) {
		var msg_vals = {ont_max_records:'max="200"', ont_synonym_records:'false', ont_hidden_records: 'false', concept_key_value: msgFilter[i1], version:"1.6" };
		var results=i2b2.ONT.ajax.GetChildConcepts("ONT", msg_vals);
		
		var panelsConceptsChildrenData = i2b2.h.XPath(results.refXML, '//concept');

		for (var i2=0; i2<panelsConceptsChildrenData.length; i2++) {
			var level = i2b2.h.getXNodeVal(panelsConceptsChildrenData[i2], "level");
			var key = i2b2.h.getXNodeVal(panelsConceptsChildrenData[i2], "key");
			var tablename = i2b2.h.getXNodeVal(panelsConceptsChildrenData[i2], "tablename");
			var dimcode = i2b2.h.getXNodeVal(panelsConceptsChildrenData[i2], "dimcode");
			var synonym_cd = i2b2.h.getXNodeVal(panelsConceptsChildrenData[i2], "synonym_cd");
			var name = i2b2.h.getXNodeVal(panelsConceptsChildrenData[i2], "name");

			i2b2.TimelineD3.model.panelsConceptsChildren.push({"level":level, "key":key, "tablename":tablename, "dimcode":dimcode, "synonym_cd":synonym_cd, "name":name, "panelOrig":i2b2.TimelineD3.model.panelsConceptsDropped[i1].sdxInfo.sdxDisplayName});
		}
	}
};


i2b2.TimelineD3.getObservationsDatas = function(results) {

	var htmlDisplay = '';
	i2b2.TimelineD3.model.patientsDatas = {};

	// get all the patients records informations and their observations
	
	var patientsXML = i2b2.h.XPath(results.refXML, '//patient');

	var observationsDatas = i2b2.h.XPath(results.refXML, '//*[local-name() = "observation_set"]');
	var panelNames = i2b2.h.XPath(results.refXML, '//*[local-name() = "observation_set"]/@panel_name');
	for (var i=0; i<patientsXML.length; i++) {

		var patientID = i2b2.h.getXNodeVal(patientsXML[i], "patient_id");
		
		htmlDisplay += "<h1>Patient n°" + patientID + "</h1>";

		i2b2.TimelineD3.model.patientsDatas[patientID] = {};

		i2b2.TimelineD3.model.patientsDatas[patientID].id = patientID;
		i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts = {};

		for (var i1=0; i1<i2b2.TimelineD3.model.panelsConcepts.length; i1++) {

			i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[i2b2.TimelineD3.model.panelsConcepts[i1].key] = {};

			i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[i2b2.TimelineD3.model.panelsConcepts[i1].key].name = i2b2.TimelineD3.model.panelsConcepts[i1].name;
			i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[i2b2.TimelineD3.model.panelsConcepts[i1].key].datas = [];

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
				observation.tval_char = i2b2.h.getXNodeVal(observationData[i2], "tval_char");
				observation.nval_num = i2b2.h.getXNodeVal(observationData[i2], "nval_num");
				observation.valueflag_cd = i2b2.h.getXNodeVal(observationData[i2], "valueflag_cd");
				observation.units_cd = i2b2.h.getXNodeVal(observationData[i2], "units_cd");
				observation.end_date = i2b2.h.getXNodeVal(observationData[i2], "end_date");
				observation.location_cd = i2b2.h.getXNodeVal(observationData[i2], "location_cd");
				observation.observation_blob = i2b2.h.getXNodeVal(observationData[i2], "observation_blob");
				var gotten = i2b2.h.XPath(observationData[i2], "descendant-or-self::concept_cd/@name");
				for (var i=0; i<gotten.length; i++) {
					observation.name=gotten[i].nodeValue;
				}

			i2b2.TimelineD3.model.patientsDatas[patientID].panelsConcepts[panelNames[i1].nodeValue].datas.push(observation);

			}
		}

	}

	htmlDisplay += "<div id='graph'></div><div id='labelHover'></div>"

	$$("#timelineD3-mainDiv #timelineD3-infoPDO #timelineD3-graph")[0].innerHTML = htmlDisplay;

}