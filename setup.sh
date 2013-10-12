#!/bin/bash

mkdir -p bundle/

if which scons
then
	echo "SCons is already installed"
else
	echo "Installing SCons..."
	
	# Download and Install SCons
	curl -o bundle/scons.tar.gz -L http://sourceforge.net/projects/scons/files/scons/2.3.0/scons-2.3.0.tar.gz/download
	tar -xf bundle/scons.tar.gz -C bundle/
	python bundle/scons-2.3.0/setup.py install
	rm -rf bundle/scons-2.3.0
fi

if which sencha
then
	echo "Sencha Cmd is already installed"
else
	echo "Installing Sencha Cmd..."
	
	if [ $1 ]
	then
		# Travis Setup
		mode=unattended
	else
		# User Setup
		mode=text
	fi
	
	# Download and Install Sencha Cmd
	curl -o bundle/sencha-cmd.run.zip http://cdn.sencha.com/cmd/4.0.0.203/SenchaCmd-4.0.0.203-linux-x64.run.zip
	unzip -p bundle/sencha-cmd.run.zip > bundle/sencha-cmd.run
	rm bundle/sencha-cmd.run.zip
	
	chmod +x bundle/sencha-cmd.run
	bundle/sencha-cmd.run --mode $mode --prefix bundle
	rm bundle/sencha-cmd.run
fi

echo "Initializing Vexflow sources..."

# Install Vexflow Repo
git clone git://github.com/burnnat/vexflow.git bundle/vexflow
