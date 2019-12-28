---
title: TypeScript Sublime Text integration
date: 2012-10-08
published: true
tags: ['JavaScript']
canonical_url: false
description: "Something interesting has happened in the world of JavaScript development. Of all people, the folk at Microsoft have developed TypeScript."
---

Something interesting has happened in the world of JavaScript development. Of all people, the folk at Microsoft have developed TypeScript. If you’re in to such things, I don’t need to explain further. There is a Visual Studio 2012 plugin, but these days I’ve fallen in love with Sublime Text. Here’s a quick howto on TypeScript development with Sublime Text, specifically on Windows 7.

First install theNode.jsmsi package. Once installed, open a command prompt and type the following to install the TypeScript compiler:

    npm install -g typescript

Now grab the Sublime Text syntax hightlight definition file from MSDN. Open the zip and copy the *typescript.tmplanguage* file to your Sublime Text user packages directory. Mine is located in:

    C:\Users\arowland\AppData\Roaming\Sublime Text 2\Packages\User\

Now open Sublime Text. Select **Tools -> Build System -> New Build System**. Paste in the following:

    {
        "selector": "source.ts",
        "cmd": ["tsc.cmd", "$file"],
        "file_regex": "^(.+?) \\((\\d+),(\\d+)\\): (.+)$"
    }

Save this file. Now you can create a new JavaScript file, and save with the .ts extension. The editor will highlight TypeScript code, and allow you to compile to JavaScript by pressing **Ctrl+B**. The build process will create the compiled JavaScript file in the same directory as the source TypeScript.