---
title: jQuery UI Date Picker control issue with .Net
date: 2008-06-11
published: true
tags: ['DotNet', 'JavaScript']
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

## 24 thoughts on “jQuery UI Date Picker control issue with .Net”

### pawan Kumar
*August 12, 2008 at 5:34 pm*

Thanks Andrew, your code snipped helped me alot. I was heading nowhere but you really solved the problem..thanks again..:)

---

### Ali from Istanbul
*October 26, 2008 at 4:11 pm*

Thanks for the solution. You saved my night.

---

### Robin
*November 26, 2008 at 6:52 am*

This issue was a real deal breaker for my project, thanks for this you are my Batman.

---

### Anil Chitatil
*June 3, 2009 at 4:14 pm*

wow fine and Nice article, You help me alot. Thanx for this article

---

### Nalin D.Jayasuriya
*June 24, 2009 at 5:19 pm*

In version 1.7.2 of Datepicker, the text to search and replace is different:

The new text to search for is:

    inst.input.trigger(“change”)

Thanks for your solution!

---

### Andy
*June 24, 2009 at 6:29 pm*

I’ve updated the article. Thanks for taking the time to let me know.

---

### Achutha Krishnan
*July 2, 2009 at 7:47 am*

Thanks buddy, it was really a good solution. But what is the cause of the error? I used it and got this error only on a particular scenario. If you are familiar with ASP.NET, I got this error while using RequiredFieldValidator control. When I modified the script, it didn’t appear again?

---

### Andy
*July 2, 2009 at 7:56 am*

Indeed the error ocurred when I used the RequiredFieldValidator control as well. I can’t remember why though, as it was some time ago.

I’m a fairly pragamatic developer, and so I don’t worry about these things once it’s fixed!

---

### Praveen Battula
*September 16, 2009 at 7:01 am*

See solution for it here.
http://praveenbattula.blogspot.com/2009/09/jquery-datepicker-problem-on-date.html

---

### Praveen Battula
*September 16, 2009 at 7:02 am*

I mean instead of changing the code of the JQuery javascript file, you can override it in your code in my solution.

---

### jrummell
*November 11, 2009 at 6:15 pm*

What if you have TextChanged event on the TextBox and need it fire when the date is selected? Disabling .change() for IE means that the postback won’t happen and the TextChanged handler won’t execute.

---

### Euan Ritchie
*December 30, 2009 at 8:43 am*

This problem is caused by jQuery raising a Change event on the Input control that is handled by the ASP Net Validation WebResource client code, in which the event object supplies the Datepickers ‘Done’ button as the srcElement.

This causes the ASP Net function ValidatorOnChange (when in IE) to mis-identify the element on which the Change event is raised and creates a null reference error due to it not gracefully handling a failure to connect the Datepickers ‘Done’ button to any Validator.

My solution to this is to store a reference to the ValidatorOnChange function, override it with an empty function then bind the input controls onchange event to a call to the stored reference.

This removes the error, completes the onchange event (thus allowing the validators to perform their function), and permits the asp net webresource code to be changed in framework updates without breaking applications (I’m hoping).

It should also be applicable to all plugins that experience similar issues, and not just DatePicker.

This is an example of my method:

    // Execute on Document ready…
    $(function() {

        // Correct for IE problem with ASP Net Validators
        // Store reference to function with problem, and over-ride it with an empty function
        WebResource_ValidatorOnChange = ValidatorOnChange;
        ValidatorOnChange = function(event) { }

        // Initialise date and time picker
        $(‘#<%= Control.ClientID %>‘).datepicker({
            configuration:options
        });

        // Bind call to Validation code to change event of Control
        $(‘#<%= Control.ClientID %>‘).bind(“change”, function(event) {
            WebResource_ValidatorOnChange(event);
        });

    });

---

### Euan Ritchie
*December 30, 2009 at 8:45 am*

I ought point out that my solution obviously requires one to bind every control on the page that needs the onchange event for it’s validators.

It also seems unneccesary if you can use the empty onselect function that is a suggested solution.

But it turns out that if you use a CustomValidator that uses a server side handler for validation that the onselect function method fails, which is why I use my slightly convuluted technique to provide client side validation in concert with jquery hi datepicker.

---

### Muhammad Usman
*January 28, 2010 at 4:16 am*

Great work sir.

---

### Zack L
*January 28, 2010 at 4:17 am*

Trouble I have with this solution is that I’m using the Google CDN to deliver the jQuery js files to the client so I don’t have the option of modifying the file. The only solution was to get rid of the RequiredFieldValidator and stick with the CustomValidator I’m using to validate the date on the server side.

---

### Nitin
*April 10, 2010 at 4:11 am*

We can also work around this by setting client script to false for the validation control.

---

### Praveen Battula
*April 10, 2010 at 4:11 am*

If the issue is because of the validator then here is the solution for it.
http://praveenbattula.blogspot.com/2009/09/jquery-datepicker-problem-on-date.html

---

### Kathy Wu
*July 21, 2010 at 5:41 pm*

Thanks a lot, it resolved my error.

---

### sandeep
*January 3, 2011 at 1:00 pm*

Thank You very much Andrew

---

### Anonymous
*May 31, 2011 at 10:06 am*

Thanks It really helpful buddy, Saved my lot of time of debugging.

---

### Mubeen
*August 3, 2011 at 6:05 pm*

Andrew you saved me a lot of grief!

---

### Gangireddy Sathi
*August 18, 2011 at 11:57 pm*

Thank you Andrew…

---

### Hollman Ladino Paredes
*February 7, 2013 at 4:13 pm*

Hola Andrew.

Tu solucion me di luz al final del camino. El cambio lo hice en el fuente jquery-ui-timepicker-addon.js linea (815), reemplac `this.$input.trigger(“change”);` por `if (!$.browser.msie) { this.$input.trigger(“change”); }`

Muchas gracias por tu aporte y muchos xitos.

---

### Andy R
*February 7, 2013 at 4:32 pm*

No hay problema, mi amigo!

---