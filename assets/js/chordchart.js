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

    return {matrix: outputMatrix,
            labels: candidates.concat(locations)};
  }

  this.Chordchart = (function(){

    function Chordchart() {
      this.init = function(data) {
        var mangled = mangleMatrix(data);
        var matrix = mangled.matrix;
        var labels = mangled.labels;
      
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
            .range(["#333333", "#FFDD89", "#755224", "#F26223"]);

        var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height)
          .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

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

        // Shamelessly from mbostock's Uber SF ride demonstration
        // Add a group per data element to bind labels and a tooltip.
        var group = svg.selectAll(".group")
          .data(chord.groups)
          .enter().append("g")
          .attr("class", "group")
          .on("mouseover", fade(.1))
          .on("mouseout", fade(1));


        // Add a mouseover tooltip title with the full label.
        group.append("title").text(function(d, i) {
          return labels[i];
        });

        // Add the group arc
        var groupPath = group.append("path")
          .attr("id", function(d, i) { return "group" + i; })
          .style("fill", function(d) { return fill(d.index); })
          .style("stroke", function(d) { return fill(d.index); })
          .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius));

        // Add a text label.
        var groupText = group.append("text")
          .attr("x", 6)
          .attr("dy", 15)
          .attr("fill", function (d) { return "#667788";});

        groupText.append("textPath")
          .attr("xlink:href", function(d, i) { return "#group" + i; })
          .text(function(d, i) { return labels[i].replace(/ for |mayor|oakland(?!$)/ig, ""); }); // truncate for better fit.  "for" is part of California and "Oakland" is a standalone locations, so we protect the regex match a little.

        // Remove the labels that don't fit. :(
         groupText.filter(function(d, i) { return groupPath[0][i].getTotalLength() / 2 - 16 < this.getComputedTextLength(); })
          .remove();

        // /Shameless

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
	})();
		
}.call(this));

