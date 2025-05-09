// Firebase 설정
var firebaseConfig = {
  apiKey: "AIzaSyATM2LcTO0KVLO_rqk3XnS868KpgCgfHgs",
  authDomain: "solveproblem-e26df.firebaseapp.com",
  projectId: "solveproblem-e26df",
  storageBucket: "solveproblem-e26df.firebasestorage.app",
  messagingSenderId: "984654085411",
  appId: "1:984654085411:web:5efaacb9b20e356cafe096",
  measurementId: "G-39NNY7JNNK"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

// 관리자 비밀번호 (임시)
const ADMIN_PASSWORD = "1234";
let isAdmin = false; // 관리자 상태 저장

// 관리자 로그인
function checkAdmin() {
  const input = document.getElementById("admin-pass").value;
  if (input === ADMIN_PASSWORD) {
    isAdmin = true;
    document.getElementById("admin-section").style.display = "block";
    alert("로그인 성공!");
    loadProblems(); // 관리자 로그인 후 목록 다시 불러오기 (삭제 버튼 포함)
  } else {
    alert("비밀번호가 틀렸습니다.");
  }
}

// 문제 추가
function addProblem() {
  const title = document.getElementById("title").value;
  const imageUrl = document.getElementById("image-url").value;
  const answer = document.getElementById("answer").value;

  db.collection("problems").add({
    title: title,
    imageUrl: imageUrl,
    answer: answer
  })
  .then(function() {
    alert("문제가 추가되었습니다.");
    loadProblems();
  })
  .catch(function(error) {
    console.error("문제 추가 중 오류:", error);
  });
}

// 문제 목록 불러오기
function loadProblems() {
  const problemList = document.getElementById("problems");
  problemList.innerHTML = "";

  db.collection("problems").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      const data = doc.data();
      const li = document.createElement("li");

      const titleSpan = document.createElement("span");
      titleSpan.textContent = data.title;
      titleSpan.style.cursor = "pointer";
      titleSpan.onclick = function () {
        showProblem(data);
      };
      li.appendChild(titleSpan);

      // 관리자일 경우에만 삭제 버튼 추가
      if (isAdmin) {
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "삭제";
        deleteButton.style.marginLeft = "10px";
        deleteButton.onclick = function (e) {
          e.stopPropagation(); // 문제 클릭 이벤트 막기
          deleteProblem(doc.id, data.title);
        };
        li.appendChild(deleteButton);
      }

      problemList.appendChild(li);
    });
  });
}

// 문제 삭제
function deleteProblem(id, title) {
  const confirmDelete = confirm(`'${title}' 문제를 삭제할까요?`);
  if (!confirmDelete) return;

  db.collection("problems").doc(id).delete()
    .then(function () {
      alert("문제가 삭제되었습니다.");
      loadProblems();
    })
    .catch(function (error) {
      console.error("문제 삭제 중 오류:", error);
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

// 페이지 로드시 문제 불러오기
window.onload = loadProblems;
