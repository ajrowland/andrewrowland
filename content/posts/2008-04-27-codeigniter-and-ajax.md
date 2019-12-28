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

Create a view and save as **world_view.php**:

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

I just noticed that my ISP only has PHP4 installed. If this is the case for you, you will have to alter the controller to get this to work. Change the line:

    <a href="http://www.php.net/echo">echo</a> json_encode($continents[$continent]);

To:

    <a href="http://www.php.net/echo">echo</a> '["' . <a href="http://www.php.net/implode">implode</a>('","', $continents[$continent]) . '"]';

Obviously this solution does not scale well for more complex data structures. I would advise using a JSON serializer library of some description. You could also create a view for the JSON structures, and pass data to that. This would actually be a sensible approach, as you would have complete control over the output.