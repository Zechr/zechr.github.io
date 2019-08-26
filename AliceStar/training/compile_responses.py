import json
import sys

# sys.argv[1] = module_list.txt path
with open(sys.argv[1], "r") as file:
    responses = {}
    modules = file.readlines()
    for module in modules:
        with open("../modules/{}/responses.json".format(module.strip()), "r") as response_file:
            module_responses = json.load(response_file)
            responses.update(module_responses)
    with open("../data/responses.json", "w+") as all_responses:
        json.dump(responses, all_responses, indent=4)
