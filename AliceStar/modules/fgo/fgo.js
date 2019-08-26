function fgoCom(words, topicClass) {
  var index = words.indexOf("fgo");
  if (index > - 1) {
    words = words.splice(index + 1);
  }
  var link = "https://fategrandorder.fandom.com/wiki/Special:Search?query=";
  paramSearch(link, words, "+", "", "Wiki");
  var link2 = "https://www.reddit.com/r/grandorder/search?q=";
  paramSearch(link2, words, "+", "&restrict_sr=on&sort=relevance&t=all", "Reddit")
}