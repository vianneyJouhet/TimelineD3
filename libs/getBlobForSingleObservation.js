i2b2.TimelineD3.getBlobForObservation = function(d) {

	var msg_filter = '<fact_primary_key>\n' +
		'		<event_id>'+d.event_id+'</event_id>\n'+
		'		<patient_id>'+d.patient_id+'</patient_id>\n'+
		'		<concept_cd>'+d.concept_cd+'</concept_cd>\n'+
		'		<observer_id>'+d.observer_cd+'</observer_id>\n'+

		'</fact_primary_key>\n<fact_output_option blob="true" onlykeys="false"/>\n';

	// callback processor
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
		
		// check for errors
		if (results.error) {
			alert('The results from the server could not be understood.  Press F12 for more information.');
			console.error("Bad Results from Cell Communicator: ",results);
			return false;
		}

		var observation_blob = i2b2.h.getXNodeVal(results.refXML, 'observation_blob');				

	}

	// AJAX CALL USING THE EXISTING CRC CELL COMMUNICATOR
	i2b2.CRC.ajax.getIbservationfact_byPrimaryKey("Plugin:Timeline", {PDO_Request:msg_filter}, scopedCallback);
		
}