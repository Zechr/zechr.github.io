from __future__ import division
import re
import sys
import collections
import string
import json

manifest_data = None

topics = dict()
wcount = dict()
ctopics = dict()
cwcount = dict()
vocab = dict()
cvocab = dict()
totalcount = 0
ccount = 0

def topicwrite(docs):
    global totalcount
    global ccount
    for doc in docs:
        with open(doc, 'r+', encoding="utf8") as f:
            data = f.read()
            lines = data.splitlines()
            name = doc.replace("./../modules/", "").replace("/topic.txt", "")
            topics[name] = dict()
            count = 0
            for line in lines:
                wordstemp = line.lower().split(" ")
                words = []
                for phrase in wordstemp:
                    ws = re.split('(\W)', phrase)
                    for w in ws:
                        if w != '':
                            words.append(w)
                for word in words:
                    count += 1
                    totalcount += 1
                    topics[name][word] = topics[name].get(word, 0) + 1
                    vocab[word] = vocab.get(word, 0) + 1
            wcount[name] = count
    with open(manifest_data["general_corpus"], 'r') as f1:
        data = f1.read()
        for line in data.splitlines():
            words = line.split()
            for i in range(0, len(words), 2):
                vocab[words[i]] = vocab.get(words[i], 0) + 1
                totalcount += 1
        
    with open(manifest_data["conversation_lines"], 'r') as f2:
        data = f2.read()
        lines = data.splitlines()
        for i in range(0, len(lines), 2):
            wordstemp = re.split('[^a-zA-Z0-9_]', lines[i].lower())
            words = []
            for phrase in wordstemp:
                ws = re.split('(\W)', phrase)
                for w in ws:
                    if w != '':
                        words.append(w)
            respcode = re.split('[^a-zA-Z0-9_]', lines[i+1].lower())[0]
            ctopics[respcode] = dict()
            print(respcode)
            cwcount[respcode] = len(words)
            totalcount += len(words)
            ccount += len(words)
            for word in words:
                vocab[word] = vocab.get(word, 0) + 1
                cvocab[word] = cvocab.get(word, 0) + 1
                ctopics[respcode][word] = ctopics[respcode].get(word, 0) + 1
    
    for word in vocab:
        vocab[word] = vocab[word]/totalcount
    
    for word in cvocab:
        cvocab[word] = cvocab[word]/ccount
    
    with open(manifest_data["convmode_distribution"], 'w+', encoding="utf8") as f:
        f.write("commons")
        for word in cvocab:
            f.write(" ")
            f.write(word)
            f.write(" ")
            f.write(str(cvocab[word]))
        f.write("\n")
        for index, topic in enumerate(ctopics.keys()):
            psum = 0
            f.write(topic)
            for word in ctopics[topic]:
                adjp = (ctopics[topic][word]/float(cwcount[topic]))/cvocab[word]
                ctopics[topic][word] = adjp
                psum += adjp
            for word in ctopics[topic]:
                diffval = ctopics[topic][word]/psum
                ctopics[topic][word] = diffval
                f.write(" ")
                f.write(word)
                f.write(" ")
                f.write(str(diffval))
            if index < len(ctopics) - 1:
                f.write("\n")
    
    with open(manifest_data["topic_distribution"], 'w+', encoding="utf8") as f:
        f.write("commons")
        for word in vocab:
            f.write(" ")
            f.write(word)
            f.write(" ")
            f.write(str(vocab[word]))
        f.write("\n")
        for index, topic in enumerate(topics.keys()):
            psum = 0
            f.write(topic)
            for word in topics[topic]:
                adjp = (topics[topic][word]/float(wcount[topic]))/vocab[word]
                topics[topic][word] = adjp
                psum += adjp
            for word in topics[topic]:
                diffval = topics[topic][word]/psum
                topics[topic][word] = diffval
                f.write(" ")
                f.write(word)
                f.write(" ")
                f.write(str(diffval))
            if index < len(topics.keys()) - 1:
                f.write("\n")
            d = collections.Counter(topics[topic])
    

def main():
    global manifest_data
    # manifest_topics.json
    with open(sys.argv[1], 'r') as f:
      manifest_data = json.load(f)
    docs = []
    # module_list.txt
    with open(sys.argv[2], 'r') as f:
        modules = f.readlines()
        for module in modules:
            docs.append("./../modules/{}/topic.txt".format(module.strip()))
    topicwrite(docs)

if __name__ == "__main__":
    main()
