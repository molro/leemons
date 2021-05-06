const fs = require('fs-extra');
const path = require('path');
const vm = require('../config/vm');
const { loadFile } = require('../config/loadFiles');

async function loadServices(dir, vmFilter, env) {
  if (!(await fs.exists(dir))) {
    return {};
  }
  // Same code as loadFile
  return (
    fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((file) => file.isFile())
      // TODO: Find a better name for PServices
      .reduce(async (Pservices, file) => {
        // Wait until the services is resolved
        const services = await Pservices;
        const key = path.basename(file.name, path.extname(file.name));
        if (services[key]) {
          throw new Error(
            `${file.name} service already exists on ${dir}. (do not use same name in .js files and .json files)`
          );
        }
        let fileContent;
        const fileExt = path.extname(file.name);
        if (fileExt === '.json') {
          fileContent = await loadFile(path.resolve(dir, file.name));
          // Except when loading .js, it loads the file, but don't process anything else
        } else if (fileExt === '.js') {
          try {
            fileContent = vm(dir, vmFilter, env).runFile(path.resolve(dir, file.name));
          } catch (e) {
            throw new Error(`File can not be read: ${file}. ${e.message}`);
          }
        }
        if (fileContent) {
          return { ...services, [key]: fileContent };
        }
        return services;
      }, {})
  );
}

module.exports = loadServices;
