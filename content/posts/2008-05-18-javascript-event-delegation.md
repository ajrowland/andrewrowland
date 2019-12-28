---
title: JavaScript event delegation
date: 2008-05-18
published: true
tags: ['JavaScript']
canonical_url: false
description: "As I've mentioned previously I'm creating a dashboard to represent the components in the exchange that I work for. Each component widget on the page has a number of events associated with it. This has become less manageable, the more I add. So I thought about using one delegate to handle all events, and pass on a component reference, and parameters to other functions."
---

A quick google led me to [this article](https://blog.danwebb.net/2008/2/8/event-delegation-made-easy-in-jquery) by [Dan Webb](https://blog.danwebb.net/). Looks like a common technique. Very useful article, though I needed to be able to pass parameters to the functions. There may be a better to way to do this, but this is how I achieved it.

Using jQuery (what else?!) the delegate method is called via an onClick event on the body of the document. In this case, it checks that the target of the event is a button. If any other element is clicked, nothing will happen.

Using jQuery (what else?!) the delegate method is called via an onClick event on the body of the document. In this case, it checks that the target of the event is a button. If any other element is clicked, nothing will happen.

    $(document).ready(function(){
        $('body').click(function(e){
            if (e.target.type == 'submit' || e.target.type == 'button'){
                var t = $(e.target);
                var fn = t.attr('class');
                var p = eval('(' + t.find('.params').html() + ')');

                window[fn].call(this, t, p);
            }
        });
    });

The function that the delegate passes the parameters to, is decided by the class name of the button. You could also use this class name to style the button in any manner you wish. The parameters to pass to this function are evaluated from JSON that is stored within hidden span class called params. Example button markup:

    <button class="changeLabel">
        <span class="params">
            {message:"Button pressed"}
        </span>
        <span class="label">
            Press me
        </span>
    </button>

I've surrounded the button label text within another span class called label. This enables me to change the label text without losing the parameters. Simple CSS is used to hide the parameter span tag:

    .params {
        display: none;
    }

The way I've stored the parameters may be a little odd, and I feel I may be missing something here. I construct my dashboard dynamically using jQuery, so all the parameters are injected into each control buttons at runtime. If anyone can point out an easier solution feel free to share. Full example:

    <html>
    <head>
        <title>Delegate example</title>
        <script type="text/javascript" src="/path/to/jquery.js"></script>
        <script type="text/javascript">
        $(document).ready(function(){
            $('body').click(function(e){
                if (e.target.type == 'submit' || e.target.type == 'button'){
                    var t = $(e.target);
                    var fn = t.attr('class');
                    var p = eval('(' + t.find('.params').html() + ')');
    
                    window[fn].call(this, t, p);
                }
            });
        });
    
        function changeLabel(obj, params){
            obj.find('.label').text(params.message);
        }
        </script>
        <style type="text/css">
        .params {
            display: none;
        }
        </style>
    </head>
    <body>
    
    <button class="changeLabel">
        <span class="params">
            {message:"Button pressed"}
        </span>
        <span class="label">
            Press me
        </span>
    </button>
    
    </body>
    </html>
