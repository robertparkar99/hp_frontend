import fetch from 'node-fetch';

const payload = {
    industry: "Technology",
    department: "Engineering",
    jobRole: "Senior Backend Developer",
    description: "Responsible for backend systems.",
    chatHistory: []
};

const isLocal = true; // change to false when hitting real Genkit API

(async () => {
    const body = isLocal ? payload : { input: payload };

    const res = await fetch("http://localhost:3400/jobRoleCompetencyFlow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    const data = await res.json();
    console.log("Server Response:", data);
})();
