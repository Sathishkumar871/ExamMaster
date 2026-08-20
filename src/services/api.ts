// ============================================================
// API CONFIG
// ============================================================

const LOCAL_API_BASE_URL =
  "http://localhost:5000/api";

const RENDER_API_BASE_URL =
  "https://exammaster-backend-up1y.onrender.com/api";

// ============================================================
// AUTO API URL
// ============================================================
//
// Local development:
// http://localhost:5000/api
//
// Production / Vercel:
// https://exammaster-backend-up1y.onrender.com/api
//
// Vite lo:
// import.meta.env.DEV = true  → localhost
// import.meta.env.PROD = true → Render
// ============================================================

const API_BASE_URL =
  import.meta.env.DEV
    ? LOCAL_API_BASE_URL
    : RENDER_API_BASE_URL;


// ============================================================
// API ENDPOINTS
// ============================================================

const API_URL =
  `${API_BASE_URL}/student`;

const QUESTION_API_URL =
  `${API_BASE_URL}/questions`;


// ============================================================
// DEBUG API CONFIG
// ============================================================

console.log(
  "=========================================="
);

console.log(
  "🌐 EXAMMASTER API CONFIG"
);

console.log(
  "MODE:",
  import.meta.env.MODE
);

console.log(
  "IS DEVELOPMENT:",
  import.meta.env.DEV
);

console.log(
  "IS PRODUCTION:",
  import.meta.env.PROD
);

console.log(
  "API BASE URL:",
  API_BASE_URL
);

console.log(
  "STUDENT API:",
  API_URL
);

console.log(
  "QUESTION API:",
  QUESTION_API_URL
);

console.log(
  "=========================================="
);


// ============================================================
// STUDENT REGISTER
// ============================================================

export const registerStudent = async (
  data: any
) => {

  const response =
    await fetch(
      `${API_URL}/register`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(data),
      }
    );

  if (!response.ok) {

    const errorText =
      await response.text();

    throw new Error(
      errorText ||
      `Registration failed: ${response.status}`
    );
  }

  return response.json();
};


// ============================================================
// STUDENT LOGIN
// ============================================================

export const loginStudent = async (
  data: any
) => {

  const response =
    await fetch(
      `${API_URL}/login`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(data),
      }
    );

  if (!response.ok) {

    const errorText =
      await response.text();

    throw new Error(
      errorText ||
      `Login failed: ${response.status}`
    );
  }

  return response.json();
};


// ============================================================
// GET STUDENT QUESTIONS
// ============================================================

export const getStudentQuestions = async (
  params?: {

    subject?: string;

    chapter?: string;

    testCategory?:
      | "mock"
      | "daily"
      | "subject";

    examType?:
      | "All"
      | "NEET"
      | "JEE";

    academicYear?:
      | "All"
      | "1st PUC"
      | "2nd PUC";

    testTitle?: string;

    testId?: string;

  }
) => {

  const query =
    new URLSearchParams();


  if (
    params?.subject &&
    params.subject !== "All"
  ) {

    query.append(
      "subject",
      params.subject
    );
  }


  if (
    params?.chapter &&
    params.chapter !== "All"
  ) {

    query.append(
      "chapter",
      params.chapter
    );
  }


  if (
    params?.testCategory
  ) {

    query.append(
      "testCategory",
      params.testCategory
    );
  }


  if (
    params?.examType &&
    params.examType !== "All"
  ) {

    query.append(
      "examType",
      params.examType
    );
  }


  if (
    params?.academicYear &&
    params.academicYear !== "All"
  ) {

    query.append(
      "academicYear",
      params.academicYear
    );
  }


  if (
    params?.testTitle &&
    params.testTitle !== "All"
  ) {

    query.append(
      "testTitle",
      params.testTitle
    );
  }


  if (
    params?.testId &&
    params.testId !== "All"
  ) {

    query.append(
      "testId",
      params.testId
    );
  }


  const queryString =
    query.toString();

  const url =
    queryString
      ? `${QUESTION_API_URL}/student?${queryString}`
      : `${QUESTION_API_URL}/student`;


  console.log(
    "📚 GET STUDENT QUESTIONS:",
    url
  );


  const response =
    await fetch(url);


  if (!response.ok) {

    let message =
      `Failed to fetch questions: ${response.status}`;

    try {

      const data =
        await response.json();

      if (
        data?.message
      ) {

        message =
          data.message;
      }

    } catch {
      // Ignore
    }

    throw new Error(
      message
    );
  }


  const data =
    await response.json();


  console.log(
    "✅ QUESTIONS:",
    data
  );


  return data;
};


