const API_URL = "http://localhost:5000/api/student";


export const registerStudent = async(data:any)=>{

    const response = await fetch(
        `${API_URL}/register`,
        {
            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(data)
        }
    );


    return response.json();

};



export const loginStudent = async(data:any)=>{

    const response = await fetch(
        `${API_URL}/login`,
        {
            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(data)
        }
    );


    return response.json();

};