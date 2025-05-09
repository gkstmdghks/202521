// Firebase 초기화
const firebaseConfig = {
  apiKey: "AIzaSyATM2LcTO0KVLO_rqk3XnS868KpgCgfHgs",
  authDomain: "solveproblem-e26df.firebaseapp.com",
  projectId: "solveproblem-e26df",
  storageBucket: "solveproblem-e26df.appspot.com",
  messagingSenderId: "984654085411",
  appId: "1:984654085411:web:5efaacb9b20e356cafe096",
  measurementId: "G-39NNY7JNNK"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let problems = [];
let currentIndex = null;
let isAdmin = false;
let editIndex = -1;

// 관리자 비밀번호
const ADMIN_PASSWORD = "1216";

// 페이지 기반으로 과목 이름 정하고 그에 맞는 콜렉션 지정
const pageName = window.location.pathname.split("/").pop();
const subjectKey = pageName.replace(".html", "");
const problemsRef = db.collection(`problems_${subjectKey}`);

// 관리자 로그인
function checkAdmin() {
  const input = document.getElementById("admin-pass").value;
  if (input === ADMIN_PASSWORD) {
    isAdmin = true;
    document.getElementById("admin-section").style.display = "block";
    document.getElementById("admin-login").style.display = "none";
    renderProblems();
  } else {
    alert("비밀번호가 틀렸습니다!");
  }
}

// 문제 저장 (Firestore)
function saveProblemToFirestore(problem) {
  problemsRef.add(problem)
    .then(() => {
      console.log("문제가 Firebase에 저장됨!");
      loadProblemsFromFirestore();
    })
    .catch((error) => {
      console.error("Firebase 저장 실패:", error);
    });
}

// 문제 불러오기 (Firestore)
function loadProblemsFromFirestore() {
  problemsRef.get()
    .then((querySnapshot) => {
      problems = [];
      querySnapshot.forEach((doc) => {
        problems.push({ id: doc.id, ...doc.data() });
      });
      renderProblems();
    })
    .catch((error) => {
      console.error("문제 불러오기 실패:", error);
    });
}

// 문제 추가 또는 수정
function addProblem() {
  if (!isAdmin) return alert("관리자만 문제를 추가할 수 있습니다!");

  const title = document.getElementById("title").value.trim();
  const imageUrl = document.getElementById("image-url")?.value.trim() || "";
  const answer = document.getElementById("answer").value.trim();

  if (!title || !answer) {
    alert("제목과 정답은 반드시 입력해야 합니다!");
    return;
  }

  const problem = { title, imageUrl, answer };

  if (editIndex !== -1) {
    const problemId = problems[editIndex].id;
    problemsRef.doc(problemId).set(problem)
      .then(() => {
        console.log("문제가 수정되었습니다.");
        editIndex = -1;
        document.querySelector("#admin-section button").textContent = "문제 추가";
        loadProblemsFromFirestore();
      })
      .catch((error) => {
        console.error("문제 수정 실패:", error);
      });
  } else {
    saveProblemToFirestore(problem);
  }

  // 입력창 비우기
  document.getElementById("title").value = "";
  if (document.getElementById("image-url")) document.getElementById("image-url").value = "";
  document.getElementById("answer").value = "";
}

// 문제 렌더링
function renderProblems() {
  const list = document.getElementById("problems");
  list.innerHTML = "";

  problems.forEach((p, i) => {
    const li = document.createElement("li");
    li.textContent = p.title;
    li.onclick = () => showProblem(i);

    if (isAdmin) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "삭제";
      delBtn.style.marginLeft = "10px";
      delBtn.onclick = (e) => {
        e.stopPropagation();
        if (confirm(`'${p.title}' 문제를 삭제할까요?`)) {
          problemsRef.doc(p.id).delete()
            .then(() => {
              console.log("문제가 삭제되었습니다.");
              loadProblemsFromFirestore();
            })
            .catch((error) => {
              console.error("문제 삭제 실패:", error);
            });
        }
      };

      const editBtn = document.createElement("button");
      editBtn.textContent = "수정";
      editBtn.style.marginLeft = "5px";
      editBtn.onclick = (e) => {
        e.stopPropagation();
        document.getElementById("title").value = p.title;
        if (document.getElementById("image-url")) document.getElementById("image-url").value = p.imageUrl;
        document.getElementById("answer").value = p.answer;
        editIndex = i;
        document.querySelector("#admin-section button").textContent = "수정 완료";
      };

      li.appendChild(delBtn);
      li.appendChild(editBtn);
    }

    list.appendChild(li);
  });
}

// 문제 보여주기
function showProblem(index) {
  currentIndex = index;
  const p = problems[index];
  document.getElementById("solve-title").textContent = p.title;
  const img = document.getElementById("solve-image");

  if (p.imageUrl) {
    img.src = p.imageUrl;
    img.style.display = "block";
  } else {
    img.style.display = "none";
  }

  document.getElementById("solve-section").style.display = "block";
  document.getElementById("user-answer").value = "";
  document.getElementById("result").textContent = "";
}

// 정답 확인
function checkAnswer() {
  const userInput = document.getElementById("user-answer").value.trim().toLowerCase();
  const correct = problems[currentIndex].answer.trim().toLowerCase();
  const result = document.getElementById("result");

  if (userInput === correct) {
    result.textContent = "✅ 정답입니다!";
    result.style.color = "green";
  } else {
    result.textContent = "❌ 오답입니다!";
    result.style.color = "red";
  }
}

window.onload = loadProblemsFromFirestore;
