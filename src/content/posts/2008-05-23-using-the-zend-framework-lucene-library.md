---
title: Using the Zend framework Lucene library
date: 2008-05-23
published: true
tags: ["CodeIgniter", "PHP"]
canonical_url: false
description: "I know, only a few articles in, so I don't really need a site search function. But you never know, I might actually keep writing (even if no-one is reading) and so I've been looking around for some solutions."
---

I know, only a few articles in, so I don't really need a site search function. But you never know, I might actually keep writing (even if no-one is reading) and so I've been looking around for some solutions.

I've looked at a few, for example: [Swish-e](http://www.swish-e.org/), and [Sphider](http://www.sphider.eu/). Nothing really float my boat, until I had a look at the Zend Framework. It's another MVC based PHP framework, though it looks a little heavier than CodeIgniter. The documentation is not as good either, but it did have a Lucene library.

I found a way of incorporating a Zend framework class as a CodeIgniter library here by Fred Wu. Nice work Fred, thanks.

As Fred suggests, copy the Zend folder from the framework library to application/libraries/ in your CodeIgniter installation. I discovered that I only needed the Zend/Search folder, and the Zend/Exception.php file.

Continuing Fred's instructions, create a Zend.php library file with the code posted on his blog page. Now we can get started.

Create a directory for the index. In my example code I created a directory called application/search. Now we can create a controller called search.php that will contain some simple create, and search methods:

```php
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
```

I didn't bother with the create index view, as all that is needed is a simple message explaining that the index is created. The search_result_view.php view will display the results:

```html
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
```

As you can see, I've noted a few TODO's. Might add a bit of jQuery action (because I'm worth it) in there to. Weekend coming up, so I'll expand on this next week.

## 13 thoughts on “Using the Zend framework Lucene library”

### alex

_May 17, 2009 at 2:36 pm_

what do i have to wrote in the code where it is the comment “ro do”?

---

### Andy

_May 17, 2009 at 3:07 pm_

The index method doesn't have to do much really, apart from load the view for this method.

The view will consist of a form to post your search term. This will post to your result method, which is currently hardcoded with the term 'Andrew'. You would change this to take the value from the form field.

Clear? If not, I'll amend the example.

---

### Suresh

_June 30, 2009 at 11:48 am_

Hi Andy,

Could you please post the content for Zend.php library file( CI ). As the link to Fred Wu site is down.

Thanks for coming up with this search article.

---

### Andy

_June 30, 2009 at 11:56 am_

No problem, you can obtain it here. I don't know if he ever altered it, but this is the version of the code I use on my site.

---

### Peter

_August 7, 2009 at 6:28 pm_

Hi,

I followed your instruction and got Lucene for Zend to work in Code Igniter on my home server. Unfortunately after i copied it over to the hosted staging server i get these errors whenever i try to execute any Lucene methods:

```shell
A PHP Error was encountered
Severity: Notice
Message: Hex number is too big: 0x100000000
Filename: Storage/File.php
Line Number: 268
```

Do you have any idea what could be wrong?

Thanks

Peter

---

### Asif

_August 7, 2009 at 6:30 pm_

will it crawl the whole domain going through each link and create the search content?

if that is the case then how can i generate the url link with the search keyword in the search result display?

---

### Andy

_August 7, 2009 at 6:47 pm_

This example is just a test case that indexes the home page of my site. A more complete example can be found in the next part of this article.

---

### Nir Gavish

_September 13, 2009 at 2:29 am_

i've seen much talk about using lucene as an indexer, but what about using it as the sole data repository? anyone ever try it? how did it preform? how reliable was it? thanks

---

### junaid

_April 10, 2010 at 4:12 am_

Hi,
a month ago i sent you comments regarding your article about integration of zend lucene with CI. I have got out of the errors as i reported to you before. but got into some new ones. Now i want to search html docs in my application…every query i m submitting in search is returning no results..when there actually are. i am sending you the code..plz if you can have a look at it and point out my mistake.

Controller

```php
<?php
class Search extends Controller {
    function Search()
    {
        parent::Controller();

        $this->load->library('zend');
        $this->zend->load('Zend/Search/Lucene');
        $this->search_index = APPPATH . 'search/index';
    }

    function create()
    {
        Zend_Search_Lucene::create($this->search_index);
        $doc = Zend_Search_Lucene_Document_Html::loadHTMLFile('http://localhost/codeigniter/index.php/universities/home');
        $doc->addField(Zend_Search_Lucene_Field::UnIndexed('url', 'http://localhost/codeigniter/index.php/universities/home'));

        $index->addDocument($doc);
        $index->commit();

        $index->optimize();
    }

    function optimize()
    {
        $this->login();

        $index = Zend_Search_Lucene::open($this->search_index);
        $index->optimize();

        echo '

        Index optimized.

        ';
    }

    function result()
    {
        // Create empty array, in case there are no results.
        $data['results'] = array();

        // If a search_query parameter has been posted, search the index.
        if ($this->input->post('search_query'))

        {
            $index = Zend_Search_Lucene::open($this->search_index);
            $data['results'] = $index->find($this->input->post('search_query'));
        }
        // Load view, and populate with results.
        $this->load->view('search/search_result', $data);
    }
}
?>
```

and at search_result view i get every time “No results were returned for query: a”.

can u figure aut my mistake plz.

---

### Jesmar

_February 8, 2011 at 10:28 am_

HELLO..i have a problem in my ordering system…I have an error on my controller…Fatal error: `Call to a member function result() on a non-object in C:xampphtdocscifofb1projectsystemapplicationcontrollerscuser.php on line 210`…pls help me

---

### Noor

_January 8, 2015 at 7:27 am_

I downloaded the latest Zend framework release 'ZendFramework-2.3.3.zip' form site http://framework.zend.com/downloads, but I did not find the folder “Search” in path “Zend/Search/Lucene” !! from where I can get it?

---

### Noor

_January 8, 2015 at 8:18 am_

Ok, I discover the problem, zf2 put zendSearch as an optional library, so I have to download it alone

---

### Noor

_January 8, 2015 at 11:08 am_

following your steps, the search works for the previous version of zf1., but right now I want to work with zf2.
I put the folder ZendSearch under librariy/zend, and I have chnaged the links to look like this:

```php
$this->load->library('zend');
$this->zend->load('Zend/ZendSearch/Lucene/Lucene');
```

But unfortunately nothing works ?? what is wrong ?

---
