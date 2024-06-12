const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const FormData = require('form-data');

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.post('/api/generate-emoji', async (req, res) => {
    const { prompt } = req.body;

    try {
        // Generate image using DALL-E
        const dalleResponse = await axios.post('https://api.openai.com/v1/images/generations', {
            prompt: `An emoji 3d style image: ${prompt}. It should have a clean, minimalistic design`,
            n: 1,
            size: "256x256"
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const imageUrl = dalleResponse.data.data[0].url;
        const imagePath = './temp-image.png';

        // Download the generated image
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(imagePath, response.data);

        // Remove background using remove.bg
        const formData = new FormData();
        formData.append('image_file', fs.createReadStream(imagePath));
        formData.append('size', 'auto');

        const removeBgResponse = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
            headers: {
                ...formData.getHeaders(),
                'X-Api-Key': process.env.REMOVE_BG_API_KEY
            },
            responseType: 'arraybuffer'
        });

        fs.writeFileSync('./output-image.png', removeBgResponse.data);

        // Convert the result to a base64 string to send to the frontend
        const outputImage = fs.readFileSync('./output-image.png', { encoding: 'base64' });

        // Clean up temporary files
        fs.unlinkSync(imagePath);
        fs.unlinkSync('./output-image.png');

        res.json({ imageUrl: `data:image/png;base64,${outputImage}` });
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        res.status(500).send('Error generating emoji');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
