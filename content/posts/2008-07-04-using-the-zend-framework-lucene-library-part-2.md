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

## 20 thoughts on “Using the Zend framework Lucene library Part 2”

### Jeff
*November 14, 2008 at 8:07 am*

Great post! Keep it up.

---

### Rob
*March 9, 2009 at 6:01 am*

Hi Andrew,

Many thanks for these articles, after a little tweakage I managed to get it all going on a project I’m working on. (I’m pretty new to CI/PHP/Apache having come from ASP/VBScript/IIS [Yuk, I know..])

However, I have a question: At the moment, same as your tutorial, I’m searching on only one table in the db, a table called Items (news, events, careers) which is fine but I need to be able to index a number of other tables. What I’m mostly wondering about is how to set the link in the result, I presume the rest is just replicating the code I already have for indexing?

Have you any insights, experience, wisdom, links? Any help would be greatly appreciated.

Thanks,

Rob.

---

### Rob
*March 11, 2009 at 5:35 am*

Andrew,

Many thanks for your swift and insightful reply.. I haven’t had a chance to test it yet but your code and explanations make sense and have cleared up a lot for me.

Thanks again for your time, you’ve saved me a lot of mine!

Cheers!

Rob.

---

### zaw
*March 13, 2009 at 9:42 am*

In the display result view page, when searching html file content the result will be long text.
How can I display only the synopsis of the long text?
I want to show the parts of text in result that found the search terms.

e.g. in google result when I find the search term | zend framework sample |

Akra?s DevNotes ? Tutorial: Getting Started with Zend Framework
The original tutorial for Zend Framework 1.0 is still available, ... Rob, Did you have a sample of using Zend call linux command ? how to do that? ...

In above e.g., Google show two parts of text. How can I do like this?

---

### zaw
*March 14, 2009 at 3:28 pm*

Hi Andrew

I mean in the result list I would like to show only the line near the search term found.

I’m testing with zend frame sample code ZendFramework-1.7.6demosZendSearchLucenefeed-searchsearch-index.php

At line 41 of search-index.php, trim(substr($hit->$field,0,76)). It is only show the first 76 characters of result text.

I’m afraid that the search term may not include within first 76 characters.
I mean if the search term found at the postition of 100th character, I want to show the text near 100th character like google result.

thanks

---

### Andy
*March 15, 2009 at 12:52 pm*

Hello Zaw

Take a look at:

http://framework.zend.com/manual/en/zend.search.lucene.searching.html#
zend.search.lucene.searching.highlighting

You will need to store the content as a text field, so it can be used by the Zend Query Parser to highlight the returned text.

The main problem you will have, is restricting the amount of content returned, as you will not want the entire document, only the sentence(s) in which the highlighed search terms appear.

I had a go quick on my site, and made it work, but did not get around to the final problem I’ve, er, highlighed.

---

### Zaw
*May 13, 2009 at 4:38 am*

Hello

Thanks for your reply.

I found a way to display search results as I want in the following link
http://www.whatstyle.net/articles/6/displaying_search_results_with_php

This class can show the parts of content near search keyword.
I want to integrate this class with zend lucene result.
But this chunk class require three parameters

1. the subject string,
2. a maximum amount of characters and
3. an array of search words.

How can I get array of search words from zend lucene result?
If I query with wild card in lucene, the result hightlight text may vary depend of the content of file.

e.g. If I query like meth*, the result may include method, methodology, etc.
I need to know which words are found in the file to use the chunk class.

Is there a way to find the list of keywords that found for a search result?

Thanks

---

### junaid
*May 16, 2009 at 12:13 pm*

hi andrew,
i have a problem while using your method code. i have only included exception .php file and Zend/Search folder in my application/libraries. i get an error
Message:

    CI_Zend::require_once(Zend/Search/Lucene.php) [ci-zend.require-once]: failed to open stream: No such file or directory

    Filename: libraries/Zend.php

    Line Number: 35

if u can please help me .

---

### junaid
*May 17, 2009 at 4:18 am*

hi,
thanks for your reply.

    /system/application/libraries/Zend/Search/Lucene.php does exist.

i m on windows with XAMPP. i m also using CI 1.71. but i read on codeigniter/forums that u have to write

    $this->load->library(‘zend’);
    $this->zend->load( ‘Zend/Search/Lucene’);

instead of

    $this->load->library(‘zend’, ‘Zend/Search/Lucene’);

in the controller.

also i have upgraded log_threshold to 4. i have checked the log and classes are successfully initialized and loaded...

