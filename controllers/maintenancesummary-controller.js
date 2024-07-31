const db = require("../models");
const moment = require("moment");
const path = require('path');
const fs = require('fs').promises;


const MaintenanceSummaryModel = db.MaintenanceSummaryModel
const CustomerModel = db.CustomerModel
const NetworkModel = db.NetworkModel
const ServiceTypeModel = db.ServiceTypeModel
const VehicleTypeModel = db.VehicleTypeModel
const VehicleModel = db.VehicleModel

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

//------- GET -------//
exports.maintenancesummary_get_all_bymonth_byyear = async (req, res, next) => {
  try {
    const selectMonth = req.params.month;
    const selectYear = req.params.year;

    // นำเดือนและปีมาหาวันเเรกและวันสุดท้ายของเดือน
    let startDate = moment(`${selectYear}-${selectMonth}-01`, 'YYYY-MM-DD').format('YYYY-MM-DD');
    let endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

    console.log(startDate);
    console.log(endDate);

    const dataMaintenanceSummary = await MaintenanceSummaryModel.findAll(
      {
        include: [{
          model: CustomerModel,
          attributes: ['id', 'customer_name']
        },
        {
          model: NetworkModel,
          attributes: ['id', 'network_name']
        },
        {
          model: ServiceTypeModel,
          attributes: ['id', 'servicetype_name']
        }],
        where: {
          inform_date: {
            [Op.between]: [startDate, endDate],
          },
        },
      }
    )

    const transformedData = []
    for (const item of dataMaintenanceSummary) {
      const dataVehicle = await VehicleModel.findOne(
        {
          include: [{
            model: VehicleTypeModel,
            attributes: ['id', 'vehicletype_name']
          }],
          where: {plateNumber: item.plateNumber} 
        }
      )
      let vehicleType
      if (dataVehicle == null) {
        vehicleType = 'N/A'
      } else {
        vehicleType = dataVehicle.vehicletype.vehicletype_name
      }

      const dataindex = {
        "id": item.id,
        "inform_code": item.inform_code,
        "inform_date": item.inform_date,
        "month": selectMonth,
        "plateNumber": item.plateNumber,
        "vehicletype_name": vehicleType,
        "customer_id": item.customer.id,
        "customer_name": item.customer.customer_name,
        "network_id": item.network.id,
        "network_name": item.network.network_name,
        "servicetype_id": item.servicetype.id,
        "servicetype_name": item.servicetype.servicetype_name,
        "driver_name": item.driver_name,
        "distance_mile": item.distance_mile,
        "problem_detail": item.problem_detail,
        "maintenance_detail": item.maintenance_detail,
        "maintenance_type": item.maintenance_type,
        "maintenance_weight": item.maintenance_weight,
        "maintenance_status": item.maintenance_status,
        "quotation_number": item.quotation_number,
        "repair_shop": item.repair_shop,
        "payment": item.payment,
        "accounting_number": item.accounting_number,
        "price": item.price,
        "driver_price": item.driver_price,
        "driver_price_status": item.driver_price_status,
        "note": item.note,
        "sma_date": item.sma_date,
        "sma_date_count": item.sma_date_count,
        "pfma_date": item.pfma_date,
        "fma_date": item.fma_date,
        "fma_date_count": item.fma_date_count,
        "receive_date": item.receive_date,
        "ma_file": item.ma_file,
        "debt_account": item.debt_account,
        "note_front": item.note_front
      }

      transformedData.push(dataindex)
    }

    res.send({
      length: transformedData.length,
      status: 'success',
      message: 'Get Maintenance Summary Success',
      data: transformedData
    });
  } catch (error) {
    console.log(error);
  }
}
exports.maintenancesummary_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id

    const dMS = await MaintenanceSummaryModel.findOne(
      {
        include: [{
          model: CustomerModel,
          attributes: ['id', 'customer_name']
        },
        {
          model: NetworkModel,
          attributes: ['id', 'network_name']
        },
        {
          model: ServiceTypeModel,
          attributes: ['id', 'servicetype_name']
        }],
        where: { id: get_id }
      }
    )

    if (dMS == null) {
      return res.send({
        status: 'fail',
        message: 'No Data Found',
        data: dMS
      })
    }

    const dataVehicle = await VehicleModel.findOne(
      {
        include: [{
          model: VehicleTypeModel,
          attributes: ['id', 'vehicletype_name']
        }],
        where: {plateNumber: dMS.plateNumber} 
      }
    )
    let vehicleType
    if (dataVehicle == null) {
      vehicleType = 'N/A'
    } else {
      vehicleType = dataVehicle.vehicletype.vehicletype_name
    }

    const transformedData = {
      "id": dMS.id,
      "inform_code": dMS.inform_code,
      "inform_date": dMS.inform_date,
      "month": moment(dMS.inform_date).month() + 1,
      "plateNumber": dMS.plateNumber,
      "vehicletype_name": vehicleType,
      "customer_id": dMS.customer.id,
      "customer_name": dMS.customer.customer_name,
      "network_id": dMS.network.id,
      "network_name": dMS.network.network_name,
      "servicetype_id": dMS.servicetype.id,
      "servicetype_name": dMS.servicetype.servicetype_name,
      "driver_name": dMS.driver_name,
      "distance_mile": dMS.distance_mile,
      "problem_detail": dMS.problem_detail,
      "maintenance_detail": dMS.maintenance_detail,
      "maintenance_type": dMS.maintenance_type,
      "maintenance_weight": dMS.maintenance_weight,
      "maintenance_status": dMS.maintenance_status,
      "quotation_number": dMS.quotation_number,
      "repair_shop": dMS.repair_shop,
      "payment": dMS.payment,
      "accounting_number": dMS.accounting_number,
      "price": dMS.price,
      "driver_price": dMS.driver_price,
      "driver_price_status": dMS.driver_price_status,
      "note": dMS.note,
      "sma_date": dMS.sma_date,
      "sma_date_count": dMS.sma_date_count,
      "pfma_date": dMS.pfma_date,
      "fma_date": dMS.fma_date,
      "fma_date_count": dMS.fma_date_count,
      "receive_date": dMS.receive_date,
      "ma_file": dMS.ma_file,
      "debt_account": dMS.debt_account,
      "note_front": dMS.note_front
    }

    res.send({
      status: 'success',
      message: 'Get Maintenance Summary Success',
      data: transformedData
    });
  } catch (error) {
    console.log(error);
  }
}

