---
title: Create Episerver Find index using Puppeteer
date: 2018-02-18
published: true
tags: ['JavaScript','Node']
canonical_url: false
description: "Currently working with many clients who utilise Episerver CMS to managed their content. Almost all of then use Episerver Find to index content."
---

Currently working with many clients who utilise Episerver CMS to managed their content. Almost all of then use [Episerver Find](https://find.episerver.com/) to index content.

Episerver do not provide an API to automate the creation of new indices. As I was messing around with [Puppeteer](https://github.com/puppeteer/puppeteer) and headless Chrome, I thought I’d knock up a tool to do this. You can find the code in my [Github repo](https://github.com/ajrowland/create-episerver-find-index).

Using your favourite shell, clone the repo:

    git clone https://github.com/ajrowland/create-episerver-find-index.git
    cd create-episerver-find-index

Install dependencies:

    npm install

You’ll need to create a [developer account for Find](https://find.episerver.com/Account/Register). Once this is done, you can create an index with the following:

    node createindex.js --username [username] --password [password] --indexname [indexname]

The script returns the configuration for the newly created index, or an existing index if it already exists.

Ultimately I hope to use something like this within a continuous integration, or deployment pipeline, to make certain a valid index is available for the application.

Hope this helps someone.