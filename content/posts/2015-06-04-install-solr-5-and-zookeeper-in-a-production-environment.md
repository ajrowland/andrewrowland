---
title: Install Solr 5 and Zookeeper in a production environment
date: 2015-06-04
published: true
tags: ['Linux', 'Solr']
canonical_url: false
description: "Recently I had to set up three Solr servers in an AWS environment. I couldn’t find anything specific to help me, so had to locate all the information separately. Hopefully the following may be of use to anyone who has to go through the same. In my situation, I have 3 servers that will sit behind a load balancer. The following describes how I set up each server."
---

Recently I had to set up three Solr servers in an AWS environment. I couldn’t find anything specific to help me, so had to locate all the information separately. Hopefully the following may be of use to anyone who has to go through the same. In my situation, I have 3 servers that will sit behind a load balancer. The following describes how I set up each server.

Initially I thought it best to update all packages on each Amazon Linux AMI. I was using a green field environment. You might not be in that situation, so may not want to do the following.

    sudo yum clean all
    sudo yum update

Solr 5 requires a newer version of Java that was pre-installed on the server. So we need to obtained an updated Java package, and select it as the default version.

    sudo yum install java-1.7.0-openjdk
    sudo alternatives --config java

Now we need to obtain a Solr package. You can find a mirror here: http://lucene.apache.org/solr/mirrors-solr-latest-redir.html. For example, I downloaded an archive using:

    wget http://mirror.catn.com/pub/apache/lucene/solr/5.1.0/solr-5.1.0.tgz

Let’s make certain all the pre-requisites exist to run Solr, but decompressing the archive, and running it.

    tar zxf solr-5.1.0.tgz
    cd solr-5.1.0
    bin/solr start
    bin/solr status

If Solr looks like it is running correctly, let’s stop it.

    bin/solr stop

We can now install it using the pre-packaged service install script that comes with the archive. Exit the Solr folder, and extract the service install script.

    cd ..
    tar xzf solr-5.1.0.tgz solr-5.1.0/bin/install_solr_service.sh --strip-components=2

Using this script we can install the service.

    sudo bash ./install_solr_service.sh solr-5.1.0.tgz

The script will install Solr into /opt/solr-5.1.0, with a symbolic link from /opt/solr. All writable files (i.e. logs) are placed in /opt/solr. The service runs under the user ‘solr’, that will be created for this purpose. Check the service is running correctly.

    sudo service solr status

Just to note, by default the Java heap size is 512M. This will more than likely need to be increased in a production environment. What this value will be will depend on your requirements, and is beyond the scope of this post. If you do need to amend this value, use an*or such as Vi to* the following file:

    sudo vi /var/solr/solr.in.sh

The specific value you will need to change is SOLR_JAVA_MEM. Restart the service to make certain the new configuration is picked up.

You should now be able to access the Solr admin site on the server. By default this runs on port 8983, for example:

http://your-server:8983/solr/

Now Solr is up and running we need to set up Zookeeper. Zookeeper is used to maintain the configuration between the three Solr servers.

Once again we need to obtain a package from a Zookeeper mirror.

    get http://mirror.vorboss.net/apache/zookeeper/current/zookeeper-3.4.6.tar.gz

Zookeeper does not come with a nice service installer, so we need to manually set this up. First extract into /opt.

    sudo tar xzxf zookeeper-3.4.6.tar.gz -C /opt

Create a symbolic link. This is for ease of upgrading.

    sudo ln -s /opt/zookeeper-3.4.6/ /opt/zookeeper

Rename the example Zookeeper config file.

    sudo mv /opt/zookeeper/conf/zoo_sample.cfg /opt/zookeeper/conf/zoo.cfg

You will need to add something like the following to zoo.cfg. These lines list all servers that need to be maintained by Zookeeper. Amend with applicable server IP addresses.

    server.1=serverip1:2888:3888
    server.2=serverip2:2888:3888
    server.3=serverip3:2888:3888

Whilst*ing this file, change the data directory:

    dataDir=/var/lib/zookeeper/data

Each server requires a context file called ‘myid’. This is used to identify it.

    sudo mkdir /var/lib/zookeeper
    sudo mkdir /var/lib/zookeeper/data
    sudo touch /var/lib/zookeeper/data/myid

Edit each myid file and add the appropriate number for each server. For example, for three servers this will be 1, 2 or 3.

Now start up each ZooKeeper server:

    sudo /opt/zookeeper/bin/zkServer.sh start

We need to return to Solr, to configure the Zookeeper hosts.* the solr.xml file::

sudo vi /var/solr/data/solr.xml

Within the solrcloud element add the following, once again amending with your server IP addresses:

    serverip1:2181,serverip2:2182,serverip3:2183

It should look something like the following:

````
<solr>
  <solrcloud>
    ...
    <str name="zkHost">serverip1:2181,serverip2:2182,serverip3:2183</str>
  </solrcloud>
</solr>
````

Restart Solr on all servers managed by Zookeeper:

    sudo service solr restart

We can check Solr is connected to Zookeeper, by obtaining its status.

    sudo service solr status

There should be some additional JSON in the response returned:

````
"cloud":{
    "ZooKeeper":"serverip1:2181,serverip2:2182,serverip3:2183",
    "liveNodes":"3",
    "collections":"0&"
}
````

Now everything is working correct, we should create a start up script for Zookeeper. We are going to customise the zkServer.sh script. First copy to the start up scripts:

    sudo cp /opt/zookeeper/bin/zkServer.sh /etc/init.d/zookeeper

