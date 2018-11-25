// add the code below in the <nav> of injected_screens.html to make it working well.
//
// <button type="button" onclick="i2b2.TimelineD3.getPatientsList();" class="pgGo-btn">Select patient by ID</button>
// <div id="timelineD3-patientsListDropdown" style="display:none;">
// 	<input type="text" placeholder="Search.." onkeyup="i2b2.TimelineD3.filterPatientsList();">
// 	<ul></ul>
// </div>
//

i2b2.TimelineD3.getPatientsList = function() {

	msgFilterPatientsList = '<input_list>\n' +
	'	<patient_list max="1000000" min="0">\n'+
			// patient_set_coll_id to get all patients xml for the selected patient set (prs record).
			// Doesn't work for a PRS record > 200 patients (approximately).
	'		<patient_set_coll_id>'+i2b2.TimelineD3.model.prsRecord.sdxInfo.sdxKeyValue+'</patient_set_coll_id>\n'+
	'	</patient_list>\n'+
	'</input_list>\n'+
	'<filter_list/>\n'+
	'<output_option>\n'+
	'	<patient_set select="using_input_list" onlykeys="false"/>\n'+
	'</output_option>\n';


	var scopedCallback = new i2b2_scopedCallback();
	scopedCallback.scope = this;
	scopedCallback.callback = function(results) {
		// THIS function is used to process the AJAX results of the getChild call
		//		results data object contains the following attributes:
		//			refXML: xmlDomObject <--- for data processing
		//			msgRequest: xml (string)
		//			msgResponse: xml (string)
		//			error: boolean
		//			errorStatus: string [only with error=true]
		//			errorMsg: string [only with error=true]
	
		var retMsg = {
			error: results.error,
			msgRequest: results.msgRequest,
			msgResponse: results.msgResponse,
			msgUrl: results.msgUrl,
			results: null
		};
		var retChildren = [];

		// extract records from XML msg
		var ps = results.refXML.getElementsByTagName('patient');
		var dm = i2b2.CRC.model.QueryMasters;
		for(var i1=0; i1<ps.length; i1++) {
			var o = {};
			o.xmlOrig = ps[i1];
			o.patient_id = i2b2.h.getXNodeVal(o.xmlOrig,'patient_id');
			retChildren.push(o);
		}

		var htmlDisplay = "";

		for (var i = 0; i < retChildren.length; i++) {
			htmlDisplay += '<li onclick="i2b2.TimelineD3.getPatientXML('+retChildren[i].patient_id+');">Patient #'+retChildren[i].patient_id+'</li>';
			// htmlDisplay += '<li title="'+retChildren[i].patient_id+'">'+retChildren[i].patient_id+'</li>';
			
		}

		// update html
		var divDisplayed = $$("#timelineD3-patientsListDropdown ul")[0];
		divDisplayed.innerHTML = htmlDisplay;

		$("timelineD3-patientsListDropdown").show();

	}
	// AJAX CALL USING THE EXISTING CRC CELL COMMUNICATOR
	var msg_vals = {patient_limit: 0, PDO_Request: msgFilterPatientsList};
	
	i2b2.CRC.ajax.getPDO_fromInputList("Plugin:TimelineD3", msg_vals, scopedCallback);

}

i2b2.TimelineD3.getPatientXML = function(id) {

	$$("#timelineD3-mainDiv .results-finished")[0].hide();
	$$("#timelineD3-mainDiv .results-working")[0].show();
	
	$("progressing").style.transition = "width 0s";
	$("progressing").style.width = "0%";

	$("progress-informations").innerHTML = "<p>Retrieving datas...</p>";

	$("progressing").style.transitionTimingFunction = "cubic-bezier(0.1, 0.7, 1.0, 0.1)";
	setTimeout('$("progressing").style.transition = "width 40s";', 10);
	setTimeout('$("progressing").style.width = "65%";', 10);

	var filterList = '';

	for (var i=0; i<i2b2.TimelineD3.model.panelsConceptsDropped.length; i++) {
		var xmlOrig = i2b2.TimelineD3.model.panelsConceptsDropped[i].origData.xmlOrig;
		filterList += i2b2.TimelineD3.initFilterList(xmlOrig);
	}



	msgFilterPatient = '<input_list>\n' +
	'	<patient_list max="1" min="0">\n'+  // or <patient_list max="1000000" min="0">\n'+
			// patient_id to get directly THE patient xml from his id = the "id" parameter
	'		<patient_id index="0">'+id+'</patient_id>\n'+
	'	</patient_list>\n'+
	'</input_list>\n'+
	'<filter_list>\n'+
		filterList+
	'</filter_list>\n'+
	'<output_option>\n'+
	'	<patient_set select="using_input_list" onlykeys="false"/>\n'+
	'	<observation_set blob="true" onlykeys="false"/>\n'+
	'</output_option>\n';
	// '<output_option>\n'+
	// '	<patient_set select="using_input_list" onlykeys="false"/>\n'+
	// '</output_option>\n';

	var scopedCallback = new i2b2_scopedCallback();
	scopedCallback.scope = this;
	scopedCallback.callback = function(results) {
		// THIS function is used to process the AJAX results of the getChild call
		//		results data object contains the following attributes:
		//			refXML: xmlDomObject <--- for data processing
		//			msgRequest: xml (string)
		//			msgResponse: xml (string)
		//			error: boolean
		//			errorStatus: string [only with error=true]
		//			errorMsg: string [only with error=true]
	
		var retMsg = {
			error: results.error,
			msgRequest: results.msgRequest,
			msgResponse: results.msgResponse,
			msgUrl: results.msgUrl,
			results: null
		};
		var retChildren = [];

		// extract records from XML msg
		var ps = results.refXML.getElementsByTagName('patient');
		var dm = i2b2.CRC.model.QueryMasters;
		for(var i1=0; i1<ps.length; i1++) {
			var o = {};
			o.xmlOrig = ps[i1];
			o.patient_id = i2b2.h.getXNodeVal(o.xmlOrig,'patient_id');
			retChildren.push(o);
		}

		i2b2.TimelineD3.getObservationsDatas(results, true);

	}

	// AJAX CALL USING THE EXISTING CRC CELL COMMUNICATOR
	var msg_vals = {patient_limit: 0, PDO_Request: msgFilterPatient};
	
	i2b2.CRC.ajax.getPDO_fromInputList("Plugin:TimelineD3", msg_vals, scopedCallback);
}
