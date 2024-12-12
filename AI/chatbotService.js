const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyAPLJIdgSfW8tdcsHjoS2cDDw1Aw_S8f2A");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function sendMessageToAI(userMessage) {
  
  try{
    const result = await model.generateContent(userMessage);
    return result.response.text();

  }catch(error)
  {
    // handle errors
    console.log(error);
  }

 

}

module.exports = {
  sendMessageToAI
}