const db = require("../models");
const moment = require("moment");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const exceljs = require('exceljs')
const { convert } = require('html-to-text');

const path = require('path');
const fs = require('fs').promises;

const ResigningDriverModel = db.ResigningDriverModel
const RecruitingDriverModel = db.RecruitingDriverModel
const CustomerModel = db.CustomerModel
const TeamModel = db.TeamModel
const NetworkModel = db.NetworkModel
const ServiceTypeModel = db.ServiceTypeModel
const VehicleTypeModel = db.VehicleTypeModel
const VehicleModel = db.VehicleModel
const UnitModel = db.UnitModel
const DriverModel = db.DriverModel

const VehicleMatchDriverModel = db.VehicleMatchDriverModel
const VmdHistoryModel = db.VmdHistoryModel

const VehicleBookingStatus2023Model = db.VehicleBookingStatus2023Model
const VehicleBookingStatus2024Model = db.VehicleBookingStatus2024Model
const VehicleBookingStatus2025Model = db.VehicleBookingStatus2025Model

const choose_database_fromyear_vbk = async(selectYear) => {
  try {
    let vbkDB
    if (selectYear == '2023') {
      vbkDB = VehicleBookingStatus2023Model
    } else if (selectYear == '2024') {
      vbkDB = VehicleBookingStatus2024Model
    } else if (selectYear == '2025') {
      vbkDB = VehicleBookingStatus2025Model
    }
    return vbkDB
  } catch (error) {
    console.log(error);
  }
}
const choose_database_fromyear_vbk_sql = async(selectYear) => {
  try {
    let vbkDB
    if (selectYear == '2023') {
      vbkDB = `vehiclebookingstatus2023s`
    } else if (selectYear == '2024') {
      vbkDB = `vehiclebookingstatus2024s`
    } else if (selectYear == '2025') {
      vbkDB = `vehiclebookingstatus2025s`
    }
    return vbkDB
  } catch (error) {
    console.log(error);
  }
}

