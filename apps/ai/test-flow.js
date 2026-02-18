// Test script for Genkit buildWithAIFlow
const testData = {
    data: {
        industry: "Technology",
        department: "Engineering",
        jobRole: "Software Engineer",
        modality: {
            selfPaced: true,
            instructorLed: false
        },
        tasks: ["Write clean code", "Debug applications"],
        criticalWorkFunction: "Software Development"
    }
};

console.log('🧪 Testing buildWithAIFlow...');
console.log('📤 Sending request to: http://localhost:3400/buildWithAIFlow');
console.log('📦 Payload:', JSON.stringify(testData, null, 2));

fetch('http://localhost:3400/buildWithAIFlow', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData),
})
    .then(response => {
        console.log('📥 Response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('✅ Success! Response:');
        console.log(JSON.stringify(data, null, 2));

        if (data.result && data.result.content) {
            console.log('\n📝 Generated Content Preview:');
            console.log(data.result.content.substring(0, 500) + '...');
            console.log('\n✅ buildWithAIFlow is working correctly!');
        }
    })
    .catch(error => {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    });
