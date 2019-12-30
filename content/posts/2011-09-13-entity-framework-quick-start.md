---
title: Entity Framework quick start
date: 2011-09-13
published: true
tags: ['DotNet']
canonical_url: false
description: "Microsoft’s Entity Framework has been around a while, but with it’s latest incarnation it is really shaping up nicely. I’ve been enjoying the ‘code first’ approach in version 4.1 of the framework. This allows you start your application design from POCOs, allowing the framework to infer the database design for you."
---

Microsoft’s Entity Framework has been around a while, but with it’s latest incarnation it is really shaping up nicely. I’ve been enjoying the ‘code first’ approach in version 4.1 of the framework. This allows you start your application design from POCOs, allowing the framework to infer the database design for you. For example, take the following Member entity model:

    class Member
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }

The following class derives from the DbContext base class, and exposes our Member model:

    class EFDbContext : DbContext
    {
        public DbSet<Member> Members { get; set; }

        public EFDbContext()
        {
            Database.SetInitializer<EFDbContext>(new DbContextInitializer());
        }
    }

Note the **SetInitializer** call in the constructor. This allows us to seed the database with some data, using the following class:

    class DbContextInitializer : DropCreateDatabaseIfModelChanges<EFDbContext>
    {
        protected override void Seed(EFDbContext Context)
        {
            new List<Member>
            {
                new Member {
                    FirstName = "Andrew",
                    LastName = "Rowland"
                },
                new Member {
                    FirstName = "Roland",
                    LastName = "Browning"
                },
            }.ForEach(m => Context.Members.Add(m));

            base.Seed(Context);
        }
    }

Now we need a simple repository class, so we can query the database:

    class MemberRepository
    {
        private EFDbContext Context = new EFDbContext();

        public IQueryable<Member> Members
        {
            get { return Context.Members; }
        }
    }

Standard practice is to use an interface, and obtain this concrete class using an IOC container, but it will do for demonstration purposes.

Due to lazy loading, nothing would happen until we actually run a query. So finally, a console application to instantiate the repository, and display the data:

    class ConsoleApplication
    {
        static void Main(string[] args)
        {
            MemberRepository Repository = new MemberRepository();

            Repository.Members.ToList().ForEach(m => Console.WriteLine(String.Format("Member: {0} {1}", m.FirstName, m.LastName)));

            Console.ReadKey();
        }
    }

We can place all of the code into one console application. Install EF4.1, create a console application in Visual Studio 2010, paste in the class below. You may have to set the startup object in the project properties.

    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Data.Entity;

    namespace EFExample
    {
        class Member
        {
            public int Id { get; set; }
            public string FirstName { get; set; }
            public string LastName { get; set; }
        }

        class EFDbContext : DbContext
        {
            public DbSet<Member> Members { get; set; }

            public EFDbContext()
            {
                Database.SetInitializer<EFDbContext>(new DbContextInitializer());
            }
        }

        class DbContextInitializer : DropCreateDatabaseIfModelChanges<EFDbContext>
        {
            protected override void Seed(EFDbContext Context)
            {
                new List<Member>
                {
                    new Member {
                        FirstName = "Andrew",
                        LastName = "Rowland"
                    },
                    new Member {
                        FirstName = "Roland",
                        LastName = "Browning"
                    },
                }.ForEach(m => Context.Members.Add(m));

                base.Seed(Context);
            }
        }

        class MemberRepository
        {
            private EFDbContext Context = new EFDbContext();

            public IQueryable<Member> Members
            {
                get { return Context.Members; }
            }
        }

        class ConsoleApplication
        {
            static void Main(string[] args)
            {
                MemberRepository Repository = new MemberRepository();

                Repository.Members.ToList().ForEach(m => Console.WriteLine(String.Format("Member: {0} {1}", m.FirstName, m.LastName)));

                Console.ReadKey();
            }
        }
    }

Run the application, and the magic begins. If you have an instance of SQL Server Express running, a database with a single Members table will be created, populated with data, and the results displayed.

Bit of a quick post this one, so feel free to ask a question. I’m not certain I’ve added enough detail.