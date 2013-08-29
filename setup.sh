#!/bin/bash

# Install Vexflow Repo
git clone git://github.com/burnnat/vexflow.git bundle/vexflow

# Download Sencha Cmd Installer
curl -o bundle/sencha-cmd.run.zip http://cdn.sencha.com/cmd/3.1.2.342/SenchaCmd-3.1.2.342-linux-x64.run.zip
unzip -p bundle/sencha-cmd.run.zip > bundle/sencha-cmd.run
chmod +x bundle/sencha-cmd.run

if [ $1 ]
then
	mode=unattended
else
	mode=text
fi

# Install Sencha Cmd
bundle/sencha-cmd.run --mode $mode --prefix bundle