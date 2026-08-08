import "./QuestionCard.css";
interface Props{
question:any;
questionNumber:number;

totalQuestions:number;

selectedAnswer:string;

onSelectAnswer:(answer:string)=>void;

onPrevious:()=>void;
onNext:()=>void;

isFirst:boolean;

isLast:boolean;

}

export default function QuestionCard({

question,

questionNumber,

totalQuestions,

selectedAnswer,

onSelectAnswer,

onPrevious,

onNext,

isFirst,

isLast

}:Props){

return(

<div className="question-card">

<div className="question-top">

<h2>

Question {questionNumber} / {totalQuestions}

</h2>

</div>

<div className="question-body">

<h3>

{question.question}

</h3>

<div className="options">

{

question.options.map((option:string,index:number)=>(

<label

key={index}

className={
selectedAnswer===option
?
"option selected"
:
"option"
}

>

<input

type="radio"

checked={selectedAnswer===option}

onChange={()=>onSelectAnswer(option)}

/>

<span>

{option}

</span>

</label>

))

}

</div>

</div>

<div className="question-footer">

<button

className="prev-btn"

disabled={isFirst}

onClick={onPrevious}

>

← Previous

</button>

<button

className="next-btn"

onClick={onNext}

>

{

isLast

?

"Finish"

:

"Next →"

}

</button>

</div>

</div>

);

}