const db = require("../models");
const UserModel = db.UserModel

//------- LOGIN -------//
exports.createAndUpdateUser = async (req, res) => {
  const { name, email, picture } = req.user
  const managerEmail = [
    'alan@kdr.co.th',
    'kavee@kdr.co.th',
    'nattapat@kdr.co.th',
    'parinya@kdr.co.th',
    'sorawit@kdr.co.th',
    'thanarat@kdr.co.th',
    'thapakorn@kdr.co.th',
    'varaporn@kdr.co.th',
  ]

  // console.log(name, email);
  const dataUserCheck = await UserModel.findOne(
    { where: {name: name, email: email} }
  )

  // console.log(dataUserCheck);

  if (dataUserCheck) {
    await UserModel.update({
      name: name,
      email: email,
      image: picture,
      loginStatus: 1
    },{ where: {name: name, email: email} })

    console.log('Update User');
    res.json(dataUserCheck)
  } else {
    if (managerEmail.includes(email)) {
      await UserModel.create({
        name: name,
        email: email,
        image: picture,
        loginStatus: 1,
        role: 'Manager'
      })

      console.log('Create Manager User');
      res.json({
        name: name,
        email: email,
        image: picture,
        loginStatus: 1,
        role: 'Manager'
      })
    } else {
      await UserModel.create({
        name: name,
        email: email,
        image: picture,
        loginStatus: 1
      })

      console.log('Create Staff User');
      res.json({
        name: name,
        email: email,
        image: picture,
        loginStatus: 1,
        role: 'Staff'
      })
    }
  }
}

exports.currentUser = async (req, res) => {
  try {
    const { name, email } = req.user
    const dataUser = await UserModel.findOne(
      { where: {name: name, email: email} }
    )
    res.json(dataUser)
  } catch (error) {
    console.log(error);
  }
}

//------- LOGOUT -------//
exports.logOutUser = async (req, res) => {
  try {
    const { name, email } = req.headers

    await UserModel.update({
      loginStatus: 0
    },{ where: {name: name, email: email} })

  } catch (error) {
    console.log(error);
  }
}

//------- GET -------//
exports.user_get_all = async (req, res, next) => {
  try {
    const user = await UserModel.findAll()

    res.send(user);
  } catch (error) {
    console.log(error);
  }
}

//------- POST -------//


//------- PUT -------//


//------- DELETE -------//