// ============================================================
// GET ALL STUDENT QUESTIONS
// ============================================================

export const getAllStudentQuestions =
  async () => {

    return getStudentQuestions();
  };


// ============================================================
// GET PHYSICS TESTS
// ============================================================

export const getPhysicsTests =
  async () => {

    return getStudentQuestions({

      subject:
        "Physics",

      testCategory:
        "subject",

    });
  };


// ============================================================
// GET CHEMISTRY TESTS
// ============================================================

export const getChemistryTests =
  async () => {

    return getStudentQuestions({

      subject:
        "Chemistry",

      testCategory:
        "subject",

    });
  };


// ============================================================
// GET BIOLOGY TESTS
// ============================================================

export const getBiologyTests =
  async () => {

    return getStudentQuestions({

      subject:
        "Biology",

      testCategory:
        "subject",

    });
  };


// ============================================================
// GET ZOOLOGY TESTS
// ============================================================

export const getZoologyTests =
  async () => {

    return getStudentQuestions({

      subject:
        "Zoology",

      testCategory:
        "subject",

    });
  };


// ============================================================
// GET MOCK TESTS
// ============================================================

export const getMockTests =
  async (
    examType?:
      | "NEET"
      | "JEE",

    academicYear?:
      | "1st PUC"
      | "2nd PUC"
  ) => {

    return getStudentQuestions({

      testCategory:
        "mock",

      examType,

      academicYear,

    });
  };


// ============================================================
// GET DAILY TESTS
// ============================================================

export const getDailyTests =
  async (
    examType?:
      | "NEET"
      | "JEE",

    academicYear?:
      | "1st PUC"
      | "2nd PUC"
  ) => {

    return getStudentQuestions({

      testCategory:
        "daily",

      examType,

      academicYear,

    });
  };


// ============================================================
// GET SINGLE TEST
// ============================================================

export const getSingleTest =
  async (
    testId: string
  ) => {

    if (!testId) {

      throw new Error(
        "Test ID is required"
      );
    }

    return getStudentQuestions({

      testId,

    });
  };


// ============================================================
// GET SINGLE PHYSICS TEST
// ============================================================

export const getPhysicsTest =
  async (
    testId: string
  ) => {

    if (!testId) {

      throw new Error(
        "Physics Test ID is required"
      );
    }

    return getStudentQuestions({

      subject:
        "Physics",

      testCategory:
        "subject",

      testId,

    });
  };


// ============================================================
// GET SINGLE CHEMISTRY TEST
// ============================================================

export const getChemistryTest =
  async (
    testId: string
  ) => {

    if (!testId) {

      throw new Error(
        "Chemistry Test ID is required"
      );
    }

    return getStudentQuestions({

      subject:
        "Chemistry",

      testCategory:
        "subject",

      testId,

    });
  };


// ============================================================
// GET SINGLE BIOLOGY TEST
// ============================================================

export const getBiologyTest =
  async (
    testId: string
  ) => {

    if (!testId) {

      throw new Error(
        "Biology Test ID is required"
      );
    }

    return getStudentQuestions({

      subject:
        "Biology",

      testCategory:
        "subject",

      testId,

    });
  };


// ============================================================
// GET QUESTIONS BY CHAPTER
// ============================================================

export const getQuestionsByChapter =
  async (
    subject: string,
    chapter: string
  ) => {

    return getStudentQuestions({

      subject,

      chapter,

      testCategory:
        "subject",

    });
  };


// ============================================================
// GET NEET SUBJECT TESTS
// ============================================================

