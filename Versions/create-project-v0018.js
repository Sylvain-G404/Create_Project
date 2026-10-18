const fs = require("fs");
const os = require("os");
const path = require("path");
const readline = require("readline");


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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

    createFolder(`${projectPath}/Style`, "Style");

    createFolder(`${projectPath}/JavaScript`, "JavaScript");

    createFolder(`${projectPath}/Data`, "Data");

    createFolder(`${projectPath}/Assets`, "Assets");

    createFolder(`${projectPath}/Assets/Image`, "Image");

    createFolder(`${projectPath}/Assets/Icons`, "Icons");

    createFolder(`${projectPath}/Assets/Favicon`, "Favicon");

    const htmlContent = fs
      .readFileSync("templates/index.html", "utf8")
      .replaceAll("{{PROJECT_NAME}}", projectName);

    fs.writeFileSync(`${projectPath}/index.html`, htmlContent);

    console.log(`✅ Le fichier "index.html" a été créé.`);

    createFile(
      "templates/style.css",
      `${projectPath}/Style/style.css`,
      "style.css"
    );

    createFile(
      "templates/main.js",
      `${projectPath}/JavaScript/main.js`,
      "main.js"
    );

    createFile(
        "templates/data.json",
        `${projectPath}/Data/data.json`,
        "data.json"
    );

    copyFile(
      "Favicon/Favicon.K.sf.png",
      `${projectPath}/Assets/Favicon/Favicon.K.sf.png`,
      "Favicon.K.sf.png"
    );

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