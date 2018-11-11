const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');
const MongoClient = require('mongodb').MongoClient;
var app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
    if(req.query.name){
        console.log(req.query.name);
        var searchString = 'https://fintel.io/i/' + req.query.name;
        request(searchString, (error, response, html) => {
            if(!error && response.statusCode == 200){
                const $ = cheerio.load(html);

                i = 1;
                var myurl = '#trans13f > tr:nth-child(' + i +')';
                var row = $(myurl);
                while(row.text()){
                    myurl = '#trans13f > tr:nth-child(' + i +')';
                    row = $(myurl);

                    bulk = row.text().split('\n');

                    companies = {
                        "name": bulk[5],
                        "amount": bulk[9],
                        "size": bulk[12]
                    }
                    console.log(companies);

                    i++;
                    myurl = '#trans13f > tr:nth-child(' + i +')';
                    row = $(myurl);
                }
            }else{
                res.render('error', {
                    "title": "ERROR",
                    "error": "Invalid query."
                });
            }
        });
    }else if(req.query.symbol){
        console.log(req.query.symbol);
        var searchString = 'https://fintel.io/sob/us/' + req.query.symbol;
        request(searchString, (error, response, html) => {
            if(!error && response.statusCode == 200){
                const $ = cheerio.load(html);

                i = 1;
                var myurl = '#transactions > tbody > tr:nth-child(' + i +')';
                var row = $(myurl);
                while(row.text()){

                    bulk = row.text().split('\n');

                    hedgeFund = {
                        "date": bulk[1],
                        "name": bulk[3],
                        "amount": bulk[10]
                    };
                    console.log(hedgeFund);

                    i++;
                    myurl = '#transactions > tbody > tr:nth-child(' + i +')';
                    row = $(myurl);
                }
            }else{
                res.render('error', {
                    "title": "ERROR",
                    "error": "Invalid query."
                });
            }
        });
    }else{
        res.render('error', {
            "title": "ERROR",
            "error": "Invalid query."
        });
    }
});

