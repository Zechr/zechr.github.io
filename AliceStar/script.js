var wlabels = {};
var llabels = {};
var labelSet = [];
var topics = {};
var numLabels = 0;
var topicSyntax = {};
var commands = {};
var responses = {};
var respimg = {};
var respprev = {};
//-weather
//-yugioh
//-yelp locations
//google maps
//generic search
//-anime search
//movie search
//-music search

$(document).ready(function() {
  $.get("lw.txt", function(data) {loadLW(data);});
  $.get("ll.txt", function(data) {loadLL(data);});
  $.get("commands.txt", function(data) {loadCommands(data);});
  $.get("topics.txt", function(data) {loadTopics(data);});
  $.get("responses.txt", function(data) {loadResponses(data);});
  $('#chatbox').append("<div class='message'> Welcome home, Master. </div>");
  $('#userbox').keydown(function(event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      startquery();
    }
  });
});

function startquery() {
    input = $('.main-box').val();
    $('#chatbox').append("<div class='messageself'>"+input+"</div>");
    process(input);
    $('.main-box').val('');
}

function loadLW(stats) {
  var allTextLines = stats.split(/\r\n|\n/);
  for (var i = 0; i < allTextLines.length; i++) {
    var data = allTextLines[i].split(' ');
    if (data[0] in wlabels) {
      wlabels[data[0]][data[1]] = Number(data[2]);
    } else {
      var dict = {};
      dict[data[1]] = Number(data[2]);
      wlabels[data[0]] = dict;
    }
  }
}

function loadLL(stats) {
  var allTextLines = stats.split(/\r\n|\n/);
  for (var i = 0; i < allTextLines.length; i++) {
    var data = allTextLines[i].split(' ');
    if (data[0] in llabels) {
      llabels[data[0]][data[1]] = Number(data[2]);
    } else {
      var dict = {};
      dict[data[1]] = Number(data[2]);
      llabels[data[0]] = dict;
    }
    if ($.inArray(data[0], labelSet) === -1) {
      labelSet.push(data[0]);
    }
  }
  numLabels = labelSet.length;
}

function loadCommands(coms) {
  var allTextLines = coms.split(/\r\n|\n/);
  for (var i = 0; i < allTextLines.length; i++) {
    var data = allTextLines[i].split(' ');
    if (i%2 == 0) {
      commands[data[0]] = data.slice(1);
    } else {
      topicSyntax[data[0]] = data.slice(1);
    }
  }
}

function loadTopics(t) {
  var allTextLines = t.split(/\r\n|\n/);
  for (var i = 0; i < allTextLines.length; i++) {
    var data = allTextLines[i].split(' ');
    topics[data[0]] = {};
    for (var j = 1; j < data.length; j+=2) {
      topics[data[0]][data[j]] = Number(data[j + 1]);
    }
  }
}

function loadResponses(r) {
  var allTextLines = r.split(/\r\n|\n/);
  for (var i = 0; i < allTextLines.length; i+=3) {
    var data1 = allTextLines[i];
    var data2 = allTextLines[i+1];
    if (!responses.hasOwnProperty(data1)) {
      responses[data1] = [];
    }
    responses[data1].push(data2);
    respimg[data2] = allTextLines[i+2];
  }
}

function process(sentence) {
  var words = sentence.toLowerCase().split(/\W+/);  
  classify(words);
}

function dictDefault(dictmap, key, deft) {
  if (dictmap.hasOwnProperty(key)) {
    return dictmap[key];
  } else {
    if (dictmap.hasOwnProperty("*UNK*")) {
      return dictmap["*UNK*"];
    }
    return deft;
  }
}

