// scripts.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-firestore.js";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyATM2LcTO0KVLO_rqk3XnS868KpgCgfHgs",
  authDomain: "solveproblem-e26df.firebaseapp.com",
  projectId: "solveproblem-e26df",
  storageBucket: "solveproblem-e26df.firebasestorage.app",
  messagingSenderId: "984654085411",
  appId: "1:984654085411:web:5efaacb9b20e356cafe096",
  measurementId: "G-39NNY7JNNK"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 관리자 비밀번호 (임시)
const ADMIN_PASSWORD = "1234";

// 관리자 로그인
function checkAdmin() {
  const input = document.getElementById("admin-pass").value;
  if (input === ADMIN_PASSWORD) {
    document.getElementById("admin-section").style.display = "block";
    alert("로그인 성공!");
  } else {
    alert("비밀번호가 틀렸습니다.");
  }
};

// 문제 추가
window.addProblem = async function () {
  const title = document.getElementById("title").value;
  const imageUrl = document.getElementById("image-url").value;
  const answer = document.getElementById("answer").value;

  try {
    await addDoc(collection(db, "problems"), {
      title,
      imageUrl,
      answer
    });
    alert("문제가 추가되었습니다.");
    loadProblems();
  } catch (e) {
    console.error("문제 추가 중 오류:", e);
  }
};

// 문제 목록 불러오기
async function loadProblems() {
  const problemList = document.getElementById("problems");
  problemList.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "problems"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const li = document.createElement("li");
    li.textContent = data.title;
    li.onclick = () => showProblem(data);
    problemList.appendChild(li);
  });
}

// 문제 보기
function showProblem(data) {
  document.getElementById("solve-section").style.display = "block";
  document.getElementById("solve-title").textContent = data.title;

  const img = document.getElementById("solve-image");
  if (data.imageUrl) {
    img.src = data.imageUrl;
    img.style.display = "block";
  } else {
    img.style.display = "none";
  }

  img.dataset.answer = data.answer;
}

// 정답 확인
function checkAdmin() {
  const userAnswer = document.getElementById("user-answer").value.trim();
  const correctAnswer = document.getElementById("solve-image").dataset.answer;
  const result = document.getElementById("result");

  if (userAnswer === correctAnswer) {
    result.textContent = "정답입니다!";
    result.style.color = "green";
  } else {
    result.textContent = "틀렸습니다.";
    result.style.color = "red";
  }
};

// 페이지 로드시 문제 불러오기
window.onload = loadProblems;
