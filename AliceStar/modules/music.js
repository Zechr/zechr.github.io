function musicCom(words, topicClass) {
  toRemove = ["play", "music", "mix", "playlist"];
  for (var i = 0; i < toRemove.length; i++) {
    var index = words.indexOf(toRemove[i]);
    while (index != -1) {
      words.splice(index, 1);
      index = words.indexOf(toRemove[i]);
    }
  }
  words.push("mix");
  paramSearch("https://www.youtube.com/results?search_query=", words, "+", "", "Youtube");
}