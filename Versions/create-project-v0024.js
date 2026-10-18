const fs = require("fs");
const os = require("os");
const path = require("path");
const readline = require("readline");


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const CONFIG_FILE = path.join(__dirname, "config.json");

const config = loadConfig();

function loadConfig() {

  try {

      const config = JSON.parse(
          fs.readFileSync(CONFIG_FILE, "utf8")
      );

      if (!config.folders)
        throw new Error("folders absent");

      if (!config.files)
        throw new Error("files absent");

      if (!config.copies)
        throw new Error("copies absent");
      
      if (!config.favoritePaths)
        throw new Error("favoritePaths absent");

      return config;

  } catch (error) {

      console.log("❌", error.message);

      process.exit();

  }

}

function saveConfig() {

  fs.writeFileSync(
    CONFIG_FILE,
    JSON.stringify(config, null, 2)
  );

}

function showLocationMenu() {

  let menu = "\nOù voulez-vous créer votre projet ?\n\n";

  config.favoritePaths.forEach((favorite, index) => {

    menu += `${index + 1} - ${favorite.name}\n`;

  });

  menu += `${config.favoritePaths.length + 1} - Autre emplacement\n\n`;

  menu += "Votre choix : ";

  return menu;

}

function getProjectLocation(choice, callback) {

  if (choice === "3") {

    rl.question("Entrez le chemin : ", (projectLocation) => {

      callback(projectLocation);

    });

    return;
  }

  const favorite = config.favoritePaths[Number(choice) - 1];

  if (favorite.path === "desktop") {

    callback(path.join(os.homedir(), "Desktop"));

  } else if (favorite.path === "root") {

    callback(path.parse(process.cwd()).root);

  }

}

function askSaveLocation(projectLocation, callback) {

  rl.question(
    "Voulez-vous enregistrer ce chemin ? (O/N) : ",
    (answer) => {

      if (answer.toLowerCase().trim() === "o") {

        rl.question(
          "Nom de ce chemin : ",
          (name) => {

            config.favoritePaths.push({
              name: name,
              path: projectLocation
            });

            saveConfig();

            console.log(`✅ Le chemin "${name}" a été enregistré.`);

            callback();

          }
        );

      } else {

        callback();

      }

    }
  );

}

function isValidLocation(location) {

  return fs.existsSync(location);

}

function askProjectLocation() {

  rl.question(
    showLocationMenu(),
    (choice) => {

      getProjectLocation(choice, (projectLocation) => {

        if (isValidLocation(projectLocation)) {

          askSaveLocation(projectLocation, () => {

            askProjectName(projectLocation);
          
          });

        } else {

          console.log(`❌ Cet emplacement n'existe pas.`);
          rl.close();

        }
      });

    }
  );

}

function askProjectName(projectLocation) {

  rl.question("Nom du projet : ", (projectName) => {

    const projectPath = path.join(projectLocation, projectName);
  
    if (fs.existsSync(projectPath)) {
  
      console.log(`⚠️ Le dossier "${projectPath}" existe déjà.`);
  
      rl.question("Voulez-vous remplacer ? (O/N) : ", (answer) => {
  
        const response = answer.toLowerCase().trim();
  
        askReplaceProject(projectPath, projectName, response);
  
      });
      
      return;
    }

    createProject(projectPath, projectName);

    rl.close();
  
  });

}

function askReplaceProject(projectPath, projectName, response) {

  if (response === "o") {
  
    fs.rmSync(projectPath, { 
      recursive: true,
      force: true
    });

    console.log(`🗑️ Le dossier "${projectPath}" a été supprimé.`);

    createProject(projectPath, projectName);

    rl.close();

  } else {

    console.log(`❌ Création annulée.`);

    rl.close();

  }
  
}

function createProject(projectPath, projectName) {

  try {

    fs.mkdirSync(projectPath);

    console.log(`✅ Le dossier "${projectPath}" a été créé.`);

    config.folders.forEach((folder) => {

      createFolder(
        path.join(projectPath, folder),
        folder
      );

    });

    const htmlContent = fs
      .readFileSync("templates/index.html", "utf8")
      .replaceAll("{{PROJECT_NAME}}", projectName);

    fs.writeFileSync(`${projectPath}/index.html`, htmlContent);

    console.log(`✅ Le fichier "index.html" a été créé.`);

    config.files.forEach((file) => {

      createFile(
        file.template,
        path.join(projectPath, file.destination),
        file.name
      );

    });

    config.copies.forEach((file) => {

      copyFile(
        file.source,
        path.join(projectPath, file.destination),
        file.name
      );

    });

  } catch (error) {

    console.log("❌ Erreur :", error.message);

  }

}

function createFolder(folderPath, name) {

  fs.mkdirSync(folderPath);

  console.log(`✅ Le dossier "${name}" a été créé.`);

}

function createFile(templatePath, destinationPath, name) {

  const content = fs.readFileSync(templatePath, "utf8");

  fs.writeFileSync(destinationPath, content);

  console.log(`✅ Le fichier "${name}" a été créé.`);

}

function copyFile(sourcePath, destinationPath, name) {

  fs.copyFileSync(sourcePath, destinationPath);

  console.log(`✅ Le fichier "${name}" a été copié.`);

}

askProjectLocation();