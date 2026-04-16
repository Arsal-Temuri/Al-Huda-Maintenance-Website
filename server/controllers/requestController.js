const { getDatabase } = require('../config/db');
const { generateRequestId } = require('../utils/helpers');
const XLSX = require('xlsx');

exports.submitRequest = async (req, res) => {
  try {
    const { department, requestType, description } = req.body;
    
    if (!department || !requestType || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const db = await getDatabase();
    const requestId = generateRequestId();
    
    const newRequest = {
      id: requestId,
      department,
      requestType,
      description,
      priority: 'Not Set',
      status: 'Pending',
      assignedWorker: null,
      photo: req.file ? `/uploads/${req.file.filename}` : null,
      submittedAt: new Date().toISOString(),
      verifiedAt: null,
      assignedAt: null,
      completedAt: null,
      verifiedBy: null,
      assignedBy: null,
      completedBy: null
    };

    await db.collection('requests').insertOne(newRequest);
    
    res.json({ 
      success: true, 
      requestId: requestId,
      message: 'Request submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const db = await getDatabase();
    const requests = await db.collection('requests').find({}).toArray();
    res.json({ requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.verifyRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;
    
    if (!priority) {
      return res.status(400).json({ error: 'Priority is required' });
    }
    
    const db = await getDatabase();
    const request = await db.collection('requests').findOne({ id });
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ error: 'Request already verified' });
    }

    const updatedRequest = await db.collection('requests').findOneAndUpdate(
      { id },
      { 
        $set: {
          status: 'Verified',
          priority,
          verifiedAt: new Date().toISOString(),
          verifiedBy: req.session.admin.name
        }
      },
      { returnDocument: 'after' }
    );
    
    res.json({ success: true, request: updatedRequest.value });
  } catch (error) {
    console.error('Error verifying request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.assignWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { workerId } = req.body;
    
    const db = await getDatabase();
    const request = await db.collection('requests').findOne({ id });
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const worker = await db.collection('workers').findOne({ id: parseInt(workerId) });
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    const updatedRequest = await db.collection('requests').findOneAndUpdate(
      { id },
      { 
        $set: {
          status: 'Assigned',
          assignedWorker: worker,
          assignedAt: new Date().toISOString(),
          assignedBy: req.session.admin.name
        }
      },
      { returnDocument: 'after' }
    );
    
    res.json({ success: true, request: updatedRequest.value, worker });
  } catch (error) {
    console.error('Error assigning worker:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.completeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    const request = await db.collection('requests').findOne({ id });
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'Assigned') {
      return res.status(400).json({ error: 'Request must be assigned before completion' });
    }

    const updatedRequest = await db.collection('requests').findOneAndUpdate(
      { id },
      { 
        $set: {
          status: 'Completed',
          completedAt: new Date().toISOString(),
          completedBy: req.session.admin.name
        }
      },
      { returnDocument: 'after' }
    );
    
    res.json({ success: true, request: updatedRequest.value });
  } catch (error) {
    console.error('Error completing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteMultiple = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No request IDs provided' });
    }

    const db = await getDatabase();
    
    const result = await db.collection('requests').deleteMany({
      id: { $in: ids }
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'No requests matched the provided IDs' });
    }

    res.json({ 
      success: true, 
      message: `Successfully deleted ${result.deletedCount} request(s)`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error deleting requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.exportExcel = async (req, res) => {
  try {
    const db = await getDatabase();
    const { status } = req.query;
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const requests = await db.collection('requests').find(query).toArray();
    
    const excelData = requests.map(request => ({
      'Request ID': request.id,
      'Department': request.department,
      'Type': request.requestType,
      'Description': request.description,
      'Priority': request.priority,
      'Status': request.status,
      'Worker Name': request.assignedWorker ? request.assignedWorker.name : 'N/A',
      'Worker Role': request.assignedWorker ? request.assignedWorker.role : 'N/A',
      'Worker Phone': request.assignedWorker ? request.assignedWorker.phone : 'N/A',
      'Submitted At': new Date(request.submittedAt).toLocaleString(),
      'Verified At': request.verifiedAt ? new Date(request.verifiedAt).toLocaleString() : 'N/A',
      'Verified By': request.verifiedBy || 'N/A',
      'Assigned At': request.assignedAt ? new Date(request.assignedAt).toLocaleString() : 'N/A',
      'Assigned By': request.assignedBy || 'N/A',
      'Completed At': request.completedAt ? new Date(request.completedAt).toLocaleString() : 'N/A',
      'Completed By': request.completedBy || 'N/A'
    }));
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    ws['!cols'] = [
      { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 10 },
      { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
      { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
      { wch: 20 }
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Requests');
    
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    const fileName = `Al_Huda_Requests_${status || 'all'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(excelBuffer);
    
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({ error: error.message || 'Failed to export data' });
  }
};