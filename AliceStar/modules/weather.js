function weatherCom(topicClass) {
  $("#chatbox").animate({
        scrollTop: $("#chatbox")[0].scrollHeight
    }, 300);
  if (window.matchMedia('screen and (max-width: 768px)').matches) {
    window.open("http://www.wunderground.com/");
  } else {
    $('#miniweb').attr('src', "http://www.wunderground.com/");
  }
}