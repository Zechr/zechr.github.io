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
var conversations = {};
var convmap = {};
var costumes = [];
var modules = {};
var numModules = 0;
var curModule = 0;

// Note: commands.txt, topics.txt, responses.txt, and module_list.txt must all
// have the same commands and use the same keywords for them. The module name 
// should be the same as the keyword

$(document).ready(function() {
  $.get("data/lw.txt", function(data) { loadLW(data); });
  $.get("data/ll.txt", function(data) { loadLL(data); });
  $.get("data/commands.txt", function(data) { loadCommands(data); });
  $.get("data/topics.txt", function(data) { loadTopics(data); });
  $.getJSON("data/responses.json", function(data) { loadResponses(data); });
  $.get("data/conversation.txt", function(data) { loadConversation(data); });
  $.get("data/convmode.txt", function(data) { loadConvMap(data); });
  $.get("module_list.txt", function(data) { loadModules(data); });
  $.getScript("main_dependencies/classifier.js", function(data) {});
  //$.get("costumes.txt", function(data) {loadCostumes(data);});
  $('#chatbox').append("<div class='chat-bubble'><img src='images/AliceAvatarIcon.png' " + "width=100%></div>");
  sayMessage('Welcome home, Master.');
  $('#userbox').keydown(function(event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      startquery();
    }
  });
});

function startquery() {
  input = $('.main-box').val();
  $('.main-box').val('');
  $('#chatbox').append("<div class='messageself'>"+input+"</div>");
  process(input);
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

function loadResponses(responseJSON) {
  for (const key in responseJSON) {
    if (!responses.hasOwnProperty(key)) {
      responses[key] = []
    }
    for (const { response, img } of responseJSON[key]) {
      responses[key].push(response)
      respimg[response] = img
    }
  }
}

function loadConversation(data) {
  var allTextLines = data.split(/\r\n|\n/);
  for (var i = 0; i < allTextLines.length; i+=2) {
    convline = allTextLines[i+1].split(' ');
    respimg[convline[0]] = convline[1]
    conversations[convline[0]] = convline.slice(2, convline.length).join(' ');
  }
}

function loadConvMap(data) {
  var allTextLines = data.split(/\r\n|\n/);
  for (var i = 0; i < allTextLines.length; i++) {
    dist = allTextLines[i].split(' ');
    convmap[dist[0]] = {};
    if (dist[0] == "commons") {
      topics["conv"] = {};
    }
    for (var j = 1; j < dist.length; j+=2) {
      convmap[dist[0]][dist[j]] = Number(dist[j+1]);
      if (dist[0] == "commons") {
        topics["conv"][dist[j]] = Number(dist[j+1]);
      }
    }
  }
}

function loadCostumes(data) {

}

function loadModules(data) {
  var allTextLines = data.split(/\r\n|\n/);
  numModules = allTextLines.length;
  for (var i = 0; i < allTextLines.length; i++) {   
    keyword = allTextLines[i];
    modules[keyword] = 1;
    $.getScript("modules/" + keyword + "/" + keyword + ".js", function() {
      curModule = curModule + 1; 
      if (curModule >= numModules) {
        assignModuleFunctions();
      }
    });
  }
}

function assignModuleFunctions() {
  for (var key in modules) {
    modules[key] = window[key + "Com"];
  }
}

function process(sentence) {
  var wordstemp = sentence.toLowerCase().split(" ");
  var words = [];
  for (var i = 0; i < wordstemp.length; i++) {
    var ws = wordstemp[i].split(/(\W)/);
    for (var j = 0; j < ws.length; j++) {
      var w = ws[j];
      if (w != '') {
        words.push(w);
      }
    }
  }
  classify(words);
}

function classify(words) {
  const topicG = grammarMatch(posLabel(words)[1]);
  const topicP = topic(words, topics);
  let maxP = 0;
  let maxTopic = "";
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
    let temp = 0.05*topicG[topicKey] + 0.95*topicP[topicKey];
    if (temp > maxP || maxP == 0) {
      maxP = temp;
      maxTopic = topicKey;
    }
  }
  console.log(maxTopic);
  if (maxTopic == "conv") {
    chatCom(words, maxTopic);
  } else {
    topicResp(maxTopic);
    modules[maxTopic](words, maxTopic);
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
    "' target='_blank'><div class='message' style='color: rgb(140, 160, 200); text-decoration: underline; clear:both'>" 
    + source + " " + query +"</div></a>")
  $("#chatbox").animate({
        scrollTop: $("#chatbox")[0].scrollHeight
    }, 300);
  return link;
}

function topicResp(topicClass) {
  var resps = responses[topicClass]
  var resp = resps[Math.floor(Math.random()*resps.length)];
  while (topicClass in respprev && resp === respprev[topicClass]) {
    resp = resps[Math.floor(Math.random()*resps.length)];
  }
  respprev[topicClass] = resp;
  faceExpression(respimg[resp].slice(0, -4));
  sayMessage(resp);
}

function sayMessage(message) {
  $('#chatbox').append("<div class='message'>"+message+"</div>");
  $("#chatbox").animate({
        scrollTop: $("#chatbox")[0].scrollHeight
    }, 300);
  var msg = new SpeechSynthesisUtterance(message);
  var myTimer = setInterval(function() {
    var voices = speechSynthesis.getVoices();
    if (voices.length !== 0) {
      msg.voice = voices.find(voice => voice.name === "Google US English");
      speechSynthesis.speak(msg);
      clearInterval(myTimer);
    }
  }, 500);
}

function faceExpression(img_name) {
  $('.avatar').hide();
  $("#" + img_name).show();
  $('#chatbox').append("<div class='chat-bubble'><img src='images/"+ img_name + "Icon.png' " + "width=100%></div>");
}

function chatCom(words, topicClass) {
  maxTopic = "";
  maxP = -1;
  adjwords = []
  for (var i = 0; i < words.length; i++) {
    if (words[i].match(/^[a-z0-9]+$/)) {
      adjwords.push(words[i]);
    }
  }
  topicP = topic(adjwords, convmap);
  for (subject in convmap) {
    console.log(subject);
    console.log(topicP[subject]);
    if (subject != "commons" && (maxP == -1 || topicP[subject] > maxP)) {
      maxTopic = subject;
      maxP = topicP[subject];
    }
  }
  faceExpression(respimg[maxTopic].slice(0, -4));
  sayMessage(conversations[maxTopic]);
  
}
