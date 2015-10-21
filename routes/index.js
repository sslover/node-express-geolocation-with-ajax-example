var express = require('express');
var router = express.Router();
var mongoose = require('mongoose'); // mongoDB library
var geocoder = require('geocoder'); // geocoder library

// our db model
var Animal = require("../models/model.js");

/**
 * GET '/'
 * Default home route. Just relays a success message back.
 * @param  {Object} req
 * @return {Object} json
 */
router.get('/', function(req, res) {
  
  var jsonData = {
  	'name': 'pets-of-nyc',
  	'api-status':'OK'
  }

  // respond with json data
  res.json(jsonData)
});

// simple route to show the pets html
router.get('/pets', function(req,res){
  res.render('pets.html');
})

// /**
//  * POST '/api/create'
//  * Receives a POST request of the new user and location, saves to db, responds back
//  * @param  {Object} req. An object containing the different attributes of the Person
//  * @return {Object} JSON
//  */

router.post('/api/create', function(req, res){

    console.log('the data we received is --> ')
    console.log(req.body);

    // pull out the information from the req.body
    var name = req.body.name;
    var age = req.body.age;
    var tags = req.body.tags.split(","); // split string into array
    var weight = req.body.weight;
    var breed = req.body.breed;
    var url = req.body.url;
    var location = req.body.location;

    // hold all this data in an object
    // this object should be structured the same way as your db model
    var animalObj = {
      name: name,
      age: age,
      tags: tags,
      weight: weight,
      breed: breed,
      url: url
    };

    // if there is no location, return an error
    if(!location) return res.json({status:'ERROR', message: 'You are missing a required field or have submitted a malformed request.'})

    // now, let's geocode the location
    geocoder.geocode(location, function (err,data) {


      // if we get an error, or don't have any results, respond back with error
      if (!data || data==null || err || data.status == 'ZERO_RESULTS'){
        var error = {status:'ERROR', message: 'Error finding location'};
        return res.json({status:'ERROR', message: 'You are missing a required field or have submitted a malformed request.'})
      }

      // else, let's pull put the lat lon from the results
      var lon = data.results[0].geometry.location.lng;
      var lat = data.results[0].geometry.location.lat;

      // now, let's add this to our animal object from above
      animalObj.location = {
        geo: [lon,lat], // need to put the geo co-ordinates in a lng-lat array for saving
        name: data.results[0].formatted_address // the location name
      }

      // now, let's save it to the database
      // create a new animal model instance, passing in the object we've created
      var animal = new Animal(animalObj);

      // now, save that animal instance to the database
      // mongoose method, see http://mongoosejs.com/docs/api.html#model_Model-save    
      animal.save(function(err,data){
        // if err saving, respond back with error
        if (err){
          var error = {status:'ERROR', message: 'Error saving animal'};
          return res.json(error);
        }

        console.log('saved a new animal!');
        console.log(data);

        // now return the json data of the new animal
        var jsonData = {
          status: 'OK',
          animal: data
        }

        return res.json(jsonData);

      }) 

    }); 
});

// /**
//  * GET '/api/get/:id'
//  * Receives a GET request specifying the animal to get
//  * @param  {String} req.param('id'). The animalId
//  * @return {Object} JSON
//  */

router.get('/api/get/:id', function(req, res){

  var requestedId = req.param('id');

  // mongoose method, see http://mongoosejs.com/docs/api.html#model_Model.findById
  Animal.findById(requestedId, function(err,data){

    // if err or no user found, respond with error 
    if(err || data == null){
      var error = {status:'ERROR', message: 'Could not find that animal'};
       return res.json(error);
    }

    // otherwise respond with JSON data of the animal
    var jsonData = {
      status: 'OK',
      animal: data
    }

    return res.json(jsonData);
  
  })
})

// /**
//  * GET '/api/get'
//  * Receives a GET request to get all animal details
//  * @return {Object} JSON
//  */