export const getNEETSubjectTests =
  async (
    subject: string,

    academicYear?:
      | "1st PUC"
      | "2nd PUC"
  ) => {

    return getStudentQuestions({

      subject,

      testCategory:
        "subject",

      examType:
        "NEET",

      academicYear,

    });
  };


// ============================================================
// GET JEE SUBJECT TESTS
// ============================================================

export const getJEESubjectTests =
  async (
    subject: string,

    academicYear?:
      | "1st PUC"
      | "2nd PUC"
  ) => {

    return getStudentQuestions({

      subject,

      testCategory:
        "subject",

      examType:
        "JEE",

      academicYear,

    });
  };


// ============================================================
// GET NEET MOCK TESTS
// ============================================================

export const getNEETMockTests =
  async (
    academicYear?:
      | "1st PUC"
      | "2nd PUC"
  ) => {

    return getStudentQuestions({

      testCategory:
        "mock",

      examType:
        "NEET",

      academicYear,

    });
  };


// ============================================================
// GET JEE MOCK TESTS
// ============================================================

export const getJEEMockTests =
  async (
    academicYear?:
      | "1st PUC"
      | "2nd PUC"
  ) => {

    return getStudentQuestions({

      testCategory:
        "mock",

      examType:
        "JEE",

      academicYear,

    });
  };


// ============================================================
// GET NEET DAILY TESTS
// ============================================================

export const getNEETDailyTests =
  async (
    academicYear?:
      | "1st PUC"
      | "2nd PUC"
  ) => {

    return getStudentQuestions({

      testCategory:
        "daily",

      examType:
        "NEET",

      academicYear,

    });
  };


// ============================================================
// GET JEE DAILY TESTS
// ============================================================

export const getJEEDailyTests =
  async (
    academicYear?:
      | "1st PUC"
      | "2nd PUC"
  ) => {

    return getStudentQuestions({

      testCategory:
        "daily",

      examType:
        "JEE",

      academicYear,

    });
  };


// ============================================================
// GENERATE QUESTIONS FROM PDF
// ============================================================

export const generateQuestionsFromPDF =
  async (
    file: File
  ) => {

    if (!file) {

      throw new Error(
        "PDF file is required"
      );
    }


    if (
      file.type !==
      "application/pdf"
    ) {

      throw new Error(
        "Please select a valid PDF file."
      );
    }


    const maxSize =
      50 * 1024 * 1024;

    if (
      file.size > maxSize
    ) {

      throw new Error(
        "PDF file size must be less than 50MB."
      );
    }


    const token =
      localStorage.getItem(
        "staffToken"
      );

    if (!token) {

      throw new Error(
        "Staff login required."
      );
    }


    const formData =
      new FormData();

    formData.append(
      "pdf",
      file
    );


    const response =
      await fetch(
        `${QUESTION_API_URL}/generate-from-pdf`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          body:
            formData,
        }
      );


    if (!response.ok) {

      let message =
        `PDF upload failed: ${response.status}`;

      try {

        const data =
          await response.json();

        if (
          data?.message
        ) {

          message =
            data.message;
        }

      } catch {
        // Ignore
      }

      throw new Error(
        message
      );
    }


    return response.json();
  };


// ============================================================
// GENERATE QUESTIONS USING GROQ AI
// ============================================================

export const generateAIQuestions =
  async (
    data: {

      testCategory?:
        | "mock"
        | "daily"
        | "subject";

      examType?:
        | "NEET"
        | "JEE";

      academicYear?:
        | "1st PUC"
        | "2nd PUC";

      subject?: string;

      chapter?: string;

      testTitle?: string;

      testId?: string;

      totalQuestions?: number;

      testDate?: string;

      testTime?: string;

      targetExamLevel?: string;

    }
  ) => {

    const token =
      localStorage.getItem(
        "staffToken"
      );

    if (!token) {

      throw new Error(
        "Staff login required."
      );
    }


    const response =
      await fetch(
        `${QUESTION_API_URL}/generate-ai`,
        {
          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,

          },

          body:
            JSON.stringify(data),
        }
      );


    if (!response.ok) {

      let message =
        `AI generation failed: ${response.status}`;

      try {

        const errorData =
          await response.json();

        if (
          errorData?.message
        ) {

          message =
            errorData.message;
        }

      } catch {
        // Ignore
      }

      throw new Error(
        message
      );
    }


    return response.json();
  };