//------- POST -------//
exports.maintenancesummary_post = async (req, res, next) => {
  try {
    const {
        inform_date,
        plateNumber,
        customer_id,
        network_id,
        servicetype_id,
        driver_name,
        distance_mile,
        problem_detail,
        maintenance_detail,
        maintenance_type,
        maintenance_weight,
        maintenance_status,
        quotation_number,
        repair_shop,
        payment,
        accounting_number,
        price,
        driver_price,
        driver_price_status,
        note,
        sma_date,
        sma_date_count,
        pfma_date,
        fma_date,
        fma_date_count,
        receive_date,
        debt_account,
        note_front
    } = req.body

    // ดึงเดือนและปี
    const month = moment(inform_date).format('MM'); // เดือนในรูปแบบ 2 หลัก
    const yearAD = moment(inform_date).format('YYYY'); // ปีในรูปแบบ 4 หลัก
    // แปลงปีเป็นพุทธศักราช (พ.ศ.)
    const yearBE = parseInt(yearAD) + 543;

    // ดึงข้อมูลล่าสุดของเดือนที่ต้องการบันทึกข้อมูลเพื่อดู inform_code ล่าสุด
    const dataMaintenanceSummary = await MaintenanceSummaryModel.findOne(
      {
        where: { inform_date: inform_date },
        order: [['createdAt', 'DESC']]
      }
    )

    let inform_code
    // ถ้าเดือนนี้ยังไม่มีข้อมูล
    if (dataMaintenanceSummary == null) {
      inform_code = `001/${month}/${yearBE}`
    // ถ้าเดือนนี้มีข้อมูล
    } else {
      // ดึงลำดับออกมาเป็น int
      const fullInformCode = dataMaintenanceSummary.inform_code
      const numberInformCode = fullInformCode.substring(0, 3);
      const intNumberInformCode = parseInt(numberInformCode);

      // บวกลำดับเพิ่มอีก 1 แล้วเเปลงเป็น string
      const newIntNumberInformCode = intNumberInformCode + 1
      const newNumberInformCode = newIntNumberInformCode.toString().padStart(3, '0'); // เติม '0' ข้างหน้าให้มีความยาวรวม 3 ตัวอักษร

      console.log(newNumberInformCode); // "001"

      inform_code = `${newNumberInformCode}/${month}/${yearBE}`
    }

    const createMaintenanceSummary = await MaintenanceSummaryModel.create({
      inform_code: inform_code,
      inform_date: inform_date,
      plateNumber: plateNumber,
      customerId: customer_id,
      networkId: network_id,
      servicetypeId: servicetype_id,
      driver_name: driver_name,
      distance_mile: distance_mile,
      problem_detail: problem_detail,
      maintenance_detail: maintenance_detail,
      maintenance_type: maintenance_type,
      maintenance_weight: maintenance_weight,
      maintenance_status: maintenance_status,
      quotation_number: quotation_number,
      repair_shop: repair_shop,
      payment: payment,
      accounting_number: accounting_number,
      price: price,
      driver_price: driver_price,
      driver_price_status: driver_price_status,
      note: note,
      sma_date: sma_date,
      sma_date_count: sma_date_count,
      pfma_date: pfma_date,
      fma_date: fma_date,
      fma_date_count: fma_date_count,
      receive_date: receive_date,
      debt_account: debt_account,
      note_front: note_front
    })

    res.send({
      status: 'success',
      message: 'Add Maintenance Summary Success',
      data: createMaintenanceSummary,
    })
  } catch (error) {
    console.log(error);
  }
}
exports.maintenancesummarywithfile_post = async (req, res, next) => {
  try {
    // ข้อมูลที่ไม่ใช่ไฟล์
    const formData = req.body;
    // ข้อมูลไฟล์ที่ถูกอัพโหลด
    const file = req.files;
    // นำชื่อไฟล์ที่อัพโหลดเก็บเข้าไปใน array
    const ma_file_array = []
    file.map((item) => {
      ma_file_array.push(item.originalname);
    })

    // ดึงเดือนและปี
    const month = moment(formData.inform_date).format('MM'); // เดือนในรูปแบบ 2 หลัก
    const yearAD = moment(formData.inform_date).format('YYYY'); // ปีในรูปแบบ 4 หลัก
    // แปลงปีเป็นพุทธศักราช (พ.ศ.)
    const yearBE = parseInt(yearAD) + 543;

    // ดึงข้อมูลล่าสุดของเดือนที่ต้องการบันทึกข้อมูลเพื่อดู inform_code ล่าสุด
    const dataMaintenanceSummary = await MaintenanceSummaryModel.findOne(
      {
        where: { inform_date: formData.inform_date },
        order: [['createdAt', 'DESC']]
      }
    )

    let inform_code
    // ถ้าเดือนนี้ยังไม่มีข้อมูล
    if (dataMaintenanceSummary == null) {
      inform_code = `001/${month}/${yearBE}`
    // ถ้าเดือนนี้มีข้อมูล
    } else {
      // ดึงลำดับออกมาเป็น int
      const fullInformCode = dataMaintenanceSummary.inform_code
      const numberInformCode = fullInformCode.substring(0, 3);
      const intNumberInformCode = parseInt(numberInformCode);

      // บวกลำดับเพิ่มอีก 1 แล้วเเปลงเป็น string
      const newIntNumberInformCode = intNumberInformCode + 1
      const newNumberInformCode = newIntNumberInformCode.toString().padStart(3, '0'); // เติม '0' ข้างหน้าให้มีความยาวรวม 3 ตัวอักษร

      console.log(newNumberInformCode); // "001"

      inform_code = `${newNumberInformCode}/${month}/${yearBE}`
    }

    const createMaintenanceSummary = await MaintenanceSummaryModel.create({
      inform_code: inform_code,
      inform_date: formData.inform_date,
      plateNumber: formData.plateNumber,
      customerId: formData.customer_id,
      networkId: formData.network_id,
      servicetypeId: formData.servicetype_id,
      driver_name: formData.driver_name,
      distance_mile: formData.distance_mile,
      problem_detail: formData.problem_detail,
      maintenance_detail: formData.maintenance_detail,
      maintenance_type: formData.maintenance_type,
      maintenance_weight: formData.maintenance_weight,
      maintenance_status: formData.maintenance_status,
      quotation_number: formData.quotation_number,
      repair_shop: formData.repair_shop,
      payment: formData.payment,
      accounting_number: formData.accounting_number,
      price: formData.price,
      driver_price: formData.driver_price,
      driver_price_status: formData.driver_price_status,
      note: formData.note,
      sma_date: formData.sma_date,
      sma_date_count:formData. sma_date_count,
      pfma_date: formData.pfma_date,
      fma_date: formData.fma_date,
      fma_date_count: formData.fma_date_count,
      receive_date: formData.receive_date,
      ma_file: ma_file_array,
      debt_account: formData.debt_account,
      note_front: formData.note_front
    })

    res.send({
      status: 'success',
      message: 'Add Maintenance Summary With File Success',
      data: createMaintenanceSummary,
    })
  } catch (error) {
    console.log(error);
  }
}
exports.maintenancesummarywithfile_put = async (req, res, next) => {
  try {
  const edit_id = req.params.id

  // ข้อมูลที่ไม่ใช่ไฟล์
  const formData = req.body;
  // ข้อมูลไฟล์ที่ถูกอัพโหลด
  const file = req.files;
  // นำชื่อไฟล์ที่อัพโหลดเก็บเข้าไปใน array
  let ma_file_array = []
  // ถ้ามีการเปลี่ยนเเปลงไฟล์ ให้เปลี่ยนเป็นชื่อไฟล์ใหม่
  if (file.length !== 0) {
    file.map((item) => {
      ma_file_array.push(item.originalname);
    })
  // ถ้าไม่มีการเปลี่ยนเเปลงไฟล์ ให้ใช้ชื่อไฟล์เดิมจาก ma_file
  } else {
    ma_file_array = formData.ma_file.split(',');
  }

  const editMaintenanceSummary = await MaintenanceSummaryModel.update({
    plateNumber: formData.plateNumber,
    customerId: formData.customer_id,
    networkId: formData.network_id,
    servicetypeId: formData.servicetype_id,
    driver_name: formData.driver_name,
    distance_mile: formData.distance_mile,
    problem_detail: formData.problem_detail,
    maintenance_detail: formData.maintenance_detail,
    maintenance_type: formData.maintenance_type,
    maintenance_weight: formData.maintenance_weight,
    maintenance_status: formData.maintenance_status,
    quotation_number: formData.quotation_number,
    repair_shop: formData.repair_shop,
    payment: formData.payment,
    accounting_number: formData.accounting_number,
    price: formData.price,
    driver_price: formData.driver_price,
    driver_price_status: formData.driver_price_status,
    note: formData.note,
    sma_date: formData.sma_date,
    sma_date_count:formData. sma_date_count,
    pfma_date: formData.pfma_date,
    fma_date: formData.fma_date,
    fma_date_count: formData.fma_date_count,
    receive_date: formData.receive_date,
    ma_file: ma_file_array,
    debt_account: formData.debt_account,
    note_front: formData.note_front
  }, { where: { id: edit_id } })

  if (editMaintenanceSummary == 0) {
    return res.send({
      status: 'fail',
      message: 'No Data Found',
      data: editMaintenanceSummary
    })
  }

  res.send({
    status: 'success',
    message: 'Edit Maintenance Summary Success',
    data: editMaintenanceSummary,
  })
  } catch (error) {
    console.log(error);
  }
}

