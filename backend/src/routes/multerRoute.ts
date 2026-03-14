import express from "express";
const router = express.Router();
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    const ext = file.originalname
      .split(".")
      .filter(Boolean) // removes empty extensions (e.g. `filename...txt`)
      .slice(1)
      .join(".");
    cb(null, Date.now() + "." + ext);
  },
});
const upload = multer({ storage: storage });

router.post("/", upload.single("file"), function (req: any, res: any) {
  const base = "http://" + process.env.DOMAIN_BASE + ":" + process.env.PORT + "/";
  const parts = req.file.path.split("/");
  const url = base + "uploads/" + parts[parts.length - 1];
  console.log("router.post(/file: " + url);
  res.status(200).send({ url: url });
});

export = router;
