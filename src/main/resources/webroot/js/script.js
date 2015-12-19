
$(document).ready(function(){
	
  $('#datasource').on('change', function() {
	if(this.value == "graphfile")
	{
		$("#searchField").attr('disabled', 'disabled');
		isGraphfile = true;
	} 
	else{
		$("#searchField").removeAttr("disabled");
		isGraphfile = false;		
	}
});
  
	$('.nodecentrality').jRange({
		from: 0,
		to: 100,
		step: 1,
		scale: [0,25,50,75,100],
		format: '%s',
		width: 300,
		snap : true
	});
	
	
	$('.pagerank').jRange({
		from: 0,
		to: 100,
		step: 1,
		scale: [0,25,50,75,100],
		format: '%s',
		width: 300,
		snap : true
	});
	
	$('.neighborcount').jRange({
		from: 0,
		to: 100,
		step: 1,
		scale: [0,25,50,75,100],
		format: '%s',
		width: 300,
		snap : true,
		//ondragend: fucntion(value) {
			//alert(value);
	//	}
		
	});
  
  sigma.classes.graph.addMethod('neighbors', function(nodeId) {
  var k,
  neighbors = {},
  index = this.allNeighborsIndex[nodeId] || {};
  for (k in index)
    neighbors[k] = this.nodesIndex[k];
    return neighbors;
  });
  
  
	document.body.style.backgroundColor = color;
   $('#clickbtn').click(function(event) {
   	$("#loader_img").css("visibility", "visible");
    event.preventDefault();
  	if($('#filters').css('display')=="block"){
  	// $("#filters").css("display", "none");
  	}
  	else{
  	$("#layouts").css("display", "none");
  	}
//  Field Values
	var searchFieldValue = $("#searchField").val();
    var nodecentralityValue = $(".nodecentrality").val();
    var pagerankthreshholdValue = $(".pagerank").val();
	var neighborcount = $(".neighborcount").val();
    var layoutValue=$('#lt').val();
    var nodesizebyvalue=$('#nodesizeby').val();
    var datasource=$('#datasource').val();
	 console.log(nodecentralityValue);
	 console.log(pagerankthreshholdValue);
	 console.log(neighborcount);
    function emptyfieldvalue(value){
		value = "null";
		return value;
	} 
	if(nodecentralityValue==''){
    	
    		nodecentralityValue = emptyfieldvalue(nodecentralityValue) ;
    	
    	}
    if( pagerankthreshholdValue=='')
    	{
    		 pagerankthreshholdValue = emptyfieldvalue(pagerankthreshholdValue);
    	}
    if(datasource==''){
    		datasource = emptyfieldvalue(datasource);
    }
	
	
	function emptyfieldbordercolor(value){
		 $(value).css('border','2px solid red');
		 return false;
		 
	}
	
	function nonemptyfieldbordercolor(value){
		$(value).css('border','');
	}
	
    var lssettings= {
        "limit": 5000,
        "ES_SERVER_IP": "52.4.65.24",
        "sentiment": "null",
        "sampleSize": 5000,
        "samplingRatio": 75,
        "estimatedTime": 500,
        "nct": 10,
        "prt": 10,
        "la": {
            "name": "YifanHuLayout",
            "it": 100,
            "distance": 260
        }
    };
    
    if(searchFieldValue=='' && datasource != "graphfile"){
        emptyfieldbordercolor('#searchField');
    }
    else{
		nonemptyfieldbordercolor('#searchField');
	}
	 if(datasource==null){
	    emptyfieldbordercolor('#datasource');
    }
    else
	{
	    nonemptyfieldbordercolor('#datasource')
	}	
	
	/*<![CDATA[*/
     if((searchFieldValue!='' && datasource != "null") || isGraphfile){
   jQuery.ajax({
    type: "get",
   // url: "http://localhost:8080/graph?searchField="+$("#searchField").val(),
   url: "http://localhost:8080/ajax",
   data:{searchField:searchFieldValue,nc:nodecentralityValue,prt:pagerankthreshholdValue,layouttype:layoutValue,NodeSizeBy:nodesizebyvalue,NeighborCountRange:neighborcount,datasource:datasource,ls:JSON.stringify(lssettings)},
     async : true,
    beforeSend: function(xhr) { 
    },
    success: function (graphData) {
     nodesObject = JSON.parse(graphData);
     if (nodesObject === undefined || nodesObject === null) {
     	  $(".message").html("Error generating graph from given Inputs");
    	  $(".message").css("display","block");
    	  $("#container").empty();
     }
      if(nodesObject.nodes.nodes.length > 0){
	  $(".message").css("display","none");
	  showGraph(nodesObject.nodes, document.getElementById('container'), Gsetting);
	  }
	  else{
	 $(".message").html("No data available for given terms");
	  $(".message").css("display","block");
	  $("#container").empty();
	  }
	  $("#loader_img").css("visibility", "hidden");
    },
    error: function(a, b, c){
    	$(".message").html("Internal server error");
  	  $(".message").css("display","block");
	  $("#container").empty();
    }
});
}/*]]>*/
});

 function onclick(searchFieldValue){
	   searchFieldValue = "null";
	   $("#searchField").prop('disabled', true);
	   return searchFieldValue;
   }
   function showGraph(givenData, givenContainer, givenSettings){
    givenContainer.innerHTML = "";
         s = new sigma( {
            graph : givenData,
            renderer: {
              container:givenContainer,
              type: 'canvas'
            },
            settings:givenSettings
          });
     totalEdges = s.graph.edges();
   for (var i in totalEdges) {
 	 totalEdges[i].type = 'curve';
 	}
   s.graph.nodes().forEach(function(n) {
      n.originalColor = n.color;
      n.originalLabel = n.label;
   });
   s.graph.edges().forEach(function(e) {
     e.originalColor = e.color;
   });
   
  s.bind('overNode', function(e){
    var nodeId = e.data.node.id;
    toKeep = s.graph.neighbors(nodeId);
    toKeep[nodeId] = e.data.node;

    s.graph.nodes().forEach(function(n) {
      if (toKeep[n.id]){
        n.color = n.originalColor;
        n.label = n.originalLabel;
      }else{
        n.color = 'blue';
        n.label = "";
      }

    });

    s.graph.edges().forEach(function(e) {
      if (toKeep[e.source] && toKeep[e.target])
        e.color ='green';
      else
       e.color = e.originalColor;
    });

    s.refresh();
  });
  s.refresh();
   }
 });  