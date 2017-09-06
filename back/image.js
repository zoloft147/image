
'use strict';
const async = require("async");
const _ = require('lodash');
const express = require('express');
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser')
app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json())

var hash = require('object-hash');

var mime = require('mime-types');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('image1.sqlite', err => { if (err) console.log(err) }); 

const nodeDir = require('node-dir');
const fs = require('fs');
var Promise = require("bluebird");
Promise.promisifyAll(fs);
const asset = "../front/asset/";
const path = require('path');

// take care of all the directory and file
class DirectoryUtils {

    static isValidDirectory(source) {

        // if image name source is invalid return
        if (source == null || source.length == 0) {
            return false;
        }
        
        // expect format to look like this ../asset/topic/subtopic.../imagename
        // aka topic name will always be at pos 2
        // aka subtopic will be 3 to len - 1(last) - 1(right before image name)
        // aka image name = len - 1
        let splittedSource = source.split("/");

        // invalid image source
        if (splittedSource == null || splittedSource.length < 4) {
            return false;
        }
        return true;
    }

    static isValidRectangle(rectangle) {
        return !(rectangle.first == null || rectangle.second == null ||
            rectangle.answer == null || rectangle.imageDimensions == null ||
            rectangle.first.x == null || rectangle.first.y == null || 
            rectangle.second.x == null || rectangle.second.y == null ||
            rectangle.answer.length == 0 || rectangle.imageDimensions.width == null ||
            rectangle.imageDimensions.height == null || rectangle.first.x < 0 ||
            rectangle.first.y < 0 || rectangle.second.x < 0 || rectangle.second.y < 0 ||
            rectangle.imageDimensions.width < 0 || rectangle.imageDimensions.height < 0);
    }

    static readDirR(dir) {
        return fs.statSync(dir).isDirectory()
            ? Array.prototype.concat(...fs.readdirSync(dir).map(f => this.readDirR(path.join(dir, f))))
            : dir;
    }

    static getDirR(dir, callback) {
        nodeDir.subdirs(dir, callback);
    }
    
    // accept a string of directory and return a promise
    // of all files path inside recursively
    static getFiles(dir) {
        // DONE:
        return nodeDir.promiseFiles(dir);
    }

    // return true if the dir contains image
    // false otherwise
    static isImage(dir) {
        return mime.lookup(dir) != false;
    }

    static fileToDir (filePath) {
        return path.dirname(filePath);
    }

    static relatifyToCss(filePath) {
        return filePath.replace("../front/asset/", "asset/");
    }

    static relatifyToServerForDelete(filePath) {
        return filePath.replace("asset/", '../front/asset/');
    }
}

class TransactionUtils {
    static prepareToInsertRectangle (rectangle, imageName) {
        // everything is valid, so put data into database
        let firstPointX = rectangle.first.x;
        let firstPointY = rectangle.first.y;
        let secondPointX = rectangle.second.x;
        let secondPointY = rectangle.second.y;
        let answer = rectangle.answer;
        let imageWidth = rectangle.imageDimensions.width;
        let imageHeight = rectangle.imageDimensions.height;
        console.dir(rectangle);
        let hashArr =  [firstPointX, firstPointY, 
                        secondPointX, secondPointY, 
                        imageHeight, imageWidth,
                        answer, imageName];
        let hashValue = hash.MD5(hashArr);
        hashArr.unshift(hashValue);
        return hashArr;
    }

    static logPrepareErr(err) {
        if(err != null) {
            console.log(err);
        }
    }
}

