var express = require('express'),
    app = express();

app.use(express.logger());

app.get('/', function(req, res){
    res.send('Hello World');
});

app.listen(3000);
console.log('Express server started on port %s', 3000);
