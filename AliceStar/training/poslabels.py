import math
import json
import sys

manifest_data = None
# manifest_labels.json path
with open(sys.argv[1], 'r') as f:
    manifest_data = json.load(f)

lines = [line.rstrip('\n') for line in open(manifest_data["corpus"])]
labelcount = dict()
lw = dict()
ll = dict()
for line in lines:
    words = line.split()
    for i in range(0, len(words)+2, 2):
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
            labelcount["STOP"] = labelcount.get("STOP", 0) + 1
            break
        
        labelcount[words[i+1]] = labelcount.get(words[i+1], 0) + 1
        
        if words[i + 1] not in lw:
            lw[words[i+1]] = dict()
        if prev not in ll:
            ll[prev] = dict()
        labeldict = lw[words[i+1]]
        labeldict[words[i]] = labeldict.get(words[i], 0) + 1
        labelprev = ll[prev]
        labelprev[words[i + 1]] = labelprev.get(words[i + 1], 0) + 1
      
target1 = open(manifest_data["label_label"], 'w+')
target2 = open(manifest_data["label_word"], 'w+')

wline1 = True
lline1 = True

vocab = len(lw.keys())
states = len(ll.keys())
alpha = 5

for label in lw:
    total_label_i = labelcount[label]
    worddict = lw[label]
    for word in worddict:
        worddict[word] = math.log((worddict[word] + alpha)/(total_label_i + alpha*vocab))
        if not wline1:
            target2.write("\n")
        else:
            wline1 = False
        target2.write(label + " " + word + " " + str(worddict[word]))
    prevdict = ll[label]
    for prev in prevdict:
        prevdict[prev] = math.log((prevdict[prev] + alpha)/(total_label_i + alpha*states))
        if not lline1:
            target1.write("\n")
        else:
            lline1 = False
        target1.write(label + " " + prev + " " + str(prevdict[prev]))

target1.close()
target2.close()

    