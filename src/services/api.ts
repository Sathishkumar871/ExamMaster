
const API_URL =
  "https://exammaster-backend-up1y.onrender.com/api/student";

const QUESTION_API_URL =
  "https://exammaster-backend-up1y.onrender.com/api/questions";


// ============================================================
// STUDENT REGISTER
// ============================================================

export const registerStudent = async (
  data: any
) => {

  const response = await fetch(
    `${API_URL}/register`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    }
  );

  return response.json();
};


// ============================================================
// STUDENT LOGIN
// ============================================================

export const loginStudent = async (
  data: any
) => {

  const response = await fetch(
    `${API_URL}/login`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    }
  );

  return response.json();
};


// ============================================================
// GET STUDENT QUESTIONS
// ============================================================

export const getStudentQuestions = async (
  params?: {
    subject?: string;
    chapter?: string;
    testType?: string;
    testTitle?: string;
  }
) => {

  const query =
    new URLSearchParams();


  // ----------------------------------------------------------
  // SUBJECT
  // ----------------------------------------------------------

  if (params?.subject) {

    query.append(
      "subject",
      params.subject
    );

  }


  // ----------------------------------------------------------
  // CHAPTER
  // ----------------------------------------------------------

  if (params?.chapter) {

    query.append(
      "chapter",
      params.chapter
    );

  }


  // ----------------------------------------------------------
  // TEST TYPE
  // ----------------------------------------------------------

  if (params?.testType) {

    query.append(
      "testType",
      params.testType
    );

  }


  // ----------------------------------------------------------
  // TEST TITLE
  // ----------------------------------------------------------

  if (params?.testTitle) {

    query.append(
      "testTitle",
      params.testTitle
    );

  }


  // ----------------------------------------------------------
  // FINAL URL
  // ----------------------------------------------------------

  const url =
    query.toString().length > 0
      ? `${QUESTION_API_URL}/student?${query.toString()}`
      : `${QUESTION_API_URL}/student`;


  console.log(
    "GET STUDENT QUESTIONS:",
    url
  );


  // ----------------------------------------------------------
  // REQUEST
  // ----------------------------------------------------------

  const response =
    await fetch(url);


  if (!response.ok) {

    throw new Error(
      `Failed to fetch questions: ${response.status}`
    );

  }


  return response.json();

};

