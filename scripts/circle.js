const marX = 80;
const marY = 100;

const circleSvg = d3.select('#circle svg');

const circle = circleSvg.append('g')
                 .attr('transform', `translate(${marX}, ${marY})`);
let top10 = [];

let names = [ "Total Cases", "New Cases", "Total Deaths" ];

d3.csv("data/covid.csv", d => getCircleData(d));

function getCircleData(data) {
    
    top10 = getAffected(data, "most");
            
    circle.selectAll("g")
      .data(top10)
      .enter()
      .append("g")
      .attr("class", "countries")
      .attr("transform", (d, i) => `translate(${(i * 100)}, 0)`);
    
    
    var countries = d3.selectAll("g.countries");

    countries.append("circle").attr("r", 60)
             .transition()
             .delay((d, i) => i * 100)
             .duration(200)
             .attr("r", 60)
             .transition()
             .duration(500)
             .attr("r", 40);

    countries.append("text")
             .style("text-anchor", "middle")
             .attr("class", "txt")
             .attr("y", 80)
             .text(d => d.country);

    d3.selectAll("g.countries")
      .insert("image", "text")
      .attr("xlink:href", d => `images/${d.country}.png`)
      .attr("width", "40px").attr("height", "30px").attr("x", "-15")
      .attr("y", "100");
                    

    d3.select("#controls")
      .selectAll("button.cntry")
      .data(names)
      .enter()
      .append("button")
      .attr("class", "cntry")
      .on("click", buttonClick)
      .html(d => d);

    function buttonClick(datapoint) {
        let key = "",
            arr = [];
        
        if (datapoint === "Total Deaths") {
            key = "total_death";
            
        } else if (datapoint === "Total Cases") {
            key = "total_case";
            
        } else if (datapoint === "New Cases") {
            key = "new_case";
            
        }
        
        var maxValue = d3.max(top10, e => parseFloat(e[key]) );
        
        top10.forEach(k => arr.push(k.total_death));
        
        
        var minMaxValue = d3.extent(arr);

        var tenColorScale = d3.scaleOrdinal()
            .domain(minMaxValue)
            .range(colorArray);

        var radiusScale = d3.scaleLinear().domain([0, maxValue]).range([6, 40]);

        d3.selectAll("g.countries").select("circle").transition().duration(1000)
            .style("fill", p => tenColorScale(p.total_death))
            .attr("r", p => radiusScale(p[key]));
    }
}
