const formidable = require("formidable");

const parsefile = async (req) => {
  //   console.log(formidable);

  return new Promise((resolve, reject) => {
    let options = {
      maxFileSize: 100 * 1024 * 1024, //100 MBs converted to bytes,
      allowEmptyFiles: false,
    };

    const form = formidable();

    form.parse(req, (err, fields, files) => {});

    form.on("error", (error) => {
      reject(error.message);
    });

    form.on("data", (data) => {
      if (data.name === "successUpload") {
        console.log(data.value);
        resolve(data.value);
      }
    });
  });
};

module.exports = parsefile;
