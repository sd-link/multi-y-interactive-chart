import React from "react";
import Plot from "react-plotly.js";
import "./line-chart.css";

class LineChart extends React.Component {
  state = {
    width: 0,
    height: 0,
    container: null,
    yDist: 50,
    yDistPercent: 0,
    hides: {},
    rangeX: [], /* REF: [startDate, endDate] */
    rangeY: {}, /* REF: {chart.title: [startDate, endDate]} */
    isFixedRangeY: false,
    timer: null,
  };

  onClickLegend(id) {
    const hides = { ...this.state.hides };
    hides[id] = !hides[id];
    this.setState((state) => ({
      hides,
    }));
  }

  onRelayoutChart(e) {
    const { hides, rangeY, timer } = this.state;
    const { line_charts } = this.props.data;
    const showableCharts = line_charts.filter((e) => !hides[e.title]);

    /* x-axis */
    if (e['xaxis.range[0]'] && e['xaxis.range[1]']) {
      this.setState({rangeX: [e['xaxis.range[0]'], e['xaxis.range[1]']]});

      if (timer) {
        clearTimeout(timer);
      }

      const timerTemp = setTimeout(() => {
        /* update data via api */
        this.props.onRangeChanged({
          start: e['xaxis.range[0]'],
          end: e['xaxis.range[1]'],
        });
      }, 1000);

      this.setState({
        timer: timerTemp
      });

    }
    /* y-axis */
    const newRangeY = {...rangeY};
    let isChanageY = false;
    showableCharts.forEach((c, index) => {
      if (e[`yaxis${index ? index + 1 : ""}.range[0]`]) {
        newRangeY[c.title] = [e[`yaxis${index ? index + 1 : ""}.range[0]`], e[`yaxis${index ? index + 1 : ""}.range[1]`]];
        isChanageY = true;
      }
    });
    if (isChanageY) {
      this.setState({rangeY: newRangeY});
    }
  }

