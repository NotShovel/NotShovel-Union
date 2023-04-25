const members = require('../models/members');
const multer = require('multer');
const path = require('path');

exports.signUp = async (req, res, next) => {
  await members.findOne({ email: req.body.email })
    .then(async (data) => {
      if (!data) {
        await members.create({
          email: req.body.email,
          password: req.body.password,
          name: req.body.name,
          phone_number: req.body.phone_number,
        })
          .then(() => res.status(201).send())
          .catch((err) => {
            console.log(err);
            return res.status(500).send(err)
          })
      } else {
        return res.status(409).send('duplicate email')
      }
    })
};

exports.signIn = async (req, res, next) => {
  await members.findOne({
    email: req.body.email,
    password: req.body.password,
  })
    .then((data) => {
      if (data) {
        if (data.state === "0") {
          return res.status(404).send('Member not found');
        } else {
          const loginData = {
            member_id: data._id,
            name: data.name,
            image: data.image || 'DefaultImage.png',
          }
          return res.status(201).send(loginData);
        }
      } else {
        return res.status(401).send('wrong'); // 401 - 사용자 자격 증명 실패
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send(err)
    })
};

exports.editMember = async (req, res, next) => {
  const filter = { _id: req.body.member_id };
  const update = {
    name: req.body.name,
    password: req.body.password,
    phone_number: req.body.phone_number,
    image: req.body.image
  };
  const option = { new: true };
  await members.findOneAndUpdate(filter, update, option)
    .then((data) => {
      return res.status(201).send({ name: data.name, image: data.image || 'DefaultImage.png' });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send(err);
    })
}

exports.deleteMemeber = async (req, res, next) => {
  const filter = {
    _id: req.body.member_id,
    password: req.body.password
  };
  const update = { state: "0" };
  const option = { new: true };
  await members.findOneAndUpdate(filter, update, option)
    .then((data) => {
      if (!data) {
        return res.status(404).send('Member not found');
      } else {
        return res.status(201).send();
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send(err);
    })
}

exports.imageUpload = (req, res, next) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/profile');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  const upload = multer({ storage: storage });

  upload.single('image')(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: 'Failed to upload image' });
    }
    const { filename } = req.file;
    return res.json({ filename: filename });
  });
}

// 프로젝트 제거 시
exports.chkPW = async (req, res) => {
  const { id, password } = req.body;

  await members.findOne({ _id: id, password: password })
    .then((data) => {
      if (data) {
        return res.status(201).json({ message: '비밀번호 일치' });
      } else {
        return res.status(401).json({ message: '비밀번호 일치X' });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send(err)
    });
};
