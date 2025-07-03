const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(express.json());

app.use(cors({
  // Change this 'origin' to the service you are hosting the frontend on
  origin: 'YOUR_FRONTEND_WEBSITE_URL', 
  methods: ['GET', 'POST'],
  credentials: false
}));

// MongoDB URI - Safe loading for emulator and production
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error("Missing MONGODB_URI in environment variables");
}

let client;
let collection;

const connectToMongoDB = async () => {
    if (!client || !client.topology || client.topology.isDestroyed()) {
        client = new MongoClient(mongoUri);
        await client.connect();
        collection = client.db('survey').collection('responses');
    }
};

// Helper function to generate a random token
const generateToken = () => crypto.randomBytes(8).toString('hex');

app.get('/api/questionnaire-type', async (req, res) => {
  try {
    await connectToMongoDB();

    const { token } = req.query;

    // Check if the token already exists (i.e., returning user)
    const existingEntry = await collection.findOne({ token });

    if (existingEntry) {
      const aiScore = calculateAiScore(existingEntry.type, existingEntry.answers);
      const legitimacyScore = calculateLegitScore(existingEntry.type, existingEntry.answers);
      const avgScore = (aiScore + legitimacyScore) / 2;

      return res.status(200).json({
        type: -1,
        token: existingEntry.token,
        aiScore,
        legitimacyScore,
        avgScore
      });
    }

    // Count how many users have type 0 and type 1 so far
    const countType0 = await collection.countDocuments({ type: 0 });
    const countType1 = await collection.countDocuments({ type: 1 });

    // Choose the type that has fewer responses
    const assignedType = countType0 <= countType1 ? 0 : 1;

    // Generate a token for the user
    const newToken = token && token !== 'undefined' ? token : generateToken();

    return res.status(200).json({ type: assignedType, token: newToken });
  } catch (error) {
    console.error("Error in /api/questionnaire-type:", error);
    res.status(500).json({ error: error.message });
  }
});


app.post('/api/submit-questionnaire', async (req, res) => {
    try {
        const { type, token, answers, language } = req.body; 
        console.log("Submit received for token:", token);

        await connectToMongoDB();
        // const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.connection.remoteAddress;
        const time = Date.now();

        if (type == null || token == null || answers == null) {
            console.error("Missing fields:", { type, token, answers });
            return res.status(400).json({ error: "Missing required fields" });
        }

        await collection.insertOne({ time, type, token, language, answers });

        const aiScore = calculateAiScore(type, answers);
        const legitimacyScore = calculateLegitScore(type, answers);
        const avgScore = (aiScore + legitimacyScore) / 2;

        res.status(200).json({ aiScore, legitimacyScore, avgScore });
    } catch (error) {
        console.error("Error in /submit-questionnaire:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



function calculateAiScore(type, answers) {
    let score;

    if (type === 0) {
        score =
            (10 - parseInt(answers.email1.aiScore)) + 
            (10 - parseInt(answers.email2.aiScore)) + 
            (parseInt(answers.email3.aiScore)) +      
            (parseInt(answers.email4.aiScore)) +      
            (parseInt(answers.email5.aiScore));       
    } else {
        score =
            (parseInt(answers.email1.aiScore)) +      
            (parseInt(answers.email2.aiScore)) +      
            (10 - parseInt(answers.email3.aiScore)) + 
            (10 - parseInt(answers.email4.aiScore)) + 
            (parseInt(answers.email5.aiScore));       
    }

    return score / 5;
}

function calculateLegitScore(type, answers) {
    const score =
        (10 - parseInt(answers.email1.legitimacyScore)) + 
        (parseInt(answers.email2.legitimacyScore)) +      
        (parseInt(answers.email3.legitimacyScore)) +      
        (10 - parseInt(answers.email4.legitimacyScore)) + 
        (10 - parseInt(answers.email5.legitimacyScore));  

    return score / 5;
}


app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running");
});
