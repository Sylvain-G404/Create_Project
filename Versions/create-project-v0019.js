const fs = require("fs");
const os = require("os");
const path = require("path");
const readline = require("readline");


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const folders = [
  "Style",
  "JavaScript",
  "Data",
  "Assets",
  "Assets/Image",
  "Assets/Icons",
  "Assets/Favicon"
];

const files = [
  {
    template: "templates/style.css",
    destination: "Style/style.css",
    name: "style.css"
  },
  {
    template: "templates/main.js",
    destination: "JavaScript/main.js",
    name: "main.js"
  },
  {
    template: "templates/data.json",
    destination: "Data/data.json",
    name: "data.json"
  }
];

const copies = [
  {
    source: "Favicon/Favicon.K.sf.png",
    destination: "Assets/Favicon/Favicon.K.sf.png",
    name: "Favicon.K.sf.png"
  }
];

function getProjectLocation(choice, callback) {

  if (choice === "1") {

    callback(`${os.homedir()}\\Desktop`);

  } else if (choice === "2") {

    callback("C:\\");

  } else if (choice === "3") {

    rl.question("Entrez le chemin : ", (projectLocation) => {

      callback(projectLocation);

    });

  }

}

function isValidLocation(location) {

  return fs.existsSync(location);

}

function askProjectLocation() {
  rl.question(
    "Où voulez-vous créer votre projet ?\n\n1 - Bureau\n2 - Racine du disque C:\n3 - Autre emplacement\n\nVotre choix : ",
    (choice) => {

      getProjectLocation(choice, (projectLocation) => {

        console.log(`Vous avez choisi : ${choice}`);
        console.log("Chemin reçu :", projectLocation);

        if (isValidLocation(projectLocation)) {

          askProjectName(projectLocation);

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

    const htmlContent = fs
      .readFileSync("templates/index.html", "utf8")
      .replaceAll("{{PROJECT_NAME}}", projectName);

    fs.writeFileSync(`${projectPath}/index.html`, htmlContent);

    console.log(`✅ Le fichier "index.html" a été créé.`);

    folders.forEach((folder) => {

      createFolder(
        path.join(projectPath, folder),
        folder
      );

    });

    files.forEach((file) => {

      createFile(
        file.template,
        path.join(projectPath, file.destination),
        file.name
      );

    });

    copies.forEach((file) => {

      copyFile(
        file.source,
        path.join(projectPath, file.destination),
        file.name
      );

    });

  } catch (error) {

    console.log("❌ Erreur création projet.");

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