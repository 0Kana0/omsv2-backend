const db = require("../models");
const NetworkModel = db.NetworkModel
const TeamModel = db.TeamModel

//------- GET -------//
exports.network_get_all = async (req, res, next) => {
  try {
    const data = await NetworkModel.findAll(
      {
        include: [{
          model: TeamModel,
          attributes: ['team_name']
        }]
      }
    )

    const transformedData = [] 

    data.map((item) => {
      const dataindex = {
        "id": item.id,
        "network_name": item.network_name,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,
        "teamId": item.teamId,
        "team_name": item.team.team_name
      }
      transformedData.push(dataindex)
    })

    res.send(transformedData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.network_get_all_active = async (req, res, next) => {
  try {
    const data = await NetworkModel.findAll(
      {
        include: [{
          model: TeamModel,
          attributes: ['team_name']
        }],
        where: {status: 'ACTIVE'}
      }
    )

    const transformedData = [] 

    data.map((item) => {
      const dataindex = {
        "id": item.id,
        "network_name": item.network_name,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,
        "teamId": item.teamId,
        "team_name": item.team.team_name
      }
      transformedData.push(dataindex)
    })

    res.send(transformedData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.network_get_one_byname = async (req, res, next) => {
  try {
    const get_name = req.params.name
    const data = await NetworkModel.findOne(
      {
        where: {network_name: get_name} 
      }
    )
    if (data == null) {
      return res.send({message: 'No Data Found'});
    }

    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.network_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id
    const data = await NetworkModel.findOne(
      { 
        include: [{
          model: TeamModel,
          attributes: ['team_name']
        }],
        where: {id: get_id} 
      }
    )
    if (data == null) {
      return res.send({message: 'No Data Found'});
    }

    const transformedData = {
      "id": data.id,
      "network_name": data.network_name,
      "createdAt": data.createdAt,
      "updatedAt": data.updatedAt,
      "teamId": data.teamId,
      "team_name": data.team.team_name
    }

    res.send(transformedData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- POST -------//
exports.network_post = async (req, res, next) => {
  try {
    const { network_name, teamId } = req.body
    await NetworkModel.create({
      network_name: network_name,
      teamId: teamId
    })
    res.send({message: 'Add Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- PUT -------//
exports.network_put = async (req, res, next) => {
  try {
    const { network_name, teamId } = req.body
    const edit_id = req.params.id
    const data = await NetworkModel.update({
      network_name: network_name,
      teamId: teamId
    }, { where: { id: edit_id } }
    )
    if (data == 0) {
      return res.send({message: 'No Data Found'})
    }
    res.send({message: 'Edit Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- DELETE -------//
exports.network_delete = async (req, res, next) => {
  try {
    const delete_id = req.params.id
    const data = await NetworkModel.destroy(
      { where: { id: delete_id } }
    )
    if (data == 0) {
      return res.send({message: 'No Data Found'})
    }
    res.send({message: 'Delete Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}