//------- PUT -------//
exports.maintenancesummary_put = async (req, res, next) => {
  try {
    const {
      plateNumber,
      customer_id,
      network_id,
      servicetype_id,
      driver_name,
      distance_mile,
      problem_detail,
      maintenance_detail,
      maintenance_type,
      maintenance_weight,
      maintenance_status,
      quotation_number,
      repair_shop,
      payment,
      accounting_number,
      price,
      driver_price,
      driver_price_status,
      note,
      sma_date,
      sma_date_count,
      pfma_date,
      fma_date,
      fma_date_count,
      receive_date,
      file,
      debt_account,
      note_front
  } = req.body

  const edit_id = req.params.id

  const editMaintenanceSummary = await MaintenanceSummaryModel.update({
    plateNumber: plateNumber,
    customerId: customer_id,
    networkId: network_id,
    servicetypeId: servicetype_id,
    driver_name: driver_name,
    distance_mile: distance_mile,
    problem_detail: problem_detail,
    maintenance_detail: maintenance_detail,
    maintenance_type: maintenance_type,
    maintenance_weight: maintenance_weight,
    maintenance_status: maintenance_status,
    quotation_number: quotation_number,
    repair_shop: repair_shop,
    payment: payment,
    accounting_number: accounting_number,
    price: price,
    driver_price: driver_price,
    driver_price_status: driver_price_status,
    note: note,
    sma_date: sma_date,
    sma_date_count: sma_date_count,
    pfma_date: pfma_date,
    fma_date: fma_date,
    fma_date_count: fma_date_count,
    receive_date: receive_date,
    file: file,
    debt_account: debt_account,
    note_front: note_front
  }, { where: { id: edit_id } })

  if (editMaintenanceSummary == 0) {
    return res.send({
      status: 'fail',
      message: 'No Data Found',
      data: editMaintenanceSummary
    })
  }

  res.send({
    status: 'success',
    message: 'Edit Maintenance Summary Success',
    data: editMaintenanceSummary,
  })
  } catch (error) {
    console.log(error);
  }
}