Edit the copied file to include the following start up comment:

    # chkconfig: - 20 80
    # description: starts zookeeper - /opt/zookeeper under user root

I also amended the path to the bin directory. Locate and* the following in the script:

    ZOOBIN=/opt/zookeeper/bin

Now we can add the start up script, and switch it on:

    sudo chkconfig --add /etc/init.d/zookeeper
    sudo chkconfig --level 2345 zookeeper on

These will give it the same start options as Solr.

This should have Solr, and Zookeeper set up and installed on all three servers. You may have more servers if your requirements are more extensive. Bear in mind, Zookeeper requires an odd number of servers to function.

As an addition to the post, we can now add a collection, and test that it is replicated across our Solr servers. I copied collection configuration from our development environment into the home directory of the user I managed the Solr servers with. I could then use this configuration to create my new collection.

So to create a new collection, reference the uploaded collection configuration, so that it is stored in Zookeeper:

    sudo /opt/solr/bin/solr create_collection -c collection-qa -d ~/collection-dev/conf -n collection-qa -shards 1 -replicationFactor 3

This created a collection called ‘collection-qa’, from the configuration I had uploaded into the ~/collection-dev/conf folder. For my purposes a wanted one shard, replicated over all three Solr servers.

If you need to remove a collection use can use the following:

    sudo /opt/solr/bin/solr delete -c collection-qa

All collection configuration files are now in Zookeeper. If you want to update this configuration, and not delete the how collection, you’ll need to use the Solr version of the Zookeeper CLI. It can be sound here:

    sudo /opt/solr/server/scripts/cloud-scripts/zkcli.sh

For example, to view the collection schema stored in Zookeeper, use:

    sudo /opt/solr/server/scripts/cloud-scripts/zkcli.sh -zkhost localhost:2181 -cmd get /configs/collection-qa/schema.xml

To upload an amended schema file to Zookeeper use:

    sudo /opt/solr/server/scripts/cloud-scripts/zkcli.sh -zkhost localhost:2181 -cmd putfile /configs/collection-qa/schema.xml collection-dev/conf/schema.xml

I’ve used the example file names, and locations as explained previously. You’ll need to amend for your purposes.

If you do update the document schema you will need to reload a core using something like Curl to do the following:

    sudo curl http://localhost:8983/solr/admin/cores?action=RELOAD\&amp;amp;amp;amp;amp;amp;core=collection-qa_shard1_replica3

I hope this has been useful, but appreciate that I might not be too clear on some instructions. If you need me to clarify anything, give us a shout.

## 48 thoughts on “Install Solr 5 and Zookeeper in a production environment”

### johnb
*September 23, 2015 at 2:39 am*

Thanks for the effort! I’m a little confused..

A sample solr.xml file would be helpful. This statement leaves me somewhat unclear as to how, exactly, I should “add the following within the solrcloud element”

Within the solrcloud element add the following, once again amending with your server IP addresses:

    serverip1:2181,serverip2:2182,serverip3:2183

---

### Andy R
*October 16, 2015 at 10:57 am*

Sorry John. You’re correct, and I was a little vague. I write these things almost as a note to myself, which can make my writing style a little confused.

Within the solrcloud element you’ll need a str element with an attribute name of zkHost, for example:

    <solr>
        <solrcloud>
            ...
            <str name="zkHost">serverip1:2181,serverip2:2182,serverip3:2183</str>
        </solrcloud>
    </solr>

Hope this helps. I don’t have access to the Solr set up I created for Unilever at the moment. If this doesn’t help, I’ll try and obtain an example full configuration.

---

### johnb
*October 31, 2015 at 6:24 pm*

Thanks Andy – I’ll give it another shot now and let you know. If it works well, I’ll send you a copy of the configuration…

---

### Tarikur Rahaman
*April 8, 2016 at 10:27 am*

Please update this comment inside your main tutorial.
Thanks.

---

### Andy R
*April 8, 2016 at 10:42 am*

Done.

---

### Tarikur Rahaman
*April 8, 2016 at 3:47 pm*

Hi, I was able to create solrcloud with zookeeper. But Iâ€™m facing a problem. If i create a collection with 3 shard and 3 replication then all master shard show in same server (172.31.13.85). If i reboot this server then another server takeover this responsibility but still that server is serving standalone. Please see the picture to better understand.

!http://imgur.com/qD3OSh5

---

### Tarikur Rahman
*October 27, 2015 at 1:41 pm*

Thanks for the nice tutorial.
I’m new in solr and zookeeper. I want to know we are taking 3 instance and for 1 new collection/core, data is shard within 2 instance and replicate 3 instance?
When solr get incoming query, how does it serve? Because it shard between 2 instance.

---

### Andy R
*November 1, 2015 at 10:16 pm*

Thanks Tarikur. You are correct, three instances, one collection. In this particular environment, a load balancer is used to direct queries to any of the three Solr applications.

---

### r3l34s3
*November 5, 2015 at 11:00 am*

Very nice tutorial, thanks!

For Ubuntu 14.04 users stuck with “chkconfig: command not found”: replace chkconfig by sysv-rc-conf (apt-get install sysv-rc-conf if necessary).

---

### RR
*January 28, 2016 at 1:26 pm*

Hi
Thank you for this tutorial.
When I try to login to jetty — I get 404 not found?
Did you run into this
Thanks

---

### Raid
*March 3, 2016 at 11:44 am*

Hi
One thing is not clear:
-How do upload the config to zookeeper host.?
-Where are the files located on the zookeeper
thank you

---

