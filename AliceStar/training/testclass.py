from __future__ import division
import re
a = dict()
"""with open('anime-dist.txt', 'r') as f:
  data = f.readlines()
  for line in data:
    features = line.split(' ')
    a[features[0]] = dict()
    for i in xrange(1, len(features), 2):
      a[features[0]][features[i]] = float(features[i + 1])

with open('yugioh-dist.txt', 'r') as f:
  data = f.readlines()
  for line in data:
    features = line.split(' ')
    a[features[0]] = dict()
    for i in xrange(1, len(features), 2):
      a[features[0]][features[i]] = float(features[i + 1])

with open('commons-dist.txt', 'r') as f:
  data = f.readlines()
  for line in data:
    features = line.split(' ')
    a[features[0]] = dict()
    for i in xrange(1, len(features), 2):
      a[features[0]][features[i]] = float(features[i + 1])"""

with open('topics.txt', 'r') as f:
  data = f.readlines()
  for line in data:
    features = line.split(' ')
    a[features[0]] = dict()
    for i in xrange(1, len(features), 2):
      a[features[0]][features[i]] = float(features[i + 1])

def classify(words):
  yp = 0
  ap = 0
  sdist = dict()
  for word in words:
    sdist[word] = sdist.get(word, 0) + 1
  psum = 0
  for word in sdist:
    sdist[word] = (sdist[word]/len(words))/a["commons"].get(word, 0.0001)
    psum += sdist[word]
  for word in sdist:
    sdist[word] = sdist[word]/psum
    print word
    ypadj = abs(a["yugioh"].get(word, a["commons"].get(word, 0.0001)) - sdist[word])
    apadj = abs(a["anime"].get(word, a["commons"].get(word, 0.0001)) - sdist[word])
    print "y: " + str(a["yugioh"].get(word, a["commons"].get(word, 0.0001)))
    print ypadj
    print "a: " + str(a["anime"].get(word, a["commons"].get(word, 0.0001)))
    print apadj
    yp += ypadj
    ap += apadj
  """for word in a["yugioh"]:
    yp += abs(a["yugioh"][word] - sdist.get(word, 0))
  for word in a["anime"]:
    ap += abs(a["anime"][word] - sdist.get(word, 0))"""
  if yp >= ap:
    print "Anime"
  else:
    print "Yugioh"

def main():
  while True:
    x = raw_input("Sentence: ")
    classify(re.split('[^a-zA-Z]', x.lower()))

if __name__ == "__main__":
  main()