// produce statment object
var StatementService = (() => {
    
    // return statement for to get all the images
    function queryForImage() {
        return db.prepare(`SELECT * FROM ${IMAGE_TABLE.TABLE_NAME}`, TransactionUtils.logPrepareErr);
    }

    // return statement to query images based on imageID
    function queryForOneImage(imageID) {
        return db.prepare(`SELECT FROM ${IMAGE_TABLE.TABLE_NAME}
                            WHERE ${IMAGE_TABLE.ID} = ?`, 
                            imageID,
                            TransactionUtils.logPrepareErr
                        )
    }

    // return statement to query for imageID based on imageSource
    function queryForImageID(imageSource) {
        return db.prepare(`SELECT FROM ${IMAGE_TABLE.TABLE_NAME}
                            WHERE ${IMAGE_TABLE.SOURCE} = ?`, 
                            imageSource,
                            TransactionUtils.logPrepareErr
                        );
    }

    // return all rectangles associated with imagesource
    function queryRectanglesFromImage(imageSource) {
        return db.prepare(`SELECT * 
                            FROM ${RECTANGLE_TABLE.TABLE_NAME} AS rect
                            INNER JOIN ${IMAGE_TABLE.TABLE_NAME} AS image ON image.${IMAGE_TABLE.ID} = rect.${RECTANGLE_TABLE.IMAGE_ID}
                            WHERE ${IMAGE_TABLE.SOURCE} = ?
                            `, imageSource, TransactionUtils.logPrepareErr);
    }

    // query all rectangles from super path
    // this will not return anything if the superpath
    // does not have any images with any rectangles
    function queryRectanglesFromSuperPath(superPath) {
        return db.prepare(`SELECT *
                            FROM ${IMAGE_TABLE.TABLE_NAME}
                            LEFT JOIN ${RECTANGLE_TABLE.TABLE_NAME} ON ${RECTANGLE_TABLE.TABLE_NAME}.${RECTANGLE_TABLE.IMAGE_ID} = ${IMAGE_TABLE.TABLE_NAME}.${IMAGE_TABLE.ID}
                            INNER JOIN ${DIR_TABLE.NAME} ON ${DIR_TABLE.NAME}.${DIR_TABLE.ID} = ${IMAGE_TABLE.TABLE_NAME}.${IMAGE_TABLE.DIR_ID}
                            WHERE ${DIR_TABLE.NAME}.${DIR_TABLE.DIR} = ?`, superPath, TransactionUtils.logPrepareErr);
    }

    function queryImagesFromSuperPath(superPath) {
        return db.prepare(`SELECT img.${IMAGE_TABLE.SOURCE}
                            FROM ${IMAGE_TABLE.TABLE_NAME} AS img
                            INNER JOIN ${DIR_TABLE.NAME} AS dir ON img.${IMAGE_TABLE.DIR_ID} = dir.${DIR_TABLE.ID}
                            WHERE dir.${DIR_TABLE.DIR} = ?`, superPath, TransactionUtils.logPrepareErr());
    }

    function queryForAllPristineImage() {
        return db.prepare(`SELECT ${IMAGE_TABLE.SOURCE} 
                            FROM ${IMAGE_TABLE.TABLE_NAME} AS img
                            LEFT JOIN ${RECTANGLE_TABLE.TABLE_NAME} AS rect ON img.${IMAGE_TABLE.ID} = rect.${RECTANGLE_TABLE.IMAGE_ID}
                            WHERE rect.${RECTANGLE_TABLE.IMAGE_ID} IS null`);
    }

    function queryAllDirectory() {
        return db.prepare(`SELECT ${DIR_TABLE.DIR} FROM ${DIR_TABLE.NAME}`);
    }

    function queryForDirtySuper() {
        return db.prepare(` SELECT ${DIR_TABLE.DIR}
                            FROM ${DIR_TABLE.NAME}
                            INNER JOIN ${IMAGE_TABLE.TABLE_NAME}
                                ON ${DIR_TABLE.NAME}.${DIR_TABLE.ID} = ${IMAGE_TABLE.TABLE_NAME}.${IMAGE_TABLE.DIR_ID}
                            GROUP BY ${DIR_TABLE.NAME}.${DIR_TABLE.DIR}
                                HAVING SUM (DISTINCT ${IMAGE_TABLE.TABLE_NAME}.${IMAGE_TABLE.HAS_RECT}) = 2`, 
                            TransactionUtils.logPrepareErr);
    }

    function queryForPristineSuper() {
        return db.prepare(` SELECT ${DIR_TABLE.DIR}
                            FROM ${DIR_TABLE.NAME}
                            INNER JOIN ${IMAGE_TABLE.TABLE_NAME}
                                ON ${DIR_TABLE.NAME}.${DIR_TABLE.ID} = ${IMAGE_TABLE.TABLE_NAME}.${IMAGE_TABLE.DIR_ID}
                            GROUP BY ${DIR_TABLE.NAME}.${DIR_TABLE.DIR}
                                HAVING SUM (DISTINCT ${IMAGE_TABLE.TABLE_NAME}.${IMAGE_TABLE.HAS_RECT}) = 1)`, 
                            TransactionUtils.logPrepareErr);
    }

    // return stm to add 1 row in image table based on imageSource
    function addImage(imageSource) {
        return db.prepare(`INSERT OR IGNORE INTO ${IMAGE_TABLE.TABLE_NAME}
                        (${IMAGE_TABLE.DATE}, ${IMAGE_TABLE.SOURCE}, ${IMAGE_TABLE.DIR_ID})
                        VALUES 
                        (?, ?, (SELECT DISTINCT ${DIR_TABLE.ID}
                            FROM ${DIR_TABLE.NAME} 
                            WHERE ${DIR_TABLE.DIR} = ?))`, 
                    [Date.now(), imageSource, DirectoryUtils.fileToDir(imageSource)],
                    TransactionUtils.logPrepareErr);
    }

    // return stm to add 1 row in rectangle table based on an array
    // the rectangle Arr should have these elements in the exact order
    // [hash, firstX, firstY, secondX, secondY, imgHeight, imgWidth, answer, imgSource]
    function addOneRectangle (rectangleArr) {
        return db.prepare(`INSERT INTO ${RECTANGLE_TABLE.TABLE_NAME}
                        (${RECTANGLE_TABLE.HASH},
                        ${RECTANGLE_TABLE.FIRST_X}, 
                        ${RECTANGLE_TABLE.FIRST_Y}, 
                        ${RECTANGLE_TABLE.SECOND_X}, 
                        ${RECTANGLE_TABLE.SECOND_Y}, 
                        ${RECTANGLE_TABLE.IMG_HEIGHT}, 
                        ${RECTANGLE_TABLE.IMG_WIDTH},
                        ${RECTANGLE_TABLE.ANSWER},
                        ${RECTANGLE_TABLE.IMAGE_ID})
                        VALUES (?,
                                ?, 
                                ?, 
                                ?, 
                                ?, 
                                ?, 
                                ?, 
                                ?, 
                                (SELECT ${IMAGE_TABLE.ID} 
                                FROM ${IMAGE_TABLE.TABLE_NAME} 
                                WHERE ${IMAGE_TABLE.SOURCE} = ?));
                        `, 
                        rectangleArr,
                        TransactionUtils.logPrepareErr);
    }

    function addOneDirectory(myDir) {
        return db.prepare(`INSERT OR IGNORE INTO ${DIR_TABLE.NAME} (${DIR_TABLE.DIR})
                            VALUES(?)`, myDir);
    }
        
    // return stm to delete rows in rectangle table based on imageSource
    function deleteRectangle(imageSource) {
        return db.prepare(`DELETE FROM ${RECTANGLE_TABLE.TABLE_NAME} 
                            WHERE ${RECTANGLE_TABLE.IMAGE_ID} = 
                                (SELECT ${IMAGE_TABLE.ID}
                                FROM ${IMAGE_TABLE.TABLE_NAME} 
                                WHERE ${IMAGE_TABLE.SOURCE} = ?)`,
                            imageSource,
                            TransactionUtils.logPrepareErr);
    }

    function deleteOneImage(myImage) {
        return db.prepare(`DELETE FROM ${IMAGE_TABLE.TABLE_NAME}
                            WHERE ${IMAGE_TABLE.SOURCE} = ?`, myImage);
    }

    function deleteAllDirectory() {
        return db.prepare(`DELETE FROM ${DIR_TABLE.NAME}`);
    }

    function deleteOneDirectory(myDir) {
        return db.prepare(`DELETE FROM ${DIR_TABLE.NAME} 
                            WHERE ${DIR_TABLE.DIR} = ?`, myDir);
    }

    // 2 in having_rect col indicate having rect
    function updateImageStatusToHavingRect(imageSource) {
        return db.prepare(`UPDATE ${IMAGE_TABLE.TABLE_NAME}
                            SET ${IMAGE_TABLE.HAS_RECT} = 2
                            WHERE ${IMAGE_TABLE.SOURCE} = ? 
                            `, 
                            imageSource,
                            TransactionUtils.logPrepareErr);
    }

    // 1 in having_rect col indicate no rect
    function updateImageStatusToNotHavingRect(imageSource) {
        return db.prepare(`UPDATE ${IMAGE_TABLE.TABLE_NAME}
                            SET ${IMAGE_TABLE.HAS_RECT} = 1
                            WHERE ${IMAGE_TABLE.SOURCE} = ?`, 
                            imageSource, 
                            TransactionUtils.logPrepareErr);
    }

    return {
        queryAllImage: queryForImage,
        queryOneImage: queryForOneImage,
        deleteRectangle: deleteRectangle,
        insertImage: addImage,
        insertOneRectangle: addOneRectangle,
        addOneDir: addOneDirectory,
        delAllDir: deleteAllDirectory,
        queryAllDir: queryAllDirectory,
        delOneDir: deleteOneDirectory,
        delOneImage: deleteOneImage,
        getImagesFromSuperPath: queryImagesFromSuperPath,
        getRectFromImage: queryRectanglesFromImage,
        getRectFromSuper: queryRectanglesFromSuperPath,
        getPristineImage: queryForAllPristineImage,
        setImageHasRect: updateImageStatusToHavingRect,
        setImageNotHaveRect: updateImageStatusToNotHavingRect,
        getPristineSuper: queryForPristineSuper,
        getDirtySuper: queryForDirtySuper
    }
})();

