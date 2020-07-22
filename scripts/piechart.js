let bottom10 = [],
    arr1 = [],
    arr2 = [];

var getCountriesData;

var PromiseWrap = (xhr, d) => new Promise(resolve => xhr(d, (p) => resolve(p)));

Promise
    .all([
        PromiseWrap(d3.json, "data/world.geojson"),
        PromiseWrap(d3.csv, "data/covid.csv")
    ])
    .then(resolve => {
        createMap2(resolve[0], resolve[1]);
    });


function createMap2(countries, covid) {
    
    top10    = getAffected(covid, "most");
    bottom10 = getAffected(covid, "least");
    
    top10.forEach(m => arr1.push(m.total_case));
    bottom10.forEach(n => arr2.push(n.total_case));
    
    var aProjection = d3.geoMercator()
                        .scale(100)
                        .translate([350, 200])
                        .center([30, 30]);

    var geoPath = d3.geoPath().projection(aProjection);
    
    getCountriesData = countries;

            
    d3.select("#map2")
      .selectAll("path")
      .data(countries.features)
      .enter()
      .append("path")
      .attr("d", geoPath)
      .attr("class", "locations")
      .style("fill", "grey");
}


function affectedAreas(arg) {
    
    var filtered, pieData, minVal, extentVal;

    var pieSvg    = d3.select("svg#piechart"),
        width  = +pieSvg.attr("width"),
        height = +pieSvg.attr("height"),
        radius = Math.min(width, height) / 2,
        g      = pieSvg.append("g").attr("transform", "translate(320,280)");

    if (arg === "Most") {
        filtered = filterMap(top10);
        filtered.style("fill", "orange");
        pieData = top10;
        minVal = d3.min(arr1);
        extentVal = d3.extent(arr1);
        pieSvg.selectAll(".arc").selectAll("#countTxt").remove();

    } else if (arg === "Least") {
        filtered = filterMap(bottom10);
        filtered.style("fill", "yellow");
        pieData = bottom10;
        minVal = d3.min(arr2);
        extentVal = d3.extent(arr2);
        pieSvg.selectAll(".arc").selectAll("#countTxt").remove();
    }


    var pieChart   = d3.pie().sort(null).value(minVal);
    var colorScale = d3.scaleOrdinal().domain(extentVal).range(colorArray);

    var newArc = d3.arc()
                   .innerRadius(40)
                   .outerRadius(radius - 40);

    var label = d3.arc()
                  .innerRadius(radius)
                  .outerRadius(radius - 180);

    d3.select("#viz2").select("h1").text(arg + " Effected Areas");


    var arc = g.selectAll(".arc")
               .data(pieChart(pieData))
               .enter()
               .append("g")
               .attr("class", "arc")
               .attr("stroke", "black")
               .on("mouseover",function(d){
                   d3.select(this)
                     .transition()
                     .duration(50)
                     .style("stroke", "black")
                     .style("stroke-width", "1px")
                     .style("opacity", 0.5)
                     .style("cursor", "pointer");
               })
               .on("mouseout",function(d){
                   d3.select(this)
                     .transition()
                     .duration(50)
                     .style("opacity", 1);
               });


    arc.append("path")
       .attr("d", newArc)
       .attr("fill", d => colorScale(d.data.total_case));
    

    arc.append("text")
       .attr("transform", d => "translate(" + label.centroid(d) + ")")
       .attr("id", "countTxt")
       .attr("text-anchor", "middle")                         
       .text(d => d.data.country); 

}



function filterMap(para) {
    var a = [];
    return d3.selectAll("path.locations")
             .style("fill", "grey")
             .data(getCountriesData.features)
             .filter((d, i) => {
        
                
                para.forEach(s => {
                    
                    if (s.country === "U.K") {
                        s.country = "United Kingdom";
                        
                    } else if (s.country === "U.S.A") {
                        s.country = "United States";   
                               
                    }
                    
                    if (s.country === d.properties.name) {
                        
                        a.push(s.country);
                    }
                    
                });
                return a.indexOf(d.properties.name) > -1;
             });
}

