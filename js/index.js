let player;
let lyric;
(function(){
  // let player;
  let progress;
  let soundProgress;
  let preVol; // sound vol before muted

	$(function(){
    // init audio player obj
    let $audio = $("audio");
    player = new Player($audio);

    // init music progress bar obj
    let $musicProgressBar = $(".music-progress-bar");
    let $musicProgressMask = $(".music-progress-mask");
    let $musicProgressDot = $(".music-progress-dot");
    progress = new Progress($musicProgressBar, $musicProgressMask, $musicProgressDot);
    progress.progressClick(function(percent){
      player.musicProgressUpdate(percent);
    });
    progress.progressDrag(function(percent){
      player.musicProgressUpdate(percent);
    });

    // init music sound vol bar obj
    let $soundProgressBar = $(".music-sound-bar");
    let $soundProgressMask = $(".music-sound-mask");
    let $soundProgressDot = $(".music-sound-dot");
    soundProgress = new Progress($soundProgressBar, $soundProgressMask, $soundProgressDot);
    soundProgress.progressClick(function(percent){
      player.setVol(percent);
      $(".music-sound-icon").removeClass("music-sound-icon2");
    });
    soundProgress.progressDrag(function(percent){
      player.setVol(percent);
      $(".music-sound-icon").removeClass("music-sound-icon2");
    });

    // inits the music list
    initMusicList();
    initEvents();
		// custom scroll bar
		$(".content-list").mCustomScrollbar();
	})

	// inits the music list by ajax
	function initMusicList() {
    let $musicList = $(".content-list");
    // 1. Server: cant read json locally, start server
    // if cant do ajax, use local data;
      $.ajax({
        url: "source/musiclist.json",
        dataType: "json"
      }).done(function(data){
        player.musicList = data;
        $.each(data, function(index, ele){
          let $newMusicItem = crateMusicItem(index, ele);
          $musicList.append($newMusicItem);
        });
        updateMusicInfo(player.musicList[0]);
        updatelyric(player.musicList[0]);
      }).fail(function(){
        // 2. Local use
        console.log("Ajax fail, use local data");
        $.each(musicList, function(index, ele){
          let $newMusicItem = crateMusicItem(index, ele);
          $musicList.append($newMusicItem);
        })
        player.musicList = musicList;
        // player.audio.src = player.musicList[0].link_url;
        updateMusicInfo(player.musicList[0]);
        updatelyric(player.musicList[0]);
      })
  }

  // init music lyric obj
  function updatelyric(music) {
    lyric = new Lyric(music.link_lrc);
    let $lyricList = $(".song-lyric");
    // clear old lyrics
    $lyricList.html("");
    lyric.loadLyric(function(){
      // add lyrics to UI
      $.each(lyric.lyrics, function(index, ele){
        let $curLyric = $("<li>" + ele + "</li>");
        $lyricList.append($curLyric);
      });
    })
  };

  // updates music info on app
  function updateMusicInfo(music){
    let $musicImage = $(".song-info-pic img");
    let $musicName = $(".song-info-name a");
    let $musicSinger = $(".song-info-singer a");
    let $musicAblum = $(".song-info-ablum a");
    let $musicProgressName = $(".music-progress-name");
    let $musicProgressTime = $(".music-progress-time");
    let $musicBg = $(".bg");

    $musicImage.attr("src", music.cover);
    $musicName.text(music.name);
    $musicSinger.text(music.singer);
    $musicAblum.text(music.album);
    $musicProgressName.text(music.name + " / " + music.singer);
    $musicProgressTime.text("00:00 / " + music.time);
    $musicBg.css("background", "url('" + music.cover + "')")
  }

  // inits event handlers
  function initEvents() {
    let $footerPlay = $(".music-selection .music-play");
    // 1. shows and hides the function btns when mouse moves in and out
    // event delegation, cuz music items are dynamically appended
    $(".content-list").on("mouseenter", ".list-item:not(.list-title)", function(){
      $(this).find(".list-menu").stop().fadeIn(100);
			$(this).find(".list-time span").stop().fadeOut(100);
    });
    $(".content-list").on("mouseleave", ".list-item:not(.list-title)", function(){
			$(this).find(".list-menu").stop().fadeOut(100);
			$(this).find(".list-time span").stop().fadeIn(100);
    });
    // 2. check box
    // event delegation needed
    $(".content-list").on("click", ".list-check", function(){
      $(this).toggleClass("list-checked");
    })
    // 3. toggle play/stop icon and play/change/pause music on music item when clicked
    $(".content-list").on("click", ".list-menu-play", function(){
      let $curItem = $(this).parents(".list-item");
      $(this).toggleClass("list-menu-play-on");
      $curItem.siblings().find(".list-menu .list-menu-play").removeClass("list-menu-play-on");
      $curItem.find(".list-number").toggleClass("list-number2"); // shows playing icon on number
      $curItem.siblings().find(".list-number").removeClass("list-number2"); // shows playing icon on number
      // Synchronizes the status(play/stop) of icon in list-item on footer
      // and highlights the select item
      if ($(this).attr("class").includes("list-menu-play-on")) {
        $footerPlay.addClass("music-play2");
        $curItem.find("div").css("color","#fff");
        $curItem.siblings().find("div").css("color","rgba(255,255,255,0.5)");

      } else {
        $footerPlay.removeClass("music-play2");
        $curItem.find("div").css("color","rgba(255,255,255,0.5)");
      }
      // play music
      player.playMusic($curItem.get(0).index, $curItem.get(0).music);
      // update music info
      updateMusicInfo($curItem.get(0).music);
      // update lyric info
      updatelyric($curItem.get(0).music);
    })
    // 4. buttom music selection(pre/play/next)
    $footerPlay.on("click", function(){
      // if no music has been played, start playing 1st music in list
      if (player.curPlayIndex == -1) {
        // list-item but not title
        $(".list-item:not(.list-title)").eq(0).find(".list-menu-play").trigger("click");
      } else {
        $(".list-item:not(.list-title)").eq(player.curPlayIndex).find(".list-menu-play").trigger("click");
      }
    })
    $(".music-pre").on("click", function(){
      $(".list-item:not(.list-title)").eq(player.changeIndex(-1)).find(".list-menu-play").trigger("click");
    })
    $(".music-next").on("click", function(){
      $(".list-item:not(.list-title)").eq(player.changeIndex(1)).find(".list-menu-play").trigger("click");  
    })
    // 5. del music from del btn on list
    $(".content-list").on("click", ".list-menu-del", function(){
      let $delItem = $(this).parents(".list-item");
      let delIndex = $delItem.get(0).index;
      // if deleted song is cur playing one, start playing next song
      if (delIndex == player.curPlayIndex) {
        $(".music-next").trigger("click");
      }
      // remove music from list and data in player obj
      $delItem.remove();
      player.delMusic(delIndex);
      // reorder the index of musics in list(also the index bound with native dom)
      $(".list-item:not(.list-title)").each(function(index, item){
        item.index = index;
        $(item).find(".list-number").text(index + 1);
      });
    })
    // 6. timeupdate of audio and sync time display on footer
    // updates the lyric on right side of page
    player.musicTimeUpdate(function(curTime, duration, timeStr){
      $(".music-progress-time").text(timeStr);
      // changes position of progress bar
      let percent = curTime / duration * 100;
      progress.setProgress(percent);
      // changes the lyric display on UI
      let curLyricIndex = lyric.getLyricIndex(curTime);
      let $curLyricItem = $(".song-lyric li").eq(curLyricIndex);
      $curLyricItem.addClass("cur");
      $curLyricItem.siblings().removeClass("cur");
      // moves lyric
      if (curLyricIndex >= 2) {
        $(".song-lyric").css({
          marginTop: - (curLyricIndex - 2) * 30
        })
      }
    });
    // 7. sound icon click
    $(".music-sound-icon").on("click", function(){
      $(this).toggleClass("music-sound-icon2"); // class of muted
      if ($(this).attr("class").includes("music-sound-icon2")) {
        preVol = player.getVol();
        player.setVol(0);
      } else {
        player.setVol(preVol);
      }
    })
  }

	// creates the music item in music list
	function crateMusicItem(index, music) {
		var $item = $("" +
		"<li class=\"list-item\">\n" +
				"<div class=\"list-check\"><i></i></div>\n" +
				"<div class=\"list-number\">" + (index + 1) + "</div>\n" +
				"<div class=\"list-name\">" + music.name + "" +
				"     <div class=\"list-menu\">\n" +
				"          <a href=\"javascript:;\" title=\"播放\" class='list-btn list-menu-play'></a>\n" +
				"          <a href=\"javascript:;\" title=\"添加\" class='list-btn'></a>\n" +
				"          <a href=\"javascript:;\" title=\"下载\" class='list-btn'></a>\n" +
				"          <a href=\"javascript:;\" title=\"分享\" class='list-btn'></a>\n" +
				"     </div>\n" +
				"</div>\n" +
				"<div class=\"list-singer\">" + music.singer + "</div>\n" +
				"<div class=\"list-time\">\n" +
				"     <span>" + music.time + "</span>\n" +
        "     <div class=\"list-menu\">\n" + 
        "         <a href=\"javascript:;\" title=\"删除\" class='list-btn list-menu-del'></a>\n" + 
        "     </div>\n" +
				"</div>\n" +
		"</li>");

    // bind index and music data to native dom node
    $item.get(0).index = index;
    $item.get(0).music = music;
		return $item;
  }
})();