// sync between database and 
// and file system
var SyncService = (() => {

    // DONE: update the database state
    function systemDirToDb() {
        DirectoryUtils
            .getFiles(asset)
            .then((arrFiles) => {
                //DONE:
                return _.filter(arrFiles, DirectoryUtils.isImage);
            })
            .then((filteredArr) => {
                //DONE:
                return _.map(filteredArr, DirectoryUtils.fileToDir);
            })
            .then((almostDone) => {
                // DONE:
                return _.map(almostDone, DirectoryUtils.relatifyToCss);
            })
            .then((dirArr) => {
                // DONE:
                
                StatementService.queryAllDir().all(handleQueryAll);

                function handleQueryAll(err, rows) {
                    // DONE:

                    if(err) {
                        throw err;
                    } else {
                        //DONE:
                        // dirArr = directory in the system
                        // may contain duplicates
                        let dirInSystem = _.uniq(dirArr);
                        
                        // dir queried from database
                        var dirInDb;
                        
                        // unique to only system 
                        var onlySystem;

                        // unique to only database
                        var onlyDb;

                        // do this to figure the unique parts of system
                        // and db only if the database has something
                        if (rows != null && rows.length > 0) {
                            // in case there's something from the database
                            // DONE:
                            dirInDb = _.map(rows, val => {
                                return val.directory;
                            });

                            // DONE:
                            onlySystem = _.filter(dirInSystem, val => {
                                return dirInDb.indexOf(val) == -1;
                            });
    
                            // DONE:
                            onlyDb = _.filter(dirInDb, val => {
                                return dirInSystem.indexOf(val) == -1;
                            });
                        } else {
                            // in case the database has nothing
                            // only in the system will be everything
                            onlySystem = dirInSystem;
                        }

                        
                        // if there's something from only the system
                        // add it to database
                        // DONE:
                        if (onlySystem != null && onlySystem.length > 0) {
                            _.forEach(onlySystem, (val) => {
                                StatementService.addOneDir(val).run(TransactionUtils.logPrepareErr);                        
                            });
                        }

                        // if there's something from only the database
                        // delete them
                        // DONE:
                        if (onlyDb != null && onlyDb.length > 0) {
                            _.forEach(onlyDb, (val) => {
                                StatementService.delOneDir(val).run(TransactionUtils.logPrepareErr);
                            });
                        }
                    }
                }

            }) 
            .catch(e => console.error(e));
        
    }

    // DONE: update the image in database
    function systemImageToDb() {
        return DirectoryUtils
        .getFiles(asset)
        .then((arrFiles) => {
            // DONE: check if files are image
            return _.filter(arrFiles, DirectoryUtils.isImage);
        })
        .then((almostDone) => {
            // DONE: make super paths relative to css
            return _.map(almostDone, DirectoryUtils.relatifyToCss);
        })
        .then((dirImageArr) => {
            // DONE:
            StatementService.queryAllImage().all(handleQueryAll);

            function handleQueryAll(err, rows) {
                if(err != null) {
                    throw err;
                } else {
                    //DONE: get rid of image duplicates in system
                    let dirImageInSystem = _.uniq(dirImageArr);

                    //DONE: directory of image in database
                    var dirImageInDb;

                    //DONE: directory of image only present in system
                    var onlySystem;

                    //DONE: directory of image only present in database
                    var onlyDb;

                    // if there's no images from database
                    // all the images in the system will
                    // be the same as directory present in system only
                    // else find out the exclusive images from both
                    // database and system
                    if (rows != null && rows.length > 0) {
                        //DONE: get image directory from data
                        dirImageInDb = _.map(rows, val => {
                            return val.image_directory;
                        });

                        //DONE: filter for only those in the system
                        onlySystem = _.filter(dirImageInSystem, val => {
                            return dirImageInDb.indexOf(val) == -1;
                        });

                        // DONE: filter for only those in the db
                        onlyDb = _.filter(dirImageInDb, val => {
                            return dirImageInSystem.indexOf(val) == -1;
                        });
                    } else {
                        onlySystem = dirImageInSystem;
                    }

                    // if there are some images present only in the system
                    // add them
                    if (onlySystem != null && onlySystem.length > 0) {
                        _.forEach(onlySystem, (val) => {
                            StatementService.insertImage(val).run(TransactionUtils.logPrepareErr);                        
                        });
                    }

                    // if there are some images present in database only
                    // delete them
                    if (onlyDb != null && onlyDb.length > 0) {
                        _.forEach(onlyDb, (val) => {
                            StatementService.delOneImage(val).run(TransactionUtils.logPrepareErr);
                        });
                    }
                    
                    // the images that are present in both database in 
                    // system means it might have some rectangles in them
                    // better not touch those
                }
            }

        }) 
        .catch(e => console.error(e));
    
    }
    return {
        sysDirToDb: systemDirToDb,
        sysImgToDb: systemImageToDb
    };
})();