//------- GET -------//
exports.resigningdriver_get_all_bymonth_byyear_withexcel = async (req, res, next) => {
  try {
    const monthList = [
      'มกราคม',
      'กุมภาพันธ์',
      'มีนาคม',
      'เมษายน',
      'พฤษภาคม',
      'มิถุนายน',
      'กรกฎาคม',
      'สิงหาคม',
      'กันยายน',
      'ตุลาคม',
      'พฤศจิกายน',
      'ธันวาคม'
    ]
    const selectMonth = req.params.month;
    const selectYear = req.params.year;
    const monthText = monthList[selectMonth-1];

    // นำเดือนและปีมาหาวันเเรกและวันสุดท้ายของเดือน
    let startDate = moment(`${selectYear}-${selectMonth}-01`, 'YYYY-MM-DD').format('YYYY-MM-DD');
    let endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

    let workbook = new exceljs.Workbook()
    const sheetResigningdriver = workbook.addWorksheet("รายการร้องขอ")
    sheetResigningdriver.columns = [
      { header: "ID", key: "id", width: 10 },

      { header: "วันที่ (ลาออก)", key: "resign_date", width: 15 },
      { header: "ผู้แจ้ง (ลาออก)", key: "resign_approve", width: 25 },
      { header: "คำนำหน้าชื่อพขร (ลาออก)", key: "resign_prefix_driver", width: 15 },
      { header: "ชื่อ-สกุล (ลาออก)", key: "resign_driver", width: 15 },
      { header: "ทะเบียนรถ (ลาออก)", key: "resign_plateNumber_name", width: 15 },
      { header: "ทะเบียนรถพิเศษ (ลาออก)", key: "resign_plateNumber_special_name", width: 15 },
      { header: "ประเภทรถ (ลาออก)", key: "resign_vehicletype_name", width: 15 },
      { header: "ประเภทรถพิเศษ (ลาออก)", key: "resign_vehicletype_special_name", width: 15 },
      { header: "หน่วยงาน (ลาออก)", key: "resign_unit_name", width: 15 },
      { header: "ทีม (ลาออก)", key: "resign_network_name", width: 15 },
      { header: "โปรเจกต์ (ฝ่าย)", key: "resign_customer_name", width: 15 },
      { header: "การจ้าง (ลาออก)", key: "resign_servicetype_name", width: 15 },
      { header: "เหตุผล (ลาออก)", key: "resign_reason", width: 20 },
      
      { header: "วันที่ (ร้องขอ)", key: "recruit_date", width: 15 },
      { header: "ผู้แจ้ง (ร้องขอ)", key: "recruit_approve", width: 25 },
      { header: "ทะเบียนรถ (ร้องขอ)", key: "recruit_plateNumber_name", width: 15 },
      { header: "ทะเบียนรถพิเศษ (ร้องขอ)", key: "recruit_plateNumber_special_name", width: 15 },
      { header: "ประเภทรถ (ร้องขอ)", key: "recruit_vehicletype_name", width: 15 },
      { header: "ประเภทรถพิเศษ (ร้องขอ)", key: "recruit_vehicletype_special_name", width: 15 },
      { header: "หน่วยงาน (ร้องขอ)", key: "recruit_unit_name", width: 15 },
      { header: "ทีม (ร้องขอ)", key: "recruit_network_name", width: 15 },
      { header: "โปรเจกต์ (ร้องขอ)", key: "recruit_customer_name", width: 15 },
      { header: "จ้างงาน (ร้องขอ)", key: "recruit_servicetype_name", width: 15 },
      { header: "รายละเอียดงาน", key: "detail", width: 20 },
      { header: "เหตุผล (ร้องขอ)", key: "recruit_reason", width: 20 },
      { header: "สถานะ", key: "recruit_status", width: 15 },

      { header: "createdAt", key: "createdAt", width: 25 },
      { header: "updatedAt", key: "updatedAt", width: 25 },
    ]

    // ใส่สีพื้นหลังให้กับ header
    sheetResigningdriver.getRow(1).eachCell((cell) => {
      const headerText = cell.value;

      // สีเหลือง
      if (headerText === "วันที่ (ลาออก)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      } else if (headerText === "ผู้แจ้ง (ลาออก)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      } else if (headerText === "คำนำหน้าชื่อพขร (ลาออก)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      } else if (headerText === "ชื่อ-สกุล (ลาออก)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      } else if (headerText === "ทะเบียนรถ (ลาออก)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      } else if (headerText === "ทะเบียนรถพิเศษ (ลาออก)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      } else if (headerText === "ประเภทรถ (ลาออก)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      } else if (headerText === "ประเภทรถพิเศษ (ลาออก)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      } else if (headerText === "หน่วยงาน (ลาออก)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      } else if (headerText === "ทีม (ลาออก)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      } else if (headerText === "โปรเจกต์ (ฝ่าย)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      } else if (headerText === "การจ้าง (ลาออก)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      } else if (headerText === "เหตุผล (ลาออก)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      }
      // สีเเดง
      else if (headerText === "วันที่ (ร้องขอ)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      } else if (headerText === "ผู้แจ้ง (ร้องขอ)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      } else if (headerText === "ทะเบียนรถ (ร้องขอ)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      } else if (headerText === "ทะเบียนรถพิเศษ (ร้องขอ)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      } else if (headerText === "ประเภทรถ (ร้องขอ)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      } else if (headerText === "ประเภทรถพิเศษ (ร้องขอ)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      } else if (headerText === "หน่วยงาน (ร้องขอ)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      } else if (headerText === "ทีม (ร้องขอ)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      } else if (headerText === "โปรเจกต์ (ร้องขอ)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      } else if (headerText === "จ้างงาน (ร้องขอ)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      } else if (headerText === "รายละเอียดงาน") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      } else if (headerText === "เหตุผล (ร้องขอ)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      } else if (headerText === "สถานะ") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      }
      
      // จัดแนวกลาง
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    const sheetRecruitingdriver = workbook.addWorksheet("ประวัติดำเนินการ")
    sheetRecruitingdriver.columns = [
      { header: "ID", key: "resigningdriverId", width: 10 },
      { header: "วันที่นัดหมาย", key: "appointment_date", width: 15 },
      { header: "ป้ายทะเบียน", key: "recruit_plateNumber_name", width: 15 },
      { header: "ชื่อ-สกุลผู้สมัคร", key: "fullName", width: 15 },
      { header: "เบอร์โทร", key: "phone", width: 15 },
      { header: "เหตุผลนัดหมาย", key: "reason", width: 20 },
      { header: "สถานะ", key: "recruit_status", width: 15 },
      { header: "เหตุผลไม่ผ่าน", key: "note", width: 20 },
      { header: "วันที่เริ่มงาน", key: "appointment_date", width: 15 },
      { header: "ผู้ดำเนินการ", key: "approve", width: 25 },
      { header: "createdAt", key: "createdAt", width: 25 },
      { header: "updatedAt", key: "updatedAt", width: 25 },
    ]
    
    const dataResigningDriver = await ResigningDriverModel.findAll(
      {
        include: [{
          model: UnitModel,
          as: "ResignUnit",
          attributes: ['unit_name']
        },
        {
          model: NetworkModel,
          as: "ResignNetwork",
          attributes: ['network_name']
        },
        {
          model: CustomerModel,
          as: "ResignCustomer",
          attributes: ['customer_name']
        },
        {
          model: VehicleModel,
          as: "ResignPlateNumber",
          attributes: ['plateNumber', 'vehicletypeId'],
          include: [
            {
              model: VehicleTypeModel,
              attributes: ['vehicletype_name']
            }
          ]
        },
        {
          model: VehicleModel,
          as: "ResignPlateNumberSpecial",
          attributes: ['plateNumber', 'vehicletypeId'],
          include: [
            {
              model: VehicleTypeModel,
              attributes: ['vehicletype_name']
            }
          ]
        },
        {
          model: UnitModel,
          as: "RecruitUnit",
          attributes: ['unit_name']
        },
        {
          model: NetworkModel,
          as: "RecruitNetwork",
          attributes: ['network_name']
        },
        {
          model: CustomerModel,
          as: "RecruitCustomer",
          attributes: ['customer_name']
        },
        {
          model: VehicleModel,
          as: "RecruitPlateNumber",
          attributes: ['plateNumber', 'vehicletypeId'],
          include: [
            {
              model: VehicleTypeModel,
              attributes: ['vehicletype_name']
            }
          ]
        },
      {
          model: VehicleModel,
          as: "RecruitPlateNumberSpecial",
          attributes: ['plateNumber', 'vehicletypeId'],
          include: [
            {
              model: VehicleTypeModel,
              attributes: ['vehicletype_name']
            }
          ]
        },
        {
          model: ServiceTypeModel,
          as: "RecruitServiceType",
          attributes: ['servicetype_name']
        },
        {
          model: VehicleTypeModel,
          as: "RecruitVehicleType",
          attributes: ['vehicletype_name']
        }],
        where: {
          recruit_date: {
            [Op.between]: [startDate, endDate],
          },
        },
      }
    )

    for (const item of dataResigningDriver) {
      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
      const startDateYear_resign = moment(item.resign_date).year();
      const chooseVbkDB_resign = await choose_database_fromyear_vbk(startDateYear_resign)
      const dataVehicleBookingStatusResign = await chooseVbkDB_resign.findOne({
        include: [{
          model: ServiceTypeModel,
          attributes: ['servicetype_name']
        },
        {
          model: TeamModel,
          attributes: ['team_name']
        }],
        where: {
          date: item.resign_date + " 07:00:00",
          vehicleId: item.resign_plateNumber
        },
      })

      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
      const startDateYear_recruit = moment(item.recruit_date).year();
      const chooseVbkDB_recruit = await choose_database_fromyear_vbk(startDateYear_recruit)
      const dataVehicleBookingStatusRecruit = await chooseVbkDB_recruit.findOne({
        include: [{
          model: ServiceTypeModel,
          attributes: ['servicetype_name']
        },
        {
          model: TeamModel,
          attributes: ['team_name']
        }],
        where: {
          date: item.recruit_date + " 07:00:00",
          vehicleId: item.recruit_plateNumber
        },
      })

      const dataRecruitingDriverFind = await RecruitingDriverModel.findAll(
        {
          where: {
            resigningdriverId: item.id,
            recruit_status: {
              [Op.or]: ['ลาออก', 'รอสรรหา', 'นัดหมาย', 'เริ่มงาน']
            },
          },
        }
      )

      const dataRecruitingDriver = await RecruitingDriverModel.findAll(
        {
          include: [{
            model: ResigningDriverModel,
            attributes: ['recruit_plateNumber'],
            include: [
              {
                model: VehicleModel,
                as: "RecruitPlateNumber",
                attributes: ['plateNumber']
              }
            ]
          }],
          where: {
            resigningdriverId: item.id	
          },
        }
      )

      // หาข้อมูล vbk ไม่เจอ เเสดงว่าไม่ได้กรอกข้อมูลส่วนนั้นเข้ามา ให้เปลี่ยนเป็น null ถ้ากรอกให้ใช้ข้อมูลปกติ
      let resign_unit
      let resign_unit_name
      let resign_network
      let resign_network_name
      let resign_customer
      let resign_customer_name
      let resign_plateNumber
      let resign_plateNumber_name
      let resign_plateNumber_special
      let resign_plateNumber_special_name
      let resign_vehicletypeId
      let resign_vehicletype_name
      let resign_vehicletypeId_special
      let resign_vehicletype_special_name
      let resign_servicetypeId
      let resign_servicetype_name
      let resign_teamId
      let resign_team_name
      if (dataVehicleBookingStatusResign == null) {
        if (item.resign_specialCase == 1) {
          resign_unit = item.resign_unit,
          resign_unit_name = item.ResignUnit.unit_name,
          resign_network = item.resign_network,
          resign_network_name = item.ResignNetwork.network_name,
          resign_customer = item.resign_customer,
          resign_customer_name = item.ResignCustomer.customer_name,
          resign_plateNumber = null,
          resign_plateNumber_name = null,
          resign_plateNumber_special = item.resign_plateNumber_special,
          resign_plateNumber_special_name = item.ResignPlateNumberSpecial.plateNumber,
          resign_vehicletypeId = null,
          resign_vehicletype_name = null,
          resign_vehicletypeId_special = item.ResignPlateNumberSpecial.vehicletypeId,
          resign_vehicletype_special_name = item.ResignPlateNumberSpecial.vehicletype.vehicletype_name,
          resign_servicetypeId = null
          resign_servicetype_name = null
          resign_teamId = null
          resign_team_name = null
        } else if (item.resign_specialCase == 0) {
          resign_unit = null,
          resign_unit_name = null,
          resign_network = null,
          resign_network_name = null,
          resign_customer = null,
          resign_customer_name = null,
          resign_plateNumber = null,
          resign_plateNumber_name = null,
          resign_plateNumber_special = null,
          resign_plateNumber_special_name = null,
          resign_vehicletypeId = null,
          resign_vehicletype_name = null,
          resign_vehicletypeId_special = null,
          resign_vehicletype_special_name = null,
          resign_servicetypeId = null
          resign_servicetype_name = null
          resign_teamId = null
          resign_team_name = null
        }
      } else {
        resign_unit = item.resign_unit,
        resign_unit_name = item.ResignUnit.unit_name,
        resign_network = item.resign_network,
        resign_network_name = item.ResignNetwork.network_name,
        resign_customer = item.resign_customer,
        resign_customer_name = item.ResignCustomer.customer_name,
        resign_plateNumber = item.resign_plateNumber,
        resign_plateNumber_name = item.ResignPlateNumber.plateNumber,
        resign_plateNumber_special = null,
        resign_plateNumber_special_name = null,
        resign_vehicletypeId = item.ResignPlateNumber.vehicletypeId,
        resign_vehicletype_name = item.ResignPlateNumber.vehicletype.vehicletype_name,
        resign_vehicletypeId_special = null,
        resign_vehicletype_special_name = null,
        resign_servicetypeId = dataVehicleBookingStatusResign.servicetypeId
        resign_servicetype_name = dataVehicleBookingStatusResign.servicetype.servicetype_name
        resign_teamId = dataVehicleBookingStatusResign.teamId
        resign_team_name = dataVehicleBookingStatusResign.team.team_name
      }

      let recruit_unit
      let recruit_unit_name
      let recruit_network
      let recruit_network_name
      let recruit_customer
      let recruit_customer_name
      let recruit_plateNumber
      let recruit_plateNumber_name
      let recruit_plateNumber_special
      let recruit_plateNumber_special_name
      let recruit_vehicletypeId
      let recruit_vehicletype_name
      let recruit_vehicletypeId_special
      let recruit_vehicletype_special_name
      let recruit_servicetypeId
      let recruit_servicetype_name
      let recruit_teamId
      let recruit_team_name
      if (dataVehicleBookingStatusRecruit == null) {
        if (item.recruit_specialCase == 1) {
          recruit_unit = item.recruit_unit,
          recruit_unit_name = item.RecruitUnit.unit_name,
          recruit_network = item.recruit_network,
          recruit_network_name = item.RecruitNetwork.network_name,
          recruit_customer = item.recruit_customer,
          recruit_customer_name = item.RecruitCustomer.customer_name,
          recruit_plateNumber = null,
          recruit_plateNumber_name = null,
          recruit_plateNumber_special = item.recruit_plateNumber_special,
          recruit_plateNumber_special_name = item.RecruitPlateNumberSpecial.plateNumber,
          recruit_vehicletypeId = null,
          recruit_vehicletype_name = null,
          recruit_vehicletypeId_special = item.RecruitPlateNumberSpecial.vehicletypeId,
          recruit_vehicletype_special_name = item.RecruitPlateNumberSpecial.vehicletype.vehicletype_name,
          recruit_servicetypeId = null
          recruit_servicetype_name = null
          recruit_teamId = null
          recruit_team_name = null
        } else if (item.recruit_specialCase == 0) {
          recruit_unit = null,
          recruit_unit_name = null,
          recruit_network = null,
          recruit_network_name = null,
          recruit_customer = null,
          recruit_customer_name = null,
          recruit_plateNumber = null,
          recruit_plateNumber_name = null,
          recruit_plateNumber_special = null,
          recruit_plateNumber_special_name = null,
          recruit_vehicletypeId = null,
          recruit_vehicletype_name = null,
          recruit_vehicletypeId_special = null,
          recruit_vehicletype_special_name = null,
          recruit_servicetypeId = null
          recruit_servicetype_name = null
          recruit_teamId = null
          recruit_team_name = null
        }
      } else {
        recruit_unit = item.recruit_unit,
        recruit_unit_name = item.RecruitUnit.unit_name,
        recruit_network = item.recruit_network,
        recruit_network_name = item.RecruitNetwork.network_name,
        recruit_customer = item.recruit_customer,
        recruit_customer_name = item.RecruitCustomer.customer_name,
        recruit_plateNumber = item.recruit_plateNumber,
        recruit_plateNumber_name = item.RecruitPlateNumber.plateNumber,
        recruit_plateNumber_special = null,
        recruit_plateNumber_special_name = null,
        recruit_vehicletypeId = item.RecruitPlateNumber.vehicletypeId,
        recruit_vehicletype_name = item.RecruitPlateNumber.vehicletype.vehicletype_name,
        recruit_vehicletypeId_special = null,
        recruit_vehicletype_special_name = null,
        recruit_servicetypeId = dataVehicleBookingStatusRecruit.servicetypeId
        recruit_servicetype_name = dataVehicleBookingStatusRecruit.servicetype.servicetype_name
        recruit_teamId = dataVehicleBookingStatusRecruit.teamId
        recruit_team_name = dataVehicleBookingStatusRecruit.team.team_name
      }

      let recruit_status
      if (dataRecruitingDriverFind[0].recruit_status == 'ลาออก') {
        recruit_status = 'ลาออก'
      } 
      if (dataRecruitingDriverFind[0].recruit_status == 'รอสรรหา') {
        recruit_status = 'รอสรรหา'
      } 
      if (dataRecruitingDriverFind[dataRecruitingDriverFind.length-1].recruit_status == 'นัดหมาย') {
        recruit_status = 'กำลังสรรหา'
      } 
      if (dataRecruitingDriverFind[dataRecruitingDriverFind.length-1].recruit_status == 'เริ่มงาน') {
        recruit_status = 'เสร็จสิ้น'
      }

      const adCreateAt = moment(item.createdAt);
      const adUpdateAt = moment(item.updatedAt);

      sheetResigningdriver.addRow({
        id: item.id,

        resign_date: item.resign_date,
        resign_approve: item.approve,
        resign_prefix_driver: item.resign_prefix_driver,
        resign_driver: item.resign_driver,
        resign_plateNumber_name: resign_plateNumber_name,
        resign_plateNumber_special_name: resign_plateNumber_special_name,
        resign_vehicletype_name: resign_vehicletype_name,
        resign_vehicletype_special_name: resign_vehicletype_special_name,
        resign_unit_name: resign_unit_name,
        resign_network_name: resign_network_name,
        resign_customer_name: resign_customer_name,
        resign_servicetype_name: resign_servicetype_name,
        resign_reason: item.resign_reason,

        recruit_date: item.recruit_date,
        recruit_approve: item.recruit_approve,
        recruit_reason: item.recruit_reason,
        recruit_specialCase: item.recruit_specialCase,
        recruit_status: recruit_status,
        // แปลง HTML เป็นข้อความธรรมดา
        detail: convert(item.detail),
        
        createdAt: adCreateAt.format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: adUpdateAt.format('YYYY-MM-DD HH:mm:ss'),

        


        recruit_unit_name: recruit_unit_name,
        recruit_network_name: recruit_network_name,
        recruit_customer_name: recruit_customer_name,
        recruit_plateNumber_name: recruit_plateNumber_name,
        recruit_plateNumber_special_name: recruit_plateNumber_special_name,
        recruit_vehicletype_name: recruit_vehicletype_name,
        recruit_vehicletype_special_name: recruit_vehicletype_special_name,
        recruit_servicetype_name: recruit_servicetype_name,
        recruit_team_name: recruit_team_name,
      })

      for (const item1 of dataRecruitingDriver) {
        const adCreateAt1 = moment(item1.createdAt);
        const adUpdateAt1 = moment(item1.updatedAt);

        sheetRecruitingdriver.addRow({
          resigningdriverId: item.id,
          appointment_date: item1.appointment_date,
          recruit_plateNumber_name: item1.resigningdriver.RecruitPlateNumber.plateNumber,
          fullName: item1.fullName,
          phone: item1.phone,
          reason: item1.reason,
          note: item1.note,
          recruit_status: item1.recruit_status,
          approve: item1.approve,
          createdAt: adCreateAt1.format('YYYY-MM-DD HH:mm:ss'),
          updatedAt: adUpdateAt1.format('YYYY-MM-DD HH:mm:ss'),
        })
      }
    }

    const filename = `ข้อมูลการร้องขออัตรากำลังคนประจำเดือน${monthText} ${selectYear}`;
    res.setHeader(
      "Content-Type", 
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename*=UTF-8''" + encodeURI(`${filename}.xlsx`)
    );

    if (dataResigningDriver.length !== 0) {
      workbook.xlsx.write(res).then(function (dataResigningDriver) {
        res.end();
        console.log("genExel successfully.");
      });
    }
    
  } catch (error) {
    console.log(error);
  }
}

exports.resigningdriver_get_all_rangedate_withexcel = async (req, res, next) => {
  try {
    let startDate = req.params.startDate;
    let endDate = req.params.endDate;

    let workbook = new exceljs.Workbook()
    const sheetResigningdriver = workbook.addWorksheet("รายการร้องขอ")
    sheetResigningdriver.columns = [
      { header: "ID", key: "id", width: 10 },

      { header: "วันที่ (ลาออก)", key: "resign_date", width: 15 },
      { header: "ผู้แจ้ง (ลาออก)", key: "resign_approve", width: 25 },
      { header: "คำนำหน้าชื่อพขร (ลาออก)", key: "resign_prefix_driver", width: 15 },
      { header: "ชื่อ-สกุล (ลาออก)", key: "resign_driver", width: 15 },
      { header: "ทะเบียนรถ (ลาออก)", key: "resign_plateNumber_name", width: 15 },
      { header: "ทะเบียนรถพิเศษ (ลาออก)", key: "resign_plateNumber_special_name", width: 15 },
      { header: "ประเภทรถ (ลาออก)", key: "resign_vehicletype_name", width: 15 },
      { header: "ประเภทรถพิเศษ (ลาออก)", key: "resign_vehicletype_special_name", width: 15 },
      { header: "หน่วยงาน (ลาออก)", key: "resign_unit_name", width: 15 },
      { header: "ทีม (ลาออก)", key: "resign_network_name", width: 15 },
      { header: "โปรเจกต์ (ฝ่าย)", key: "resign_customer_name", width: 15 },
      { header: "การจ้าง (ลาออก)", key: "resign_servicetype_name", width: 15 },
      { header: "เหตุผล (ลาออก)", key: "resign_reason", width: 20 },
      
      { header: "วันที่ (ร้องขอ)", key: "recruit_date", width: 15 },
      { header: "ผู้แจ้ง (ร้องขอ)", key: "recruit_approve", width: 25 },
      { header: "ทะเบียนรถ (ร้องขอ)", key: "recruit_plateNumber_name", width: 15 },
      { header: "ทะเบียนรถพิเศษ (ร้องขอ)", key: "recruit_plateNumber_special_name", width: 15 },
      { header: "ประเภทรถ (ร้องขอ)", key: "recruit_vehicletype_name", width: 15 },
      { header: "ประเภทรถพิเศษ (ร้องขอ)", key: "recruit_vehicletype_special_name", width: 15 },
      { header: "หน่วยงาน (ร้องขอ)", key: "recruit_unit_name", width: 15 },
      { header: "ทีม (ร้องขอ)", key: "recruit_network_name", width: 15 },
      { header: "โปรเจกต์ (ร้องขอ)", key: "recruit_customer_name", width: 15 },
      { header: "จ้างงาน (ร้องขอ)", key: "recruit_servicetype_name", width: 15 },
      { header: "รายละเอียดงาน", key: "detail", width: 20 },
      { header: "เหตุผล (ร้องขอ)", key: "recruit_reason", width: 20 },
      { header: "สถานะ", key: "recruit_status", width: 15 },

      { header: "createdAt", key: "createdAt", width: 25 },
      { header: "updatedAt", key: "updatedAt", width: 25 },
    ]

    // ใส่สีพื้นหลังให้กับ header
    sheetResigningdriver.getRow(1).eachCell((cell) => {
      const headerText = cell.value;

      // สีเหลือง
      if (headerText === "วันที่ (ลาออก)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      } else if (headerText === "ผู้แจ้ง (ลาออก)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      } else if (headerText === "คำนำหน้าชื่อพขร (ลาออก)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      } else if (headerText === "ชื่อ-สกุล (ลาออก)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      } else if (headerText === "ทะเบียนรถ (ลาออก)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      } else if (headerText === "ทะเบียนรถพิเศษ (ลาออก)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      } else if (headerText === "ประเภทรถ (ลาออก)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      } else if (headerText === "ประเภทรถพิเศษ (ลาออก)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      } else if (headerText === "หน่วยงาน (ลาออก)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      } else if (headerText === "ทีม (ลาออก)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      } else if (headerText === "โปรเจกต์ (ฝ่าย)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      } else if (headerText === "การจ้าง (ลาออก)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      } else if (headerText === "เหตุผล (ลาออก)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }, // เหลือง
        };
      }
      // สีเเดง
      else if (headerText === "วันที่ (ร้องขอ)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      } else if (headerText === "ผู้แจ้ง (ร้องขอ)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      } else if (headerText === "ทะเบียนรถ (ร้องขอ)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      } else if (headerText === "ทะเบียนรถพิเศษ (ร้องขอ)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      } else if (headerText === "ประเภทรถ (ร้องขอ)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      } else if (headerText === "ประเภทรถพิเศษ (ร้องขอ)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      } else if (headerText === "หน่วยงาน (ร้องขอ)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      } else if (headerText === "ทีม (ร้องขอ)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      } else if (headerText === "โปรเจกต์ (ร้องขอ)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      } else if (headerText === "จ้างงาน (ร้องขอ)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      } else if (headerText === "รายละเอียดงาน") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      } else if (headerText === "เหตุผล (ร้องขอ)") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      } else if (headerText === "สถานะ") {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000' }, // แดง
        };
      }
      
      // จัดแนวกลาง
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    const sheetRecruitingdriver = workbook.addWorksheet("ประวัติดำเนินการ")
    sheetRecruitingdriver.columns = [
      { header: "ID", key: "resigningdriverId", width: 10 },
      { header: "วันที่นัดหมาย", key: "appointment_date", width: 15 },
      { header: "ป้ายทะเบียน", key: "recruit_plateNumber_name", width: 15 },
      { header: "ชื่อ-สกุลผู้สมัคร", key: "fullName", width: 15 },
      { header: "เบอร์โทร", key: "phone", width: 15 },
      { header: "เหตุผลนัดหมาย", key: "reason", width: 20 },
      { header: "สถานะ", key: "recruit_status", width: 15 },
      { header: "เหตุผลไม่ผ่าน", key: "note", width: 20 },
      { header: "วันที่เริ่มงาน", key: "appointment_date", width: 15 },
      { header: "ผู้ดำเนินการ", key: "approve", width: 25 },
      { header: "createdAt", key: "createdAt", width: 25 },
      { header: "updatedAt", key: "updatedAt", width: 25 },
    ]
    
    const dataResigningDriver = await ResigningDriverModel.findAll(
      {
        include: [{
          model: UnitModel,
          as: "ResignUnit",
          attributes: ['unit_name']
        },
        {
          model: NetworkModel,
          as: "ResignNetwork",
          attributes: ['network_name']
        },
        {
          model: CustomerModel,
          as: "ResignCustomer",
          attributes: ['customer_name']
        },
        {
          model: VehicleModel,
          as: "ResignPlateNumber",
          attributes: ['plateNumber', 'vehicletypeId'],
          include: [
            {
              model: VehicleTypeModel,
              attributes: ['vehicletype_name']
            }
          ]
        },
        {
          model: VehicleModel,
          as: "ResignPlateNumberSpecial",
          attributes: ['plateNumber', 'vehicletypeId'],
          include: [
            {
              model: VehicleTypeModel,
              attributes: ['vehicletype_name']
            }
          ]
        },
        {
          model: UnitModel,
          as: "RecruitUnit",
          attributes: ['unit_name']
        },
        {
          model: NetworkModel,
          as: "RecruitNetwork",
          attributes: ['network_name']
        },
        {
          model: CustomerModel,
          as: "RecruitCustomer",
          attributes: ['customer_name']
        },
        {
          model: VehicleModel,
          as: "RecruitPlateNumber",
          attributes: ['plateNumber', 'vehicletypeId'],
          include: [
            {
              model: VehicleTypeModel,
              attributes: ['vehicletype_name']
            }
          ]
        },
      {
          model: VehicleModel,
          as: "RecruitPlateNumberSpecial",
          attributes: ['plateNumber', 'vehicletypeId'],
          include: [
            {
              model: VehicleTypeModel,
              attributes: ['vehicletype_name']
            }
          ]
        },
        {
          model: ServiceTypeModel,
          as: "RecruitServiceType",
          attributes: ['servicetype_name']
        },
        {
          model: VehicleTypeModel,
          as: "RecruitVehicleType",
          attributes: ['vehicletype_name']
        }],
        where: {
          recruit_date: {
            [Op.between]: [startDate, endDate],
          },
        },
      }
    )

    if (dataResigningDriver.length == 0) {
      return res.send({
        status: 'fail',
        message: 'ไม่มีข้อมูลอยู่ในวันที่ที่เลือก',        
      })
    }

    for (const item of dataResigningDriver) {
      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
      const startDateYear_resign = moment(item.resign_date).year();
      const chooseVbkDB_resign = await choose_database_fromyear_vbk(startDateYear_resign)
      const dataVehicleBookingStatusResign = await chooseVbkDB_resign.findOne({
        include: [{
          model: ServiceTypeModel,
          attributes: ['servicetype_name']
        },
        {
          model: TeamModel,
          attributes: ['team_name']
        }],
        where: {
          date: item.resign_date + " 07:00:00",
          vehicleId: item.resign_plateNumber
        },
      })

      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
      const startDateYear_recruit = moment(item.recruit_date).year();
      const chooseVbkDB_recruit = await choose_database_fromyear_vbk(startDateYear_recruit)
      const dataVehicleBookingStatusRecruit = await chooseVbkDB_recruit.findOne({
        include: [{
          model: ServiceTypeModel,
          attributes: ['servicetype_name']
        },
        {
          model: TeamModel,
          attributes: ['team_name']
        }],
        where: {
          date: item.recruit_date + " 07:00:00",
          vehicleId: item.recruit_plateNumber
        },
      })

      const dataRecruitingDriverFind = await RecruitingDriverModel.findAll(
        {
          where: {
            resigningdriverId: item.id,
            recruit_status: {
              [Op.or]: ['ลาออก', 'รอสรรหา', 'นัดหมาย', 'เริ่มงาน']
            },
          },
        }
      )

      const dataRecruitingDriver = await RecruitingDriverModel.findAll(
        {
          include: [{
            model: ResigningDriverModel,
            attributes: ['recruit_plateNumber'],
            include: [
              {
                model: VehicleModel,
                as: "RecruitPlateNumber",
                attributes: ['plateNumber']
              }
            ]
          }],
          where: {
            resigningdriverId: item.id	
          },
        }
      )

      // หาข้อมูล vbk ไม่เจอ เเสดงว่าไม่ได้กรอกข้อมูลส่วนนั้นเข้ามา ให้เปลี่ยนเป็น null ถ้ากรอกให้ใช้ข้อมูลปกติ
      let resign_unit
      let resign_unit_name
      let resign_network
      let resign_network_name
      let resign_customer
      let resign_customer_name
      let resign_plateNumber
      let resign_plateNumber_name
      let resign_plateNumber_special
      let resign_plateNumber_special_name
      let resign_vehicletypeId
      let resign_vehicletype_name
      let resign_vehicletypeId_special
      let resign_vehicletype_special_name
      let resign_servicetypeId
      let resign_servicetype_name
      let resign_teamId
      let resign_team_name
      if (dataVehicleBookingStatusResign == null) {
        if (item.resign_specialCase == 1) {
          resign_unit = item.resign_unit,
          resign_unit_name = item.ResignUnit.unit_name,
          resign_network = item.resign_network,
          resign_network_name = item.ResignNetwork.network_name,
          resign_customer = item.resign_customer,
          resign_customer_name = item.ResignCustomer.customer_name,
          resign_plateNumber = null,
          resign_plateNumber_name = null,
          resign_plateNumber_special = item.resign_plateNumber_special,
          resign_plateNumber_special_name = item.ResignPlateNumberSpecial.plateNumber,
          resign_vehicletypeId = null,
          resign_vehicletype_name = null,
          resign_vehicletypeId_special = item.ResignPlateNumberSpecial.vehicletypeId,
          resign_vehicletype_special_name = item.ResignPlateNumberSpecial.vehicletype.vehicletype_name,
          resign_servicetypeId = null
          resign_servicetype_name = null
          resign_teamId = null
          resign_team_name = null
        } else if (item.resign_specialCase == 0) {
          resign_unit = null,
          resign_unit_name = null,
          resign_network = null,
          resign_network_name = null,
          resign_customer = null,
          resign_customer_name = null,
          resign_plateNumber = null,
          resign_plateNumber_name = null,
          resign_plateNumber_special = null,
          resign_plateNumber_special_name = null,
          resign_vehicletypeId = null,
          resign_vehicletype_name = null,
          resign_vehicletypeId_special = null,
          resign_vehicletype_special_name = null,
          resign_servicetypeId = null
          resign_servicetype_name = null
          resign_teamId = null
          resign_team_name = null
        }
      } else {
        resign_unit = item.resign_unit,
        resign_unit_name = item.ResignUnit.unit_name,
        resign_network = item.resign_network,
        resign_network_name = item.ResignNetwork.network_name,
        resign_customer = item.resign_customer,
        resign_customer_name = item.ResignCustomer.customer_name,
        resign_plateNumber = item.resign_plateNumber,
        resign_plateNumber_name = item.ResignPlateNumber.plateNumber,
        resign_plateNumber_special = null,
        resign_plateNumber_special_name = null,
        resign_vehicletypeId = item.ResignPlateNumber.vehicletypeId,
        resign_vehicletype_name = item.ResignPlateNumber.vehicletype.vehicletype_name,
        resign_vehicletypeId_special = null,
        resign_vehicletype_special_name = null,
        resign_servicetypeId = dataVehicleBookingStatusResign.servicetypeId
        resign_servicetype_name = dataVehicleBookingStatusResign.servicetype.servicetype_name
        resign_teamId = dataVehicleBookingStatusResign.teamId
        resign_team_name = dataVehicleBookingStatusResign.team.team_name
      }

      let recruit_unit
      let recruit_unit_name
      let recruit_network
      let recruit_network_name
      let recruit_customer
      let recruit_customer_name
      let recruit_plateNumber
      let recruit_plateNumber_name
      let recruit_plateNumber_special
      let recruit_plateNumber_special_name
      let recruit_vehicletypeId
      let recruit_vehicletype_name
      let recruit_vehicletypeId_special
      let recruit_vehicletype_special_name
      let recruit_servicetypeId
      let recruit_servicetype_name
      let recruit_teamId
      let recruit_team_name
      if (dataVehicleBookingStatusRecruit == null) {
        if (item.recruit_specialCase == 1) {
          recruit_unit = item.recruit_unit,
          recruit_unit_name = item.RecruitUnit.unit_name,
          recruit_network = item.recruit_network,
          recruit_network_name = item.RecruitNetwork.network_name,
          recruit_customer = item.recruit_customer,
          recruit_customer_name = item.RecruitCustomer.customer_name,
          recruit_plateNumber = null,
          recruit_plateNumber_name = null,
          recruit_plateNumber_special = item.recruit_plateNumber_special,
          recruit_plateNumber_special_name = item.RecruitPlateNumberSpecial.plateNumber,
          recruit_vehicletypeId = null,
          recruit_vehicletype_name = null,
          recruit_vehicletypeId_special = item.RecruitPlateNumberSpecial.vehicletypeId,
          recruit_vehicletype_special_name = item.RecruitPlateNumberSpecial.vehicletype.vehicletype_name,
          recruit_servicetypeId = null
          recruit_servicetype_name = null
          recruit_teamId = null
          recruit_team_name = null
        } else if (item.recruit_specialCase == 0) {
          recruit_unit = null,
          recruit_unit_name = null,
          recruit_network = null,
          recruit_network_name = null,
          recruit_customer = null,
          recruit_customer_name = null,
          recruit_plateNumber = null,
          recruit_plateNumber_name = null,
          recruit_plateNumber_special = null,
          recruit_plateNumber_special_name = null,
          recruit_vehicletypeId = null,
          recruit_vehicletype_name = null,
          recruit_vehicletypeId_special = null,
          recruit_vehicletype_special_name = null,
          recruit_servicetypeId = null
          recruit_servicetype_name = null
          recruit_teamId = null
          recruit_team_name = null
        }
      } else {
        recruit_unit = item.recruit_unit,
        recruit_unit_name = item.RecruitUnit.unit_name,
        recruit_network = item.recruit_network,
        recruit_network_name = item.RecruitNetwork.network_name,
        recruit_customer = item.recruit_customer,
        recruit_customer_name = item.RecruitCustomer.customer_name,
        recruit_plateNumber = item.recruit_plateNumber,
        recruit_plateNumber_name = item.RecruitPlateNumber.plateNumber,
        recruit_plateNumber_special = null,
        recruit_plateNumber_special_name = null,
        recruit_vehicletypeId = item.RecruitPlateNumber.vehicletypeId,
        recruit_vehicletype_name = item.RecruitPlateNumber.vehicletype.vehicletype_name,
        recruit_vehicletypeId_special = null,
        recruit_vehicletype_special_name = null,
        recruit_servicetypeId = dataVehicleBookingStatusRecruit.servicetypeId
        recruit_servicetype_name = dataVehicleBookingStatusRecruit.servicetype.servicetype_name
        recruit_teamId = dataVehicleBookingStatusRecruit.teamId
        recruit_team_name = dataVehicleBookingStatusRecruit.team.team_name
      }

      let recruit_status
      if (dataRecruitingDriverFind[0].recruit_status == 'ลาออก') {
        recruit_status = 'ลาออก'
      } 
      if (dataRecruitingDriverFind[0].recruit_status == 'รอสรรหา') {
        recruit_status = 'รอสรรหา'
      } 
      if (dataRecruitingDriverFind[dataRecruitingDriverFind.length-1].recruit_status == 'นัดหมาย') {
        recruit_status = 'กำลังสรรหา'
      } 
      if (dataRecruitingDriverFind[dataRecruitingDriverFind.length-1].recruit_status == 'เริ่มงาน') {
        recruit_status = 'เสร็จสิ้น'
      }

      const adCreateAt = moment(item.createdAt);
      const adUpdateAt = moment(item.updatedAt);

      sheetResigningdriver.addRow({
        id: item.id,

        resign_date: item.resign_date,
        resign_approve: item.approve,
        resign_prefix_driver: item.resign_prefix_driver,
        resign_driver: item.resign_driver,
        resign_plateNumber_name: resign_plateNumber_name,
        resign_plateNumber_special_name: resign_plateNumber_special_name,
        resign_vehicletype_name: resign_vehicletype_name,
        resign_vehicletype_special_name: resign_vehicletype_special_name,
        resign_unit_name: resign_unit_name,
        resign_network_name: resign_network_name,
        resign_customer_name: resign_customer_name,
        resign_servicetype_name: resign_servicetype_name,
        resign_reason: item.resign_reason,

        recruit_date: item.recruit_date,
        recruit_approve: item.recruit_approve,
        recruit_reason: item.recruit_reason,
        recruit_specialCase: item.recruit_specialCase,
        recruit_status: recruit_status,
        // แปลง HTML เป็นข้อความธรรมดา
        detail: convert(item.detail),
        
        createdAt: adCreateAt.format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: adUpdateAt.format('YYYY-MM-DD HH:mm:ss'),

        


        recruit_unit_name: recruit_unit_name,
        recruit_network_name: recruit_network_name,
        recruit_customer_name: recruit_customer_name,
        recruit_plateNumber_name: recruit_plateNumber_name,
        recruit_plateNumber_special_name: recruit_plateNumber_special_name,
        recruit_vehicletype_name: recruit_vehicletype_name,
        recruit_vehicletype_special_name: recruit_vehicletype_special_name,
        recruit_servicetype_name: recruit_servicetype_name,
        recruit_team_name: recruit_team_name,
      })

      for (const item1 of dataRecruitingDriver) {
        const adCreateAt1 = moment(item1.createdAt);
        const adUpdateAt1 = moment(item1.updatedAt);

        sheetRecruitingdriver.addRow({
          resigningdriverId: item.id,
          appointment_date: item1.appointment_date,
          recruit_plateNumber_name: item1.resigningdriver.RecruitPlateNumber.plateNumber,
          fullName: item1.fullName,
          phone: item1.phone,
          reason: item1.reason,
          note: item1.note,
          recruit_status: item1.recruit_status,
          approve: item1.approve,
          createdAt: adCreateAt1.format('YYYY-MM-DD HH:mm:ss'),
          updatedAt: adUpdateAt1.format('YYYY-MM-DD HH:mm:ss'),
        })
      }
    }

    const filename = `ข้อมูลการร้องขออัตรากำลังคนระหว่างวันที่ ${startDate} ถึง ${endDate}`;
    res.setHeader(
      "Content-Type", 
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename*=UTF-8''" + encodeURI(`${filename}.xlsx`)
    );

    if (dataResigningDriver.length !== 0) {
      workbook.xlsx.write(res).then(function (dataResigningDriver) {
        res.end();
        console.log("genExel successfully.");
      });
    }

  } catch (error) {
    console.log(error);
  }
}

exports.resigningdriver_get_all_bymonth_byyear = async (req, res, next) => {
  try {
    const selectMonth = req.params.month;
    const selectYear = req.params.year;

    // นำเดือนและปีมาหาวันเเรกและวันสุดท้ายของเดือน
    let startDate = moment(`${selectYear}-${selectMonth}-01`, 'YYYY-MM-DD').format('YYYY-MM-DD');
    let endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

    // รถปกติ คือ รถที่ vbk เป็น 'No Driver', 'MA No Driver' โดย resign_specialCase เป็น 0
    // รถพิเศษ คือ รถที่ vbk เป็นอะไรก้ได้ โดย resign_specialCase เป็น 1

    // Resign -> หมายถึง กรอกเฉพาะข้อ 1 คือ เค้าลาออกอย่างเดียว ไม่หาคนทดแทน
    // Replace -> หมายถึง กรอกข้อ 1 และ 2 คือ เค้าลาออกแล้วหาคนมาทดแทนด้วย
    // New Position -> หมายถึง กรอกเฉพาะข้อ 2 คือ หาคนใหม่มาเลย
    // Spare -> หมายถึง กรอกเฉพาะข้อ 2 เเต่ไม่ใส่ทะเบียนมาด้วย คือ หาคนใหม่มาเลย 

    const dataResigningDriver = await ResigningDriverModel.findAll(
      {
        include: [{
          model: UnitModel,
          as: "ResignUnit",
          attributes: ['unit_name']
        },
        {
          model: NetworkModel,
          as: "ResignNetwork",
          attributes: ['network_name']
        },
        {
          model: CustomerModel,
          as: "ResignCustomer",
          attributes: ['customer_name']
        },
        {
          model: VehicleModel,
          as: "ResignPlateNumber",
          attributes: ['plateNumber', 'vehicletypeId'],
          include: [
            {
              model: VehicleTypeModel,
              attributes: ['vehicletype_name']
            }
          ]
        },
        {
          model: VehicleModel,
          as: "ResignPlateNumberSpecial",
          attributes: ['plateNumber', 'vehicletypeId'],
          include: [
            {
              model: VehicleTypeModel,
              attributes: ['vehicletype_name']
            }
          ]
        },
        {
          model: UnitModel,
          as: "RecruitUnit",
          attributes: ['unit_name']
        },
        {
          model: NetworkModel,
          as: "RecruitNetwork",
          attributes: ['network_name']
        },
        {
          model: CustomerModel,
          as: "RecruitCustomer",
          attributes: ['customer_name']
        },
        {
          model: VehicleModel,
          as: "RecruitPlateNumber",
          attributes: ['plateNumber', 'vehicletypeId'],
          include: [
            {
              model: VehicleTypeModel,
              attributes: ['vehicletype_name']
            }
          ]
        },
        {
          model: VehicleModel,
          as: "RecruitPlateNumberSpecial",
          attributes: ['plateNumber', 'vehicletypeId'],
          include: [
            {
              model: VehicleTypeModel,
              attributes: ['vehicletype_name']
            }
          ]
        },
        // กรณ๊ที่เป็นรูปแบบ Spare
        {
          model: ServiceTypeModel,
          as: "RecruitServiceType",
          attributes: ['servicetype_name']
        },
        {
          model: VehicleTypeModel,
          as: "RecruitVehicleType",
          attributes: ['vehicletype_name']
        }],
        where: {
          recruit_date: {
            [Op.between]: [startDate, endDate],
          },
        },
      }
    )

    const transformedData = []
    for (const item of dataResigningDriver) {
      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
      const startDateYear_resign = moment(item.resign_date).year();
      const chooseVbkDB_resign = await choose_database_fromyear_vbk(startDateYear_resign)
      // หาข้อมูล vbk จากทะเบียนปกติของ resign
      const dataVehicleBookingStatusResign = await chooseVbkDB_resign.findOne({
        include: [{
          model: ServiceTypeModel,
          attributes: ['servicetype_name']
        }],
        where: {
          date: item.resign_date + " 07:00:00",
          vehicleId: item.resign_plateNumber
        },
      })
      // หาข้อมูล vbk จากทะเบียนพิเศษของ resign
      const dataVehicleBookingStatusResignSpecial = await chooseVbkDB_resign.findOne({
        include: [{
          model: ServiceTypeModel,
          attributes: ['servicetype_name']
        }],
        where: {
          date: item.resign_date + " 07:00:00",
          vehicleId: item.resign_plateNumber_special
        },
      })

      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
      const startDateYear_recruit = moment(item.recruit_date).year();
      const chooseVbkDB_recruit = await choose_database_fromyear_vbk(startDateYear_recruit)
      // หาข้อมูล vbk จากทะเบียนปกติของ recruit
      const dataVehicleBookingStatusRecruit = await chooseVbkDB_recruit.findOne({
        include: [{
          model: ServiceTypeModel,
          attributes: ['servicetype_name']
        }],
        where: {
          date: item.recruit_date + " 07:00:00",
          vehicleId: item.recruit_plateNumber
        },
      })
      // หาข้อมูล vbk จากทะเบียนพิเศษของ recruit
      const dataVehicleBookingStatusRecruitSpecial = await chooseVbkDB_recruit.findOne({
        include: [{
          model: ServiceTypeModel,
          attributes: ['servicetype_name']
        }],
        where: {
          date: item.recruit_date + " 07:00:00",
          vehicleId: item.recruit_plateNumber_special
        },
      })

      // หาข้อมูล vbk ไม่เจอ เเสดงว่าไม่ได้กรอกข้อมูลส่วนนั้นเข้ามาหรือใช้ทะเบียนพิเศษ ให้เปลี่ยนเป็น null ถ้ากรอกให้ใช้ข้อมูลปกติ
      // ส่วนของ resign
      let resign_unit
      let resign_unit_name
      let resign_network
      let resign_network_name
      let resign_customer
      let resign_customer_name
      let resign_plateNumber
      let resign_plateNumber_name
      let resign_plateNumber_special
      let resign_plateNumber_special_name
      let resign_vehicletypeId
      let resign_vehicletype_name
      let resign_vehicletypeId_special
      let resign_vehicletype_special_name
      let resign_servicetypeId
      let resign_servicetype_name
      // ถ้าทะเบียนปกติไม่ได้ใช้งาน
      if (dataVehicleBookingStatusResign == null) {
        // ถ้ามีการใช้ทะเบียนพิเศษ ให้ใช้ข้อมูลของทะเบียนพิเศษเเทน
        if (item.resign_specialCase == 1) {
          resign_unit = item.resign_unit
          resign_unit_name = item.ResignUnit.unit_name
          resign_network = item.resign_network
          resign_network_name = item.ResignNetwork.network_name
          resign_customer = item.resign_customer
          resign_customer_name = item.ResignCustomer.customer_name
          resign_plateNumber = null
          resign_plateNumber_name = null
          resign_plateNumber_special = item.resign_plateNumber_special
          resign_plateNumber_special_name = item.ResignPlateNumberSpecial.plateNumber
          resign_vehicletypeId = null
          resign_vehicletype_name = null
          resign_vehicletypeId_special = item.ResignPlateNumberSpecial.vehicletypeId
          resign_vehicletype_special_name = item.ResignPlateNumberSpecial.vehicletype.vehicletype_name
          resign_servicetypeId = dataVehicleBookingStatusResignSpecial.servicetypeId
          resign_servicetype_name = dataVehicleBookingStatusResignSpecial.servicetype.servicetype_name
        // ถ้าไม่มีการใช้ทะเบียนพิเศษ เเสดงว่าส่วนนี้ไม่มีการใช้จริง ให้เป็นค่าว่างทั้งหมด
        } else if (item.resign_specialCase == 0) {
          resign_unit = null
          resign_unit_name = null
          resign_network = null
          resign_network_name = null
          resign_customer = null
          resign_customer_name = null
          resign_plateNumber = null
          resign_plateNumber_name = null
          resign_plateNumber_special = null
          resign_plateNumber_special_name = null
          resign_vehicletypeId = null
          resign_vehicletype_name = null
          resign_vehicletypeId_special = null
          resign_vehicletype_special_name = null
          resign_servicetypeId = null
          resign_servicetype_name = null
        }
      // ถ้าทะเบียนปกติมีการใช้งาน
      } else {
        resign_unit = item.resign_unit
        resign_unit_name = item.ResignUnit.unit_name
        resign_network = item.resign_network
        resign_network_name = item.ResignNetwork.network_name
        resign_customer = item.resign_customer
        resign_customer_name = item.ResignCustomer.customer_name
        resign_plateNumber = item.resign_plateNumber
        resign_plateNumber_name = item.ResignPlateNumber.plateNumber
        resign_plateNumber_special = null
        resign_plateNumber_special_name = null
        resign_vehicletypeId = item.ResignPlateNumber.vehicletypeId
        resign_vehicletype_name = item.ResignPlateNumber.vehicletype.vehicletype_name
        resign_vehicletypeId_special = null
        resign_vehicletype_special_name = null
        resign_servicetypeId = dataVehicleBookingStatusResign.servicetypeId
        resign_servicetype_name = dataVehicleBookingStatusResign.servicetype.servicetype_name
      }

      // ส่วนของ recruit
      let recruit_unit
      let recruit_unit_name
      let recruit_network
      let recruit_network_name
      let recruit_customer
      let recruit_customer_name
      let recruit_plateNumber
      let recruit_plateNumber_name
      let recruit_plateNumber_special
      let recruit_plateNumber_special_name
      let recruit_vehicletypeId
      let recruit_vehicletype_name
      let recruit_vehicletypeId_special
      let recruit_vehicletype_special_name
      let recruit_servicetypeId
      let recruit_servicetype_name
      // ถ้าทะเบียนปกติไม่ได้ใช้งาน
      if (dataVehicleBookingStatusRecruit == null) {
        // ถ้ามีการใช้ทะเบียนพิเศษ ให้ใช้ข้อมูลของทะเบียนพิเศษเเทน
        if (item.recruit_specialCase == 1) {
          recruit_unit = item.recruit_unit
          recruit_unit_name = item.RecruitUnit.unit_name
          recruit_network = item.recruit_network
          recruit_network_name = item.RecruitNetwork.network_name
          recruit_customer = item.recruit_customer
          recruit_customer_name = item.RecruitCustomer.customer_name
          recruit_plateNumber = null
          recruit_plateNumber_name = null
          recruit_plateNumber_special = item.recruit_plateNumber_special
          recruit_plateNumber_special_name = item.RecruitPlateNumberSpecial.plateNumber
          recruit_vehicletypeId = null
          recruit_vehicletype_name = null
          recruit_vehicletypeId_special = item.RecruitPlateNumberSpecial.vehicletypeId
          recruit_vehicletype_special_name = item.RecruitPlateNumberSpecial.vehicletype.vehicletype_name
          recruit_servicetypeId = dataVehicleBookingStatusRecruitSpecial.servicetypeId
          recruit_servicetype_name = dataVehicleBookingStatusRecruitSpecial.servicetype.servicetype_name
        } else if (item.recruit_specialCase == 0) {
          // ถ้าไม่มีการใช้ทะเบียนพิเศษ เเต่สถานะเป็น Spare ให้เเสดงข้อมูลแบบ Spare
          if (item.recruit_reason == "Spare") {
            recruit_unit = item.recruit_unit
            recruit_unit_name = item.RecruitUnit.unit_name
            recruit_network = item.recruit_network
            recruit_network_name = item.RecruitNetwork.network_nam
            recruit_customer = item.recruit_customer
            recruit_customer_name = item.RecruitCustomer.customer_name
            recruit_plateNumber = null
            recruit_plateNumber_name = null
            recruit_plateNumber_special = null
            recruit_plateNumber_special_name = null
            recruit_vehicletypeId = item.recruit_vehicleType 
            recruit_vehicletype_name = item.RecruitVehicleType.vehicletype_name
            recruit_vehicletypeId_special = null
            recruit_vehicletype_special_name = null
            recruit_servicetypeId = item.recruit_serviceType 
            recruit_servicetype_name = item.RecruitServiceType.servicetype_name
          // ถ้าไม่มีการใช้ทะเบียนพิเศษ เเสดงว่าส่วนนี้ไม่มีการใช้จริง ให้เป็นค่าว่างทั้งหมด
          } else {
            recruit_unit = null
            recruit_unit_name = null
            recruit_network = null
            recruit_network_name = null
            recruit_customer = null
            recruit_customer_name = null
            recruit_plateNumber = null
            recruit_plateNumber_name = null
            recruit_plateNumber_special = null
            recruit_plateNumber_special_name = null
            recruit_vehicletypeId = null
            recruit_vehicletype_name = null
            recruit_vehicletypeId_special = null
            recruit_vehicletype_special_name = null
            recruit_servicetypeId = null
            recruit_servicetype_name = null
          }
        }
      // ถ้าทะเบียนปกติมีการใช้งาน
      } else {
        recruit_unit = item.recruit_unit
        recruit_unit_name = item.RecruitUnit.unit_name
        recruit_network = item.recruit_network
        recruit_network_name = item.RecruitNetwork.network_name
        recruit_customer = item.recruit_customer
        recruit_customer_name = item.RecruitCustomer.customer_name
        recruit_plateNumber = item.recruit_plateNumber
        recruit_plateNumber_name = item.RecruitPlateNumber.plateNumber
        recruit_plateNumber_special = null
        recruit_plateNumber_special_name = null
        recruit_vehicletypeId = item.RecruitPlateNumber.vehicletypeId
        recruit_vehicletype_name = item.RecruitPlateNumber.vehicletype.vehicletype_name
        recruit_vehicletypeId_special = null
        recruit_vehicletype_special_name = null
        recruit_servicetypeId = dataVehicleBookingStatusRecruit.servicetypeId
        recruit_servicetype_name = dataVehicleBookingStatusRecruit.servicetype.servicetype_name
      }

      // ข้อมูลสำหรับหา recruit_status
      const dataRecruitingDriver = await RecruitingDriverModel.findAll(
        {
          where: {
            resigningdriverId: item.id,
            recruit_status: {
              [Op.or]: ['ลาออก', 'รอสรรหา', 'นัดหมาย', 'เริ่มงาน']
            },
          },
        }
      )
      let recruit_status
      if (dataRecruitingDriver[0].recruit_status == 'ลาออก') {
        recruit_status = 'ลาออก'
      } 
      if (dataRecruitingDriver[0].recruit_status == 'รอสรรหา') {
        recruit_status = 'รอสรรหา'
      } 
      if (dataRecruitingDriver[dataRecruitingDriver.length-1].recruit_status == 'นัดหมาย') {
        recruit_status = 'กำลังสรรหา'
      } 
      if (dataRecruitingDriver[dataRecruitingDriver.length-1].recruit_status == 'เริ่มงาน') {
        recruit_status = 'เสร็จสิ้น'
      }
 
      const dataindex = {
        "id": item.id,
        "resign_date": item.resign_date,
        "resign_prefix_driver": item.resign_prefix_driver,
        "resign_driver": item.resign_driver,
        "resign_reason": item.resign_reason,
        "resign_specialCase": item.resign_specialCase,
        "recruit_date": item.recruit_date,
        "recruit_reason": item.recruit_reason,
        "recruit_specialCase": item.recruit_specialCase,
        "detail": item.detail,
        "detail_file": item.detail_file,
        "recruit_status": recruit_status,
        "approve": item.approve,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,

        "resign_unit": resign_unit,
        "resign_unit_name": resign_unit_name,
        "resign_network": resign_network,
        "resign_network_name": resign_network_name,
        "resign_customer": resign_customer,
        "resign_customer_name": resign_customer_name,
        "resign_plateNumber": resign_plateNumber,
        "resign_plateNumber_name": resign_plateNumber_name,
        "resign_plateNumber_special": resign_plateNumber_special,
        "resign_plateNumber_special_name": resign_plateNumber_special_name,
        "resign_vehicletypeId": resign_vehicletypeId,
        "resign_vehicletype_name": resign_vehicletype_name,
        "resign_vehicletypeId_special": resign_vehicletypeId_special,
        "resign_vehicletype_special_name": resign_vehicletype_special_name,
        "resign_servicetypeId": resign_servicetypeId,
        "resign_servicetype_name": resign_servicetype_name,

        "recruit_unit": recruit_unit,
        "recruit_unit_name": recruit_unit_name,
        "recruit_network": recruit_network,
        "recruit_network_name": recruit_network_name,
        "recruit_customer": recruit_customer,
        "recruit_customer_name": recruit_customer_name,
        "recruit_plateNumber": recruit_plateNumber,
        "recruit_plateNumber_name": recruit_plateNumber_name,
        "recruit_plateNumber_special": recruit_plateNumber_special,
        "recruit_plateNumber_special_name": recruit_plateNumber_special_name,
        "recruit_vehicletypeId": recruit_vehicletypeId,
        "recruit_vehicletype_name": recruit_vehicletype_name,
        "recruit_vehicletypeId_special": recruit_vehicletypeId_special,
        "recruit_vehicletype_special_name": recruit_vehicletype_special_name,
        "recruit_servicetypeId": recruit_servicetypeId,
        "recruit_servicetype_name": recruit_servicetype_name,
      }
      transformedData.push(dataindex)
    }

    res.send({
      status: 'success',
      message: 'Get All Resigning Driver Success',
      length: dataResigningDriver.length,
      data: transformedData
    });
    
  } catch (error) {
    console.log(error);
  }
}

exports.resigningdriver_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id

    const dataResigningDriver = await ResigningDriverModel.findOne(
      {
        include: [{
          model: UnitModel,
          as: "ResignUnit",
          attributes: ['unit_name']
        },
        {
          model: NetworkModel,
          as: "ResignNetwork",
          attributes: ['network_name']
        },
        {
          model: CustomerModel,
          as: "ResignCustomer",
          attributes: ['customer_name']
        },
        {
          model: VehicleModel,
          as: "ResignPlateNumber",
          attributes: ['plateNumber', 'vehicletypeId'],
          include: [
            {
              model: VehicleTypeModel,
              attributes: ['vehicletype_name']
            }
          ]
        },
        {
          model: VehicleModel,
          as: "ResignPlateNumberSpecial",
          attributes: ['plateNumber', 'vehicletypeId'],
          include: [
            {
              model: VehicleTypeModel,
              attributes: ['vehicletype_name']
            }
          ]
        },
        {
          model: UnitModel,
          as: "RecruitUnit",
          attributes: ['unit_name']
        },
        {
          model: NetworkModel,
          as: "RecruitNetwork",
          attributes: ['network_name']
        },
        {
          model: CustomerModel,
          as: "RecruitCustomer",
          attributes: ['customer_name']
        },
        {
          model: VehicleModel,
          as: "RecruitPlateNumber",
          attributes: ['plateNumber', 'vehicletypeId'],
          include: [
            {
              model: VehicleTypeModel,
              attributes: ['vehicletype_name']
            }
          ]
        },
        {
          model: VehicleModel,
          as: "RecruitPlateNumberSpecial",
          attributes: ['plateNumber', 'vehicletypeId'],
          include: [
            {
              model: VehicleTypeModel,
              attributes: ['vehicletype_name']
            }
          ]
        }],
        where: {
          id: get_id
        },
      }
    )

    if (dataResigningDriver == null) {
      return res.send({
        status: 'fail',
        message: 'No Data Found',
        data: dataResigningDriver
      })
    }

    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear_resign = moment(dataResigningDriver.resign_date).year();
    const chooseVbkDB_resign = await choose_database_fromyear_vbk(startDateYear_resign)
    const dataVehicleBookingStatusResign = await chooseVbkDB_resign.findOne({
      include: [{
        model: ServiceTypeModel,
        attributes: ['servicetype_name']
      },
      {
        model: TeamModel,
        attributes: ['team_name']
      }],
      where: {
        date: dataResigningDriver.resign_date + " 07:00:00",
        vehicleId: dataResigningDriver.resign_plateNumber
      },
    })

    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear_recruit = moment(dataResigningDriver.recruit_date).year();
    const chooseVbkDB_recruit = await choose_database_fromyear_vbk(startDateYear_recruit)
    const dataVehicleBookingStatusRecruit = await chooseVbkDB_recruit.findOne({
      include: [{
        model: ServiceTypeModel,
        attributes: ['servicetype_name']
      },
      {
        model: TeamModel,
        attributes: ['team_name']
      }],
      where: {
        date: dataResigningDriver.recruit_date + " 07:00:00",
        vehicleId: dataResigningDriver.recruit_plateNumber
      },
    })

    const dataRecruitingDriver = await RecruitingDriverModel.findAll(
      {
        where: {
          resigningdriverId: get_id,
          recruit_status: {
            [Op.or]: ['ลาออก', 'รอสรรหา', 'นัดหมาย', 'เริ่มงาน']
          },
        },
      }
    )

    // หาข้อมูล vbk ไม่เจอ เเสดงว่าไม่ได้กรอกข้อมูลส่วนนั้นเข้ามา ให้เปลี่ยนเป็น null ถ้ากรอกให้ใช้ข้อมูลปกติ
    let resign_unit
    let resign_unit_name
    let resign_network
    let resign_network_name
    let resign_customer
    let resign_customer_name
    let resign_plateNumber
    let resign_plateNumber_name
    let resign_plateNumber_special
    let resign_plateNumber_special_name
    let resign_vehicletypeId
    let resign_vehicletype_name
    let resign_vehicletypeId_special
    let resign_vehicletype_special_name
    let resign_servicetypeId
    let resign_servicetype_name
    let resign_teamId
    let resign_team_name
    if (dataVehicleBookingStatusResign == null) {
      if (dataResigningDriver.resign_specialCase == 1) {
        resign_unit = dataResigningDriver.resign_unit,
        resign_unit_name = dataResigningDriver.ResignUnit.unit_name,
        resign_network = dataResigningDriver.resign_network,
        resign_network_name = dataResigningDriver.ResignNetwork.network_name,
        resign_customer = dataResigningDriver.resign_customer,
        resign_customer_name = dataResigningDriver.ResignCustomer.customer_name,
        resign_plateNumber = null,
        resign_plateNumber_name = null,
        resign_plateNumber_special = dataResigningDriver.resign_plateNumber_special,
        resign_plateNumber_special_name = dataResigningDriver.ResignPlateNumberSpecial.plateNumber,
        resign_vehicletypeId = null,
        resign_vehicletype_name = null,
        resign_vehicletypeId_special = dataResigningDriver.ResignPlateNumberSpecial.vehicletypeId,
        resign_vehicletype_special_name = dataResigningDriver.ResignPlateNumberSpecial.vehicletype.vehicletype_name,
        resign_servicetypeId = null
        resign_servicetype_name = null
        resign_teamId = null
        resign_team_name = null
      } else if (dataResigningDriver.resign_specialCase == 0) {
        resign_unit = null,
        resign_unit_name = null,
        resign_network = null,
        resign_network_name = null,
        resign_customer = null,
        resign_customer_name = null,
        resign_plateNumber = null,
        resign_plateNumber_name = null,
        resign_plateNumber_special = null,
        resign_plateNumber_special_name = null,
        resign_vehicletypeId = null,
        resign_vehicletype_name = null,
        resign_vehicletypeId_special = null,
        resign_vehicletype_special_name = null,
        resign_servicetypeId = null
        resign_servicetype_name = null
        resign_teamId = null
        resign_team_name = null
      }
    } else {
      resign_unit = dataResigningDriver.resign_unit,
      resign_unit_name = dataResigningDriver.ResignUnit.unit_name,
      resign_network = dataResigningDriver.resign_network,
      resign_network_name = dataResigningDriver.ResignNetwork.network_name,
      resign_customer = dataResigningDriver.resign_customer,
      resign_customer_name = dataResigningDriver.ResignCustomer.customer_name,
      resign_plateNumber = dataResigningDriver.resign_plateNumber,
      resign_plateNumber_name = dataResigningDriver.ResignPlateNumber.plateNumber,
      resign_plateNumber_special = null,
      resign_plateNumber_special_name = null,
      resign_vehicletypeId = dataResigningDriver.ResignPlateNumber.vehicletypeId,
      resign_vehicletype_name = dataResigningDriver.ResignPlateNumber.vehicletype.vehicletype_name,
      resign_vehicletypeId_special = null,
      resign_vehicletype_special_name = null,
      resign_servicetypeId = dataVehicleBookingStatusResign.servicetypeId
      resign_servicetype_name = dataVehicleBookingStatusResign.servicetype.servicetype_name
      resign_teamId = dataVehicleBookingStatusResign.teamId
      resign_team_name = dataVehicleBookingStatusResign.team.team_name
    }

    let recruit_unit
    let recruit_unit_name
    let recruit_network
    let recruit_network_name
    let recruit_customer
    let recruit_customer_name
    let recruit_plateNumber
    let recruit_plateNumber_name
    let recruit_plateNumber_special
    let recruit_plateNumber_special_name
    let recruit_vehicletypeId
    let recruit_vehicletype_name
    let recruit_vehicletypeId_special
    let recruit_vehicletype_special_name
    let recruit_servicetypeId
    let recruit_servicetype_name
    let recruit_teamId
    let recruit_team_name
    if (dataVehicleBookingStatusRecruit == null) {
      if (dataResigningDriver.recruit_specialCase == 1) {
        recruit_unit = dataResigningDriver.recruit_unit,
        recruit_unit_name = dataResigningDriver.RecruitUnit.unit_name,
        recruit_network = dataResigningDriver.recruit_network,
        recruit_network_name = dataResigningDriver.RecruitNetwork.network_name,
        recruit_customer = dataResigningDriver.recruit_customer,
        recruit_customer_name = dataResigningDriver.RecruitCustomer.customer_name,
        recruit_plateNumber = null,
        recruit_plateNumber_name = null,
        recruit_plateNumber_special = dataResigningDriver.recruit_plateNumber_special,
        recruit_plateNumber_special_name = dataResigningDriver.RecruitPlateNumberSpecial.plateNumber,
        recruit_vehicletypeId = null,
        recruit_vehicletype_name = null,
        recruit_vehicletypeId_special = dataResigningDriver.RecruitPlateNumberSpecial.vehicletypeId,
        recruit_vehicletype_special_name = dataResigningDriver.RecruitPlateNumberSpecial.vehicletype.vehicletype_name,
        recruit_servicetypeId = null
        recruit_servicetype_name = null
        recruit_teamId = null
        recruit_team_name = null
      } else if (dataResigningDriver.recruit_specialCase == 0) {
        recruit_unit = null,
        recruit_unit_name = null,
        recruit_network = null,
        recruit_network_name = null,
        recruit_customer = null,
        recruit_customer_name = null,
        recruit_plateNumber = null,
        recruit_plateNumber_name = null,
        recruit_plateNumber_special = null,
        recruit_plateNumber_special_name = null,
        recruit_vehicletypeId = null,
        recruit_vehicletype_name = null,
        recruit_vehicletypeId_special = null,
        recruit_vehicletype_special_name = null,
        recruit_servicetypeId = null
        recruit_servicetype_name = null
        recruit_teamId = null
        recruit_team_name = null
      }
    } else {
      recruit_unit = dataResigningDriver.recruit_unit,
      recruit_unit_name = dataResigningDriver.RecruitUnit.unit_name,
      recruit_network = dataResigningDriver.recruit_network,
      recruit_network_name = dataResigningDriver.RecruitNetwork.network_name,
      recruit_customer = dataResigningDriver.recruit_customer,
      recruit_customer_name = dataResigningDriver.RecruitCustomer.customer_name,
      recruit_plateNumber = dataResigningDriver.recruit_plateNumber,
      recruit_plateNumber_name = dataResigningDriver.RecruitPlateNumber.plateNumber,
      recruit_plateNumber_special = null,
      recruit_plateNumber_special_name = null,
      recruit_vehicletypeId = dataResigningDriver.RecruitPlateNumber.vehicletypeId,
      recruit_vehicletype_name = dataResigningDriver.RecruitPlateNumber.vehicletype.vehicletype_name,
      recruit_vehicletypeId_special = null,
      recruit_vehicletype_special_name = null,
      recruit_servicetypeId = dataVehicleBookingStatusRecruit.servicetypeId
      recruit_servicetype_name = dataVehicleBookingStatusRecruit.servicetype.servicetype_name
      recruit_teamId = dataVehicleBookingStatusRecruit.teamId
      recruit_team_name = dataVehicleBookingStatusRecruit.team.team_name
    }

    let recruit_status
    if (dataRecruitingDriver[0].recruit_status == 'ลาออก') {
      recruit_status = 'ลาออก'
    } 
    if (dataRecruitingDriver[0].recruit_status == 'รอสรรหา') {
      recruit_status = 'รอสรรหา'
    } 
    if (dataRecruitingDriver[dataRecruitingDriver.length-1].recruit_status == 'นัดหมาย') {
      recruit_status = 'กำลังสรรหา'
    } 
    if (dataRecruitingDriver[dataRecruitingDriver.length-1].recruit_status == 'เริ่มงาน') {
      recruit_status = 'เสร็จสิ้น'
    }

    const transformedData = {
      "id": dataResigningDriver.id,
      "resign_date": dataResigningDriver.resign_date,
      "resign_prefix_driver": dataResigningDriver.resign_prefix_driver,
      "resign_driver": dataResigningDriver.resign_driver,
      "resign_reason": dataResigningDriver.resign_reason,
      "resign_specialCase": dataResigningDriver.resign_specialCase,
      "recruit_date": dataResigningDriver.recruit_date,
      "recruit_reason": dataResigningDriver.recruit_reason,
      "recruit_specialCase": dataResigningDriver.recruit_specialCase,
      "detail": dataResigningDriver.detail,
      "detail_file": dataResigningDriver.detail_file,
      "recruit_status": recruit_status,
      "approve": dataResigningDriver.approve,
      "createdAt": dataResigningDriver.createdAt,
      "updatedAt": dataResigningDriver.updatedAt,

      "resign_unit": resign_unit,
      "resign_unit_name": resign_unit_name,
      "resign_network": resign_network,
      "resign_network_name": resign_network_name,
      "resign_customer": resign_customer,
      "resign_customer_name": resign_customer_name,
      "resign_plateNumber": resign_plateNumber,
      "resign_plateNumber_name": resign_plateNumber_name,
      "resign_plateNumber_special": resign_plateNumber_special,
      "resign_plateNumber_special_name": resign_plateNumber_special_name,
      "resign_vehicletypeId": resign_vehicletypeId,
      "resign_vehicletype_name": resign_vehicletype_name,
      "resign_vehicletypeId_special": resign_vehicletypeId_special,
      "resign_vehicletype_special_name": resign_vehicletype_special_name,
      "resign_servicetypeId": resign_servicetypeId,
      "resign_servicetype_name": resign_servicetype_name,
      "resign_teamId": resign_teamId,
      "resign_team_name": resign_team_name,

      "recruit_unit": recruit_unit,
      "recruit_unit_name": recruit_unit_name,
      "recruit_network": recruit_network,
      "recruit_network_name": recruit_network_name,
      "recruit_customer": recruit_customer,
      "recruit_customer_name": recruit_customer_name,
      "recruit_plateNumber": recruit_plateNumber,
      "recruit_plateNumber_name": recruit_plateNumber_name,
      "recruit_plateNumber_special": recruit_plateNumber_special,
      "recruit_plateNumber_special_name": recruit_plateNumber_special_name,
      "recruit_vehicletypeId": recruit_vehicletypeId,
      "recruit_vehicletype_name": recruit_vehicletype_name,
      "recruit_vehicletypeId_special": recruit_vehicletypeId_special,
      "recruit_vehicletype_special_name": recruit_vehicletype_special_name,
      "recruit_servicetypeId": recruit_servicetypeId,
      "recruit_servicetype_name": recruit_servicetype_name,
      "recruit_teamId": recruit_teamId,
      "recruit_team_name": recruit_team_name,
    }

    res.send({
      status: 'success',
      message: 'Get Resigning Driver Success',
      data: transformedData
    });
    
  } catch (error) {
    console.log(error);
  }
}