function posLabel(words) {
  var labels = [];
  var viterbi = [];
  for (var ws = 0; ws < words.length + 1; ws++) {
    viterbi[ws] = [];
    for (var col = 0; col < numLabels; col++) {
      viterbi[ws][col] = []
    }
  }
  for (var i = 0; i <= words.length; i++) {
    if (i == words.length) {
      var pmax = 2;
      var lmax = "";
      var lmaxIndex = -1;
      for (var k = 0; k < numLabels; k++) {
        var tempP = dictDefault(llabels[labelSet[k]], "STOP", Math.log(0.0000001)) + viterbi[i - 1][k][0];
        if (tempP > pmax || pmax == 2) {
          pmax = tempP;
          lmax = labelSet[k];
          lmaxIndex = k;
        }
      }
      viterbi[i][0][0] = pmax;
      viterbi[i][0][1] = lmax;
      viterbi[i][0][2] = lmaxIndex;
      continue;
    }
    for (var j = 0; j < numLabels; j++) {
      var pmax = 2;
      var lmax = "";
      var lmaxIndex = -1;
      if (i == 0) {
        pmax = dictDefault(wlabels[labelSet[j]], words[i], Math.log(0.0000001));
        viterbi[i][j] = [pmax,"STOP", -1];
        continue;
      }
      for (var k = 0; k < numLabels; k++) {
        if (labelSet[k] == "STOP") {
          continue;
        }
        var tempP = dictDefault(wlabels[labelSet[j]], words[i], Math.log(0.0000001)) 
                  + dictDefault(llabels[labelSet[k]], labelSet[j], Math.log(0.0000001)) 
                  + viterbi[i-1][k][0];
        if (tempP > pmax || pmax == 2) {
          pmax = tempP;
          lmax = labelSet[k];
          lmaxIndex = k;
        }
      }
      //viterbi[i][j] = [pmax, lmax, lmaxIndex];
      viterbi[i][j][0] = pmax;
      viterbi[i][j][1] = lmax;
      viterbi[i][j][2] = lmaxIndex;
    }
  }
  var maxend = 2;
  var maxIndex = -1;
  //console.log(viterbi[words.length][0][0]);
  /*for (var x = 0; x < numLabels; x++) {
    if (maxend == 2 || viterbi[words.length - 1][x][0] > maxend) {
      maxend = viterbi[words.length - 1][x][0];
      maxIndex = x;
    }
    //console.log(labelSet[x]);
    //console.log(labelSet[viterbi[words.length - 1][x][2]]);
    //console.log(viterbi[words.length - 1][x][0]);
  }*/
  maxIndex = viterbi[words.length][0][2];
  var curw = words.length - 1;
  while (curw >= 0) {
    labels.unshift(labelSet[maxIndex]);
    maxIndex = viterbi[curw][maxIndex][2];
    curw -= 1;
  }
  return [words, labels]; 
}

function topic(words) {
  sentDict = {};
  psum = 0
  for (var i = 0; i < words.length; i++) {
    if (words[i] in sentDict) {
      pval = ((sentDict[words[i]] + 1)/words.length)/dictDefault(topics["commons"], words[i], 0.00001);
      sentDict[words[i]] = pval;
      psum += pval;
    } else {
      pval = (1/words.length)/dictDefault(topics["commons"], words[i], 0.00001);
      sentDict[words[i]] = pval;
      psum += pval;
    }
  }
  for (word in sentDict) {
    sentDict[word] = sentDict[word]/psum;
  }
  topicP = {};
  total = 0
  for (topicKey in topics) {
    var dist = 0;
    for (word in sentDict) {
      dist += Math.pow(sentDict[word] - dictDefault(topics[topicKey], word, 
                  dictDefault(topics["commons"], words[i], 0.00001)), 2);
    }
    dist = 1/Math.sqrt(dist);
    topicP[topicKey] = dist;
  }
  digitdiff = 0;
  unsat = true;
  while(unsat && digitdiff < 5){
    vals = [];
    for (topicKey in topicP){
      vals.push(Math.floor(topicP[topicKey]*Math.pow(10, digitdiff)));
    }
    for (var j = 0; j < vals.length - 1; j++){
      if (vals[j] != vals[j+1]){
        unsat = false;
        break;
      }
      if (j == vals.length - 2) {
        digitdiff++;
      }
    }  
  }
  for (topicKey in topicP) {
    topicP[topicKey] = Math.pow(10, digitdiff)*topicP[topicKey] - 10*(Math.floor(Math.pow(10, digitdiff - 1)*topicP[topicKey]));
    total += topicP[topicKey];
  }
  for (topicKey in topicP) {
    topicP[topicKey] = topicP[topicKey]/total;
  }
  return topicP;
}

