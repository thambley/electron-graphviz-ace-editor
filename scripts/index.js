
var split = (function(container) {
  var editPane = document.getElementById("editor");
  var splitter = document.getElementById("splitter");
  var graphPane = document.getElementById("graph");
  var split = {
    container: container,
    editPane:  editPane,
    splitter:  splitter,
    graphPane: graphPane
  };

  splitter.ratio = 0.5;

  split.resize = function(){
    split.moveSplitter();
    var height = container.parentNode.clientHeight - container.offsetTop;

    splitter.style.height = container.style.height = height + "px";

    var editorStyle = editPane.style;
    var graphStyle = graphPane.style;

    editorStyle.top = graphStyle.top = "0px";
    editorStyle.height = graphStyle.height = height + "px";
  };

  split.moveSplitter = function() {
    var totalWidth = container.clientWidth;
    var editPaneWidth = totalWidth * splitter.ratio;
    var graphPaneWidth = totalWidth * (1 - splitter.ratio);

    splitter.style.left = (editPaneWidth - 1) + "px";

    var editorStyle = editPane.style;
    var graphStyle = graphPane.style;
    editorStyle.width = editPaneWidth + "px";
    graphStyle.width = graphPaneWidth + "px";
    editorStyle.left = "0px";
    graphStyle.left = editPaneWidth + "px";
  }

  split.onMouseDown = function(e) {
    var rect = container.getBoundingClientRect();
    var x = e.clientX;
    var y = e.clientY;

    var button = e.button;
    if (button !== 0) {
      return;
    }

    var onMouseMove = function(e) {
      x = e.clientX;
      y = e.clientY;
    };
    
    var onResizeEnd = function(e) {
      clearInterval(timerId);
    };

    var onResizeInterval = function() {
      splitter.ratio = (x - rect.left) / rect.width;
      split.moveSplitter();
    };

    var onMouseUp = function(e) {
      onMouseMove(e);
      onResizeEnd(e);

      document.removeEventListener("mousemove", onMouseMove, false);
      document.removeEventListener("mouseup", onMouseUp, false);
      document.removeEventListener("dragstart", onMouseUp, false);
    }

    document.addEventListener("mousemove", onMouseMove, false);
    document.addEventListener("mouseup", onMouseUp, false);
    document.addEventListener("dragstart", onMouseUp, false);
    
    var timerId = setInterval(onResizeInterval, 40);

    return e.preventDefault();
  };

  splitter.addEventListener("mousedown", split.onMouseDown, false);
  window.addEventListener("resize", split.resize, false);
  split.resize();
  return split;
})(document.getElementById("panes"));

var editor = ace.edit("editor");
editor.getSession().setMode("ace/mode/dot");

var parser = new DOMParser();
var worker;
var result;

function updateGraph() {
  if (worker) {
	worker.terminate();
  }

  document.querySelector("#output").classList.add("working");
  document.querySelector("#output").classList.remove("error");

  worker = new Worker("scripts/worker.js");

  worker.onmessage = function(e) {
	document.querySelector("#output").classList.remove("working");
	document.querySelector("#output").classList.remove("error");
	
	result = e.data;
	
	updateOutput();
  }

  worker.onerror = function(e) {
	document.querySelector("#output").classList.remove("working");
	document.querySelector("#output").classList.add("error");
	
	var message = e.message === undefined ? "An error occurred while processing the graph input." : e.message;
	
	var error = document.querySelector("#error");
	while (error.firstChild) {
	  error.removeChild(error.firstChild);
	}
	
	document.querySelector("#error").appendChild(document.createTextNode(message));
	
	console.error(e);
	e.preventDefault();
  }
  
  var params = {
	src: editor.getSession().getDocument().getValue(),
	options: {
	  engine: document.querySelector("#engine select").value,
	  format: document.querySelector("#format select").value
	}
  };
  
  // Instead of asking for png-image-element directly, which we can't do in a worker,
  // ask for SVG and convert when updating the output.
  
  if (params.options.format == "png-image-element") {
	params.options.format = "svg";
  }
  
  worker.postMessage(params);
}

function updateOutput() {
  var graph = document.querySelector("#output");

  var svg = graph.querySelector("svg");
  if (svg) {
	graph.removeChild(svg);
  }

  var text = graph.querySelector("#text");
  if (text) {
	graph.removeChild(text);
  }

  var img = graph.querySelector("img");
  if (img) {
	graph.removeChild(img);
  }
  
  if (!result) {
	return;
  }
  
  if (document.querySelector("#format select").value == "svg" && !document.querySelector("#raw input").checked) {
	var svg = parser.parseFromString(result, "image/svg+xml");
	graph.appendChild(svg.documentElement);
  } else if (document.querySelector("#format select").value == "png-image-element") {
	var image = Viz.svgXmlToPngImageElement(result);
	graph.appendChild(image);
  } else {
	var text = document.createElement("div");
	text.id = "text";
	text.appendChild(document.createTextNode(result));
	graph.appendChild(text);
  }
}

editor.on("change", function() {
  updateGraph();
});

document.querySelector("#engine select").addEventListener("change", function() {
  updateGraph();
});

document.querySelector("#format select").addEventListener("change", function() {
  if (document.querySelector("#format select").value === "svg") {
	document.querySelector("#raw").classList.remove("disabled");
	document.querySelector("#raw input").disabled = false;
  } else {
	document.querySelector("#raw").classList.add("disabled");
	document.querySelector("#raw input").disabled = true;
  }
  
  updateGraph();
});

document.querySelector("#raw input").addEventListener("change", function() {
  updateOutput();
});

updateGraph();