app.post('/', function(req, res){
    if(req.body.name){
        //console.log("name: " + req.body.name);
        searchName = req.body.name.toLowerCase();
        var entry = "";
        var fixed = searchName.split(" ");
        //console.log(fixed);
        //console.log(fixed.length);
        var searchString = 'https://fintel.io/i/';
        for(var x = 0; x < fixed.length; x++){
            if(x != fixed.length-1){
                entry = entry + fixed[x];
                entry = entry + '-';
                searchString = searchString + fixed[x];
                searchString = searchString + '-';
            }else{
                searchString = searchString + fixed[x];
                entry = entry + fixed[x];
            }
        }
        console.log(searchString);
        //var searchString = 'https://fintel.io/i/' + req.body.name;
        request(searchString, (error, response, html) => {
            if(!error && response.statusCode == 200){
                const $ = cheerio.load(html);

                i = 1;
                var myurl = '#topic-table-body > table > tbody > tr:nth-child(' + i +')';
                var row = $(myurl);
                var list = [];
                while(row.text()){

                    bulk = row.text().split('\n');

                    companies = {
                        "name": bulk[3],
                        "amount": bulk[7],
                        "size": bulk[9]
                    }
                    list.unshift(companies);
                    console.log(companies);

                    i++;
                    myurl = '#topic-table-body > table > tbody > tr:nth-child(' + i +')';
                    row = $(myurl);

                    if(!(bulk[3] && bulk[7] && bulk[9])){
                        break;
                    }
                }

                //res.send(list);
                res.render('companyResults', {
                    "title": "Search Results",
                    "results": list
                });
            }else{
                //console.log("name: " + req.body.name);
                searchName = req.body.name;
                var fixed = searchName.split(" ");
                //console.log(fixed);
                //console.log(fixed.length);
                var searchString = 'https://fintel.io/search?search=';
                for(var x = 0; x < fixed.length; x++){
                    if(x != fixed.length-1){
                        searchString = searchString + fixed[x];
                        searchString = searchString + '+';
                    }else{
                        searchString = searchString + fixed[x];
                    }
                }
                console.log(searchString);
                //var searchString = 'https://fintel.io/i/' + req.body.name;
                request(searchString, (error, response, html) => {
                    if(!error && response.statusCode == 200){
                        const $ = cheerio.load(html);

                        //owner
                        i = 2;
                        var myurl = '#ownerList > p:nth-child(' + i +')';
                        var row = $(myurl);
                        var list = [];
                        while(row.text()){
                            list.unshift(row.text());
                            console.log(row.text());

                            i++;
                            myurl = '#ownerList > p:nth-child(' + i +')';
                            row = $(myurl);
                        }

                        //Investors
                        i = 2;
                        var myurl = '#insiderList > p:nth-child(' + i +')';
                        var row = $(myurl);
                        var list2 = [];
                        while(row.text()){

                            list2.unshift(row.text());
                            console.log(row.text());

                            //#insiderList > p:nth-child(3)
                            i++;
                            myurl = '#insiderList > p:nth-child(' + i +')';
                            row = $(myurl);
                        }

                        //res.send(list);
                        res.render('noExact', {
                            "title": "Alternatives",
                            "results": list,
                            "results2": list2
                        });
                    }else{
                        res.render('error', {
                            "title": "ERROR",
                            "error": "Invalid query."
                        });
                    }
                });
            }
        });
    }else if(req.body.symbol){
        console.log("symbol: " + req.body.symbol);
        var searchString = 'https://fintel.io/sob/us/' + req.body.symbol;
        request(searchString, (error, response, html) => {
            if(!error && response.statusCode == 200){
                const $ = cheerio.load(html);

                i = 1;
                var list = [];
                var myurl = '#transactions > tbody > tr:nth-child(' + i +')';
                var row = $(myurl);
                while(row.text()){

                    bulk = row.text().split('\n');

                    hedgeFund = {
                        "date": bulk[1],
                        "name": bulk[3],
                        "amount": bulk[10]
                    };
                    list.unshift(hedgeFund);
                    console.log(hedgeFund);

                    i++;
                    myurl = '#transactions > tbody > tr:nth-child(' + i +')';
                    row = $(myurl);
                }

                //res.send(list);
                res.render('hedgeFundResults', {
                    "title": "Search Results",
                    "results": list
                });
            }else{
                res.render('error', {
                    "title": "ERROR",
                    "error": "Invalid query."
                });
            }
        });
    }else if(req.body.investor){
        const uri = "mongodb+srv://admin:Zarick23!@cluster0-yv422.mongodb.net/test?retryWrites=true";
        MongoClient.connect(uri, { useNewUrlParser: true }, function(err, client) {
            if(err){
                console.log("Error connecting to MongoDB Atlas!");
            }
            console.log('Connected! .....');

            const Investors = client.db("Bare").collection("Investors");
            var investorname = req.body.investor;
            investorname = investorname.toLowerCase()
            .split(' ')
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ');

            Investors.find({ "Name" : investorname }).toArray(function(err2, result){
                if(err2){
                    console.log(err2);
                }else if(result.length){
                    console.log(result[0].Account_Name);
                    searchName = result[0].Account_Name;
                    var fixed = searchName.toLowerCase().split(" ");
                    var searchString = 'https://fintel.io/i/';
                    for(var x = 0; x < fixed.length; x++){
                        if(x != fixed.length-1){
                            searchString = searchString + fixed[x];
                            searchString = searchString + '-';
                        }else{
                            searchString = searchString + fixed[x];
                        }
                    }
                    console.log(searchString);
                    request(searchString, (error, response, html) => {
                        if(!error && response.statusCode == 200){
                            const $ = cheerio.load(html);

                            i = 1;
                            var myurl = '#topic-table-body > table > tbody > tr:nth-child(' + i +')';
                            var row = $(myurl);
                            var list = [];
                            while(row.text()){

                                bulk = row.text().split('\n');

                                companies = {
                                    "name": bulk[3],
                                    "amount": bulk[7],
                                    "size": bulk[9]
                                }
                                list.unshift(companies);
                                console.log(companies);

                                i++;
                                myurl = '#topic-table-body > table > tbody > tr:nth-child(' + i +')';
                                row = $(myurl);

                                if(!(bulk[3] && bulk[7] && bulk[9])){
                                    break;
                                }
                            }
                            res.render('companyResults', {
                                "title": "Search Results",
                                "results": list
                            });
                        }else{
                            res.render('error', {
                                "title": "ERROR",
                                "error": "No matching documents found."
                            });
                        }
                    });
                }else{
                    res.send('No matching investor!');
                }
                client.close();
            });
        });
    }else{
        console.log("received other");
    }
});