### johnb
*March 10, 2016 at 5:30 pm*

Zookeeper has an “internal” representation of all the data it stores. You have to use the zkCli.sh command to access the data. If you look that up you will see how it’s done.

As for uploading the config to zookeeper, there is a zkCli.sh on SOLR too (confusing I know) and you can use this to upload configs to Zookeeper.

Here is a sample command line:

    sudo /opt/solr/server/scripts/cloud-scripts/zkcli.sh -cmd upconfig -confdir /home/john/conf/ -confname collectionName -z 192.168.56.5/solr5_4

The -z is worth noting… If, like me, you are using Zookeeper for several different purposes, you’ll want that /something after the zookeeper IP address… If you don’t do that, EVERYTHING ends up on the “/” level of Zookeeper’s internal storage and that will be very confusing later.

I currently have the following in Zookeeper: /solr4.9, a /solr5.4, a /kafka, and a /microservice/microserviceName. Doing it this way keeps things nicely separated.

---

### johnb
*March 10, 2016 at 10:43 pm*

Oh, and in the command line above, the /home/john/conf folder was a copy of a previously-existing SOLR conf folder. IIRC you only need schema.xml and solrconfig.xml, but don’t hold me to that.

Also, this command will CREATE the /solr5_4 “directory” in Zookeeper if it doesn’t exist. You can use the Zookeeper /bin/zkCli.sh tool to verify that. After it’s running type “ls /” (no quotes) and you should see that solr5_4 (or whatever you put) directory.

---

### Michael
*March 6, 2016 at 11:19 am*

Hi Andy,
First: thanks a lot it’s the best tutorial for this task.
If I need to create 5 solr instances I need to install zookeeper on each one of them?
Bests,
Michael

---

### johnb
*March 10, 2016 at 5:33 pm*

No. In a production-like environment, you probably want your Zookeeper “cluster” separate anyway – although the online documentation about how to do that (SOLR Cloud) is sorely lacking.

A minimum of 3 Zookeeper machines are required for a proper Zookeeper “cluster”

Of course, you could do it that way, but you’d be multiplying the number of zookeeper instances in your environment beyond what you absolutely need.

---

### johnb
*March 10, 2016 at 6:10 pm*

By the way – you’ll need to start or restart your SOLR process in a way that points it at the correct Zookeeper instances. Here’s an example from my documentation:
sudo /opt/solr/bin/solr restart -c -z 192.168.56.5,192.168.56.6,192.168.56.7/solr5_4

If you can’t ping your Zookeeper from your SOLR or vice versa, this command won’t work right.

You’ll note my SOLR is in /opt/solr… This is because I followed the instructions here to “install for production” when building my VMs.

https://cwiki.apache.org/confluence/display/solr/Taking+Solr+to+Production

Also note this… Although I have configured the SOLR config file exactly as described in the official documentation, I CANNOT get it to connect to Zookeeper in “Cloud Mode” when SOLR starts as part of booting the VM. I HAVE to enter that restart command above — every time.

Short of building my own “boot script thingie” I haven’t been able to solve this, including with a post to stackoverflow which got no useful suggestions from anyone. I found earlier (closed) bugs in the SOLR Jira that indicate this or something similar has been an issue before — and I assume (until I get more info) that this is a bug in SOLR 5.4… FWIW…

---

### Anonymous
*March 10, 2016 at 12:17 pm*

Can we setup Zookeeper and Solr Cluster separately and on different cloud services?

Say:
ZooKeeper with 3 servers ensemble in CloudService1 and Solr Clusters with 3 servers in CloudService2.

If No, then my ZK1,2,3 and Solr 1,2,3 servers in 1 cloud service will be the approach right.

---

### johnb
*March 10, 2016 at 5:35 pm*

I haven’t done it in AWS – but it seems to me the only limitation would be networking. I.E. as long as SOLR can “talk” to Zookeeper across the network and as long as Zookeeper can “talk” to SOLR across your networks, you should be fine.

---

### Andy R
*March 10, 2016 at 5:39 pm*

Thanks for the help John. I thought I was going to have to delve back into Solr to help these folk out. Much appreciated.

Andy

---

### johnb
*March 10, 2016 at 5:52 pm*

You bet. Happy to contribute. Your post here saved me a lot of time once I found it.

I spent two months pulling my hair out getting SOLR Cloud, Zookeeper and Kafka actually working on separate VM’s — NOT on loopback. The documentation for this is basically nonexistent and the “magic” script the SOLR folks created to get SOLR Cloud running on loopback is no help.

Why does nearly every open source project do that? Showing people how to build things on loopback is (in my not so humble opinion) a cop-out and a waste of time. It usually provides none of the information you need to actually build things in Prod or convince IT that the tool is a good idea. SOLR in particular has a bit of a bad reputation in terms of being so difficult to install and configure. A complete basic tutorial on how to set up a small Zookeeper cluster and 2 SOLR instances on separate VMs would go a looong way toward changing that.

Heck, what about providing Virtual Box images of everything in a working state? It surely would not take the SOLR experts that much longer to build…

If I can squeeze it in, I’m going to set up some AWS images and make them available… If I get really ambitious, I may do the whole thing as a Udemy course…

Anyway — It’s all fresh in my mind and I’ll be working on this project for another year, so I’m happy to help. Your blog was pretty much the only thing I ever found that provided any help at all in this direction — happy to contribute.

---

### johnb
*March 10, 2016 at 5:54 pm*

Sorry – That middle bit where I complain was supposed to be surrounded by “Rant” psuedo-html, but the site*ed it out...

---

