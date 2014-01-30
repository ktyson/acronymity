var ba = {} || window;

ba.alphaSoup = (function(){

//private vars
var areas = {};
var currQuesId = 21; //current question's index to a member of acros
var currQuesStyle = 0; //number of current question style
var questions = []; //set of acro indexes in play based on selected areas
var keywords = []; //set of key words in dictionary form;
var questionsAnswered = []; //set of acro indexes correctly answered
var scoreTotal = 0;

//private methods

function init(targetId){

	writeFrameHtml(targetId, function(){
		//next step
		makeAreas(function(){
			
			setSelected(true,null,function(){
				setQuestions(function(){
					writeCheckboxes(function(){
						poseQuestion();
					});				
				});
			});
			
			//$.each(areas,function(areaName,area){
				//console.log (areaName, area.selected, area.count, area.acros);
			//});			
			
		
			
			$("#btnSoup").live("click",function(){
				$("#FindHeader").hide();
				$("#Find").hide();
				$("#SoupHeader").show();
				$("#Soup").show();

			});


			$("#btnFind").live("click",function(){
				$("#FindHeader").show();
				$("#Find").show();
				$("#SoupHeader").hide();
				$("#Soup").hide();

			});

			$("#btnRandom").live("click",function(){
				displayRandomAcro();

			});

			
			$("#btnSearch").live("click",function(){				
				displayData();
			});
			
			$("#searchPhrase").live("keypress", function(e){				
				var code = (e.keyCode ? e.keyCode : e.which);
				if(code == 13) {
					displayData();				 
				}
			});
			
			$("#btnNext").live("click",function(){				
				poseQuestion();	
			});
			
			$("#btnShow").live("click",function(){				
				giveAnswer("Peek! Lose 3 points!", true);
				scoreTotal -= 3;
				
			});
			
			$("#btnCheck").live("click",function(){				
				checkAnswer(this);	
			});
			
			$("#answer").live("keypress", function(e){				
				var code = (e.keyCode ? e.keyCode : e.which);
				if(code == 13) {
					checkAnswer(this);			 
				}
			});
			
			$("#btnClear").live("click",function(){				
				clearData();	
			});
			
			$("#btnCheckSwitch").live("click",function(){				
				switchCheck();	
			});
						
			$(".areaCheck").live("change",function(){				
				//change a single area checkbox
				setSelected($(this).attr("checked"), $(this).attr("id"),  function(){
					setQuestions();
				});
			});
			
			
			makeKeywords();
						
		
		});
		
		//$.each(acros,function(idx,val){
		//	$("#displayDiv").append("<div>" + val.acro + "</div>");
		//});
	});

}

function writeCheckboxes(callBack){

	var c = [];
	
	c.push("<div id='areaCheckboxes'>");
	c.push("<INPUT TYPE='button' id='btnCheckSwitch' VALUE='Uncheck All'></INPUT><br/>");
	$.each(areas,function(areaName,area){
		var showCheck = ""; 
		if(area.selected) showCheck = "checked='checked' "; 
		c.push("<input class='areaCheck' id='" + areaName + "' type='checkbox' " + showCheck + "value='" + area.label + "' />" + area.label + " (" + area.count + ")<br />");
	
		
	});
	c.push("</div>");
	
	$("#areaDiv").html(c.join(''));
		
	callBack();
	
}

function switchCheck(){
	
	if($("#btnCheckSwitch").attr('value') == "Uncheck All") {
		checkAreas(false);
		$("#btnCheckSwitch").attr('value',"Check All");
	} else {
		checkAreas(true);
		$("#btnCheckSwitch").attr('value',"Uncheck All");
	}


}

function checkAreas(checkOn){

	//all checkboxes on or off
	$.each($("#areaCheckboxes").children(),function(idx,val){

		if($(val).is('input:checkbox')){
			$(val).attr("checked", checkOn);
		}
	});
	
	setSelected(checkOn,null,function(){
		setQuestions();
	});
}

function poseQuestion(){
	
	
	//get a random question
	var idxRnd = Math.floor(Math.random() * questions.length);
	//console.log('rnd',idxRnd);
	var acroIdx = questions[idxRnd];
	currQuesId = acroIdx;
	
	if($.inArray(currQuesId, questionsAnswered)>-1){
		if(questions.length > questionsAnswered.length){
			//console.log("you have already answered this question correctly.",currQuesId);
			//console.log('questions len',questions.length);
			//console.log('questionsAnswered',questionsAnswered);
			poseQuestion();
		} else {
			alert("You have answered all selected questions.");
		}
	
	}else{
		var acroQ = acros[acroIdx];
		//console.log('acro', acroIdx, acros[acroIdx] );
		//choose a random style
		
		/*
		explanation of questions:
		0: user given *acro* and must choose *meaning*
		1: user given *meaning* and must choose *explanation*
		2: user given *acro* and must choose *explanation* 
		3: user given *acro* and must type *meaning*
		4: user given *explanation* and must type *acro*
		*/
		
		var selectedMode = $('#questionMode option:selected').val();
		if(selectedMode == 'R'){
			currQuesStyle = Math.floor(Math.random() * 5);
		}else{
			currQuesStyle = parseInt(selectedMode);
		}
		
		var c = [];
		
		switch(currQuesStyle){
		
			case 0:
				//get 4 choices, one of them correct
				var choices = [];
				var choiceCorrect = Math.floor(Math.random() * 3);
				for(var j = 0; j < 4; j++){
					
					if(j == choiceCorrect){
						choices[choiceCorrect] = acroQ.meaning;			
					}else{
						choices[j] = makeAcro(acroQ.acro);
					}
				}
				c.push("<div>");
				c.push(acroQ.acro);
				c.push(" is <br/>");
				for(var k = 0; k < choices.length; k++){
					c.push("<input type='radio' name='choice' id='answer_" + k + "' value='" + choices[k] + "'/> <span class='rad'>" + choices[k] +"</span> <br/>");
				}
				c.push( "<br/><input id='btnCheck' type='button' value='Choose'></input>");
				c.push("</div>");
			
			break;
			case 1:
		
				//get 4 choices, one of them correct
				var choices = [];
				var choiceCorrect = Math.floor(Math.random() * 3);
				for(var j = 0; j < 4; j++){
					if(j == choiceCorrect){
						choices[choiceCorrect] = acroQ.expl;			
					}else{
						var idxRndQC = Math.floor(Math.random() * questions.length);
						choices[j] = acros[idxRndQC].expl;
					}
				}
				c.push("<div>");
				c.push(acroQ.meaning);
				c.push(" is <br/>");
				for(var k = 0; k < choices.length; k++){
					c.push("<input type='radio' name='choice' id='answer_" + k + "' value='" + choices[k] + "'/> <span class='rad'>" + choices[k] +"</span> <br/>");
				}
				c.push( "<br/><input id='btnCheck' type='button' value='Choose'></input>");
				c.push("</div>");
		
		
			break;
			case 2:
			
				//get 4 choices, one of them correct
				var choices = [];
				var choiceCorrect = Math.floor(Math.random() * 3);
				for(var j = 0; j < 4; j++){
					if(j == choiceCorrect){
						choices[choiceCorrect] = acroQ.expl;			
					}else{
						var idxRndQC = Math.floor(Math.random() * questions.length);
						choices[j] = acros[idxRndQC].expl;
					}
				}
				c.push("<div>");
				c.push(acroQ.acro);
				c.push(" is <br/>");
				for(var k = 0; k < choices.length; k++){
					c.push("<input type='radio' name='choice' id='answer_" + k + "' value='" + choices[k] + "'/> <span class='rad'>" + choices[k] +"</span> <br/>");
				}
				c.push( "<br/><input id='btnCheck' type='button' value='Choose'></input>");
				c.push("</div>");
			
			
			break;	
			case 3:
				c.push("<div>");
				c.push(acroQ.acro);
				c.push(" stands for ");
				c.push("<input class='iptLong' id='answer'></input>");
				c.push( "<br/><input id='btnCheck' type='button' value='Check'></input>");
				c.push("</div>");			

			break;			
			case 4:
				c.push("<div>");
				c.push("<input class='iptShort' id='answer'></input>");
				c.push( " is ");
				c.push(acroQ.expl);
				c.push( "<br/><input id='btnCheck' type='button' value='Check'></input>");
				c.push( "</div>");

			break;			


		}
		
		
		$("#testDiv").html(c.join(''));
		
		//giveAnswer("What do you think?", false);
	}

}

function clearData(){
	$("#displayDiv").html("");
	$("#searchPhrase").val("");
}

function isPartial(acro){

	var test = acro.meaning + acro.expl + acro.area;
	var result = (test.indexOf("?") != -1);
	
	//console.log(result, test);
	
	return result;
}

function giveAnswer(prompt, give){

	var c = [];
	c.push("<div><div class='red'>" + prompt + "!&nbsp&nbsp</div><br/>");
	if(give){
		c.push("<b>" + acros[currQuesId].acro + "</b> (<b>" + acros[currQuesId].meaning + "</b>) is " + acros[currQuesId].expl + " [" + acros[currQuesId].area + "]");
	}
	c.push ("</div>");
	$("#answerDiv").html(c.join(''));

}

function checkAnswer(el){

	var typeQ = $(el).val();
	
	var ansTyped;
	var ansShouldBe;
	
	if(typeQ=="Check"){
		ansTyped = $("#answer").val().toUpperCase().trim();
	}else{
	//Choice
		ansTyped = $('#testDiv').find('input[name=choice]:checked').val().toUpperCase().trim();
	}
//console.log('typed',ansTyped, $('#testDiv').find('input[name=choice]:checked').attr("id"));
	
	switch(currQuesStyle){
		case 0:
		
			ansShouldBe = acros[currQuesId].meaning.toUpperCase().trim();
		break;
		case 1:
		
			ansShouldBe = acros[currQuesId].expl.toUpperCase().trim();
		
		break;

		case 2:
		
			ansShouldBe = acros[currQuesId].expl.toUpperCase().trim();
		break;
		
		case 3:
		
			ansShouldBe = acros[currQuesId].meaning.toUpperCase().trim();
		
		break;
		case 4:
		
			ansShouldBe = acros[currQuesId].acro.toUpperCase().trim();
		
		break;
		
	}

//console.log('shouldbe',ansShouldBe);

	if (ansTyped == ansShouldBe){ 
		giveCredit();
		poseQuestion();
	}else{
		giveAnswer("Wrong - Try again", false);
	}
	
	$("#answer").val("");
}

function giveCredit(){

	questionsAnswered.push(currQuesId);
	var numCorr = questionsAnswered.length;
	var numTotal = questions.length;
	var scoreForThis = currQuesStyle + 1;
	scoreTotal += scoreForThis;
	
	giveAnswer("Correct! You just scored " + scoreForThis + " points!", true);
	
	var c = [];
	c.push("<div class='score'>");
	c.push("<div>");
	c.push("<span style='font-weight:bold;'>Current Total: " + scoreTotal + " points</span>");
	c.push("</div>");
	c.push("<div>Progress:<br/>");
	c.push("<span class='progress'>Answered: " + numCorr + "</span><br/>");
	c.push("<span class='progress'>Unanswered: " + (numTotal - numCorr) + "</span>");
	c.push("<div>");
	c.push("</div>");
	$("#scoreDiv").html(c.join(''));

	

}

function cleanId(text){

	return text.replace(/ /g,"_");

}

function displayData(){
	var searchPhrase = $("#searchPhrase").val();
	//alert(searchPhrase);
	var c = [];
	c.push("<ol>");
	
	$.each(areas, function(areaName, area){
		if(area.selected){
			$.each(area.acros,function(idx,acroIdx){
				var thisAcro = acros[acroIdx];
				if(isMatch(searchPhrase, thisAcro)){
					c.push("<li>");
					//c.push("<INPUT TYPE='button' VALUE='...'></INPUT>");
					c.push("<b>" + thisAcro.acro + "</b> (<b>" + thisAcro.meaning + "</b>) is " + thisAcro.expl + " [" + thisAcro.area + "]");
				}
			});						
		}	
	});
	c.push("</ol>");
	
	$("#displayDiv").html(c.join(''));


	function isMatch(phrase, thisAcro){
		var result = true;
		//console.log('phrase',phrase, 'acro',thisAcro.acro);
		if(phrase.length > 0){
			var pattern = new RegExp(phrase,"gi");
			if(pattern.test(thisAcro.acro) == false){
				result = false;
			}
		}
		
		return result;
	
	}

}

function setSelected(isOn, areaNameToSet, callBack){

	$.each(areas, function(areaName, area){
		if(areaNameToSet){
			if(areaNameToSet == areaName){
				area.selected = isOn;
			}
		} else {		
			area.selected = isOn;
		}
	});		
		
	callBack();

}

function setQuestions(callBack){
	
	questions = []; //clear
	questionsAnswered = []; //clear
	$.each(areas, function(areaName,area){
		if(area.selected){
			$.each(area.acros, function(idx, val){				
				//if(isPartial(acros[val]) == false){
					questions.push(val);
					//console.log(val, acros[val]);
				//}
			});
		}
	});
	
	//console.log(questions.length);
	//console.log(questions);
	if(callBack) callBack();
	
}

function makeAreas(callBack){
	
	$.each(acros,function(idx,val){
		//console.log(val.area);
		var areaName = cleanId(val.area);
		if(areas[areaName]){
			areas[areaName].count += 1;
		}else{			
			areas[areaName] = new Object();
			areas[areaName].label = val.area;
			areas[areaName].acros = new Array();
			areas[areaName].count = 1;			
		}		
		areas[areaName].selected = true;
		areas[areaName].acros.push(idx);
	});
	
	callBack();

}


function writeFrameHtml(targetId, callBack){
	var c = [];
	
	c.push("<INPUT TYPE=button VALUE='FIND' id='btnFind'></INPUT>");
	c.push("<INPUT TYPE=button VALUE='PLAY' id='btnSoup'></INPUT>");
	c.push("<INPUT TYPE=button VALUE='RANDOM' id='btnRandom'></INPUT>");
	c.push("<INPUT TYPE=button VALUE='LIST' id='btnList'></INPUT><BR/>");
	//c.push("<div class='header' id='SoupHeader'>");
	//c.push("<h1>Alphabet Soup</h1>");
	//c.push("<h3>Quiz Game for Bombardier Acronyms and Technical Terms</h3>");
	//c.push("</div>");
	//c.push("<div class='header' id='FindHeader'>");
	//c.push("<h1>Find Acronyms and Terms</h1>");
	//c.push("<h3>Bombardier Learjet</h3>");
	//c.push("</div>");
	
	
	c.push("<div id='Soup'>");
		c.push("<div id='areaDiv'></div>");
		
		c.push("<div id='qBox'>");
			c.push("<div id='questionDiv'>");
				c.push("<select id='questionMode'>");
					c.push("<option value='R'>Random Mix</option>");
					c.push("<option value='0'>Easy (1 pt ea)</option>");
					c.push("<option value='1'>Less Easy (2 pt ea)</option>");
					c.push("<option value='2'>Medium (3 pt ea)</option>");
					c.push("<option value='3'>Harder (4 pt ea)</option>");
					c.push("<option value='4'>Pretty Hard (5 pt ea)</option>");
				c.push("</select>");
				c.push("<INPUT TYPE='button' VALUE='Next Question' id='btnNext'></INPUT>");
				c.push("<INPUT TYPE='button' VALUE='Show Answer (-3 pts)' id='btnShow'></INPUT>");
			c.push("</div>");
			c.push("<div id='testDiv'></div>");
			c.push("<div id='answerDiv'></div>");
			c.push("<div id='scoreDiv'></div>");
		c.push("</div>");
		
	c.push("</div>");
	
	c.push("<div id='Find'>");
	c.push("<div id='searchDiv'>");
	c.push("<INPUT id='searchPhrase'></INPUT>");
	c.push("<INPUT TYPE=button VALUE='Search' id='btnSearch'></INPUT>");
	c.push("<INPUT TYPE='button' VALUE='Clear' id='btnClear'></INPUT>");
	c.push("</div>");
	c.push("<div id='displayDiv'></div>");
	c.push("</div>");

	c.push("<div id='Random'>");
	c.push("</div>");

	//c.push("</td>");
	//c.push("</tr>");
	//c.push("</table>");
	
	$("#"+targetId).html(c.join(''));
	callBack();

}

function displayRandomAcro(){

	//get a random question
	var idxRnd = Math.floor(Math.random() * questions.length);
	//console.log('rnd',idxRnd);
	var acroIdx = questions[idxRnd];
	currQuesId = acroIdx;

	var c;

	$("#Random").html('');

	//step 1
	c = "<h1>" + acros[acroIdx].acro + "</h1>"
	$("#Random").append(c);

	//step 2
	window.setTimeout(function() {
 		c = "<h2>" + acros[acroIdx].meaning + "</h2>"
		$("#Random").append(c);
	}, 3000);


	//step 3
	window.setTimeout(function() {
 		c = "<h3>..." + acros[acroIdx].expl + "</h3>"
		$("#Random").append(c);
	}, 6000);



}


function makeKeywords(){
	
	$.each(acros,function(idx,acro){
		
		if(acro.meaning && acro.meaning != "???"){
			var mWords = acro.meaning.split(" ");
			$.each(mWords, function(idx,word){
				keywords.push($.trim(word));
				//console.log(acro.meaning, word);			
			});
		}
	});

}

function makeAcro(acro){
	var result = [];
	for(var c = 0; c < acro.length; c++){
		var acroLetter = acro.charAt(c);
		var randomStart = Math.floor(Math.random() * keywords.length);
		var gotIt = false;
		for(var x = randomStart; x < keywords.length; x++){
			var firstLetter = keywords[x].substring(0,1);
			if(firstLetter == acroLetter){
				result.push(keywords[x]);
				gotIt = true;
				break;
			}
		}
		if(!gotIt){
			for(var x = 0; x < randomStart; x++){
				var firstLetter = keywords[x].substring(0,1);
				if(firstLetter == acroLetter){
					result.push(keywords[x]);
					gotIt = true;
					break;
				}
			}		
		}
	}
	return result.join(" ");

}


return {

	Init: function(targetId) { return init(targetId); }

};
})();



