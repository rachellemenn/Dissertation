// Simple class that loads a CSV file and 
// optionally calls a callback function
function Loader(fileName, callbackFunction) {
    // Privates
    var fileName = fileName;
    var data = null;
    var CallbackFunction = callbackFunction;
    var loaded = false;
    var Loader = SimpleCSVLoader;

    // Public functions
    this.Activate = (doCallback) => {
        if (loaded) {
            if (doCallback) {
                CallbackFunction(this.data);
            }
        } else {
            Loader(doCallback);
        }
    };

    // Private functions
    function SimpleCSVLoader(doCallback) {
        console.log("SimpleCSVLoader " + fileName);
        d3.csv(fileName, (rows) => {
            // console.log("Loaded ", rows.length);
            console.log(rows);
            rows.forEach((row) => {
                // Go through properties and convert strings to numbers
                for (var prop in row) {
                    if (row.hasOwnProperty(prop)) {
                        var str = row[prop];
                        var value = parseInt(str);
                        if (!isNaN(value)) {
                            value = parseFloat(str);
                            if (!isNaN(value)) {
                                row[prop] = value;
                            }
                        }
                    }
                }
            });

            // Clearly we completed the load, check the flag
            this.loaded = true;
            this.data = rows;
            console.log(this.data);

            if (doCallback) {
                CallbackFunction(this.data);
            }
        });
    }
}

