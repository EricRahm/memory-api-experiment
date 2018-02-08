WebExtension memory experimental API
====================================

This project contains the implementation of the Firefox `brwoser.memory` API.

## API

### memory.getInfo()

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

### memory.onLowMemory

An event that is triggered when low memory is detected. This can be used to
proactively clear caches and attempt to reduce overall memory used by your
WebExtension. Examples:

```js
const callback = (data) => { console.log(`low memory: ${data}`); }

// register for the event
browser.memory.onLowMemory.addListener(callback);

// unregister from the event
browser.memory.onLowMemory.removeListener(callback);
```

## Testing

_Note:_ This was lifted from [the logins experiment](https://github.com/web-ext-experiments/logins), there might be a better way to do things.

1. From a mozilla-central source tree, create a symlink for
   [`test/test_ext_memory.js`](test/test_ext_memory.js) in the webextensions
   xpcshell directory with the command:

   ```sh
   ln -s (path/to/this/repo)/test/test_ext_memory.js toolkit/components/extensions/test/xpcshell
   ```

2. Add the following line to `toolkit/components/extensions/test/xpcshell/xpcshell.ini`:

   ```ini
   [test_ext_memory.js]
   ```

3. Re-build the test database
   (`./mach build` or your favorite more targetted variant)

4. Run the test:

   ```sh
   ./mach test toolkit/components/extensions/test/xpcshell/test_ext_memory.js
   ```
