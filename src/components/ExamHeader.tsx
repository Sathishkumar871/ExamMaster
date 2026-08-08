import "./ExamHeader.css";

interface Props {

timeLeft:number;

answered:number;

total:number;

warnings:number;

onExit:()=>void;

}

export default function ExamHeader({

timeLeft,

answered,

total,

warnings,

onExit

}:Props){

const minutes =
Math.floor(timeLeft/60);

const seconds =
timeLeft%60;

return(

<header className="exam-header">

<div className="exam-logo">

<h2>
ExamMaster
</h2>

<p>
AI Proctored Online Examination
</p>

</div>

<div className="exam-status">

<div className="status-box">

<h4>
Time Left
</h4>

<p>

{String(minutes).padStart(2,"0")}:

{String(seconds).padStart(2,"0")}

</p>

</div>

<div className="status-box">

<h4>
Answered
</h4>

<p>

{answered}/{total}

</p>

</div>

<div className="status-box warning">

<h4>
Warnings
</h4>

<p>

{warnings}/5

</p>

</div>

<button

className="exit-btn"

onClick={onExit}

>

Exit Exam

</button>

</div>

</header>

);

}