//------- POST -------//
exports.resigningdriverwithfile_post = async (req, res, next) => {
  try {
    // ข้อมูลที่ไม่ใช่ไฟล์
    const formData = req.body;
    // แปลงค่า 'null', '', ' ', '-' เป็น null
    Object.keys(formData).forEach(key => {
      if (formData[key] === 'null' || formData[key] === '' || formData[key] === '-' || formData[key] === ' ') {
        formData[key] = null;
      }
    });

    if (formData.resign_date == null) {
      return res.send({
        status: 'fail',
        message: 'วันที่ลาออกห้ามเป็นค่าว่าง',        
      })
    }
    if (formData.recruit_date == null) {
      return res.send({
        status: 'fail',
        message: 'วันที่ร้องขอห้ามเป็นค่าว่าง',        
      })
    }
    if (formData.recruit_reason == null) {
      return res.send({
        status: 'fail',
        message: 'เหตุผลการร้องขอห้ามเป็นค่าว่าง',        
      })
    }

    // ข้อมูลไฟล์ที่ถูกอัพโหลด
    const file = req.files;
    // นำชื่อไฟล์ที่อัพโหลดเก็บเข้าไปใน array
    const detail_file_array = []
    file.map((item) => {
      let new_name = Date.now() + '_' + item.originalname;

      let old_path = path.join( __dirname, `../uploads/resignings/${item.originalname}`); // ไฟล์ต้นทาง
      let new_path = path.join( __dirname, `../uploads/resignings/${new_name}` ); // ไฟล์ปลายทาง

      fs.rename(old_path, new_path);
      detail_file_array.push(new_name);
    })

    //formData.resign_driver = formData.resign_driver.replace(/\s+/g, " ");
    
    // ข้อมูลในกรณีที่ไม่ใส่ค่าอะไรเข้ามา ให้เปลี่ยนเป็นไอดีของไม่ใส่ข้อมูล
    if (formData.resign_unit == null) {
      formData.resign_unit = '3'
    } 
    if (formData.resign_network == null) {
      formData.resign_network = '29'
    } 
    if (formData.resign_customer == null) {
      formData.resign_customer = '240'
    } 
    if (formData.resign_plateNumber == null) {
      formData.resign_plateNumber = '10710'
    } 
    if (formData.resign_plateNumber_special == null) {
      formData.resign_plateNumber_special = '10710'
    } 
    if (formData.recruit_unit == null) {
      formData.recruit_unit = '3'
    } 
    if (formData.recruit_network == null) {
      formData.recruit_network = '29'
    } 
    if (formData.recruit_customer == null) {
      formData.recruit_customer = '240'
    } 
    if (formData.recruit_plateNumber == null) {
      formData.recruit_plateNumber = '10710'
    }
    if (formData.recruit_plateNumber_special == null) {
      formData.recruit_plateNumber_special = '10710'
    }
    if (formData.recruit_vehicleType == null) {
      formData.recruit_vehicleType = '33'
    }
    if (formData.recruit_serviceType == null) {
      formData.recruit_serviceType = '16'
    }
    // ถ้า resign_specialCase เป็น false ให้เปลี่ยนทะเบียนพิเศษเป็นไม่ใส่ข้อมูล
    if (formData.resign_specialCase == 0) {
      formData.resign_plateNumber_special = '10710'
    }
    if (formData.recruit_specialCase == 0) {
      formData.recruit_plateNumber_special = '10710'
    }
    // ถ้า resign_specialCase เป็น true ให้เปลี่ยนทะเบียนปกติเป็นไม่ใส่ข้อมูล เนื่องจากใช้ทะเบียนพิเศษเเทน
    if (formData.resign_specialCase == 1) {
      formData.resign_plateNumber = '10710'
    }
    if (formData.recruit_specialCase == 1) {
      formData.recruit_plateNumber = '10710'
    }
    
    const createResigningDriver = await ResigningDriverModel.create({
      resign_date: formData.resign_date,
      resign_prefix_driver: formData.resign_prefix_driver,
      resign_driver: formData.resign_driver,
      resign_reason: formData.resign_reason,
      resign_specialCase: formData.resign_specialCase,
      recruit_date: formData.recruit_date,
      recruit_reason: formData.recruit_reason,
      recruit_specialCase: formData.recruit_specialCase,
      detail: formData.detail,
      detail_file: detail_file_array,
      approve: formData.approve,
      resign_unit: formData.resign_unit,
      resign_network: formData.resign_network,
      resign_customer: formData.resign_customer,
      resign_plateNumber: formData.resign_plateNumber,
      resign_plateNumber_special: formData.resign_plateNumber_special,
      recruit_unit: formData.recruit_unit,
      recruit_network: formData.recruit_network,
      recruit_customer: formData.recruit_customer,
      recruit_plateNumber: formData.recruit_plateNumber,
      recruit_plateNumber_special: formData.recruit_plateNumber_special,
      recruit_vehicleType: formData.recruit_vehicleType,
      recruit_serviceType: formData.recruit_serviceType,
    })

    if (formData.recruit_reason == 'Resign') {
      // เมื่อสร้างข้อมูล resigning เสด ให้สร้างข้อมูล recruiting โดยค่่าเริ่มต้นเป็น ลาออก
      const createRecruitingDriver = await RecruitingDriverModel.create({
        recruit_status: 'ลาออก',
        driver_file: [],
        approve: formData.approve,
        resigningdriverId: createResigningDriver.id,
      })
    } else {
      // เมื่อสร้างข้อมูล resigning เสด ให้สร้างข้อมูล recruiting โดยค่่าเริ่มต้นเป็น รอสรรหา
      const createRecruitingDriver = await RecruitingDriverModel.create({
        recruit_status: 'รอสรรหา',
        driver_file: [],
        approve: formData.approve,
        resigningdriverId: createResigningDriver.id,
      })
    }

    // ถ้ามีการกรอกชื่อคนขับลาออก ให้เเก้ไขข้อมูลของคนขับที่ลาออก
    if (formData.resign_driver !== null) {
      // ส่วนของการเเก้ไขข้อมูลใน Driver
      await DriverModel.update({
        status: formData.resign_reason
      }, { where: { fullName: formData.resign_driver }})

      // ส่วนของการเเก้ไขข้อมูลใน VehicleMatchDriver
      if (formData.resign_specialCase == 0) {
        await VehicleMatchDriverModel.update({
          driver_name: null
        }, { where: { vehicleId: formData.resign_plateNumber }})
      } else if (formData.resign_specialCase == 1) {
        await VehicleMatchDriverModel.update({
          driver_name: null
        }, { where: { vehicleId: formData.resign_plateNumber_special }})
      }
    }

    res.send({
      status: 'success',
      message: 'Add Resigning Driver With File Success',
      data: createResigningDriver,
    })

  } catch (error) {
    console.log(error);
  }
}

