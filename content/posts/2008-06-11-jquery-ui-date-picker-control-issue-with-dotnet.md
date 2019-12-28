---
title: jQuery UI Date Picker control issue with .Net
date: 2008-06-11
published: true
tags: ['.Net', 'JavaScript']
canonical_url: false
description: "Aye, I do whitter on about jQuery. It's ace. The newly released jQuery UI is pretty special too. One of the many great widgets is the Date Picker control."
---

Aye, I do whitter on about [jQuery](https://jquery.com/). It's ace. The newly released [jQuery UI](https://jqueryui.com/) is pretty special too. One of the many great widgets is the Date Picker control.

I build many .net applications that require date entry, so I implement the Date Picker control often. Unfortunately, there is a problem when it is used on a field that is validated using a .Net validation control. Upon clicking on a date, I get the following error:

    length is null or not an object

This only occurs when using Internet Explorer. Currently, my only solution is to edit the source code. Locate the following code in **jquery-ui.js** or **ui.datepicker.js**:

    inst.input.trigger('change')

Replace it with:

    if (!$.browser.msie){inst.input.trigger('change')}

This prevents the change event firing in IE.

I wouldn't normally advocate changing source code in this manner, as it makes future upgrades tedious. Hopefully it will be addressed in a future release.