// class for music progress bar and music voice bar
(function(window){
  function Lyric(path){
    return new Lyric.prototype.init(path);
  }

  Lyric.prototype = {
    constructor: Lyric,
    init: function(path){
      this.path = path;
    },
    times: [],
    lyrics: [],
    loadLyric: function(callBack) {
      let $this = this;
      $.ajax({
        url: this.path,
        dataType: "text"
      }).done(function(data){
        $this.parseLyric(data);
        callBack();
      }).fail(function(){
        // 2. Local use
        console.log("Lyric ajax fail");
      })
    },
    parseLyric: function(data){
      let $this = this;
      // clear old lyrics and timestamp
      $this.times = [];
      $this.lyrics = [];
      let array = data.split("\r\n"); // windows os \r\n
      // format in lyric: [00:00.92]
      let timeReg = /\[(\d*:\d*\.\d*)\]/;
      $.each(array, function(index, ele) {
        // get lyic
        let lyric = ele.split("]")[1];
        if (lyric.length == 0) return true; // skip empty lyric
        $this.lyrics.push(lyric);
        // get time stamp
        let match = timeReg.exec(ele);
        if (match == null) return true; // continue
        let timeStr = match[1]; // format: 00:05.97
        let timeArray = timeStr.split(":");
        let min = parseInt(timeArray[0]) * 60;
        let sec = parseFloat(timeArray[1]);
        let timeInSec = parseFloat(Number(min + sec).toFixed(2));
        $this.times.push(timeInSec);
      });
      console.log($this.times);
      console.log($this.lyrics);
    },
    getLyricIndex: function(curTime){
      if (curTime < this.times[0]) {
        return 0;
      } else {
        for (let i = 0; i < this.times.length - 1; i++) {
          if (curTime >= this.times[i] && curTime < this.times[i + 1]) {
            return i;
          }
        }
        return this.times.length - 1;
      }
    }
  }
  Lyric.prototype.init.prototype = Lyric.prototype;
  window.Lyric = Lyric;
})(window);