// ============================================================
// GET STAFF QUESTIONS
// ============================================================

export const getQuestions =
  async (
    params?: {

      subject?: string;

      chapter?: string;

      testCategory?:
        | "mock"
        | "daily"
        | "subject";

      examType?:
        | "All"
        | "NEET"
        | "JEE";

      academicYear?:
        | "All"
        | "1st PUC"
        | "2nd PUC";

      testTitle?: string;

      testId?: string;

      status?: string;

    }
  ) => {

    const token =
      localStorage.getItem(
        "staffToken"
      );

    if (!token) {

      throw new Error(
        "Staff login required."
      );
    }


    const query =
      new URLSearchParams();


    Object.entries(
      params || {}
    ).forEach(
      (
        [key, value]
      ) => {

        if (
          value !== undefined &&
          value !== null &&
          String(value).trim() !== "" &&
          value !== "All"
        ) {

          query.append(
            key,
            String(value)
          );
        }
      }
    );


    const queryString =
      query.toString();

    const url =
      queryString
        ? `${QUESTION_API_URL}?${queryString}`
        : QUESTION_API_URL;


    const response =
      await fetch(
        url,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


    if (!response.ok) {

      let message =
        `Failed to fetch questions: ${response.status}`;

      try {

        const data =
          await response.json();

        if (
          data?.message
        ) {

          message =
            data.message;
        }

      } catch {
        // Ignore
      }

      throw new Error(
        message
      );
    }


    return response.json();
  };


// ============================================================
// UPDATE QUESTION
// ============================================================

export const updateQuestion =
  async (
    id: string,
    data: any
  ) => {

    if (!id) {

      throw new Error(
        "Question ID is required"
      );
    }


    const token =
      localStorage.getItem(
        "staffToken"
      );

    if (!token) {

      throw new Error(
        "Staff login required."
      );
    }


    const response =
      await fetch(
        `${QUESTION_API_URL}/${id}`,
        {
          method: "PUT",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,

          },

          body:
            JSON.stringify(data),
        }
      );


    if (!response.ok) {

      let message =
        `Question update failed: ${response.status}`;

      try {

        const errorData =
          await response.json();

        if (
          errorData?.message
        ) {

          message =
            errorData.message;
        }

      } catch {
        // Ignore
      }

      throw new Error(
        message
      );
    }


    return response.json();
  };


// ============================================================
// DELETE SINGLE QUESTION
// ============================================================

