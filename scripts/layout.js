(function(container) {
  var editPane = document.getElementById("editor");
  var splitter = document.getElementById("splitter");
  var graphPane = document.getElementById("graph");
  var output = document.getElementById("output");
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

    output.style.height = (output.parentNode.clientHeight - output.offsetTop) + "px";
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

    var button = e.button;
    if (button !== 0) {
      return;
    }

    var onMouseMove = function(e) {
      x = e.clientX;
    };
    
    var onResizeEnd = function() {
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
