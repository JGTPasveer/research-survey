# Survey

This repository contains the frontend, backend and analysis code used to evaluate a user study focused on identifying AI-generated, AI-enhanced, and human-written emails. The goal is to assess participants' ability to judge both the legitimacy and the likelihood of AI involvement in various email types. The frontend is static and does not need any configuration. I decided to host the frontend on **GitHub Pages**. The backend does need some configuration/env variables. 

---

## Frontend
The frontend does not need any changes for deployment, besides changing the \
 `const API_BASE = 'API_URL';` \
After changing that to the correct URL provided by the backend service, upload the folder to a service that can host static webpages, like *GitHub Pages*

## Backend
The backend consist of an index.js file. The following env variables need to be updated:
```
app.use(cors({
  origin: 'YOUR_FRONTEND_WEBSITE_URL', 
  methods: ['GET', 'POST'],
  credentials: false
}));
``` 
\
In the above code snippet, change the **YOUR_FRONTEND_WEBSITE_URL** to the URL where the frontend is hosted on. \
\
Make sure the `const mongoUri = process.env.MONGODB_URI;` is set correctly as well, by using an env variable.

## Analysis
In order to run the analysis code, go into the Analysis folder and run the following commands:
### Setup
1. (optional) Create Virtual Environment: `python3 -m venv venv`
2. `pip install -r requirements.txt` 
3. Run **survey-analysis.ipynb**

---

In case you have any questions, feel free to contact me at **j.g.t.pasveer@student.rug.nl**

