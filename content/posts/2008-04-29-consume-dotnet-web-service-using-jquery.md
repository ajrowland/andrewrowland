---
title: Consume .Net Web service using jQuery
date: 2008-04-29
published: true
tags: ['.Net', 'JavaScript']
canonical_url: false
description: "The JavaScript functionality that is injected into .Net pages seems limited when compared to jQuery.

Whilst looking for a way to use jQuery instead of the stock Microsoft client library, I came across an excellent article."
---

The JavaScript functionality that is injected into .Net pages seems limited when compared to jQuery.

Whilst looking for a way to use jQuery instead of the stock Microsoft client library, I came across this [excellent article](http://encosia.com/2008/03/27/using-jquery-to-consume-aspnet-json-web-services/).

There doesn 't seem to be too much on Web about this subject. Maybe most .Net developers stick to Microsoft tools, but I like using jQuery for all my client scripting, and would rather not use more than one library. So as it look me a while to get example code working, I 've included my efforts.

Below is a simple .Net Web service. Once again, I 've used continents and countries as my simple dataset. Pass a continent to the service, and it will return an array of countries.

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

Note the response format, which is JSON. Originally, I omitted this, and serialized the data as a JSON string using the .Net JavaScriptSerializer class, before returning it.

This resulted in the client having to evaluate the returned string to build an array. By returning an array, the JSON object is instantly available in our client code, without any jiggery-pokery.

To enable the client to call the Web service, I had to add following in my web.config file under the system.web section:

    <webServices>
        <protocols>
            <add name="HttpPost"/>
        </protocols>
    </webServices>

Sample client code that calls the .Net Web service:

    <html>
    <head>
        <title>World example</title>
        <script type="text/javascript" src="/path/to/jquery.js"></script>
        <script type="text/javascript">
        $(document).ready(function() {
            $('#submit').click(function() {
                $.ajax({
                    type: "POST",
                    data: '{continent: "' + $('#txtContinent').val() + '"}',
                    url: "/services/example.asmx/GetCountries",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function(response) {
                        var data = (typeof response.d) == 'string' ? eval('(' + response.d + ')') : response.d;
    
                        $('#result').empty().append('<table border=1><thead><tr></tr></thead><tbody></tbody></table>');
    
                        $('<th/>').text($('#txtContinent').val()).appendTo('#result thead tr');
    
                        for (var i = 0; i < data.length; i ++) {
                            $('<tr/>').append($('<td/>').text(data[i])).appendTo('#result tbody');
                        }
                    },
                    failure: function(msg) {
                        $('#result').empty().append(msg);
                    }
                });
            });	
        });
        </script>
    </head>
    <body>
    
    <p><label for="txtContinent">Continent</label><br />
    <input type="text" id="txtContinent" /> <input id="submit" type="button" value="Submit" /></p>
    
    <div id="result"></div>
    
    </body>
    </html>

Note line 15:

    var data = (typeof response) == 'string' ? eval('(' + response + ')') : response;

I added this line so that the data object is correctly evaluated if a serialized JSON string is returned.

There you have it, avoid the Microsoft code bloat, with not a ScriptManager tag in sight.