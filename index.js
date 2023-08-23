
const express = require("express");
const mongoose= require("mongoose");
const shortUrl = require("./models/shortUrl");

mongoose.connect('mongodb://127.0.0.1/urlShortener',{
    useNewUrlParser:true, 
    useUnifiedTopology:true,
    
})

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));






app.get('/',async(req, res) => {
    try{
    const shortUrls = await shortUrl.find();
        res.render('index',{shortUrls:shortUrls});
    }
        catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
})

app.post('/shortUrls', async (req,res) =>{
    await shortUrl.create({full: req.body.fullUrl});

    res.redirect('/');
})
app.get('/:shortUrl',async(req,res) =>{
    const shortDoc = await shortUrl.findOne({short: req.params.shortUrl});
    if(shortDoc==null) return res.sendStatus(404);

    shortDoc.clicks++;
   await shortDoc.save();

    res.redirect(shortDoc.full);
})


mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});
mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
});


app.post('/delete/:id', async (req, res) => {
    const idToDelete = req.params.id;

    try {
        const deletedUrl = await shortUrl.findByIdAndRemove(idToDelete);
        if (!deletedUrl) {
            return res.status(404).send("URL not found");
        }
        
        console.log(`Deleted URL: ${deletedUrl.full}`);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});