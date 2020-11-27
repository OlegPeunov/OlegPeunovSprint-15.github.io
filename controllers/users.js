const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Users = require('../models/users');

module.exports.createUser = ('/', (req, res) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => Users.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    })
      .then((users) => {
        res.json({ data: users });
      })
      .catch((err) => {
        if (err._message === 'user validation failed') {
          res.status(400).send({ message: 'Invalid User-data' });
          return;
        }
        if (err.name === 'MongoError' && err.code === 11000) {
          res.status(409).send({ message: 'Пользователь с таким email уже существует' });
          return;
        }
        res.status(500).send({ message: 'Internal server error' });
      }));
});

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  return Users.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        'some-secret-key',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch((err) => {
      res.status(401).send({ message: err.message });
    });
};

module.exports.getUsers = ('/', (req, res) => {
  Users.find({})
    .then((users) => {
      res.json({ data: users });
    })
    .catch(() => {
      res.status(500).send({ message: 'Internal server error' });
    });
});

module.exports.getUserId = ('/', (req, res) => {
  const userId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).send({ message: 'Invalid id' });
    return;
  }
  Users.findById(userId)
    .orFail(new Error('notValidId'))
    .then((user) => {
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.message === 'notValidId') {
        res.status(404).send({ message: 'Нет пользователя с таким id' });
        return;
      }
      res.status(500).send({ message: 'Internal server error' });
    });
});
