var express = require('express');
var {db, uploadFileToStorage} = require('../firestore')
var router = express.Router();
var createError = require('http-errors');
var uuid = require('uuid/v4');
var sendWork = require('../sender')

const testType = 'E2E';

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
  if (req.files && req.fields.name && req.fields.description && req.fields.roundID && req.fields.spec) {
    let file = req.files.files;
    var id = uuid();
    if (!file.type.includes('zip') || Array.isArray(file)) {
      next(createError(400, "The files uploaded are not ok. We only accept one zip file."));
    } else {
      uploadFileToStorage(file).then(data => {
        db.collection(testType).doc(id).set({
          name: req.fields.name,
          description: req.fields.description,
          spec: req.fields.spec,
          zip: data.url
        }).then(ans => {
          res.send({
            testID: id
          });
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
      next(createError(500, 'Error sending the work'));
    })
  })
  .catch((err) => {
    console.log('Error getting documents', err);
    next(createError(500, 'Error getting documents'));
  });
})

module.exports = router;