#!bin/bash
python topicmodel.py manifest_topics.json ../module_list.txt
python poslabels.py manifest_labels.json
python compile_responses.py ../module_list.txt
python compile_commands.py ../module_list.txt