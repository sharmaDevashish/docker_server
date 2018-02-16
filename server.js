var net = require('net');
var azure = require('azure-storage');
JsonSocket = require('json-socket');
const log = require('simple-node-logger').createSimpleLogger('project.log');
var fs = require('fs');
var path = require('path');
var readlineSync = require('readline-sync');
var storage = require('azure-storage');
var util = require('util');
var uuid = require('uuid');

var connectionString = 'DefaultEndpointsProtocol=https;AccountName=dockerlog;AccountKey=GwxI+hvnvgFWM0KQ4+Kr4c75uJO/oazAVXgDzJiN1iqAKGPoi/OkC4oou9RQidDUlaWQrAE4GoF+/tuLbrjcIw==;EndpointSuffix=core.windows.net';
var blobService = storage.createBlobService(connectionString);

var USER_HOME = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
var DOCUMENT_FOLDER = path.join(USER_HOME, 'Documents');
if (!fs.existsSync(DOCUMENT_FOLDER)) {
  fs.mkdirSync(DOCUMENT_FOLDER);
}

function createBlob(){
    var LOCAL_FILE_TO_UPLOAD = 'project' + '.log';
    //var LOCAL_FILE_PATH = path.join(DOCUMENT_FOLDER, LOCAL_FILE_TO_UPLOAD);
    var DOWNLOADED_FILE_NAME = LOCAL_FILE_TO_UPLOAD.replace('.log', '_DOWNLOADED.log');
    var DOWNLOADED_FILE_PATH = path.join(DOCUMENT_FOLDER, DOWNLOADED_FILE_NAME);
    var CONTAINER_NAME = 'device'+Math.floor((Math.random() * 2) + 1);
    var d = new Date();
    var BLOCK_BLOB_NAME = LOCAL_FILE_TO_UPLOAD +'-'+d.toDateString()+'/'+ LOCAL_FILE_TO_UPLOAD;

    console.log('Azure Storage Node.js Client Library Blobs Quick Start\n');

    console.log('1. Creating a container with public access:', CONTAINER_NAME, '\n');
    blobService.createContainerIfNotExists(CONTAINER_NAME, { 'publicAccessLevel': 'blob' }, function (error) {
    handleError(error);

        console.log('3. Uploading BlockBlob:', BLOCK_BLOB_NAME, '\n');
        blobService.createBlockBlobFromLocalFile(CONTAINER_NAME, BLOCK_BLOB_NAME, "D:/\\Docker/\\project.log", function (error) {
        handleError(error);
        console.log('   Uploaded Blob URL:', blobService.getUrl(CONTAINER_NAME, BLOCK_BLOB_NAME), '\n');

            console.log('4. Listing blobs in container\n');
            blobService.listBlobsSegmented(CONTAINER_NAME, null, function (error, data) {
            handleError(error);

            for (var i = 0; i < data.entries.length; i++) {
                console.log(util.format('   - %s (type: %s)'), data.entries[i].name, data.entries[i].blobType);
            }
            console.log('\n');

                console.log('5. Downloading blob\n');
                blobService.getBlobToLocalFile(CONTAINER_NAME, BLOCK_BLOB_NAME, DOWNLOADED_FILE_PATH, function (error) {
                handleError(error);
                console.log('Downloaded File:', DOWNLOADED_FILE_PATH, '\n');
            
            });
        });
    });
});
}

function handleError(error) {
  if (error) {
    console.error('Exception thrown:\n', error);
    process.abort();
  }
}


var port = 8080;
var server = net.createServer();
server.listen(port);
server.on('connection', function(socket) { //This is a standard net.Socket
    socket = new JsonSocket(socket); //Now we've decorated the net.Socket to be a JsonSocket
    socket.on('message', function(message) {
        console.log(message)
        log.info(message);
        var result ="Log recieved";
        socket.sendEndMessage({result});
    });
});

setInterval(createBlob, 3000);



