---
title: Consume .Net Web service using jQuery
date: 2008-04-29
published: true
tags: ['DotNet', 'JavaScript']
canonical_url: false
description: "The JavaScript functionality that is injected into .Net pages seems limited when compared to jQuery.

Whilst looking for a way to use jQuery instead of the stock Microsoft client library, I came across an excellent article."
---

The JavaScript functionality that is injected into .Net pages seems limited when compared to jQuery.

Whilst looking for a way to use jQuery instead of the stock Microsoft client library, I came across this [excellent article](http://encosia.com/2008/03/27/using-jquery-to-consume-aspnet-json-web-services/).

There doesn 't seem to be too much on Web about this subject. Maybe most .Net developers stick to Microsoft tools, but I like using jQuery for all my client scripting, and would rather not use more than one library. So as it look me a while to get example code working, I 've included my efforts.

Below is a simple .Net Web service. Once again, I 've used continents and countries as my simple dataset. Pass a continent to the service, and it will return an array of countries.

```csharp
<%@ webservice Language="C#" class="AndrewRowland.Continents" %>

using System;
using System.Web.Script.Services;
using System.Web.Services;
using System.Collections;
using System.Collections.Specialized;

namespace AndrewRowland
{
    [ScriptService]
    [WebService(Namespace = "AndrewRowland")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    public class Continents
    {
        [WebMethod(Description="Returns array of countries for a given continent.")]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public string[] GetCountries(string continent)
        {
            Hashtable ht = new Hashtable();

            ht.Add("Europe", new string[] {"UK", "France", "Germany"});
            ht.Add("Africa", new string[] {"South Africa", "Zimbabwe", "Cameroon"});
            ht.Add("North America", new string[] {"USA", "Canada"});

            return (string[]) ht[continent];
        }
    }
}
```

Note the response format, which is JSON. Originally, I omitted this, and serialized the data as a JSON string using the .Net JavaScriptSerializer class, before returning it.

This resulted in the client having to evaluate the returned string to build an array. By returning an array, the JSON object is instantly available in our client code, without any jiggery-pokery.

To enable the client to call the Web service, I had to add following in my web.config file under the system.web section:

```xml
<webServices>
    <protocols>
        <add name="HttpPost"/>
    </protocols>
</webServices>
```

Sample client code that calls the .Net Web service:

```html
<html>
  <head>
    <title>World example</title>
    <script type="text/javascript" src="/path/to/jquery.js"></script>
    <script type="text/javascript">
      $(document).ready(function() {
        $("#submit").click(function() {
          $.ajax({
            type: "POST",
            data: '{continent: "' + $("#txtContinent").val() + '"}',
            url: "/services/example.asmx/GetCountries",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(response) {
              var data =
                typeof response.d == "string"
                  ? eval("(" + response.d + ")")
                  : response.d;

              $("#result")
                .empty()
                .append(
                  "<table border=1><thead><tr></tr></thead><tbody></tbody></table>"
                );

              $("<th/>")
                .text($("#txtContinent").val())
                .appendTo("#result thead tr");

              for (var i = 0; i < data.length; i++) {
                $("<tr/>")
                  .append($("<td/>").text(data[i]))
                  .appendTo("#result tbody");
              }
            },
            failure: function(msg) {
              $("#result")
                .empty()
                .append(msg);
            },
          });
        });
      });
    </script>
  </head>
  <body>
    <p>
      <label for="txtContinent">Continent</label><br />
      <input type="text" id="txtContinent" />
      <input id="submit" type="button" value="Submit" />
    </p>

    <div id="result"></div>
  </body>
</html>
```

Note line 15:

```javascript
var data = typeof response == "string" ? eval("(" + response + ")") : response;
```

I added this line so that the data object is correctly evaluated if a serialized JSON string is returned.

There you have it, avoid the Microsoft code bloat, with not a ScriptManager tag in sight.

## 25 thoughts on “Consume .Net Web service using jQuery”

### Andy

_August 12, 2008 at 5:34 pm_

If you look at line 10 in the HTML example above, the data key of the AJAX request contains a serialised JSON object. I've manually serialised the parameters to be sent to the Web service. If your object is more complex, use a JSON stringifier.

The example Web service I've provided takes this very simple JSON object to obtain the parameter continent. It then returns a list of countries.

Hope this helps.

---

### Andy

_August 12, 2008 at 5:34 pm_

Indeed, and it appears many people are heading in this direction. Thanks very much for posting the first comment.

---

### Govind

_August 12, 2008 at 5:34 pm_

+1. Beautiful, I too love jquery and moved away from the scriptmanager/updatepanel/proxy stuff. It was way too clunky.

---

### zbrong

_August 12, 2008 at 5:34 pm_

good article, thanks

would you show us how to post a json object to web service and how the service consume the json object, best is sample

thanks

---

### david

_September 11, 2008 at 7:01 am_

Hello,

I am using .net 2.0 with c# and I am stuggling to get any of these exemples working. Could you please send a .net zipped up proj or solutio please

---

### paul

_September 15, 2008 at 9:46 am_

I'm also using .net 2 with C# and would appreciate the revised solution. Thanks in advance.

---

### Andy

_September 15, 2008 at 9:46 am_

Seems to be a fair amount of interest in this post. As you can see, I'm stuggling to find the time to update this blog more regularly.

I'll try to come up with a basic site, and post it here some time this week. I don't use Visual Studio, so I can't create a project.

Thanks gents.

---

### Andy

_September 26, 2008 at 8:46 pm_

Sorry for the delay. I installed Visual Studio 2008 Express, and created this project.

Hope this helps.

---

### Fawad Hassan

_March 14, 2009 at 3:27 pm_

nice article!

thanks

Now I shall try it myself...

---

### Yoav

_August 20, 2009 at 4:13 pm_

Hi there,

if you're interested in creating a more object oriented proxy for a webservice using jQuery check out my article on:

http://yoavniran.wordpress.com/2009/08/02/creating-a-webservice-proxy-with-jquery/

---

### Andy

_August 20, 2009 at 4:17 pm_

Good stuff Yoav. I'm sure your article will be useful to others as well.

---

### DaCoder

_November 2, 2009 at 4:32 pm_

HI

I am trying to use FullCalendar to display events but I am having trouble trying to get the right json array returned.

Heres my server side code

```csharp
public string[][] GetEventsForDate(string currentDate)
{
    Hashtable ht = new Hashtable();

    string[][] jaggedArray1 =
    {
        new string[] {“1″,”Meeting One”,”2009-10-30T08:15:00.000+10:00″,”2009-10-30T10:15:00.000+10:00″},
        new string[] {“2″,”Meeting Two”,”2009-10-30T12:15:00.000+10:00″,”2009-10-30T13:15:00.000+10:00″},
        new string[] {“3″,”Meeting Three”,”2009-10-30T02:15:00.000+10:00″,”2009-10-30T03:15:00.000+10:00″}
    };

    return jaggedArray1;
}
```

Any ideas?

---

### DaCoder

_November 4, 2009 at 4:17 am_

Hi

I was able to figure out a way to integrate the FullCalendar with ASP.Net, heres the link to a write up I did

http://www.101webdesigns.com/index.php/2009/11/03/jquery-calendar-in-asp-net/

Hope someone finds it useful

---

### Kenny Evitt

_May 14, 2010 at 4:51 am_

Excellent example!

---

### Prabu

_May 14, 2010 at 4:51 am_

Hi.

I am wondering if this works from a static html page outside of the webservice project?

---

### Rupesh

_May 14, 2010 at 4:56 am_

Hi am using Webservice as a different project and when i add a webreference of this in my project. then jquery call does not works. if the asmx file is in the same webapplication project then it works fine. Is there any way to cosume the webservice's webmethod by puting the web reference of weservice.

---

### Andy

_May 14, 2010 at 4:57 am_

No reason why not. In your AJAX call, you will have to use the full URL if the service is running on different domain. Other than that consideration, it should not be a problem.

---

### Jake

_July 21, 2010 at 5:41 pm_

Here is an example of how to get FullCalendar working in VB.NET using a webservice. http://jake1164.blogspot.com/2010/06/jquery-fullcalendar-and-aspnet.html

---

### Michael Mofokeng

_September 2, 2010 at 8:19 am_

Hi There. I've re-created the example as a project but its not working from my side. It'is doesn't return a success or failed message either.

---

### Mickey

_January 3, 2011 at 1:00 pm_

I have a simple example of how I call a webservice using jquery on my tumblr blog. http://mickeyelliott.tumblr.com/post/1581098755/using-jquery-to-call-a-webservice

---

### Bhargav

_February 8, 2011 at 10:28 am_

Really Grt article, helped me a lot. Thank you very much.

---

### vani

_April 2, 2011 at 12:03 pm_

nice

---

### Nidhi

_April 19, 2011 at 7:18 pm_

Is it possible to retrieve the user's identity (authentication) in the web method?

I'm also wondering if user roles can be checked in web methods. If someone has some info or links, please share

---

### Rajesh143

_September 6, 2011 at 1:11 pm_

Hi Andy , nice post it helped me.

I created a static HTML page and dumped the html code above in that and my web service works fine, But im facing a problem in the response part i.e in the success
method the response is `NULL`.

Can you please address my problem ASAP.

---

### ad guru

_March 13, 2012 at 12:43 am_

Great help. Thank you.

---