//------- DELETE -------//
exports.maintenancesummary_delete = async (req, res, next) => {
  try {
    const delete_id = req.params.id

    // ดึงชื่อไฟล์จากข้อมูลที่ต้องการจะลบ
    const deleteDataMaintenanceSummary = await MaintenanceSummaryModel.findOne(
      { where: { id: delete_id } }
    )

    if (deleteDataMaintenanceSummary == null) {
      return res.send({
        status: 'fail',
        message: 'No Data Found',
        data: deleteDataMaintenanceSummary
      })
    }

    const array_ma_file = deleteDataMaintenanceSummary.ma_file
    // วนลูปเพื่อลบทุกไฟล์
    for (const file_name of array_ma_file) {
      // นำที่อยู่ไฟล์มาเชื่อมกับชื่อไฟล์ของข้อมูลที่ต้องการจะลบ
      const filePath = path.join(__dirname, '../uploads', file_name);
      try {
        // ลบไฟล์ของข้อมูลที่ต้องการจะลบตาม path
        await fs.unlink(filePath);
      } catch (err) {
        return res.send({ message: 'Error deleting file', error: err.message });
      }
    }

    const deleteMaintenanceSummary = await MaintenanceSummaryModel.destroy(
      { where: { id: delete_id } }
    )

    if (deleteMaintenanceSummary == 0) {
      return res.send({
        status: 'fail',
        message: 'No Data Found',
        data: deleteMaintenanceSummary
      })
    }

    res.send({
      status: 'success',
      message: 'Delete Maintenance Summary Success',
      data: deleteMaintenanceSummary,
    })
  } catch (error) {
    console.log(error);
  }
}