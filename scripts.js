// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyATM2LcTO0KVLO_rqk3XnS868KpgCgfHgs",
  authDomain: "solveproblem-e26df.firebaseapp.com",
  projectId: "solveproblem-e26df",
  storageBucket: "solveproblem-e26df.firebasestorage.app",
  messagingSenderId: "984654085411",
  appId: "1:984654085411:web:5efaacb9b20e356cafe096",
  measurementId: "G-39NNY7JNNK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

let problems = [];
let currentIndex = null;
let isAdmin = false;
let editIndex = -1; // 수정 중인 문제 인덱스

// 🔍 현재 HTML 파일 이름 기반으로 과목 이름 추출해서 STORAGE_KEY 지정
const pageName = window.location.pathname.split("/").pop();
const subjectKey = pageName.replace(".html", ""); // 예: 'math1'
const STORAGE_KEY = `problems_${subjectKey}`;

// 관리자 비밀번호 (보안용이 아님, 클라이언트 공개임)
const ADMIN_PASSWORD = "1234";

// 관리자 로그인 함수
function checkAdmin() {
  const input = document.getElementById("admin-pass").value;
  if (input === ADMIN_PASSWORD) {
    isAdmin = true;
    document.getElementById("admin-section").style.display = "block";
    document.getElementById("admin-login").style.display = "none";
    renderProblems(); // 관리자용 버튼도 보이게 다시 그림
  } else {
    alert("비밀번호가 틀렸습니다!");
  }
}

// 문제 저장
function saveProblems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(problems));
  renderProblems();
}

// 문제 불러오기
function loadProblems() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) problems = JSON.parse(saved);
  renderProblems();
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
    problems[editIndex] = problem;
    editIndex = -1;
    document.querySelector("#admin-section button").textContent = "추가";
  } else {
    problems.push(problem);
  }

  document.getElementById("title").value = "";
  if (document.getElementById("image-url")) document.getElementById("image-url").value = "";
  document.getElementById("answer").value = "";

  saveProblems();
}

// 문제 목록 렌더링
function renderProblems() {
  const list = document.getElementById("problems");
  list.innerHTML = "";

  problems.forEach((p, i) => {
    const li = document.createElement("li");
    li.textContent = p.title;
    li.onclick = () => showProblem(i);

    if (isAdmin) {
      // 삭제 버튼
      const delBtn = document.createElement("button");
      delBtn.textContent = "삭제";
      delBtn.style.marginLeft = "10px";
      delBtn.onclick = (e) => {
        e.stopPropagation();
        if (confirm(`'${p.title}' 문제를 삭제할까요?`)) {
          problems.splice(i, 1);
          saveProblems();
        }
      };

      // 수정 버튼
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

window.onload = loadProblems;
