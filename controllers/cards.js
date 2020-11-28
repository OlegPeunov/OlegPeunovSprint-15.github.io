const mongoose = require('mongoose');
const Cards = require('../models/cards');
const ServerError = require('../errors/server-error');
const InvalidData = require('../errors/invalid-data');
const Forbidden = require('../errors/forbidden');
const NotFoundError = require('../errors/not-found-err');

module.exports.getCards = ('/', (req, res, next) => {
  Cards.find({})
    .then((сards) => {
      if (!сards) {
        throw new ServerError('Server error');
      }
      res.json({ data: сards });
    })
    .catch(next);
});

module.exports.createCard = ('/', (req, res, next) => {
  const { name, link } = req.body;
  Cards.create({ name, link, owner: req.user._id })
    .then((cards) => {
      res.json({ data: cards });
    })
    .catch((err) => {
      if (err._message === 'cards validation failed') {
        throw new InvalidData('Invalid Card-data');
      } else {
        throw new ServerError ('Internal server error');
      }
    })
    .catch(next);
});

module.exports.deleteCard = ((req, res, next) => {
  const cardId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    next(new InvalidData('Invalid Id'));
    return;
  }
  Cards.findById(cardId)
    .orFail(new Error('notValidId'))
    .then((card) => {
      if (card.owner.toString() === req.user._id.toString()) {
        Cards.findByIdAndRemove(cardId)
          .then((cards) => {
            res.json({ data: cards });
          });
      } else {
        next(new Forbidden('Вы не можете удалять чужие карточки'));
        return;
      }
    })
    .catch((err) => {
      if (err.message === 'notValidId') {
        next(new NotFoundError('Нет пользователя с таким id'));
        return;
      } else {
        next(new ServerError ('Internal server error'));
        return;
      }
    })
    .catch(next);
});