i have changed the reindex function according to my database. i have a “event” table in my DB. and it has a “Event_name” field. so reindex looks like

    function reindex()
    {
        // Create index. Will delete any existing index.
        $this->create();

        // Obtain all events.
        $query = $this->db->get(‘event’);

        // Loop through articles, adding an index for each one.
        foreach ($query->result() as $event)
        {
            // Create Lucene document for this article.
            $doc = new Zend_Search_Lucene_Document();

            // Add required fields.
            $doc->addField(Zend_Search_Lucene_Field::Text(‘eventname’, $event->Event_name));

            $index->addDocument($doc);

            echo ‘Added ‘ . $item->eventname . ‘ to index.
            ‘;
        }

        $index->optimize();
    }

and i get a long long error

    Fatal error: Uncaught exception ‘Zend_Search_Lucene_Exception’ with message ‘Index doesn’t exists in the specified directory.’ in C:xampphtdocscodeignitersystemapplicationlibrariesZendSearchLucene.php:547 Stack trace: #0 C:xampphtdocscodeignitersystemapplicationlibrariesZendSearchLucene.php(214): Zend_Search_Lucene->__construct(‘C:xampphtdocs…’, false) #1 C:xampphtdocscodeignitersystemapplicationcontrollerssearch.php(70): Zend_Search_Lucene::open(‘C:xampphtdocs…’) #2 C:xampphtdocscodeignitersystemcodeigniterCodeIgniter.php(233): Search->result() #3 C:xampphtdocscodeigniterindex.php(115): require_once(‘C:xampphtdocs…’) #4 {main} thrown in C:xampphtdocscodeignitersystemapplicationlibrariesZendSearchLucene.php on line 547

---

### Andy
*May 17, 2009 at 4:19 am*

It looks like an error in my code. I’ve changed the way the library is loaded, as you suggested. Removed the create method, and have created the index directly within the reindex method.

---

### john
*May 21, 2009 at 6:51 am*

    A PHP Error was encountered
    Severity: Notice

I got this error when i try ur code. i spend few days but i still can’t fix it. please help

    Message: iconv_strlen() [function.iconv-strlen]: Wrong charset, conversion from `’ to `UCS-4LE’ is not allowed

    Filename: Search/QueryLexer.php

    Line Number: 343

---

### Andy
*May 21, 2009 at 6:55 am*

You appear to be having a problem with the Zend library class rather than my code.

A quick Google brings something that might help.

---

### yeiniel
*February 10, 2010 at 11:47 am*

there is no problem width the code, the problem here is that the search index is not created. you need to create the index first. see Zend framework documentation to acomplish that

---

### noel
*May 14, 2010 at 4:50 am*

This works fine on my local, but as soon as i put it on my live server i get:

    A PHP Error was encountered

    Severity: Warning

    Message: CI_Zend::require_once(Zend/Search/Lucene.php) [ci-zend.require-once]: failed to open stream: No such file or directory

    Filename: libraries/Zend.php

    Line Number: 51

---

### Brian
*January 3, 2011 at 12:58 pm*

Thank you, I have the Lucene searching within the CI framework now, but do you know of a way to paginate the results? The CI Library is fine for database queries, but I am not sure how to implement pagination with the Lucene indexes...

---

### tom
*January 3, 2011 at 12:59 pm*

pls help me...

    Fatal error: Class ‘Zend_Search_Lucene’ not found

---

### ria
*March 19, 2011 at 1:54 pm*

very helpful resource. thanks for sharing.

---

### annony
*August 8, 2011 at 9:57 am*

Index doesnâ€™t exists in the specified directory::

I work on windows, and may be its due to file permission. Anyway, I tried using create first and then open . See,
http://framework.zend.com/manual/1.11/en/learning.lucene.index-opening.html

Once created , I removed create statement, and worked fine

---

### Leonardo Siagian
*March 10, 2014 at 5:18 am*

how if i use category in searching? it’s mean, i select firstly category before searching.

i try this code:

    $category= $this->input->post(‘category’);
    $keyword =strtolower($this->input->post(‘keyword’));

    $query = new Zend_Search_Lucene_Search_Query_MultiTerm();
    $query->addTerm(new Zend_Search_Lucene_Index_Term($keyword,’content_article’),true);
    $query->addTerm(new Zend_Search_Lucene_Index_Term($category,category_article’), true);
    $data[‘results’] = $index->find($query);

according that code, i just can use single word as the keyword, and can not use(find) more than one word (phrase).

anybody can solve my problem? thanks ...

---

### Kopano Unity
*July 22, 2014 at 1:41 pm*
Hi Jeff

Thanks for the post first of all it is very understandable, but I keep coming across an error in my code hope you can help me here is my stackoverflow question link http://stackoverflow.com/questions/24887645/zend-lucene-search-content-inside-a-datebase-in-html-on-a-live-website-404-er

---