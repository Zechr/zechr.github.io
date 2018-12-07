function mathCom(words, topicClass) {
  for (var i = 0; i < words.length; i++) {
    words[i] = words[i].replace("^", "%5E").replace("+", "%2B").replace("=", "%3D").replace("|", "%7C");
  }
  newwords = []
  var i = 0
  while(i < words.length) {
    if (words[i] == ".") {
      if (i == 0) {
        newwords.push(words[i] + words[i+1]);
        i += 2;
      } else {
        prev = newwords.pop();
        newwords.push(prev + words[i] + words[i+1]);
        i += 2;
      }
    } else {
      newwords.push(words[i]);
      i++;
    }
  }
  if (window.matchMedia('screen and (max-width: 768px)').matches) {
    window.open(paramSearch("http://www.wolframalpha.com/input/?i=", newwords, "+", "", "Wolfram Alpha").replace("www", "m"));
  } else {
    $('#miniweb').attr('src', 
        paramSearch("http://www.wolframalpha.com/input/?i=", newwords, "+", "", "Wolfram Alpha"));
  }
} 