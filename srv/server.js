const cds = require('@sap/cds');
const cors = require('cors');
const proxy = require('@sap/cds-odata-v2-adapter-proxy');
const { parse } = require('csv-parse/sync');
const xsenv = require('@sap/xsenv');
const multer = require('multer');           // <-- add this
const upload = multer();
const bodyParser = require('body-parser');
const cds_swagger = require('cds-swagger-ui-express');
const { default: axios } = require('axios');
xsenv.loadEnv('./default-env.json');
xsenv.loadEnv('./env.json');

cds.on('bootstrap', app => {
  app.options('*', cors());
  app.use(cors({ origin: 'http://localhost:8080' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.text({ limit: '50mb' }));
  app.use(proxy());
  app.use(bodyParser.text({ limit: '50mb' }));
  app.use(proxy());
  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, Authorization, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
      res.status(204).end();
    } else {
      next();
    }
  });

  
app.post('/upload-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const csvString = req.file.buffer.toString();
    const records = parse(csvString, { 
      columns: true, 
      skip_empty_lines: true 
    });

    // Ensure records is a flat array (not nested)
    const flatRecords = Array.isArray(records) ? records : [records];

    const apiUrl = 'http://localhost:4004/rest/catalog-service-rest/candidateFileUpload';
    const apiResponse = await axios.post(apiUrl, flatRecords, {
      headers: { 'Content-Type': 'application/json' }
    });

    // Return the API response directly (no extra wrapping)
    res.status(200).json(apiResponse.data);
  } catch (error) {
    res.status(500).json({ 
      status: "500", 
      error: error.message 
    });
  }
});


  app.use(cds_swagger());

  app.get('/health', async (req, res) => {
    res.status(200).send({
      result: 'Ok',
      isLocal,
      version,
      lastBuild
    });
  });
});

module.exports = cds.server;