### Andy R
*March 10, 2016 at 6:00 pm*

Ha! Know exactly how you feel. It’s never straightforward is it? I couldn’t believe there was nothing that listed this stuff out methodically, hence the post. The more this helps, the merrier.

---

### johnb
*March 10, 2016 at 6:13 pm*

By the way – did you know this page is #3 in a Google search for “Install SOLR in Production”? I’m guessing this is going to become the place people go until and unless the SOLR folks step up…

---

### Prashant
*March 21, 2016 at 1:30 pm*

nice tutorial, thanks!
When I restart solr .It gives error
Typically, this indicates a problem with the Solr server; check the Solr server logs for more information.

    at org.apache.solr.util.SolrCLI$SolrResponseHandler.handleResponse(SolrCLI.java:502)
    at org.apache.solr.util.SolrCLI$SolrResponseHandler.handleResponse(SolrCLI.java:492)

When I check logs found error like

    ERROR – 2016-03-21 12:16:12.116; [ ] org.apache.solr.common.SolrException; null:org.apache.solr.common.SolrException: java.net.UnknownHostException: 192.168.1.85:
    Name or service not known
    at org.apache.solr.common.cloud.SolrZkClient.(SolrZkClient.java:169)
    at org.apache.solr.cloud.ZkController.(ZkController.java:276)

In solr.xml I added
192.168.1.85:2181,192.168.1.101:2182

---

### manohar
*March 22, 2016 at 7:58 am*

can You please provide steps for windows machines.I am not able to setup solr 5 and zookeeper in windows machines.

---

### johnb
*March 22, 2016 at 2:37 pm*

I’m unable to do that I’m afraid. I don’t have any experience setting up any of these open source tools on Windows – nor is this really a forum for questions like that. You might try stackoverflow or something similar. However – when you do, a specific question about a specific problem is going to get more responses than a general question like this one… usually.

You might try this link: https://www.google.com/search?btnG=1&pws=0&q=solr+cloud+windows&gws_rd=ssl

I saw some promising links there...

---

### manohar
*March 23, 2016 at 8:02 am*

Thanks sir for quick reply, currently i setup solr cloud and zookeeper successfully. Now i created one core like “test ” and i want to add test core to multiple servers like

    test —> shard 1 — > 192.168.2.101:8983 leader
    —-> 192.168.2.102:8983 follower
    ——>192.168.2.103:8985 follower

like this .
How can i do?

---

### johnb
*March 23, 2016 at 6:40 pm*

Keep in mind everything I say is based on experience with Linux and SOLR only. I have no idea how it works on Windows. Your milage may vary.

There may be several approaches.

1. In theory you could create cores using the Admin UI. I have no idea how this works on windows. I haven’t successfully created new cores and had them tie into the existing collection “cloud” although it seems that it should be possible. That’s an approach I still need to test and verify – as I’m more a command-line guy myself. The trick with the Admin UI is that whatever code it runs (on linux at least) expects a particular directory structure to exist – and if it doesn’t find that structure things get confusing fast. On Linux this was /var/solr/data – I have no idea what it is on Windows. I figured this out by trying to build one and looking at the error message that came back – the directory SOLR was looking for was part of the message.

2. Another approach would be to start from scratch and use the command line to make SOLR do everything for 3 or 4 machines all at once (I’ve done this on Linux and it appears to work fine) The machines have to be up and running with SOLR also running and connected to Zookeeper in “cloud” mode.

3. The other approach is to stop SOLR on each of the machines you want to add a test core to — and then add (or copy) a directory where SOLR expects to see it on each of the new machines (it’s /var/solr/data on Linux) and then add a core.properties text file inside that directory that is very close to the one you should see inside the directory for your current “test” core.

I am in the middle of documenting this (for Linux) and will be happy to share what I found. The docs are quite rough and un-edited — and also lengthy. What I should do is get them up on a blog of my own, but as I say, they’re not yet done.

I will put rough docs for approach #3 here. If these turn out to be unreadable due to formatting, give me your email address and I’ll send a text file.

Please keep in mind:

For Linux, not Windows so your milage may vary.
I believe there are analogues for the .sh files for Windows command line work.
Very rough docs, but should be enough to get you through.
statdx is the name of my collection
if you are NOT doing this kind of thing with your addressing in Zookeeper, you’ll probably be sorry later and should probably start from scratch. You’ll see this a lot in my examples below. It keeps the SOLR stuff separate from everything else in Zookeeper and I’ve got Kafak and microservices to keep track of as well…

    -z 192.168.56.5,192.168.56.6,192.168.56.7/solr5_4

Note the /solr5_4 piece. If, when you create the collection, you address it this way and do the same in all configs etc.. EVERYTHING for Solr will go “under” /solr5.4 in Zookeeper and your life will be a lot easier.

Good luck!

#### VERY ROUGH NOTES ON:

Adding or replacing a SOLR VM into an existing zookeeper / solr ecosystem
for a particular collection. Obviously if you have more than one collection,
repeat the appropriate steps for each collection.

In this case that would mean adding additional directories to /var/solr/data and adding or
or*ing new properties files (if you copied/renamed your core directorie rather than making a new one)

1. make the new vm
2. install solr (or, duh, have that already done.)
a.Turn Solr OFF before the next bit.
I’m not sure it absolutely matters, but it’s a habit of mine.
It’s how I tested.


    sudo service solr stop

Now you have a choice…

##### CHOICE A:

Create the “core” directory as the solr user (or chown the directory if you installed per the “for production” instructions, then SOLR is the owner of all the files.)