// A class to view vizualizations
function Visualization(fileName) {
    // Privates
    var width = 600;
    var height = 520;
    var margin = {
        top: 10,
        left: 20,
        bottom: 40,
        right: 10
    };

    var loaders = [];
    var container;

    // Publics
    this.Start = Init;

    // Public functions
    this.DrawSimpleChart = function (data) {
        if (data != null) {
            console.log(data);
            data.length === 1 || data.columns.length === 2 ? DrawBar(data) : DrawBar(data);
            draw = false;
        }
    }

    this.DrawCircleHierarchy = function (data) {
        // Get the parent
        var g = clearSvgContainer();

        // Initialize layout
        const layout = d3.pack()
            .size([width - 2, height - 2])
            .padding(6)

        // Create hierarchy for our data
        var stratData = d3.stratify()
            .parentId(function (d) {
                return d["parent id"];
            })
            .id(function (d) {
                return d.id;
            });

        // Create hierarchy
        var root = stratData(data);

        // Sort appropriately
        root.sum(function (d) {
                return d.value
            })
            .sort(function (a, b) {
                return b.value - a.value
            });

        var nodes = root.descendants();

        colors = [
            "#0077b3", "#0099e6", "#1ab2ff", "#66ccff",
        ];

        layout(root);

        var slices = g.selectAll('circle')
            .data(nodes)
            .enter()
            .append('circle')
            .attr('cx', function (d) {
                return d.x;
            })
            .attr('cy', function (d) {
                return d.y;
            })
            .attr('r', function (d) {
                return d.r;
            })
            .style("fill", function (d) {
                return colors[d.depth];
            });
    }


    // Private functions

    // Clear the container by selecting all
    // children and removing them. Then add
    // the g child and set the transform
    function clearSvgContainer() {
        container.selectAll("*").remove();
        return container.append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
    }

    function DrawBar(data) {
        // Convert data to a list of pairs name, value
        var items = [];
        if (data.length === 1) {
            // This is based on CSV with a single row of data.
            // Here the column name is the pair name for values
            data.columns.forEach((d) => {
                if (d !== data.columns[0]) {
                    items.push({
                        name: d,
                        value: data[0][d]
                    });
                }
            });
        } else {
            // This is based on CSV that contains name,value pairse in each row
            data.forEach((d) => {
                items.push({
                    name: d[data.columns[0]],
                    value: d[data.columns[1]]
                });
            });
        }

        // set the ranges
        var x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);
        var y = d3.scaleLinear()
            .range([height, 0]);

        // Get the parent
        var svg = clearSvgContainer();

        // Scale the range of the data in the domains
        x.domain(items.map(function (d) {
            return d.name;
        }));
        y.domain([0, d3.max(items, function (d) {
            return d.value;
        })]);

        // Colors for now
        var colors = d3.scaleOrdinal(d3.schemeCategory20);

        // append the rectangles for the bar chart
        svg.selectAll(".bar")
            .data(items)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function (d) {
                return x(d.name);
            })
            .attr("width", x.bandwidth())
            .attr("y", (d) => {
                return y(d.value);
            })
            .attr("height", (d) => {
                return height - y(d.value);
            })
            .attr("fill", (d) => {
                return colors(d.key);
            });

        // add the x Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // add the y Axis
        svg.append("g")
            .call(d3.axisLeft(y));
    }

    this.Viz3 = function (data) {

        var ndata = d3.nest()
            .key(function (d) {
                return d[data.columns[0]]
            })
            .entries(data)

        var svg = clearSvgContainer();
        container.selectAll("*").remove();
        var gx = container.selectAll('svg').data(ndata)
            .enter().append('svg')
            .attr("width", width/*(r + m) * 2*/)
            .attr("height", height/*(r + m) * 2*/)
            .append('g')
            .attr("transform", function(d, i) {
                var offset = 2 * i * (r + m);
                return "translate(" + (r + m + offset) + "," + (r + m) + ")";});

        // function Draw() {
        //     var canvas = document.querySelector("canvas"),
        //         context = canvas.getContext("2d");
            
        //     var width = canvas.width,
        //         height = canvas.height,
        //         radius = Math.min(width, height) / 2;
            
            var colors = [
            "#0077b3","#0099e6","#1ab2ff","#66ccff",
            ];
            //Rachelle's comment: changed colors. Also increased the inner radios from 0 to 5 and increased pad angle.
            
            var arc = d3.arc()
                .outerRadius(radius - 10)
                .innerRadius(5)
                .padAngle(0.09)
                .context(context);
            
            var pie = d3.pie().value(function(d){return d.Percent});
            
            // var dataPromise = loadData('Vizual3.csv');
            // dataPromise.then(function(data){
            //     console.log(data);
            //     data.forEach(function(d){
            //         d.Percent = parseFloat(d.Percent);
            //     });
            //     console.log(data);
                var arcs = pie(data);
                
            
                context.translate(width / 2, height / 2);
            
                //Rachelle's comment: removed globalAlpha so the colours weren't muted.
                // context.globalAlpha = 0.5;
                arcs.forEach(function(d, i) {
                    context.beginPath();
                    arc(d)
                    context.fillStyle = colors[i];
                    context.fill();
                });
            // });
            
            }
    }

    this.Viz4 = function (data) {

    }

    this.Viz5 = function (data) {

    }

    this.Viz6 = function (data) {
        data.forEach(function (d) {
            d.Value = parseFloat(d.Value);
        });

        var x0 = d3.scaleBand()
            .rangeRound([0, width])
            .paddingInner(0.1);
        var x1 = d3.scaleBand()
            .padding(0.05);

        var y = d3.scaleLinear()
            .rangeRound([height, 0]);
        var y1 = d3.scaleBand()

        var z = d3.scaleOrdinal()
            .range(["#082A4C", "#113D6C"]);

        var stack = d3.stack()
            .offset(d3.stackOffsetExpand);

        x0.domain(data.map(function (d) {
            return d.Identity;
        }));
        x1.domain(data.map(function (d) {
                return d.Imp;
            }))
            .rangeRound([0, x0.bandwidth()])
            .padding(0.2);

        z.domain(data.map(function (d) {
            return d.Religion;
        }));

        var keys = z.domain()

        var groupData = d3.nest()
            .key(function (d) {
                return d.Imp + d.Identity;
            })
            .rollup(function (d, i) {
                var d2 = {
                    Imp: d[0].Imp,
                    Identity: d[0].Identity
                }
                d.forEach(function (d) {
                    d2[d.Religion] = d.Value
                })
                return d2;
            })
            .entries(data)
            .map(function (d) {
                return d.value;
            });

        var stackData = stack
            .keys(keys)(groupData)

        var graphHeight = d3.max(data, function (d) {
            return d.Value;
        });

        y.domain([0, graphHeight]).nice();

        // Get the parent
        var svg = clearSvgContainer();
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var serie = g.selectAll(".serie")
            .data(stackData)
            .enter().append("g")
            .attr("class", "serie")
            .attr("fill", function (d) {
                return z(d.key);
            });

        serie.selectAll("rect")
            .data(function (d) {
                return d;
            })
            .enter().append("rect")
            .attr("class", "serie-rect")
            .attr("transform", function (d) {
                return "translate(" + x0(d.data.Identity) + ",0)";
            })
            .attr("x", function (d) {
                return x1(d.data.Imp);
            })
            .attr("y", function (d) {
                return 1 - d[0];
            })
            .attr("height", function (d) {
                return y(d[0]) - y(d[1]);
            })
            .attr("width", x1.bandwidth());

        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x0));

        g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).ticks(null, "s"))
            .append("text")
            .attr("x", 2)
            .attr("y", y(y.ticks().pop()) + 0.5)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Population");

        var legend = serie.append("g")
            .attr("class", "legend")
            .attr("transform", function (d) {
                var d = d[d.length - 1];
                return "translate(" + (x0(d.data.Identity) + x1(d.data.Imp) + x1.bandwidth()) + "," + ((y(d[0]) + y(d[1])) / 2) + ")";
            });

        legend.append("line")
            .attr("x1", -6)
            .attr("x2", 6)
            .attr("stroke", "#000");

        legend.append("text")
            .attr("x", 9)
            .attr("dy", "0.35em")
            .attr("fill", "#000")
            .style("font", "10px sans-serif")
            .text(function (d) {
                return d.key;
            });
    }

    this.Viz7 = function () {

        
        var tau = 2 * Math.PI; // http://tauday.com/tau-manifesto
                    
        // An arc function with all values bound except the endAngle. So, to compute an
        // SVG path string for a given angle, we pass an object with an endAngle
        // property to the `arc` function, and it will return the corresponding string.
        var arc = d3.arc()
            .innerRadius(180)
            .outerRadius(240)
            .startAngle(0);
                    
        // Get the SVG container, and apply a transform such that the origin is the
        // center of the canvas. This way, we don’t need to position arcs individually.

    container.selectAll("*").remove();
       var svg = d3.select("svg"),
            g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        // var svg = clearSvgContainer(),
        //     height = +svg.attr("height"),
        //     g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
            
            
                    
        // Add the background arc, from 0 to 100% (tau).
         var background = g.append("path")
            .datum({endAngle: tau})
            .style("fill", "#ddd")
            .attr("d", arc);
                    
        // Add the foreground arc in orange, currently showing 12.7%.
        var foreground = g.append("path")
            .datum({endAngle: 0 * tau})
            .style("fill", "#3333ff")
            .attr("d", arc);
            //Rachelle's comment: changed the colors, the sizings.Removed math.random from the function below and replaced
            //with the number 0.6962. This was preiviously in the above var. That now says 0. this way, the viz starts 
            //unfilled and then fills to the appropriate percentage. idk why it just does
                    
        // Every so often, start a transition to a new random angle. The attrTween
        // definition is encapsulated in a separate function (a closure) below.
        //Rachelle's comment: this is redrawing itself over and over, figure out how to stick it
        d3.interval(function() {
             foreground.transition()
                .duration(750)
                .attrTween("d", arcTween( data[0].Value * tau));
             }, 1500);
                    
        // Returns a tween for a transition’s "d" attribute, transitioning any selected
        // arcs from their current angle to the specified new angle.
        function arcTween(newAngle) {
                    
        // The function passed to attrTween is invoked for each selected element when
        // the transition starts, and for each element returns the interpolator to use
        // over the course of transition. This function is thus responsible for
        // determining the starting angle of the transition (which is pulled from the
        // element’s bound datum, d.endAngle), and the ending angle (simply the
        // newAngle argument to the enclosing function).
            return function(d) {
                    
        // To interpolate between the two angles, we use the default d3.interpolate.
        // (Internally, this maps to d3.interpolateNumber, since both of the
        // arguments to d3.interpolate are numbers.) The returned function takes a
        // single argument t and returns a number between the starting angle and the
        // ending angle. When t = 0, it returns d.endAngle; when t = 1, it returns
        // newAngle; and for 0 < t < 1 it returns an angle in-between.
        var interpolate = d3.interpolate(d.endAngle, newAngle);
            
        // The return value of the attrTween is also a function: the function that
        // we want to run for each tick of the transition. Because we used
        // attrTween("d"), the return value of this last function will be set to the
        // "d" attribute at every tick. (It’s also possible to use transition.tween
        // to run arbitrary code for every tick, say if you want to set multiple
        // attributes from a single function.) The argument t ranges from 0, at the
        // start of the transition, to 1, at the end.
            return function(t) {
                    
        // Calculate the current arc angle based on the transition time, t. Since
        // the t for the transition and the t for the interpolate both range from
                          // 0 to 1, we can pass t directly to the interpolator.
                          //
                          // Note that the interpolated angle is written into the element’s bound
                          // data object! This is important: it means that if the transition were
                          // interrupted, the data bound to the element would still be consistent
                          // with its appearance. Whenever we start a new arc transition, the
                          // correct starting angle can be inferred from the data.
            d.endAngle = interpolate(t);
                    
                          // Lastly, compute the arc path given the updated data! In effect, this
                          // transition uses data-space interpolation: the data is interpolated
                          // (that is, the end angle) rather than the path string itself.
                          // Interpolating the angles in polar coordinates, rather than the raw path
                          // string, produces valid intermediate arcs during the transition.
            return arc(d);
            };
        };
    }

    }

    this.Viz8 = function (data) {
        // Nested data, rearange it. Column 0 is the key
        //
        var ndata = d3.nest()
            .key(function (d) {
                return d[data.columns[0]]
            })
            .entries(data)


        // Define the margin, radius. If radius is r and margin is
        // m, the width is devided into the given number of charts (n).
        // Each chart is 2 * (m + r). Therefore:
        //   width = n * 2 * (m + r)
        // Since r is 10 * m, the result is:
        //   width = n * 22 * m
        var m = Math.floor(width / (22 * ndata.length));
        var r = 10 * m;

        console.log("m: ", m, "r: ", r);

        // Define the color scale. The color scale will be
        // assigned by index, but if you define your data using objects, you could pass
        // in a named field from the data object instead, such as `d.name`. Colors
        // are assigned lazily, so if you want deterministic behavior, define a domain
        // for the color scale.
        z = d3.scaleOrdinal()
            .range([
                "#0077b3", "#0099e6", "#1ab2ff", "#66ccff",
            ]);

        // Define the pie layout. Column 2 (the third column) is the value.
        var pie = d3.pie().value((d) => {
            return d[data.columns[2]];
        });

        // Insert an svg element (with margin) for each row in our dataset. A child g
        // element translates the origin to the pie center.
        var svg = clearSvgContainer();
        container.selectAll("*").remove();
        var gx = container.selectAll('svg').data(ndata)
            .enter().append('svg')
            .attr("width", width/*(r + m) * 2*/)
            .attr("height", height/*(r + m) * 2*/)
            .append('g')
            .attr("transform", function(d, i) {
                var offset = 2 * i * (r + m);
                return "translate(" + (r + m + offset) + "," + (r + m) + ")";});
            
        // Label the chart
        gx.append("text")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text(function (d) {
                return d.key;
            });

        // Define an arc generator.
        var arc = d3.arc()
            .innerRadius(r / 2)
            .outerRadius(r);

        // Create paths for each chart
        console.log('creating paths');
        var g = gx.selectAll("g")
            .data(function (d) {
                return d3.pie().value(function (d) {
                    return d[data.columns[2]];
                })(d.values);
            })
            .enter().append("g");

        /*.data((d) => {
            pie(d.values)
        })*/
        // Fill the arc
        console.log('filling arcs');
        g.append("path").attr("d", arc)
            .style("fill", function (d, i) {
                return z(i);
            });
    }

    this.Viz10 = function (data) {
        
    }

    this.Viz11 = function (data) {

    }

    this.Viz111 = function (data) {

    }

    // this.Viz122 = function (data) {

    //     // var groupBy = function(xs, key) {
    //     //     return xs.reduce(function(rv, x) {
    //     //         (rv[x[key]] = rv[x[key]] || []).push(x);
    //     //         return rv;
    //     //     }, {});
    //     // };
    //     // console.log(groupBy(data, data.columns[0]));

    //     // var groupByArray = function (xs, key) {
    //     //     return xs.reduce(function (rv, x) {
    //     //         let v = key instanceof Function ? key(x) : x[key];
    //     //         let el = rv.find((r) => r && r.key === v);
    //     //         if (el) {
    //     //             el.values.push({name: x[data.columns[1]], value:  x[data.columns[2]]});
    //     //         }
    //     //         else {
    //     //             rv.push({key: v, values: [{name: x[data.columns[1]], value:  x[data.columns[2]]}]});
    //     //         }
    //     //         return rv;
    //     //     }, []);
    //     // }
        
    //     // var rel1 = groupByArray(data, data.columns[0]);
    //     // console.log(groupByArray(data, data.columns[0]));

    //     var ndata = d3.nest()
    //         .key(function(d) {return d[data.columns[0]]})
    //         .entries(data)
    //     console.log(ndata);

    //     var rel = [
    //         [],
    //         []
    //     ];

    //     /*data.forEach((d) => {
    //         var index = d.Religion == 'R' ? 0 : 1;
    //         rel[index].push({
    //             name: d.Generation,
    //             value: d.Value * 100
    //         });
    //     });*/

    //     data.forEach((d) => {
    //         var index = d.Attached == 'V' ? 0 : 1;
    //         rel[index].push(d.Value);
    //     });

    //     console.log(rel);

    //     //var arcs = pie(data);

    //     //Rachelle's comment: changed the data

    //     // Define the margin, radius, and color scale. The color scale will be
    //     // assigned by index, but if you define your data using objects, you could pass
    //     // in a named field from the data object instead, such as `d.name`. Colors
    //     // are assigned lazily, so if you want deterministic behavior, define a domain
    //     // for the color scale.
    //     var m = 10,
    //         r = 100,
    //         //z = d3.scaleOrdinal()
    //         //    .range(["#0077b3", "#66ccff",]);
    //         z = d3.scaleOrdinal()
    //         .range([
    //             "#0077b3", "#0099e6", "#1ab2ff", "#66ccff",
    //         ]);
    //     //Rachelle's comment: changed colors and scaleOrdinal for v5 

    //     // Insert an svg element (with margin) for each row in our dataset. A child g
    //     // element translates the origin to the pie center.
    //     var svg = d3.select("body").selectAll("svg")
    //         .data(ndata)
    //         .enter().append("svg")
    //         .attr("width", (r + m) * 2)
    //         .attr("height", (r + m) * 2)
    //         .append("g")
    //         .attr("transform", "translate(" + (r + m) + "," + (r + m) + ")");

    //     console.log("drawing");
    //     svg.append("text")
    //       .attr("dy", ".35em")
    //         .attr("text-anchor", "middle")
    //         .text(function(d) { return d.key; });


    //     // The data for each svg element is a row of numbers (an array). We pass that to
    //     // d3.layout.pie to compute the angles for each arc. These start and end angles
    //     // are passed to d3.svg.arc to draw arcs! Note that the arc radius is specified
    //     // on the arc, not the layout.
    //     //Rachelle's comment: updated d3.pie and d3.arc to v5
    //     var g = svg.selectAll("path")
    //         .data(function(d) {return d3.pie().value(function(d) {
    //             return d[data.columns[2]];
    //         })(d.values);})
    //         .enter().append("path");

    //         g.attr("d", d3.arc()
    //             .innerRadius(r / 2)
    //             .outerRadius(r))
    //         .style("fill", function (d, i) {
    //             return z(i);
    //         });

    //         // Define an arc generator. Note the radius is specified here, not the layout.
    //         var arc = d3.arc()
    //             .innerRadius(r / 2)
    //             .outerRadius(r);


    //         // Add a label to the larger arcs, translated to the arc centroid and rotated.
    //         g.filter(function(d) { return d.endAngle - d.startAngle > .2; }).append("text")
    //             .attr("dy", ".35em")
    //             .attr("text-anchor", "middle")
    //             .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
    //             .text(function(d) { return d[data.columns[1]]; });
    // }

    // this.Viz121 = function (data) {
    //     var groupBy = function(xs, key) {
    //         return xs.reduce(function(rv, x) {
    //             (rv[x[key]] = rv[x[key]] || []).push(x);
    //             return rv;
    //         }, {});
    //     };
    //     console.log(groupBy(data, data.columns[0]));

    //     var groupByArray = function (xs, key) {
    //         return xs.reduce(function (rv, x) {
    //             let v = key instanceof Function ? key(x) : x[key];
    //             let el = rv.find((r) => r && r.key === v);
    //             if (el) {
    //                 el.values.push({name: x[data.columns[1]], value:  x[data.columns[2]]});
    //             }
    //             else {
    //                 rv.push({key: v, values: [{name: x[data.columns[1]], value:  x[data.columns[2]]}]});
    //             }
    //             return rv;
    //         }, []);
    //     }
        
    //     var rel1 = groupByArray(data, data.columns[0]);
    //     console.log(groupByArray(data, data.columns[0]));

    //     var ndata = d3.nest()
    //         .key(function(d) {return d[data.columns[0]]})
    //         .entries(data)
    //     console.log(ndata);

    //     var rel = [
    //         [],
    //         []
        // ];

        // /*data.forEach((d) => {
        //     var index = d.Religion == 'R' ? 0 : 1;
        //     rel[index].push({
        //         name: d.Generation,
        //         value: d.Value * 100
        //     });
        // });*/

        // data.forEach((d) => {
        //     var index = d.Attached == 'V' ? 0 : 1;
        //     rel[index].push(d.Value);
        // });

        // console.log(rel);

        // //var arcs = pie(data);

        // //Rachelle's comment: changed the data

        // // Define the margin, radius, and color scale. The color scale will be
        // // assigned by index, but if you define your data using objects, you could pass
        // // in a named field from the data object instead, such as `d.name`. Colors
        // // are assigned lazily, so if you want deterministic behavior, define a domain
        // // for the color scale.
        // var m = 10,
        //     r = 100,
        //     //z = d3.scaleOrdinal()
        //     //    .range(["#0077b3", "#66ccff",]);
        //     z = d3.scaleOrdinal()
        //     .range([
        //         "#0077b3", "#0099e6", "#1ab2ff", "#66ccff",
        //     ]);
        // //Rachelle's comment: changed colors and scaleOrdinal for v5 

        // // Insert an svg element (with margin) for each row in our dataset. A child g
        // // element translates the origin to the pie center.
        // var svg = d3.select("body").selectAll("svg")
        //     .data(ndata)
        //     .enter().append("svg")
        //     .attr("width", (r + m) * 2)
        //     .attr("height", (r + m) * 2)
        //     .append("g")
        //     .attr("transform", "translate(" + (r + m) + "," + (r + m) + ")");

        // console.log("drawing");
        // svg.append("text")
        //   .attr("dy", ".35em")
        //     .attr("text-anchor", "middle")
        //     .text(function(d) { return d.key; });


        // // The data for each svg element is a row of numbers (an array). We pass that to
        // // d3.layout.pie to compute the angles for each arc. These start and end angles
        // // are passed to d3.svg.arc to draw arcs! Note that the arc radius is specified
        // // on the arc, not the layout.
        // //Rachelle's comment: updated d3.pie and d3.arc to v5
        // var g = svg.selectAll("path")
        //     .data(function(d) {return d3.pie().value(function(d) {
        //         return d[data.columns[2]];
        //     })(d.values);})
        //     .enter().append("path");

        //     g.attr("d", d3.arc()
        //         .innerRadius(r / 2)
        //         .outerRadius(r))
        //     .style("fill", function (d, i) {
        //         return z(i);
        //     });

        //     // Define an arc generator. Note the radius is specified here, not the layout.
        //     var arc = d3.arc()
        //         .innerRadius(r / 2)
        //         .outerRadius(r);


        //     // Add a label to the larger arcs, translated to the arc centroid and rotated.
    //         g.filter(function(d) { return d.endAngle - d.startAngle > .2; }).append("text")
    //             .attr("dy", ".35em")
    //             .attr("text-anchor", "middle")
    //             .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
    //             .text(function(d) { return d[data.columns[1]]; });
        
    // }

    // this.Viz123 = function (data) {
    //     var groupByArray = function (xs, key) {
    //         return xs.reduce(function (rv, x) {
    //             let v = key instanceof Function ? key(x) : x[key];
    //             let el = rv.find((r) => r && r.key === v);
    //             if (el) {
    //                 el.values.push({name: x[data.columns[1]], value:  x[data.columns[2]]});
    //             }
    //             else {
    //                 rv.push({key: v, values: [{name: x[data.columns[1]], value:  x[data.columns[2]]}]});
    //             }
    //             return rv;
    //         }, []);
    //     }
        
    //     var rel1 = groupByArray(data, data.columns[0]);
    //     console.log(groupByArray(data, data.columns[0]));

    //     var ndata = d3.nest()
    //         .key(function(d) {return d[data.columns[0]]})
    //         .entries(data)
    //     console.log(ndata);

    //     var rel = [
    //         [],
    //         []
    //     ];

    //     /*data.forEach((d) => {
    //         var index = d.Religion == 'R' ? 0 : 1;
    //         rel[index].push({
    //             name: d.Generation,
    //             value: d.Value * 100
    //         });
    //     });*/

    //     data.forEach((d) => {
    //         var index = d.Attached == 'V' ? 0 : 1;
    //         rel[index].push(d.Value);
    //     });

    //     console.log(rel);

    //     //var arcs = pie(data);

    //     //Rachelle's comment: changed the data

    //     // Define the margin, radius, and color scale. The color scale will be
    //     // assigned by index, but if you define your data using objects, you could pass
    //     // in a named field from the data object instead, such as `d.name`. Colors
    //     // are assigned lazily, so if you want deterministic behavior, define a domain
    //     // for the color scale.
    //     var m = 10,
    //         r = 100,
    //         //z = d3.scaleOrdinal()
    //         //    .range(["#0077b3", "#66ccff",]);
    //         z = d3.scaleOrdinal()
    //         .range([
    //             "#0077b3", "#0099e6", "#1ab2ff", "#66ccff",
    //         ]);
    //     //Rachelle's comment: changed colors and scaleOrdinal for v5 

    //     // Insert an svg element (with margin) for each row in our dataset. A child g
    //     // element translates the origin to the pie center.
    //     var svg = d3.select("body").selectAll("svg")
    //         .data(ndata)
    //         .enter().append("svg")
    //         .attr("width", (r + m) * 2)
    //         .attr("height", (r + m) * 2)
    //         .append("g")
    //         .attr("transform", "translate(" + (r + m) + "," + (r + m) + ")");

    //     console.log("drawing");
    //     svg.append("text")
    //       .attr("dy", ".35em")
    //         .attr("text-anchor", "middle")
    //         .text(function(d) { return d.key; });


    //     // The data for each svg element is a row of numbers (an array). We pass that to
    //     // d3.layout.pie to compute the angles for each arc. These start and end angles
    //     // are passed to d3.svg.arc to draw arcs! Note that the arc radius is specified
    //     // on the arc, not the layout.
    //     //Rachelle's comment: updated d3.pie and d3.arc to v5
    //     var g = svg.selectAll("path")
    //         .data(function(d) {return d3.pie().value(function(d) {
    //             return d[data.columns[2]];
    //         })(d.values);})
    //         .enter().append("path");

    //         g.attr("d", d3.arc()
    //             .innerRadius(r / 2)
    //             .outerRadius(r))
    //         .style("fill", function (d, i) {
    //             return z(i);
    //         });

    //         // Define an arc generator. Note the radius is specified here, not the layout.
    //         var arc = d3.arc()
    //             .innerRadius(r / 2)
    //             .outerRadius(r);


    //         // Add a label to the larger arcs, translated to the arc centroid and rotated.
    //         g.filter(function(d) { return d.endAngle - d.startAngle > .2; }).append("text")
    //             .attr("dy", ".35em")
    //             .attr("text-anchor", "middle")
    //             .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
    //             .text(function(d) { return d[data.columns[1]]; });

    // }

