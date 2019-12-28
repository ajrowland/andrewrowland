---
title: Validation groups in .Net
date: 2008-08-24
published: true
tags: ['.Net']
canonical_url: false
description: "Evening all. Not posted in a while as I've plenty going on in the 'real' world. Anyway, last week I was building a search form whereby you could either search by reference code, or by using full search criteria."
---

Evening all. Not posted in a while as I've plenty going on in the 'real' world. Anyway, last week I was building a search form whereby you could either search by reference code, or by using full search criteria.

The problem I had is that both search 'forms' existed on one Web Form, and I was using Validation controls to check each. So when using either submit button, both search groups were validated together. Not useful when I wanted to submit each set of controls independently of each other. So there I was, coding to disable either set of validation controls when a submit button is clicked.

Validation groups I hear you cry. Yes, I know that now.

Add the ValidationGroup attribute to all controls, so you can group them together, and submit them separately from other groups. Example:

    <form id="form1" runat="server">
    
    <p>
        <asp:TextBox Id="TextBox1" Runat="server" ValidationGroup="First" />
        <asp:TextBox Id="TextBox2" Runat="server" ValidationGroup="First" />
        <asp:RequiredFieldValidator Id="RequiredFieldValidator1" Runat="server" ValidationGroup="First" ErrorMessage="TextBox1 should not be blank" ControlToValidate="TextBox1" />
    
        <asp:Button ID="Submit1" Runat="server" ValidationGroup="First" Text="Submit 1" />
    </p>
    
    <p>
        <asp:TextBox Id="TextBox3" Runat="server" ValidationGroup="Second" />
        <asp:TextBox Id="TextBox4" Runat="server" ValidationGroup="Second" />
        <asp:RequiredFieldValidator Id="RequiredFieldValidator2" Runat="server" ErrorMessage=" TextBox3 should not be blank" ControlToValidate="TextBox3" ValidationGroup="Second" />
    
        <asp:Button Id="Submit2" Runat="server" ValidationGroup="Second" Text="Submit 2" />
    </p>
    
    </form>

Aye, easy when you know. Googling is a wonderful thing.