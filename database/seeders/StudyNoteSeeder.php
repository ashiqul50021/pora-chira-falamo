<?php

namespace Database\Seeders;

use App\Models\StudyNote;
use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class StudyNoteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $notes = [
            [
                'subject_name' => 'Computer Networks',
                'topic_name' => 'OSI Model',
                'title' => 'OSI ৭-লেয়ার রেফারেন্স মডেল: প্রতিটি লেয়ারের বিস্তারিত কার্যপ্রণালী ও প্রটোকল',
                'summary' => 'কম্পিউটার নেটওয়ার্কের প্রাণকেন্দ্র OSI মডেলের ৭টি লেয়ার, তাদের প্রধান দায়িত্ব, ডাটা ইউনিট (PDU) এবং বিসিএস ও ব্যাংক আইটি পরীক্ষায় বারবার আসা প্রশ্নগুলোর শর্টকাট সামারি।',
                'read_time_minutes' => 7,
                'key_points' => [
                    '৭টি লেয়ার মনে রাখার টেকনিক: "All People Seem To Need Data Processing" (Application -> Physical)',
                    'PDU সমূহ: Data (L7-5) -> Segment (L4) -> Packet (L3) -> Frame (L2) -> Bits (L1)',
                    'সুইচ লেয়ার ২ এবং রাউটার লেয়ার ৩-এ কাজ করে',
                    'Transport Layer এন্ড-টু-এন্ড রিলায়েবল ডাটা ট্রান্সফারের নিশ্চয়তা দেয় (TCP/UDP)',
                ],
                'content' => '## ১. ভূমিকা (Introduction)
International Organization for Standardization (ISO) ১৯৮৪ সালে OSI (Open Systems Interconnection) রেফারেন্স মডেল তৈরি করে। এটি একটি ধারণাগত (conceptual) ফ্রেমওয়ার্ক যা বিভিন্ন ভেন্ডরের তৈরি নেটওয়ার্ক ডিভাইসের মধ্যে নির্বিঘ্নে যোগাযোগের নিয়ম তৈরি করে।

---

## ২. OSI মডেলের ৭টি লেয়ার (Top to Bottom)

### ৭. Application Layer (লেয়ার ৭)
* **দায়িত্ব:** ইউজার এবং নেটওয়ার্ক অ্যাপ্লিকেশনের সরাসরি ইন্টারফেস।
* **প্রটোকল:** HTTP, HTTPS, FTP, SMTP, DNS, DHCP, Telnet, SSH।
* **ডাটা ইউনিট (PDU):** Data / Message।

### ৬. Presentation Layer (লেয়ার ৬)
* **দায়িত্ব:** ডাটা ফরম্যাটিং (Encoding/Decoding), ডাটা কম্প্রেশন এবং ডাটা এনক্রিপশন/ডিক্রিপশন (SSL/TLS)।
* **ফরম্যাট:** ASCII, JPEG, MP3, MPEG ইত্যাদি।

### ৫. Session Layer (লেয়ার ৫)
* **দায়িত্ব:** দুটি ডিভাইসের মধ্যে সেশন স্থাপন (Establish), বজায় রাখা (Maintain) এবং সমাপ্ত (Terminate) করা। ডায়ালগ কন্ট্রোল ও চেকপয়েন্ট সিঙ্ক্রোনাইজেশন।

### ৪. Transport Layer (লেয়ার ৪)
* **দায়িত্ব:** এন্ড-টু-এন্ড সংযোগ, সেগমেন্টেশন এবং রি-অ্যাসেম্বলি, ফ্লো কন্ট্রোল ও এরর কন্ট্রোল।
* **প্রটোকল:** TCP (Connection-Oriented, Reliable) এবং UDP (Connectionless, Fast)।
* **PDU:** Segment।
* **অ্যাড্রেসিং:** Port Number (যেমন HTTP 80, HTTPS 443, DNS 53)।

### ৩. Network Layer (লেয়ার ৩)
* **দায়িত্ব:** লজিক্যাল অ্যাড্রেসিং (IP Address), বেস্ট পাথ সিলেকশন (Routing) এবং প্যাকেট ফ্র্যাগমেন্টেশন।
* **ডিভাইস:** Router, L3 Switch।
* **প্রটোকল:** IPv4, IPv6, ICMP, OSPF, BGP, ARP।
* **PDU:** Packet।

### ২. Data Link Layer (লেয়ার ২)
* **দায়িত্ব:** ফিজিক্যাল অ্যাড্রেসিং (MAC Address), ফ্রেম তৈরি (Framing), এরর ডিটেকশন (CRC)।
* **সাব-লেয়ার:** LLC (802.2) এবং MAC (802.3/802.11)।
* **ডিভাইস:** Switch, Bridge, NIC।
* **PDU:** Frame।

### ১. Physical Layer (লেয়ার ১)
* **দায়িত্ব:** কাঁচা বিট (Raw bits - 0 and 1) ট্রান্সমিশন, সিগন্যাল টাইপ (ভোল্টেজ, রেডিও তরঙ্গ, অপটিক্যাল লাইট)।
* **ডিভাইস:** Hub, Repeater, Cables, Connectors (RJ-45)।
* **PDU:** Bits।

---

## ৩. গুরুত্বপূর্ণ পরীক্ষার টিপস ও ট্রিকস
1. **TCP vs UDP:** TCP হলো Three-way Handshake (SYN, SYN-ACK, ACK) ভিত্তিক রিলায়েবল প্রটোকল, আর UDP লাইভ স্ট্রিমিং ও DNS-এ দ্রুতগতির জন্য ব্যবহৃত হয়।
2. **ARP (Address Resolution Protocol):** আইপি অ্যাড্রেস থেকে ম্যাক অ্যাড্রেস খুঁজে বের করে (লেয়ার ২/৩ সংযোগ)।',
            ],
            [
                'subject_name' => 'Data Structures & Algorithms',
                'topic_name' => 'Arrays vs Linked Lists',
                'title' => 'অ্যারে বনাম লিঙ্কড লিস্ট: মেমোরি লেআউট, অপারেশন ও টাইম কমপ্লেক্সিটি',
                'summary' => 'Array এবং Linked List-এর ফান্ডামেন্টাল পার্থক্য, মেমোরি অ্যালোকেশন (Static vs Dynamic), ক্যাশ লোকালিটি এবং ইনসার্শন/ডিলিশনে বিগ-ও টাইম কমপ্লেক্সিটির নিখুঁত তুলনা।',
                'read_time_minutes' => 6,
                'key_points' => [
                    'অ্যারে কন্টিনিউয়াস (Contiguous) মেমোরি ব্যবহার করে, লিঙ্কড লিস্ট র‍্যান্ডম নোড লিঙ্ক করে',
                    'অ্যারেতে র‍্যান্ডম অ্যাক্সেস O(1), লিঙ্কড লিস্টে সিকুয়েনশিয়াল অ্যাক্সেস O(n)',
                    'শুরুতে ইনসার্ট: অ্যারেতে O(n), লিঙ্কড লিস্টে O(1)',
                    'সিপিইউ ক্যাশ লোকালিটিতে অ্যারে সবসময় লিঙ্কড লিস্ট থেকে দ্রুত কাজ করে',
                ],
                'content' => '## ১. মূল তুলনা টেবিল (Big-O Comparison)

| অপারেশন (Operation) | Array (অ্যারে) | Singly Linked List | Doubly Linked List |
| :--- | :--- | :--- | :--- |
| **র‍্যান্ডম অ্যাক্সেস (Index Lookup)** | **O(1)** (ইনস্ট্যান্ট) | O(n) | O(n) |
| **শুরুতে ইনসার্ট (Insert at Head)** | O(n) (Shift করতে হয়) | **O(1)** | **O(1)** |
| **শেষে ইনসার্ট (Insert at Tail)** | O(1) (যদি স্পেস থাকে) | O(n) বা O(1)* | **O(1)** (tail pointer সহ) |
| **মাঝখানে ইনসার্ট (Insert Middle)** | O(n) | O(n) (সার্চিং সময়) | O(n) |
| **মেমোরি ওভারহেড** | শুধু এলিমেন্ট | প্রতি নোডে একটি পয়েন্টার (+4/8B) | প্রতি নোডে দুটি পয়েন্টার (+8/16B) |

---

## ২. মেমোরি আর্কিটেকচার (Memory Architecture)

### অ্যারে (Contiguous Memory):
অ্যারে ডিক্লেয়ার করলে মেমোরির একটি নির্দিষ্ট ব্লক পাশাপাশি বরাদ্দ হয়। এর প্রধান সুবিধা হলো **CPU Cache Locality**—সিপিইউ যখন একটি এলিমেন্ট রিড করে, তখন সংলগ্ন এলিমেন্টগুলোও ক্যাশে লোড হয়ে যায়। ফলে দ্রুত অ্যাক্সেস সম্ভব।

```c
// Array Random Access: O(1)
int arr[5] = {10, 20, 30, 40, 50};
int val = arr[3]; // সরাসরি Address = Base + (Index * Size)
```

### লিঙ্কড লিস্ট (Dynamic Heap Allocation):
লিঙ্কড লিস্টের প্রতিটি নোড মেমোরির যেকোনো প্রান্তে বিচ্ছিন্নভাবে থাকে এবং একটি নোড পরবর্তী নোডের মেমোরি অ্যাড্রেস ধরে রাখে।

```c
struct Node {
    int data;
    struct Node* next; // পয়েন্টার ওভারহেড
};
```

---

## ৩. কখন কোনটি ব্যবহার করবেন?
* যখন আপনি এলিমেন্টের সংখ্যা আগে থেকেই জানেন এবং প্রচুর **Search / Lookup** করতে হবে: **Array** ব্যবহার করুন।
* যখন ঘনঘন ডেটার আকার পরিবর্তন হয় এবং শুরু বা শেষে প্রচুর **Insert/Delete** প্রয়োজন: **Linked List** ব্যবহার করুন।',
            ],
            [
                'subject_name' => 'Computer Networks',
                'topic_name' => 'IP Addressing & Subnetting',
                'title' => 'আইপি সাবনেটিং ও সিআইডিআর (CIDR) ক্যালকুলেশনের সহজ শর্টকাট',
                'summary' => 'IPv4 অ্যাড্রেসিং ক্লাস, সাবনেট মাস্ক, নেটওয়ার্ক আইডি ও ব্রডকাস্ট আইডি নির্ণয় করার জাদুকরী নিয়ম—ব্যাংক ও বিসিএস পরীক্ষার জন্য অতি প্রয়োজনীয়।',
                'read_time_minutes' => 5,
                'key_points' => [
                    'IPv4 অ্যাড্রেস ৩২-বিট (৪টি অকটেট)',
                    'ক্লাসফুল রেঞ্জ: Class A (1-126), Class B (128-191), Class C (192-223)',
                    'লুপব্যাক অ্যাড্রেস: 127.0.0.1 (পরীক্ষার কমন প্রশ্ন)',
                    'একটি সাবনেটে ব্যবহারযোগ্য হোস্ট সংখ্যা = 2^(Host Bits) - 2',
                ],
                'content' => '## ১. IPv4 ক্লাসের সারসংক্ষেপ

* **Class A (1 to 126):** ডিফল্ট মাস্ক `255.0.0.0` (/8)। নেটওয়ার্ক বিট ৮টি, হোস্ট বিট ২৪টি।
* **Class B (128 to 191):** ডিফল্ট মাস্ক `255.255.0.0` (/16)। নেটওয়ার্ক বিট ১৬টি, হোস্ট বিট ১৬টি।
* **Class C (192 to 223):** ডিফল্ট মাস্ক `255.255.255.0` (/24)। নেটওয়ার্ক বিট ২৪টি, হোস্ট বিট ৮টি।
* **Class D (224 to 239):** মাল্টিকাস্টের জন্য সংরক্ষিত (কোনো সাবনেট মাস্ক নেই)।
* **Class E (240 to 255):** ভবিষ্যৎ গবেষণা ও পরীক্ষার জন্য সংরক্ষিত।

---

## ২. ম্যাজিক নাম্বার (Magic Number) পদ্ধতিতে সাবনেটিং শর্টকাট

ধরুন একটি আইপি দেওয়া আছে: `192.168.10.0/27`

1. **/27 এর সাবনেট মাস্ক বের করুন:**
   * মোট ৩২ বিটের মধ্যে ২৭ বিট নেটওয়ার্ক: `11111111.11111111.11111111.11100000`
   * ডেসিমালে: `255.255.255.224`

2. **ম্যাজিক নাম্বার বের করার নিয়ম:**
   * `256 - সাবনেট মাস্কের শেষ নন-জিরো মান`
   * `256 - 224 = 32` (ম্যাজিক নাম্বার = ৩২)

3. **সাবনেট ব্লকের শুরু:**
   * ব্লকগুলো ৩২ করে বাড়বে: 0, 32, 64, 96, 128, 160, 192, 224।
   * প্রথম সাবনেট: `192.168.10.0` থেকে `192.168.10.31`
   * নেটওয়ার্ক আইডি: `192.168.10.0`
   * ব্রডকাস্ট আইডি: `192.168.10.31`
   * ব্যবহারযোগ্য হোস্ট রেঞ্জ: `192.168.10.1` থেকে `192.168.10.30` (মোট ৩০টি হোস্ট)।',
            ],
            [
                'subject_name' => 'Data Structures & Algorithms',
                'topic_name' => 'Divide and Conquer & Sorting Algorithms',
                'title' => 'সর্টিং অ্যালগরিদম কমপ্লিট চিটশিট: Time & Space Complexity',
                'summary' => 'Quick Sort, Merge Sort, Heap Sort, Bubble Sort এবং Insertion Sort-এর Best, Average, Worst case টাইম ও স্পেস কমপ্লেক্সিটি এবং স্ট্যাবিলিটি।',
                'read_time_minutes' => 6,
                'key_points' => [
                    'Merge Sort সবসময় O(n log n), তবে O(n) অতিরিক্ত স্পেস লাগে',
                    'Quick Sort গড়ে O(n log n), তবে অলরেডি সর্টেড অ্যারেতে Worst Case O(n^2)',
                    'কম্প্যারিজন বেসড সর্টিংয়ের লোয়ার বাউন্ড ওমেগা O(n log n)',
                    'Stable সর্টিং: Merge Sort, Insertion Sort, Bubble Sort',
                ],
                'content' => '## ১. অ্যালগরিদম কমপ্লেক্সিটি সামারি টেবিল

| অ্যালগরিদম | Best Case | Average Case | Worst Case | Space Complexity | Stable? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Merge Sort** | O(n log n) | O(n log n) | O(n log n) | O(n) | **Yes** |
| **Quick Sort** | O(n log n) | O(n log n) | O(n^2) | O(log n) | **No** |
| **Heap Sort** | O(n log n) | O(n log n) | O(n log n) | O(1) ইন-প্লেস | **No** |
| **Insertion Sort** | **O(n)** | O(n^2) | O(n^2) | O(1) | **Yes** |
| **Selection Sort** | O(n^2) | O(n^2) | O(n^2) | O(1) | **No** |
| **Bubble Sort** | O(n) | O(n^2) | O(n^2) | O(1) | **Yes** |

---

## ২. গুরুত্বপূর্ণ ভাইভা ও পরীক্ষার প্রশ্নসমূহ
1. **ইন-প্লেস (In-Place) সর্টিং কি?**
   যে সর্টিং অ্যালগরিদম অ্যারের মূল মেমোরিতেই উপাদান সাজায় এবং কোনো উল্লেখযোগ্য অতিরিক্ত মেমোরি নেয় না (O(1) Auxiliary Space)। উদাহরণ: Quick Sort, Heap Sort, Bubble Sort।
2. **স্ট্যাবিলিটি (Stability) কি?**
   একই মানের একাধিক উপাদান থাকলে সর্টিংয়ের পর যদি তাদের আদি আপেক্ষিক ক্রম অপরিবর্তিত থাকে, তবে তাকে Stable সর্টিং বলে। উদাহরণ: দুটি ছাত্রের নম্বর ৮০ হলে যে আগে ছিল সর্ট করার পরও সে আগেই থাকবে।',
            ],
        ];

        foreach ($notes as $data) {
            $subject = Subject::where('name', $data['subject_name'])->first();
            $topic = null;
            if ($subject && ! empty($data['topic_name'])) {
                $topic = Topic::where('subject_id', $subject->id)
                    ->where('name', $data['topic_name'])
                    ->first();
            }

            if (! $subject) {
                $subject = Subject::firstOrCreate([
                    'name' => $data['subject_name'],
                    'slug' => Str::slug($data['subject_name']),
                ]);
            }

            if ($subject && empty($topic) && ! empty($data['topic_name'])) {
                $topic = Topic::firstOrCreate([
                    'subject_id' => $subject->id,
                    'name' => $data['topic_name'],
                    'slug' => Str::slug($data['topic_name']),
                ]);
            }

            StudyNote::firstOrCreate(
                ['slug' => Str::slug($data['title'])],
                [
                    'subject_id' => $subject->id,
                    'topic_id' => $topic?->id,
                    'title' => $data['title'],
                    'summary' => $data['summary'],
                    'content' => $data['content'],
                    'key_points' => $data['key_points'],
                    'read_time_minutes' => $data['read_time_minutes'],
                    'is_published' => true,
                    'views_count' => rand(15, 80),
                ]
            );
        }
    }
}
