function yelpCom(words, topicClass) {
  toRemove = ["yelp", "to" ,"place", "places"];
  for (var i = 0; i < toRemove.length; i++) {
    var index = words.indexOf(toRemove[i]);
    while (index != -1) {
      words.splice(index, 1);
      index = words.indexOf(toRemove[i]);
    }
  }
  paramSearch("https://www.yelp.com/search?find_desc=", words, "+", "", "Yelp");
}