router.get('/api/get', function(req, res){

  // mongoose method to find all, see http://mongoosejs.com/docs/api.html#model_Model.find
  Animal.find(function(err, data){
    // if err or no animals found, respond with error 
    if(err || data == null){
      var error = {status:'ERROR', message: 'Could not find animals'};
      return res.json(error);
    }

    // otherwise, respond with the data 

    var jsonData = {
      status: 'OK',
      animals: data
    } 

    res.json(jsonData);

  })

})

// /**
//  * POST '/api/update/:id'
//  * Receives a POST request with data of the animal to update, updates db, responds back
//  * @param  {String} req.param('id'). The animalId to update
//  * @param  {Object} req. An object containing the different attributes of the Animal
//  * @return {Object} JSON
//  */

router.post('/api/update/:id', function(req, res){

   var requestedId = req.param('id');

   var dataToUpdate = {}; // a blank object of data to update

    // pull out the information from the req.body and add it to the object to update
    var name, age, weight, breed, url, location; 

    // we only want to update any field if it actually is contained within the req.body
    // otherwise, leave it alone.
    if(req.body.name) {
      name = req.body.name;
      // add to object that holds updated data
      dataToUpdate['name'] = name;
    }
    if(req.body.age) {
      age = req.body.age;
      // add to object that holds updated data
      dataToUpdate['age'] = age;
    }
    if(req.body.weight) {
      weight = req.body.weight;
      // add to object that holds updated data
      dataToUpdate['weight'] = weight;
    }
    if(req.body.breed) {
      breed = req.body.breed;
      // add to object that holds updated data
      dataToUpdate['breed'] = breed;
    }
    if(req.body.url) {
      url = req.body.url;
      // add to object that holds updated data
      dataToUpdate['url'] = url;
    }

    var tags = []; // blank array to hold tags
    if(req.body.tags){
      tags = req.body.tags.split(","); // split string into array
      // add to object that holds updated data
      dataToUpdate['tags'] = tags;
    }

    if(req.body.location) {
      location = req.body.location;
    }

    // if there is no location, return an error
    if(!location) return res.json({status:'ERROR', message: 'You are missing a required field or have submitted a malformed request.'})

    // now, let's geocode the location
    geocoder.geocode(location, function (err,data) {


      // if we get an error, or don't have any results, respond back with error
      if (!data || data==null || err || data.status == 'ZERO_RESULTS'){
        var error = {status:'ERROR', message: 'Error finding location'};
        return res.json({status:'ERROR', message: 'You are missing a required field or have submitted a malformed request.'})
      }

      // else, let's pull put the lat lon from the results
      var lon = data.results[0].geometry.location.lng;
      var lat = data.results[0].geometry.location.lat;

      // now, let's add this to our animal object from above
      dataToUpdate['location'] = {
        geo: [lon,lat], // need to put the geo co-ordinates in a lng-lat array for saving
        name: data.results[0].formatted_address // the location name
      }

      console.log('the data to update is ' + JSON.stringify(dataToUpdate));

      // now, update that animal
      // mongoose method findByIdAndUpdate, see http://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate  
      Animal.findByIdAndUpdate(requestedId, dataToUpdate, function(err,data){
        // if err saving, respond back with error
        if (err){
          var error = {status:'ERROR', message: 'Error updating animal'};
          return res.json(error);
        }

        console.log('updated the animal!');
        console.log(data);

        // now return the json data of the new person
        var jsonData = {
          status: 'OK',
          animal: data
        }

        return res.json(jsonData);

      })

    });     

})

/**
 * GET '/api/delete/:id'
 * Receives a GET request specifying the animal to delete
 * @param  {String} req.param('id'). The animalId
 * @return {Object} JSON
 */

router.get('/api/delete/:id', function(req, res){

  var requestedId = req.param('id');

  // Mongoose method to remove, http://mongoosejs.com/docs/api.html#model_Model.findByIdAndRemove
  Animal.findByIdAndRemove(requestedId,function(err, data){
    if(err || data == null){
      var error = {status:'ERROR', message: 'Could not find that animal to delete'};
      return res.json(error);
    }

    // otherwise, respond back with success
    var jsonData = {
      status: 'OK',
      message: 'Successfully deleted id ' + requestedId
    }

    res.json(jsonData);

  })

})

module.exports = router;