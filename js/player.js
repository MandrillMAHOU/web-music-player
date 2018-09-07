(function(window){
  // encapsulate object
  function Player($audio) {
    return new Player.prototype.init($audio); // 1. when creates the object, return init's instance
  }

  Player.prototype = {
    constructor: Player,
    init: function($audio){
      this.musicList = [];
      this.$audio = $audio;
      this.audio = $audio.get(0); // dom 
    },
    curPlayIndex: -1, // cur playing song
    // called when next/pre btn is clicked
    changeIndex: function(n){
      let index = this.curPlayIndex + n;
      if (index < 0) {
        index = this.musicList.length - 1;
      } else if (index > this.musicList.length - 1) {
        index = 0;
      }
      return index;
    },
    playMusic: function(index, music){
      // same music, then pause
      if (this.curPlayIndex == index) {
        if (this.audio.paused) {
          this.audio.play();
        } else {
          this.audio.pause();
        }
      } else {
        // diff music, change song
        this.curPlayIndex = index;
        this.audio.src = music.link_url;
        this.audio.play();
      }
    },
    delMusic: function(index){
      this.musicList.splice(index, 1);
      // check if cur deleted index is before curplayindex, if so, curplayindex - 1
      if (index < this.curPlayIndex) {
        this.curPlayIndex--;
      }
    },
    musicTimeUpdate: function(callBack){
      let $this = this;
      this.$audio.on("timeupdate", function(){
        let duration = this.duration;
        let curTime = this.currentTime;
        let timeStr = $this.formatTime(curTime) + " / " + $this.formatTime(duration);
        callBack(curTime, duration, timeStr);
      });
    },
    musicProgressUpdate: function(percent){
      if (isNaN(this.audio.duration)) return; //before start playing move progress bar 
      this.audio.currentTime = percent * this.audio.duration;
    },
    getVol: function(){
      return this.audio.volume;
    },
    setVol: function(vol){
      this.audio.volume = vol;
    },
      // format sec time to time like 00:00
    formatTime: function(time) {
      let min = parseInt(time / 60);
      let sec = parseInt(time % 60);
      if (min < 10) {
        min = "0" + min;
      }
      if (sec < 10) {
        sec = "0" + sec;
      }
      return min + ":" + sec;
    }
  }

  // together with 1, init's instance link to Player's prototype, thus it can
  // use methods inside Player's prototype
  Player.prototype.init.prototype = Player.prototype;
  window.Player = Player;

})(window);