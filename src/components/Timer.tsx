import { useEffect } from "react";

interface Props{

timeLeft:number;

setTimeLeft:React.Dispatch<React.SetStateAction<number>>;

onTimeOver:()=>void;

}

export default function Timer({

timeLeft,

setTimeLeft,

onTimeOver

}:Props){


useEffect(()=>{

if(timeLeft<=0){

onTimeOver();

return;

}


const timer = setInterval(()=>{

setTimeLeft((prev)=>prev-1);

},1000);


return()=>clearInterval(timer);


},[timeLeft]);


const minutes =
Math.floor(timeLeft/60);

const seconds =
timeLeft%60;


return(

<div className="timer-box">

<h3>

⏰

{String(minutes).padStart(2,"0")}:

{String(seconds).padStart(2,"0")}

</h3>

</div>

);

}