var PromiseService = (()=>{
    function getRectFromSuperPromise(dirArr) {
        return new Promise((resolve, reject) => {
                var returnResult = [];
                _.each(dirArr, (currentDir) => {
                    if (currentDir == null || currentDir.length <= 0) {
                        reject("user fooked up");
                    }
    
                    
                    db.serialize(() => {
                        StatementService.getRectFromSuper(currentDir).all(handleRect);
                    });
                    function handleRect(err, rows) {
                        
                        if (err) {                    
                            reject(err);
                        } else {
                            // iterate over each rows of one directory
    
                            _.each(rows, (rowObject) => {
                                if (rowObject == null) {
                                    reject("we fooked up");
                                }
    
                                returnResult.push(_.pick(rowObject, RECTANGLE));
                                
                            });
                            resolve(JSON.stringify(returnResult));
                        }
                    }
                });
        });
    }

    function getDirtySuperPromise() {
        return new Promise((resolve, reject) => {
            StatementService.getDirtySuper().all(sendSuper);
            
            function sendSuper(err, rows) {
                //DONE:
                if (err != null){
                    reject("we fooked up the sendSuperPromise")
                } else {
                    //DONE:
                    let relativePath = _.map(rows, (val) => {
                        return DirectoryUtils.relatifyToCss(val.directory_name);
                    });

                    if (relativePath == null || relativePath.length <= 0) {
                        reject("too bad no games available");
                    }

                    resolve(JSON.stringify(relativePath));
                }
            }
        });
    }

    return {
        getRectFromSuperPromise: getRectFromSuperPromise,
        getDirtySuperPromise: getDirtySuperPromise
    };
})();

