---
title: CodeIgniter and Ajax
date: 2008-04-27
published: true
tags: ['CodeIgniter', 'JavaScript', 'PHP']
canonical_url: false
description: "I've been asked to create a dashboard for many devices across our network. To display real-time information on each component, I'm thinking of using Web services, and AJAX. Like most aspects of coding, using a framework to do all the heavy lifting, rather than developing your own, is a sensible approach.

So today I took a look at jQuery, a JavaScript framework. I have to admit, I'm pretty impressed. It did not take me long to come up with some example code, that degrades well when JavaScript is disabled in the browser."
---

I've been asked to create a dashboard for many devices across our network. To display real-time information on each component, I'm thinking of using Web services, and AJAX. Like most aspects of coding, using a framework to do all the heavy lifting, rather than developing your own, is a sensible approach.

So today I took a look at jQuery, a JavaScript framework. I have to admit, I'm pretty impressed. It did not take me long to come up with some example code, that degrades well when JavaScript is disabled in the browser.

My example app lists continents. Clicking on a continent will return a list of countries in that continent.

Create a CodeIgniter controller and save as **world.php**:

```php
<?php
class World extends Controller {

    function World()
    {
        parent::Controller();
    }

    function index($continent = NULL)
    {
        // Set continents data.  In a real application we
        // would obtain this from a database via a model.
        $data['continents'] = array(
                1 => 'Europe',
                2 => 'Africa',
                3 => 'North America',
            );

        // If a non-Ajax continent selection is made, call the
        // list_countries method, and set countries data.
        if (isset($continent))
        {
            $data['countries'] = $this->list_countries($continent);
        }

        // Load world view.
        $this->load->view('world_view', $data);
    }

    function list_countries($continent)
    {
        // Generated countries data.  As before, this would be
        // obtained from a model.
        $continents = array(
                1 => array('UK', 'France', 'Germany'),
                2 => array('South Africa', 'Zimbabwe', 'Cameroon'),
                3 => array('USA', 'Canada'),
            );

        // Decide whether to return JSON data, or an array,
        // depending if $_POST['ajax'] is set.
        if (isset($_POST['ajax']))
        {
            echo json_encode($continents[$continent]);
        }
        else
        {
            return $continents[$continent];
        }
    }
}
?>
```

Create a view and save as **world_view.php**:

```php
<html>
<head>
    <title>World example</title>
    <script type="text/javascript" src="/jquery.js"></script>
    <script type="text/javascript">
    function list_countries(id) {
        $('li > ul').slideUp('slow');

        if ($('#id_' + id).children('ul').length == 0) {
            $.post('/world/list_countries/' + id, {ajax:'true'},
                function(data){
                    unorderedlist = $('<ul/>').css('display', 'none');

                    $.each(data, function(i, country){
                        $('<li/>').text(country).appendTo(unorderedlist);
                    });

                    unorderedlist.appendTo('#id_' + id);
                    unorderedlist.slideDown('slow');
                }, 'json');
        } else {
            $('#id_' + id + ' > ul').slideDown('slow');
        }

        return false;
    }
    </script>
</head>

<body>

<ul>
    <?php foreach($continents as $id => $name):?>
    <li id="id_<?=$id;?>"><a onclick="return list_countries(<?=$id;?>);" href="<?=site_url("/world/index/$id");?>" title="Show countries in <?=$name;?>"><?=$name;?></a>
    <?php if ($id == $this->uri->segment(3)):?>
    <ul>
        <?php foreach($countries as $country):?>
        <li><?=$country;?></a></li>
        <?php endforeach;?>
    </ul></li>
    <?php endif;?>
    <?php endforeach;?>
</ul>

</body>
</html>
```

I just noticed that my ISP only has PHP4 installed. If this is the case for you, you will have to alter the controller to get this to work. Change the line:

```php
<a href="http://www.php.net/echo">echo</a> json_encode($continents[$continent]);
```

To:

```php
<a href="http://www.php.net/echo">echo</a> '["' . <a href="http://www.php.net/implode">implode</a>('","', $continents[$continent]) . '"]';
```

Obviously this solution does not scale well for more complex data structures. I would advise using a JSON serializer library of some description. You could also create a view for the JSON structures, and pass data to that. This would actually be a sensible approach, as you would have complete control over the output.

## 12 thoughts on “CodeIgniter and Ajax”

### Anonymous
*August 12, 2008 at 5:34 pm*

Incredible, thanks a lot for this… it is exactly what I was looking for +invisible props.

---

### Christophe Sautot
*May 13, 2009 at 4:37 am*

Thank you for posting this. It was really simple to understand, and straight to the point.

---

### Jedd
*November 6, 2009 at 6:38 pm*

Looks interesting, and easy to follow. Reading is a bit frustrating on a 22″ monitor, given the code lumps are only showing about a 1/4 to a 1/3 of the width (much left & right scrolling required). Flippin' pixel-based stylesheets!

---

### ghprod
*December 30, 2009 at 8:45 am*

wonderful application!

thanks for sharing this ajax!

---

### Rick
*January 28, 2010 at 4:17 am*

You have to load the url helper in the controller constructor like so:

    $this->load->helper('url'); or you will get an undefined function error site url();

Very nice post thanks

---

### sudeep
*April 10, 2010 at 4:12 am*

dear Very very thankxxxxxx

---

### heisler
*August 4, 2010 at 3:29 pm*

Gracias

---

### Rayhan
*January 16, 2011 at 3:20 pm*

It's awesome! thanks a lot

---

### triathlon wetsuit
*February 8, 2011 at 10:28 am*

Awesome!

---

### Frederik .
*May 18, 2011 at 8:53 am*

exactly what is was looking for, thanks !

---

### Kevin Phillips
*July 30, 2011 at 9:38 pm*

As of ci 2 with csrf enabled you also need to add the ci_csrf_token into the post data.

You will need to add jquery.cookie.js
ie:
create a var inside the script

```javascript
var cct = $.cookie('ci_csrf_token');
```

then at that to the post data

```javascript
    {ajax:'true', 'ci_csrf_token':cct}
```

---

### Kevin Phillips
*July 30, 2011 at 11:00 pm*

I've made an update of this tutorial for codeigniter2 with csrf enabled
http://www.kevinphillips.co.nz/news/jquery-axaj-codeigniter-2

---
