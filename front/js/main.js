$(function() {
    'use strict';
    
    var c = (msg) => {
        msg.forEach(function(element) {
            console.log(element);
        }, this);
    };

    const PAGE_JUMP = 20;

    const PAPER_HEIGHT_TO_WIDTH_RATIO = 1.4142;

    $("#sample, #image").css({width: 800, height: 800*PAPER_HEIGHT_TO_WIDTH_RATIO});
    $("#amount").val(800 + "px");
    $("#slider").slider({
        value: 800,
        min: 600,
        max: 1400,
        step: 100,
        slide: function(event, ui) {
          $("#amount").val(ui.value + "px");
          let width = ui.value;
          let height = width * PAPER_HEIGHT_TO_WIDTH_RATIO;
          $("#sample, #image").css({width: width, height: height});
        }
    });


    // this is the data we receive from server
    // and modified to sent data back
    var collectedData = null;

    // game scene
    const GAME_MODE_SCENE = "game-scene";
    // edit scene
    const EDIT_MODE_SCENE = "edit-scene";

    // how long user holds the mouse 
    // to be considered a drag
    const CLICK_THRESHOLD = 200; //ms
    
    // the tag used extract answer from the 
    // dom using jquery
    const ANSWER_TAG = "answer";

    // dom class to indicate whether the answer was correct
    const CORRECT_ANSWER = "correct";
    // dom class to indicate whether the answer was wrong
    // wrong is considered a default mode
    const WRONG_OR_DEFAULT = "wrong";

    // edit scene => add mode
    const ADD_MODE = 23;

    // edit scene => del mode
    const DEL_MODE = 24;

    // edit scene => edit div mode
    const EDIT_DIV_MODE = 25;

    // edit scene => edit answer mode
    const EDIT_ANSWER_MODE = 26;

    // edit scene => current edit mode
    var currentMode = 23;

    const MIN_DIV_WIDTH = 5;
    const MIN_DIV_HEIGHT = 5;
    
    const CONGRAT_MESSAGE = `You’re my favorite person besides every other person I’ve ever met.
    No offense, but you make me want to staple my cunt shut.
    Did your parents have any children that lived?
    I envy people who have never met you.
    Maybe if you eat all that makeup you will be beautiful on the inside.
    You’re kinda like Rapunzel except instead of letting down your hair, you let down everyone in your life.
    You’re impossible to underestimate.
    You’re not the dumbest person on the planet, but you sure better hope he doesn’t die.
    I’ll plant a mango tree in your mother’s cunt and fuck your sister in its shade.
    Those aren’t acne scars, those are marks from the coat hanger.
    You have more dick in your personality than you do in your pants.
    If you were an inanimate object, you’d be a participation trophy.
    You look like your father would be disappointed in you if he stayed.
    You’re not pretty enough to be that dumb.
    Your mother fucks for bricks so she can build your sister a whorehouse.
    I’m sorry your dad beat you instead of cancer.
    You were birthed out your mother’s ass because her cunt was too busy.
    You’re so stupid you couldn’t pour piss out of a boot if the directions were written on the heel.
    Take my lowest priority and put yourself beneath it.
    Such a shame your mother didn’t swallow you.
    The best part of you ran down your mom’s leg.
    You couldn’t organize a blowjob if you were in a Nevada brothel with a pocket full of hundred-dollar bills.
    You are a pizza burn on the roof of the world’s mouth.
    Does your ass ever get jealous of the shit that comes out of your mouth?
    People like you are the reason God doesn’t talk to us anymore.
    You’re so dense, light bends around you.
    I’d love to stay and chat but I’d rather have type-2 diabetes.
    You should put a condom on your head, because if you’re going to act like a dick you better dress like one, too.
    I bet you swim with a T-shirt on.
    How the fuck are you the sperm that won?
    May your balls turn square and fester at the corners.
    I hope your wife brings a date to your funeral.
    If you were a potato you’d be a stupid potato.
    Your face looks like it was set on fire and put out with chains.
    You might want to get a colonoscopy for all that butthurt.
    Your mother may have told you that you could be anything you wanted, but a douchebag wasn’t what she meant.
    You are so ugly that when you were born, the doctor slapped your mother.
    You look like two pounds of shit in a one-pound bag.
    Ready to fail like your dad’s condom?
    I’d call you a cunt, but you have neither the warmth or the depth.
    If I wanted to commit suicide I’d climb to your ego and jump to your IQ.
    You make me wish I had more middle fingers.
    If genius skips a generation, your children will be brilliant.
    Everyone that has ever said they love you was wrong.
    You have the charm and charisma of a burning orphanage.
    If there was a single intelligent thought in your head it would have died from loneliness.
    I don’t have the time or the crayons to explain this to you.
    The only difference between you and Hitler is Hitler knew when to kill himself.
    You’re dumber than I tell people.
    I hope you have beautiful children and that they all get cancer.
    Your birth certificate is an apology letter from the condom factory.
    For years your mother and I wanted kids. Imagine our disappointment when you came along.
    Your face is so oily that I’m surprised America hasn’t invaded yet.
    Your father should’ve wiped you on the sheets.
    If I wanted any shit out of you I’d take my dick out of your ass.
    I can explain it to you, but I can’t understand it for you.
    You’re the reason you mom swallows now.
    How did you crawl out of the abortion bucket?
    If the road were paved with dicks, your mother would walk on her ass.
    You are the stone in the shoes of humanity.
    You could fuck up a wet dream.
    You’re not as dumb as you look.
    Son, anyone who would fuck you ain’t worth fucking.
    This is why everyone talks about you as soon as you leave the room.
    The smartest thing that ever came out of your mouth was my dick.
    You know, people were right about you.
    You’ve got a great body. Too bad there’s no workout routine for a face.
    If you could suck your own dick then you would finally suck at everything.
    I want you to be the pallbearer at my funeral so you can let me down one last time.
    Don’t make me have to smack the extra chromosome out of you.
    You’ve gotta be two people, because no single person can be that stupid.
    If you were any dumber, someone would have to water you twice a week.
    You’ll never be half the man your mother was.
    If you were on fire and I had a cup of my own piss, I’d drink it.
    I’ve forgotten more than you know.
    You smell like you wipe back to front.
    I could agree with you, but then we’d both be wrong.
    Shut your mouth, I can smell your Dad’s cock.
    You look like something I drew with my left hand.
    How do you even masturbate knowing whose dick you’re touching?
    You are the human embodiment of an eight-dollar haircut.
    The only thing that will ever fuck you is life.
    You suck dick at fucking pussy.
    If you were twice as smart, you’d still be stupid. I can’t forget that day.
    You look like a bag of mashed-up assholes.
    You’re a huge bag of tiny cocks.
    You’re so inbred you’re a sandwich.
    In a country where anyone can be anything, I will never understand why you chose to be mediocre.
    What’s a girl like you doing at a nice place like this?
    You’re about as important as a white crayon.
    Was your mother just in the bathroom? Because she forgot to flush your twin.
    If my dog had a face like you, I’d paint his ass and teach him to walk backwards.
    If your parents were to divorce, would they still be brother and sister?
    You look like the kind of person that buys condoms on his way to a family reunion.
    People will not only remember your death, they will celebrate it.
    You are a shit stain on the underpants of society.
    You look like you were poured into your clothes but someone forgot to say when to stop.
    You’re about as useful as tits on a pigeon.
    Why are you playing hard to get when you’re so hard to want?
    I’d offer you a shit sandwich, but I hear you don’t like bread.`.split("\n");

    const RANDOM_NUMBER = Math.floor(Math.random()*(CONGRAT_MESSAGE.length)); 

    // Util class for working with point object
    class PointUtils {
        
        // accept a rectangle object
        // and return a point object that represents its center
        static getCenter (rectangle) {
            let rx = rectangle.getRightPoint().getX();
            let ry = rectangle.getRightPoint().getY();
            let lx = rectangle.getLeftPoint().getX();
            let ly = rectangle.getLeftPoint().getY();
            let xCenter = lx + (rx - lx)/2;
            let yCenter = ly + (ry - ly)/2;
            return new Point(xCenter, yCenter);
        }

        // accept 2 point objects
        // and return the distance between those two points
        static getDistance (point1, point2) {
            let deltaX = Math.abs(point1.getX() - point2.getX());
            let deltaY = Math.abs(point1.getY() - point2.getY());
            return Math.sqrt(deltaX*deltaX + deltaY*deltaY);
        }

        // accept an event and return a point object
        // that has coordinates relative to the image
        static getRelativeCoor (event) {  
            let offset = $("#image").offset();
            // calculate the x and y coordinate of a jQuery 
            // event relative to th #image div
            var relativeX = (event.pageX - offset.left);
            var relativeY = (event.pageY - offset.top);
            return new Point(relativeX, relativeY);            
        } 
    }

    // Util class for working with rectangle object
    class RectangleUtils {
        // given the top, left, width, and height of rectangle
        // return a new rectangle object
        static newRectangleFromTLWH (top, left, width, height) {
            return new Rectangle(new Point(left, top), 
                                new Point(left + width, top + height),
                                DrawingUtils.getImageSizes());
        }

        // based on the distance between two points passed to the function
        // translate the jQuery passed in by the displacement
        static translateDivByReference (first, second, div) {
            let newTop = div.position().top + (first.getY() - second.getY());
            let newLeft = div.position().left + (first.getX() - second.getX());
            if (newTop >= 0 && newLeft >= 0) {
                div.css({top: newTop, left: newLeft});
            }
        }
    }

    // Util class for drawing on the #image
    class DrawingUtils {
        /**
         * 
         * @param {Rectangle} rectangle 
         * render the rectangle onto #image div
        */
        static drawDiv(rectangle) {
            // calculate the coordinate of the div to draw
            let left = rectangle.getScaledLeft();
            let top = rectangle.getScaledTop();
            // get the width and height of the div to draw
            let width = rectangle.getScaledWidth();
            
            let height = rectangle.getScaledHeight();
            let answer = rectangle.getAnswer();

            let clickedState = rectangle.answeredCorrectly() ? CORRECT_ANSWER : WRONG_OR_DEFAULT;

            // render it
            $("#image").append($(`<div class="square ${clickedState}" ></div>`)
                        .data(ANSWER_TAG, answer)
                        .css({"left": left, 
                                "top": top, 
                                "width": width, 
                                "height": height,
                                "background-color": "black"}));
        }

        // draw user selection
        // from a jQuery div, the point where user start holding
        // the mouse, and the mouse down event
        static drawSelection (tempDiv, firstPoint, event) {
            if (tempDiv !== null) {
                let imageOffset = $("#image").offset();
                let relativeXEvent = event.pageX - imageOffset.left
                let relativeYEvent = event.pageY - imageOffset.top;
                let width = Math.abs(relativeXEvent - firstPoint.getX());
                let height = Math.abs(relativeYEvent - firstPoint.getY());
                let left = (relativeXEvent - firstPoint.getX() < 0) ? relativeXEvent : firstPoint.getX();
                let top = (relativeYEvent - firstPoint.getY() < 0) ? relativeYEvent : firstPoint.getY();
                $("#image").append(tempDiv.css({width: width, height: height, left: left, top: top}));
            }
        }

        // return an array of image width and height
        static getImageSizes() {
            let imgWidth = parseFloat($("#image").outerWidth());
            let imgHeight = parseFloat($("#image").outerHeight());
            return [imgWidth, imgHeight];
        }   

        // return whether a rectangle collides with other
        // rectangles in the #image
        static isEditable(rectangle1) {
            let rectangles = collectedData.current().rectangle;

            // if there's no rectangles yet, then return true
            if (rectangles == null) {
                return true;
            }

            for (var i = 0; i < rectangles.length; i++) {
                let rectangle2 = rectangles[i];
                if (this.doOverlap(rectangle1, rectangle2)) {

                    return false;
                }
            }
            return true;
        }

        // accept two rectangles and return whether they collide or not
        static doOverlap (rectangle1, rectangle2) {
            return false;
            // let l1 = rectangle1.getLeftPoint(); 
            // let r1 = rectangle1.getRightPoint(); 
            // let l2 = rectangle2.getLeftPoint(); 
            // let r2 = rectangle2.getRightPoint();
            // let centerPoint = PointUtils.getCenter(rectangle1);
            // let diagonalLength = PointUtils.getDistance(l1, r1) / 2;
            // let distance1 = PointUtils.getDistance(centerPoint, l2);
            // let distance2 = PointUtils.getDistance(centerPoint, r2);
            // let distance3 = PointUtils.getDistance(centerPoint, new Point(l2.getX(), r2.getY()));
            // let distance4 = PointUtils.getDistance(centerPoint, new Point(r2.getX(), l2.getY()));
            // return distance1 < diagonalLength || distance2 < diagonalLength || 
            //         distance3 < diagonalLength || distance4 < diagonalLength;
        }  
    }

    // SECOND STAGE INSIDE
    class EventUtils {

        // change the edit mode for edit scene based
        // on the mode passed in
        // and attach events associated with the modes
        // the default is add mode
        static switchModes (changeTo) {

            // update the current mode if user pass in something
            if (changeTo != null || changeTo != undefined) {
                currentMode = changeTo;
            }

            // then switch mode
            switch (currentMode) {
                case EDIT_DIV_MODE:
                    // handle event f
                    uiForEditDivMode();
                    handleEventsForEditDivMode()

                    function uiForEditDivMode() {
                        $("h1").text("Edit Position Mode");
                        $("#add, #delete, #edit-answer").prop("disabled", false);
                        $("#delete").prop("disabled", false);
                    }
                    
                    function handleEventsForEditDivMode() {
                        // get rid of image events
                        $("#image").off();
                        var first = null;
                        var second = null;
                        var clicked = false;

                        // switch mode for square
                        $("div.square")
                            .off()
                            .on({
                                mousedown: (e) => {
                                    clicked = true;
                                    first = PointUtils.getRelativeCoor(e);
                                },
                                mousemove: (e) => {
                                    if (clicked) {
                                        second = first;
                                        first = PointUtils.getRelativeCoor(e);
                                        let oldDiv = $(e.currentTarget).filter(".square");
                                        RectangleUtils.translateDivByReference(first, second, oldDiv);
                                    }
                                },
                                mouseup: (e) => {
                                    clicked = false;
                                    second = first;
                                    first = PointUtils.getRelativeCoor(e);
                                    let oldDiv = $(e.currentTarget).filter(".square");
                                    RectangleUtils.translateDivByReference(first, second, oldDiv);
                                    SyncUtils.rectanglesViewToData();
                                }});
                    }
                    break;
                case DEL_MODE:
                    handleEventsForDelMode();
                    uiForDelMode();
                    
                    function handleEventsForDelMode() {
                        $("#image").off();
                        $("div.square").on("click", (e) => {
                            if (confirm("Want to delete this rectangle?")) {
                                $(e.currentTarget).remove();
                                SyncUtils.rectanglesViewToData();
                            }
                        });
                    }

                    function uiForDelMode() {
                        $("h1").text("Delete Mode");
                        $("#add, #edit-pos, #edit-answer").prop("disabled", false);
                        $("#delete").prop("disabled", true);  
                    }
                    break;
                case EDIT_ANSWER_MODE:
                    handleEventsForEditAnswerMode();
                    uiForEditAnswerMode();
                    
                    function uiForEditAnswerMode() {
                        $("h1").text("Edit Answer Mode");
                        $("#add, #delete, #edit-pos").prop("disabled", false);
                        $("#edit-answer").prop("disabled", true);
                    }
                    
                    function handleEventsForEditAnswerMode() {
                        $("#image").off();
                        $("div.square").off();
                        $("div.square").on("click", (e) => {
                            let current = $(e.currentTarget);
                            let newAnswer = prompt("Enter new answer", current.data(ANSWER_TAG));
                            if (newAnswer == null || newAnswer.length == 0) {
                                return;
                            }
                            current.removeData();
                            current.data(ANSWER_TAG, newAnswer);
                            SyncUtils.rectanglesViewToData();
                        });
                    }

                    break;
                default:
                    handleEventsForAddMode();
                    uiForAddMode();

                    function handleEventsForAddMode () {
                        
                        // Take care of events
                        var firstPt = null;
                        var onHold = false;
                        var timeout = null;
                        var tempDiv = null;
                        
                        // remove all events first
                        $("#image").off();
                        $("div.square").off();

                        // add events to image
                        $("#image")
                            .on("mousedown", (e) => {
                                // if user holds long enough, consider it a drag 
                                timeout = setTimeout(() => {
                                    onHold = true;
                                    $("#image").css({cursor: "crosshair"});
                                    firstPt = PointUtils.getRelativeCoor(e);
                                    tempDiv = $(`<div class="square-border"></div>`)
                                }, CLICK_THRESHOLD);
                            })
                            .on("mousemove", (e) => {
                                // if user drags, then change the size of the div
                                if (onHold == true) {
                                    DrawingUtils.drawSelection(tempDiv, firstPt, e);
                                }
                            })
                            .on("mouseup", (e) => {
                                // set timeout to null
                                clearTimeout(timeout);
            
                                if (!onHold) {
                                    return;
                                }
            
                                // in case user holds
                                $("#image").css({cursor: "default"});
                                onHold = false;
                                tempDiv.remove();
                                // create point where user releases mouse
                                let secondPoint = PointUtils.getRelativeCoor(e);
            
                                // create a new rectangle with the first and second point
                                let newRectangle = new Rectangle(firstPt, secondPoint, DrawingUtils.getImageSizes());
                                
                                // if the rectangle is small, discard 
                                if (newRectangle.getWidth() < MIN_DIV_WIDTH || newRectangle.getHeight() < MIN_DIV_HEIGHT) {
                                    return;
                                }
                                
                                // if the rectangles overlaps, discard
                                if (!DrawingUtils.isEditable(newRectangle)) {
                                    return;
                                }
            
                                // if user does not want to save, return
                                if (!confirm("Want to save this location")) {
                                    return;
                                }
                                
                                // prompt for user input, if enter nothing, return
                                let userAnswer = prompt("Your answer?", "this sucks");
                                if (userAnswer == null || userAnswer == undefined || userAnswer.length <= 0) {
                                    return;
                                }
            
                                newRectangle.setInput(userAnswer);
                                
                                // render the rectangle
                                DrawingUtils.drawDiv(newRectangle);
            
                                // append the newly created rectangle into the image
                                let currentImage = collectedData.current();
                                currentImage.appendRectangle(newRectangle);
                            });
                    }

                    function uiForAddMode() {
                        $("h1").text("Add Mode");
                        $("#add").prop("disabled", true);
                        $("#delete, #edit-pos, #edit-answer").prop("disabled", false);       
                    }
                    break;
            }
        }

        // attach events to buttons that 
        // make image transition
        static handleBtnClicked() {
            $("#prev").on({
                click: () => {
                    if (collectedData.previous()) {
                        SyncUtils.imageDataToView();
                    }
                    ButtonUtils.updateNavBtnState();
                    EventUtils.switchModes();
                }
            });
            $("#next").on({
                click: () => {
                    // move the cursor to the next image and render
                    if (collectedData.next()) {
                        SyncUtils.imageDataToView();
                    }

                    // update the current states of all buttons
                    ButtonUtils.updateNavBtnState();

                    // execute modes
                    EventUtils.switchModes();
                }
            });
            $("#finish").on({
                click: () => {
                    sendDataToServer();
                    EventUtils.switchModes();

                    function sendDataToServer() {
                        let sentData = collectedData.encodeData();
                        $.ajax({
                            method: "PUT",
                            url: "http://localhost:9000/existed/dataEntry",
                            data: "data=" + sentData
                        }).done((data, textStatus, jqXHR) => {
                            window.location.reload();
                        })
                        .fail((jqXHR, textStatus, errorThrown) => {
                            debugger;
                            window.location.replace("html/error.html");
                        });
                    }
                },
            });
        }

        // update ui for the scene where all the 
        // super paths are displayed
        static uiForPopulateSuperPath() {
            $(".front, edit, game").addClass("hidden");
            $(".options").removeClass("hidden");
        }

        // SECOND STAGE: FOR BOTH EDIT SCENE AND GAME SCENE
        // 
        static attachEventsToOptions(arrOfSuper, modes) {

            if (arrOfSuper == null || arrOfSuper.length <= 0) {
                window.location.replace("html/error.html");
            }
            
            $.each(arrOfSuper, 
                (index, superPath) => {
                    // create an option button
                    let btn = $(`<div class="col-sm-3 button-container">
                                    <button type="button" id="${superPath}" class="${modes}">${superPath}</button>
                                </div>`);
                    
                    // attach ajax event handler to it
                    btn.on("click", (e) => {
                        $.ajax({
                            method: "GET",
                            url: "http://localhost:9000/existed/retrieveImage",
                            data: "dir=" + JSON.stringify([superPath]),
                            dataType: "json"
                        }).done((data) => {
                            // reveal the image and hide options 
                            $("#image").removeClass("hidden");
                            $(".options").addClass("hidden");

                            if (data == null || data.length == 0) {
                                window.location.replace("html/error.html");
                            }

                            // load the collectedData with data
                            // convert back-data to front-end data
                            collectedData = ArrayImageList.serverDataToArrImageList(data);
                            collectedData.sortByImagePageNumber();

                            if(modes == EDIT_MODE_SCENE) {
                                uiForEdit();
                                callbackForEdit();
                            } else if (modes == GAME_MODE_SCENE) {
                                uiForGame();
                                callbackForGame();
                            }

                            function uiForEdit() {
                                $(".edit").removeClass("hidden");
                                $(".front").addClass("hidden");
                            }

                            function uiForGame() {
                                $(".game").removeClass("hidden");
                                $(".front").addClass("hidden");
                            }
                        }).fail((jqXHR, textStatus, errorThrown) => {
                            debugger;
                            window.location.replace("html/error.html");
                        });
                    });
                
                    // append it to the option group
                    $(".options .button-group").append(btn);
            });
        }

        // attach event handler to all the squares
        // in #image for game scene based on a score object
        static attachGameEventsToSquares(score) {
            // turn off all events first
            $(".square." + CORRECT_ANSWER).off();
            // if the total score is still > than current score
            // attach event to it
            
            $(".square." + WRONG_OR_DEFAULT).on("click", (e) => {
                let answer = prompt("Enter you answer here", "Your answer");
                
                // if answer is not valid, return
                if (answer == null || answer.length <= 0) {
                    return;
                }
                
                let correctAnswer = $(e.currentTarget).data(ANSWER_TAG);
                // if correctAnswer is invalid throw error and return
                if (correctAnswer == null || correctAnswer.length == 0) {
                    throw new Error("something wrong with the correct answer");
                    return;
                }

                // if user enters the correct answer, update score and UI
                if (normalizeAnswer(answer) == normalizeAnswer(correctAnswer)) {
                    score.incrementScore();
                    $(e.currentTarget).removeClass(WRONG_OR_DEFAULT).addClass(CORRECT_ANSWER);
                    SyncUtils.rectanglesViewToData();
                    alert(`Correct!! \n ${score.remaining()} more to go.`);
                }

                var msg = "";
                if (score.getCurrentScore() >= score.getTotalScore()) {
                    msg = CONGRAT_MESSAGE[RANDOM_NUMBER];
                } else {
                    msg = `${score.getCurrentScore()} correct answer(s) out of ${score.getTotalScore()}`
                }
                
                $("h1").text(msg);                    

                function normalizeAnswer(word) {
                    return word.toLowerCase().replace(/\s+/gi, "");
                }
                
                   
            
            });
            
        }

        // attach events handler to the page jumper
        static attachJumpEventsToBtn() {
            $("#jump").on("click", handler);
            $(document).keypress(e => {
                if(e.which == 13) {
                    handler(e);
                }
            });
            function handler(e) {
                let pageNumb = parseInt($("#page").val());
                if (pageNumb == null ||
                    isNaN(pageNumb) ||
                    pageNumb < 0 || 
                    pageNumb > collectedData.collection.length - 1) {
                    pageNumb = 0;
                    $("#page").val(pageNumb);
                }
                collectedData.jumpTo(pageNumb);
                ButtonUtils.updateNavBtnState();
                SyncUtils.imageDataToView();
            }
        }

        static attachFastForwardEventsToBtn () {
            $("#fast-forward").on("click", handler);
            function handler(e) {
                collectedData.jumpForwardBy(PAGE_JUMP);
                ButtonUtils.updateNavBtnState();
                SyncUtils.imageDataToView();
            }
        }

        static attachFastBackwardEventsToBtn () {
            $("#fast-backward").on("click", handler);
            function handler(e) {
                collectedData.jumpBackwardBy(PAGE_JUMP) ;
                ButtonUtils.updateNavBtnState();
                SyncUtils.imageDataToView();
            }
        }
    }

    // Util class for image transition button
    // strictly ui not events handler
    class ButtonUtils {

        /**
         * update the status of button based on the position of current image
         */
        static updateNavBtnState() {
            if(collectedData.hasNext() && !collectedData.hasPrev()) {
                $("#next").prop("disabled", false);
                $("#prev, #finish").prop("disabled", true);
            } else if (collectedData.hasPrev() && !collectedData.hasNext()) {
                $("#prev, #finish").prop("disabled", false);
                $("#next").prop("disabled", true);
            } else if (!collectedData.hasPrev() && !collectedData.hasNext()) {
                $("#next, #prev").prop("disabled", true);
                $("finish").prop("disabled", false);
            } else {
                $("#prev, #next").prop("disabled", false);
                $("#next").prop("disabled", false);
            }

        }
    }

    // controller that let you sync the collectedData
    // to the ui and vice versa
    class SyncUtils {
        /**
         * one way binding data(rectangles, images) from model
         *  to view (#image, and squares inside) only work with current image
         */
        static imageDataToView() {
            let currentImage = collectedData.current();
            let imgSource = currentImage.imageSource;
            let rectangles = currentImage.rectangle;
            
            if (imgSource != null && imgSource.length > 0) {
                $("#image").empty().css("background-image", `url("${imgSource}")`);
                
                if (rectangles != null && rectangles.length > 0) {
                    rectangles.forEach(function(element) {
                        DrawingUtils.drawDiv(element);
                    }, this);
                }
            }
        }
        
        /**
         * one way binding view (squares) to model(rectangle array)
         */
        static rectanglesViewToData() {
            collectedData.current().removeAllRectangles();
            $(".square." + CORRECT_ANSWER).off();
            $("div.square").each((index, element) => {
                let pos = $(element).position();
                let left = pos.left;
                let top = pos.top;
                let width = $(element).outerWidth();
                let height = $(element).outerHeight();
                let answer = $(element).data(ANSWER_TAG);
                let answeredCorrectly = $(element).hasClass(CORRECT_ANSWER) ? true : false;
                let currentImage = collectedData.current();
                
                let newRectangle = RectangleUtils.newRectangleFromTLWH(top, left, width, height);
                
                newRectangle.setAnswerState(answeredCorrectly);
                newRectangle.setInput(answer);
                
                currentImage.appendRectangle(newRectangle);
            });
        }
    }

    // a list of image
    class ArrayImageList {
        
        // construct an array image list 
        // with an empty array and current index as -1
        constructor () {
            this.collection = [];
            this.currentIndex = -1;
        }

        // return true if the current collection is null
        // otherwise return false
        isEmpty() {
            return this.collection == null || this.collection.length == 0;
        }

        // return the size of current collection
        // return 0 if the collection is empty
        size() {
            if (this.collection == null) {
                return 0;
            }
            return this.collection.length;
        }

        // return the current image object
        current() {
            return this.collection[this.currentIndex];
        }

        // return whether the next image is available 
        hasNext() {
            return (this.currentIndex >= 0 && this.currentIndex < this.size() - 1);
        }

        // return whether the prev image is available
        hasPrev() {
            return this.currentIndex > 0 && this.currentIndex < this.size();
        }

        // return whether there's currently image to be displayede
        hasImageToDisplay() {
            return this.currentIndex < this.size();
        }

        // return true and move the cursor to next if there's a next image 
        // return false and set the current index to -1 if there's nothing
        next() {
            if (this.currentIndex > this.size() - 1) {
                this.currentIndex = -1;
                return false;
            }
            this.currentIndex++;
            return true;
        }

        // return true and move to prev spot if there's previous image
        // return false and set the cursor index to -1 if there's nothing
        previous() {
            if (this.currentIndex <= 0) {
                this.currentIndex = -1;
                return false;
            }
            this.currentIndex--;
            return true;
        }

        // get the image at a particular index
        get(index) {
            return this.collection[index];
        }

        // add an image into the array image list
        push(Image) {
            if (this.collection == null || this.collection.length == 0) {
                this.collection = [Image];
                this.currentIndex = 0;
            } else {
                this.collection.push(Image);
            }
        }

        // jump to an image
        jumpTo(index) {
            if (index < 0) {
                this.currentIndex = 0;
            } else if (index >= this.collection.length) {
                this.currentIndex = this.collection.length - 1;
            } else {
                this.currentIndex = index;
            }     
        }

        jumpForwardBy(pages) {
            let index = this.currentIndex + pages;
            if (index < 0) {
                this.currentIndex = 0;
            } else if (index >= this.collection.length) {
                this.currentIndex = this.collection.length - 1;
            } else {
                this.currentIndex = index;
            }
        }

        jumpBackwardBy(pages) {
            let index = this.currentIndex - pages;
            if (index < 0) {
                this.currentIndex = 0;
            } else if (index >= this.collection.length) {
                this.currentIndex = this.collection.length - 1;
            } else {
                this.currentIndex = index;
            }
        }

        // remove an image at index from the array image list
        // and decrement the current index 
        remove(index) {
            if (this.collection == null) {
                alert("there's nothing to remove")
            }

            if (index < 0 || this.collection.length - 1 < index) {
                alert("index out of bound");
            }

            if (this.currentIndex == index) {
                if (this.size() == 1) {
                    this.currentIndex = -1;
                    this.collection = null;
                    return this.collection;
                } else if (this.currentIndex == this.size() - 1){
                    this.currentIndex--;
                }
            }
            return this.collection.splice(index, 1);
        }

        // make the back-end data into front-end like and assign 
        // values
        encodeData() {
            if (this.collection == null || this.collection == undefined ||
                this.collection.length == 0) {
                return "";
            }
            let result = [];
            for (var index = 0; index < this.collection.length; index++) {
                var element = this.collection[index];
                if (element != null) {
                    result.push(element.flattenImage());
                }
            }
            if (result == null) {
                return "";
            }
            return JSON.stringify(result);
        }

        Scores () {
            let currentScore = 0;
            let arrOfImage = this.collection;
            let totalScore = 0;
            initTotalScore();

            function initTotalScore() {
                $.each(arrOfImage, (index, image) => {
                    totalScore += image.numberOfRect();
                });
            }
            function getTotalScore() {
                return totalScore;
            }

            function getCurrentScore() {
                return currentScore;
            }

            function incrementScore() {
                currentScore += 1;
            }

            function remaining() {
                if (totalScore < currentScore) {
                    throw new Error("total score should be less than current score");
                }
                return totalScore - currentScore;
            }

            return {
                getTotalScore: getTotalScore,
                getCurrentScore: getCurrentScore,
                incrementScore: incrementScore,
                remaining: remaining
            }
        }

        sortByImagePageNumber () {
            this.collection = this.collection.sort((first, second) => {
                let firstString = parseInt(first.imageSource.replace(/\D+/gi, ""));
                let secondString = parseInt(second.imageSource.replace(/\D+/gi, ""));
                if (firstString == null || secondString == null) {
                    throw new Error("you fucked up the parseInt for page Number");
                }
                return firstString - secondString;
            });
        }

        // convert back-end image object (with rectangles)
        // into front-end image object and return an arrayImageList 
        // that contains all the image objects
        static serverDataToArrImageList (data) {
            // convert JSON object (not string) from back-end (with rectangles info in them)
            // into a "front-like" image object
            let formattedData = data.map(mapCallback).reduce(reduceCallback, []);

            function reduceCallback(accumulator, current, currentIndex, arr) {
                
                // if the current image object
                // already existed, then get a reference
                // to the already existed one and append
                // the rectangle from the current image object
                // into the already existed , then return the accumulator
                // Note: we assume that the object is flat and there's no nested
                // rectangles prior to running this funtion aka there's only 1 rect per image
                for (var i = 0; i < accumulator.length; i++) {
                    if (accumulator[i].image_directory == current.image_directory) {
                        accumulator[i].rectangles.push({
                            answer: current.rectangles[0].answer,
                            first_point_x: current.rectangles[0].first_point_x,
                            first_point_y: current.rectangles[0].first_point_y,
                            second_point_x: current.rectangles[0].second_point_x,
                            second_point_y: current.rectangles[0].second_point_y,
                            image_width: current.rectangles[0].image_width,
                            image_height: current.rectangles[0].image_height});
                        return accumulator;
                    }
                }

                // if this image did not exist
                // simply append it to accumulator
                // and return the accumulator
                accumulator.push(current);
                return accumulator;
            }

            function mapCallback(value) {
                var {image_directory: image_dir, 
                    image_height: height, 
                    image_width: width,
                    first_point_x: fir_x,
                    first_point_y: fir_y,
                    second_point_x: sec_x,
                    second_point_y: sec_y,
                    answer: myAnswer
                    } = value;
                // if the image does not have rectangles
                if (fir_x == null || fir_y == null || sec_x == null || 
                    sec_y == null || myAnswer == null || height == null || 
                    width == null) {
                    return {
                        image_directory: image_dir,
                        rectangles: null
                    }
                }
                
                // else return image with rectangle
                return {
                    image_directory: image_dir,
                    rectangles: [{
                        answer: myAnswer,
                        first_point_x: fir_x,
                        first_point_y: fir_y,
                        second_point_x: sec_x,
                        second_point_y: sec_y,
                        image_width: width,
                        image_height: height
                    }]

                };
            } 
            
            // convert "front-like" image object into actual iamges object
            // and push them into a newly constructed ArrayImageList 
            let arrImgList = new ArrayImageList();
            $.each(formattedData, (index, image) => {
                let imageObject = new Image(image.image_directory);
                $.each(image.rectangles, (index, rectangle) => {
                    if (rectangle != null && rectangle != undefined) {
                        let first = new Point(rectangle.first_point_x, rectangle.first_point_y);
                        let second = new Point(rectangle.second_point_x, rectangle.second_point_y);
                        let imgDimens = [rectangle.image_width, rectangle.image_height];
                        let rect = new Rectangle(first, second, imgDimens);
                        rect.setInput(rectangle.answer);
                        imageObject.appendRectangle(rect);
                    }    
                });
                arrImgList.push(imageObject);
            });

            // then return it 
            return arrImgList;
        }
    }

    // an image that stores all the rectangles
    // coordinates and its answer
    class Image {
        // construct an image object
        // if filepath is invalid alert user
        constructor(filePath) {
            if (filePath == null || filePath.length < 1) {
                alert("malformed Path");
            }
            
            let dirComponentArr = filePath.split("/");
            if (dirComponentArr == null && dirComponentArr.length < 3) {
                alert("malformed Path")
            }

            // it is valid now
            this.imageSource = filePath;
            this.rectangle = null;
        }

        // append a new rectangle into the image
        appendRectangle(newRect) {
            if (this.rectangle == null) {
                this.rectangle = [newRect];
            } else {
                this.rectangle.push(newRect);
            }
        }

        numberOfRect () {
            if (this.rectangle == null) {
                throw new Error("null exception of rectangle");
            }
            return this.rectangle.length;
        }

        // remove all the rectangle from the images
        removeAllRectangles() {
            this.rectangle = null;
        }

        // flatten the image data into a javascript object
        // containing 2 properties: iamge name and all the flatten rectangle
        // if there's not rectangle in this image
        // the rectangle property will be set to null
        flattenImage() {
            if (this.rectangle == undefined || 
                this.rectangle == null ||
                this.rectangle.length == 0) {
                return {name: this.imageSource,
                    rectangles: null};
            }
            let flattenRectangleArray = [];
            for (var index = 0; index < this.rectangle.length; index++) {
                var element = this.rectangle[index];
                flattenRectangleArray.push(element.flattenRectangle());
            }
            return {name: this.imageSource,
                    rectangles: flattenRectangleArray};
        }
    }

    /**
     * 
     * @param {*} firstPt 
     * @param {*} secondPt 
     * @param {*} imageDimensions 
     * @param {*} userInput 
     */
    function Rectangle (firstPt, secondPt, imageDimensions) {
        let MyRectangle = this;
        let firstPoint = firstPt;
        let secondPoint = secondPt;
        let imageCurrentWidth = imageDimensions[0];
        let imageCurrentHeight = imageDimensions[1];
        let answer = "";
        let answeredCorrectly = false;

        // check if the current rectangle is valid or not
        // Note: only checks for presence of first and second point
        MyRectangle.isValid = () => {
            return firstPoint != null && secondPoint != null;
        };
        
        // return the answer for this rectangle
        // return "" if there's no answer
        MyRectangle.getAnswer = () => {
            return answer;
        }

        // return the width of rectangle
        // if rectangle is not valid, return null
        MyRectangle.getWidth = () => {
            let width = Math.abs(firstPoint.getX() - secondPoint.getX());
            if (width > 0) {
                return width
            } else {
                throw new Error("you screwed the width of rectangle");
            }
        };

        // return current image width
        MyRectangle.getImageWidth = () => {
            return imageCurrentWidth;
        }

        // return current image height
        MyRectangle.getImageHeight = () => {
            return imageCurrentHeight
        }

        // return the height of the rectangle
        // if height <= 0, throw exception
        MyRectangle.getHeight = () => {
            let height = Math.abs(firstPoint.getY() - secondPoint.getY());
            if (height > 0) {
                return height;
            } else {
                throw new Error("you screwed up the height");
            }
        };

        // return the left upper point of rectangle
        MyRectangle.getLeftPoint = () => {
            return firstPoint.getX() > secondPoint.getX() ? secondPoint : firstPoint;
        };

        // return the bottom right point of rectangle
        MyRectangle.getRightPoint = () => {
            return firstPoint.getX() > secondPoint.getX() ? firstPoint : secondPoint;
        };

        // return the left position relative to the parent
        MyRectangle.getLeft = () => {
            return firstPoint.getX() > secondPoint.getX() ? secondPoint.getX() : firstPoint.getX();
        };

        // return the top position relative to the parent
        MyRectangle.getTop = () => {
            return firstPoint.getY() > secondPoint.getY() ? secondPoint.getY() : firstPoint.getY();
        };

        // change the answer to whatever the input passed in
        MyRectangle.setInput = (input) => {
            answer = input;
        };

        // flatten the rectangle data into a javascript object
        // contains left top point, bottom right point, answer, and 
        // an array of image dimension
        MyRectangle.flattenRectangle = () => {
            if (MyRectangle == null || MyRectangle == undefined) {
                throw new Error("Your rectangle is null");
            }
            let dimensionObj = {width: imageCurrentWidth, height: imageCurrentHeight};
            return {first: firstPoint.flattenPoint(),
                    second: secondPoint.flattenPoint(),
                    answer: answer,
                    imageDimensions: dimensionObj
                    };
        };

        // return whether this rectangle was answered correctly
        MyRectangle.answeredCorrectly = () => {
            return answeredCorrectly;
        };

        // set the answer state of this rectangle to the state passed in
        MyRectangle.setAnswerState = (state) => {
            answeredCorrectly = state;
        };

        // return the left position based 
        // the ratio beyween the width of the image
        // associated with this rectangle
        // and the width of the image from ui
        MyRectangle.getScaledLeft = () => {
            return MyRectangle.getLeft() * ($("#image").outerWidth() / imageCurrentWidth);
        };

        // return the top position based 
        // the ratio beyween the height of the image
        // associated with this rectangle
        // and the width of the image from ui
        MyRectangle.getScaledTop = () => {
            return MyRectangle.getTop() * ($("#image").outerHeight() / imageCurrentHeight);
        };

        // return the scaled width of this rectangle based 
        // the ratio beyween the width of the image
        // associated with this rectangle
        // and the width of the image from ui
        MyRectangle.getScaledWidth = () => {
            return MyRectangle.getWidth() * ($("#image").outerWidth() / imageCurrentWidth);
        };

        // return the scaled width of this rectangle based 
        // the ratio beyween the width of the image
        // associated with this rectangle
        // and the width of the image from ui
        MyRectangle.getScaledHeight = () => {
            return MyRectangle.getHeight() * ($("#image").outerHeight() / imageCurrentHeight);
        };
    }

    // getX(), getY(), setX(), setY(), 
    function Point (xCoor, yCoor) {
        let MyPoint = this;
        let x = xCoor;
        let y = yCoor;

        MyPoint.getX = () => {  
            return x;
        };

        MyPoint.getY = () => {  
            return y;
        };

        MyPoint.setX = (newXCoor) => {  
            x = newXCoor;
        };

        MyPoint.setY = (newYCoor) => {  
            y = newYCoor;
        };

        MyPoint.flattenPoint = () => {
            if (MyPoint == null || MyPoint == undefined) {
                return null;
            }
            return {x: x, y: y};
        }
    }
    
    /**
     * FIRST STAGE 
     * if edit mode was chosen, request data from server
     * populate the screen with buttons associated with superpath
     * of images
     * 
     * if game mode was chosen request data from server
     * and do the same thing as edit mode
     */
    $("#edit-mode").on("click", (e) => {
        $.ajax({
            url: "http://localhost:9000/existed/superPath",
            timeout: 15000
        }).done((data) => {
            // change UI
            EventUtils.uiForPopulateSuperPath();
            
            // parse it
            data = JSON.parse(data);

            // use the data to populate the options menu
            // and attach events to each of them
            EventUtils.attachEventsToOptions(data, EDIT_MODE_SCENE);
        }).fail((jqXHR, textStatus, errorThrown) => {
            window.location.replace("html/error.html");
        });
    });
    $("#game-mode").on("click", (e) => {
        $.ajax({
            method: "GET",
            url: "http://localhost:9000/existed/getGameSuperPath"
        }).done((data) => {
            // change UI
            EventUtils.uiForPopulateSuperPath();

            // parse data
            data = JSON.parse(data);

            // populate the option menu with data
            // and attach events to each of them
            EventUtils.attachEventsToOptions(data, GAME_MODE_SCENE);
        }).fail((jqXHR, textStatus, errorThrown) => {
            debugger;
            window.location.replace("html/error.html");
        });
    });
    
    // AFTER HTML IS LOADED
    // THIRD STAGE (1) => For EDIT
    function callbackForEdit() {
        // display the first image if there's any
        if (collectedData.hasImageToDisplay()){
            // render the first image
            SyncUtils.imageDataToView();
            
            // attach events to buttons prev, next, finish
            EventUtils.handleBtnClicked();
        
            // update properties of buttons
            ButtonUtils.updateNavBtnState();
    
            // switch to default mode aka ADD MODE
            EventUtils.switchModes();
            
            // then attach events to all of them
            $("#add").on("click", () => {
                EventUtils.switchModes(ADD_MODE);
            });
            $("#delete").on("click", () => {
                EventUtils.switchModes(DEL_MODE);
            });
            $("#edit-pos").on("click", () => {
                EventUtils.switchModes(EDIT_DIV_MODE);
            });
            $("#edit-answer").on("click", () => {
                EventUtils.switchModes(EDIT_ANSWER_MODE);
            });
            $("#delete-image").on("click", () => {
                let currentImageSrc = [collectedData.current().imageSource];
                $.ajax({
                    method: "DELETE",
                    url: "http://localhost:9000/file",
                    data: "dir=" + JSON.stringify(currentImageSrc)
                }).done(() => {
                    collectedData.remove(collectedData.currentIndex);
                    SyncUtils.imageDataToView();
                }).fail(() => {
                    alert("failed to delete data");
                });
            })

            // same thing as attach events to ("#jump")
            EventUtils.attachJumpEventsToBtn();

            // same thing as attach events to $("#fast-foward")
            EventUtils.attachFastForwardEventsToBtn();
            
            // same thing as attach events to $("#fast-backward")
            EventUtils.attachFastBackwardEventsToBtn();

        } else {
            window.location.replace("html/error404.html");
        }
    }

    // THIRD STAGE (2) => For GAME
    function callbackForGame() {
        // display the first image if there's any
        if (collectedData.hasImageToDisplay()){

            // render the first image
            SyncUtils.imageDataToView();
            let score = collectedData.Scores();
            EventUtils.attachGameEventsToSquares(score);


            $("#prev").on({
                click: () => {
                    if (collectedData.previous()) {
                        SyncUtils.imageDataToView();
                        EventUtils.attachGameEventsToSquares(score);
                    }
                    ButtonUtils.updateNavBtnState();
                }
            });
            $("#next").on({
                click: () => {
                    // move the cursor to the next image and render
                    if (collectedData.next()) {
                        SyncUtils.imageDataToView();
                        EventUtils.attachGameEventsToSquares(score);
                    }

                    // update the current states of all buttons
                    ButtonUtils.updateNavBtnState();
                }
            });
            // same thing as attach events to $("#jump")
            EventUtils.attachJumpEventsToBtn();

            // same thing as attach events to $("#fast-foward")
            EventUtils.attachFastForwardEventsToBtn();

            // same thing as attach events to $("#fast-backward")
            EventUtils.attachFastBackwardEventsToBtn();

            // update properties of buttons
            ButtonUtils.updateNavBtnState();
            
            
            
        } else {
            window.location.replace("html/error.html");
        }
    }
});