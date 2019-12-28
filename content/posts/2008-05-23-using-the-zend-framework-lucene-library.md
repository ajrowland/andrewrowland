---
title: Using the Zend framework Lucene library
date: 2008-05-23
published: true
tags: ['CodeIgniter', 'PHP']
canonical_url: false
description: "I know, only a few articles in, so I don't really need a site search function. But you never know, I might actually keep writing (even if no-one is reading) and so I've been looking around for some solutions."
---

I know, only a few articles in, so I don't really need a site search function. But you never know, I might actually keep writing (even if no-one is reading) and so I've been looking around for some solutions.

I've looked at a few, for example: [Swish-e](http://www.swish-e.org/), and [Sphider](http://www.sphider.eu/). Nothing really float my boat, until I had a look at the Zend Framework. It's another MVC based PHP framework, though it looks a little heavier than CodeIgniter. The documentation is not as good either, but it did have a Lucene library.

I found a way of incorporating a Zend framework class as a CodeIgniter library here by Fred Wu. Nice work Fred, thanks.

As Fred suggests, copy the Zend folder from the framework library to application/libraries/ in your CodeIgniter installation. I discovered that I only needed the Zend/Search folder, and the Zend/Exception.php file.

Continuing Fred's instructions, create a Zend.php library file with the code posted on his blog page. Now we can get started.

Create a directory for the index. In my example code I created a directory called application/search. Now we can create a controller called search.php that will contain some simple create, and search methods:

    <?php
    class Search extends MY_Controller {
    
        function Search()
        {
            parent::MY_Controller();
    
            $this->load->library('zend');
            $this->zend->load('Zend/Search/Lucene'); 
        }
    
        function create()
        {
            // This method should be authenticated, or removed once the index is created.
            // TODO: Some sort of site spidering process to add the entire site to the index.
    
            $index = Zend_Search_Lucene::create(APPPATH . 'search/index');
    
                $doc = Zend_Search_Lucene_Document_Html::loadHTMLFile('http://www.andrewrowland.com');
    
                $index->addDocument($doc);
    
            echo '<p>Index created</p>';
        }
    
        function index()
        {
            // TODO: Create an index method that contains a search form.
        }
    
        function result()
        {
            // Hardcoded search result example.
            // TODO: Take a user search query, and expand the result summary
    
            $index = Zend_Search_Lucene::open(APPPATH . 'search/index');
    
            $data['results'] = $index->find('andrew');
    
            $this->load->view('search_result_view', $data);		
        }
    }
    ?>

I didn't bother with the create index view, as all that is needed is a simple message explaining that the index is created. The search_result_view.php view will display the results:

    <html>
    <head>
        <title>Search example</title>
    </head>
    <body>
    
    <ul>
        <?php foreach($results as $result):?>
        <li><?php echo $result->title;?></li>
        <?php endforeach;?>
    </ul>
    
    </body>
    </html>

As you can see, I've noted a few TODO's. Might add a bit of jQuery action (because I'm worth it) in there to. Weekend coming up, so I'll expand on this next week.