app.post('/login', function(req, res){
    const uri = "mongodb+srv://admin:Zarick23!@cluster0-yv422.mongodb.net/test?retryWrites=true";
    MongoClient.connect(uri, { useNewUrlParser: true }, function(err, client) {
        if(err){
            console.log("Error connecting to MongoDB Atlas!");
        }
        console.log('Connected! .....');

        const ActInfo = client.db("Bare").collection("Account Information");
        ActInfo.find({ "username" : req.body.uname, "password": req.body.pword }).toArray(function(err2, result){
            if(err2){
                console.log(err2);
            }else if(result.length){
                console.log(result);
                res.render('menu', {
                    "title": "Entry Page",
                    "results": result
                });
            }else{
                res.send('No documents.');
            }
            console.log('Disconnecting from DB! .....');
            client.close();
        });
    });
});

app.get('/hedgeFundSearch', function(req, res){
    const uri = "mongodb+srv://admin:Zarick23!@cluster0-yv422.mongodb.net/test?retryWrites=true";
    MongoClient.connect(uri, { useNewUrlParser: true }, function(err, client) {
        if(err){
            console.log("Error connecting to MongoDB Atlas!");
        }
        console.log('Connected! .....');

        const Companies = client.db("Bare").collection("Companies");
        Companies.find({}).toArray(function(err2, result){
            if(err2){
                console.log(err2);
            }else if(result.length){
                res.render('hedgeFundSearch', {
                    "title": "Hedge Fund Search",
                    "results": result
                });
            }else{
                res.send('No documents.');
            }
            client.close();
        });
        // perform actions on the collection object
    });
});

app.get('/investorSearch', function(req, res){
    const uri = "mongodb+srv://admin:Zarick23!@cluster0-yv422.mongodb.net/test?retryWrites=true";
    MongoClient.connect(uri, { useNewUrlParser: true }, function(err, client) {
        if(err){
            console.log("Error connecting to MongoDB Atlas!");
        }
        console.log('Connected! .....');

        const Investors = client.db("Bare").collection("Investors");
        Investors.find({}).toArray(function(err2, result){
            if(err2){
                console.log(err2);
            }else if(result.length){
                res.render('investorSearch', {
                    "title": "Investor Search",
                    "results": result
                });
            }else{
                res.send('No documents.');
            }
            client.close();
        });
    });
});

app.get('/companySearch', function(req, res){
    const uri = "mongodb+srv://admin:Zarick23!@cluster0-yv422.mongodb.net/test?retryWrites=true";
    MongoClient.connect(uri, { useNewUrlParser: true }, function(err, client) {
        if(err){
            console.log("Error connecting to MongoDB Atlas!");
        }
        console.log('Connected! .....');

        const HF = client.db("Bare").collection("HF");
        HF.find({}).toArray(function(err2, result){
            if(err2){
                console.log(err2);
            }else if(result.length){
                res.render('companySearch', {
                    "title": "Company Search",
                    "results": result
                });
            }else{
                res.send('No documents.');
            }
            client.close();
        });
    });
});

app.get('/menu', function(req, res){
    res.render('menu', {
        "title": "Menu Page"
    });
});

app.listen(3000, function() {
    console.log('Listening on port 3000');
});
