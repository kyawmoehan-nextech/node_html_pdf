const express = require("express");
const fs = require("fs");
const archiver = require("archiver");
const router = express.Router();

const puppeteer = require("puppeteer");

const printPDF = async (student, info) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/template", {
    waitUntil: "networkidle0",
  });
  await page.evaluate((student) => {
    let dom = document.querySelector("#name");
    dom.innerHTML = student.name;
  }, student);
  await page.pdf({
    path: `pdf/${info.batch}/${student.name}.pdf`,
    format: "A4",
  });

  await browser.close();
  console.log("PDF Generated");
  zipFolder(info);
  return "Ok";
};

const zipFolder = (info) => {
  const output = fs.createWriteStream(`zips/${info.batch}.zip`);
  var archive = archiver("zip");

  output.on("close", function () {
    console.log(archive.pointer() + " total bytes");
    console.log(
      "archiver has been finalized and the output file descriptor has closed."
    );
  });

  archive.on("error", function (err) {
    throw err;
  });

  archive.pipe(output);

  // append files from a sub-directory and naming it `new-subdir` within the archive (see docs for more options):
  archive.directory(`pdf/${info.batch}`, false);
  archive.finalize();
};

router.post("/pdfgenerate/", async (req, res) => {
  const data = req.body;
  const students = data.students;
  const info = data.info;
  console.log(students, info);
  await fs.mkdirSync("pdf/" + `${info.batch}`);
  students.map((student) => {
    printPDF(student, info);
  });
  res.status(200).json({
    batch: info.batch,
    zipFile: `http://localhost:3000/?zip=${info.batch}.zip`,
  });
});

router.get("/", (req, res) => {
  const zip = req.query.zip;
  // console.log(zip);
  // var data = fs.readFileSync(`zips/${zip}`);
  // res.contentType("application/zip");
  // res.send(data);
  res.download(`zips/${zip}`, zip);
});

module.exports = router;
