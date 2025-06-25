const axios = require('axios');
const multer = require('multer');
const csvParse = require('csv-parse');
const upload = multer();

module.exports = async (srv) => {
//   //All connection
//   const db = await cds.connect.to("db");
//   const ECPersonalInformation = await cds.connect.to("ECPersonalInformation");
//   const ECTimeOff = await cds.connect.to("ECTimeOff");

  // All entities
  const {
    helloworld,
    candidateFileUpload
  } = srv.entities;
  console.log("hello");

  //Controller
  srv.on(["READ"], helloworld, async (req) => {
    try {
      console.log("Enter Hello World !");
      

      return {
        status: "200",
        result: "Hello world !",
        
      };
    } catch (error) {
      console.log(error);
      return {
        status: "500",
        result: error.innererror.response.body,
      };
    }
  });
 
srv.on(["CREATE"], candidateFileUpload, async (req) => {
  try {
    let data = req.req.body;
    let candidates = Array.isArray(data) ? data : [data];

    // Log input for debugging
    console.log("Processing candidates:", candidates.length);

    console.log("candidates:  ", candidates);

    const url = 'https://apisalesdemo8.successfactors.com/odata/v2/upsert?workflowConfirmed=true';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + Buffer.from('twalker@SFCPART000443:Welcome@2025').toString('base64')
    };

    // Prepare a single upsert body with all candidates
    const body = candidates.map(candidate => ({
      __metadata: {
        uri: "https://apisalesdemo8.successfactors.com/odata/v2/Candidate",
        type: "SFOData.Candidate"
      },
      country: candidate.country,
      city1: candidate.city1,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      primaryEmail: candidate.primaryEmail
    }));
    
    console.log("Upsert body:", body);

    const result = await axios.post(url, body, { headers });
    console.log("Upsert result:", result.data);

    // Process results (unchanged)
    let results = [];
    if (result.data?.d) {
      results = result.data.d
        .filter(item => item.status === "OK" && item.key?.match(/candidateId=(\d+)/))
        .map(item => ({
          id: item.key.match(/candidateId=(\d+)/)[1],
          status: item.status,
          message: item.message
        }));
    }

    if (results.length === 0) {
      //  error messages from the response
      let errorMsg = "No data upserted";
      if (result.data?.d) {
        const errorMessages = result.data.d
          .filter(item => item.status !== "OK")
          .map(item => item.message)
          .filter(Boolean);
        if (errorMessages.length > 0) {
          errorMsg += ": " + errorMessages.join("; ");
        }
      }
      return {
        status: 204,
        message: errorMsg
      };
    }

    // Return message and array of ids
    return {
      status: 200,
      message: "Data upserted successfully",
      ids: results.map(r => r.id)
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      status: "500",
      result: error.response?.data || error.message
    };
  }
});
};