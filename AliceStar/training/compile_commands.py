import json
import sys

# sys.argv[1] = module_list.txt path
with open(sys.argv[1], "r") as file:
    command_list = []
    modules = file.readlines()
    for module in modules:
        with open("../modules/{}/commands.txt".format(module.strip()), "r") as command_file:
            module_commands = [line.rstrip() for line in command_file.readlines()]
            command_list.extend(module_commands)
    # Conversation mode is a default
    command_list.append("conv hi how are you")
    command_list.append("conv UH WRB VBZ PRP NN")
    with open("../data/commands.txt", "w+") as all_commands:
        for index, line in enumerate(command_list):
            if index < len(command_list) - 1:
                all_commands.write("{}\n".format(line))
            else:
                all_commands.write(line)