exports.resigningdriverwithfile_put = async (req, res, next) => {
  try {
    const edit_id = req.params.id
    // ข้อมูลที่ไม่ใช่ไฟล์
    const formData = req.body;
    // แปลงค่า 'null', '', ' ', '-' เป็น null
    Object.keys(formData).forEach(key => {
      if (formData[key] === 'null' || formData[key] === '' || formData[key] === '-' || formData[key] === ' ') {
        formData[key] = null;
      }
    });

    if (formData.resign_date == null) {
      return res.send({
        status: 'fail',
        message: 'วันที่ลาออกห้ามเป็นค่าว่าง',        
      })
    }
    if (formData.recruit_date == null) {
      return res.send({
        status: 'fail',
        message: 'วันที่ร้องขอห้ามเป็นค่าว่าง',        
      })
    }
    if (formData.recruit_reason == null) {
      return res.send({
        status: 'fail',
        message: 'เหตุผลการร้องขอห้ามเป็นค่าว่าง',        
      })
    }

    const editDataResigningDriver = await ResigningDriverModel.findOne(
      {
        where: { id: edit_id },
      }
    )
    if (editDataResigningDriver == null) {
      return res.send({
        status: 'fail',
        message: 'No Data Found',
        data: editDataResigningDriver
      })
    }
    
    // ข้อมูลไฟล์ที่ถูกอัพโหลด
    const file = req.files;
    //console.log("file", file.length);
    //console.log("formData.detail_file_indb", formData.detail_file_indb);

    // นำชื่อไฟล์ที่อัพโหลดเก็บเข้าไปใน array
    let detail_file_array = []
    // ใน db ไม่มีไฟล์และไม่มีการอัพไฟล์เข้ามา 
    if (file.length == 0 && formData.detail_file_indb == null) {
      // วนลูปเพื่อลบทุกไฟล์
      for (const file_name of editDataResigningDriver.detail_file) {
        // นำที่อยู่ไฟล์มาเชื่อมกับชื่อไฟล์ของข้อมูลที่ต้องการจะลบ
        const filePath = path.join(__dirname, '../uploads/resignings', file_name);
        try {
          // ลบไฟล์ของข้อมูลที่ต้องการจะลบตาม path
          await fs.unlink(filePath);
        } catch (err) {
          return res.send({ message: 'Error deleting file', error: err.message });
        }
      }
    // ใน db ไม่มีไฟล์และมีการอัพไฟล์เข้ามา 
    } else if (file.length !== 0 && formData.detail_file_indb == null) {
      // วนลูปเพื่อลบทุกไฟล์
      for (const file_name of editDataResigningDriver.detail_file) {
        // นำที่อยู่ไฟล์มาเชื่อมกับชื่อไฟล์ของข้อมูลที่ต้องการจะลบ
        const filePath = path.join(__dirname, '../uploads/resignings', file_name);
        try {
          // ลบไฟล์ของข้อมูลที่ต้องการจะลบตาม path
          await fs.unlink(filePath);
        } catch (err) {
          return res.send({ message: 'Error deleting file', error: err.message });
        }
      }
      
      file.map((item) => {
        let new_name = Date.now() + '_' + item.originalname;

        let old_path = path.join( __dirname, `../uploads/resignings/${item.originalname}`); // ไฟล์ต้นทาง
        let new_path = path.join( __dirname, `../uploads/resignings/${new_name}` ); // ไฟล์ปลายทาง

        fs.rename(old_path, new_path);
        detail_file_array.push(new_name);
      })
    // ใน db มีไฟล์และมีการอัพไฟล์เข้ามา 
    } else if (file.length !== 0 && formData.detail_file_indb !== null) {
      // แปลงสตริงให้เป็นอาร์เรย์ 
      detail_file_array = formData.detail_file_indb.split(',');

      // ถ้ามีการลบไฟล์ที่มีอยู่แล้วใน db ออก
      if (detail_file_array.length !== editDataResigningDriver.detail_file.length) {
        // กรองเอาชื่อของไฟล์ที่ถูกลบ
        const delete_detail_file_array = editDataResigningDriver.detail_file.filter(item => !detail_file_array.includes(item));

        //console.log(delete_detail_file_array);
        // วนลูปเพื่อลบทุกไฟล์
        for (const file_name of delete_detail_file_array) {
          // นำที่อยู่ไฟล์มาเชื่อมกับชื่อไฟล์ของข้อมูลที่ต้องการจะลบ
          const filePath = path.join(__dirname, '../uploads/resignings', file_name);
          try {
            // ลบไฟล์ของข้อมูลที่ต้องการจะลบตาม path
            await fs.unlink(filePath);
          } catch (err) {
            return res.send({ message: 'Error deleting file', error: err.message });
          }
        }
      }

      file.map((item) => {
        let new_name = Date.now() + '_' + item.originalname;

        let old_path = path.join( __dirname, `../uploads/resignings/${item.originalname}`); // ไฟล์ต้นทาง
        let new_path = path.join( __dirname, `../uploads/resignings/${new_name}` ); // ไฟล์ปลายทาง

        fs.rename(old_path, new_path);
        detail_file_array.push(new_name);
      })
    // ใน db มีไฟล์และไม่มีการอัพไฟล์เข้ามา 
    } else if (file.length == 0 && formData.detail_file_indb !== null) {
      // แปลงสตริงให้เป็นอาร์เรย์ 
      detail_file_array = formData.detail_file_indb.split(',');

      // ถ้ามีการลบไฟล์ที่มีอยู่แล้วใน db ออก
      if (detail_file_array.length !== editDataResigningDriver.detail_file.length) {
        // กรองเอาชื่อของไฟล์ที่ถูกลบ
        const delete_detail_file_array = editDataResigningDriver.detail_file.filter(item => !detail_file_array.includes(item));

        //console.log(delete_detail_file_array);
        // วนลูปเพื่อลบทุกไฟล์
        for (const file_name of delete_detail_file_array) {
          // นำที่อยู่ไฟล์มาเชื่อมกับชื่อไฟล์ของข้อมูลที่ต้องการจะลบ
          const filePath = path.join(__dirname, '../uploads/resignings', file_name);
          try {
            // ลบไฟล์ของข้อมูลที่ต้องการจะลบตาม path
            await fs.unlink(filePath);
          } catch (err) {
            return res.send({ message: 'Error deleting file', error: err.message });
          }
        }
      }
    }

    //console.log("detail_file_array", detail_file_array);

    //formData.resign_driver = formData.resign_driver.replace(/\s+/g, " ");

    // ข้อมูลในกรณีที่ไม่ใส่ค่าอะไรเข้ามา ให้เปลี่ยนเป็นไอดีของไม่ใส่ข้อมูล
    if (formData.resign_unit == null) {
      formData.resign_unit = '3'
    } 
    if (formData.resign_network == null) {
      formData.resign_network = '29'
    } 
    if (formData.resign_customer == null) {
      formData.resign_customer = '240'
    } 
    if (formData.resign_plateNumber == null) {
      formData.resign_plateNumber = '10710'
    } 
    if (formData.resign_plateNumber_special == null) {
      formData.resign_plateNumber_special = '10710'
    } 
    if (formData.recruit_unit == null) {
      formData.recruit_unit = '3'
    } 
    if (formData.recruit_network == null) {
      formData.recruit_network = '29'
    } 
    if (formData.recruit_customer == null) {
      formData.recruit_customer = '240'
    } 
    if (formData.recruit_plateNumber == null) {
      formData.recruit_plateNumber = '10710'
    }
    if (formData.recruit_plateNumber_special == null) {
      formData.recruit_plateNumber_special = '10710'
    }
    if (formData.recruit_vehicleType == null) {
      formData.recruit_vehicleType = '33'
    }
    if (formData.recruit_serviceType == null) {
      formData.recruit_serviceType = '16'
    }
    // ถ้า resign_specialCase เป็น false ให้เปลี่ยนทะเบียนพิเศษเป็นไม่ใส่ข้อมูล
    if (formData.resign_specialCase == 0) {
      formData.resign_plateNumber_special = '10710'
    }
    if (formData.recruit_specialCase == 0) {
      formData.recruit_plateNumber_special = '10710'
    }
    // ถ้า resign_specialCase เป็น true ให้เปลี่ยนทะเบียนปกติเป็นไม่ใส่ข้อมูล เนื่องจากใช้ทะเบียนพิเศษเเทน
    if (formData.resign_specialCase == 1) {
      formData.resign_plateNumber = '10710'
    }
    if (formData.recruit_specialCase == 1) {
      formData.recruit_plateNumber = '10710'
    }

    // ถ้าชื่อคนขับลาออกใน database ไม่เป็นค่าว่างและมีการเปลี่ยนแปลงชื่อคนขับลาออก
    if (formData.resign_driver !== null && editDataResigningDriver.resign_driver !== formData.resign_driver) {
      return res.send({
        status: 'fail',
        message: 'ไม่สามารถเเก้ไขชื่อคนขับลาออกได้ กรุณาลบข้อมูลนี้และเเจ้งลาออกใหม่อีกครั้ง',
      })
    }
    // ถ้าทะเบียนลาออกใน database ไม่เป็นค่าว่างและมีการเปลี่ยนแปลงทะเบียนลาออก
    if (formData.resign_plateNumber !== '10710' && editDataResigningDriver.resign_plateNumber !== formData.resign_plateNumber) {
      return res.send({
        status: 'fail',
        message: 'ไม่สามารถเเก้ไขทะเบียนลาออกได้ กรุณาลบข้อมูลนี้และเเจ้งลาออกใหม่อีกครั้ง',
      })
    }
    // ถ้าทะเบียนลาออกพิเศษใน database ไม่เป็นค่าว่างและมีการเปลี่ยนแปลงทะเบียนลาออกพิเศษ
    if (formData.resign_plateNumber_special !== '10710' && editDataResigningDriver.resign_plateNumber_special !== formData.resign_plateNumber_special) {
      return res.send({
        status: 'fail',
        message: 'ไม่สามารถเเก้ไขทะเบียนลาออกพิเศษได้ กรุณาลบข้อมูลนี้และเเจ้งลาออกใหม่อีกครั้ง',
      })
    }
    // ถ้าทะเบียนสรรหาใน database ไม่เป็นค่าว่างและมีการเปลี่ยนแปลงทะเบียนสรรหา
    if (formData.recruit_plateNumber !== '10710' && editDataResigningDriver.recruit_plateNumber !== formData.recruit_plateNumber) {
      return res.send({
        status: 'fail',
        message: 'ไม่สามารถเเก้ไขทะเบียนสรรหาได้ กรุณาลบข้อมูลนี้และเเจ้งลาออกใหม่อีกครั้ง',
      })
    }
    // ถ้าทะเบียนสรรหาพิเศษใน database ไม่เป็นค่าว่างและมีการเปลี่ยนแปลงทะเบียนสรรหาพิเศษ
    if (formData.recruit_plateNumber_special !== '10710' && editDataResigningDriver.recruit_plateNumber_special !== formData.recruit_plateNumber_special) {
      return res.send({
        status: 'fail',
        message: 'ไม่สามารถเเก้ไขทะเบียนสรรหาพิเศษได้ กรุณาลบข้อมูลนี้และเเจ้งลาออกใหม่อีกครั้ง',
      })
    }


    const editResigningDriver = await ResigningDriverModel.update({
      resign_date: formData.resign_date,
      resign_prefix_driver: formData.resign_prefix_driver,
      // resign_driver: formData.resign_driver,
      resign_reason: formData.resign_reason,
      resign_specialCase: formData.resign_specialCase,
      recruit_date: formData.recruit_date,
      recruit_reason: formData.recruit_reason,
      recruit_specialCase: formData.recruit_specialCase,
      detail: formData.detail,
      detail_file: detail_file_array,
      approve: formData.approve,
      resign_unit: formData.resign_unit,
      resign_network: formData.resign_network,
      resign_customer: formData.resign_customer,
      // resign_plateNumber: formData.resign_plateNumber,
      // resign_plateNumber_special: formData.resign_plateNumber_special,
      recruit_unit: formData.recruit_unit,
      recruit_network: formData.recruit_network,
      recruit_customer: formData.recruit_customer,
      // recruit_plateNumber: formData.recruit_plateNumber,
      // recruit_plateNumber_special: formData.recruit_plateNumber_special,
      recruit_vehicleType: formData.recruit_vehicleType,
      recruit_serviceType: formData.recruit_serviceType,
    }, { where: { id: edit_id } })

    if (editResigningDriver == 0) {
      return res.send({
        status: 'fail',
        message: 'No Data Found',
        data: editResigningDriver
      })
    }

    // มีการเปลี่ยนจาก recruit_reason อื่นๆมาเป็น Resign
    if (editDataResigningDriver.recruit_reason !== 'Resign' && formData.recruit_reason == 'Resign') {
      // ดึงชื่อไฟล์ RecruitingDriver จากข้อมูลที่ต้องการจะลบ
      const deleteDataRecruitingDriver = await RecruitingDriverModel.findAll(
        { 
          attributes: ['driver_file'],
          where: { 
            resigningdriverId: edit_id,
            recruit_status: {
              [Op.ne]: ['รอสรรหา']
            },
          } 
        }
      )
      // ส่วนของการลบไฟล์ที่อยู่ใน RecruitingDriver
      for (const item of deleteDataRecruitingDriver) {
        const array_driver_file = item.driver_file
        // วนลูปเพื่อลบทุกไฟล์
        for (const file_name of array_driver_file) {
          // นำที่อยู่ไฟล์มาเชื่อมกับชื่อไฟล์ของข้อมูลที่ต้องการจะลบ
          const filePath = path.join(__dirname, '../uploads/recruitings', file_name);
          try {
            // ลบไฟล์ของข้อมูลที่ต้องการจะลบตาม path
            await fs.unlink(filePath);
          } catch (err) {
            return res.send({ message: 'Error deleting file', error: err.message });
          }
        }
      }

      // ลบข้อมูล RecruitingDriver ใน db
      const deleteRecruitingDriver = await RecruitingDriverModel.destroy(
        { 
          where: { 
            resigningdriverId: edit_id,
            recruit_status: {
              [Op.ne]: ['รอสรรหา']
            },
          } 
        }
      )

      // เเก้ไข RecruitingDriver ให้ recruit_status เป็น ลาออก
      const editRecruitingDriver = await RecruitingDriverModel.update({
        recruit_status: 'ลาออก',
        approve: formData.approve,
      }, {
        where: { 
          resigningdriverId: edit_id,
          recruit_status: {
            [Op.or]: ['รอสรรหา']
          },
        }
      })
    
    // มีการเปลี่ยนจาก Resign มาเป็น recruit_reason อื่นๆ
    } else if (editDataResigningDriver.recruit_reason == 'Resign' && formData.recruit_reason !== 'Resign') {
      // เเก้ไข RecruitingDriver ให้ recruit_status เป็น รอสรรหา
      const editRecruitingDriver = await RecruitingDriverModel.update({
        recruit_status: 'รอสรรหา',
        approve: formData.approve,
      }, {
        where: { 
          resigningdriverId: edit_id,
          recruit_status: {
            [Op.or]: ['ลาออก']
          },
        }
      })
    }

    res.send({
      status: 'success',
      message: 'Edit Resigning Driver With File Success',
      data: editResigningDriver,
    })

  } catch (error) {
    console.log(error);
  }
}

