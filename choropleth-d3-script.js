//Width, height, and margins	
var w = 1000;	
var h = 600;			
var margin = {top: 30, right: 50, bottom: 70, left: 50};

//Tooltip 
var div = d3.select("body").append("div")   
  .attr("class", "tooltip")               
  .style("opacity", 0);

//Define map projection
			
var projection = d3.geoAlbersUsa()							   
.translate([w/2, h/2])								   
.scale([700]);
			
//Define path generator	
var path = d3.geoPath()				
.projection(projection);
							 
			
//Define threshold scale to sort data values into buckets of color
			
var color = d3.scaleThreshold()
.domain([-16, -6, 5, 16])							
.range(["#fee5d9", "#fcae91", "#fb6a4a", "#de2d26", "#a50f15"]);
								
  	
//Create SVG element		
var svg = d3.select("body")			
.append("svg")				
.attr("width", w)				
.attr("height", h);
			
//Chart title
svg.append("text")
       .attr("x", (w / 2))
	.attr("y", 0+(h/8))             
        .attr("text-anchor", "middle")  
        .style("font-size", "18px") 
        .style("font-family", "Calibri")
        .style("text-decoration", "underline")  
        .text("Annual Percentage Change in New Credit Card Volume");

//Load in credit card data			
d3.csv("map_data_CRC.csv", function(data) {
				
	//Load in GeoJSON data
	d3.json("us-states.json", function(json) {
					
	//Merge the credit card data and GeoJSON
					
	for (var i = 0; i < data.length; i++) {	
	
		//Get state name		
		var dataState = data[i].state;		
		
		//Get data value, and convert from string to float			
		var dataValue = parseFloat(data[i].value);
		var dataRound = Math.round(dataValue*100);
	
		//Find the corresponding state inside the GeoJSON	
		for (var j = 0; j < json.features.length; j++) {		
			var jsonState = json.features[j].properties.name;		
			if (dataState == jsonState) {				
			//Copy the data value into the JSON				
			json.features[j].properties.value = dataRound;								
			break;								
			}			
		}						
	}
					
	//Bind data and create one path per GeoJSON feature		
	svg.selectAll("path")			  
	.data(json.features)			   
	.enter()			   
	.append("path")
	.attr("d", path)			   
	.style("fill", function(d) {
				   		
		//Get data value		   		
		var value = d.properties.value;		   		
		if (value) {		   			
		//If value exists…			   		
		return color(value);		   		
		} else {		   			
		//If value is undefined…		   		
		return "#ccc";		   		
		}
					
   	})

  //Adding mouse events
  .on("mouseover", function(d) {
    d3.select(this).transition().duration(300).style("fill", "steelblue");
    div.transition().duration(300).style("opacity", 1)
    div.text(d.properties.name + " : " + d.properties.value+"%")
    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY -30) + "px");
  })
  .on("mouseout", function() {
    d3.select(this).transition().duration(300)
    .style("fill", function(d){ var value = d.properties.value; if (value) {return color(value);} else {return "#ccc";}
});
    div.transition().duration(300)
    .style("opacity", 0);
  })
  
  	});
			
				
});
	
	
//Legend 
  var legend_color_domain = [-100, -15, -6, 5, 16]
  var legend_labels = ["-16 % or less", "-15% to -6%", "-5% to 5%", "6% to 15%", "16% or greater"] 
  var legend = svg.selectAll("g.legend")
  .data(legend_color_domain)
  .enter().append("g")
  .attr("class", "legend");

  var leg_w = 20, leg_h = 20;

  legend.append("rect")
  .attr("x", 20)
  .attr("y", function(d, i){ return h - (i*leg_h) - 2*leg_h;})
  .attr("width", leg_w)
  .attr("height", leg_h)
  .style("fill", function(d, i) { return color(d); })
  .style("opacity", 0.8);

  legend.append("text")
  .attr("x", 50)
  .attr("y", function(d, i){ return h - (i*leg_h) - leg_h - 4;})
  .attr("font-family", "Calibri")
  .text(function(d, i){ return legend_labels[i]; });