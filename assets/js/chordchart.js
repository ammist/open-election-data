(function(){

	this.Chordchart = (function(){
	
		// format = candidate, total, location
		Chordchart.prototype.amounts = {};
		
		Chordchart.prototype.relMatrix= {};
		
		function Chordchart(){
		  
     	var width = 720,
					height = 720,
					outerRadius = Math.min(width, height) / 2 - 10,
					innerRadius = outerRadius - 24;

			var formatPercent = d3.format(".1%");

			var arc = d3.svg.arc()
					.innerRadius(innerRadius)
					.outerRadius(outerRadius);

			var layout = d3.layout.chord()
					.padding(.04)
					.sortSubgroups(d3.descending)
					.sortChords(d3.ascending);

			var path = d3.svg.chord()
					.radius(innerRadius);

			var svg = d3.select("body").append("svg")
					.attr("width", width)
					.attr("height", height)
				.append("g")
					.attr("id", "circle")
					.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

			svg.append("circle")
					.attr("r", outerRadius);
		
		
			//load the input data
			
			d3.csv('assets/data/spreadsheet/mayoral_income.csv', function(data){
				
			});
			
			// create the matrix of relationships
			
			// draw the chord graph
			
		}
		
		return Chordchart;
		
	})();
		
}.call(this));

