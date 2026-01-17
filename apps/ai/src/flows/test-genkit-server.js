import express from 'express';
const app = express();

// Accept any content type as text
app.use(express.text({ type: '*/*' }));

app.post('/jobRoleCompetencyFlow', (req, res) => {
    console.log('Raw body received:', req.body);

    let parsed;
    try {
        parsed = JSON.parse(req.body); // manually parse JSON
        console.log('Parsed object:', parsed);
    } catch (err) {
        console.error('JSON parse error:', err.message);
        return res.status(400).json({ error: 'Invalid JSON' });
    }

    res.json({ result: 'Success', received: parsed });
});

app.listen(3400, () => console.log('Test Genkit server running on port 3400'));
