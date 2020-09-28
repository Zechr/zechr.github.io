function mtgCom(words, topicClass) {
  var index = words.indexOf("mtg");
  if (index > - 1) {
    words = words.splice(index + 1);
  }
  var link = "https://www.tcgplayer.com/search/magic/product?productLineName=magic&q=";
  paramSearch(link, words, "%20", "", "TCG Player");
  var link2 = "https://www.reddit.com/r/magicTCG/search?q=";
  paramSearch(link2, words, "+", "&restrict_sr=on&sort=relevance&t=all", "Reddit")
}
