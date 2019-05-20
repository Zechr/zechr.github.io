import json

with open("module_list.txt", "r") as file:
    responses = {}
    modules = file.readlines()
    for module in modules:
        with open("modules/{}/responses.json".format(module.strip()), "r") as response_file:
            module_responses = json.load(response_file)
            responses.update(module_responses)
    with open("data/responses.json", "w+") as all_responses:
        json.dump(responses, all_responses, indent=4)
