const DEFAULT_PROBABILITY = 1e-10;

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
        var tempP = dictDefault(llabels[labelSet[k]], "STOP", Math.log(DEFAULT_PROBABILITY)) + viterbi[i - 1][k][0];
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
        pmax = dictDefault(wlabels[labelSet[j]], words[i], Math.log(DEFAULT_PROBABILITY));
        viterbi[i][j] = [pmax,"STOP", -1];
        continue;
      }
      for (var k = 0; k < numLabels; k++) {
        if (labelSet[k] == "STOP") {
          continue;
        }
        var tempP = dictDefault(wlabels[labelSet[j]], words[i], Math.log(DEFAULT_PROBABILITY)) 
                  + dictDefault(llabels[labelSet[k]], labelSet[j], Math.log(DEFAULT_PROBABILITY)) 
                  + viterbi[i-1][k][0];
        if (tempP > pmax || pmax == 2) {
          pmax = tempP;
          lmax = labelSet[k];
          lmaxIndex = k;
        }
      }
      viterbi[i][j][0] = pmax;
      viterbi[i][j][1] = lmax;
      viterbi[i][j][2] = lmaxIndex;
    }
  }
  var maxend = 2;
  var maxIndex = -1;
  maxIndex = viterbi[words.length][0][2];
  var curw = words.length - 1;
  while (curw >= 0) {
    labels.unshift(labelSet[maxIndex]);
    maxIndex = viterbi[curw][maxIndex][2];
    curw -= 1;
  }
  return [words, labels]; 
}

function topic(words, topicDictionary) {
  const topicP = {};
  let maxLog = 1;
  for (const topicKey in topicDictionary) {
    if (topicKey === "commons") {
      continue;
    }
    let psum = 0;
    for (var i = 0; i < words.length; i++) {
      const multiplier = words.length - i;
      const pval = (Math.log(dictDefault(topicDictionary[topicKey], words[i], DEFAULT_PROBABILITY)) -
        Math.log(dictDefault(topicDictionary["commons"], words[i], DEFAULT_PROBABILITY))) * multiplier;
      psum += pval;
    }
    topicP[topicKey] = psum;
    if (maxLog === 1 || psum > maxLog) {
      maxLog = psum;
    }
  }
  let total = 0;
  for (const topicKey in topicP) {
    topicP[topicKey] = Math.exp(topicP[topicKey] - maxLog);
    total += topicP[topicKey];
  }
  for (const topicKey in topicP) {
    topicP[topicKey] /= total;
  }
  return topicP;
}

function lcs(pos1, pos2) {
  const dp = [];
  for (let i = 0; i < pos1.length; i++) {
    dp[i] = [];
    for (let j = 0; j < pos2.length; j++) {
      dp[i].push(0);
    }
  }  
  for (let x = 0; x < pos1.length; x++) {
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
  const topicG = {};
  for (topicKey in topicSyntax) {
    topicG[topicKey] = lcs(syntax, topicSyntax[topicKey]);
  }
  return topicG;
}