const IMAGE_TABLE = {
    TABLE_NAME: "image",
    ID : "image_id",
    DATE: "added",
    SOURCE: "image_directory",
    DIR_ID: "directory_id",
    HAS_RECT: "has_rectangle"
}

let RECTANGLE = [
    'image_directory',
    'answer',
    'first_point_x',
    'first_point_y',
    'second_point_x',
    'second_point_y',
    'image_width',
    'image_height'
]

const RECTANGLE_TABLE = {
    TABLE_NAME: "rectangle",
    HASH: "hash",
    ANSWER: "answer",
    IMAGE_ID: "image_id",
    FIRST_X: "first_point_x",
    FIRST_Y: "first_point_y",
    SECOND_X: "second_point_x",
    SECOND_Y: "second_point_y",
    IMG_WIDTH: "image_width",
    IMG_HEIGHT: "image_height"
}

const DIR_TABLE = {
    NAME: "directory",
    ID: "directory_id",
    DIR: "directory_name"
}

// accept query in the form of ?data=imageSuperPath
// if failed, send error message
// if succeeds, sends result back
app.get("/new/getImages", (req, res) => {
    SyncService.sysImgToDb();
    let dir = req.query.data;
    StatementService.getImagesFromSuperPath(dir).all(queryData);

    function queryData(err, rows) {
        if (err != null) {
            res.status(404).send("Fail to query data");
        } else {
            let result = _.map(rows, (current) => {
                return current.image_directory;
            });
            res.status(200).end(JSON.stringify(result));
        }
    }
});

