
// Windows temporarily needs this file, https://github.com/module-federation/vite/issues/68

    import {loadShare} from "@module-federation/runtime";
    const importMap = {
      
        "@apollo/client": async () => {
          let pkg = await import("__mf__virtual/todosApp__prebuild___mf_0_apollo_mf_1_client__prebuild__.js");
            return pkg;
        }
      ,
        "@tanstack/react-query": async () => {
          let pkg = await import("__mf__virtual/todosApp__prebuild___mf_0_tanstack_mf_1_react_mf_2_query__prebuild__.js");
            return pkg;
        }
      ,
        "react": async () => {
          let pkg = await import("__mf__virtual/todosApp__prebuild__react__prebuild__.js");
            return pkg;
        }
      ,
        "react-dom": async () => {
          let pkg = await import("__mf__virtual/todosApp__prebuild__react_mf_2_dom__prebuild__.js");
            return pkg;
        }
      
    }
      const usedShared = {
      
          "@apollo/client": {
            name: "@apollo/client",
            version: "4.0.9",
            scope: ["default"],
            loaded: false,
            from: "todosApp",
            async get () {
              if (false) {
                throw new Error(`Shared module '${"@apollo/client"}' must be provided by host`);
              }
              usedShared["@apollo/client"].loaded = true
              const {"@apollo/client": pkgDynamicImport} = importMap
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^4.0.9",
              
            }
          }
        ,
          "@tanstack/react-query": {
            name: "@tanstack/react-query",
            version: "5.90.7",
            scope: ["default"],
            loaded: false,
            from: "todosApp",
            async get () {
              if (false) {
                throw new Error(`Shared module '${"@tanstack/react-query"}' must be provided by host`);
              }
              usedShared["@tanstack/react-query"].loaded = true
              const {"@tanstack/react-query": pkgDynamicImport} = importMap
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^5.0.0",
              
            }
          }
        ,
          "react": {
            name: "react",
            version: "19.2.0",
            scope: ["default"],
            loaded: false,
            from: "todosApp",
            async get () {
              if (false) {
                throw new Error(`Shared module '${"react"}' must be provided by host`);
              }
              usedShared["react"].loaded = true
              const {"react": pkgDynamicImport} = importMap
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^19.0.0",
              
            }
          }
        ,
          "react-dom": {
            name: "react-dom",
            version: "19.2.0",
            scope: ["default"],
            loaded: false,
            from: "todosApp",
            async get () {
              if (false) {
                throw new Error(`Shared module '${"react-dom"}' must be provided by host`);
              }
              usedShared["react-dom"].loaded = true
              const {"react-dom": pkgDynamicImport} = importMap
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^19.0.0",
              
            }
          }
        
    }
      const usedRemotes = [
      ]
      export {
        usedShared,
        usedRemotes
      }
      