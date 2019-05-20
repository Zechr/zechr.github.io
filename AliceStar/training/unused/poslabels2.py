from __future__ import division
import math

lines = [line.rstrip('\n') for line in open('wsj2-21.txt')]
labelcount = dict()
wordcount = dict()
lw = dict()
ll = dict()
for line in lines:
  words = line.split()
  for i in xrange(0, len(words)+2, 2):
    prev = ""
    if i == 0:
      prev = "STOP"
    else:
      prev = words[i-1]
    
    if i == len(words):
      if words[i - 1] not in ll:
        ll[words[i - 1]] = dict()
      if "STOP" not in lw:
        lw["STOP"] = dict()
      labelprev = ll[words[i - 1]]
      labelprev["STOP"] = labelprev.get("STOP", 0) + 1
      labeldict = lw["STOP"]
      labeldict["STOP"] = labeldict.get("STOP", 0) + 1
      labelcount[prev] = labelcount.get(prev, 0) + 1
      wordcount["STOP"] = wordcount.get("STOP", 0) + 1
      break
    
    labelcount[prev] = labelcount.get(prev, 0) + 1
    wordcount[words[i]] = wordcount.get(words[i], 0) + 1
    
    if words[i] not in lw:
      lw[words[i]] = dict()
    if prev not in ll:
      ll[prev] = dict()
    labeldict = lw[words[i]]
    labeldict[words[i+1]] = labeldict.get(words[i+1], 0) + 1
    labelprev = ll[prev]
    labelprev[words[i + 1]] = labelprev.get(words[i + 1], 0) + 1
      
target1 = open('ll2.txt', 'w')
target2 = open('lw2.txt', 'w')

wline1 = True
lline1 = True

vocab = len(lw.keys())
states = len(ll.keys())
alpha = 5

lw["*U*"] = dict()

for word in lw:
  if word == "*U*":
    continue
  if wordcount[word] == 1:
    worddict = lw["*U*"]
    for label in lw[word]:
      worddict[label] = worddict.get(label, 0) + lw[word][label]
    wordcount["*U*"] = wordcount.get("*U*", 0) + 1

for word in lw:
  total_word_i = wordcount[word]
  worddict = lw[word]
  for label in worddict:
    worddict[label] = math.log(worddict[label]/total_word_i)
    if not wline1:
      target2.write("\n")
    else:
      wline1 = False
    target2.write(word + " " + label + " " + str(worddict[label]))

for prev in ll:
  total_label_i = labelcount[prev]
  prevdict = ll[prev]
  for label in prevdict:
    prevdict[label] = math.log(prevdict[label]/total_label_i)
    if not lline1:
      target1.write("\n")
    else:
      lline1 = False
    target1.write(prev + " " + label + " " + str(prevdict[label]))

target1.close()
target2.close()

    