export const deleteQuestion =
  async (
    id: string
  ) => {

    if (!id) {

      throw new Error(
        "Question ID is required"
      );
    }


    const token =
      localStorage.getItem(
        "staffToken"
      );

    if (!token) {

      throw new Error(
        "Staff login required."
      );
    }


    const response =
      await fetch(
        `${QUESTION_API_URL}/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


    if (!response.ok) {

      let message =
        `Question deletion failed: ${response.status}`;

      try {

        const data =
          await response.json();

        if (
          data?.message
        ) {

          message =
            data.message;
        }

      } catch {
        // Ignore
      }

      throw new Error(
        message
      );
    }


    return response.json();
  };


// ============================================================
// DELETE ALL QUESTIONS
// ============================================================

export const deleteAllQuestions =
  async () => {

    const token =
      localStorage.getItem(
        "staffToken"
      );

    if (!token) {

      throw new Error(
        "Staff login required."
      );
    }


    const response =
      await fetch(
        `${QUESTION_API_URL}/all`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


    if (!response.ok) {

      let message =
        `Delete all questions failed: ${response.status}`;

      try {

        const data =
          await response.json();

        if (
          data?.message
        ) {

          message =
            data.message;
        }

      } catch {
        // Ignore
      }

      throw new Error(
        message
      );
    }


    return response.json();
  };


// ============================================================
// VERIFY SINGLE QUESTION WITH AI
// ============================================================

export const verifyQuestionWithAI =
  async (
    id: string
  ) => {

    if (!id) {

      throw new Error(
        "Question ID is required"
      );
    }


    const token =
      localStorage.getItem(
        "staffToken"
      );

    if (!token) {

      throw new Error(
        "Staff login required."
      );
    }


    const response =
      await fetch(
        `${QUESTION_API_URL}/verify/${id}`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


    if (!response.ok) {

      let message =
        `AI verification failed: ${response.status}`;

      try {

        const data =
          await response.json();

        if (
          data?.message
        ) {

          message =
            data.message;
        }

      } catch {
        // Ignore
      }

      throw new Error(
        message
      );
    }


    return response.json();
  };


// ============================================================
// VERIFY QUESTIONS IN BULK
// ============================================================

export const verifyQuestionsBulk =
  async (
    testId: string
  ) => {

    if (!testId) {

      throw new Error(
        "Test ID is required."
      );
    }


    const token =
      localStorage.getItem(
        "staffToken"
      );

    if (!token) {

      throw new Error(
        "Staff login required."
      );
    }


    const response =
      await fetch(
        `${QUESTION_API_URL}/verify-bulk`,
        {
          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,

          },

          body:
            JSON.stringify({
              testId,
            }),
        }
      );


    if (!response.ok) {

      let message =
        `Bulk verification failed: ${response.status}`;

      try {

        const data =
          await response.json();

        if (
          data?.message
        ) {

          message =
            data.message;
        }

      } catch {
        // Ignore
      }

      throw new Error(
        message
      );
    }


    return response.json();
  };


// ============================================================
// PUBLISH QUESTION
// ============================================================

export const publishQuestion =
  async (
    id: string
  ) => {

    if (!id) {

      throw new Error(
        "Question ID is required."
      );
    }


    const token =
      localStorage.getItem(
        "staffToken"
      );

    if (!token) {

      throw new Error(
        "Staff login required."
      );
    }


    const response =
      await fetch(
        `${QUESTION_API_URL}/publish/${id}`,
        {
          method: "PUT",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


    if (!response.ok) {

      let message =
        `Publish failed: ${response.status}`;

      try {

        const data =
          await response.json();

        if (
          data?.message
        ) {

          message =
            data.message;
        }

      } catch {
        // Ignore
      }

      throw new Error(
        message
      );
    }


    return response.json();
  };


// ============================================================
// UNPUBLISH QUESTION
// ============================================================

export const unpublishQuestion =
  async (
    id: string
  ) => {

    if (!id) {

      throw new Error(
        "Question ID is required."
      );
    }


    const token =
      localStorage.getItem(
        "staffToken"
      );

    if (!token) {

      throw new Error(
        "Staff login required."
      );
    }


    const response =
      await fetch(
        `${QUESTION_API_URL}/unpublish/${id}`,
        {
          method: "PUT",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


    if (!response.ok) {

      let message =
        `Unpublish failed: ${response.status}`;

      try {

        const data =
          await response.json();

        if (
          data?.message
        ) {

          message =
            data.message;
        }

      } catch {
        // Ignore
      }

      throw new Error(
        message
      );
    }


    return response.json();
  };


// ============================================================
// CREATE MANUAL QUESTION
// ============================================================

export const createQuestion =
  async (
    data: any
  ) => {

    const token =
      localStorage.getItem(
        "staffToken"
      );

    if (!token) {

      throw new Error(
        "Staff login required."
      );
    }


    const response =
      await fetch(
        `${QUESTION_API_URL}/create`,
        {
          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,

          },

          body:
            JSON.stringify(data),
        }
      );


    if (!response.ok) {

      let message =
        `Question creation failed: ${response.status}`;

      try {

        const result =
          await response.json();

        if (
          result?.message
        ) {

          message =
            result.message;
        }

      } catch {
        // Ignore
      }

      throw new Error(
        message
      );
    }


    return response.json();
  };