//------- PUT -------//

//------- DELETE -------// 
exports.resigningdriver_delete = async (req, res, next) => {
  try {
    const delete_id = req.params.id

    // ดึงชื่อไฟล์ RecruitingDriver จากข้อมูลที่ต้องการจะลบ
    const deleteDataRecruitingDriver = await RecruitingDriverModel.findAll(
      { 
        attributes: ['driver_file'],
        where: { resigningdriverId: delete_id } 
      }
    )
    // ดึงข้อมูล ResigningDriver ที่ต้องการจะลบ
    const deleteDataResigningDriver = await ResigningDriverModel.findOne(
      { 
        where: { id: delete_id } 
      }
    )
    if (deleteDataResigningDriver == null) {
      return res.send({
        status: 'fail',
        message: 'No Data Found',
        data: deleteDataResigningDriver
      })
    }

    // เมื่อทำการลบข้อมูลการลาออก ถ้าชื่อคนขับไม่เป็นค่าว่าง ให้เเก้ไขข้อมูลของคนขับที่ลาออก
    if (deleteDataResigningDriver.resign_driver !== null) {
      
    }

    // ส่วนของการลบไฟล์ที่อยู่ใน RecruitingDriver
    for (const item of deleteDataRecruitingDriver) {
      const array_driver_file = item.driver_file
      // วนลูปเพื่อลบทุกไฟล์
      for (const file_name of array_driver_file) {
        // นำที่อยู่ไฟล์มาเชื่อมกับชื่อไฟล์ของข้อมูลที่ต้องการจะลบ
        const filePath = path.join(__dirname, '../uploads/recruitings', file_name);
        try {
          // ลบไฟล์ของข้อมูลที่ต้องการจะลบตาม path
          await fs.unlink(filePath);
        } catch (err) {
          return res.send({ message: 'Error deleting file', error: err.message });
        }
      }
    }

    // ส่วนของการลบไฟล์ที่อยู่ใน ResigningDriver
    const array_detail_file = deleteDataResigningDriver.detail_file
    // วนลูปเพื่อลบทุกไฟล์
    for (const file_name of array_detail_file) {
      // นำที่อยู่ไฟล์มาเชื่อมกับชื่อไฟล์ของข้อมูลที่ต้องการจะลบ
      const filePath = path.join(__dirname, '../uploads/resignings', file_name);
      try {
        // ลบไฟล์ของข้อมูลที่ต้องการจะลบตาม path
        await fs.unlink(filePath);
      } catch (err) {
        return res.send({ message: 'Error deleting file', error: err.message });
      }
    }

    // ลบข้อมูล RecruitingDriver และ ResigningDriver ใน db
    const deleteRecruitingDriver = await RecruitingDriverModel.destroy(
      { where: { resigningdriverId: delete_id } }
    )
    const deleteResigningDriver = await ResigningDriverModel.destroy(
      { where: { id: delete_id } }
    )
    if (deleteResigningDriver == 0) {
      return res.send({
        status: 'fail',
        message: 'No Data Found',
        data: deleteResigningDriver
      })
    }

    res.send({
      status: 'success',
      message: 'Delete Resigning Driver Success',
      data: deleteResigningDriver,
    })
  } catch (error) {
    console.log(error);
  }
}

