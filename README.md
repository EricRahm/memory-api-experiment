WebExtension memory experimental API
====================================

This project contains the implementation of the Firefox `brwoser.memory` API.

h2. API

h3. memory.getInfo()

Returns a promise that will resolve to an object containing memory details for
each process. Each process is identified by it's PID, except for the main
process which is labeled as "Parent." Currently only `rss` and `uss` are
supported.

```
{
  "Parent":
   {
     "uss": 1234,
     "rss": 4567
   },
   "67890":
   {
     "uss": 1234,
     "rss": 4567
   }
}
```


