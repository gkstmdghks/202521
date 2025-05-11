


// Firebase 모듈 가져오기 (v9+ 방식)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyATM2LcTO0KVLO_rqk3XnS868KpgCgfHgs",
  authDomain: "solveproblem-e26df.firebaseapp.com",
  projectId: "solveproblem-e26df",
  storageBucket: "solveproblem-e26df.appspot.com",
  messagingSenderId: "984654085411",
  appId: "1:984654085411:web:5efaacb9b20e356cafe096",
  measurementId: "G-39NNY7JNNK"
};

db.settings({
  host: "asia-northeast3-firestore.googleapis.com",
  ssl: true
});

// 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let isAdmin = false;

// 관리자 비밀번호 (예시용)
const ADMIN_PASSWORD = "1234";

// 관리자 인증
window.checkAdmin = function () {
  const input = document.getElementById("admin-pass").value;
  if (input === ADMIN_PASSWORD) {
    isAdmin = true;
    document.getElementById("admin-section").style.display = "block";
    alert("로그인 성공!");
    loadProblems();  // 로그인 후 문제 목록 갱신
  } else {
    alert("비밀번호가 틀렸습니다.");
  }
}

// 문제 추가
window.addProblem = function () {
  const title = document.getElementById("title").value;
  const imageUrl = document.getElementById("image-url").value;
  const answer = document.getElementById("answer").value;

  addDoc(collection(db, "problems"), {
    title: title,
    imageUrl: imageUrl,
    answer: answer
  }).then(() => {
    alert("문제가 추가되었습니다.");
    loadProblems();
  }).catch(error => {
    console.error("문제 추가 실패:", error);
  });
}

// 문제 불러오기
window.loadProblems = function () {
  const problemList = document.getElementById("problems");
  problemList.innerHTML = "";

  getDocs(collection(db, "problems")).then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      const li = document.createElement("li");
      li.textContent = data.title;

      if (isAdmin) {
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "삭제";
        deleteButton.style.marginLeft = "10px";
        deleteButton.onclick = () => deleteProblem(doc.id);
        li.appendChild(deleteButton);
      }

      li.onclick = () => showProblem(data);
      problemList.appendChild(li);
    });
  });
}

// 문제 삭제
window.deleteProblem = function (id) {
  const confirmed = confirm("정말 이 문제를 삭제하시겠습니까?");
  if (!confirmed) return;

  deleteDoc(doc(db, "problems", id)).then(() => {
    alert("문제가 삭제되었습니다.");
    loadProblems();
  }).catch(error => {
    console.error("문제 삭제 실패:", error);
  });
}

// 문제 보여주기
window.showProblem = function (data) {
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
window.checkAnswer = function () {
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
}

// 페이지 로드시 문제 목록 불러오기
window.onload = loadProblems;
