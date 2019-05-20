function animeCom(words, topicClass) {
  var index = words.indexOf("anime");
  if (index > - 1) {
    words = words.splice(index + 1);
  }
  var link = "https://myanimelist.net/search/all?q=";
  paramSearch(link, words, "%20", "", "MAL");
  var link2 = "https://www.reddit.com/r/anime/search?q=";
  paramSearch(link2, words, "+", "&restrict_sr=on&sort=relevance&t=all", "Reddit")
}