(function(){

  function mangleMatrix(data) {
    var amountByLocation = {};
    data.forEach(function(datum) {
      var amount = parseInt(datum.Tran_Amt1);
      var location = 'Other';
      if (datum.Tran_State == 'CA') {
        location = 'California';
      }
      if (datum.Tran_City == 'Oakland') {
        location = 'Oakland';
      }
      var candidate = datum.Filer_NamL;
      if (! amountByLocation[candidate]) {
        amountByLocation[candidate] = {};
      }
      if (! amountByLocation[candidate][location]) {
        amountByLocation[candidate][location] = 0;
      }
      amountByLocation[candidate][location] += amount;
    });
  
    var candidates = Object.keys(amountByLocation);
    var numCandidates = candidates.length;
    var locations = ["Oakland", "California", "Other"];
    var numLocations = locations.length;
    console.log("Candidates are", candidates, "; locations are", locations);
    var normalForm = [];
    for (var candidateIndex = 0; candidateIndex < numCandidates; ++candidateIndex) {
      normalForm[candidateIndex] = [];
      for (var locationIndex = 0; locationIndex < numLocations; ++locationIndex) {
        normalForm[candidateIndex][locationIndex] = 
          amountByLocation[candidates[candidateIndex]][locations[locationIndex]];
      }
    }
  
    var outputMatrix = [];
    for (var i = 0; i < numLocations + numCandidates; ++i) {
      outputMatrix[i] = [];
      for (var j = 0; j < numLocations + numCandidates; ++j) {
        outputMatrix[i][j] = 0;
        if (i >= numCandidates && j < numCandidates) {
          outputMatrix[i][j] = normalForm[j][i-numCandidates] || 0;
        }
        if (i < numCandidates && j >= numCandidates) {
          outputMatrix[i][j] = normalForm[i][j-numCandidates] || 0;
        }
      }
    }
    console.log(outputMatrix);
    return outputMatrix;
  }

	this.Chordchart = (function(){

    function Chordchart() {
      this.init = function(data) {
        var matrix = mangleMatrix(data);
      
        // From http://mkweb.bcgsc.ca/circos/guide/tables/
        // var matrix = [
        //   [11975,  5871, 8916, 2868, 100, 200, 300, 400],
        //   [ 1951, 10048, 2060, 6171, 100, 200, 300, 400],
        //   [ 8010, 16145, 8090, 8045, 100, 200, 300, 400],
        //   [ 1013,   990,  940, 6907, 100, 200, 300, 400],
        //   [11975,  5871, 8916, 2868, 100, 200, 300, 400],
        //   [ 1951, 10048, 2060, 6171, 100, 200, 300, 400],
        //   [ 8010, 16145, 8090, 8045, 100, 200, 300, 400],
        //   [ 1013,   990,  940, 6907, 100, 200, 300, 400]
        // ];

        var chord = d3.layout.chord()
            .padding(.05)
            .sortSubgroups(d3.descending)
            .matrix(matrix);

        var width = 960,
            height = 500,
            innerRadius = Math.min(width, height) * .41,
            outerRadius = innerRadius * 1.1;

        var fill = d3.scale.ordinal()
            .domain(d3.range(4))
            .range(["#000000", "#FFDD89", "#957244", "#F26223"]);

        var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height)
          .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        svg.append("g").selectAll("path")
            .data(chord.groups)
          .enter().append("path")
            .style("fill", function(d) { return fill(d.index); })
            .style("stroke", function(d) { return fill(d.index); })
            .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
            .on("mouseover", fade(.1))
            .on("mouseout", fade(1));

        var ticks = svg.append("g").selectAll("g")
            .data(chord.groups)
          .enter().append("g").selectAll("g")
            .data(groupTicks)
          .enter().append("g")
            .attr("transform", function(d) {
              return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                  + "translate(" + outerRadius + ",0)";
            });

        ticks.append("line")
            .attr("x1", 1)
            .attr("y1", 0)
            .attr("x2", 5)
            .attr("y2", 0)
            .style("stroke", "#000");

        ticks.append("text")
            .attr("x", 8)
            .attr("dy", ".35em")
            .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180)translate(-16)" : null; })
            .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
            .text(function(d) { return d.label; });

        svg.append("g")
            .attr("class", "chord")
          .selectAll("path")
            .data(chord.chords)
          .enter().append("path")
            .attr("d", d3.svg.chord().radius(innerRadius))
            .style("fill", function(d) { return fill(d.target.index); })
            .style("opacity", 1);

        // Returns an array of tick angles and labels, given a group.
        function groupTicks(d) {
          var k = (d.endAngle - d.startAngle) / d.value;
          return d3.range(0, d.value, 10000).map(function(v, i) {
            return {
              angle: v * k + d.startAngle,
              label: i % 5 ? null : v / 1000 + "k"
            };
          });
        }

        // Returns an event handler for fading a given chord group.
        function fade(opacity) {
          return function(g, i) {
            svg.selectAll(".chord path")
                .filter(function(d) { return d.source.index != i && d.target.index != i; })
              .transition()
                .style("opacity", opacity);
          };
        }
      }
      d3.csv('assets/data/data.csv', this.init.bind(this));
    }	
    return Chordchart;
    // // format = candidate, total, location
    // Chordchart.prototype.amounts = {};
    // 
    // Chordchart.prototype.relMatrix= {};
    // 
    // function Chordchart(){
    //   
    //        var width = 720,
    //       height = 720,
    //       outerRadius = Math.min(width, height) / 2 - 10,
    //       innerRadius = outerRadius - 24;
    // 
    //   var formatPercent = d3.format(".1%");
    // 
    //   var arc = d3.svg.arc()
    //       .innerRadius(innerRadius)
    //       .outerRadius(outerRadius);
    // 
    //   var layout = d3.layout.chord()
    //       .padding(.04)
    //       .sortSubgroups(d3.descending)
    //       .sortChords(d3.ascending);
    // 
    //   var path = d3.svg.chord()
    //       .radius(innerRadius);
    // 
    //   var svg = d3.select("body").append("svg")
    //       .attr("width", width)
    //       .attr("height", height)
    //     .append("g")
    //       .attr("id", "circle")
    //       .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    // 
    //   svg.append("circle")
    //       .attr("r", outerRadius);
    // 
    // 
    //   //load the input data
    //   
    //   d3.csv('assets/data/data.csv', function(data){
    //     
    //   });
    //   
    //   // create the matrix of relationships
    //   
    //   // draw the chord graph
    //   
    // }
    // 
    // return Chordchart;
		
	})();
		
}.call(this));