Then, create and modify the core.properties file inside that directory (see below)
These files need to be owned by solr user, so either su solr or chown the files later.

as solr user:

    mkdir /var/solr/data/statdx_shard1_replica3
    nano /var/solr/data/statdx_shard1_replica3/core.properties

##### CHOICE B:

3. copy the core (statdx) directory from a working machine into the new one.
(I don’t know if the working machine’s SOLR has to be offline to do this.)
I did it while it was running, but no one was pinging SOLR either.



    scp -Cpvr solr-5.4.0.tgz solr@192.168.56.15:/var/solr/data

4. rename the statdx_shard1_replicaX to whatever the name was on the directory that was on the machine that went down
5. Change the core.properties file inside the statdx_shard1_replica3 directory

change the: name and coreNodeName entries only. See below.

The only advantage I can see to steps 3 – 5 is if your collection is really large and
you know it’s going to take a loooong time for it to update as a SOLR node and thus be
unavailable. If you bring the node up before exposing it to the users, it’s probably moot.

Creating the directory is MUCH easier to script and does NOT require networking. I’m just exposing all I learned here in case any of it matters to Kevin.

6. Restart solr on that (new) box



    service solr restart

7. Run this command to verify that all is well



    /opt/solr/bin/solr healthcheck -z 192.168.56.5,192.168.56.6,192.168.56.7/solr5_4 -c statdx

The first command shows how it looked before adding one
The second (after all the equals signs) shows the additional “node”

Ignore the command line below – but this is how I created my collection originally – with two machines as replicas. IIRC, this added the collection directory and the core.properties file to both machines (which were both up and running solr in cloud mode when I issued this command)

    su – solr -c “/opt/solr/bin/solr create -c statdx -d /home/john/conf -shards 1 -replicationFactor 2”

