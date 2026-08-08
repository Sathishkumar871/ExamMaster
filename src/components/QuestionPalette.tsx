import "./QuestionPalette.css";

interface Props{

totalQuestions:number;

currentQuestion:number;

answers:Record<number,string>;

onSelectQuestion:(index:number)=>void;

}

export default function QuestionPalette({

totalQuestions,

currentQuestion,

answers,

onSelectQuestion

}:Props){

return(

<div className="palette">

<h3>

Questions

</h3>

<div className="palette-grid">

{

Array.from({

length:totalQuestions

}).map((_,index)=>(

<button

key={index}

onClick={()=>onSelectQuestion(index)}

className={

currentQuestion===index

?

"palette-btn active"

:

answers[index]

?

"palette-btn answered"

:

"palette-btn"

}

>

{index+1}

</button>

))

}

</div>

<div className="palette-info">

<p>

🟩 Answered :
{

Object.keys(answers).length

}

</p>

<p>

⬜ Remaining :

{

totalQuestions -

Object.keys(answers).length

}

</p>

</div>

</div>

);

}