function lcs(pos1, pos2) {
  var dp = [];
  for (var i = 0; i < pos1.length; i++) {
    dp[i] = [];
    for (var j = 0; j < pos2.length; j++) {
      dp[i].push(0);
    }
  }  
  for (var x = 0; x < pos1.length; x++) {
    if (pos1[x] == pos2[0]) {
      dp[x][0] = 1;
    } else {
      if (x == 0) {
        dp[x][0] = 0;
      } else {
        dp[x][0] = dp[x - 1][0];
      }
    }
  }
  for (var y = 1; y < pos2.length; y++) {
    if (pos1[0] == pos2[y]) {
      dp[0][y] = 1;
    } else {
      dp[0][y] = dp[0][y - 1];
    }
  }
  for (var i = 1; i < pos1.length; i++) {
    for (var j = 1; j < pos2.length; j++) {
      if (pos1[i] == pos2[j]) {
        dp[i][j] = dp[i-1][j-1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
      }
    }
  }
  return dp[pos1.length - 1][pos2.length - 1];
}

function grammarMatch(syntax) {
  var topicG = {};
  for (topicKey in topicSyntax) {
    topicG[topicKey] = lcs(syntax, topicSyntax[topicKey]);
  }
  return topicG;
}

function classify(words) {
  var topicG = grammarMatch(posLabel(words)[1]);
  var topicP = topic(words);
  var maxP = 0;
  var maxTopic = "";
  grammarTotal = 0;
  for (topicKey in topicP) {
    topicG[topicKey] = (topicG[topicKey]+1)/(words.length+1);
    grammarTotal += topicG[topicKey];
  }
  for (topicKey in topicP) {
    topicG[topicKey] = topicG[topicKey]/grammarTotal;
  }
  for (topicKey in topicP) {
    console.log(topicKey);
    console.log(topicP[topicKey]);
    console.log(topicG[topicKey]);
    var temp = 0.65*topicP[topicKey] + 0.35*topicG[topicKey];
    if (temp > maxP || maxP == 0) {
      maxP = temp;
      maxTopic = topicKey;
    }
  }
  console.log(maxTopic);
  if (maxTopic == "weather") {
    weatherCom(maxTopic);
  } else if (maxTopic == "yugioh") {
    var index = words.indexOf("yugioh");
    if (index > - 1) {
      yugiohCom(words.splice(index + 1), maxTopic);
    } else {
      yugiohCom(words, maxTopic);
    }
  } else if (maxTopic == "anime") {
    var index = words.indexOf("anime");
    if (index > - 1) {
      animeCom(words.splice(index + 1), maxTopic);
    } else {
      animeCom(words, maxTopic);
    }
  } else if (maxTopic == "music") {
    musicCom(words, maxTopic);
  } else if (maxTopic == "yelp") {
    yelpCom(words, maxTopic);
  }
}

function paramSearch(baselink, words, separator, ender, source) {
  var link = baselink;
  var temp = "";
  var query = ""
  for (var i = 0; i < words.length; i++) {
    if (i < words.length - 1) {
      temp += words[i] + separator;
      query += words[i] + " "
    } else {
      temp += words[i];
      query += words[i]
    }
  }
  link += temp;
  link += ender;
  $('#chatbox').append("<a href='" + link + 
    "' target='_blank'><div class='message' style='color: rgb(140, 160, 200); text-decoration: underline'>" 
    + source + " " + query +"</div></a>")
  $("#chatbox").animate({
        scrollTop: $("#chatbox")[0].scrollHeight
    }, 300);
  return link;
}

function topicResp(topic) {
  var resps = responses[topic]
  var resp = resps[Math.floor(Math.random()*resps.length)];
  while (topic in respprev && resp === respprev[topic]) {
    resp = resps[Math.floor(Math.random()*resps.length)];
  }
  respprev[topic] = resp;
  $('.avatar').hide();
  $("#" + respimg[resp].slice(0, -4)).show();
  $('#chatbox').append("<div class='message'>"+resp+"</div>");
}

function yugiohCom(words, topic) {
  topicResp(topic);
  var link = "http://shop.tcgplayer.com/productcatalog/product/show?newSearch=false&ProductName=";
  paramSearch(link, words, "%20", "", "TCG Player");
  var link2 = "https://www.reddit.com/r/yugioh/search?q=";
  paramSearch(link2, words, "+", "&restrict_sr=on&sort=relevance&t=all", "Reddit")
}

function animeCom(words, topic) {
  topicResp(topic);
  var link = "https://myanimelist.net/search/all?q=";
  paramSearch(link, words, "%20", "", "MAL");
  var link2 = "https://www.reddit.com/r/anime/search?q=";
  paramSearch(link2, words, "+", "&restrict_sr=on&sort=relevance&t=all", "Reddit")
}

function weatherCom(topic) {
  topicResp(topic);
  $('#miniweb').attr('src', "http://www.wunderground.com/");
}

function musicCom(words, topic) {
  topicResp(topic);
  toRemove = ["play", "music", "mix", "playlist"];
  for (var i = 0; i < toRemove.length; i++) {
    var index = words.indexOf(toRemove[i]);
    while (index != -1) {
      words.splice(index, 1);
      index = words.indexOf(toRemove[i]);
    }
  }
  words.push("mix")
  paramSearch("https://www.youtube.com/results?search_query=", words, "+", "", "Youtube");
}

function yelpCom(words, topic) {
  topicResp(topic);
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

function chatCom(words, topic) {
}