//     this.Viz12 = function (data) {
//         var groupByArray = function (xs, key) {
//             return xs.reduce(function (rv, x) {
//                 let v = key instanceof Function ? key(x) : x[key];
//                 let el = rv.find((r) => r && r.key === v);
//                 if (el) {
//                     el.values.push({name: x[data.columns[1]], value:  x[data.columns[2]]});
//                 }
//                 else {
//                     rv.push({key: v, values: [{name: x[data.columns[1]], value:  x[data.columns[2]]}]});
//                 }
//                 return rv;
//             }, []);
//         }
        
//         var rel1 = groupByArray(data, data.columns[0]);
//         console.log(groupByArray(data, data.columns[0]));

//         var ndata = d3.nest()
//             .key(function(d) {return d[data.columns[0]]})
//             .entries(data)
//         console.log(ndata);

//         var rel = [
//             [],
//             []
//         ];

//         /*data.forEach((d) => {
//             var index = d.Religion == 'R' ? 0 : 1;
//             rel[index].push({
//                 name: d.Generation,
//                 value: d.Value * 100
//             });
//         });*/

//         data.forEach((d) => {
//             var index = d.Attached == 'V' ? 0 : 1;
//             rel[index].push(d.Value);
//         });

//         console.log(rel);

//         //var arcs = pie(data);