// exports.resigningdriver_get_all_bymonth_byyear = async (req, res, next) => {
//   try {
//     const selectMonth = req.params.month;
//     const selectYear = req.params.year;

//     // นำเดือนและปีมาหาวันเเรกและวันสุดท้ายของเดือน
//     let startDate = moment(`${selectYear}-${selectMonth}-01`, 'YYYY-MM-DD').format('YYYY-MM-DD');
//     let endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

//     const dataResigningDriver = await ResigningDriverModel.findAll(
//       {
//         include: [{
//           model: UnitModel,
//           as: "ResignUnit",
//           attributes: ['unit_name']
//         },
//         {
//           model: NetworkModel,
//           as: "ResignNetwork",
//           attributes: ['network_name']
//         },
//         {
//           model: CustomerModel,
//           as: "ResignCustomer",
//           attributes: ['customer_name']
//         },
//         {
//           model: VehicleModel,
//           as: "ResignPlateNumber",
//           attributes: ['plateNumber', 'vehicletypeId'],
//           include: [
//             {
//               model: VehicleTypeModel,
//               attributes: ['vehicletype_name']
//             }
//           ]
//         },
//         {
//           model: VehicleModel,
//           as: "ResignPlateNumberSpecial",
//           attributes: ['plateNumber', 'vehicletypeId'],
//           include: [
//             {
//               model: VehicleTypeModel,
//               attributes: ['vehicletype_name']
//             }
//           ]
//         },
//         {
//           model: UnitModel,
//           as: "RecruitUnit",
//           attributes: ['unit_name']
//         },
//         {
//           model: NetworkModel,
//           as: "RecruitNetwork",
//           attributes: ['network_name']
//         },
//         {
//           model: CustomerModel,
//           as: "RecruitCustomer",
//           attributes: ['customer_name']
//         },
//         {
//           model: VehicleModel,
//           as: "RecruitPlateNumber",
//           attributes: ['plateNumber', 'vehicletypeId'],
//           include: [
//             {
//               model: VehicleTypeModel,
//               attributes: ['vehicletype_name']
//             }
//           ]
//         },
//         {
//           model: VehicleModel,
//           as: "RecruitPlateNumberSpecial",
//           attributes: ['plateNumber', 'vehicletypeId'],
//           include: [
//             {
//               model: VehicleTypeModel,
//               attributes: ['vehicletype_name']
//             }
//           ]
//         },
//         {
//           model: ServiceTypeModel,
//           as: "RecruitServiceType",
//           attributes: ['servicetype_name']
//         },
//         {
//           model: VehicleTypeModel,
//           as: "RecruitVehicleType",
//           attributes: ['vehicletype_name']
//         }],
//         where: {
//           recruit_date: {
//             [Op.between]: [startDate, endDate],
//           },
//         },
//       }
//     )

