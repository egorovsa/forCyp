"use strict";
var points = [];
var canvas, ctx, socket, graph;
var graphWidth = 700; // default width graph
var graphHeight = 430; // default height graph
var bottomSpace = 50; // default height graph
var startY = 70; // start Y
var gridLineCount = 7; // count Grid line
//var maxPoints = 10; // maxPointsToScreen
var minutesForShow = 5; // max time for show
var graphStrokeStyle = "#c68549";
var graphFillStyle = "rgba(255,166,77,0.8)";
var gridStrokeStyle = "#ddd";
var gridFillStyle = "#929292";


window.onload = function () {
    socket = new WebSocket("ws://128.199.49.24:1234");
    canvas = document.getElementById('finance');
    canvas.width = 800;
    canvas.height = 500;
    ctx = canvas.getContext('2d');

    socket.onopen = function () {
        sendToken();
    };

    socket.onmessage = function (event) {
        var data = JSON.parse(event.data);
        if (data.action == "assets") {
            subscribe(data.message.assets[0].id);
            var select = document.getElementById('assetsSelect');
            select.innerHTML = createOptions(data.message.assets);
            select.addEventListener("change", function () {
                subscribe(select.value);
            });
        }

        if (data.action == "asset_history") {
            points = data.message.points;
            graph = new Graph(points);
        }

        if (data.action == 'point') {
            points.push(data.message);
            points = points.filter(function (point) {
                var timeForCheck = minutesToDate(new Date, -minutesForShow);
                if (timeForCheck <= new Date(point.time))
                    return true;
                return false;
            });
            graph.updatePoints(points);
        }
    };
};

//handshake
function sendToken() {
    socket.send(JSON.stringify({"action": "assets", "message": {}}));
}

//Подписывыаемся на assets
function subscribe(id) {
    socket.send(JSON.stringify({"action": "subscribe", "message": {"assetId": id}}));
}

function createOptions(assets) {
    var html = '';
    assets.map(function (asset) {
        html += '<option value="' + asset.id + '">' + asset.name + '</option>';
    });
    return html;
}


function maxPoint(arr) {
    var max = 0;
    arr.forEach(function (item) {
        max = item.value > max ? item.value : max;
    });

    return max;
}
function minPoint(arr) {
    var min = arr[0].value;
    arr.forEach(function (item) {
        min = item.value < min ? item.value : min;
    });
    return min;
}

function getHeightPoint(point, max, min) {
    var inOne = (graphHeight - startY) / (max - min);
    var diff = point - min;
    return diff * inOne;

}

this.minutesToDate = function (date, minutes) {
    date.setMinutes(date.getMinutes() + minutes);
    return date;
};

this.getTime = function (timestamp) {
    var date = new Date(timestamp);
    return date.getHours() + ':' + date.getMinutes() + ':' + date.getUTCSeconds();
};




// Main Class Graph
function Graph(bPoints) {
    this.bPoints = bPoints;
    this.updatePoints();
}

// Updating graph with new points
Graph.prototype.updatePoints = function (bPoints) {
    this.points = [];
    this.gridLines = [];
    this.gridTimeLine = [];
    if (bPoints)
        this.bPoints = bPoints;
    var self = this;

    //CreatintGridLines
    this.creatingGrid();
    this.creatingGridTimeLine();
    //createGraphPoint
    this.creatingGraphPoints();

    this.draw();
};

Graph.prototype.creatingGraphPoints = function () {
    var self = this;
    // creating new point
    var point = new Point(0, graphHeight + bottomSpace);
    // add point object to array of points
    this.points.push(point);
    // getting width between points
    var widthBeetwenPoints = graphWidth / this.bPoints.length;
    // getting max pount value
    var max = maxPoint(this.bPoints);

    // getting min pount value
    var min = minPoint(this.bPoints);
    this.bPoints.map(function (point, i) {
        var px = i * widthBeetwenPoints;
        var py = graphHeight - getHeightPoint(point.value, max, min); //point.value;
        var point = new Point(px, py);
        self.points[self.points.length - 1].addConstraint(px, py);
        self.points.push(point);
    });

    this.points[this.points.length - 1].addConstraint(graphWidth, graphHeight + bottomSpace);
};


// Method for creating grid lines
Graph.prototype.creatingGrid = function () {
    // getting max pount value
    var max = maxPoint(this.bPoints);
    for (var i = 1; i <= gridLineCount; i++) {
        var h = graphHeight - (graphHeight / gridLineCount) * i + startY;
        var line = new GridLine(0, h, canvas.width, h, (max / gridLineCount * i).toFixed(5));
        this.gridLines.push(line);
    }
};


// Method for creating grid timeline
Graph.prototype.creatingGridTimeLine = function () {
    var self = this;
    var btw = Math.ceil(this.bPoints.length / (minutesForShow - 1));
    var cnt = 1;
    // getting time line array
    var times = this.bPoints.filter(function (point, i) {
        if (i == 0 || i == self.bPoints.length - 1)
            return true;
        if (cnt * btw == i) {
            cnt++;
            return true;
        }
    });

    for (var i = 0; i < minutesForShow; i++) {
        var widthBetween = canvas.width / minutesForShow;
        var timeLine = new GridTimeLine(widthBetween * i + 10, canvas.height - 10, getTime(times[i].time));
        this.gridTimeLine.push(timeLine);
    }

};


// drawing current graph
Graph.prototype.draw = function () {

    // drawing grid
    ctx.fillStyle = gridFillStyle;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.lineWidth = 2;
    this.gridLines.map(function (gl) {
        gl.draw();
    });
    this.gridTimeLine.map(function (gtl) {
        gtl.draw();
    });
    ctx.strokeStyle = gridStrokeStyle;
    ctx.stroke();
    ctx.closePath();

    // drawing graph
    ctx.lineWidth = 1;
    ctx.beginPath();
    this.points.map(function (point, i) {
        i == 0 && point.start();
        point.draw();
    });
    ctx.closePath();
    ctx.strokeStyle = graphStrokeStyle;
    ctx.fillStyle = graphFillStyle;
    ctx.fill();
    ctx.stroke();
};


//------------- POINT CLASS
// Point Class
function Point(x, y) {
    this.x = x;
    this.y = y;
    this.constraint = {};
}

// Add constraint for point object
Point.prototype.addConstraint = function (x, y) {
    this.constraint = {x: x, y: y};
};

// getting start for new graph
Point.prototype.start = function () {
    ctx.moveTo(this.x, this.y);
};

// drawing line to graph
Point.prototype.draw = function () {
    ctx.lineTo(this.constraint.x, this.constraint.y); // рисует линию от от текущего положения на холсте к заданному.
};

function GridTimeLine(x, y, time) {
    this.x = x;
    this.y = y;
    this.time = time;
}

GridTimeLine.prototype.draw = function () {
    ctx.fillText(this.time, this.x, this.y);
};


// Class Grid lines  
function GridLine(x1, y1, x2, y2, value) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.value = value;
}

// method  for drawing grid lines
GridLine.prototype.draw = function () {
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
    ctx.fillText(this.value, canvas.width - 50, this.y1 - 3);
};