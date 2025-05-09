// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyATM2LcTO0KVLO_rqk3XnS868KpgCgfHgs",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id"
};

// 초기화
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 관리자 비밀번호 (예시용)
const ADMIN_PASSWORD = "1234";

// 현재 선택된 과목
let currentSubject = 'english'; // 기본값은 영어 과목

// 과목 선택 시 과목 변경
document.getElementById('subject-select').addEventListener('change', (event) => {
  currentSubject = event.target.value;
  loadProblems(); // 과목 변경 시 문제 목록 다시 불러오기
});

// 관리자 인증
function checkAdmin() {
  const input = document.getElementById("admin-pass").value;
  if (input === ADMIN_PASSWORD) {
    document.getElementById("admin-section").style.display = "block";
    alert("로그인 성공!");
  } else {
    alert("비밀번호가 틀렸습니다.");
  }
}

// 문제 추가
function addProblem() {
  const title = document.getElementById("title").value;
  const imageUrl = document.getElementById("image-url").value;
  const answer = document.getElementById("answer").value;

  // 선택된 과목에 맞는 컬렉션에 문제 추가
  db.collection(currentSubject).add({
    title: title,
    imageUrl: imageUrl,
    answer: answer
  }).then(() => {
    alert("문제가 추가되었습니다.");
    loadProblems(); // 문제 추가 후 목록 다시 불러오기
  }).catch(error => {
    console.error("문제 추가 실패:", error);
  });
}

// 문제 불러오기
function loadProblems() {
  const problemList = document.getElementById("problems");
  problemList.innerHTML = "";

  // 선택된 과목에 맞는 컬렉션에서 문제 불러오기
  db.collection(currentSubject).get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      const li = document.createElement("li");
      li.textContent = data.title;
      li.onclick = () => showProblem(data);
      problemList.appendChild(li);
    });
  });
}

// 문제 보여주기
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
function checkAnswer() {
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
