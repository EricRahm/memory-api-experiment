"use strict"

ChromeUtils.import("resource://gre/modules/Memory.jsm");

class API extends ExtensionAPI {
  getAPI(context) {
    return {
      memory: {
	// Super basic, this gives back USS and RSS of each process.
	// Other interesting things to add:
	//   - Ghost windows
	//   - Available memory (chrome does this)
	//   - Capacity (I guess physical memory, chrome does this)
	//   - VSS
        async getInfo() {
          return Memory.summary();
        }
	// Other possible functions:
	//   - dump / process gc/cc logs
	//   - minimize memory
	//   - about memory reports
      }
    };
  }
}
