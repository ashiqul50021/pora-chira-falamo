<?php

namespace Database\Seeders;

use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subjectsWithTopics = [
            [
                'name' => 'Data Structures & Algorithms',
                'icon' => 'CodeBracketSquareIcon',
                'description' => 'Arrays, Linked Lists, Trees, Graphs, Sorting, Searching, and Asymptotic Analysis.',
                'topics' => [
                    'Asymptotic Analysis & Big-O Notation',
                    'Arrays & String Manipulation',
                    'Linked Lists & Pointers',
                    'Stacks & Queues',
                    'Binary Trees, BST & AVL Trees',
                    'Graph Algorithms (BFS, DFS, Dijkstra)',
                    'Sorting & Searching Algorithms',
                    'Dynamic Programming & Recursion',
                ],
            ],
            [
                'name' => 'Database Management Systems (DBMS)',
                'icon' => 'CircleStackIcon',
                'description' => 'Relational models, SQL queries, Indexing, Normalization, ACID transactions, and query optimization.',
                'topics' => [
                    'Relational Model & Complex SQL Queries',
                    'Database Indexing (B-Trees, Hash Index)',
                    'Normalization (1NF to BCNF) & Dependencies',
                    'Transactions, ACID Properties & Concurrency',
                    'Deadlocks & Locking Protocols',
                    'NoSQL Databases & Sharding Basics',
                ],
            ],
            [
                'name' => 'Operating Systems & Linux',
                'icon' => 'CpuChipIcon',
                'description' => 'Processes, Threads, CPU scheduling, Memory paging, Deadlocks, and Linux commands.',
                'topics' => [
                    'Processes, Threads & Inter-Process Communication',
                    'CPU Scheduling Algorithms',
                    'Deadlocks & Banker\'s Algorithm',
                    'Memory Management, Paging & Virtual Memory',
                    'File System Architecture & Disk Scheduling',
                    'Linux Core Commands & Shell Scripting',
                ],
            ],
            [
                'name' => 'Computer Networks & Security',
                'icon' => 'GlobeAltIcon',
                'description' => 'OSI & TCP/IP layers, IP Subnetting, Routing, Protocols (HTTP, DNS), and Cybersecurity.',
                'topics' => [
                    'OSI 7 Layers & TCP/IP Protocol Suite',
                    'IP Addressing, CIDR & Subnet Calculation',
                    'Transport Protocols (TCP vs UDP, Handshake)',
                    'Application Layer (HTTP/S, DNS, SMTP, FTP)',
                    'Network Security, Cryptography & SSL/TLS',
                    'Firewalls, Proxies & VPN Concepts',
                ],
            ],
            [
                'name' => 'Software Engineering & OOP',
                'icon' => 'Square3Stack3DIcon',
                'description' => 'Object-Oriented Programming, SOLID principles, Design Patterns, SDLC, and Git.',
                'topics' => [
                    'OOP Pillars (Encapsulation, Inheritance, Polymorphism)',
                    'SOLID Design Principles',
                    'Common Design Patterns (Singleton, Factory, Observer)',
                    'Software Development Life Cycle (SDLC) & Agile',
                    'Git, Version Control & Branching Workflows',
                    'Software Testing (Unit, Integration, System)',
                ],
            ],
            [
                'name' => 'Web Technologies & System Design',
                'icon' => 'ServerStackIcon',
                'description' => 'REST APIs, Microservices, Caching, Docker, Cloud basics, and High-Scale Architecture.',
                'topics' => [
                    'RESTful API Architecture & HTTP Status Codes',
                    'Authentication & Authorization (JWT, OAuth2, Sessions)',
                    'Caching Strategies (Redis, Memcached, CDN)',
                    'Docker, Containers & Cloud Fundamentals',
                    'System Design: Scalability, Load Balancing & Replication',
                ],
            ],
        ];

        foreach ($subjectsWithTopics as $subjectData) {
            $topics = $subjectData['topics'];
            unset($subjectData['topics']);

            $subjectData['slug'] = Str::slug($subjectData['name']);
            $subject = Subject::firstOrCreate(['slug' => $subjectData['slug']], $subjectData);

            foreach ($topics as $topicName) {
                Topic::firstOrCreate(
                    [
                        'subject_id' => $subject->id,
                        'slug' => Str::slug($topicName),
                    ],
                    [
                        'name' => $topicName,
                        'description' => "Core IT exam concepts for {$topicName}.",
                    ]
                );
            }
        }
    }
}
