---
title: Using the Zend framework Lucene library Part 2
date: 2008-07-04
published: true
tags: ['CodeIgniter', 'PHP']
canonical_url: false
description: "Note: Since this article was written I’ve moved to WordPress, and have not implemented the example code listed below.

In a previous article I talked about using a library from the Zend framework to create a site search. As you try out this functionality using the search box, above right."
---

**Note**: Since this article was written I’ve moved to WordPress, and have not implemented the example code listed below.

In a previous article I talked about using a library from the Zend framework to create a site search. As you try out this functionality using the search box, above right.

I never finished the article, so I'll explain here how I implemented this using CodeIgniter. I'll also detail how I built the 'quick results' tool (click in the search box).

Below is an example controller class that shows how I constructed the search index by pulling articles out of the database. My actual class calls security methods that require authentication before performing any of these methods. I left them out of the listing to keep it short and sweet. You will have to alter the code to allow for the difference in database schema, and to suit your intended available search criteria.

    <?php
    class Search extends Controller {
    
        function Search()
        {
            parent::Controller();
    
            // Load Zend Lucene library.  See previous article.
            $this->load->library('zend');
            $this->zend->load( 'Zend/Search/Lucene');
    
            // Location of search index.  Used by all Search controller methods.
            $this->search_index = APPPATH . 'search/index';
        }
    
        function reindex()
        {
            // Create index.  Will delete any existing index.
            $index = Zend_Search_Lucene::create($this->search_index);
    
            // Obtain all articles.
            $query = $this->db->get('articles');
    
            // Loop through articles, adding an index for each one.		
            foreach ($query->result() as $article)
            {
                // Create Lucene document for this article.
                $doc = new Zend_Search_Lucene_Document();
    
                // Add required fields.
                $doc->addField(Zend_Search_Lucene_Field::Text('title', $article->title));
                $doc->addField(Zend_Search_Lucene_Field::Text('subtitle', $subtitle));
                $doc->addField(Zend_Search_Lucene_Field::Text('category', $category_list));
                $doc->addField(Zend_Search_Lucene_Field::Text('path', '/article/display/' . $article->path));
                $doc->addField(Zend_Search_Lucene_Field::UnStored('content', $article->summary . $article->text));
    
                // Add docuument to index.
                $index->addDocument($doc);
    
                echo 'Added ' . $item->title . ' to index.<br />';
            }
    
            $index->optimize();
        }
    
        function optimize()
        {
            $index = Zend_Search_Lucene::open($this->search_index);
            $index->optimize();
    
            echo '<p>Index optimized.</p>';
        }
    }

To utilise the index a result method is required:

    function result()
    {
        // Create empty array, in case there are no results.
        $data['results'] = array();

        // If a search_query parameter has been posted, search the index.
        if ($this->input->post('search_query'))
        {
            $index = Zend_Search_Lucene::open($this->search_index);

            // Get results.
            $data['results'] = $index->find($this->input->post('search_query'));
        }

        // Load view, and populate with results.
        $this->load->view('search_result_view', $data);
    }

And, of course, a view is required to display the results:

    <html>
    <head>
        <title>Search results</title>
    </head>
    <body>		
    
    <h1>Search results</h1>
    
    <?php if (empty($_POST['search_query'])):?>
    <p>No search query submitted.</p>
    <?php else:?>
        <?php if (count($results)):?>
    <p><?php echo count($results) ?> result(s) returned for query: <?php echo $_POST['search_query'];?></p>
    <ul>
        <?php foreach($results as $result):?>
        <li><?=anchor(site_url($result->path), $result->title);?> (<?php echo round($result->score, 2) * 100;?>%)</li>
        <?php endforeach;?>
    </ul>
        <?php else:?>
    <p>No results were returned for query: <?php echo $_POST['search_query'];?></p>
        <?php endif;?>
    <?php endif;?>
    
    </body>
    </html>