You will see something like this BEFORE you add the new node...

    john@solr5:~$ /opt/solr/bin/solr healthcheck -z 192.168.56.5,192.168.56.6,192.168.56.7/solr5_4 -c statdx

    {
        “collection”:”statdx”,
        “status”:”healthy”,
        “numDocs”:0,
        “numShards”:1,
        “shards”:[{
        “shard”:”shard1″,
        “status”:”healthy”,
        “replicas”:[
            {
                “name”:”core_node1″,
                “url”:”http://192.168.56.16:8983/solr/statdx_shard1_replica1/”,
                “numDocs”:0,
                “status”:”active”,
                “uptime”:”0 days, 0 hours, 1 minutes, 8 seconds”,
                “memory”:”90.3 MB (%18.4) of 490.7 MB”,
                “leader”:true
            },
            {
                “name”:”core_node2″,
                “url”:”http://192.168.56.15:8983/solr/statdx_shard1_replica2/”,
                “numDocs”:0,
                “status”:”active”,
                “uptime”:”0 days, 0 hours, 2 minutes, 49 seconds”,
                “memory”:”70.7 MB (%14.4) of 490.7 MB”
            }
        ]
    }

#### AFTER ADDING THE DIRECTORY AND CORE.PROPERTIES TO THE 3RD VM, RUN HEALTHCHECK AGAIN AND SEE THE 3RD NODE

This should be “runnable” on any of the SOLR VMs assuming they’re hooked to Zookeeper.

    /opt/solr/bin/solr healthcheck -z 192.168.56.5,192.168.56.6,192.168.56.7/solr5_4 -c statdx

    {
        “collection”:”statdx”,
        “status”:”healthy”,
        “numDocs”:110738,
        “numShards”:1,
        “shards”:[{
        “shard”:”shard1″,
        “status”:”healthy”,
        “replicas”:[
            {
                “name”:”core_node1″,
                “url”:”http://192.168.56.16:8983/solr/statdx_shard1_replica1/”,
                “numDocs”:110738,
                “status”:”active”,
                “uptime”:”0 days, 0 hours, 40 minutes, 20 seconds”,
                “memory”:”196.3 MB (%40) of 490.7 MB”,
                “leader”:true
            },
            {
                “name”:”core_node2″,
                “url”:”http://192.168.56.15:8983/solr/statdx_shard1_replica2/”,
                “numDocs”:110738,
                “status”:”active”,
                “uptime”:”0 days, 0 hours, 42 minutes, 2 seconds”,
                “memory”:”157 MB (%32) of 490.7 MB”
            },
            {
                “name”:”core_node3″,
                “url”:”http://192.168.56.17:8983/solr/statdx_shard1_replica3/”,
                “numDocs”:110738,
                “status”:”active”,
                “uptime”:”0 days, 0 hours, 27 minutes, 54 seconds”,
                “memory”:”134.4 MB (%27.4) of 490.7 MB”
            }
        ]
    }

The way I see this, it’s good news.

SOLR and Zookeeper don’t appear to care how many replicas you said when you
built the collection originally. Bring another one in correctly and it will be added to
the list of replicas.

Now, if you screw Zookeeper up while doing it, heaven help you! We should maybe talk about
that part – re-setting Zookeeper, given how simple our environment is (and we can keep
it that way if we’re smart) won’t be too hard. There are a few command lines to understand
and you can start from scratch (or build a complete new set of VM’s and do the smoke and
mirrors trick with the load balancer.)

It’s the instructions for building the whole thing from scratch, but two Zookeeper commands are key
and Zoo and SOLR will play games with your mind if you get into an odd state so you have
to know that BOTH commands are necessary if you are “rebuilding” Zookeeper’s data about
the SOLR VMs

#### CORE.PROPERTIES FILE INFORMATION

This is what the core.properties looked like in my first “core”. Take out the comment lines if you want.
The original one was written automatically when I used the solr -create command to build
the collection with two replicas.

core.properties file:

    #Written by CorePropertiesLocator
    #Tue Mar 22 21:14:18 UTC 2016
    numShards=1
    name=statdx_shard1_replica1
    shard=shard1
    collection=statdx
    coreNodeName=core_node1

This is what I changed it to for my third solr instance (I had two already)

It should be noted that the name of the core directory and the “name” and “coreNodeName”
inside the core.properties file are all completely arbitrary. I just followed what was created by SOLR and that seemed reasonable. We can change it to anything else we want.

core.properties file:

    #Written by CorePropertiesLocator
    #Tue Mar 22 21:14:18 UTC 2016
    numShards=1
    name=statdx_shard1_replica3
    shard=shard1
    collection=statdx
    coreNodeName=core_node3

---

### johnb
*March 23, 2016 at 9:00 pm*

I should have added that at step 7 (restart solr) the collections should show up correctly as “new” nodes in the SOLR Admin UI as well. They do get a copy of the entire collection so it can take a few minutes for them to be totally “up and available”.

In other words, if the appropriate directory is there with ONLY a correctly-made core.properties file, SOLR will read that file and recognize that this is another “node” or “replicant” of the collection mentioned in the file. Solr and Zookeeper *should* do all the rest, including sending all the data over to the new nodes from one of the old ones.

Good luck!

---

### manohar
*March 24, 2016 at 5:49 am*

Thank you sir, this is my mail id: manu.cmh@gmail.com

---

### johnb
*March 24, 2016 at 8:02 pm*

In summary, if you have properly set up SOLR in “cloud” mode and have a Zookeeper instance set up and ready to go (but with nothing for Solr in it yet) the following commands will get you set up and running with a “one shard” setup and as many replicas as you want.

(All the machines you want as replicas MUST be running and have Solr started.)

Remember, this is for a bare Zookeeper situation – where Zookeeper currently knows nothing about your “new” collection. If it does and you want to start from scratch, you’ll have to use the zkCli.sh tool on the Zookeeper server to rmr the “directory” that holds your solr stuff… Or, if you put it all in on the root, you’ll have to rmr each one, which is just one of the reasons why I keep pounding home the idea of a chroot for Solr.

Get the configs into Zookeeper and set up the “directory” in Zookeeper

    sudo /opt/solr/server/scripts/cloud-scripts/zkcli.sh -cmd upconfig -confdir /home/john/conf/ -confname collectionName -z 192.168.56.5/solr5_4

(the “chroot” after the zookeeper IP address is so your Solr data is not mixed in with anything else you may have in Zookeeper. Trust me, it’s worth doing!)

Then go check Zookeeper and ensure that there is a /solr5_4/config/collectionName “directory structure”

Now issue this on one of the machines that has SOLR running in cloud mode:

    su – solr -c “/opt/solr/bin/solr create -c collectionName -n collectionName -shards 1 -replicationFactor 3”

What this does is run the command as superuser, but with the “solr” user that gets made when you run the install script for Solr on Linux.

The -n makes use of the configs you just sent up to Zookeeper.

The “3” here is because I wanted 3 machines with replicas of my SOLR data. All 3 machines were up and running with SOLR also started in cloud mode. (There are configs for Solr and if they’re not right this won’t work. solr.in.sh needs the ZKHOST set up right and then solr restarted.)

This should cause the “correct” stuff to be built on all three machines (or however many you set up)

Now, run this command on any of the 3 boxes just set up:

    /opt/solr/bin/solr healthcheck -z 192.168.56.5,192.168.56.6,192.168.56.7/solr5_4 -c collectionName

(You’ll have to replace your zookeeper IP’s, naturally.)

You should get something like this — which shows that they were all set up correctly.

    {
        “collection”:”collectionName”,
        “status”:”healthy”,
        “numDocs”:0,
        “numShards”:1,
        “shards”:[{
        “shard”:”shard1″,
        “status”:”healthy”,
        “replicas”:[
            {
                “name”:”core_node1″,
                “url”:”http://192.168.56.15:8983/solr/statdx_shard1_replica3/”,
                “numDocs”:0,
                “status”:”active”,
                “uptime”:”0 days, 0 hours, 1 minutes, 3 seconds”,
                “memory”:”51.6 MB (%10.5) of 490.7 MB”
            },
            {
                “name”:”core_node2″,
                “url”:”http://192.168.56.16:8983/solr/statdx_shard1_replica1/”,
                “numDocs”:0,
                “status”:”active”,
                “uptime”:”0 days, 0 hours, 1 minutes, 3 seconds”,
                “memory”:”39.2 MB (%8) of 490.7 MB”,
                “leader”:true
            },
            {
                “name”:”core_node3″,
                “url”:”http://192.168.56.17:8983/solr/statdx_shard1_replica2/”,
                “numDocs”:0,
                “status”:”active”,
                “uptime”:”0 days, 0 hours, 0 minutes, 52 seconds”,
                “memory”:”29.1 MB (%5.9) of 490.7 MB”
            }
        ]
    }

Now, you can go check that the directories have been created where they should be… On Linux it’s /var/solr/data/collectionName_shard1_replicaX

Look at the core.properties file inside that directory to familiarize yourself with what it looks like.

Now, point whatever tool you’re using to load data into Solr at ANY of the 3 Solr servers using the correct IP:Port and load your data in…

It might not hurt to restart SOLR before doing this last step… I don’t believe that’s absolutely necessary, but it’s clear to me that some stuff only comes in from Zookeeper at startup.

Good luck!


---

### manohar
*May 25, 2016 at 8:23 am*

Hi Sir,

I setup solr cloud with zookeeper and i can able to import data from sql server to my solr clouds.Is there any way to import data parallelly into solr clouds from SQL server.
I know importing data from any node ,after that zookeeper automatically distribute data to other nodes equally but it is taking too much time for importing data.
Is there any way to import data from different nodes simultaneously.
Let’s say, i have 2 collections like A, B with with 3 shards and 2 replicas in 5 nodes like 127.0.0.1,127.0.0.2,127.0.0.3,127.0.0.4,127.0.0.5.
now i have 10GB data in SQL server. If i import data from any one node it is taking almost 2 hours time.
so , i need to import data from different nodes parallelly .so that i can take less time.
lets say i want to import data from

    1270.0.1:8983/solr/A_shard1_replica1/dataimport//dataimport # 3.3gb in 40 mins
    1270.0.2:8983/solr/A_shard2_replica1/dataimport//dataimport # 3.3gb
    1270.0.3:8983/solr/A_shard3_replica2/dataimport//dataimport # 3.3gb

so that i can reduce import time from 2hrs to 40 mins.

is it possible in solr cloud,if it possible how can i do?

Thanks in advance.

---

### johnb
*May 26, 2016 at 4:00 pm*

It’s possible that Solr Cloud is already parsing out the indexing work between the various nodes so that your two hour timeframe is actually the best your “cloud” can do because all the nodes are involved in indexing the incoming documents — even if you are pointed at only one if them with your code or the import tool...

I’m not sure because I haven’t had to worry about that. I would strongly recommend asking the support mailing list by signing up here: solr-user-subscribe@lucene.apache.org.

You could check by trying the import and watching the log file(s) for the nodes and seeing if they’re all working on indexing or only one is working on indexing. The log entries should make it clear whether any particular node is indexing…

If it is NOT the case that your two hours is the best that you can get and in fact only one node is indexing the incoming data, then you could probably use SolrJ (the API) and have 3 threads or three separate java processes each handling 1/3 of the data in some way and each pointing at a different Solr node. This will require multi-threading your code or, as I say, having 3 separate Java processes running at once (easier since you don’t have to worry about concurrency etc…)

If your Solr nodes can get to your SQL database (in terms of networking) you could put a Java process on each SOLR box and have it go after a clearly-defined subsection of the data and put that data into the SOLR node on that box.

Again – I’m not sure how SOLR cloud handles this, so I’d verify what’s going on in your 2 hour scenario before I started writing code — since if Solr Cloud is already splitting up the work, your efforts would be wasted.

Here is the page URL where I found the link to the mailing list and other helpful information: http://lucene.apache.org/solr/resources.html

A final suggestion – make sure you understand how long each part of your data loading process is taking. Don’t assume that SOLR is the biggest time sink until you’ve verified. How long does your SQL query take to return data by itself? Would there be value in putting all that data in a text file or some other form and then grabbing that data to pump into Solr?

My own data loading process takes far, far too long – but it’s mostly about the database work and turning those documents into solr docs. What I did to “solve” this is to write code that puts the resulting solr docs into a text file.

In this way, I only have to run the database query side of things once – and I can trigger it the night before I need it. The time it takes to pick up the text file and dump it into Solr is orders of magnitude shorter than if I ran the whole process every time.

It takes roughly an hour to query the database, turn the info into solr doc xml and put that into a text file. It takes less than 10 minutes to push the contents of the text file into Solr – which I do frequently because I’m still working on relevance and need to re-index frequently. Of course, my data is static and not changing – this scenario may not match yours...

Hope that helps...

---

### Tarikur Rahaman
*April 8, 2016 at 7:52 am*

Hi, I was able to create solrcloud with zookeeper. But I’m facing a problem. If i create a collection with 3 shard and 3 replication then all master shard show in same server (172.31.13.85). If i reboot this server then another server takeover this responsibility but still that server is serving standalone. Please see the picture to better understand.

!http://imgur.com/qD3OSh5

---

### Prashant
*April 22, 2016 at 8:23 am*

Facing issue after installation. When I check
sudo service solr status
it shows only one node live. I check all three instances of solr 192.168.1.85, 192.168.1.120 and 192.168.1.113 all are live but in log it shows error like

    java.net.ConnectException: Connection refused
    at sun.nio.ch.SocketChannelImpl.checkConnect(Native Method)
    at sun.nio.ch.SocketChannelImpl.finishConnect(SocketChannelImpl.java:744)
    at org.apache.zookeeper.ClientCnxnSocketNIO.doTransport(ClientCnxnSocketNIO.java:361)
    at org.apache.zookeeper.ClientCnxn$SendThread.run(ClientCnxn.java:1081)

I am trying to configured it on three different machines using static ip address in LAN. I added following lines in zoo.cfg

    server.1=192.168.1.85:2888:3888
    server.2=192.168.1.100:2888:3888
    server.3=192.168.1.120:2888:3888

---

### johnb
*April 22, 2016 at 4:35 pm*

Is that the SOLR log or the Zookeeper log? Connection refused strongly suggests that ports or IP addresses are not open in your networking setup. Can you ping the IP addresses from SOLR to Zookeeper and from Solr to Solr machines? Can you telnet the ports in the same way?

---

### manohar
*May 25, 2016 at 8:25 am*

Hi Sir,

I setup solr cloud with zookeeper and i can able to import data from sql server to my solr clouds.Is there any way to import data parallelly into solr clouds from SQL server.
I know importing data from any node ,after that zookeeper automatically distribute data to other nodes equally but it is taking too much time for importing data.
Is there any way to import data from different nodes simultaneously.
Let's say, i have 2 collections like A, B with with 3 shards and 2 replicas in 5 nodes like 127.0.0.1,127.0.0.2,127.0.0.3,127.0.0.4,127.0.0.5.
now i have 10GB data in SQL server. If i import data from any one node it is taking almost 2 hours time.
so , i need to import data from different nodes parallelly .so that i can take less time.
lets say i want to import data from

1270.0.1:8983/solr/A_shard1_replica1/dataimport//dataimport # 3.3gb in 40 mins
1270.0.2:8983/solr/A_shard2_replica1/dataimport//dataimport # 3.3gb
1270.0.3:8983/solr/A_shard3_replica2/dataimport//dataimport # 3.3gb

so that i can reduce import time from 2hrs to 40 mins.

is it possible in solr cloud,if it possible how can i do?

Thanks in advance.

---

### johnb
*May 27, 2016 at 4:18 pm*

My first thought is to ask whether all your machines can ping the URL of all the other machines?

---

### shivendra
*May 25, 2016 at 10:54 am*

Hi,

I have configured- 2 Solr nodes and 1 ZK node created collections and shards also getting data from SQL server but i need to call SolrCloud in asp.net application for load balance.

How it will configure and what i need to configure it please help anyone.

Thanks! in advance

---

### johnb
*May 27, 2016 at 4:16 pm*

I’m all Java and Linux, so I’m afraid I can’t help you with calling Solr programatically from asp.net other than to say that Solr has an API which can be called via HTTP.

Take a look here: https://cwiki.apache.org/confluence/display/solr/Client+API+Lineup

There appears to be a link to a .net tool on that page.

Also, keep in mind that Solr has an REST-ful API that you can call be constructing an HTTP request. That might serve you also.

Hope that helps!

Finally – for in-depth Solr questions – sign up for the mailing list — I mentioned it in a comment above.

---

### Andy R
*May 27, 2016 at 4:28 pm*

From the link John provided, I’ve used SolrNet on a large project with success. The developer has moved the repo to:

https://github.com/mausch/SolrNet

---

### manohar
*July 18, 2016 at 7:01 am*

I’m using SOLR 5.4.1 to index pdf and other type of documents using the ExtractingRequestHandler. The indexing itself works fine but I don’t know how to get the page number and paragraph of a search result.

I would like to display the page number along with hits in a document, e.g. “term foo was found in bar.pdf on pages 2, 3 and 5.”

can you please tell me how to do it?

---

### johnb
*July 18, 2016 at 7:22 pm*

I’m not familiar with ExtractingRequestHandler, but in simple terms, the data you need has to be in the response from SOLR.

Then either you use the data from the response (in which case your code takes that and does whatever you tell it to.) or you write a query that takes advantage of the presence of that “field” in SOLR to produce a result set you want to see.

Since SOLR isn’t a SQL database and cross-referencing in a RDBMS-style way isn’t what SOLR is designed to do, the page number will need to live on each and every “document” in SOLR – at least that’s the simplest way to do it from my perspective.

I don’t know if the tool you’re using does that (it seems that it might… it’s a kind of logical thing lots of people might want to see…) So I’d try a straight request for some documents out of SOLR in the Admin console and see if you can find anything in each document that represents the page number of the original PDF document.

If there is a field that shows the page number from the original pdf, you have your starting point. If you do not find a field like that, you’ll have to do something to get it into SOLR — possibly by modifying the code for the tool you’re using…

Let me also suggest this: https://www.google.com/search?btnG=1&pws=0&q=ExtractingRequestHandler&gws_rd=ssl#pws=0&q=ExtractingRequestHandler+solr+5.4

There are a couple of interesting links there that may provide more information. Beyond that I can’t help much as I haven’t used the tool myself.

---

### johnb
*July 18, 2016 at 7:24 pm*

Oh, and of course, the best place to go for advice is the solr user mailing list you’ll find on this page: http://lucene.apache.org/solr/resources.html#community

---

### veerk
*September 1, 2016 at 7:40 pm*

Hi,
We have hosted solr on two nodes – server1:8983 and server2:8983 with zk running on both – server1:2181 and server2:2181.
I am trying to update the config change that we did in schema.xml by using following reload APIs but they doesnt seem to be working as i am receiving – “Error creating collection node in Zookeeper” . Can you please help me with this? I am basically trying to avoid restarting solr everytime we make a config change.

http://server1:8983/solr/admin/cores?action=RELOAD&core=coreX
http://server2:8983/solr/admin/cores?action=RELOAD&core=coreX

Also, i have tried using collection RELOAD api:
http://server:8983/solr/admin/collections?action=RELOAD&name=collectionX

Thanks in advance!!

---

### veerk
September 1, 2016 at 7:42 pm*
BTW, we are using solr 5.3.1 and zk 3.4.6

---

### johnb
*September 7, 2016 at 6:11 pm*

the best place to go for advice is the solr user mailing list you'll find on this page: http://lucene.apache.org/solr/resources.html#community.

I recommend that you take the time to put all the details (exact command line used, any output, etc…) so that the people on the list can get enough info to help you.

---

### johnb
*September 7, 2016 at 6:13 pm*

Oh, and to the best of my knowledge, there is NO way to avoid restarting SOLR after a config change. But I don’t know everything.

---