//         //Rachelle's comment: changed the data

//         // Define the margin, radius, and color scale. The color scale will be
//         // assigned by index, but if you define your data using objects, you could pass
//         // in a named field from the data object instead, such as `d.name`. Colors
//         // are assigned lazily, so if you want deterministic behavior, define a domain
//         // for the color scale.
//         var m = 10,
//             r = 100,
//             //z = d3.scaleOrdinal()
//             //    .range(["#0077b3", "#66ccff",]);
//             z = d3.scaleOrdinal()
//             .range([
//                 "#0077b3", "#0099e6", "#1ab2ff", "#66ccff",
//             ]);
//         //Rachelle's comment: changed colors and scaleOrdinal for v5 

//         // Insert an svg element (with margin) for each row in our dataset. A child g
//         // element translates the origin to the pie center.
//         var svg = d3.select("body").selectAll("svg")
//             .data(ndata)
//             .enter().append("svg")
//             .attr("width", (r + m) * 2)
//             .attr("height", (r + m) * 2)
//             .append("g")
//             .attr("transform", function(d, i) {
//                 var offset = 2 * i * (r + m);
//                 console.log("Iterating :" + i + ", offset: " + offset);
//                 return "translate(" + (r + m + offset) + "," + (r + m) + ")";});
// //            .attr("transform", "translate(" + (r + m) + "," + (r + m) + ")");

