<?php

namespace Database\Seeders;

use App\Models\Question;
use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $questionsData = [
            // DBMS
            [
                'subject_slug' => 'database-management-systems-dbms',
                'topic_slug' => 'database-indexing-b-trees-hash-index',
                'question_text' => 'Why are B+ Trees predominantly preferred over B-Trees for database index structures stored on disk?',
                'code_snippet' => null,
                'options' => [
                    'A' => 'B+ Trees have fewer levels and all actual record pointers are stored only at leaf nodes, enabling fast sequential range scans via linked leaves.',
                    'B' => 'B+ Trees do not require node splitting or balancing during inserts.',
                    'C' => 'B-Trees cannot store composite multi-column keys.',
                    'D' => 'B+ Trees have O(1) worst-case time complexity.',
                ],
                'correct_option' => 'A',
                'explanation' => 'In a B+ Tree, non-leaf nodes only hold keys and child pointers, maximizing the fan-out factor. All actual data pointers reside at the leaf nodes, which are linked as a doubly-linked list, making range queries and sequential scans extremely efficient compared to B-Trees.',
                'difficulty' => 'hard',
                'source' => 'gemini_generated',
            ],
            [
                'subject_slug' => 'database-management-systems-dbms',
                'topic_slug' => 'transactions-acid-properties-concurrency',
                'question_text' => 'In database transaction management, which ACID property guarantees that changes made by a committed transaction survive even system crashes?',
                'code_snippet' => null,
                'options' => [
                    'A' => 'Atomicity',
                    'B' => 'Consistency',
                    'C' => 'Isolation',
                    'D' => 'Durability',
                ],
                'correct_option' => 'D',
                'explanation' => 'Durability guarantees that once a transaction has been committed, its updates survive permanently in non-volatile storage (via Write-Ahead Logging / WAL) even in the event of a system crash or power outage.',
                'difficulty' => 'easy',
                'source' => 'gemini_generated',
            ],
            [
                'subject_slug' => 'database-management-systems-dbms',
                'topic_slug' => 'normalization-1nf-to-bcnf-dependencies',
                'question_text' => 'A relational table is in Third Normal Form (3NF) if and only if it is in 2NF and:',
                'code_snippet' => null,
                'options' => [
                    'A' => 'There are no partial functional dependencies on candidate keys.',
                    'B' => 'There are no transitive dependencies of non-prime attributes on candidate keys.',
                    'C' => 'Every determinant is a superkey.',
                    'D' => 'There are no multi-valued dependencies.',
                ],
                'correct_option' => 'B',
                'explanation' => 'A table is in 3NF if it satisfies 2NF and contains no transitive functional dependencies (i.e. non-prime attributes must not depend on other non-prime attributes). Every determinant being a superkey is the definition of Boyce-Codd Normal Form (BCNF).',
                'difficulty' => 'medium',
                'source' => 'gemini_generated',
            ],

            // Data Structures & Algorithms
            [
                'subject_slug' => 'data-structures-algorithms',
                'topic_slug' => 'asymptotic-analysis-big-o-notation',
                'question_text' => 'What is the worst-case time complexity of searching for an element in an unbalanced Binary Search Tree (BST) with N nodes?',
                'code_snippet' => null,
                'options' => [
                    'A' => 'O(1)',
                    'B' => 'O(log N)',
                    'C' => 'O(N)',
                    'D' => 'O(N log N)',
                ],
                'correct_option' => 'C',
                'explanation' => 'In the worst case (e.g. elements inserted in sorted order), an unbalanced BST degenerates into a linear linked list (skewed tree), causing search time complexity to degrade to O(N). Balanced trees like AVL or Red-Black trees guarantee O(log N).',
                'difficulty' => 'medium',
                'source' => 'gemini_generated',
            ],
            [
                'subject_slug' => 'data-structures-algorithms',
                'topic_slug' => 'graph-algorithms-bfs-dfs-dijkstra',
                'question_text' => 'Which statement is true regarding Dijkstra\'s algorithm for finding the shortest path in a weighted graph?',
                'code_snippet' => null,
                'options' => [
                    'A' => 'It works correctly even when edges have negative weights.',
                    'B' => 'It operates using a Greedy strategy and requires all edge weights to be non-negative.',
                    'C' => 'It uses a FIFO queue with O(V + E) time complexity.',
                    'D' => 'It can only be applied to Directed Acyclic Graphs (DAGs).',
                ],
                'correct_option' => 'B',
                'explanation' => 'Dijkstra\'s algorithm uses a greedy approach with a priority queue/min-heap. It assumes edge weights are non-negative; if negative edges exist, the Bellman-Ford algorithm must be used instead.',
                'difficulty' => 'medium',
                'source' => 'gemini_generated',
            ],
            [
                'subject_slug' => 'data-structures-algorithms',
                'topic_slug' => 'stacks-queues',
                'question_text' => 'What will be the output of the following pseudocode utilizing a Stack data structure?',
                'code_snippet' => "stack.push(10);\nstack.push(20);\nstack.push(30);\nx = stack.pop();\nstack.push(40);\ny = stack.pop();\nprint(x + y);",
                'options' => [
                    'A' => '50',
                    'B' => '70',
                    'C' => '60',
                    'D' => '40',
                ],
                'correct_option' => 'B',
                'explanation' => 'Initially stack has [10, 20, 30]. First pop retrieves 30 (x = 30). Then 40 is pushed, so stack has [10, 20, 40]. Second pop retrieves 40 (y = 40). Output: 30 + 40 = 70.',
                'difficulty' => 'easy',
                'source' => 'gemini_generated',
            ],

            // Operating Systems
            [
                'subject_slug' => 'operating-systems-linux',
                'topic_slug' => 'deadlocks-bankers-algorithm',
                'question_text' => 'Which of the following is NOT one of the four Coffman conditions necessary for a system deadlock to occur?',
                'code_slug' => null,
                'options' => [
                    'A' => 'Mutual Exclusion',
                    'B' => 'Hold and Wait',
                    'C' => 'Preemption of resources',
                    'D' => 'Circular Wait',
                ],
                'correct_option' => 'C',
                'explanation' => 'The condition required for deadlock is "No Preemption" (resources cannot be forcibly taken away from a holding process). The four Coffman conditions are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.',
                'difficulty' => 'easy',
                'source' => 'gemini_generated',
            ],
            [
                'subject_slug' => 'operating-systems-linux',
                'topic_slug' => 'memory-management-paging-virtual-memory',
                'question_text' => 'What causes the phenomenon known as "Thrashing" in an operating system?',
                'code_snippet' => null,
                'options' => [
                    'A' => 'Multiple processes deadlocking each other for disk I/O.',
                    'B' => 'A process spending significantly more time paging memory blocks in and out of swap space than executing instructions.',
                    'C' => 'A severe cache miss penalty in L1 and L2 cache.',
                    'D' => 'Memory leakage inside user space heaps.',
                ],
                'correct_option' => 'B',
                'explanation' => 'Thrashing happens when the total working set of active processes exceeds physical memory (RAM). The OS spends the vast majority of CPU cycles continually swapping pages between RAM and disk swap, causing CPU utilization and system responsiveness to plummet.',
                'difficulty' => 'medium',
                'source' => 'gemini_generated',
            ],
            [
                'subject_slug' => 'operating-systems-linux',
                'topic_slug' => 'linux-core-commands-shell-scripting',
                'question_text' => 'In Linux file permissions, what access level does the numeric mode octal 754 represent for Owner, Group, and Others respectively?',
                'code_snippet' => null,
                'options' => [
                    'A' => 'Owner: rwx, Group: r-x, Others: r--',
                    'B' => 'Owner: rwx, Group: rw-, Others: r-x',
                    'C' => 'Owner: r-x, Group: rwx, Others: --x',
                    'D' => 'Owner: rw-, Group: r--, Others: rwx',
                ],
                'correct_option' => 'A',
                'explanation' => '7 = 4(r) + 2(w) + 1(x) = rwx. 5 = 4(r) + 1(x) = r-x. 4 = 4(r) = r--. Hence 754 corresponds to Owner: rwx, Group: r-x, Others: r--.',
                'difficulty' => 'easy',
                'source' => 'gemini_generated',
            ],

            // Computer Networks
            [
                'subject_slug' => 'computer-networks-security',
                'topic_slug' => 'osi-7-layers-tcp-ip-protocol-suite',
                'question_text' => 'At which layer of the OSI reference model do routers primarily make path forwarding decisions based on logical IP addresses?',
                'code_snippet' => null,
                'options' => [
                    'A' => 'Data Link Layer (Layer 2)',
                    'B' => 'Network Layer (Layer 3)',
                    'C' => 'Transport Layer (Layer 4)',
                    'D' => 'Session Layer (Layer 5)',
                ],
                'correct_option' => 'B',
                'explanation' => 'The Network Layer (Layer 3) is responsible for packet forwarding, routing, and logical addressing (IP addresses). Switches operate at Layer 2 (MAC addresses), and repeaters/hubs operate at Layer 1.',
                'difficulty' => 'easy',
                'source' => 'gemini_generated',
            ],
            [
                'subject_slug' => 'computer-networks-security',
                'topic_slug' => 'ip-addressing-cidr-subnet-calculation',
                'question_text' => 'For the subnet prefix 192.168.10.0/27, what is the maximum number of usable host IP addresses available for devices?',
                'code_snippet' => null,
                'options' => [
                    'A' => '32',
                    'B' => '30',
                    'C' => '62',
                    'D' => '14',
                ],
                'correct_option' => 'B',
                'explanation' => 'With a /27 subnet mask, 32 - 27 = 5 host bits are available. Total IP addresses = 2^5 = 32. Subtracting 2 reserved addresses (Network ID 192.168.10.0 and Broadcast ID 192.168.10.31) gives 32 - 2 = 30 usable host IP addresses.',
                'difficulty' => 'medium',
                'source' => 'gemini_generated',
            ],

            // Software Engineering & OOP
            [
                'subject_slug' => 'software-engineering-oop',
                'topic_slug' => 'solid-design-principles',
                'question_text' => 'Which SOLID design principle states that "High-level modules should not depend on low-level modules; both should depend on abstractions"?',
                'code_snippet' => null,
                'options' => [
                    'A' => 'Single Responsibility Principle (SRP)',
                    'B' => 'Open-Closed Principle (OCP)',
                    'C' => 'Liskov Substitution Principle (LSP)',
                    'D' => 'Dependency Inversion Principle (DIP)',
                ],
                'correct_option' => 'D',
                'explanation' => 'The Dependency Inversion Principle (D in SOLID) states that high-level modules should depend on interfaces/abstractions rather than concrete low-level implementations, enabling loose coupling and testability.',
                'difficulty' => 'medium',
                'source' => 'gemini_generated',
            ],

            // Web Technologies & System Design
            [
                'subject_slug' => 'web-technologies-system-design',
                'topic_slug' => 'restful-api-architecture-http-status-codes',
                'question_text' => 'Which of the following HTTP request methods is defined by RFC 7231 as being both SAFE and IDEMPOTENT?',
                'code_snippet' => null,
                'options' => [
                    'A' => 'POST',
                    'B' => 'GET',
                    'C' => 'PATCH',
                    'D' => 'DELETE',
                ],
                'correct_option' => 'B',
                'explanation' => 'GET and HEAD are both safe (do not modify server state) and idempotent (making multiple identical requests produces the exact same outcome). PUT and DELETE are idempotent but not safe. POST is neither safe nor idempotent.',
                'difficulty' => 'medium',
                'source' => 'gemini_generated',
            ],
        ];

        foreach ($questionsData as $q) {
            $subject = Subject::where('slug', $q['subject_slug'])->first();
            $topic = Topic::where('slug', $q['topic_slug'])->first();

            if (! $subject) {
                continue;
            }

            Question::firstOrCreate(
                [
                    'subject_id' => $subject->id,
                    'question_text' => $q['question_text'],
                ],
                [
                    'topic_id' => $topic?->id,
                    'code_snippet' => $q['code_snippet'] ?? null,
                    'options' => $q['options'],
                    'correct_option' => $q['correct_option'],
                    'explanation' => $q['explanation'],
                    'difficulty' => $q['difficulty'],
                    'source' => $q['source'],
                ]
            );
        }
    }
}
