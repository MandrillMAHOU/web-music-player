// class for music progress bar and music voice bar
(function(window){
  function Progress($progressBar, $progressMask, $progressDot){
    return new Progress.prototype.init($progressBar, $progressMask, $progressDot);
  }

  Progress.prototype = {
    constructor: Progress,
    init: function($progressBar, $progressMask, $progressDot){
      this.$progressBar = $progressBar;
      this.$progressMask = $progressMask;
      this.$progressDot = $progressDot;
      this.barOffset = $progressBar.offset().left;
    },
    isDragging: false,
    progressClick: function(callBack){
      let $this = this; // $this now is the Progress obj
      this.$progressBar.on("click", function(e){
        let newWidth = e.clientX - $this.barOffset;
        if (newWidth < 0) {
          newWidth = 0;
        } else if (newWidth > $this.$progressBar.width()) {
          newWidth = $this.$progressBar.width();
        }
        $this.$progressMask.css("width", newWidth);
        $this.$progressDot.css("left", newWidth);
        let percent = newWidth / $this.$progressBar.width();
        callBack(percent);
      });
    },
    progressDrag: function(callBack){
      let $this = this;
      let newWidth = null;
      this.$progressBar.on("mousedown", function(){
        $this.isDragging = true;
        $(document).on("mousemove", function(e){
          newWidth = e.clientX - $this.barOffset;
          if (newWidth < 0) {
            newWidth = 0;
          } else if (newWidth > $this.$progressBar.width()) {
            newWidth = $this.$progressBar.width();
          }
          $this.$progressMask.css("width", newWidth);
          $this.$progressDot.css("left", newWidth);
        })
      });
      $(document).on("mouseup", function(){
        $(document).off("mousemove");
        if ($this.isDragging) {
          // update music progress until mouse is up
          let percent = newWidth / $this.$progressBar.width();
          callBack(percent);
        }
        $this.isDragging = false;
      })
    },
    setProgress: function(percent) {
      if (!this.isDragging) {
        this.$progressMask.css("width", percent + "%");
        this.$progressDot.css("left", percent + "%");
      }
    } 
  }
  Progress.prototype.init.prototype = Progress.prototype;
  window.Progress = Progress;
})(window);