//     const transformedData = []
//     for (const item of dataResigningDriver) {
//       // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
//       const startDateYear_resign = moment(item.resign_date).year();
//       const chooseVbkDB_resign = await choose_database_fromyear_vbk(startDateYear_resign)
//       const dataVehicleBookingStatusResign = await chooseVbkDB_resign.findOne({
//         include: [{
//           model: ServiceTypeModel,
//           attributes: ['servicetype_name']
//         },
//         {
//           model: TeamModel,
//           attributes: ['team_name']
//         }],
//         where: {
//           date: item.resign_date + " 07:00:00",
//           vehicleId: item.resign_plateNumber
//         },
//       })

//       // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
//       const startDateYear_recruit = moment(item.recruit_date).year();
//       const chooseVbkDB_recruit = await choose_database_fromyear_vbk(startDateYear_recruit)
//       const dataVehicleBookingStatusRecruit = await chooseVbkDB_recruit.findOne({
//         include: [{
//           model: ServiceTypeModel,
//           attributes: ['servicetype_name']
//         },
//         {
//           model: TeamModel,
//           attributes: ['team_name']
//         }],
//         where: {
//           date: item.recruit_date + " 07:00:00",
//           vehicleId: item.recruit_plateNumber
//         },
//       })

//       const dataRecruitingDriver = await RecruitingDriverModel.findAll(
//         {
//           where: {
//             resigningdriverId: item.id,
//             recruit_status: {
//               [Op.or]: ['ลาออก', 'รอสรรหา', 'นัดหมาย', 'เริ่มงาน']
//             },
//           },
//         }
//       )

