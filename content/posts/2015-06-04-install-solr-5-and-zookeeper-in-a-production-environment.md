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

Just to note, by default the Java heap size is 512M. This will more than likely need to be increased in a production environment. What this value will be will depend on your requirements, and is beyond the scope of this post. If you do need to amend this value, use an editor such as Vi to edit the following file:

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

Whilst editing this file, change the data directory:

    dataDir=/var/lib/zookeeper/data

Each server requires a context file called ‘myid’. This is used to identify it.

    sudo mkdir /var/lib/zookeeper
    sudo mkdir /var/lib/zookeeper/data
    sudo touch /var/lib/zookeeper/data/myid

Edit each myid file and add the appropriate number for each server. For example, for three servers this will be 1, 2 or 3.

Now start up each ZooKeeper server:

    sudo /opt/zookeeper/bin/zkServer.sh start

We need to return to Solr, to configure the Zookeeper hosts. Edit the solr.xml file::

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

I also amended the path to the bin directory. Locate and edit the following in the script:

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