app.get("/new/retrievePristineImage", (req, res) => {
    SyncService.sysImgToDb();
    StatementService.getPristineImage().all(handleQueryAll);

    function handleQueryAll(err, rows) {
        if (err != null) {
            console.log(err);
            res.status(404).end("Something wrong with our db");
        } else {
            let allImages = _.map(rows, (obj) => {
                return obj.image_directory;
            });
            res.status(200).end(JSON.stringify(allImages));
        }
    }
});

// receive data from the client and put all 
// them into server
app.put("/*/dataEntry", (req, res) => {
    function addData(jsonFile) {
        let obj = JSON.parse(jsonFile.data);

        // invalid data
        if (obj == null) {
            res.status(400).end("invalid data");
            return;
        }
        
        
        // the image object has something in it
        obj.forEach(function(image) {
            
            // check if image dir is valid, return if not
            let source = image.name;
            console.dir(obj);
    
            db.serialize(() => {
                try {
                    // delete all rectangles from the image
                    StatementService.deleteRectangle(source)
                    .run(TransactionUtils.logPrepareErr);

                    // insert new image source if possible
                    StatementService.insertImage(source)
                                    .run(TransactionUtils.logPrepareErr);

                    // check if rectangle data is valid
                    let rectangles = image.rectangles;

                    // insert all rectangles associated with that image
                    if (rectangles != null) {
                        StatementService.setImageHasRect(source).run(TransactionUtils.logPrepareErr);
                        rectangles.forEach(function(rectangle) {
                            // check if rectangle is valid, return if not
                            if (!DirectoryUtils.isValidRectangle(rectangle)) {
                                res.status(400).end("Bad rectangle data");
                            }

                            // prepare rectangle data to be inserted into the image
                            let preparedArr = TransactionUtils.prepareToInsertRectangle(rectangle, source);
                            
                            // insert rectangle into image
                            StatementService.insertOneRectangle(preparedArr).run(TransactionUtils.logPrepareErr);
                        }, this);
                    } else {
                        StatementService.setImageNotHaveRect(source)
                                        .run(TransactionUtils.logPrepareErr);
                    }
                    res.status(200).end("OK");
                } catch (error) {
                    console.log(error);
                    res.status(500).end("we are screw" + error);
                }
                                         
            });
        }, this);
    }
    
    //pass the raw json string to add to db
    addData(req.body);
});

