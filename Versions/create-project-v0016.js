const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function createProject(projectName) {
  try {
    fs.mkdirSync(projectName);

    console.log(`✅ Le dossier "${projectName}" a été créé.`);

    createFolder(`${projectName}/Style`, "Style");

    createFolder(`${projectName}/JavaScript`, "JavaScript");

    createFolder(`${projectName}/Data`, "Data");

    createFolder(`${projectName}/Assets`, "Assets");

    createFolder(`${projectName}/Assets/Image`, "Image");

    createFolder(`${projectName}/Assets/Icons`, "Icons");

    createFolder(`${projectName}/Assets/Favicon`, "Favicon");

    const htmlContent = fs
      .readFileSync("templates/index.html", "utf8")
      .replaceAll("{{PROJECT_NAME}}", projectName);

    fs.writeFileSync(`${projectName}/index.html`, htmlContent);

    console.log(`✅ Le fichier "index.html" a été créé.`);

    createFile(
      "templates/style.css",
      `${projectName}/Style/style.css`,
      "style.css"
    );

    createFile(
      "templates/main.js",
      `${projectName}/JavaScript/main.js`,
      "main.js"
    );

    createFile(
        "templates/data.json",
        `${projectName}/Data/data.json`,
        "data.json"
    );

    copyFile(
      "Favicon/Favicon.K.sf.png",
      `${projectName}/Assets/Favicon/Favicon.K.sf.png`,
      "Favicon.K.sf.png"
    );

  } catch (error) {
    console.log(`❌ Impossible de créer le projet "${projectName}".`);
  }
}

function createFolder(path, name) {

  fs.mkdirSync(path);

  console.log(`✅ Le dossier "${name}" a été créé.`);

}

function createFile(templatePath, destinationPath, name) {

  const content = fs.readFileSync(templatePath, "utf8");

  fs.writeFileSync(destinationPath, content);

  console.log(`✅ Le fichier "${name}" a été créé.`);

}

function copyFile(source, destination, name) {

  fs.copyFileSync(source, destination);

  console.log(`✅ Le fichier "${name}" a été copié.`);

}

rl.question("Nom du projet : ", (projectName) => {

  if (fs.existsSync(projectName)) {

    console.log(`⚠️ Le dossier "${projectName}" existe déjà.`);

    rl.question("Voulez-vous remplacer ? (O/N) : ", (answer) => {

      const response = answer.toLowerCase();

      if (response === "o") {

        fs.rmSync(projectName, { recursive: true });

        console.log(`🗑️ Le dossier "${projectName}" a été supprimé.`);

        createProject(projectName);

      } else {

        console.log(`❌ Création annulée.`);

      }

      rl.close();

    });
    
    return;
  }

  createProject(projectName);

  rl.close();

});