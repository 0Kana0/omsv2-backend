const db = require("../models");
const moment = require("moment");
const path = require('path');
const fs = require('fs').promises;
const exceljs = require('exceljs')

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

    // console.log(startDate);
    // console.log(endDate);

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

      let wma_date_count
      if (item.sma_date == null) {
        wma_date_count = null;
      } else {
        wma_date_count = moment(item.sma_date).diff(moment(item.inform_date), 'days');
      }
      let lfma_date_count
      if (item.fma_date == null || item.pfma_date == null) {
        lfma_date_count = null;
      } else {
        lfma_date_count = moment(item.fma_date).diff(moment(item.pfma_date), 'days');
      }

      const dataindex = {
        "id": item.id,
        "check_code": item.check_code,
        "ma_case": item.ma_case,
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
        "maintenance_subject": item.maintenance_subject,
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
        "totalKDRCosts": item.price-item.driver_price,
        "sma_date": item.sma_date,
        "wma_date_count": wma_date_count,
        "pfma_date": item.pfma_date,
        "fma_date": item.fma_date,
        "lfma_date_count": lfma_date_count,
        "receive_date": item.receive_date,
        "ma_file": item.ma_file,
        "note_front": item.note_front,
        "original_doc": item.original_doc,
        "cd_date": item.cd_date,
        "createBy": item.createBy,
        "updateBy": item.updateBy,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,
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

    let wma_date_count
    if (dMS.sma_date == null) {
      wma_date_count = null;
    } else {
      wma_date_count = moment(dMS.sma_date).diff(moment(dMS.inform_date), 'days');
    }
    let lfma_date_count
    if (dMS.fma_date == null || dMS.pfma_date == null) {
      lfma_date_count = null;
    } else {
      lfma_date_count = moment(dMS.fma_date).diff(moment(dMS.pfma_date), 'days');
    }

    const transformedData = {
      "id": dMS.id,
      "check_code": dMS.check_code,
      "ma_case": dMS.ma_case,
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
      "maintenance_subject": dMS.maintenance_subject,
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
      "totalKDRCosts": dMS.price-dMS.driver_price,
      "sma_date": dMS.sma_date,
      "wma_date_count": wma_date_count,
      "pfma_date": dMS.pfma_date,
      "fma_date": dMS.fma_date,
      "lfma_date_count": lfma_date_count,
      "receive_date": dMS.receive_date,
      "ma_file": dMS.ma_file,
      "note_front": dMS.note_front,
      "original_doc": dMS.original_doc,
      "cd_date": dMS.cd_date,
      "createBy": dMS.createBy,
      "updateBy": dMS.updateBy,
      "createdAt": dMS.createdAt,
      "updatedAt": dMS.updatedAt,
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

exports.maintenancesummary_get_all_bymonth_byyear_withexcel = async (req, res, next) => {
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
    // หาชื่อวันภาษาไทยจากเลขเดือน-1
    const monthText = monthList[selectMonth-1];
    
    // เซต column ต่างๆสำหรับ excel
    let workbook = new exceljs.Workbook()
    const sheet = workbook.addWorksheet("MA")
    sheet.columns = [
      { header: "check_code", key: "check_code", width: 15 },
      { header: "MA ที่รับเคส", key: "ma_case", width: 15 },
      { header: "รหัสแจ้งซ่อม", key: "inform_code", width: 15 },
      { header: "วันที่แจ้งซ่อม", key: "inform_date", width: 15 },
      { header: "เดือน", key: "month", width: 15 },
      { header: "เลขทะเบียน", key: "plateNumber", width: 15 },
      { header: "ประเภทรถ", key: "vehicletype_name", width: 15 },
      { header: "ชื่อโปรเจค", key: "customer_name", width: 15 },
      { header: "Network", key: "network_name", width: 15 },
      { header: "ประเภทการจ้างงาน", key: "servicetype_name", width: 15 },
      { header: "ชื่อพนักงานขับรถ", key: "driver_name", width: 15 },
      { header: "เลขไมล์(ก.ม.)", key: "distance_mile", width: 15 },
      { header: "คำอธิบายปัญหา", key: "problem_detail", width: 15 },
      { header: "คำอธิบายการซ่อม", key: "maintenance_detail", width: 15 },
      { header: "ประเภทการซ่อม(PM , CM)", key: "maintenance_type", width: 15 },
      { header: "ซ่อมเรื่อง", key: "maintenance_subject", width: 15 },
      { header: "ความหนัก-เบา", key: "maintenance_weight", width: 15 },
      { header: "สถานะการซ่อมแซม", key: "maintenance_status", width: 15 },
      { header: "เลขที่ใบเสนอราคา", key: "quotation_number", width: 15 },
      { header: "ชื่ออู่ซ่อมรถ", key: "repair_shop", width: 15 },
      { header: "เงินสด/เครดิค", key: "payment", width: 15 },
      { header: "เลขที่เอกสารบัญชี", key: "accounting_number", width: 15 },
      { header: "ค่าใช้จ่าย(บาท)", key: "price", width: 15 },
      { header: "ยอดที่ใช้หักพขร.", key: "driver_price", width: 15 },
      { header: "สามารถหักพขร.ได้หรือไม่", key: "driver_price_status", width: 15 },
      { header: "หมายเหตุ", key: "note", width: 15 },
      { header: "Total KDR Costs", key: "totalKDRCosts", width: 15 },
      { header: "วันเริ่มซ่อม", key: "sma_date", width: 15 },
      { header: "จำนวนวันรอซ่อม", key: "wma_date_count", width: 15 },
      { header: "วันที่คาดว่าจะซ่อมเสร็จ", key: "pfma_date", width: 15 },
      { header: "วันที่ซ่อมเสร็จ", key: "fma_date", width: 15 },
      { header: "จำนวนวันซ่อมเสร็จล่าช้า", key: "lfma_date_count", width: 15 },
      { header: "วันที่รับรถ", key: "receive_date", width: 15 },
      { header: "ไฟล์แนบ", key: "ma_file", width: 20 },
      { header: "หมายเหตุของหน้างาน", key: "note_front", width: 15 },
      { header: "เอกสารต้นฉบับ", key: "original_doc", width: 15 },
      { header: "วันที่เบิกเงินสดย่อย", key: "cd_date", width: 15 },
      { header: "รายชื่อคนอัพ", key: "createBy", width: 15 },
      { header: "รายชื่อคนเเก้ไข", key: "updateBy", width: 15 },
      { header: "เวลาที่สร้าง", key: "createdAt", width: 15 },
      { header: "เวลาที่เเก้ไข", key: "updatedAt", width: 15 },
    ]

    // นำเดือนและปีมาหาวันเเรกและวันสุดท้ายของเดือน
    let startDate = moment(`${selectYear}-${selectMonth}-01`, 'YYYY-MM-DD').format('YYYY-MM-DD');
    let endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

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

      let wma_date_count
      if (item.sma_date == null) {
        wma_date_count = null;
      } else {
        wma_date_count = moment(item.sma_date).diff(moment(item.inform_date), 'days');
      }
      let lfma_date_count
      if (item.fma_date == null || item.pfma_date == null) {
        lfma_date_count = null;
      } else {
        lfma_date_count = moment(item.fma_date).diff(moment(item.pfma_date), 'days');
      }

      const ma_file_array = []
      item.ma_file.map((item) => {
        ma_file_array.push('http://kdrtransport.in.th:8081/uploads/'+ item);
      })
      
      sheet.addRow({
        check_code: item.check_code,
        ma_case: item.ma_case,
        inform_code: item.inform_code,
        inform_date: item.inform_date,
        month: selectMonth,
        plateNumber: item.plateNumber,
        vehicletype_name: vehicleType,
        customer_id: item.customer.id,
        customer_name: item.customer.customer_name,
        network_id: item.network.id,
        network_name: item.network.network_name,
        servicetype_id: item.servicetype.id,
        servicetype_name: item.servicetype.servicetype_name,
        driver_name: item.driver_name,
        distance_mile: item.distance_mile,
        problem_detail: item.problem_detail,
        maintenance_detail: item.maintenance_detail,
        maintenance_type: item.maintenance_type,
        maintenance_subject: item.maintenance_subject,
        maintenance_weight: item.maintenance_weight,
        maintenance_status: item.maintenance_status,
        quotation_number: item.quotation_number,
        repair_shop: item.repair_shop,
        payment: item.payment,
        accounting_number: item.accounting_number,
        price: item.price,
        driver_price: item.driver_price,
        driver_price_status: item.driver_price_status,
        note: item.note,
        totalKDRCosts: item.price-item.driver_price,
        sma_date: item.sma_date,
        wma_date_count: wma_date_count,
        pfma_date: item.pfma_date,
        fma_date: item.fma_date,
        lfma_date_count: lfma_date_count,
        receive_date: item.receive_date,
        ma_file: ma_file_array,
        note_front: item.note_front,
        original_doc: item.original_doc,
        cd_date: item.cd_date,
        createBy: item.createBy,
        updateBy: item.updateBy,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })
    }

    // ส่วนของการสร้างไฟล์ excel
    const filename = `รายการ MA Summary ประจำเดือน${monthText} ${selectYear}`;
    res.setHeader(
      "Content-Type", 
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename*=UTF-8''" + encodeURI(`${filename}.xlsx`)
    );

    if (dataMaintenanceSummary.length !== 0) {
      workbook.xlsx.write(res).then(function (data) {
        res.end();
        console.log("genExel successfully.");
      });
    }

  } catch (error) {
    console.log(error);
  }
}

