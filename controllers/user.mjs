import pkg from 'sequelize';
import { getHash, checkError } from '../util.mjs';

const { Op } = pkg;

export default function initUserController(db) {
  const updateLoginToken = async (userId) => {
    const loginToken = await db.LoginToken.findOne({ where: { userId } });
    const currentDate = new Date();
    loginToken.expiresAt = new Date(currentDate.getTime() + 30 * 60 * 1000);
    loginToken.updatedAt = currentDate;
    await loginToken.save();
  };
  const register = async (req, res) => {
    const { email, password } = req.body;
    try {
      const findEmail = await db.User.findOne(
        { where: { email } },
      );
      console.log('findEmail :>> ', findEmail);
      if (findEmail !== null)
      {
        throw Error('Email has been registered before');
      }
      else {
        const userSqx = await db.User.create(
          {
            email,
            password: getHash(password),
          },
        );
        const userId = userSqx.id;
        await db.LoginToken.create({
          userId,
        });

        res.cookie('loggedIn', getHash(userId));
        res.cookie('userId', userId);
        res.send({ userId });
      }
    } catch (error) {
      console.log('error in user register controller');
      checkError(error);
      res.status(500).send({ error });
    }
  };

  const login = async (req, res) => {
    const user = req.body;
    try {
      const foundUser = await db.User.findOne({
        where: {
          email: user.email,
          password: getHash(user.password),
        },
      });
      if (foundUser !== null) {
        const userId = foundUser.id;
        await updateLoginToken(userId);

        res.cookie('loggedIn', getHash(userId));
        res.cookie('userId', userId);
        res.send({ userId });
      }
      else {
        throw Error('wrong email or password');
      }
    } catch (error) {
      console.log('error in login controller');
      checkError(error);
      res.status(500).send({ error });
    }
  };

  const findMatch = async (req, res) => {
    const currentTime = new Date();
    const loggedInUsers = await db.LoginToken.findAll({
      where: {
        expires_at: {
          [Op.gte]: currentTime,
        },
      },
    });
    console.log('loggedInUsers :>> ', loggedInUsers);
    const randomUser = loggedInUsers.length > 0
      ? loggedInUsers[Math.floor(loggedInUsers.length * Math.random())] : 1;
    res.send({ matchId: randomUser.userId });
  };
  return {
    register,
    login,
    findMatch,
  };
}