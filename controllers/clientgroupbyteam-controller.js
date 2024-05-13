const db = require("../models");
const ClientGroupByTeamModel = db.ClientGroupByTeamModel;
const TeamModel = db.TeamModel;
const CustomerModel = db.CustomerModel;
const exceljs = require('exceljs')

//------- GET -------//
exports.clientgroupbyteam_get_all_withexcel = async (req, res, next) => {
  try {
    let workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet("clientgroupbyteam");
    sheet.columns = [
      { header: "Clients", key: "customer_name", width: 15 },
      { header: "Team", key: "team_name", width: 15 },
    ];

    const dataClientGroupByTeam = await ClientGroupByTeamModel.findAll(
      {
        include: [{
          model: TeamModel,
          attributes: ['team_name']
        },
        {
          model: CustomerModel,
          attributes: ['customer_name']
        }]
      }
    )

    dataClientGroupByTeam.map((item, index) => {
      sheet.addRow({
        customer_name: item.customer.customer_name,
        team_name: item.team.team_name
      })
    })

    const filename = `ข้อมูล ClientGroup By Team`;
    res.setHeader(
      "Content-Type", 
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename*=UTF-8''" + encodeURI(`${filename}.xlsx`)
    );

    if (dataClientGroupByTeam.length !== 0) {
      workbook.xlsx.write(res).then(function (data) {
        res.end();
        console.log("genExel successfully.");
      });
    }
  } catch (error) {
    console.log(error);
  }
}

exports.clientgroupbyteam_get_all = async (req, res, next) => {
  try {
    const dataClientGroupByTeam = await ClientGroupByTeamModel.findAll(
      {
        include: [{
          model: TeamModel,
          attributes: ['team_name']
        },
        {
          model: CustomerModel,
          attributes: ['customer_name']
        }]
      }
    )

    const transformedData = [];

    dataClientGroupByTeam.map((item, index) => {
      const dataindex = {
        "id": item.id,
        "line": index + 1,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,
        "customer_id": item.customerId,
        "customer_name": item.customer.customer_name,
        "team_id": item.teamId,
        "team_name": item.team.team_name
      }
      transformedData.push(dataindex);
    })

    res.send(transformedData);
  } catch (error) {
    console.log(error);
  }
}

exports.clientgroupbyteam_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id;
    const dataClientGroupByTeam = await ClientGroupByTeamModel.findOne(
      {
        include: [{
          model: TeamModel,
          attributes: ['team_name']
        },
        {
          model: CustomerModel,
          attributes: ['customer_name']
        }],
        where: {id: get_id} 
      }
    )
    if (dataClientGroupByTeam == null) {
      return res.send({message: 'No Data Found'});
    }

    const transformedData = {
      "id": dataClientGroupByTeam.id,
      "createdAt": dataClientGroupByTeam.createdAt,
      "updatedAt": dataClientGroupByTeam.updatedAt,
      "customer_id": dataClientGroupByTeam.customerId,
      "customer_name": dataClientGroupByTeam.customer.customer_name,
      "team_id": dataClientGroupByTeam.teamId,
      "team_name": dataClientGroupByTeam.team.team_name
    }

    res.send(transformedData);
  } catch (error) {
    console.log(error);
  }
}

//------- POST -------//
exports.clientgroupbyteam_post = async (req, res, next) => {
  try {
    const { customerId, teamId } = req.body;
    await ClientGroupByTeamModel.create({
      customerId: customerId,
      teamId: teamId,
    })

    res.send({message: 'Add ClientGroup By Team Success'})
  } catch (error) {
    console.log(error);
  }
}

exports.clientgroupbyteam_post_byexcel = async (req, res, next) => {
  try {
    const clientTeamData = req.body;

    console.log(clientTeamData);
    
    for (let index = 0; index < clientTeamData.length; index++) {
      const dataTeam = await TeamModel.findOne(
        {where: {team_name: clientTeamData[index].team}}
      )

      const dataCustomer = await CustomerModel.findOne(
        {where: {customer_name: clientTeamData[index].customer}}
      )

      console.log(dataTeam.id, dataCustomer.id);

      await ClientGroupByTeamModel.create(
        {
          customerId: dataCustomer.id,
          teamId: dataTeam.id
        }
      )
    }

    console.log('Create ClientGroup By Team Success');

  } catch (error) {
    console.log(error);
  }
}

//------- PUT -------//
exports.clientgroupbyteam_put = async (req, res, next) => {
  try {
    const { customerId, teamId } = req.body;
    const edit_id = req.params.id
    const datalientGroupByTeam =  await ClientGroupByTeamModel.update({
      customerId: customerId,
      teamId: teamId,
    }, { where: { id: edit_id } })

    if (datalientGroupByTeam == 0) {
      return res.send({message: 'No Data Found'})
    }
    res.send({message: 'Edit ClientGroup By Team Success'})
  } catch (error) {
    console.log(error);
  }
}

//------- DELETE -------//
exports.clientgroupbyteam_delete = async (req, res, next) => {
  try {
    const delete_id = req.params.id
    const datalientGroupByTeam = await ClientGroupByTeamModel.destroy(
      { where: { id: delete_id } }
    )
    if (datalientGroupByTeam == 0) {
      return res.send({message: 'No Data Found'})
    }
    res.send({message: 'Delete ClientGroup By Team Success'})
  } catch (error) {
    console.log(error);
  }
}