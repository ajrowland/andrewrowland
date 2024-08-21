---
title: W3C validation of ASP.Net output
date: 2009-07-25
published: true
tags: ['DotNet']
canonical_url: false
description: "A while ago I had to make certain that a CMS driven site built in .Net met some validation criteria. Specifically the XHTML markup. Running it by the W3C validator service, the markup always failed."
---

A while ago I had to make certain that a CMS driven site built in .Net met some validation criteria. Specifically the XHTML markup. Running it by the [W3C validator service](https://validator.w3.org/), the markup always failed.

I fixed the obvious within the **web.config**. For example, the following is needed to force the application to render XHTML:

```xml
<configuration>
    ...
    <system.web>
        ...
        <xhtmlConformance mode="Strict" />
        ...
    </system.web>
    ...
</configuration>
```

If I painfully cut and pasted the HTML into the Validatorâ€™s form field, it passed. The problem is, is that the service is not recognised by the Web server, and so a helper file in the application is required.

In your web root, create a App_Browsers directory. Within this directory create a file called w3c.browser. Paste the following contents into the file:

```xml
<browsers>
    <browser id="W3C_Validator" parentID="default">
        <identification>
            <userAgent match="^W3C_Validator" />
        </identification>
        <capabilities>
            <capability name="browser" value="W3C Validator" />
            <capability name="ecmaScriptVersion" value="1.2" />
            <capability name="javascript" value="true" />
            <capability name="supportsCss" value="true" />
            <capability name="tables" value="true" />
            <capability name="tagWriter" value="System.Web.UI.HtmlTextWriter" />
            <capability name="w3cdomversion" value="1.0" />
        </capabilities>
    </browser>
</browsers>
```

You should now be able to pass the page by URL:

http://validator.w3.org/check?uri=http%3A%2F%2Fwww.andrewrowland.com
