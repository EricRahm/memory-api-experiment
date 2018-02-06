"use strict";

// This is just copied from the logins experiment hopefully it's good enough.

Cu.import("resource://gre/modules/AddonManager.jsm");
Cu.import("resource://gre/modules/Console.jsm");
Cu.import("resource://gre/modules/FileUtils.jsm");
Cu.import("resource://gre/modules/osfile.jsm");
Cu.import("resource://gre/modules/Services.jsm");

Cu.import("resource://testing-common/AddonTestUtils.jsm");
AddonTestUtils.createAppInfo("xpcshell@tests.mozilla.org", "XPCShell", "1");

function loadApiExtension() {
  notEqual(_TEST_FILE, undefined, "_TEST_FILE is set");
  let testFile = new FileUtils.File(_TEST_FILE);
  equal(testFile.isSymlink(), true, "_TEST_FILE is a symlink");
  testFile = new FileUtils.File(testFile.target);
  // testFile.target should be this file, so its parent is the test
  // directory and parent.parent is the top level for the api extension
  let apiExtensionDir = testFile.parent.parent;
  info(`mapped test file ${_TEST_FILE} to api extension directory ${apiExtensionDir.path}\n`);

  return AddonManager.installTemporaryAddon(apiExtensionDir);
}

add_task(function* test_getInfo() {
  // TODO(erahm): what does this even do?
  Services.prefs.setBoolPref("extensions.checkCompatibility.nightly", false);

  yield ExtensionTestUtils.startAddonManager();

  let apiExtension = yield loadApiExtension();

  // Background script used for the test extension.
  //
  // Adds a listener that proxies commands, for instance you can send:
  //    'getInfo.request'
  // and that will run the `memory.getInfo` command and responde with a
  //    'getInfo.done'
  // message including an error message or the results.
  //
  // Broadcasts a 'ready' message when loaded.
  function background() {
    browser.test.onMessage.addListener(function(msg, args) {
      let match = msg.match(/^(\w+)\.request$/);
      if (!match) {
        return;
      }
      let cmd = match[1];
      Promise.resolve().then(() => browser.memory[cmd](...args))
        .then(results => {
          browser.test.sendMessage(`${cmd}.done`, {results});
        }, err => {
          browser.test.sendMessage(`${cmd}.done`, {errmsg: err.message});
        });
    });
    browser.test.sendMessage("ready");
  }

  function run(ext, cmd, ...args) {
    let promise = ext.awaitMessage(`${cmd}.done`);
    ext.sendMessage(`${cmd}.request`, args);
    return promise;
  }

  // Create a temporary extension that uses the memory api.
  let privilegedExtension = ExtensionTestUtils.loadExtension({
    background,
    manifest: {
      permissions: ["experiments.memory"],
    },
  });

  yield privilegedExtension.startup();
  yield privilegedExtension.awaitMessage("ready");

  // Now we can actually invoke the extension api.
  let response = yield run(privilegedExtension, "getInfo");
  console.log(response);

  // We expect to get back an object similar to:
  // { "results": { "Parent": { "uss": 123, "rss": 123 } } }
  // Since this is just a test we don't expect child processes.
  let results = response["results"];
  equal(results.hasOwnProperty("Parent"), true);
  equal(results["Parent"].uss > 0, true);
  equal(results["Parent"].rss > 0, true);

  yield privilegedExtension.unload();
  apiExtension.uninstall();
});
