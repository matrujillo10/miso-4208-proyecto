var express = require('express');
var {db, uploadFileToStorage} = require('../firestore')
var router = express.Router();
var createError = require('http-errors');
var uuid = require('uuid/v4');
var splitFilename = require('../utils')
var sendWork = require('../sender')

const testType = 'BDT';

router.get('/', function(req, res, next) {
  db.collection(testType).get()
  .then((snapshot) => {
    var data = [];
    snapshot.forEach(function(doc) { 
      data.push({
        id: doc.id,
        data: doc.data()
      });
    });
    console.log(data);
    res.send(JSON.stringify(data));
  })
  .catch((err) => {
    console.log('Error getting documents', err);
    next(createError(500, 'Error getting documents'));
  });
});

router.get('/:ID', function(req, res, next) {
  console.log(req.params.ID)
  db.collection(testType).doc(req.params.ID).get()
  .then((doc) => {
    var data = {
      id: doc.id,
      data: doc.data()
    };
    console.log(data);
    res.send(JSON.stringify(data));
  })
  .catch((err) => {
    console.log('Error getting documents', err);
    next(createError(500, 'Error getting documents'));
  });
});

router.post('/', function(req, res, next) {
  if (req.files && req.fields.name && req.fields.description && req.fields.roundID) {
    let files = req.files.files;
    var id = uuid();
    var i = 0; var j = 1;
    if ((!files[0].type.includes('javascript') && splitFilename(files[0].name).ext != '.feature') || 
        (!files[1].type.includes('javascript') && splitFilename(files[1].name).ext != '.feature') ||
        (files[0].type.includes('javascript') && files[1].type.includes('javascript')) ||
        (splitFilename(files[1].name).ext != '.feature' && splitFilename(files[1].name).ext != '.feature') ||
        files.length > 2) {
      next(createError(400, "The files uploaded are not ok. We only accept 2 files. One javascript file and one .feature."));
    } else if (files[1].type.includes('javascript')) {
      j = 0;
      i = 1;
    } else {
      uploadFileToStorage(files[i]).then(data1 => {
        uploadFileToStorage(files[j]).then(data2 => {
          db.collection(testType).doc(id).set({
            name: req.fields.name,
            description: req.fields.description,
            steps: data1.url,
            feature: data2.url
          }).then(ans => {
            res.send({
              testID: id
            });
          })
        }, error => {
          console.log('Error storing files', error);
          next(createError(500, 'Error storing files'));
        })
      }, error => {
        console.log('Error storing files', error);
        next(createError(500, 'Error storing files'));
      })
    }
  } else {
    next(createError(400, "There's no enough data to create the test"));
  }
})

router.get('/execute/:ID', function(req, res, next) {
  db.collection(testType).doc(req.params.ID).get()
  .then((doc) => {
    var data = doc.data();
    sendWork(data, testType, function(response) {
      if (response.status == 'ok') {
        res.send(response);
      } else {
        next(createError(500, 'El worker no pudo ejecutar el script.'));
      }
    }, function(error) {
      console.log('Error sending the work', error);
      next(createError(500, 'Error storing files'));
    })
  })
  .catch((err) => {
    console.log('Error getting documents', err);
    next(createError(500, 'Error getting documents'));
  });
})

module.exports = router;