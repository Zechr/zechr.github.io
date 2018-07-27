function yugiohCom(words, topicClass) {
  var index = words.indexOf("yugioh");
  if (index > - 1) {
    words = words.splice(index + 1);
  }
  topicResp(topicClass);
  var link = "http://shop.tcgplayer.com/productcatalog/product/show?newSearch=false&ProductName=";
  paramSearch(link, words, "%20", "", "TCG Player");
  var link2 = "https://www.reddit.com/r/yugioh/search?q=";
  paramSearch(link2, words, "+", "&restrict_sr=on&sort=relevance&t=all", "Reddit")
}
