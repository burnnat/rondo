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

DefaultEnvironment()

default_env = Environment(
  ENV = os.environ
)

def symbols_builder(target, source, env):
  classes = []
  
  js = source.pop()
  
  classname = r'(Vex(\.[A-Z][A-Za-z]*)+)'
  def_pattern = re.compile(r'\s*' + classname + '\s*=\s*function')
  proto_pattern = re.compile(r'\s*' + classname + '\.prototype(\.[a-zA-Z]+)+\s*=\s*function')
  
  for source_name in source:
    defined = []
    protos = []
    
    input = open(str(source_name), 'r')
    
    for line in input:
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
    
    for name in defined:
      if name in protos:
        classes.append(name)
  
  target_path = str(target[0])
  
  output = open(target_path, 'w')
  output.write("// @require " + os.path.relpath(str(js), os.path.dirname(target_path)) + "\n")
  
  for name in classes:
    output.write("// @define " + name + "\n")
  
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
  js = env.Substfile(target, sources)
  
  sources.append(js)
  
  symbols = env.Symbols('symbols.js', sources)
  
  return [symbols, js]

def mkdir_with_cleanup(dirname, env):
  """
  Helper function to create directories and attach cleanup
  handlers. This is the only way to get implicitly created directories
  cleaned up.
  """
  dir = env.subst(dirname)
  t = Command(dir, [], Mkdir("$TARGET"))
  Clean(t, dir) # Cleanup handler

def cpdir_with_cleanup(targetdirname, srcdirname, env):
  """
  Helper function to copy directories and attach cleanup
  handlers. This is the only way to get implicitly created directories
  cleaned up.
  """
  targetdir = env.subst(targetdirname)
  srcdir = env.subst(srcdirname)
  t = Command(targetdir, srcdir, Copy("$TARGET", "$SOURCE"))
  Clean(t, targetdir)
