---
title: Tridion Business Connector client
date: 2009-01-19
published: true
tags: ['Perl', 'Tridion']
canonical_url: false
description: "A bit of a niche entry this one. Will only be of interest to those who use Tridion, one of the more 'heavyweight' CMS solutions."
---

A bit of a niche entry this one. Will only be of interest to those who use Tridion, one of the more 'heavyweight' CMS solutions.

I generally have a number of repetitive tasks that are extremely tedious to accomplish using the browser based GUI. So I constructed a simple [command line tool](/downloads/bcclient.exe) that allows me to script tasks using a SOAP interface known as the Tridion Business Connector.

The client takes the following arguments:

```shell
bcclient.exe /h [hostname] /u [user] /p [password] /d [domain] /x "[request XML]"
```

Why did I build this? Very useful when called via scripting tools. In my case, [Perl](https://www.perl.org/).

A simple Perl script that will return the XML for a Tridion Component would look something like this:

```perl
use strict;

my $requestXML = q{
    <?xml version="1.0" encoding="utf-16"?>
    <tcmapi:Message version="5.0" from="AndyRowlandSoapClient" failOnError="true" xmlns:tcmapi="http://www.tridion.com/ContentManager/5.0/TCMAPI">
    <tcmapi:Request ID="GetItemRequest" preserve="true">
    <tcmapi:GetItem itemURI="tcm:12-345" />
    </tcmapi:Request>
    </tcmapi:Message>
};

$requestXML =~ s/"/\\"/g;

my $responseXML = `bcclient.exe /h MyTCMHost /u andyrowland /p mypassword /d MYDOMAIN /x "$requestXML"`;

print $responseXML;
```

We could add a layer of abstraction, and wrap up the SOAP call within a subroutine, something like:

```perl
sub make_request {
    my $messageXML = shift;
    my $requestXML = '<?xml version="1.0" encoding="utf-16"?><tcmapi:Message version="5.0" from="AndyRowlandsSoapClient" failOnError="true" xmlns:tcmapi="http://www.tridion.com/ContentManager/5.0/TCMAPI">' . $messageXML . '</tcmapi:Message>';

    $requestXML =~ s/"/\\"/g;

    my $responseXML = `bcclient.exe /h MyTCMHost /u andyrowland /p mypassword /d MYDOMAIN /x "$requestXML"`;

    return XML::Simple::XMLin($responseXML);
}
```

Note the use the module XML::Simple to convert the response XML into a Perl data structure.

We can then create a succession of subroutines to perform a variery of routine tasks. To get a Tridion item:

```perl
sub get_item {
    my $URI = shift;

    my $messageXML = qq{
        <tcmapi:Request ID="GetItemRequest" preserve="true">
        <tcmapi:GetItem itemURI="$URI" />
        </tcmapi:Request>
    };

    my $ref = make_request($messageXML);

    if ($ref->{'tcmapi:Response'}{'success'} eq 'true'){
        return $ref;
    } else {
        die "ERROR: Could not get item $URI";
    }
}
```