  updateDimensions = () => {
    if (this.container) {
      const yDist = this.container.clientWidth < 768 ? 30 : 50;
      this.setState({
        width: this.container.clientWidth,
        height: this.container.clientHeight,
        yDist,
        yDistPercent: yDist / this.container.clientWidth,
      });
    }
  };
  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
    this.updateDimensions();
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      const { key_timeslots } = this.props.data;
      this.setState({
        rangeX: [
          key_timeslots.from,
          key_timeslots.to,
        ]
      })
    }
  }
  render() {
    const { width, height, yDist, yDistPercent, hides, rangeX, rangeY, isFixedRangeY } = this.state;
    const { line_charts } = this.props.data;
    const showableCharts = line_charts.filter((e) => !hides[e.title]);
    let data = showableCharts.map((c, index) => ({
      x: c.data.map((e) => e.timestamp_recorded),
      y: c.data.map((e) => e.data_value),
      name: c.title,
      yaxis: `y${index ? index + 1 : ""}`,
      type: "scatter",
      line: {
        color: c.color,
        width: 1,
      },
      marker: {
        color: c.color,
        size: 4,
      },
    }));

    let layout = {
      // title,
      width,
      height,
      dragmode: "pan",
      margin: { t: 50, r: 0, b: 100, l: 0 },
      plot_bgcolor: "#fafafa",
      xaxis: {
        linewidth: 1,
        color: "#aaa",
        range: rangeX,
        domain: [(showableCharts.length + 1) * yDistPercent, 1],
        showdividers: true,
        type: "date",
        showgrid: false,
        ticks: "outside",
        ticklen: 10, //height,
        tickfont: { color: "#333", size: 12 },
        mirror: "allticks",
        side: "both",
        hovermode: "closest",
        showspikes: true,
        spikemode: "across",
        spikecolor: "#aaa",
        spikesnap: "hovered data",
        spikethickness: 1,
        spikedash: "solid",
      },

      showlegend: false,
      annotations: [
        {
          xref: "paper",
          yref: "paper",
          x: 1,
          xanchor: "right",
          y: 0,
          yanchor: "top",
          text: "Date",
          showarrow: false,
        },
      ],
      shapes: []
    };
    showableCharts.forEach((c, index) => {
      layout.annotations.push({
        xref: "paper",
        yref: "paper",
        x: yDistPercent * (index + 1),
        xanchor: "center",
        y: 0,
        yanchor: "top",
        text: c.y_unit,
        showarrow: false,
      });
      if (!index) {
        layout["yaxis"] = {
          tickfont: { color: "black", size: 10 },
          // tickformat: c.axis_y_format,
          // nticks: 4,
          ticks: "inside",
          ticklen: width,
          tickcolor: "rgba(0, 0, 0, 0.03)",
          showgrid: false,
          range: rangeY[c.title] ? rangeY[c.title] : undefined,
          fixedrange: isFixedRangeY,

          zeroline: false,
          linewidth: 5,
          color: c.color,
          scrollZoom: true,
          position: (index + 1) * yDistPercent,
          spikethickness: 1,
          spikedash: "solid",
          spikecolor: "#aaa",
          spikemode: "across",
        };

      } else {
        layout[`yaxis${index + 1}`] = {
          tickfont: { color: "black", size: 10 },
          // nticks: 4,
          // tickformat: c.axis_y_format,
          ticks: "inside",
          ticklen: width,
          tickcolor: "rgba(0, 0, 0, 0.03)",
          showgrid: false,
          range: rangeY[c.title] ? rangeY[c.title] : undefined,
          fixedrange: isFixedRangeY,

          anchor: "free",
          overlaying: "y",
          side: "left",
          zeroline: false,
          linewidth: 5,
          color: c.color,
          position: (index + 1) * yDistPercent,
          scrollZoom: true,
          showspikes: true,
          spikethickness: 1,
          spikedash: "solid",
          spikecolor: "#aaa",
          spikemode: "across",
        };
      }
      for (let i = 0; i < c.data.length; i++) {
        for (let j = i + 1; j < c.data.length; j++) {
          if (
            c.data[i].data_value !== null &&
            c.data[i + 1].data_value === null &&
            c.data[j].data_value !== null
          ) {
            const shape = {
              type: 'line',
              xref: 'x',
              yref: index ? `y${index + 1}` : 'y',
              x0: c.data[i].timestamp_recorded,
              y0: c.data[i].data_value,
              x1: c.data[j].timestamp_recorded,
              y1: c.data[j].data_value,
              line: {
                color: c.color,
                width: .5,
                dash: 'dot',
              }
            }
            layout.shapes.push(shape);
            break;
          }
        }
      }
    });
    let config = { scrollZoom: true };

    return (
      <div style={wrapperStyle}>
        <div style={legendWrapperStyle}>
          {line_charts.map((c, i) => (
            <div
              key={i}
              className={hides[c.title] ? "legend" : "legend active"}
              style={{ "--chart-color": c.color }}
              onClick={() => this.onClickLegend(c.title)}
            >
              <div className="legend-label">{c.y_title}</div>
            </div>
          ))}
        </div>
        <div ref={(el) => (this.container = el)} style={wrapperStyle}>
          <Plot
            data={data}
            layout={layout}
            config={config}
            style={{ width: "100%", height: "100%" }}
            onRelayout = {(e) => this.onRelayoutChart(e)}
          />
           {isFixedRangeY ? <div
                style={{...yAxisCoverStyle, width: yDist * (showableCharts.length + 1)}}
                onMouseEnter={() => {
                  this.setState({isFixedRangeY: false});
                }}
              >
              </div> : <div
                style={{...chartCoverStyle, left: yDist * (showableCharts.length + 1)}}
                onMouseEnter={() => {
                  this.setState({isFixedRangeY: true});
                }}
              />
            }
        </div>
      </div>
    );
  }
}

const wrapperStyle = {
  margin: "0px",
  padding: "0px",
  width: "100%",
  height: "80vh",
  position: "relative"
};

const legendWrapperStyle = {
  display: "flex",
  flexWrap: "wrap",
};

const yAxisCoverStyle = {
  position: "absolute",
  left: "0",
  top: "0",
  backgroundColor: "red",
  opacity: 0,
  height: "100%",
  width: "50px"
};

const chartCoverStyle = {
  position: "absolute",
  top: "0",
  backgroundColor: "blue",
  opacity: 0,
  height: "100%",
  width: "100%"
};

export default LineChart;