// accept a formatted query: dir=[superpath, ...]
// and send back an array of images with rectangles
// DONE: 
app.get("/existed/retrieveImage", (req, res) => {

    // parse the array of super paths
    let dirArr = JSON.parse(req.query.dir);
    SyncService
        .sysImgToDb()
        .then(() => {
            return PromiseService.getRectFromSuperPromise(dirArr);
        })
        .then((JSONRectArr) => {
            res.status(200).end(JSONRectArr);
        })
        .catch(err => res.status(500).end("we foocked up retrieve image"));
});

// send an array of 100% dirty superpath aka 
// all images in the super path has at least 1 rectangle
app.get("/existed/getGameSuperPath", (req, res) => {

        SyncService.sysImgToDb()
                    .then(() => {
                        return PromiseService.getDirtySuperPromise();
                    }).then((gameSuperPath) => {
                        if (gameSuperPath == null || gameSuperPath.length <= 0) {
                            throw "user fooked up superpath content";
                        }
                        res.status(200).send(gameSuperPath); 
                    }).catch(err => res.status(500).end("we fooked up"));
        

});

// send a array of all superpaths of images
// otherwise, send error back
// sync runs behind Directory utils
// DONE:
app.get("/*/superPath", (req, res) => {
    async.series([(callback) => {
        // DONE: Sync system dir to db
        SyncService.sysDirToDb();
        callback(null, null);
    }, (callback) => {
        // DONE:
        DirectoryUtils
            .getFiles(asset)
            .then((filePath) => {
                //DONE: exclude any files that are not images
                return _.filter(filePath, (path) => {
                    return DirectoryUtils.isImage(path);
                })
            })
            .then((onlyImagePath) => {
                // DONE: make all dir relative to the css folder
                return _.map(onlyImagePath, (imagePath) => {
                    return DirectoryUtils.relatifyToCss(imagePath);
                });
            })
            .then((relativeImagePath) => {
                // DONE: turn all the file paths into super path
                let imageSuperPath = _.map(relativeImagePath, (path) => {
                    return DirectoryUtils.fileToDir(path);
                });

                // DONE: get rid of all the duplicates
                let nonDupImageSuperPath = _.uniq(imageSuperPath);

                // call the callback with these results
                callback(null, nonDupImageSuperPath);
            })
            .catch((err) => {
                callback(err, null);
            });
    }], (err, result) => {
        if (err) {
            res.status(500).end("failed to get superpaths");
        } else {
            res.status(200).end(JSON.stringify(result[1]));
        }

    });   
});

app.delete("/file", (req, res) => {
    let rawDir = JSON.parse(req.body.dir);
    if (rawDir == null) {
        res.status(400).end("You did not pass any file");
        throw new Error("We are screwed");
    }

    // relative to css
    let fileDirRelativeToCss = rawDir;
    console.log(fileDirRelativeToCss);

    // relative to 
    let fileDirRelativeToServer = _.map(rawDir, (current_dir) => {
        return DirectoryUtils.relatifyToServerForDelete(current_dir);
    });

    _.each(fileDirRelativeToServer, (dir) => {
        fs.unlink(dir, (err) => {
            if (err) {
                res.status(500).end("cant delete file");                
            } else {
                console.log("deleted");
            }        
        });
        
        
    });
    
    _.each(fileDirRelativeToCss, (dir) => {
        let delRectStm = StatementService.deleteRectangle(dir)
        let delImageStm = StatementService.delOneImage(dir);

        db.serialize(() => {
            delRectStm.run((err) => {
                console.log(err);
            });
            delImageStm.run((err) => {
                console.log(err);
            });
        });
    });

    res.status(200).end("DOne");
});

app.listen(9000, () => {
    console.log("Listening on 9000");
});