// local data of music list
var musicList = 
[
  {
    "name":"As long AS Love Me",
    "singer": "Justin Bieber",
    "album": "NOW That's What I Call Music! 44",
    "time": "03:49",
    "link_url":"./source/AslongASLoveMe.mp3",
    "cover": "./source/AslongASLoveMe.jpg",
    "link_lrc": "./source/AslongASLoveMe.txt"
  },
  {
    "name":"告白气球",
    "singer": "周杰伦",
    "album": "周杰伦的床边故事",
    "time": "03:35",
    "link_url":"./source/告白气球.mp3",
    "cover":"./source/告白气球.jpg",
    "link_lrc":"./source/告白气球.txt"
  },
  {
    "name":"Something Just Like This",
    "singer": "Chainsmokers",
    "album": "Something Just Like This",
    "time": "04:07",
    "link_url":"./source/SomethingJustLikeThis.mp3",
    "cover":"./source/SomethingJustLikeThis.jpg",
    "link_lrc":"./source/SomethingJustLikeThis.txt"
  },
  {
    "name":"Your Song",
    "singer": "Lady Gaga",
    "album": "Your Song",
    "time": "04:16",
    "link_url":"./source/YourSong.mp3",
    "cover":"./source/YourSong.jpg",
    "link_lrc":"./source/YourSong.txt"
  },
  {
    "name":"凉凉",
    "singer": "杨宗纬/张碧晨",
    "album": "凉凉",
    "time": "05:00",
    "link_url":"./source/凉凉.mp3",
    "cover":"./source/凉凉.jpg",
    "link_lrc":"./source/凉凉.txt"
  },
  {
    "name":"小城大事",
    "singer": "张学友",
    "album": "学友光年世界巡迴演唱会",
    "time": "03:54",
    "link_url":"./source/小城大事.mp3",
    "cover":"./source/小城大事.jpg",
    "link_lrc":"./source/小城大事.txt"
  },
  {
    "name":"演员",
    "singer": "薛之谦",
    "album": "绅士",
    "time": "04:21",
    "link_url":"./source/演员.mp3",
    "cover":"./source/演员.jpg",
    "link_lrc":"./source/演员.txt"},
  {
    "name":"百里守约",
    "singer": "萧敬腾",
    "album": "《王者荣耀》百里守约英雄主打歌",
    "time": "03:42",
    "link_url":"./source/百里守约.mp3",
    "cover":"./source/百里守约.jpg",
    "link_lrc":"./source/百里守约.txt"
  },
  {
    "name":"说散就散",
    "singer": "袁娅维",
    "album": "说散就散",
    "time": "04:02",
    "link_url":"./source/说散就散.mp3",
    "cover":"./source/说散就散.jpg",
    "link_lrc":"./source/说散就散.txt"
  },
  {
    "name":"输了你赢了世界又如何",
    "singer": "林俊杰",
    "album": "梦想的声音《第二季》",
    "time": "04:43",
    "link_url":"./source/输了你赢了世界又如何.mp3",
    "cover":"./source/输了你赢了世界又如何.jpg",
    "link_lrc":"./source/输了你赢了世界又如何.txt"
  }
];