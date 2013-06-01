"""
VexFlow Build Script for Rondo

Based on:
VexFlow / TabDiv Build Script
Copyright Mohit Cheppudira 2010
"""

import os
import os.path
import re
from SCons.Script import *

DefaultEnvironment(
	tools = ['textfile']
)

default_env = Environment(
	tools = ['textfile'],
	NAME_SOURCES = False,
	ENV = os.environ
)

def symbols_builder(target, source, env):
	classes = []
	
	classname = r'(Vex(\.[A-Z][A-Za-z]*)+)'
	def_pattern = re.compile(r'\s*' + classname + '\s*=\s*function')
	proto_pattern = re.compile(r'\s*' + classname + '\.prototype(\.[a-zA-Z]+)+\s*=\s*function')
	
	target_path = str(target[0])
	output = open(target_path, 'w')
	
	for source_name in source:
		data = []
		defined = []
		protos = []
		
		input = open(str(source_name), 'r')
		
		for line in input:
			data.append(line)
			match = def_pattern.match(line)
			
			if match:
				name = match.group(1)
				
				if name not in defined and name not in classes:
					defined.append(name)
			
			match = proto_pattern.match(line)
			
			if match:
				name = match.group(1)
				
				if name not in protos:
					protos.append(name)
		
		input.close()
		
		if env['NAME_SOURCES']:
			output.write("\n/* Source file: " + str(source_name) + " */\n")
		
		for name in defined:
			if name in protos:
				classes.append(name)
				output.write("// @define " + name + "\n")
		
		output.writelines(data)
	
	output.close()

"""
Add our custom builders to the environment.
"""
default_env.Append(
	BUILDERS = {
		'Symbols': Builder(action = symbols_builder)
	}
)

def build_and_stamp(target, sources, env):
	return env.Symbols('vexflow-all.js', sources)

def mkdir_with_cleanup(dirname, env):
	"""
	Helper function to create directories and attach cleanup
	handlers. This is the only way to get implicitly created directories
	cleaned up.
	"""
	dir = env.subst(dirname)
	t = Command(dir, [], Mkdir("$TARGET"))
	Clean(t, dir) # Cleanup handler