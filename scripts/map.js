let geoPath,
    projection,
    minMax,
    colorScale,
    affectedLoc,
    wcLocations = [],
    totalCases  = [],
    totalDeaths = [],
    PromiseWrapper = (xhr, d) => new Promise(resolve => xhr(d, (p) => resolve(p))),
    colorArray = [
        "#c92101",
        "#ff684c",
        "#ff8f7a",
        "#ffb5a7"
    ];

const X_AXIS = 700;
const Y_AXIS = 250;
const SCALE_VALUE = 192;

Promise
    .all([
        PromiseWrapper(d3.json, "data/world.geojson"),
        PromiseWrapper(d3.csv, "data/covid.csv")
    ])
    .then(resolve => {
        createMap(resolve[0], resolve[1]);
    });

function createMap(countries, covid) {
    
    minMax = d3.extent(totalCases);
    colorScale = d3.scaleOrdinal().domain(minMax).range(colorArray);
    projection = d3.geoOrthographic()
                   .scale(SCALE_VALUE)
                   .translate([X_AXIS, Y_AXIS]);

    geoPath = d3.geoPath().projection(projection);
    
    const mapSvg = d3.select("#map svg");
    const g = mapSvg.append("g");
    

    g.selectAll("path")
     .data(countries.features)
     .enter()
     .append("path")
     .attr("d", geoPath)
     .attr("class", "country")
     .style("fill", "#fff1ee")
     .style("opacity", 0.7);
    
    
    affectedLoc = g.selectAll("path")
                   .filter( (d, i) => {

                       covid.forEach(data => {
                          if (data.date == DATE && data.location != "World" && +data.total_cases > 0 && data.location === d.properties.name  ) {

                              wcLocations[i] = d.properties.name;
                              totalDeaths[i] = +data.total_deaths;
                              totalCases[i]  = +data.total_cases;
                          }
                       });

                       return wcLocations.indexOf(d.properties.name) > -1;
                   });
    
    g.append('path')
     .datum({type:"Sphere"})
     .attr('d', geoPath)
     .attr('class', 'stroke');
    
    
     affectedLoc.style("fill", (d,i) => colorScale(totalCases[i]));
    
    
    
    const zoom = d3.zoom()
             .on('zoom', () => { g.attr('transform', d3.event.transform); });
    
    
    
    mapSvg.call(zoom);
    
    g.selectAll("path").on("mouseover", function (d, i) {
        var tooltip = d3.select("#map")
                        .append("div")
                        .attr("class", "tooltip");
        
        d3.selectAll("path").style("opacity", 0.5);
        d3.select(this).style("opacity", 1);
        d3.select(this).style("stroke", "black");
        d3.select(this).style("stroke-width", "1");
                
        var data = "<h3>" + (d.properties != undefined ? d.properties.name : 'Name') + "</h3><p>Total Cases: " + (wcLocations[i] != undefined ? totalCases[i] : 0 ) + "</p><p>Total Deaths: " + (wcLocations[i] != undefined ? totalDeaths[i] : 0 ) + "</p>";
        
        tooltip.html(data);
    });
    
    
    g.selectAll("path").on("mouseout", function (d, i) {
        d3.selectAll("path").style("opacity", 0.7);
        d3.select(this).style("stroke", "none");
        d3.select(".stroke").style("stroke", "#000");
        d3.selectAll(".tooltip").remove();
    });
    
    
    
    
    var drag = d3.drag()
                 .on("start", dragstarted)
                 .on("drag", dragged)
                 .on("end", dragended);
    
    g.call(drag);

    
    let gpos1, gpos2, angle1, angle2;

    function dragstarted(){
        
        gpos1  = projection.invert(d3.mouse(this));
        angle1 = projection.rotate();

        g.insert("path")
         .datum({type: "Point", coordinates: gpos1})
         .attr("class", "point")
         .attr("d", geoPath).style("cursor", "grab");
    }

    function dragged(){

        gpos2  = projection.invert(d3.mouse(this));
        angle1 = projection.rotate();

        angle2 = eulerAngles(gpos1, gpos2, angle1);
        projection.rotate(angle2);

        g.selectAll(".point")
         .datum({type: "Point", coordinates: gpos2});
        
        g.selectAll("path").attr("d", geoPath).style("cursor", "grabbing");

    }

    function dragended(){
        g.selectAll(".point").remove();
    }
    
    

};

