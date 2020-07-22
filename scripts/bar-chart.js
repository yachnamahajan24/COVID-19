//const DATE is declared in math.js


const margin = 120;
const width = 1300 - 2 * margin;
const height = 550 - 2 * margin;

const svg = d3.select('#bar-chart svg');

const chart = svg.append('g')
                 .attr('transform', `translate(${margin}, ${margin})`);

const yScale = d3.scaleLinear()
                 .range([height, 0])
                 .domain([0, 870000]);

const makeYLines = () => d3.axisLeft()
      .scale(yScale);
 
chart.append('g')
     .call(d3.axisLeft(yScale));

chart.append('g')
    .attr('class', 'grid')
    .call(makeYLines()
        .tickSize(-width, 0, 0)
        .tickFormat(''));

d3.csv("data/covid.csv", d => getData(d));

function getData(data) {
    
    let top10 = [];
    
    top10 = getAffected(data, "most");
    
    shuffle(top10);
    
    
    const xScale = d3.scaleBand()
                     .range([0, width])
                     .domain(top10.map((l) => l.country))
                     .padding(0.4);
    
    const makeXLines = () => d3.axisBottom()
                               .scale(xScale);
    
    chart.append('g')
         .attr('class', 'grid')
         .attr('transform', `translate(0, ${height})`)
         .call(makeXLines()
         .tickSize(-height, 0, 0)
         .tickFormat(''));

    chart.append('g')
         .attr('transform', `translate(0, ${height})`)
         .call(d3.axisBottom(xScale));
    
    const barGroups = chart.selectAll()
                           .data(top10)
                           .enter()
                           .append('g');

    barGroups.append('rect')
             .attr('class', 'bar')
             .attr('x', (s) => xScale(s.country))
             .attr('y', (s) => yScale(0))
             .attr('height', (s) => height - yScale(0))
             .attr('width', xScale.bandwidth())
             .on('mouseenter', function (actual, i) {
        
                d3.selectAll('.value')
                  .attr('opacity', 1);
        
                d3.select(this)
                  .transition()
                  .duration(300)
                  .style("opacity", 0.5)
                  .style("cursor", "pointer")
                  .style("stroke", "#fffafa")
                  .style("stroke-width", "2px")
                  .attr('x', (a) => xScale(a.country) - 5)
                  .attr('width', xScale.bandwidth() + 10);
        
                barGroups.append('text')
                         .attr('class', 'divergence')
                         .attr('x', (a) => xScale(a.country) + xScale.bandwidth() / 2)
                         .attr('y', (a) => yScale(a.total_case) + 30)
                         .attr('fill', 'white')
                         .attr('text-anchor', 'middle')
                         .text((a) => a.total_case);
             })
             .on('mouseleave', function (actual, i) {
                 d3.selectAll('.value')
                   .attr('opacity', 0);

                 d3.select(this)
                   .transition()
                   .duration(300)
                   .style("opacity", 1)
                   .style("stroke", "none")
                   .attr('x', (a) => xScale(a.country))
                   .attr('width', xScale.bandwidth());

                 chart.selectAll('.divergence').remove();
             })
              .transition()
              .delay(function(d) {
                return Math.random() * 250;
              })
              .duration(1000)
              // setting up normal values for y and height
              .attr("y", function(d) {
                return yScale(d.total_case);
              })
              .attr("height", function(d) {
                return height - yScale(d.total_case);
              });
    
    svg.append('text')
       .attr('class', 'label')
       .attr('x', -(height / 2) - margin)
       .attr('y', margin / 2.4)
       .attr('transform', 'rotate(-90)')
       .attr('text-anchor', 'middle')
       .text('Total Cases');
    
    svg.append('text')
       .attr('class', 'label')
       .attr('x', width / 2 + margin)
       .attr('y', height + margin * 1.7)
       .attr('text-anchor', 'middle')
       .text('Countries');

    svg.append('text')
       .attr('class', 'title')
       .attr('x', width / 2 + margin)
       .attr('y', 40)
       .attr('text-anchor', 'middle')
       .text('Top 10 Countries affected by COVID-2019');
    
}