//       // หาข้อมูล vbk ไม่เจอ เเสดงว่าไม่ได้กรอกข้อมูลส่วนนั้นเข้ามา ให้เปลี่ยนเป็น null ถ้ากรอกให้ใช้ข้อมูลปกติ
//       let resign_unit
//       let resign_unit_name
//       let resign_network
//       let resign_network_name
//       let resign_customer
//       let resign_customer_name
//       let resign_plateNumber
//       let resign_plateNumber_name
//       let resign_plateNumber_special
//       let resign_plateNumber_special_name
//       let resign_vehicletypeId
//       let resign_vehicletype_name
//       let resign_vehicletypeId_special
//       let resign_vehicletype_special_name
//       let resign_servicetypeId
//       let resign_servicetype_name
//       let resign_teamId
//       let resign_team_name
//       if (dataVehicleBookingStatusResign == null) {
//         if (item.resign_specialCase == 1) {
//           resign_unit = item.resign_unit
//           resign_unit_name = item.ResignUnit.unit_name
//           resign_network = item.resign_network
//           resign_network_name = item.ResignNetwork.network_name
//           resign_customer = item.resign_customer
//           resign_customer_name = item.ResignCustomer.customer_name
//           resign_plateNumber = null
//           resign_plateNumber_name = null
//           resign_plateNumber_special = item.resign_plateNumber_special
//           resign_plateNumber_special_name = item.ResignPlateNumberSpecial.plateNumber
//           resign_vehicletypeId = null
//           resign_vehicletype_name = null
//           resign_vehicletypeId_special = item.ResignPlateNumberSpecial.vehicletypeId
//           resign_vehicletype_special_name = item.ResignPlateNumberSpecial.vehicletype.vehicletype_name
//           resign_servicetypeId = null
//           resign_servicetype_name = null
//           resign_teamId = null
//           resign_team_name = null
//         } else if (item.resign_specialCase == 0) {
//           resign_unit = null
//           resign_unit_name = null
//           resign_network = null
//           resign_network_name = null
//           resign_customer = null
//           resign_customer_name = null
//           resign_plateNumber = null
//           resign_plateNumber_name = null
//           resign_plateNumber_special = null
//           resign_plateNumber_special_name = null
//           resign_vehicletypeId = null
//           resign_vehicletype_name = null
//           resign_vehicletypeId_special = null
//           resign_vehicletype_special_name = null
//           resign_servicetypeId = null
//           resign_servicetype_name = null
//           resign_teamId = null
//           resign_team_name = null
//         }
//       } else {
//         resign_unit = item.resign_unit
//         resign_unit_name = item.ResignUnit.unit_name
//         resign_network = item.resign_network
//         resign_network_name = item.ResignNetwork.network_name
//         resign_customer = item.resign_customer
//         resign_customer_name = item.ResignCustomer.customer_name
//         resign_plateNumber = item.resign_plateNumber
//         resign_plateNumber_name = item.ResignPlateNumber.plateNumber
//         resign_plateNumber_special = null
//         resign_plateNumber_special_name = null
//         resign_vehicletypeId = item.ResignPlateNumber.vehicletypeId
//         resign_vehicletype_name = item.ResignPlateNumber.vehicletype.vehicletype_name
//         resign_vehicletypeId_special = null
//         resign_vehicletype_special_name = null
//         resign_servicetypeId = dataVehicleBookingStatusResign.servicetypeId
//         resign_servicetype_name = dataVehicleBookingStatusResign.servicetype.servicetype_name
//         resign_teamId = dataVehicleBookingStatusResign.teamId
//         resign_team_name = dataVehicleBookingStatusResign.team.team_name
//       }

//       let recruit_unit
//       let recruit_unit_name
//       let recruit_network
//       let recruit_network_name
//       let recruit_customer
//       let recruit_customer_name
//       let recruit_plateNumber
//       let recruit_plateNumber_name
//       let recruit_plateNumber_special
//       let recruit_plateNumber_special_name
//       let recruit_vehicletypeId
//       let recruit_vehicletype_name
//       let recruit_vehicletypeId_special
//       let recruit_vehicletype_special_name
//       let recruit_servicetypeId
//       let recruit_servicetype_name
//       let recruit_teamId
//       let recruit_team_name
//       if (dataVehicleBookingStatusRecruit == null) {
//         if (item.recruit_specialCase == 1) {
//           recruit_unit = item.recruit_unit
//           recruit_unit_name = item.RecruitUnit.unit_name
//           recruit_network = item.recruit_network
//           recruit_network_name = item.RecruitNetwork.network_name
//           recruit_customer = item.recruit_customer
//           recruit_customer_name = item.RecruitCustomer.customer_name
//           recruit_plateNumber = null
//           recruit_plateNumber_name = null
//           recruit_plateNumber_special = item.recruit_plateNumber_special
//           recruit_plateNumber_special_name = item.RecruitPlateNumberSpecial.plateNumber
//           recruit_vehicletypeId = null
//           recruit_vehicletype_name = null
//           recruit_vehicletypeId_special = item.RecruitPlateNumberSpecial.vehicletypeId
//           recruit_vehicletype_special_name = item.RecruitPlateNumberSpecial.vehicletype.vehicletype_name
//           recruit_servicetypeId = null
//           recruit_servicetype_name = null
//           recruit_teamId = null
//           recruit_team_name = null
//         } else if (item.recruit_specialCase == 0) {
//           if (item.recruit_reason == "Spare") {
//             recruit_unit = item.recruit_unit
//             recruit_unit_name = item.RecruitUnit.unit_name
//             recruit_network = item.recruit_network
//             recruit_network_name = item.RecruitNetwork.network_nam
//             recruit_customer = item.recruit_customer
//             recruit_customer_name = item.RecruitCustomer.customer_name
//             recruit_plateNumber = null
//             recruit_plateNumber_name = null
//             recruit_plateNumber_special = null
//             recruit_plateNumber_special_name = null
//             recruit_vehicletypeId = item.recruit_vehicleType 
//             recruit_vehicletype_name = item.RecruitVehicleType.vehicletype_name
//             recruit_vehicletypeId_special = null
//             recruit_vehicletype_special_name = null
//             recruit_servicetypeId = item.recruit_serviceType 
//             recruit_servicetype_name = item.RecruitServiceType.servicetype_name
//             recruit_teamId = null
//             recruit_team_name = null
//           } else {
//             recruit_unit = null
//             recruit_unit_name = null
//             recruit_network = null
//             recruit_network_name = null
//             recruit_customer = null
//             recruit_customer_name = null
//             recruit_plateNumber = null
//             recruit_plateNumber_name = null
//             recruit_plateNumber_special = null
//             recruit_plateNumber_special_name = null
//             recruit_vehicletypeId = null
//             recruit_vehicletype_name = null
//             recruit_vehicletypeId_special = null
//             recruit_vehicletype_special_name = null
//             recruit_servicetypeId = null
//             recruit_servicetype_name = null
//             recruit_teamId = null
//             recruit_team_name = null
//           }
//         }
//       } else {
//         recruit_unit = item.recruit_unit
//         recruit_unit_name = item.RecruitUnit.unit_name
//         recruit_network = item.recruit_network
//         recruit_network_name = item.RecruitNetwork.network_name
//         recruit_customer = item.recruit_customer
//         recruit_customer_name = item.RecruitCustomer.customer_name
//         recruit_plateNumber = item.recruit_plateNumber
//         recruit_plateNumber_name = item.RecruitPlateNumber.plateNumber
//         recruit_plateNumber_special = null
//         recruit_plateNumber_special_name = null
//         recruit_vehicletypeId = item.RecruitPlateNumber.vehicletypeId
//         recruit_vehicletype_name = item.RecruitPlateNumber.vehicletype.vehicletype_name
//         recruit_vehicletypeId_special = null
//         recruit_vehicletype_special_name = null
//         recruit_servicetypeId = dataVehicleBookingStatusRecruit.servicetypeId
//         recruit_servicetype_name = dataVehicleBookingStatusRecruit.servicetype.servicetype_name
//         recruit_teamId = dataVehicleBookingStatusRecruit.teamId
//         recruit_team_name = dataVehicleBookingStatusRecruit.team.team_name
//       }

//       let recruit_status
//       if (dataRecruitingDriver[0].recruit_status == 'ลาออก') {
//         recruit_status = 'ลาออก'
//       } 
//       if (dataRecruitingDriver[0].recruit_status == 'รอสรรหา') {
//         recruit_status = 'รอสรรหา'
//       } 
//       if (dataRecruitingDriver[dataRecruitingDriver.length-1].recruit_status == 'นัดหมาย') {
//         recruit_status = 'กำลังสรรหา'
//       } 
//       if (dataRecruitingDriver[dataRecruitingDriver.length-1].recruit_status == 'เริ่มงาน') {
//         recruit_status = 'เสร็จสิ้น'
//       }
 
//       const dataindex = {
//         "id": item.id,
//         "resign_date": item.resign_date,
//         "resign_prefix_driver": item.resign_prefix_driver,
//         "resign_driver": item.resign_driver,
//         "resign_reason": item.resign_reason,
//         "resign_specialCase": item.resign_specialCase,
//         "recruit_date": item.recruit_date,
//         "recruit_reason": item.recruit_reason,
//         "recruit_specialCase": item.recruit_specialCase,
//         "detail": item.detail,
//         "detail_file": item.detail_file,
//         "recruit_status": recruit_status,
//         "approve": item.approve,
//         "createdAt": item.createdAt,
//         "updatedAt": item.updatedAt,

//         "resign_unit": resign_unit,
//         "resign_unit_name": resign_unit_name,
//         "resign_network": resign_network,
//         "resign_network_name": resign_network_name,
//         "resign_customer": resign_customer,
//         "resign_customer_name": resign_customer_name,
//         "resign_plateNumber": resign_plateNumber,
//         "resign_plateNumber_name": resign_plateNumber_name,
//         "resign_plateNumber_special": resign_plateNumber_special,
//         "resign_plateNumber_special_name": resign_plateNumber_special_name,
//         "resign_vehicletypeId": resign_vehicletypeId,
//         "resign_vehicletype_name": resign_vehicletype_name,
//         "resign_vehicletypeId_special": resign_vehicletypeId_special,
//         "resign_vehicletype_special_name": resign_vehicletype_special_name,
//         "resign_servicetypeId": resign_servicetypeId,
//         "resign_servicetype_name": resign_servicetype_name,
//         "resign_teamId": resign_teamId,
//         "resign_team_name": resign_team_name,

//         "recruit_unit": recruit_unit,
//         "recruit_unit_name": recruit_unit_name,
//         "recruit_network": recruit_network,
//         "recruit_network_name": recruit_network_name,
//         "recruit_customer": recruit_customer,
//         "recruit_customer_name": recruit_customer_name,
//         "recruit_plateNumber": recruit_plateNumber,
//         "recruit_plateNumber_name": recruit_plateNumber_name,
//         "recruit_plateNumber_special": recruit_plateNumber_special,
//         "recruit_plateNumber_special_name": recruit_plateNumber_special_name,
//         "recruit_vehicletypeId": recruit_vehicletypeId,
//         "recruit_vehicletype_name": recruit_vehicletype_name,
//         "recruit_vehicletypeId_special": recruit_vehicletypeId_special,
//         "recruit_vehicletype_special_name": recruit_vehicletype_special_name,
//         "recruit_servicetypeId": recruit_servicetypeId,
//         "recruit_servicetype_name": recruit_servicetype_name,
//         "recruit_teamId": recruit_teamId,
//         "recruit_team_name": recruit_team_name,
//       }
//       transformedData.push(dataindex)
//     }

//     res.send({
//       status: 'success',
//       message: 'Get All Resigning Driver Success',
//       length: dataResigningDriver.length,
//       data: transformedData
//     });
    
//   } catch (error) {
//     console.log(error);
//   }
// }