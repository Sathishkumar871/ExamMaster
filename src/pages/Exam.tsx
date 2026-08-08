import { 
  useEffect, 
  useState 
} from "react";

import { 
  useParams 
} from "react-router-dom";

import "./Exam.css";





interface Question {

  questionId:string;

  question:string;

  options:string[];

  correctAnswer:string;

  explanation?:string;

}





interface TestData {

  title:string;

  subject:string;

  chapter:string;

  duration:number;

  totalQuestions:number;

  questions:Question[];

}







export default function Exam(){



const { id } = useParams();





const student =

JSON.parse(

localStorage.getItem("student") || "{}"

);






const [test,setTest] =

useState<TestData | null>(null);





const [current,setCurrent] =

useState(0);





const [selected,setSelected] =

useState("");





const [answers,setAnswers] =

useState<any>({});





const [time,setTime] =

useState(0);





const [loading,setLoading] =

useState(true);









// =============================
// FETCH TEST
// =============================

useEffect(()=>{


fetchTest();


},[]);








const fetchTest = async()=>{


try{


const response = await fetch(

`http://localhost:5000/api/daily-tests/test/${id}`

);




const data = await response.json();





if(data.success){


setTest(data.test);



setTime(

data.test.duration * 60

);



}



}

catch(error){


console.log(error);


}

finally{


setLoading(false);


}



};











// =============================
// TIMER
// =============================

useEffect(()=>{


if(time<=0)

return;





const timer =

setInterval(()=>{


setTime(prev=>prev-1);



},1000);





return()=>clearInterval(timer);




},[time]);











// =============================
// FORMAT TIME
// =============================

const formatTime = ()=>{


const minutes =

Math.floor(time / 60);




const seconds =

time % 60;





return (

`${minutes}:${
seconds < 10 
? "0"
: ""
}${seconds}`

);


};












// =============================
// SELECT ANSWER
// =============================

const selectAnswer =

(option:string)=>{



setSelected(option);



setAnswers({

...answers,

[current]:option

});



};












// =============================
// NEXT QUESTION
// =============================

const nextQuestion = ()=>{


if(!test)

return;




if(current < test.questions.length - 1){



setCurrent(current + 1);



setSelected(

answers[current + 1] || ""

);



}



};











// =============================
// PREVIOUS QUESTION
// =============================


const previousQuestion = ()=>{


if(current > 0){



setCurrent(current - 1);



setSelected(

answers[current - 1] || ""

);



}



};












// =============================
// SUBMIT EXAM
// =============================

const submitExam = async()=>{


try{


const response = await fetch(

"http://localhost:5000/api/result/submit",

{


method:"POST",


headers:{


"Content-Type":"application/json"


},



body:JSON.stringify({


studentId:
student.studentId,


studentName:
student.name,


examId:id,


answers,


timeTaken:

(test!.duration * 60) - time,


warnings:0



})


}



);






const data = await response.json();






if(data.success){



alert(

"Exam Submitted Successfully"

);





window.location.href =

`/result/${data.result._id}`;



}

else{


alert(data.message);


}



}

catch(error){


console.log(error);



alert(

"Submit Failed"

);


}



};













if(loading){


return (

<h2>

Loading Exam...

</h2>

);


}







if(!test){


return (

<h2>

Test Not Found

</h2>

);


}








const question =

test.questions[current];









return(


<div className="exam-page">





<header className="exam-header">



<div>


<h2>

{test.title}

</h2>



<p>

{test.subject}

-

{test.chapter}

</p>



<p>

Question {current+1}

of

{test.questions.length}

</p>



</div>







<div className="timer">


⏱ {formatTime()}


</div>





</header>









<div className="progress">


<div


className="progress-fill"


style={{

width:

`${

((current+1)

/test.questions.length)

*100

}%`

}}



/>


</div>









<div className="question-card">





<h3>

{question.question}

</h3>








<div className="options">



{

question.options.map((option)=>(



<label


key={option}



className={

selected === option

?

"option active"

:

"option"

}



>



<input


type="radio"


checked={

selected === option

}



onChange={()=>


selectAnswer(option)

}



/>



<span>

{option}

</span>



</label>



))


}



</div>





</div>









<div className="bottom-buttons">





<button


className="previous-btn"


onClick={previousQuestion}


>

Previous

</button>







<button


className="next-btn"


onClick={nextQuestion}


>

Next

</button>







<button


className="submit-btn"


onClick={submitExam}


>

Submit Exam

</button>





</div>







</div>



);


}