//         console.log("drawing");
//         svg.append("text")
//           .attr("dy", ".35em")
//             .attr("text-anchor", "middle")
//             .text(function(d) { return d.key; });


//         // The data for each svg element is a row of numbers (an array). We pass that to
//         // d3.layout.pie to compute the angles for each arc. These start and end angles
//         // are passed to d3.svg.arc to draw arcs! Note that the arc radius is specified
//         // on the arc, not the layout.
//         //Rachelle's comment: updated d3.pie and d3.arc to v5
//         var g = svg.selectAll("path")
//             .data(function(d) {return d3.pie().value(function(d) {
//                 return d[data.columns[2]];
//             })(d.values);})
//             .enter().append("path");

//             g.attr("d", d3.arc()
//                 .innerRadius(r / 2)
//                 .outerRadius(r))
//             .style("fill", function (d, i) {
//                 return z(i);
//             });

//             // Define an arc generator. Note the radius is specified here, not the layout.
//             var arc = d3.arc()
//                 .innerRadius(r / 2)
//                 .outerRadius(r);


//             // Add a label to the larger arcs, translated to the arc centroid and rotated.
//             g.filter(function(d) { return d.endAngle - d.startAngle > .2; }).append("text")
//                 .attr("dy", ".35em")
//                 .attr("text-anchor", "middle")
//                 .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
//                 .text(function(d) { return d[data.columns[1]]; });

