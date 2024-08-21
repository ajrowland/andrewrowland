---
title: TypeScript Sublime Text integration
date: 2012-10-08
published: true
tags: ["JavaScript"]
canonical_url: false
description: "Something interesting has happened in the world of JavaScript development. Of all people, the folk at Microsoft have developed TypeScript."
---

Something interesting has happened in the world of JavaScript development. Of all people, the folk at Microsoft have developed TypeScript. If you’re in to such things, I don’t need to explain further. There is a Visual Studio 2012 plugin, but these days I’ve fallen in love with Sublime Text. Here’s a quick howto on TypeScript development with Sublime Text, specifically on Windows 7.

First install theNode.jsmsi package. Once installed, open a command prompt and type the following to install the TypeScript compiler:

    npm install -g typescript

Now grab the Sublime Text syntax hightlight definition file from MSDN. Open the zip and copy the _typescript.tmplanguage_ file to your Sublime Text user packages directory. Mine is located in:

```
C:\Users\arowland\AppData\Roaming\Sublime Text 2\Packages\User\
```

Now open Sublime Text. Select **Tools -> Build System -> New Build System**. Paste in the following:

```json
{
  "selector": "source.ts",
  "cmd": ["tsc.cmd", "$file"],
  "file_regex": "^(.+?) \\((\\d+),(\\d+)\\): (.+)$"
}
```

Save this file. Now you can create a new JavaScript file, and save with the .ts extension. The editor will highlight TypeScript code, and allow you to compile to JavaScript by pressing **Ctrl+B**. The build process will create the compiled JavaScript file in the same directory as the source TypeScript.

## 9 thoughts on "TypeScript Sublime Text integration"

### Ryan Montgomery

_October 10, 2012 at 3:49 pm_

If you installed typescript via npm then this will work on mac osx.

```json
{
  "selector": "source.ts",
  "cmd": ["tsc", "$file"],
  "path": "/usr/local/bin",
  "file_regex": "^(.+?) \\((\\d+),(\\d+)\\): (.+)$"
}
```

---

### Nigel Ainscoe

_October 10, 2012 at 8:18 pm_

Thanks for this, I had to ditch the .cmd in line 3 of the build system so it reads:

```json
"cmd": ["tsc", "$file"],
```

But being my first time adding to my Sublime2 installation, it was infinitely better than no instructions and I now have beautifully highlighted typescript 🙂

---

### Andy R

_October 10, 2012 at 9:46 pm_

Hi Nigel. That’s what I had initially but had to alter it to get it to build. I’m just glad you’ve got it working.

---

### Simo Endre

_October 11, 2012 at 7:30 am_

This is a great future to have on Sublime Text editor, only the auto-completion is missing completely, which pretty shame. To automatize even more the ts=>js process you can install a little build package. I’ve explained here: http://stackoverflow.com/questions/12799237/how-to-watch-and-compile-all-typescript-sources/12800090#12800090

---

### Larry

_October 11, 2012 at 4:03 pm_

The build script is working (Windows), but I’m not seeing any output in the build results when the compilation fails. Any idea why?

---

### Eran Medan

_November 17, 2012 at 3:11 am_

I’ve created a small package that includes the build system + the syntax highlighter
Would you please review this: https://github.com/eranation/sublime-text-2-typescript
Hope I did it right... feel free to modify

---

### Adongo

_June 6, 2016 at 10:33 pm_

```json
{
  "cmd": ["tsc", "$file"],
  "file_regex": "(.*\\.ts?)\\s\\(([0-9]+)\\,([0-9]+)\\)\\:\\s(…*?)$",
  "selector": "source.ts",
  "windows": {
    "cmd": ["tsc.cmd", "$file"]
  }
}
```

---

### Adongo

_June 6, 2016 at 10:34 pm_

This worked for me perfectly

---

### Romes

_October 25, 2017 at 6:03 pm_

Tanks my friend !

---
