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
