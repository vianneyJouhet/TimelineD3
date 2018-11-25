# TimelineD3
TimelineD3-i2b2plugin

This project is a D3.js based Timeline plugin for visualizing patient data within the i2b2 webclient.

# Installation

Please visit https://community.i2b2.org/wiki/display/webclient/Web+Client+Plug-in+Developers+Guide for more information about i2b2 webclient plugins deployments

Create a “chubdx” directory in the plugin directory
```bash
webclient/js-i2b2/cells/plugins.
```

Clone the repository inside the chubdx directory

Update the i2b2_loader.js in the js-i2b2 directory. Add the following part (in order to add the plugin to i2b2) :
```json
{ code:    "TimelineD3",
    forceLoading: true,
    forceConfigMsg: { params: [] },
    roles: [ "DATA_LDS", "DATA_DEID", "DATA_PROT" ],
    forceDir: "cells/plugins/chubdx" 
},
```

# It should work !
