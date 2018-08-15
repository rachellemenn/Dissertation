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
            console.log("Loaded ", rows.length);
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

    this.Viz8 = function (data) {
        var rel = [
            [],
            []
        ];

        data.forEach((d) => {
            var index = d.Religion == 'R' ? 0 : 1;
            rel[index].push(d.Value);
        });

        // Define the margin, radius. If radius is r and margin is
        // m, the width is devided into two charts. So the total
        // width is 2 * (2 * (m + r)) = 4 * (m + r). m is 1/10 of r.
        // width = 44 * m.
        var m = Math.floor(width / 44);
        var r = Math.floor((width - 4 * m) / 4);

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

        // Insert an svg element (with margin) for each row in our dataset. A child g
        // element translates the origin to the pie center.
        container.selectAll("*").remove();
        console.log(rel);
        d3.select("svg:svg").data(rel)
            .enter().append("svg")
            .attr("width", (r + m) * 2)
            .attr("height", (r + m) * 2)
            .append("g")
            .attr("transform", "translate(" + (r + m) + "," + (r + m) + ")");

        // The data for each svg element is a row of numbers (an array). We pass that to
        // d3.layout.pie to compute the angles for each arc. These start and end angles
        // are passed to d3.svg.arc to draw arcs! Note that the arc radius is specified
        // on the arc, not the layout.
        //Rachelle's comment: updated d3.pie and d3.arc to v5
        svg.selectAll("path")
            .data(d3.pie())
            .enter().append("path")
            .attr("d", d3.arc()
                .innerRadius(r / 2)
                .outerRadius(r))
            .style("fill", function (d, i) {
                return z(i);
            });
    }


    function Init() {
        loaders = [
            new Loader("Assets/Data/Viz1.csv", this.DrawCircleHierarchy),
            new Loader("Assets/Data//Viz2.csv", this.DrawSimpleChart),
            new Loader("Assets/Data/Viz3.csv", this.DrawSimpleChart),
            new Loader("Viz/Section 1/CSV2/Viz4.csv", this.DrawSimpleChart),
            new Loader("Viz/Section 1/CSV2/Viz5.csv", this.DrawSimpleChart),
            new Loader("Assets/Data/Viz6.csv", this.Viz6),
            new Loader("Assets/Data/Viz8.csv", this.Viz8),
            new Loader("Viz/Section 1/CSV2/Viz9.csv", this.DrawSimpleChart),
            new Loader("Viz/Section 1/CSV3/Viz10.csv", this.DrawSimpleChart),
            new Loader("Viz/Section 1/CSV3/Viz11.csv", this.DrawSimpleChart),
            new Loader("Viz/Section 1/CSV4/Viz12.csv", this.DrawSimpleChart),
            new Loader("Viz/Section 1/CSV4/Viz13.csv", this.DrawSimpleChart),
            new Loader("Viz/Section 1/CSV4/Viz14.csv", this.DrawSimpleChart),
            new Loader("Viz/Section 1/CSV4/Viz15.csv", this.DrawSimpleChart),
            new Loader("Viz/Section 1/CSV4/Viz16.csv", this.DrawSimpleChart)
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