//     }

    this.Viz13 = function (data) {

    }

    this.Viz133 = function (data) {

    }

    this.Viz132 = function (data) {

    }

    this.Viz131 = function (data) {

    }

    this. Viz15 = function (data) {
        
    }

    this.Viz14 = function (data) {

    }

    this.Viz141 = function (data) {

    }

    this.Viz161 = function (data) {

    }

    this.Viz16 = function (data) {

    }



    function Init() {
        loaders = [
            new Loader("Assets/Data/Viz1.csv", this.DrawCircleHierarchy),
            new Loader("Assets/Data//Viz2.csv", this.DrawSimpleChart),
            new Loader("Assets/Data/Vizual3.csv", this.DrawSimpleChart),
            new Loader("Assets/Data/Viz4.csv", this.DrawSimpleChart),
            new Loader("Assets/Data/Viz5.csv", this.DrawSimpleChart),
            new Loader("Assets/Data/Vizual3.csv", this.Viz3),
            new Loader("Assets/Data/Viz4.csv", this.Viz4),
            new Loader("Assets/Data/Viz5.csv", this.Viz5),
            new Loader("Assets/Data/Viz6.csv", this.Viz6),
            new Loader("Assets/Data/Viz7.csv", this.Viz7),
            new Loader("Assets/Data/Viz8.csv", this.Viz8),
            new Loader("Assets/Data/Viz10.csv", this.DrawSimpleChart),
            new Loader("Assets/Data/Viz11.csv", this.Viz11),
            new Loader("Assets/Data/Viz11.1.csv", this.Viz111),
            new Loader("Assets/Data/Viz12.2.csv", this.Viz8),
            new Loader("Assets/Data/Viz12.1.csv", this.Viz8),
            new Loader("Assets/Data/Viz12.3.csv", this.Viz8),
            new Loader("Assets/Data/Viz12.csv", this.Viz8),
            new Loader("Assets/Data/Vizual13.csv", this.Viz13),
            new Loader("Assets/Data/Viz13.3.csv", this.Viz133),
            new Loader("Assets/Data/Viz13.2.csv", this.Viz132),
            new Loader("Assets/Data/Viz13.1.csv", this.Viz131),
            new Loader("Assets/Data/Viz15.csv", this.Viz15),
            new Loader("Assets/Data/VIZual14.csv", this.Viz14),
            new Loader("Assets/Data/Vizual14.1.csv", this.Viz141),
            new Loader("Assets/Data/Viz16.1.csv", this.Viz161),
            new Loader("Assets/Data/Viz16.csv", this.Viz16),
        ];

        // Start loading, no callbacks
        loaders.forEach((l) => {
            l.Activate(false);
        });

        window.onload = () => {
            // HTML is loaded, we can start

            // Create the container in element that has #vis
            container = d3.select("#vis")
                .append("svg:svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

            // setup scroll functionality
            var scroll = scroller()
                .container(d3.select('#graphic'));

            // pass in .step selection as the steps
            scroll(d3.selectAll('.step'));

            // setup event handling
            scroll.on('active', (index) => {
                // highlight current step text
                d3.selectAll('.step')
                    .style('opacity', function (d, i) {
                        return i === index ? 1 : 0.1;
                    });

                // activate current section
                loaders[index].Activate(true);
            });
        }
    }
}


var v = new Visualization;
v.Start();