//------- POST -------//
exports.maintenancesummary_post = async (req, res, next) => {
  try {
    const {
        ma_case,
        inform_code,
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
        maintenance_subject,
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
        pfma_date,
        fma_date,
        receive_date,
        note_front,
        original_doc,
        cd_date,
        createBy,
    } = req.body

    // ถ้า inform_code ถูกใช้ไปแล้วยกเว้น null ไม่เก็บข้อมูลลง Database และส่ง Response ไปให้หน้าบ้าน
    const checkInformCode = await MaintenanceSummaryModel.findOne(
      {where: {inform_code: inform_code}}
    )
    if (checkInformCode !== null && inform_code !== null) {
      return res.send({
        status: 'error',
        message: 'เพิ่มข้อมูล Maintenance Summary ไม่ครบถ้วน เนื่องจาก รหัสที่แจ้งซ่อม นี้มีการใช้งานไปแล้ว โปรดตรวจสอบความถูกต้องก่อนแล้วจึงทำการอัพโหลดเฉพาะข้อมูลที่มีปัญหาใหม่อีกครั้ง',
      })
    }

    // ถ้า accounting_number ถูกใช้ไปแล้วยกเว้น null ไม่เก็บข้อมูลลง Database และส่ง Response ไปให้หน้าบ้าน
    const checkAccountingNumber = await MaintenanceSummaryModel.findOne(
      {where: {accounting_number: accounting_number}}
    )
    if (checkAccountingNumber !== null && accounting_number !== null) {
      return res.send({
        status: 'error',
        message: 'เพิ่มข้อมูล Maintenance Summary ไม่ครบถ้วน เนื่องจาก เลขที่เอกสารบัญชี นี้มีการใช้งานไปแล้ว โปรดตรวจสอบความถูกต้องก่อนแล้วจึงทำการอัพโหลดเฉพาะข้อมูลที่มีปัญหาใหม่อีกครั้ง',
      })
    }

    // ดึงเดือนและปี
    const month = moment(inform_date).format('MM'); // เดือนในรูปแบบ 2 หลัก
    const yearAD = moment(inform_date).format('YYYY'); // ปีในรูปแบบ 4 หลัก
    // แปลงปีเป็นพุทธศักราช (พ.ศ.)
    const yearBE = parseInt(yearAD) + 543;

    // นำเดือนและปีมาหาวันเเรกและวันสุดท้ายของเดือน
    let startDate = moment(`${yearAD}-${month}-01`, 'YYYY-MM-DD').format('YYYY-MM-DD');
    let endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

    // ดึงข้อมูลล่าสุดของเดือนที่ต้องการบันทึกข้อมูลเพื่อดู check_code ล่าสุด
    const dataMaintenanceSummary = await MaintenanceSummaryModel.findOne(
      {
        where: {
          inform_date: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [['createdAt', 'DESC']]
      }
    )

    let check_code
    // ถ้าเดือนนี้ยังไม่มีข้อมูล
    if (dataMaintenanceSummary == null) {
      check_code = `001/${month}/${yearBE}`
    // ถ้าเดือนนี้มีข้อมูล
    } else {
      // ดึงลำดับออกมาเป็น int
      const fullInformCode = dataMaintenanceSummary.check_code
      const numberInformCode = fullInformCode.substring(0, 3);
      const intNumberInformCode = parseInt(numberInformCode);

      // บวกลำดับเพิ่มอีก 1 แล้วเเปลงเป็น string
      const newIntNumberInformCode = intNumberInformCode + 1
      const newNumberInformCode = newIntNumberInformCode.toString().padStart(3, '0'); // เติม '0' ข้างหน้าให้มีความยาวรวม 3 ตัวอักษร

      console.log(newNumberInformCode); // "001"

      check_code = `${newNumberInformCode}/${month}/${yearBE}`
    }

    const createMaintenanceSummary = await MaintenanceSummaryModel.create({
      check_code: check_code,
      ma_case: ma_case,
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
      maintenance_subject: maintenance_subject,
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
      pfma_date: pfma_date,
      fma_date: fma_date,
      receive_date: receive_date,
      note_front: note_front,
      original_doc: original_doc,
      cd_date: cd_date,
      createBy: createBy,
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

    // แปลงค่า 'null' เป็น null
    Object.keys(formData).forEach(key => {
      if (formData[key] === 'null') {
        formData[key] = null;
      }
    });

    // ถ้า inform_code ถูกใช้ไปแล้วยกเว้น null ไม่เก็บข้อมูลลง Database และส่ง Response ไปให้หน้าบ้าน
    const checkInformCode = await MaintenanceSummaryModel.findOne(
      {where: {inform_code: formData.inform_code}}
    )
    if (checkInformCode !== null && formData.inform_code !== null) {
      return res.send({
        status: 'error',
        message: 'เพิ่มข้อมูล Maintenance Summary ไม่ครบถ้วน เนื่องจาก รหัสที่แจ้งซ่อม นี้มีการใช้งานไปแล้ว โปรดตรวจสอบความถูกต้องก่อนแล้วจึงทำการอัพโหลดเฉพาะข้อมูลที่มีปัญหาใหม่อีกครั้ง',
      })
    }

    // ถ้า accounting_number ถูกใช้ไปแล้วยกเว้น null ไม่เก็บข้อมูลลง Database และส่ง Response ไปให้หน้าบ้าน
    const checkAccountingNumber = await MaintenanceSummaryModel.findOne(
      {where: {accounting_number: formData.accounting_number}}
    )
    if (checkAccountingNumber !== null && formData.accounting_number !== null) {
      return res.send({
        status: 'error',
        message: 'เพิ่มข้อมูล Maintenance Summary ไม่ครบถ้วน เนื่องจาก เลขที่เอกสารบัญชี นี้มีการใช้งานไปแล้ว โปรดตรวจสอบความถูกต้องก่อนแล้วจึงทำการอัพโหลดเฉพาะข้อมูลที่มีปัญหาใหม่อีกครั้ง',
      })
    }

    // ดึงเดือนและปี
    const month = moment(formData.inform_date).format('MM'); // เดือนในรูปแบบ 2 หลัก
    const yearAD = moment(formData.inform_date).format('YYYY'); // ปีในรูปแบบ 4 หลัก
    // แปลงปีเป็นพุทธศักราช (พ.ศ.)
    const yearBE = parseInt(yearAD) + 543;

    // นำเดือนและปีมาหาวันเเรกและวันสุดท้ายของเดือน
    let startDate = moment(`${yearAD}-${month}-01`, 'YYYY-MM-DD').format('YYYY-MM-DD');
    let endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

    // ดึงข้อมูลล่าสุดของเดือนที่ต้องการบันทึกข้อมูลเพื่อดู check_code ล่าสุด
    const dataMaintenanceSummary = await MaintenanceSummaryModel.findOne(
      {
        where: {
          inform_date: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [['createdAt', 'DESC']]
      }
    )

    let check_code
    // ถ้าเดือนนี้ยังไม่มีข้อมูล
    if (dataMaintenanceSummary == null) {
      check_code = `001/${month}/${yearBE}`
    // ถ้าเดือนนี้มีข้อมูล
    } else {
      // ดึงลำดับออกมาเป็น int
      const fullInformCode = dataMaintenanceSummary.check_code
      const numberInformCode = fullInformCode.substring(0, 3);
      const intNumberInformCode = parseInt(numberInformCode);

      // บวกลำดับเพิ่มอีก 1 แล้วเเปลงเป็น string
      const newIntNumberInformCode = intNumberInformCode + 1
      const newNumberInformCode = newIntNumberInformCode.toString().padStart(3, '0'); // เติม '0' ข้างหน้าให้มีความยาวรวม 3 ตัวอักษร

      console.log(newNumberInformCode); // "001"

      check_code = `${newNumberInformCode}/${month}/${yearBE}`
    }

    const createMaintenanceSummary = await MaintenanceSummaryModel.create({
      check_code: check_code,
      ma_case: formData.ma_case,
      inform_code: formData.inform_code,
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
      maintenance_subject: formData.maintenance_subject,
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
      pfma_date: formData.pfma_date,
      fma_date: formData.fma_date,
      receive_date: formData.receive_date,
      ma_file: ma_file_array,
      note_front: formData.note_front,
      original_doc: formData.original_doc,
      cd_date: formData.cd_date,
      createBy: formData.createBy,
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

    // แปลงค่า 'null' เป็น null
    Object.keys(formData).forEach(key => {
      if (formData[key] === 'null') {
        formData[key] = null;
      }
    });

    // ถ้า inform_code ถูกใช้ไปแล้วยกเว้น null ไม่เก็บข้อมูลลง Database และส่ง Response ไปให้หน้าบ้าน
    const checkInformCode = await MaintenanceSummaryModel.findOne(
      {where: {
        inform_code: formData.inform_code,
        // ค่าของ id ต้องไม่เท่ากับ edit_id
        id: {
          [Op.ne]: edit_id 
        }
      }}
    )
    if (checkInformCode !== null && formData.inform_code !== null) {
      return res.send({
        status: 'error',
        message: 'เเก้ไขข้อมูล Maintenance Summary ไม่ครบถ้วน เนื่องจาก รหัสที่แจ้งซ่อม นี้มีการใช้งานไปแล้ว โปรดตรวจสอบความถูกต้องก่อนแล้วจึงทำการอัพโหลดเฉพาะข้อมูลที่มีปัญหาใหม่อีกครั้ง',
      })
    }

    // ถ้า accounting_number ถูกใช้ไปแล้วยกเว้น null ไม่เก็บข้อมูลลง Database และส่ง Response ไปให้หน้าบ้าน
    const checkAccountingNumber = await MaintenanceSummaryModel.findOne(
      {where: {
        accounting_number: formData.accounting_number,
        // ค่าของ id ต้องไม่เท่ากับ edit_id
        id: {
          [Op.ne]: edit_id 
        }
      }}
    )
    if (checkAccountingNumber !== null && formData.accounting_number !== null) {
      return res.send({
        status: 'error',
        message: 'เเก้ไขข้อมูล Maintenance Summary ไม่ครบถ้วน เนื่องจาก เลขที่เอกสารบัญชี นี้มีการใช้งานไปแล้ว โปรดตรวจสอบความถูกต้องก่อนแล้วจึงทำการอัพโหลดเฉพาะข้อมูลที่มีปัญหาใหม่อีกครั้ง',
      })
    }

    console.log("file", file);
    console.log("formData.ma_file", formData.ma_file);

    // นำชื่อไฟล์ที่อัพโหลดเก็บเข้าไปใน array
    let ma_file_array = []
    // ถ้ามีการเพิ่มไฟล์ใหม่เข้ามา
    if (file.length !== 0) {
      // ถ้าต้องการให้เก็บไฟล์เดิมไว้และเพิ่มไฟล์ใหม่เข้ามา
      if (formData.add_file == "true") {
        const fileNameMaintenanceSummary = await MaintenanceSummaryModel.findOne(
          {
            attributes: ['ma_file'],
            where: {id: edit_id}
          }
        )

        // ถ้าไม่มีไฟล์ตั้งเเต่เเรกแล้วต้องการเพิ่มไฟล์
        if (fileNameMaintenanceSummary.dataValues.ma_file == "[]") {
          file.map((item) => {
            ma_file_array.push(item.originalname);
          })
        // ถ้ามีไฟล์อยู่แล้วต้องการเพิ่มไฟล์  
        } else {
          // แปลงสตริงให้เป็นอาร์เรย์ 
          ma_file_array = formData.ma_file.split(',');
          file.map((item) => {
            ma_file_array.push(item.originalname);
          })
        }
        
      // ถ้าต้องการให้ไฟล์ที่เพิ่มใหม่เข้ามาแทนที่ไฟล์เดิม
      } else {
        file.map((item) => {
          ma_file_array.push(item.originalname);
        })
      }
    // ถ้ามีการลบไฟล์หรือไม่มีการเปลี่ยนเเปลงไฟล์
    } else {
      // ถ้าลบไฟล์ทั้งหมด
      if (formData.ma_file == null) {
        ma_file_array = []
      // ถ้าลบไฟล์บางส่วนหรือไม่มีการเปลี่ยนเเปลงไฟล์
      } else {
        // แปลงสตริงให้เป็นอาร์เรย์ 
        ma_file_array = formData.ma_file.split(',');
      }
    }

    const editMaintenanceSummary = await MaintenanceSummaryModel.update({
      ma_case: formData.ma_case,
      inform_code: formData.inform_code,
      plateNumber: formData.plateNumber,
      customerId: formData.customer_id,
      networkId: formData.network_id,
      servicetypeId: formData.servicetype_id,
      driver_name: formData.driver_name,
      distance_mile: formData.distance_mile,
      problem_detail: formData.problem_detail,
      maintenance_detail: formData.maintenance_detail,
      maintenance_type: formData.maintenance_type,
      maintenance_subject: formData.maintenance_subject,
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
      pfma_date: formData.pfma_date,
      fma_date: formData.fma_date,
      receive_date: formData.receive_date,
      ma_file: ma_file_array,
      note_front: formData.note_front,
      original_doc: formData.original_doc,
      cd_date: formData.cd_date,
      createBy: formData.createBy,
      updateBy: formData.updateBy,
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

exports.maintenancesummary_post_byexcel = async (req, res, next) => {
  try {
    let allMaintenanceSummary = req.body
    console.log(allMaintenanceSummary);

    // array สำหรับใส่ข้อมูลที่เกิด error
    let errorInformCode = [];
    let errorAccountingNumber = [];
    let errorCustomerList = []
    let errorNetworkList = []
    let errorServiceTypeList = []

    // กรอกเอาเเค่ข้อมูลชนิดต่างๆจากในข้อมูลทั้งหมดเพื่อนำมาหา error
    const uniqueCustomers = [...new Set(allMaintenanceSummary.map(item => item.customer_name))];
    const uniqueNetworks = [...new Set(allMaintenanceSummary.map(item => item.network_name))];
    const uniqueServiceTypes = [...new Set(allMaintenanceSummary.map(item => item.servicetype_name))];

    //console.log(uniqueCustomers);
    //console.log(uniqueNetworks);
    //console.log(uniqueServiceTypes);

    // นำ customer มาตรวจสอบเพื่อหาข้อมูลที่เกิด error
    for (let index = 0; index < uniqueCustomers.length; index++) {
      // ไม่เอาข้อมูลที่เป็น null มาตรวจสอบ
      if (uniqueCustomers[index] !== null) {
        const dataCustomerCheck = await CustomerModel.findOne(
          {where: {customer_name: uniqueCustomers[index]}}
        )
        // ถ้าพบ customer ที่่ไม่มีใน database ให้เก็บลงใน error และนำออกจากข้อมูลทั้งหมด
        if (dataCustomerCheck == null) {
          console.log('found uniqueCustomers');
          errorCustomerList.push(uniqueCustomers[index])
          allMaintenanceSummary = allMaintenanceSummary.filter(item => item.customer_name !== uniqueCustomers[index]);
        }
      }
    }
    // นำ network มาตรวจสอบเพื่อหาข้อมูลที่เกิด error
    for (let index = 0; index < uniqueNetworks.length; index++) {
      // ไม่เอาข้อมูลที่เป็น null มาตรวจสอบ
      if (uniqueNetworks[index] !== null) {
        const dataNetworkCheck = await NetworkModel.findOne(
        {where: {network_name: uniqueNetworks[index]}}
      )
      // ถ้าพบ network ที่่ไม่มีใน database ให้เก็บลงใน error และนำออกจากข้อมูลทั้งหมด
      if (dataNetworkCheck == null) {
        console.log('found uniqueNetworks');
        errorNetworkList.push(uniqueNetworks[index])
        allMaintenanceSummary = allMaintenanceSummary.filter(item => item.network_name !== uniqueNetworks[index]);
      }
      }
    }
    // นำ servicetype มาตรวจสอบเพื่อหาข้อมูลที่เกิด error
    for (let index = 0; index < uniqueServiceTypes.length; index++) {
      // ไม่เอาข้อมูลที่เป็น null มาตรวจสอบ
      if (uniqueServiceTypes[index] !== null) {
        const dataServiceTypeCheck = await ServiceTypeModel.findOne(
          {where: {servicetype_name: uniqueServiceTypes[index]}}
        )
        // ถ้าพบ servicetype ที่่ไม่มีใน database ให้เก็บลงใน error และนำออกจากข้อมูลทั้งหมด
        if (dataServiceTypeCheck == null) {
          console.log('found uniqueServiceTypes');
          errorServiceTypeList.push(uniqueServiceTypes[index])
          allMaintenanceSummary = allMaintenanceSummary.filter(item => item.servicetype_name !== uniqueServiceTypes[index]);
        }
      }
    }

    if (allMaintenanceSummary.length !== 0) {
      for (const item of allMaintenanceSummary) {
        // ตรวจสอบว่า inform_code ถูกใช้ไปแล้วหรือไม่
        const checkInformCode = await MaintenanceSummaryModel.findOne(
          {where: {inform_code: item.inform_code}}
        )
        // ตรวจสอบว่า accounting_number ถูกใช้ไปแล้วหรือไม่
        const checkAccountingNumber = await MaintenanceSummaryModel.findOne(
          {where: {accounting_number: item.accounting_number}}
        )
  
        //console.log(checkInformCode);
        //console.log(checkAccountingNumber);
  
        // ถ้า inform_code มีการใช้ไปแล้วยกเว้น null ให้เก็บลงใน error และไม่นำข้อมูลนี้บันทึกใน database
        if (checkInformCode !== null && item.inform_code !== null) {
          console.log('found errorInformCode');
          errorInformCode.push(item.inform_code)
        // ถ้า accounting_number มีการใช้ไปแล้วยกเว้น null ให้เก็บลงใน error และไม่นำข้อมูลนี้บันทึกใน database
        } else if (checkAccountingNumber !== null && item.accounting_number !== null) {
          console.log('found errorAccountingNumber');
          errorAccountingNumber.push(item.accounting_number)
        // ถ้า inform_code และ accounting_number ยังไม่มีการใช้งาน
        } else {
          // ดึงเดือนและปี
          const month = moment(item.inform_date).format('MM'); // เดือนในรูปแบบ 2 หลัก
          const yearAD = moment(item.inform_date).format('YYYY'); // ปีในรูปแบบ 4 หลัก
          // แปลงปีเป็นพุทธศักราช (พ.ศ.)
          const yearBE = parseInt(yearAD) + 543;
  
          // นำเดือนและปีมาหาวันเเรกและวันสุดท้ายของเดือน
          let startDate = moment(`${yearAD}-${month}-01`, 'YYYY-MM-DD').format('YYYY-MM-DD');
          let endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');
  
          // ดึงข้อมูลล่าสุดของเดือนที่ต้องการบันทึกข้อมูลเพื่อดู check_code ล่าสุด
          const dataMaintenanceSummary = await MaintenanceSummaryModel.findOne(
            {
              where: {
                inform_date: {
                  [Op.between]: [startDate, endDate],
                },
              },
              order: [['check_code', 'DESC']]
            }
          )
  
          let check_code
          // ถ้าเดือนนี้ยังไม่มีข้อมูล
          if (dataMaintenanceSummary == null) {
            check_code = `001/${month}/${yearBE}`
          // ถ้าเดือนนี้มีข้อมูล
          } else {
            // ดึงลำดับออกมาเป็น int
            const fullInformCode = dataMaintenanceSummary.check_code
            const numberInformCode = fullInformCode.substring(0, 3);
            const intNumberInformCode = parseInt(numberInformCode);
  
            // บวกลำดับเพิ่มอีก 1 แล้วเเปลงเป็น string
            const newIntNumberInformCode = intNumberInformCode + 1
            const newNumberInformCode = newIntNumberInformCode.toString().padStart(3, '0'); // เติม '0' ข้างหน้าให้มีความยาวรวม 3 ตัวอักษร
  
            //console.log(newNumberInformCode);
  
            check_code = `${newNumberInformCode}/${month}/${yearBE}`
          }
  
          let findCustomer
          let findNetwork
          let findServiceType
  
          // ถ้า customer_name เป็น null ให้ใส่เป็นไอดีของ N/A ถ้าไม่เป็น null ให้ใส่เป็นไอดีตาม customer_name
          if (item.customer_name == null) {
            findCustomer = await CustomerModel.findOne(
              {
                where: {customer_name: 'N/A'},
              }
            )
          } else {
            findCustomer = await CustomerModel.findOne(
              {
                where: {customer_name: item.customer_name},
              }
            )
          }
  
          // ถ้า network_name เป็น null ให้ใส่เป็นไอดีของ N/A ถ้าไม่เป็น null ให้ใส่เป็นไอดีตาม network_name
          if (item.network_name == null) {
            findNetwork = await NetworkModel.findOne(
              {
                where: {network_name: 'N/A'},
              }
            )
          } else {
            findNetwork = await NetworkModel.findOne(
              {
                where: {network_name: item.network_name},
              }
            )
          }
  
          // ถ้า servicetype_name เป็น null ให้ใส่เป็นไอดีของ N/A ถ้าไม่เป็น null ให้ใส่เป็นไอดีตาม servicetype_name
          if (item.servicetype_name == null) {
            findServiceType = await ServiceTypeModel.findOne(
              {
                where: {servicetype_name: 'N/A'},
              }
            )
          } else {  
            findServiceType = await ServiceTypeModel.findOne(
              {
                where: {servicetype_name: item.servicetype_name},
              }
            )
          }
  
          const createMaintenanceSummary = await MaintenanceSummaryModel.create({
            check_code: check_code,
            ma_case: item.ma_case,
            inform_code: item.inform_code,
            inform_date: item.inform_date,
            plateNumber: item.plateNumber,
            customerId: findCustomer.id,
            networkId: findNetwork.id,
            servicetypeId: findServiceType.id,
            driver_name: item.driver_name,
            distance_mile: item.distance_mile,
            problem_detail: item.problem_detail,
            maintenance_detail: item.maintenance_detail,
            maintenance_type: item.maintenance_type,
            maintenance_subject: item.maintenance_subject,
            maintenance_weight: item.maintenance_weight,
            maintenance_status: item.maintenance_status,
            quotation_number: item.quotation_number,
            repair_shop: item.repair_shop,
            payment: item.payment,
            accounting_number: item.accounting_number,
            price: item.price,
            driver_price: item.driver_price,
            driver_price_status: item.driver_price_status,
            note: item.note,
            sma_date: item.sma_date,
            pfma_date: item.pfma_date,
            fma_date: item.fma_date,
            receive_date: item.receive_date,
            ma_file: [],
            note_front: item.note_front,
            original_doc: item.original_doc,
            cd_date: item.cd_date,
            createBy: item.createBy,
          })
        }
      }
    }

    console.log(errorInformCode);
    console.log(errorAccountingNumber);
    console.log(errorCustomerList);
    console.log(errorNetworkList);
    console.log(errorServiceTypeList);

    // ถ้าไม่ได้รับข้อมูลอะไรเลยจากหน้าบ้าน
    if (allMaintenanceSummary.length == 0) {
      res.send({
        status: 'error',
        message: 'ข้อมูล Maintenance Summary มี Column ที่ข้อมูลผิดทั้งหมด โปรดตรวจสอบ ชื่อโปรเจ็ค, Network, ประเภทการจ้างงาน ใหม่อีกครั้งหรือ Column ของไฟล์ที่ Upload เข้ามานั้นไม่ตรงกับ Column ของไฟล์ Template',
      })
    // ถ้าไม่มี error อะไรเกิดขึ้น
    } else if (errorInformCode.length == 0 && errorAccountingNumber.length == 0 && errorCustomerList.length == 0 && errorNetworkList.length == 0 && errorServiceTypeList.length == 0) {
      res.send({
        status: 'success',
        message: 'เพิ่ม Maintenance Summary จากไฟล์ excel สำเร็จ',
      })
    // ถ้าพบ error
    } else {
      if (errorInformCode.length > 0) {
        errorInformCode.unshift('เพิ่มข้อมูล Maintenance Summary ไม่ครบถ้วน เนื่องจาก รหัสที่แจ้งซ่อม นี้มีการใช้งานไปแล้ว โปรดตรวจสอบความถูกต้องก่อนแล้วจึงทำการอัพโหลดเฉพาะข้อมูลที่มีปัญหาใหม่อีกครั้ง')
      }
      if (errorAccountingNumber.length > 0) {
        errorAccountingNumber.unshift('เพิ่มข้อมูล Maintenance Summary ไม่ครบถ้วน เนื่องจาก เลขที่เอกสารบัญชี นี้มีการใช้งานไปแล้ว โปรดตรวจสอบความถูกต้องก่อนแล้วจึงทำการอัพโหลดเฉพาะข้อมูลที่มีปัญหาใหม่อีกครั้ง')
      }
      if (errorCustomerList.length > 0) {
        errorCustomerList.unshift('เพิ่มข้อมูล Maintenance Summary ไม่ครบถ้วน เนื่องจากในฐานข้อมูลยังไม่มีข้อมูล ชื่อโปรเจ็ค ดังต่อไปนี้ โปรดตรวจสอบความถูกต้องก่อนหรือถ้าเป็น ชื่อโปรเจ็ค อันใหม่ ให้ทำการเพิ่มข้อมูล ชื่อโปรเจ็ค ที่หน้า Customer Details ก่อนแล้วทำการอัพโหลดเฉพาะข้อมูลที่มีปัญหาใหม่อีกครั้ง')
      }
      if (errorNetworkList.length > 0) {
        errorNetworkList.unshift('เพิ่มข้อมูล Maintenance Summary ไม่ครบถ้วน เนื่องจากในฐานข้อมูลยังไม่มีข้อมูล Network ดังต่อไปนี้ โปรดตรวจสอบความถูกต้องก่อนแล้วจึงทำการอัพโหลดเฉพาะข้อมูลที่มีปัญหาใหม่อีกครั้ง')
      }
      if (errorServiceTypeList.length > 0) {
        errorServiceTypeList.unshift('เพิ่มข้อมูล Maintenance Summary ไม่ครบถ้วน เนื่องจากในฐานข้อมูลยังไม่มีข้อมูล ประเภทการจ้างงาน ดังต่อไปนี้ โปรดตรวจสอบความถูกต้องก่อนแล้วจึงทำการอัพโหลดเฉพาะข้อมูลที่มีปัญหาใหม่อีกครั้ง')
      }

      // นำข้อความ error ทั้งหมดมารวมกันเพื่อส่งไปยังหน้าบ้าน
      let errorList = errorInformCode.concat(errorAccountingNumber);
      errorList = errorList.concat(errorCustomerList);
      errorList = errorList.concat(errorNetworkList);
      errorList = errorList.concat(errorServiceTypeList);

      res.send({
        status: 'error',
        message: errorList,
      })
    }
  } catch (error) {
    console.log(error);
    res.send({
      status: 'error',
      message: 'เกิดปัญหาบางอย่าง โปรดเเจ้งทางไอที'
    });
  }
}


//------- PUT -------//
exports.maintenancesummary_put = async (req, res, next) => {
  try {
    const {
      ma_case,
      inform_code,
      plateNumber,
      customer_id,
      network_id,
      servicetype_id,
      driver_name,
      distance_mile,
      problem_detail,
      maintenance_detail,
      maintenance_type,
      maintenance_subject,
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
      pfma_date,
      fma_date,
      receive_date,
      file,
      note_front,
      original_doc,
      cd_date,
      createBy,
      updateBy,
  } = req.body

  const edit_id = req.params.id

  // ถ้า inform_code ถูกใช้ไปแล้วยกเว้น null ไม่เก็บข้อมูลลง Database และส่ง Response ไปให้หน้าบ้าน
  const checkInformCode = await MaintenanceSummaryModel.findOne(
    {where: {
      inform_code: inform_code,
      // ค่าของ id ต้องไม่เท่ากับ edit_id
      id: {
        [Op.ne]: edit_id 
      }
    }}
  )
  if (checkInformCode !== null && inform_code !== null) {
    return res.send({
      status: 'error',
      message: 'เเก้ไขข้อมูล Maintenance Summary ไม่สมบูรณ์ เนื่องจาก รหัสที่แจ้งซ่อม นี้มีการใช้งานไปแล้ว โปรดตรวจสอบความถูกต้องก่อนแล้วจึงทำการอัพโหลดข้อมูลอีกครั้ง',
    })
  }

  // ถ้า accounting_number ถูกใช้ไปแล้วยกเว้น null ไม่เก็บข้อมูลลง Database และส่ง Response ไปให้หน้าบ้าน
  const checkAccountingNumber = await MaintenanceSummaryModel.findOne(
    {where: {
      accounting_number: accounting_number,
      // ค่าของ id ต้องไม่เท่ากับ edit_id
      id: {
        [Op.ne]: edit_id 
      }
    }}
  )
  if (checkAccountingNumber !== null && accounting_number !== null) {
    return res.send({
      status: 'error',
      message: 'เเก้ไขข้อมูล Maintenance Summary ไม่สมบูรณ์ เนื่องจาก เลขที่เอกสารบัญชี นี้มีการใช้งานไปแล้ว โปรดตรวจสอบความถูกต้องก่อนแล้วจึงทำการอัพโหลดข้อมูลอีกครั้ง',
    })
  }

  const editMaintenanceSummary = await MaintenanceSummaryModel.update({
    ma_case: ma_case,
    inform_code: inform_code,
    plateNumber: plateNumber,
    customerId: customer_id,
    networkId: network_id,
    servicetypeId: servicetype_id,
    driver_name: driver_name,
    distance_mile: distance_mile,
    problem_detail: problem_detail,
    maintenance_detail: maintenance_detail,
    maintenance_type: maintenance_type,
    maintenance_subject: maintenance_subject,
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
    pfma_date: pfma_date,
    fma_date: fma_date,
    receive_date: receive_date,
    file: file,
    note_front: note_front,
    original_doc: original_doc,
    cd_date: cd_date,
    createBy: createBy,
    updateBy: updateBy,
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
// ฟังก์ชันสำหรับรันเลข check_code ใหม่เมื่อมีการลบเกิดขึ้น
const maintenancesummary_reset_checkcode = async (inform_date) => {
  try {
    // ดึงเดือนและปี
    const month = moment(inform_date).format('MM'); // เดือนในรูปแบบ 2 หลัก
    const yearAD = moment(inform_date).format('YYYY'); // ปีในรูปแบบ 4 หลัก
    // แปลงปีเป็นพุทธศักราช (พ.ศ.)
    const yearBE = parseInt(yearAD) + 543;

    // นำเดือนและปีมาหาวันเเรกและวันสุดท้ายของเดือน
    let startDate = moment(`${yearAD}-${month}-01`, 'YYYY-MM-DD').format('YYYY-MM-DD');
    let endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

    const dataMaintenanceSummary = await MaintenanceSummaryModel.findAll(
      {
        attributes: ['id'],
        where: {
          inform_date: {
            [Op.between]: [startDate, endDate],
          },
        },
      }
    )

    let count = 1;
    // นำข้อมูลทุกตัวของเดือนมารันเลข check_code ใหม่ทั้งหมด
    for (const item of dataMaintenanceSummary) {
      // เเปลงเป็น string
      const newNumberInformCode = count.toString().padStart(3, '0'); // เติม '0' ข้างหน้าให้มีความยาวรวม 3 ตัวอักษร
      let check_code = `${newNumberInformCode}/${month}/${yearBE}`

      const editMaintenanceSummary = await MaintenanceSummaryModel.update({
        check_code: check_code
      }, { where: { id: item.id } })

      count += 1;
    }

  } catch (error) {
    console.log(error);
  }
}
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

    // รันเลข check_code ของเดือนใหม่ทั้งหมด
    maintenancesummary_reset_checkcode(deleteDataMaintenanceSummary.inform_date)

  } catch (error) {
    console.log(error);
  }
}