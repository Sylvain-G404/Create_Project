const fs = require("fs");
const os = require("os");
const path = require("path");
const readline = require("readline");


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const CONFIG_FILE = path.join(__dirname, "config.json");
const USER_DATA_FILE = path.join(__dirname, "data-user.json");

const config = loadConfig();
const userData = loadUserData();

function loadConfig() {

  try {

      const config = JSON.parse(
          fs.readFileSync(CONFIG_FILE, "utf8")
      );

      if (!config.questions)
        throw new Error("questions absent");

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

function loadUserData() {

  try {

      const userData = JSON.parse(
          fs.readFileSync(USER_DATA_FILE, "utf8")
      );
      
      if (!userData.favoritePaths)
        throw new Error("favoritePaths absent");

      return userData;

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

function saveUserData() {

  fs.writeFileSync(
      USER_DATA_FILE,
      JSON.stringify(userData, null, 2)
    );

}

function showLocationMenu() {

  let menu = "\nOù voulez-vous créer votre projet ?\n\n";

  config.favoritePaths.forEach((favorite, index) => {

    menu += `${index + 1} - ${favorite.name}\n`;

  });

  userData.favoritePaths.forEach((favorite, index) => {

    menu += `${config.favoritePaths.length + index + 1} - ${favorite.name}\n`;

  });

  menu += `${config.favoritePaths.length + userData.favoritePaths.length + 1} - Autre emplacement\n\n`;

  menu += "Votre choix : ";

  return menu;

}

function getProjectLocation(choice, callback) {

  const choiceNumber = Number(choice);

  const otherLocation =
    config.favoritePaths.length +
    userData.favoritePaths.length +
    1;


  if (choiceNumber === otherLocation) {

    rl.question(config.questions.customLocation, (projectLocation) => {

      callback(projectLocation);

    });

    return;
  }


  let favorite;

  if (choiceNumber <= config.favoritePaths.length) {

    favorite = config.favoritePaths[choiceNumber - 1];

  } else {

    favorite = userData.favoritePaths[
      choiceNumber - config.favoritePaths.length - 1
    ];

  }


  if (favorite.path === "desktop") {

    callback(path.join(os.homedir(), "Desktop"));

  } else if (favorite.path === "root") {

    callback(path.parse(process.cwd()).root);

  } else {

    callback(favorite.path);

  }

}


function askSaveLocation(projectLocation, callback) {

  if (isFavoritePathExist(projectLocation)) {

    console.log("⚠️ Ce chemin est déjà enregistré.");

    callback();

    return;

  }

  rl.question(config.questions.saveLocation,(answer) => {

      if (answer.toLowerCase().trim() === "o") {

        rl.question(config.questions.locationName,(name) => {

            if (isFavoriteNameExist(name)) {

              console.log("⚠️ Ce nom est déjà enregistré.");

              callback();

              return;

            }

            userData.favoritePaths.push({
              name: name,
              path: projectLocation
            });

            saveUserData();

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

function askProjectLocation() {

  rl.question(showLocationMenu(),(choice) => {

      if (!isValidChoice(choice)) {

        console.log("❌ Choix invalide.");

        rl.close();

        return;

      }

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

  rl.question(config.questions.projectName, (projectName) => {

    const projectPath = path.join(projectLocation, projectName);
  
    if (fs.existsSync(projectPath)) {
  
      console.log(`⚠️ Le dossier "${projectPath}" existe déjà.`);
  
      rl.question(config.questions.replaceProject, (answer) => {
  
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

function isValidChoice(choice) {

  const choiceNumber = Number(choice);

  return (
    Number.isInteger(choiceNumber) &&
    choiceNumber >= 1 &&
    choiceNumber <=
      config.favoritePaths.length +
      userData.favoritePaths.length +
      1
  );

}

function isValidLocation(location) {

  return fs.existsSync(location);

}

function isFavoritePathExist(projectLocation) {

  return userData.favoritePaths.some(
    (favorite) => favorite.path === projectLocation
  );

}

function isFavoriteNameExist(name) {

  return userData.favoritePaths.some(
    (favorite) => favorite.name === name
  );

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
      .readFileSync( path.join(__dirname, "Templates", "index.html"),"utf8")
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

  const content = fs.readFileSync(path.join(__dirname, templatePath), "utf8");

  fs.writeFileSync(destinationPath, content);

  console.log(`✅ Le fichier "${name}" a été créé.`);

}

function copyFile(sourcePath, destinationPath, name) {

  fs.copyFileSync(path.join(__dirname, sourcePath), destinationPath);

  console.log(`✅ Le fichier "${name}" a été copié.`);

}

askProjectLocation();